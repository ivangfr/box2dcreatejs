this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.BuoyancyHandler = BuoyancyHandler

	const _DEGTORAD = 0.0174532925199432957
	const _NUM_VERTICES_INSIDE_CIRCLE = 8

	function BuoyancyHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validBuoyancyDef = ['complexDragFunction']

	let _complexDragFunction
	let _worldManager
	let _fluidFloatingObjectContacts

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		_fluidFloatingObjectContacts = []
		_complexDragFunction = (details && details.complexDragFunction !== undefined) ?
			details.complexDragFunction : true
	}

	BuoyancyHandler.prototype.IsBuoyancyContactType = function (contact) {
		const fixA = contact.GetFixtureA()
		const fixB = contact.GetFixtureB()
		return (fixA.GetUserData().isFluid && fixB.GetBody().GetType() === box2d.b2Body.b2_dynamicBody)
			|| (fixB.GetUserData().isFluid && fixA.GetBody().GetType() === box2d.b2Body.b2_dynamicBody)
	}

	BuoyancyHandler.prototype.beginContactBuoyancy = function (contact) {
		const objects = getFloatingFluidFromContact(contact)
		const floatingObject = objects.floatingObject
		const fluid = objects.fluid
		addfluidFloatingObjectContact(fluid, floatingObject)
	}

	BuoyancyHandler.prototype.endContactBuoyancy = function (contact) {
		const objects = getFloatingFluidFromContact(contact)
		const floatingObject = objects.floatingObject
		const fluid = objects.fluid
		deletefluidFloatingObjectContact(fluid, floatingObject)
	}

	function getFloatingFluidFromContact(contact) {
		const fixA = contact.GetFixtureA()
		const fixB = contact.GetFixtureB()

		let fluid, floatingObject
		if (fixA.GetUserData().isFluid) {
			fluid = fixA
			floatingObject = fixB
		}
		else {
			fluid = fixB
			floatingObject = fixA
		}
		return { floatingObject, fluid }
	}

	function addfluidFloatingObjectContact(fluid, floatingObject) {
		_fluidFloatingObjectContacts.push({ fluid, floatingObject })
	}

	function deletefluidFloatingObjectContact(fluid, floatingObject) {
		let idx = -1
		for (let i = 0; i < _fluidFloatingObjectContacts.length; i++) {
			const contactPair = _fluidFloatingObjectContacts[i]
			if (contactPair.fluid === fluid && contactPair.floatingObject === floatingObject) {
				idx = i
				break
			}
		}

		if (idx >= 0) {
			_fluidFloatingObjectContacts.remove(idx)
		}
	}

	BuoyancyHandler.prototype.update = function () {
		for (let i = 0; i < _fluidFloatingObjectContacts.length; i++) {
			const contactPair = _fluidFloatingObjectContacts[i]
			const fluid = contactPair.fluid
			const floatingObject = contactPair.floatingObject

			const density = fluid.GetDensity()

			const intersectionPoints = findIntersectionOfFixtures(fluid, floatingObject)
			if (intersectionPoints.length > 0) {
				const centroid = findCentroid(intersectionPoints)
				const center = centroid.center
				const area = centroid.area

				//apply buoyancy force
				const displacedMass = fluid.GetDensity() * area
				const gravity = _worldManager.getWorld().GetGravity()

				const buoyancyForce = new box2d.b2Vec2(0, 0)
				buoyancyForce.x = displacedMass * -gravity.x
				buoyancyForce.y = displacedMass * -gravity.y
				floatingObject.GetBody().ApplyForce(buoyancyForce, center)

				if (!_complexDragFunction) {
					//-- simple drag --------------------------------------------------------------
					//find relative velocity between object and fluid
					const velDir = box2d.b2Math.SubtractVV(
						floatingObject.GetBody().GetLinearVelocityFromWorldPoint(center),
						fluid.GetBody().GetLinearVelocityFromWorldPoint(center)
					)
					const vel = velDir.Normalize()

					const dragMod = fluid.GetUserData().dragConstant
					const dragMag = fluid.GetDensity() * vel * vel

					const dragForce = new box2d.b2Vec2(0, 0)
					dragForce.x = dragMod * dragMag * -velDir.x
					dragForce.y = dragMod * dragMag * -velDir.y

					floatingObject.GetBody().ApplyForce(dragForce, center)
					const angularDrag = area * -floatingObject.GetBody().GetAngularVelocity()
					floatingObject.GetBody().ApplyTorque(angularDrag)
					//-----------------------------------------------------------------------------
				}
				else {
					//-- apply complex drag -------------------------------------------------------
					const dragMod = fluid.GetUserData().dragConstant
					const liftMod = fluid.GetUserData().liftConstant
					const maxDrag = 3000//adjust as desired
					const maxLift = 1000//adjust as desired
					for (let j = 0; j < intersectionPoints.length; j++) {
						const v0 = intersectionPoints[j]
						const v1 = intersectionPoints[(j + 1) % intersectionPoints.length]

						const vS = box2d.b2Math.AddVV(v0, v1)
						const midPoint = new box2d.b2Vec2(0, 0)
						midPoint.x = 0.5 * vS.x
						midPoint.y = 0.5 * vS.y

						//find relative velocity between object and fluid at edge midpoint
						const velDir = box2d.b2Math.SubtractVV(
							floatingObject.GetBody().GetLinearVelocityFromWorldPoint(midPoint),
							fluid.GetBody().GetLinearVelocityFromWorldPoint(midPoint)
						)
						const vel = velDir.Normalize()

						const edge = box2d.b2Math.SubtractVV(v1, v0)
						const edgeLength = edge.Normalize()

						const normal = box2d.b2Math.CrossFV(-1, edge)
						const dragDot = box2d.b2Math.Dot(normal, velDir)
						if (dragDot < 0) {
							continue
						}

						let dragMag = dragDot * dragMod * edgeLength * density * vel * vel
						dragMag = box2d.b2Math.Min(dragMag, maxDrag)

						const dragForce = new box2d.b2Vec2(0, 0)
						dragForce.x = dragMag * -velDir.x
						dragForce.y = dragMag * -velDir.y

						floatingObject.GetBody().ApplyForce(dragForce, midPoint)

						const liftDot = box2d.b2Math.Dot(edge, velDir)
						let liftMag = dragDot * liftDot * liftMod * edgeLength * density * vel * vel
						liftMag = box2d.b2Math.Min(liftMag, maxLift)
						const liftDir = box2d.b2Math.CrossFV(1, velDir)

						const liftForce = new box2d.b2Vec2(0, 0)
						liftForce.x = liftMag * -liftDir.x
						liftForce.y = liftMag * -liftDir.y

						floatingObject.GetBody().ApplyForce(liftForce, midPoint)
					}
					//-----------------------------------------------------------------------------
				}
			}
		}
	}

	function findIntersectionOfFixtures(fluid, floatingObject) {
		const fluidShape = fluid.GetShape()
		if (fluidShape.GetType() !== Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			return false
		}

		const floatingObjectShape = floatingObject.GetShape()
		if (floatingObjectShape.GetType() === Box2D.Collision.Shapes.b2Shape.e_circleShape) {
			handleCircleFloatingObject(floatingObjectShape)
		}

		let outputVertices = []
		for (let i = 0; i < fluidShape.GetVertexCount(); i++) {
			outputVertices.push(fluid.GetBody().GetWorldPoint(fluidShape.GetVertices()[i]))
		}

		const clipPolygon = []
		if (floatingObjectShape.GetType() === Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			for (let i = 0; i < floatingObjectShape.GetVertexCount(); i++) {
				clipPolygon.push(floatingObject.GetBody().GetWorldPoint(floatingObjectShape.GetVertices()[i]))
			}
		}
		else {
			for (let i = 0; i < floatingObjectShape.numVertices; i++) {
				clipPolygon.push(floatingObject.GetBody().GetWorldPoint(floatingObjectShape.vertices[i]))
			}
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

	function handleCircleFloatingObject(floatingObjectShape) {
		const radius = floatingObjectShape.GetRadius()
		const vertices = []
		for (let i = _NUM_VERTICES_INSIDE_CIRCLE; i > 0; i--) {
			const angle = (i / _NUM_VERTICES_INSIDE_CIRCLE) * 360 * _DEGTORAD
			vertices.push(new box2d.b2Vec2(Math.sin(angle) * radius, Math.cos(angle) * radius))
		}

		floatingObjectShape.numVertices = _NUM_VERTICES_INSIDE_CIRCLE
		floatingObjectShape.vertices = vertices

		if (_worldManager.getEnableDebug()) {
			drawPolygonInsideCircle(floatingObject)
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