this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.BreakHandler = BreakHandler

	function BreakHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validBreakHandlerDef = ['numCuts', 'explosion', 'explosionRadius']
	const _MIN_PIECE_AREA = 0.1

	let _worldManager
	let _breakCenterX, _breakCenterY
	let _entryPoint, _breakBodies, _affectedByLaser
	let _range, _numPieces

	function initialize(breakHandler, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		let numCuts = (details && details.numCuts !== undefined) ? details.numCuts : 5
		breakHandler.getNumCuts = function () { return numCuts }
		breakHandler.setNumCuts = function (value) { numCuts = value }

		let explosion = (details && details.explosion !== undefined) ? details.explosion : false
		breakHandler.hasExplosion = function () { return explosion }
		breakHandler.setExplosion = function (value) { explosion = value }

		let explosionRadius = 0
		if (explosion) {
			explosionRadius = (details && details.explosionRadius !== undefined) ? details.explosionRadius : 50
		}
		breakHandler.getExplosionRadius = function () { return explosionRadius }
		breakHandler.setExplosionRadius = function (value) { explosionRadius = value }

		_range = worldManager.getEaseljsCanvas().width / 2
	}

	BreakHandler.prototype.breakEntity = function (entity, x, y, angles) {
		fnBreakEntity(this, entity, x, y, angles)
	}

	function fnBreakEntity(breakHandler, entity, x, y, angles) {
		if (_worldManager.getTimeStep() === 0) { // Do not execute when it's paused
			return
		}

		if (!(entity instanceof MyGameBuilder.Entity)) {
			throw new Error(arguments.callee.name + " : entity must be an instance of Entity!")
		}

		const entityBody = entity.b2body
		if (entityBody.GetType() !== box2d.b2Body.b2_dynamicBody) {
			console.warn('A non-dynamic entity cannot be broken!')
			return
		}
		if (!entityBody.GetFixtureList()) {
			return
		}
		if (entityBody.GetFixtureList().GetShape().GetType() !== Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			console.warn('An entity that has a non-polygonal shape can not be broken! Type == ' + entityBody.GetFixtureList().GetShape().GetType())
			return
		}

		if (angles !== undefined && !(angles instanceof Array)) {
			throw new Error(arguments.callee.name + " : angles must be an Array!")
		}

		const player = _worldManager.getPlayer()
		let adjustX = 0, adjustY = 0
		if (player) {
			adjustX = player.getCameraAdjust().adjustX
			adjustY = player.getCameraAdjust().adjustY
		}

		_breakCenterX = x + adjustX
		_breakCenterY = y + adjustY

		const cutAngles = []
		let nCuts = 0
		if (angles) { // Informed angles
			angles.forEach(angle => cutAngles.push(angle * Math.PI / 180))
			nCuts += angles.length
		}
		while (nCuts < breakHandler.getNumCuts()) { // Random angles
			cutAngles.push(Math.random() * Math.PI * 2)
			nCuts++
		}
		
		_breakBodies = []
		if (entityBody !== null) {
			_breakBodies.push(entityBody)

			cutAngles.forEach(cutAngle => {
				const laserSegment = new Box2D.Collision.b2Segment()
				laserSegment.p1 = new box2d.b2Vec2(
					(_breakCenterX + i / 10 - _range * Math.cos(cutAngle)) / _worldManager.getScale(),
					(_breakCenterY - _range * Math.sin(cutAngle)) / _worldManager.getScale()
				)
				laserSegment.p2 = new box2d.b2Vec2(
					(_breakCenterX + _range * Math.cos(cutAngle)) / _worldManager.getScale(),
					(_breakCenterY + _range * Math.sin(cutAngle)) / _worldManager.getScale()
				)

				_affectedByLaser = []
				_entryPoint = []

				_worldManager.getWorld().RayCast(
					function (fixture, point, normal, fraction) {
						laserFired(breakHandler, fixture, point, normal, fraction)
					},
					laserSegment.p1,
					laserSegment.p2
				)

				_worldManager.getWorld().RayCast(
					function (fixture, point, normal, fraction) {
						laserFired(breakHandler, fixture, point, normal, fraction)
					},
					laserSegment.p2,
					laserSegment.p1
				)
			})
		}
	}

	function laserFired(breakHandler, fixture, point) {
		const affectedBody = fixture.GetBody()
		if (_breakBodies.indexOf(affectedBody) !== -1) {
			const affectedPolygon = fixture.GetShape()
			const fixtureIndex = _affectedByLaser.indexOf(affectedBody)

			if (fixtureIndex === -1) {
				_affectedByLaser.push(affectedBody)
				_entryPoint.push(point)
			}
			else {
				// -- BEGIN
				// -- Code identical in SliceHandler.js
				const rayCenter = new box2d.b2Vec2((point.x + _entryPoint[fixtureIndex].x) / 2, (point.y + _entryPoint[fixtureIndex].y) / 2)
				const rayAngle = Math.atan2(_entryPoint[fixtureIndex].y - point.y, _entryPoint[fixtureIndex].x - point.x)
				const polyVertices = affectedPolygon.GetVertices()
				const newPolyVertices1 = []
				const newPolyVertices2 = []

				let currentPoly = 0
				let cutPlaced1 = false
				let cutPlaced2 = false

				polyVertices.forEach(polyVertice => {
					const worldPoint = affectedBody.GetWorldPoint(polyVertice)
					let cutAngle = Math.atan2(worldPoint.y - rayCenter.y, worldPoint.x - rayCenter.x) - rayAngle
					if (cutAngle < Math.PI * -1) {
						cutAngle += 2 * Math.PI
					}
					if (cutAngle > 0 && cutAngle <= Math.PI) {
						if (currentPoly === 2) {
							cutPlaced1 = true
							newPolyVertices1.push(point)
							newPolyVertices1.push(_entryPoint[fixtureIndex])
						}
						newPolyVertices1.push(worldPoint)
						currentPoly = 1
					}
					else {
						if (currentPoly === 1) {
							cutPlaced2 = true
							newPolyVertices2.push(_entryPoint[fixtureIndex])
							newPolyVertices2.push(point)
						}
						newPolyVertices2.push(worldPoint)
						currentPoly = 2
					}
				})

				if (!cutPlaced1) {
					newPolyVertices1.push(point)
					newPolyVertices1.push(_entryPoint[fixtureIndex])
				}
				if (!cutPlaced2) {
					newPolyVertices2.push(_entryPoint[fixtureIndex])
					newPolyVertices2.push(point)
				}
				// -- Code identical in SliceHandler.js
				// -- END

				_numPieces = 0
				const entity = _worldManager.getEntityByItsBody(affectedBody)

				const pieces = []
				if ( getArea(newPolyVertices1) >= _MIN_PIECE_AREA) {
					pieces.push(createPiece(breakHandler, entity, newPolyVertices1))
				}
				if (getArea(newPolyVertices2) >= _MIN_PIECE_AREA) {
					pieces.push(createPiece(breakHandler, entity, newPolyVertices2))
				}

				if (entity.onbreak !== undefined) {
					entity.onbreak(pieces)
				}

				_worldManager.deleteEntity(entity)

				//affectedBody must be destroyed now in order to not interfere in the next laserFired calls
				_worldManager.getWorld().DestroyBody(affectedBody)
			}
		}
		return 1
	}

	function createPiece(breakHandler, entity, vertices) {
		const center = findCentroid(vertices).center
		vertices.forEach(vertice => vertice.Subtract(center))

		const piece = createEntityPiece(entity, vertices, center)

		vertices.forEach(vertice => vertice.Add(center))

		if (breakHandler.hasExplosion()) {
			const explosionVelocity = getExplosionVelocity(breakHandler, piece.b2body)
			piece.b2body.SetLinearVelocity(explosionVelocity)
		}

		_breakBodies.push(piece.b2body)
		return piece
	}

	function createEntityPiece(entity, vertices, center) {
		const scaledVertices = []
		vertices.forEach(shapeVertice => {
			const scaledVertice = new box2d.b2Vec2()
			scaledVertice.x = shapeVertice.x * _worldManager.getScale()
			scaledVertice.y = shapeVertice.y * _worldManager.getScale()
			scaledVertices.push(scaledVertice)
		})

		const entityBody = entity.b2body
		const entityFixture = entityBody.GetFixtureList()
		const entityUserData = entityBody.GetUserData()
		const entityRender = entityUserData.render

		const render = {}
		render.z = entityRender.z
		render.type = entityRender.type
		render.opacity = entityRender.opacity
		render.filters = entityRender.filters

		if (entityRender.action !== undefined) {
			render.action = entityRender.action
		}
		if (entityRender.drawOpts !== undefined) {
			render.drawOpts = entityRender.drawOpts
		}
		if (entityRender.imageOpts !== undefined) {
			render.imageOpts = entityRender.imageOpts
		}
		if (entityRender.spriteSheetOpts !== undefined) {
			render.spriteSheetOpts = entityRender.spriteSheetOpts
		}
		if (entityRender.textOpts !== undefined) {
			render.textOpts = entityRender.textOpts
		}

		_numPieces++

		const newEntity = _worldManager.createEntity({
			type: entityBody.GetType(),
			x: center.x * _worldManager.getScale(),
			y: center.y * _worldManager.getScale(),
			//angle : doesn't need to be updated!
			shape: 'polygon',
			polygonOpts: { points: scaledVertices },
			render: render,
			bodyDefOpts: {
				fixedRotation: entityBody.IsFixedRotation(),
				bullet: entityBody.IsBullet(),
				linearDamping: entityBody.GetLinearDamping(),
				linearVelocity: entityBody.GetLinearVelocity(),
				angularDamping: entityBody.GetAngularDamping(),
				angularVelocity: entityBody.GetAngularVelocity() * 180 / Math.PI
			},
			fixtureDefOpts: {
				density: entityFixture.GetDensity(),
				friction: entityFixture.GetFriction(),
				restitution: entityFixture.GetRestitution(),
				isSensor: entityFixture.IsSensor(),
				filterCategoryBits: entityFixture.GetFilterData().categoryBits,
				filterMaskBits: entityFixture.GetFilterData().maskBits,
				filterGroupIndex: entityFixture.GetFilterData().groupIndex,
				isFluid: entityFixture.GetUserData().isFluid,
				dragConstant: entityFixture.GetUserData().dragConstant,
				liftConstant: entityFixture.GetUserData().liftConstant,
				isSticky: entityFixture.GetUserData().isSticky,
				isTarget: entityFixture.GetUserData().isTarget,
				hardness: entityFixture.GetUserData().hardness
			},
			name: `${entityUserData.name}_${_numPieces}`,
			group: entityUserData.group,
			draggable: entityUserData.draggable,
			sliceable: entityUserData.sliceable,
			noGravity: entityUserData.noGravity,
			events: {
				onslice: entity.onslice,
				onbreak: entity.onbreak,
				ontick: entity.ontick
			}
		})

		console.log("newEntity", newEntity)
		return newEntity
	}

	function getExplosionVelocity(breakHandler, b) {
		const explosionRadius = breakHandler.getExplosionRadius()

		let distX = b.GetWorldCenter().x * _worldManager.getScale() - _breakCenterX
		if (distX < 0) {
			distX = (distX < -explosionRadius) ? 0 : -explosionRadius - distX
		}
		else {
			distX = (distX > explosionRadius) ? 0 : explosionRadius - distX
		}

		let distY = b.GetWorldCenter().y * _worldManager.getScale() - _breakCenterY
		if (distY < 0) {
			distY = (distY < -explosionRadius) ? 0 : -explosionRadius - distY
		}
		else {
			distY = (distY > explosionRadius) ? 0 : explosionRadius - distY
		}

		distX *= 0.25
		distY *= 0.25
		return new box2d.b2Vec2(distX, distY)
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The BreakHandler details must be an object!")
			}
			for (let def in details) {
				if (_validBreakHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for BreakHandler is not supported! Valid definitions: " + _validBreakHandlerDef)
				}
			}
			if (details.numCuts !== undefined && (typeof details.numCuts !== 'number' || details.numCuts <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for numCuts!")
			}
			if (details.explosion !== undefined && typeof details.explosion !== 'boolean') {
				throw new Error(arguments.callee.name + " : explosion must be true/false!")
			}
			if (details.explosionRadius !== undefined && (typeof details.explosionRadius !== 'number' || details.explosionRadius <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for explosionRadius!")
			}
		}
	}

})()