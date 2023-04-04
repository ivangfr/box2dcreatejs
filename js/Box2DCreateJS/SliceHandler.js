this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.SliceHandler = SliceHandler

	const _MIN_PIECE_AREA = 0.1

	function SliceHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validSliceDef = ['drawLine', 'lineWidth', 'lineColor']

	let _worldManager
	let _affectedByLaser, _entryPoint
	let _mouse, _touches

	function initialize(sliceHandler, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		_affectedByLaser = []
		_entryPoint = []

		_mouse = { down: false, released: false }
		_touches = {}

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
		_mouse.begX = e.x
		_mouse.begY = e.y
		_mouse.down = true
	}

	SliceHandler.prototype.onMouseUp = function (e) {
		_mouse.endX = e.x
		_mouse.endY = e.y
		_mouse.down = false
		_mouse.released = true

		if (_mouse.sliceDraw) {
			_worldManager.getEaseljsStage().removeChild(_mouse.sliceDraw)
			_mouse.sliceDraw = undefined
		}
	}

	SliceHandler.prototype.onMouseMove = function (e) {
		_mouse.endX = e.x
		_mouse.endY = e.y
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

	function drawSlice(sliceHandler, pointer) {
		const { adjustX, adjustY } = _worldManager.getCameraAdjust()

		if (pointer.sliceDraw === undefined) {
			pointer.sliceDraw = new createjs.Shape()
			_worldManager.getEaseljsStage().addChild(pointer.sliceDraw)
		}
		else {
			pointer.sliceDraw.graphics.clear()
		}
		pointer.sliceDraw.graphics.setStrokeStyle(sliceHandler.getLineWidth())
		pointer.sliceDraw.graphics.beginStroke(sliceHandler.getLineColor())
		pointer.sliceDraw.graphics.moveTo(pointer.begX + adjustX, pointer.begY + adjustY)
		pointer.sliceDraw.graphics.lineTo(pointer.endX + adjustX, pointer.endY + adjustY)
		pointer.sliceDraw.graphics.endStroke()
	}

	SliceHandler.prototype.update = function () {
		if (_worldManager.getTimeStep() === 0) { // Do not execute when it's paused
			return
		}

		if (this.isTouchable()) {
			for (let id in _touches) {
				const touch = _touches[id]

				if (touch.down && this.getDrawLine()) {
					drawSlice(this, touch)
				}

				if (touch.released) {
					if (touch.begX === undefined || touch.begY === undefined) {
						delete _touches[id]
						continue
					}

					executeRayCast(touch)

					delete _touches[id]
				}
			}
			_affectedByLaser = []
			_entryPoint = []
		}
		else {
			if (_mouse.down && this.getDrawLine()) {
				drawSlice(this, _mouse)
			}

			if (_mouse.released) {
				_mouse.released = false
				if (_mouse.begX === undefined || _mouse.begY === undefined) {
					return
				}

				executeRayCast(_mouse)

				_affectedByLaser = []
				_entryPoint = []
				_mouse.begX = _mouse.begY = undefined
			}
		}
	}

	function executeRayCast(pointer) {
		const { adjustX, adjustY } = _worldManager.getCameraAdjust()

		const p1 = new box2d.b2Vec2(
			(pointer.begX + adjustX) / _worldManager.getScale(),
			(pointer.begY + adjustY) / _worldManager.getScale()
		)

		const p2 = new box2d.b2Vec2(
			(pointer.endX + adjustX) / _worldManager.getScale(),
			(pointer.endY + adjustY) / _worldManager.getScale()
		)

		const v = arrangeClockwise([p1, p2])
		_worldManager.getWorld().RayCast(rayCastCallback, v[0], v[1])
		_worldManager.getWorld().RayCast(rayCastCallback, v[1], v[0])
	}

	function rayCastCallback(fixture, point, normal, fraction) {
		laserFired(fixture, point, normal, fraction)
	}

	function laserFired(fixture, point) {
		const fixtureBody = fixture.GetBody()

		if (!fixtureBody.GetUserData().sliceable) {
			return
		}
		if (fixtureBody.GetType() !== box2d.b2Body.b2_dynamicBody) {
			console.warn('A non-dynamic entity cannot be sliced!')
			return
		}
		if (fixture.GetShape().GetType() !== Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			console.warn('An entity that has a non-polygonal shape can not be sliced!')
			return
		}

		const fixtureIndex = _affectedByLaser.indexOf(fixtureBody)
		if (fixtureIndex === -1) {
			_affectedByLaser.push(fixtureBody)
			_entryPoint.push(point)
		}
		else {
			const { polygon1Vertices, polygon2Vertices } = getNew2PolygonVertices(fixture, point, _entryPoint[fixtureIndex])

			const entity = _worldManager.getEntityByItsBody(fixtureBody)

			const pieces = []
			if (getArea(polygon1Vertices) >= _MIN_PIECE_AREA) {
				pieces.push(createPiece(entity, polygon1Vertices, 1))
			}
			if (getArea(polygon2Vertices) >= _MIN_PIECE_AREA) {
				pieces.push(createPiece(entity, polygon2Vertices, 2))
			}

			if (entity.onslice !== undefined) {
				entity.onslice(pieces)
			}

			_worldManager.deleteEntity(entity)
		}
	}

	function createPiece(entity, vertices, id) {
		const center = findCentroid(vertices).center
		vertices.forEach(vertice => vertice.Subtract(center))

		const piece = createEntityPiece(_worldManager, entity, vertices, center, id)

		vertices.forEach(vertice => vertice.Add(center))
		return piece
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
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