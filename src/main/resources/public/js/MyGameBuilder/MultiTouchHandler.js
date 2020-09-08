this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.MultiTouchHandler = MultiTouchHandler

	function MultiTouchHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validMultiTouchHandlerDef = ['enableDrag', 'drawPointerLocation', 'pointerRadius', 'pointerAccurate', 'onmousedown', 'onmouseup', 'onmousemove', 'enableSlice', 'sliceOpts']

	let _worldManager

	let _enableDrag
	MultiTouchHandler.prototype.getEnableDrag = function () { return _enableDrag }
	MultiTouchHandler.prototype.setEnableDrag = function (value) { _enableDrag = value }

	let _enableSlice
	MultiTouchHandler.prototype.getEnableSlice = function () { return _enableSlice }
	MultiTouchHandler.prototype.setEnableSlice = function (value) {
		_enableSlice = value
		if (_sliceHandler === undefined) {
			_sliceHandler = new MyGameBuilder.SliceHandler(_worldManager, _sliceOpts)
		}
	}

	let _sliceHandler
	MultiTouchHandler.prototype.getSliceHandler = function () { return _sliceHandler }

	let _mouseEvent, _mouseX, _mouseY, _isMouseDown
	MultiTouchHandler.prototype.isMouseDown = function () { return _isMouseDown }

	let _userOnMouseDown, _userOnMouseUp, _userOnMouseMove, _sliceOpts
	let _canvasPosition
	let _screenButtons
	let _pointerRadius, _pointerAccurate, _drawPointerLocation
	let _selectedBodies, _mousePVec, _halfSquare, _mouseDownOnEntity, _mouseJoint
	let _touches, _touchesJoint, _touchesDownOnEntity

	let _touchable = 'createTouch' in document
	MultiTouchHandler.prototype.isTouchable = function () { return _touchable }

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager
		_screenButtons = worldManager.getScreenButtons()

		const box2dCanvas = worldManager.getBox2dCanvas()
		_canvasPosition = getElementPosition(box2dCanvas)

		_enableDrag = (details && details.enableDrag !== undefined) ? details.enableDrag : true

		if (details && details.sliceOpts !== undefined) {
			_sliceOpts = details.sliceOpts
		}

		_enableSlice = (details && details.enableSlice !== undefined) ? details.enableSlice : false
		if (_enableSlice)
			_sliceHandler = new MyGameBuilder.SliceHandler(worldManager, _sliceOpts)

		_drawPointerLocation = (details && details.drawPointerLocation !== undefined) ? details.drawPointerLocation : false

		_pointerRadius = _halfSquare = 1.0 / worldManager.getScale()
		if (details && details.pointerRadius !== undefined) {
			_pointerRadius = details.pointerRadius / worldManager.getScale()
			_halfSquare = Math.sqrt((details.pointerRadius * details.pointerRadius) / 2) / worldManager.getScale()
		}

		_pointerAccurate = (details && details.pointerAccurate !== undefined) ? details.pointerAccurate : true

		if (details && details.onmousedown !== undefined) {
			_userOnMouseDown = details.onmousedown
		}
		if (details && details.onmouseup !== undefined) {
			_userOnMouseUp = details.onmouseup
		}
		if (details && details.onmousemove !== undefined) {
			_userOnMouseMove = details.onmousemove
		}

		if (_touchable) {
			box2dCanvas.addEventListener('touchstart', onTouchStart, true)
			box2dCanvas.addEventListener('touchmove', onTouchMove, true)
			box2dCanvas.addEventListener('touchend', onTouchEnd, true)
		}
		else {
			box2dCanvas.addEventListener('mousedown', onMouseDown, true)
			box2dCanvas.addEventListener('mousemove', onMouseMove, true)
			box2dCanvas.addEventListener('mouseup', onMouseUp, true)
		}

		_mouseDownOnEntity = false
		_mouseJoint = []
		_touches = []
		_touchesJoint = {}
		_touchesDownOnEntity = {}
	}

	MultiTouchHandler.prototype.update = function (countTick) {
		if (_touchable) {
			for (let i = 0; i < _touches.length; i++) {
				const touch = _touches[i]

				if (_drawPointerLocation) {
					drawTouchLocation(touch)
				}

				const screenButton = downOnScreenButton(touch.clientX, touch.clientY)
				if (screenButton !== null) {
					if (screenButton.touchId === undefined) {
						screenButton.isButtonDown = true
						screenButton.touchId = touch.identifier
						if (screenButton.onMouseDown !== undefined) {
							screenButton.onMouseDown(touch)
						}
					}
					else if (touch.identifier === screenButton.touchId && screenButton.keepPressed &&
						screenButton.isButtonDown && screenButton.onMouseDown !== undefined &&
						countTick % _worldManager.getTickMod() === 0) {
						screenButton.onMouseDown(touch)
					}
				}
				else if (_enableDrag && _touchesDownOnEntity[touch.identifier]) {
					const { adjustX, adjustY } = _worldManager.getCameraAdjust()

					if (_touchesJoint[touch.identifier] === undefined) {
						_touchesJoint[touch.identifier] = []

						// TODO - maybe use lambda with filter here
						const bodies = getBodyAtMouseTouch(touch.clientX + adjustX, touch.clientY + adjustY)
						for (let j = 0; j < bodies.length; j++) {
							const body = bodies[j]
							if (body.GetUserData().draggable) {
								_touchesJoint[touch.identifier].push(createMouseJoint(body, touch.clientX + adjustX, touch.clientY + adjustY))
							}
						}
					}
					if (_touchesJoint[touch.identifier].length > 0) {
						// TODO - maybe use lambda
						for (let j = 0; j < _touchesJoint[touch.identifier].length; j++)
							_touchesJoint[touch.identifier][j].SetTarget(
								new box2d.b2Vec2(
									(touch.clientX + adjustX) / _worldManager.getScale(),
									(touch.clientY + adjustY) / _worldManager.getScale()
								)
							)
					}
				}
			}
		}
		else {
			if (_drawPointerLocation) {
				drawMouseLocation()
			}

			if (_isMouseDown) {
				const screenButton = downOnScreenButton(_mouseX, _mouseY)
				if (screenButton !== null) {
					if (!screenButton.isButtonDown) {
						screenButton.isButtonDown = true
						if (screenButton.onMouseDown !== undefined) {
							screenButton.onMouseDown(_mouseEvent)
						}
					}
					else if (screenButton.keepPressed && countTick % _worldManager.getTickMod() === 0) {
						screenButton.onMouseDown(_mouseEvent)
					}
				}
				else if (_enableDrag && _mouseDownOnEntity) {
					const { adjustX, adjustY } = _worldManager.getCameraAdjust()

					if (_mouseJoint.length === 0) {
						const bodies = getBodyAtMouseTouch(_mouseX + adjustX, _mouseY + adjustY)

						// TODO - maybe use lambda with filter here
						for (let i = 0; i < bodies.length; i++) {
							const body = bodies[i]
							if (body.GetUserData().draggable) {
								_mouseJoint.push(createMouseJoint(body, _mouseX + adjustX, _mouseY + adjustY))
							}
						}
					}

					if (_mouseJoint.length > 0) {
						// TODO - maybe use lambda here
						for (let i = 0; i < _mouseJoint.length; i++)
							_mouseJoint[i].SetTarget(
								new box2d.b2Vec2(
									(_mouseX + adjustX) / _worldManager.getScale(),
									(_mouseY + adjustY) / _worldManager.getScale()
								)
							)
					}
				}
			}
		}
	}

	MultiTouchHandler.prototype.getEntitiesAtMouseTouch = function (e) {
		let x, y
		if (_touchable) {
			x = e.clientX
			y = e.clientY
		}
		else {
			x = e.x
			y = e.y
		}

		const { adjustX, adjustY } = _worldManager.getCameraAdjust()

		const bodies = getBodyAtMouseTouch(x + adjustX, y + adjustY)
		const entities = []
		// TODO - maybe use lambda here
		for (let i = 0; i < bodies.length; i++) {
			const entity = _worldManager.getEntityByItsBody(bodies[i])
			entities.push(entity)
		}

		return entities
	}

	function onTouchStart(e) {
		e.preventDefault()
		_touches = e.touches

		// TODO - maybe use lambda here
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i]
			const screenButton = downOnScreenButton(touch.clientX, touch.clientY)

			if (screenButton === null) {
				const { adjustX, adjustY } = _worldManager.getCameraAdjust()

				const bodies = getBodyAtMouseTouch(touch.clientX + adjustX, touch.clientY + adjustY)
				if (bodies.length > 0) {
					_touchesDownOnEntity[touch.identifier] = true
				}
				else if (_sliceHandler !== undefined && _enableSlice) {
					_sliceHandler.onTouchStart(touch)
				}

				if (_userOnMouseDown !== undefined) {
					_userOnMouseDown(touch)
				}
			}
		}
	}

	function onTouchMove(e) {
		e.preventDefault()
		_touches = e.touches

		// TODO - maybe use lambda here
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i]
			const screenButton = downOnScreenButton(touch.clientX, touch.clientY)

			for (let j = 0; j < _screenButtons.length; j++) {
				const sb = _screenButtons[j]
				if (sb.isButtonDown && sb !== screenButton) {
					sb.touchId = undefined
					sb.isButtonDown = false
					if (sb.onMouseUp !== undefined) {
						sb.onMouseUp(touch)
					}
				}
			}

			if (screenButton === null) {
				if (_sliceHandler !== undefined && _enableSlice) {
					_sliceHandler.onTouchMove(touch)
				}

				if (_userOnMouseMove !== undefined) {
					_userOnMouseMove(touch)
				}
			}
		}
	}

	function onTouchEnd(e) {
		e.preventDefault()
		_touches = e.touches

		// TODO - maybe use lambda here
		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i]
			_touchesDownOnEntity[touch.identifier] = false

			let touchOnScreenButton = false
			// TODO - maybe use lambda here
			for (let j = 0; j < _screenButtons.length; j++) {
				const screenButton = _screenButtons[j]

				if (screenButton.touchId === touch.identifier) {
					touchOnScreenButton = true

					screenButton.isButtonDown = false
					screenButton.touchId = undefined
					if (screenButton.onMouseUp !== undefined) {
						screenButton.onMouseUp(touch)
					}
				}
			}

			if (!touchOnScreenButton) {
				if (_sliceHandler !== undefined && _enableSlice) {
					_sliceHandler.onTouchEnd(touch)
				}

				if (_userOnMouseUp !== undefined) {
					_userOnMouseUp(touch)
				}
			}

			for (let p in _touchesJoint) {
				if (p === touch.identifier) {
					// TODO - maybe use lambda  here
					for (let j = 0; j < _touchesJoint[p].length; j++) {
						_worldManager.getWorld().DestroyJoint(_touchesJoint[p][j])
					}
					delete _touchesJoint[p]
				}
			}
		}
	}

	function onMouseDown(e) {
		e.preventDefault()

		_mouseEvent = e
		_isMouseDown = true

		const screenButton = downOnScreenButton(_mouseX, _mouseY)
		if (screenButton === null) {
			const { adjustX, adjustY } = _worldManager.getCameraAdjust()
			
			const bodies = getBodyAtMouseTouch(_mouseX + adjustX, _mouseY + adjustY)
			if (bodies.length > 0) {
				_mouseDownOnEntity = true
			}
			else if (_sliceHandler !== undefined && _enableSlice) {
				_sliceHandler.onMouseDown(e)
			}

			if (_userOnMouseDown !== undefined) {
				_userOnMouseDown(e)
			}
		}

	}

	function onMouseMove(e) {
		e.preventDefault()

		_mouseX = e.x - _canvasPosition.x
		_mouseY = e.y - _canvasPosition.y

		const screenButton = downOnScreenButton(_mouseX, _mouseY)

		for (let i = 0; i < _screenButtons.length; i++) {
			const sb = _screenButtons[i]
			if (sb.isButtonDown && sb !== screenButton) {
				sb.isButtonDown = false
				if (sb.onMouseUp !== undefined) {
					sb.onMouseUp(e)
				}
			}
		}

		if (screenButton === null) {
			if (_sliceHandler !== undefined && _enableSlice) {
				_sliceHandler.onMouseMove(e)
			}

			if (_userOnMouseMove !== undefined) {
				_userOnMouseMove(e)
			}
		}
	}

	function onMouseUp(e) {
		e.preventDefault()

		_mouseEvent = undefined
		_isMouseDown = false
		_mouseDownOnEntity = false

		let mouseOnScreenButton = false
		// TODO - maybe use lambda here
		for (let i = 0; i < _screenButtons.length; i++) {
			const screenButton = _screenButtons[i]

			if (screenButton.isButtonDown) {
				mouseOnScreenButton = true

				screenButton.isButtonDown = false
				if (screenButton.onMouseUp !== undefined) {
					screenButton.onMouseUp(e)
				}
			}
		}

		if (!mouseOnScreenButton) {
			if (_sliceHandler !== undefined && _enableSlice) {
				_sliceHandler.onMouseUp(e)
			}

			if (_userOnMouseUp) {
				_userOnMouseUp(e)
			}
		}

		if (_mouseJoint.length > 0) {
			// TODO - maybe use lambda here
			for (let i = 0; i < _mouseJoint.length; i++) {
				_worldManager.getWorld().DestroyJoint(_mouseJoint[i])
			}
			_mouseJoint = []
		}
	}

	function createMouseJoint(body, x, y) {
		x /= _worldManager.getScale()
		y /= _worldManager.getScale()

		const md = new box2d.b2MouseJointDef()
		md.bodyA = _worldManager.getWorld().GetGroundBody()
		md.bodyB = body
		md.target.Set(x, y)
		md.collideConnected = true
		md.maxForce = 300.0 * body.GetMass()
		const mouseJoint = _worldManager.getWorld().CreateJoint(md)
		body.SetAwake(true)

		return mouseJoint
	}

	function drawTouchLocation(touch) {
		const x = touch.clientX
		const y = touch.clientY
		const radius = _pointerRadius * _worldManager.getScale()
		const halfSquare = _halfSquare * _worldManager.getScale()

		const c = _worldManager.getBox2dCanvasCtx()
		if (_pointerAccurate) {
			c.beginPath()
			c.lineWidth = "1"
			c.strokeStyle = "white"
			c.moveTo(x - 20, y - 20)
			c.lineTo(x + 20, y + 20)
			c.stroke()
			c.moveTo(x + 20, y - 20)
			c.lineTo(x - 20, y + 20)
			c.stroke()
		}
		else {
			c.beginPath()
			c.lineWidth = "1"
			c.strokeStyle = "white"
			c.rect(x - halfSquare, y - halfSquare, halfSquare * 2, halfSquare * 2)
			c.stroke()
		}

		c.beginPath()
		c.lineWidth = "1"
		c.strokeStyle = "yellow"
		c.arc(x, y, radius, 0, Math.PI * 2, true)
		c.stroke()

		c.beginPath()
		c.fillStyle = "white"
		c.fillText("touch id : " + touch.identifier + " x:" + x + " y:" + y, x + 30, y - 30)
	}

	function drawMouseLocation() {
		const x = _mouseX
		const y = _mouseY
		const radius = _pointerRadius * _worldManager.getScale()
		const halfSquare = _halfSquare * _worldManager.getScale()

		const c = _worldManager.getBox2dCanvasCtx()
		if (_pointerAccurate) {
			c.beginPath()
			c.lineWidth = "1"
			c.strokeStyle = "white"
			c.moveTo(x - 20, y - 20)
			c.lineTo(x + 20, y + 20)
			c.stroke()
			c.moveTo(x + 20, y - 20)
			c.lineTo(x - 20, y + 20)
			c.stroke()
		}
		else {
			c.beginPath()
			c.lineWidth = "1"
			c.strokeStyle = "white"
			c.rect(x - halfSquare, y - halfSquare, halfSquare * 2, halfSquare * 2)
			c.stroke()
		}

		c.beginPath()
		c.lineWidth = "1"
		c.strokeStyle = "yellow"
		c.arc(x, y, radius, 0, Math.PI * 2, true)
		c.stroke()

		c.beginPath()
		c.fillStyle = "white"
		c.fillText("mouse : " + x + ", " + y, x, y)
	}

	function downOnScreenButton(x, y) {
		let screenButton = null
		for (let i = 0; i < _worldManager.getScreenButtons().length; i++) {
			const sb = _worldManager.getScreenButtons()[i]
			if (x >= sb.view.x0 - sb.view.dimension.width / 2 &&
				x <= sb.view.x0 + sb.view.dimension.width / 2 &&
				y >= sb.view.y0 - sb.view.dimension.height / 2 &&
				y <= sb.view.y0 + sb.view.dimension.height / 2) {
				screenButton = sb
				break
			}
		}
		return screenButton
	}

	function getBodyAtMouseTouch(x, y) {
		x /= _worldManager.getScale()
		y /= _worldManager.getScale()

		_mousePVec = new box2d.b2Vec2(x, y)
		const aabb = new box2d.b2AABB()
		aabb.lowerBound.Set(x - _halfSquare, y - _halfSquare)
		aabb.upperBound.Set(x + _halfSquare, y + _halfSquare)

		_selectedBodies = []
		_worldManager.getWorld().QueryAABB(getBodyCB, aabb)
		return _selectedBodies
	}

	// TODO - improve this method
	function getBodyCB(fixture) {
		if (fixture.GetBody().GetType() !== box2d.b2Body.b2_staticBody) {
			if (_pointerAccurate) {
				if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), _mousePVec)) {
					_selectedBodies.push(fixture.GetBody())
				}
			}
			else {
				_selectedBodies.push(fixture.GetBody())
			}
		}
		return true
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The MultiTouchHandler details must be an object!")
			}
			for (let def in details) {
				if (_validMultiTouchHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validMultiTouchHandlerDef)
				}
			}

			if (details.enableDrag !== undefined && typeof details.enableDrag !== 'boolean') {
				throw new Error(arguments.callee.name + " : enableDrag must be a true/false!")
			}
			if (details.enableSlice !== undefined && typeof details.enableSlice !== 'boolean') {
				throw new Error(arguments.callee.name + " : enableSlice must be a true/false!")
			}
			if (details.drawPointerLocation !== undefined && typeof details.drawPointerLocation !== 'boolean') {
				throw new Error(arguments.callee.name + " : drawPointerLocation must be a true/false!")
			}
			if (details.pointerRadius !== undefined && (typeof details.pointerRadius !== 'number' || details.pointerRadius <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for pointerRadius!")
			}
			if (details.pointerAccurate !== undefined && typeof details.pointerAccurate !== 'boolean') {
				throw new Error(arguments.callee.name + " : pointerAccurate must be a true/false!")
			}
			if (details.onmousedown !== undefined && typeof details.onmousedown !== 'function') {
				throw new Error(arguments.callee.name + " : onmousedown must be a function!")
			}
			if (details.onmouseup !== undefined && typeof details.onmouseup !== 'function') {
				throw new Error(arguments.callee.name + " : onmouseup must be a function!")
			}
			if (details.onmousemove !== undefined && typeof details.onmousemove !== 'function') {
				throw new Error(arguments.callee.name + " : onmousemove must be a function!")
			}
		}
	}

})()