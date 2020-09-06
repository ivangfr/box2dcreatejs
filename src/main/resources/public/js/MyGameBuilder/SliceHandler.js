this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.SliceHandler = SliceHandler

	function SliceHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validSliceDef = ['drawLine', 'lineWidth', 'lineColor']

	let _worldManager
	let _affectedByLaser, _entryPoint
	let _mouseBegX, _mouseBegY, _mouseEndX, _mouseEndY, _mouseDown, _mouseReleased, _mouseSliceDraw
	let _touches
	let _numPieces

	function initialize(sliceHandler, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		_affectedByLaser = []
		_entryPoint = []

		_touches = {}
		_mouseDown = false
		_mouseReleased = false

		let drawLine = (details && details.drawLine !== undefined) ? details.drawLine : true
		sliceHandler.getDrawLine = function () { return drawLine }
		sliceHandler.setDrawLine = function (value) { drawLine = value }

		let lineWidth = (details && details.lineWidth !== undefined) ? details.lineWidth : 2
		sliceHandler.getLineWidth = function () { return lineWidth }
		sliceHandler.setLineWidth = function (value) { lineWidth = value }

		let lineColor = (details && details.lineColor !== undefined) ? details.lineColor : 'red'
		sliceHandler.getLineColor = function () { return lineColor }
		sliceHandler.setLineColor = function (value) { lineColor = value }

		const touchable = 'createTouch' in document
		sliceHandler.isTouchable = function () { return touchable }
	}

	SliceHandler.prototype.onMouseDown = function (e) {
		_mouseBegX = e.x
		_mouseBegY = e.y
		_mouseDown = true
	}

	SliceHandler.prototype.onMouseUp = function (e) {
		_mouseEndX = e.x
		_mouseEndY = e.y
		_mouseDown = false
		_mouseReleased = true

		if (_mouseSliceDraw) {
			_worldManager.getEaseljsStage().removeChild(_mouseSliceDraw)
			_mouseSliceDraw = undefined
		}
	}

	SliceHandler.prototype.onMouseMove = function (e) {
		_mouseEndX = e.x
		_mouseEndY = e.y
	}

	SliceHandler.prototype.onTouchStart = function (e) {
		_touches[e.identifier] = {}
		_touches[e.identifier].begX = e.clientX
		_touches[e.identifier].begY = e.clientY
		_touches[e.identifier].down = true
	}

	SliceHandler.prototype.onTouchEnd = function (e) {
		if (_touches[e.identifier] === undefined) {
			_touches[e.identifier] = {}
		}
		_touches[e.identifier].endX = e.clientX
		_touches[e.identifier].endY = e.clientY
		_touches[e.identifier].released = true
		_touches[e.identifier].down = false

		if (_touches[e.identifier].sliceDraw) {
			_worldManager.getEaseljsStage().removeChild(_touches[e.identifier].sliceDraw)
			_touches[e.identifier].sliceDraw = undefined
		}
	}

	SliceHandler.prototype.onTouchMove = function (e) {
		_touches[e.identifier].endX = e.clientX
		_touches[e.identifier].endY = e.clientY
	}

	function drawTouchSlice(sliceHandler, touch) {
		const player = _worldManager.getPlayer()
		let adjustX = 0, adjustY = 0
		if (player) {
			adjustX = player.getCameraAdjust().adjustX
			adjustY = player.getCameraAdjust().adjustY
		}

		if (touch.sliceDraw === undefined) {
			touch.sliceDraw = new createjs.Shape()
			_worldManager.getEaseljsStage().addChild(touch.sliceDraw)
		}
		else {
			touch.sliceDraw.graphics.clear()
		}
		touch.sliceDraw.graphics.setStrokeStyle(sliceHandler.getLineWidth())
		touch.sliceDraw.graphics.beginStroke(sliceHandler.getLineColor())
		touch.sliceDraw.graphics.moveTo(touch.begX + adjustX, touch.begY + adjustY)
		touch.sliceDraw.graphics.lineTo(touch.endX + adjustX, touch.endY + adjustY)
		touch.sliceDraw.graphics.endStroke()
	}

	function drawMouseSlice(sliceHandler) {
		const player = _worldManager.getPlayer()
		let adjustX = 0, adjustY = 0
		if (player) {
			adjustX = player.getCameraAdjust().adjustX
			adjustY = player.getCameraAdjust().adjustY
		}

		if (_mouseSliceDraw === undefined) {
			_mouseSliceDraw = new createjs.Shape()
			_worldManager.getEaseljsStage().addChild(_mouseSliceDraw)
		}
		else {
			_mouseSliceDraw.graphics.clear()
		}
		_mouseSliceDraw.graphics.setStrokeStyle(sliceHandler.getLineWidth())
		_mouseSliceDraw.graphics.beginStroke(sliceHandler.getLineColor())
		_mouseSliceDraw.graphics.moveTo(_mouseBegX + adjustX, _mouseBegY + adjustY)
		_mouseSliceDraw.graphics.lineTo(_mouseEndX + adjustX, _mouseEndY + adjustY)
		_mouseSliceDraw.graphics.endStroke()
	}

	SliceHandler.prototype.update = function () {
		if (_worldManager.getTimeStep() === 0) { // Do not execute when it's paused
			return
		}

		if (this.isTouchable()) {
			for (let id in _touches) {
				const touch = _touches[id]

				if (touch.down && this.getDrawLine()) {
					drawTouchSlice(this, touch)
				}

				if (touch.released) {
					if (touch.begX === undefined || touch.begY === undefined) {
						delete _touches[id]
						continue
					}

					const player = _worldManager.getPlayer()
					let adjustX = 0, adjustY = 0
					if (player) {
						adjustX = player.getCameraAdjust().adjustX
						adjustY = player.getCameraAdjust().adjustY
					}

					const p1 = new box2d.b2Vec2(
						(touch.begX + adjustX) / _worldManager.getScale(),
						(touch.begY + adjustY) / _worldManager.getScale()
					)

					const p2 = new box2d.b2Vec2(
						(touch.endX + adjustX) / _worldManager.getScale(),
						(touch.endY + adjustY) / _worldManager.getScale()
					)

					const v = arrangeClockwise([p1, p2])
					_worldManager.getWorld().RayCast(laserFired, v[0], v[1])
					_worldManager.getWorld().RayCast(laserFired, v[1], v[0])

					delete _touches[id]
				}
			}
			_affectedByLaser = []
			_entryPoint = []
		}
		else {
			if (_mouseDown && this.getDrawLine()) {
				drawMouseSlice(this)
			}

			if (_mouseReleased) {
				_mouseReleased = false

				if (_mouseBegX === undefined || _mouseBegY === undefined) {
					return
				}

				const player = _worldManager.getPlayer()
				let adjustX = 0, adjustY = 0
				if (player) {
					adjustX = player.getCameraAdjust().adjustX
					adjustY = player.getCameraAdjust().adjustY
				}

				const p1 = new box2d.b2Vec2(
					(_mouseBegX + adjustX) / _worldManager.getScale(),
					(_mouseBegY + adjustY) / _worldManager.getScale())

				const p2 = new box2d.b2Vec2(
					(_mouseEndX + adjustX) / _worldManager.getScale(),
					(_mouseEndY + adjustY) / _worldManager.getScale())

				const v = arrangeClockwise([p1, p2])
				_worldManager.getWorld().RayCast(laserFired, v[0], v[1])
				_worldManager.getWorld().RayCast(laserFired, v[1], v[0])

				_affectedByLaser = []
				_entryPoint = []
				_mouseBegX = _mouseBegY = undefined
			}
		}
	}

	function laserFired(fixture, point) {
		const affectedBody = fixture.GetBody()

		if (affectedBody.GetType() !== box2d.b2Body.b2_dynamicBody) {
			console.warn('A non-dynamic entity cannot be sliced!')
			return
		}
		if (fixture.GetShape().GetType() !== Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			console.warn('An entity that has a non-polygonal shape can not be sliced!')
			return
		}
		if (!affectedBody.GetUserData().sliceable) {
			return
		}

		const affectedPolygon = fixture.GetShape()
		const fixtureIndex = _affectedByLaser.indexOf(affectedBody)
		if (fixtureIndex === -1) {
			_affectedByLaser.push(affectedBody)
			_entryPoint.push(point)
		}
		else {
			// -- BEGIN
			// -- Code identical in BreakHandler.js
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
			// -- Code identical in BreakHandler.js
			// -- END

			_numPieces = 0
			const entity = _worldManager.getEntityByItsBody(affectedBody)
			const piece1 = createPiece(entity, newPolyVertices1)
			const piece2 = createPiece(entity, newPolyVertices2)
			
			if (entity.onslice !== undefined) {
				entity.onslice(piece1, piece2)
			}

			_worldManager.deleteEntity(entity)
		}
		return 1
	}

	function createPiece(entity, vertices) {
		const center = findCentroid(vertices).center
		vertices.forEach(vertice => vertice.Subtract(center))

		const piece = createEntityPiece(entity, vertices, center)

		vertices.forEach(vertice => vertice.Add(center))
		return piece
	}

	function createEntityPiece(entity, shapeVertices, center) {
		const scaledVertices = []
		shapeVertices.forEach(shapeVertice => {
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

		return newEntity
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The SliceHandler details must be an object!")
			}
			for (let def in details) {
				if (_validSliceDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for SliceHandler is not supported! Valid definitions: " + _validSliceDef)
				}
			}
			if (details.drawLine !== undefined && typeof details.drawLine !== 'boolean') {
				throw new Error(arguments.callee.name + " : drawLine must be true/false!")
			}
			if (details.lineWidth !== undefined && (typeof details.lineWidth !== 'number' || details.lineWidth < 0)) {
				throw new Error(arguments.callee.name + " : invalid value for lineWidth!")
			}
		}
	}

})()