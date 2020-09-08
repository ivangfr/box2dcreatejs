this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.BuoyancyHandler = BuoyancyHandler

	const _DEGTORAD = 0.0174532925199432957
	const _NUM_VERTICES_INSIDE_CIRCLE = 8

	function BuoyancyHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validBuoyancyDef = ['complexDragFunction']

	let _worldManager
	let _complexDragFunction
	let _floatingFluidFixturePairs

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		_floatingFluidFixturePairs = []
		_complexDragFunction = (details && details.complexDragFunction !== undefined) ? details.complexDragFunction : true
	}

	BuoyancyHandler.prototype.IsBuoyancyContactType = function (contact) {
		const fixA = contact.GetFixtureA()
		const fixB = contact.GetFixtureB()
		return (fixA.GetUserData().isFluid && fixB.GetBody().GetType() === box2d.b2Body.b2_dynamicBody)
			|| (fixB.GetUserData().isFluid && fixA.GetBody().GetType() === box2d.b2Body.b2_dynamicBody)
	}

	BuoyancyHandler.prototype.beginContactBuoyancy = function (contact) {
		addFloatingFluidFixturePair(getFloatingFluidFixturePair(contact))
	}

	BuoyancyHandler.prototype.endContactBuoyancy = function (contact) {
		deleteFloatingFluidFixturePair(getFloatingFluidFixturePair(contact))
	}

	BuoyancyHandler.prototype.update = function () {
		for (let i = 0; i < _floatingFluidFixturePairs.length; i++) {
			const { floatingFixture, fluidFixture } = _floatingFluidFixturePairs[i]

			const intersectionPoints = findIntersectionOfFixtures(floatingFixture, fluidFixture)
			if (intersectionPoints.length > 0) {
				const { center, area } = findCentroid(intersectionPoints)

				applyBuoyancy(floatingFixture, fluidFixture, center, area)

				_complexDragFunction ?
					applyComplexDrag(floatingFixture, fluidFixture, intersectionPoints, area) :
					applySimpleDrag(floatingFixture, fluidFixture, center, area)
			}
		}
	}

	function getFloatingFluidFixturePair(contact) {
		const fixA = contact.GetFixtureA()
		const fixB = contact.GetFixtureB()

		let floatingFixture, fluidFixture
		if (fixA.GetUserData().isFluid) {
			fluidFixture = fixA
			floatingFixture = fixB
		}
		else {
			fluidFixture = fixB
			floatingFixture = fixA
		}
		return { floatingFixture, fluidFixture }
	}

	function addFloatingFluidFixturePair(floatingFluidFixturePair) {
		_floatingFluidFixturePairs.push(floatingFluidFixturePair)
	}

	function deleteFloatingFluidFixturePair(floatingFluidFixturePair) {
		let idx = -1
		for (let i = 0; i < _floatingFluidFixturePairs.length; i++) {
			const pair = _floatingFluidFixturePairs[i]
			if (pair.fluidFixture === floatingFluidFixturePair.fluidFixture &&
				pair.floatingFixture === floatingFluidFixturePair.floatingFixture) {
				idx = i
				break
			}
		}
		if (idx >= 0) {
			_floatingFluidFixturePairs.remove(idx)
		}
	}

	function applyBuoyancy(floatingFixture, fluidFixture, center, area) {
		const displacedMass = fluidFixture.GetDensity() * area
		const gravity = _worldManager.getWorld().GetGravity()

		const buoyancyForce = new box2d.b2Vec2(0, 0)
		buoyancyForce.x = displacedMass * -gravity.x
		buoyancyForce.y = displacedMass * -gravity.y

		floatingFixture.GetBody().ApplyForce(buoyancyForce, center)
	}

	function applySimpleDrag(floatingFixture, fluidFixture, center, area) {
		// Find relative velocity between floatingFixture and fluidFixture
		const velDir = box2d.b2Math.SubtractVV(
			floatingFixture.GetBody().GetLinearVelocityFromWorldPoint(center),
			fluidFixture.GetBody().GetLinearVelocityFromWorldPoint(center)
		)
		const vel = velDir.Normalize()

		const dragMod = fluidFixture.GetUserData().dragConstant
		const dragMag = fluidFixture.GetDensity() * vel * vel

		const dragForce = new box2d.b2Vec2(0, 0)
		dragForce.x = dragMod * dragMag * -velDir.x
		dragForce.y = dragMod * dragMag * -velDir.y

		floatingFixture.GetBody().ApplyForce(dragForce, center)

		// Prevent the floating bodies from rotating forever
		const angularDrag = area * -floatingFixture.GetBody().GetAngularVelocity()
		floatingFixture.GetBody().ApplyTorque(angularDrag)
	}

	function applyComplexDrag(floatingFixture, fluidFixture, intersectionPoints, area) {
		const fluidDensity = fluidFixture.GetDensity()
		const dragMod = fluidFixture.GetUserData().dragConstant
		const liftMod = fluidFixture.GetUserData().liftConstant
		const maxDrag = 3000
		const maxLift = 1000

		for (let j = 0; j < intersectionPoints.length; j++) {
			const v0 = intersectionPoints[j]
			const v1 = intersectionPoints[(j + 1) % intersectionPoints.length]

			const vS = box2d.b2Math.AddVV(v0, v1)
			const midPoint = new box2d.b2Vec2(0, 0)
			midPoint.x = 0.5 * vS.x
			midPoint.y = 0.5 * vS.y

			// Find relative velocity between floatingFixture and fluidFixture
			const velDir = box2d.b2Math.SubtractVV(
				floatingFixture.GetBody().GetLinearVelocityFromWorldPoint(midPoint),
				fluidFixture.GetBody().GetLinearVelocityFromWorldPoint(midPoint)
			)
			const vel = velDir.Normalize()

			const edge = box2d.b2Math.SubtractVV(v1, v0)
			const edgeLength = edge.Normalize()

			const normal = box2d.b2Math.CrossFV(-1, edge)
			const dragDot = box2d.b2Math.Dot(normal, velDir)
			if (dragDot < 0) {
				continue
			}

			let dragMag = dragDot * dragMod * edgeLength * fluidDensity * vel * vel
			dragMag = box2d.b2Math.Min(dragMag, maxDrag)

			const dragForce = new box2d.b2Vec2(0, 0)
			dragForce.x = dragMag * -velDir.x
			dragForce.y = dragMag * -velDir.y

			// Prevent the floating bodies from rotating forever
			const angularDrag = area * -floatingFixture.GetBody().GetAngularVelocity()
			floatingFixture.GetBody().ApplyTorque(angularDrag)

			// Applying drag force
			floatingFixture.GetBody().ApplyForce(dragForce, midPoint)

			const liftDot = box2d.b2Math.Dot(edge, velDir)
			let liftMag = dragDot * liftDot * liftMod * edgeLength * fluidDensity * vel * vel
			liftMag = box2d.b2Math.Min(liftMag, maxLift)
			const liftDir = box2d.b2Math.CrossFV(1, velDir)

			const liftForce = new box2d.b2Vec2(0, 0)
			liftForce.x = liftMag * -liftDir.x
			liftForce.y = liftMag * -liftDir.y

			// Applying lift force
			floatingFixture.GetBody().ApplyForce(liftForce, midPoint)
		}
	}

	function findIntersectionOfFixtures(floatingFixture, fluidFixture) {
		const fluidShape = fluidFixture.GetShape()
		if (fluidShape.GetType() !== Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			return false
		}

		const floatingShape = floatingFixture.GetShape()
		if (floatingShape.GetType() === Box2D.Collision.Shapes.b2Shape.e_circleShape) {
			handleFloatingCircle(floatingFixture)
		}

		let outputVertices = []
		for (let i = 0; i < fluidShape.GetVertexCount(); i++) {
			outputVertices.push(fluidFixture.GetBody().GetWorldPoint(fluidShape.GetVertices()[i]))
		}

		const clipPolygon = []
		if (floatingShape.GetType() === Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			floatingShape.GetVertices().forEach(v => clipPolygon.push(floatingFixture.GetBody().GetWorldPoint(v)))
		}
		else {
			floatingShape.vertices.forEach(v => clipPolygon.push(floatingFixture.GetBody().GetWorldPoint(v)))
		}

		// TODO - understand what is going on here
		let cp1 = clipPolygon[clipPolygon.length - 1]
		for (let j = 0; j < clipPolygon.length; j++) {
			let cp2 = clipPolygon[j]
			if (outputVertices.length <= 0) {
				return false
			}
			const inputList = outputVertices
			outputVertices = []
			let s = inputList[inputList.length - 1]
			for (let i = 0; i < inputList.length; i++) {
				const e = inputList[i]
				if (inside(cp1, cp2, e)) {
					if (!inside(cp1, cp2, s)) {
						outputVertices.push(intersection(cp1, cp2, s, e))
					}
					outputVertices.push(e)
				}
				else if (inside(cp1, cp2, s)) {
					outputVertices.push(intersection(cp1, cp2, s, e))
				}
				s = e
			}
			cp1 = cp2
		}

		return outputVertices
	}

	function handleFloatingCircle(floatingFixture) {
		const floatingShape = floatingFixture.GetShape()
		const radius = floatingShape.GetRadius()
		const vertices = []
		for (let i = _NUM_VERTICES_INSIDE_CIRCLE; i > 0; i--) {
			const angle = (i / _NUM_VERTICES_INSIDE_CIRCLE) * 360 * _DEGTORAD
			vertices.push(new box2d.b2Vec2(Math.sin(angle) * radius, Math.cos(angle) * radius))
		}

		floatingShape.numVertices = _NUM_VERTICES_INSIDE_CIRCLE
		floatingShape.vertices = vertices

		if (_worldManager.getEnableDebug()) {
			drawPolygonInsideCircle(floatingFixture)
		}
	}

	function inside(cp1, cp2, p) {
		return (cp2.x - cp1.x) * (p.y - cp1.y) > (cp2.y - cp1.y) * (p.x - cp1.x)
	}

	function intersection(cp1, cp2, s, e) {
		const dc = new box2d.b2Vec2(cp1.x - cp2.x, cp1.y - cp2.y)
		const dp = new box2d.b2Vec2(s.x - e.x, s.y - e.y)
		const n1 = cp1.x * cp2.y - cp1.y * cp2.x
		const n2 = s.x * e.y - s.y * e.x
		const n3 = 1.0 / (dc.x * dp.y - dc.y * dp.x)
		return new box2d.b2Vec2((n1 * dp.x - n2 * dc.x) * n3, (n1 * dp.y - n2 * dc.y) * n3)
	}

	function drawPolygonInsideCircle(fixture) {
		const v = fixture.GetShape().vertices
		const center = fixture.GetBody().GetWorldCenter()

		const c = _worldManager.getBox2dCanvasCtx()
		c.beginPath()
		c.lineWidth = "1"
		c.strokeStyle = "#bbb"
		for (let i = 0; i < v.length - 1; i++) {
			c.moveTo((center.x + v[i].x) * _worldManager.getScale(), (center.y + v[i].y) * _worldManager.getScale())
			c.lineTo((center.x + v[i + 1].x) * _worldManager.getScale(), (center.y + v[i + 1].y) * _worldManager.getScale())
			c.stroke()
		}
		c.moveTo((center.x + v[v.length - 1].x) * _worldManager.getScale(), (center.y + v[v.length - 1].y) * _worldManager.getScale())
		c.lineTo((center.x + v[0].x) * _worldManager.getScale(), (center.y + v[0].y) * _worldManager.getScale())
		c.stroke()
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The BuoyancyHandler details must be an object!")
			}
			for (let def in details) {
				if (_validBuoyancyDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for BuoyancytHandler is not supported! Valid definitions: " + _validBuoyancyDef)
				}
			}
			if (details.complexDragFunction !== undefined && typeof details.complexDragFunction !== 'boolean') {
				throw new Error(arguments.callee.name + " : complexDragFunction must be true/false!")
			}
		}
	}

})()