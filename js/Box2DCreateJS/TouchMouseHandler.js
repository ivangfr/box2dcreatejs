this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.TouchMouseHandler = TouchMouseHandler

	function TouchMouseHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validTouchMouseHandlerDef = ['enableDrag', 'enableSlice', 'sliceOpts', 'debugTouchMouseLocation', 'pointerRadius', 'pointerAccurate',
	  'onmousedown', 'onmouseup', 'onmousemove', 'ontouchstart', 'ontouchmove', 'ontouchend']

	let _worldManager
	let _canvasPosition
	let _screenButtons
	let _debugTouchMouseLocation
	let _selectedBodies, _mousePVec, _halfSquare
	let _userOnMouseDown, _userOnMouseUp, _userOnMouseMove
	let _userOnTouchStart, _userOnTouchMove, _userOnTouchEnd

	let _enableDrag
	TouchMouseHandler.prototype.getEnableDrag = function () { return _enableDrag }
	TouchMouseHandler.prototype.setEnableDrag = function (value) { _enableDrag = value }

	let _enableSlice, _sliceOpts
	TouchMouseHandler.prototype.getEnableSlice = function () { return _enableSlice }
	TouchMouseHandler.prototype.setEnableSlice = function (value) {
		_enableSlice = value
		if (_sliceHandler === undefined) {
			_sliceHandler = new Box2DCreateJS.SliceHandler(_worldManager, _sliceOpts)
		}
	}

	let _pointerRadius
	TouchMouseHandler.prototype.getPointerRadius = function () { return _pointerRadius }
	TouchMouseHandler.prototype.setPointerRadius = function (value) { _pointerRadius = value }

	let _pointerAccurate
	TouchMouseHandler.prototype.getPointerAccurate = function () { return _pointerAccurate }
	TouchMouseHandler.prototype.setPointerAccurate = function (value) { _pointerAccurate = value }

	let _sliceHandler
	TouchMouseHandler.prototype.getSliceHandler = function () { return _sliceHandler }

	let _mouse = { down: false }
	TouchMouseHandler.prototype.isMouseDown = function () { return _mouse.down }

	let _touches, _touchJoints, _touchesDownOnEntity, _mouseJoints

	let _touchable = 'createTouch' in document
	TouchMouseHandler.prototype.isTouchable = function () { return _touchable }

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
		if (_enableSlice) {
			_sliceHandler = new Box2DCreateJS.SliceHandler(worldManager, _sliceOpts)
		}

		_debugTouchMouseLocation = (details && details.debugTouchMouseLocation !== undefined) ? details.debugTouchMouseLocation : false

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

		if (details && details.ontouchstart !== undefined) {
			_userOnTouchStart = details.ontouchstart
		}
		if (details && details.ontouchmove !== undefined) {
			_userOnTouchMove = details.ontouchmove
		}
		if (details && details.ontouchend !== undefined) {
			_userOnTouchEnd = details.ontouchend
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

		_mouse.onEntity = false
		_mouseJoints = []

		_touches = []
		_touchJoints = {}
		_touchesDownOnEntity = {}
	}

	TouchMouseHandler.prototype.update = function (countTick) {
		if (_touchable) {
			for (let i = 0; i < _touches.length; i++) {
				handleTouchUpdate(_touches.item(i), countTick)
			}
		}
		else {
			handleMouseUpdate(countTick)
		}
	}

	TouchMouseHandler.prototype.getEntitiesAtMouseTouch = function (e) {
		const x = _touchable ? e.clientX : e.x
		const y = _touchable ? e.clientY : e.y
		const { adjustX, adjustY } = _worldManager.getCameraAdjust()

		const entities = []
		getBodyAtMouseTouch(x + adjustX, y + adjustY)
			.map(body => _worldManager.getEntityByItsBody(body))
			.forEach(entity => entities.push(entity))

		return entities
	}

	function handleTouchUpdate(touch, countTick) {
		if (_worldManager.getEnableDebug() && _worldManager.getTimeStep() !== 0 && _debugTouchMouseLocation) {
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

			if (_touchJoints[touch.identifier] === undefined) {
				_touchJoints[touch.identifier] = []

				getBodyAtMouseTouch(touch.clientX + adjustX, touch.clientY + adjustY)
					.filter(body => body.GetUserData().draggable)
					.forEach(body => _touchJoints[touch.identifier].push(createMouseJoint(body, touch.clientX + adjustX, touch.clientY + adjustY)))
			}

			_touchJoints[touch.identifier].forEach(touchJoint => touchJoint.SetTarget(
				new box2d.b2Vec2(
					(touch.clientX + adjustX) / _worldManager.getScale(),
					(touch.clientY + adjustY) / _worldManager.getScale()
				)
			))
		}
	}

	function handleMouseUpdate(countTick) {
		if (_worldManager.getEnableDebug() && _worldManager.getTimeStep() !== 0 && _debugTouchMouseLocation) {
			drawMouseLocation()
		}

		if (_mouse.down) {
			const screenButton = downOnScreenButton(_mouse.x, _mouse.y)
			if (screenButton !== null) {
				if (!screenButton.isButtonDown) {
					screenButton.isButtonDown = true
					if (screenButton.onMouseDown !== undefined) {
						screenButton.onMouseDown(_mouse.event)
					}
				}
				else if (screenButton.keepPressed && countTick % _worldManager.getTickMod() === 0) {
					screenButton.onMouseDown(_mouse.event)
				}
			}
			else if (_enableDrag && _mouse.onEntity) {
				const { adjustX, adjustY } = _worldManager.getCameraAdjust()

				if (_mouseJoints.length === 0) {
					getBodyAtMouseTouch(_mouse.x + adjustX, _mouse.y + adjustY)
						.filter(body => body.GetUserData().draggable)
						.forEach(body => _mouseJoints.push(createMouseJoint(body, _mouse.x + adjustX, _mouse.y + adjustY)))
				}

				_mouseJoints.forEach(mouseJoint => mouseJoint.SetTarget(
					new box2d.b2Vec2(
						(_mouse.x + adjustX) / _worldManager.getScale(),
						(_mouse.y + adjustY) / _worldManager.getScale()
					)
				))
			}
		}
	}

	function onTouchStart(e) {
		e.preventDefault()
		_touches = e.touches

		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches.item(i)
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
				if (_userOnTouchStart !== undefined) {
					_userOnTouchStart(touch)
				}
			}
		}
	}

	function onTouchMove(e) {
		e.preventDefault()
		_touches = e.touches

		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches.item(i)
			const screenButton = downOnScreenButton(touch.clientX, touch.clientY)

			_screenButtons
				.filter(sb => sb.isButtonDown && sb !== screenButton)
				.forEach(sb => {
					sb.touchId = undefined
					sb.isButtonDown = false
					if (sb.onMouseUp !== undefined) {
						sb.onMouseUp(touch)
					}
				})

			if (screenButton === null) {
				if (_sliceHandler !== undefined && _enableSlice) {
					_sliceHandler.onTouchMove(touch)
				}
				if (_userOnTouchMove !== undefined) {
					_userOnTouchMove(touch)
				}
			}
		}
	}

	function onTouchEnd(e) {
		e.preventDefault()
		_touches = e.touches

		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches.item(i)
			_touchesDownOnEntity[touch.identifier] = false

			let touchOnScreenButton = false
			_screenButtons
				.filter(sb => sb.touchId === touch.identifier)
				.forEach(sb => {
					touchOnScreenButton = true
					sb.isButtonDown = false
					sb.touchId = undefined
					if (sb.onMouseUp !== undefined) {
						sb.onMouseUp(touch)
					}
				})

			if (!touchOnScreenButton) {
				if (_sliceHandler !== undefined && _enableSlice) {
					_sliceHandler.onTouchEnd(touch)
				}
				if (_userOnTouchEnd !== undefined) {
					_userOnTouchEnd(touch)
				}
			}

			if (_touchJoints[touch.identifier]) {
				_touchJoints[touch.identifier].forEach(touchJoint => _worldManager.getWorld().DestroyJoint(touchJoint))
				delete _touchJoints[touch.identifier]
			}
		}
	}

	function onMouseDown(e) {
		e.preventDefault()
		_mouse.event = e
		_mouse.down = true

		const screenButton = downOnScreenButton(_mouse.x, _mouse.y)
		if (screenButton === null) {
			const { adjustX, adjustY } = _worldManager.getCameraAdjust()

			const bodies = getBodyAtMouseTouch(_mouse.x + adjustX, _mouse.y + adjustY)
			if (bodies.length > 0) {
				_mouse.onEntity = true
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
		_mouse.x = e.x - _canvasPosition.x
		_mouse.y = e.y - _canvasPosition.y

		const screenButton = downOnScreenButton(_mouse.x, _mouse.y)

		_screenButtons
			.filter(sb => sb.isButtonDown && sb !== screenButton)
			.forEach(sb => {
				sb.isButtonDown = false
				if (sb.onMouseUp !== undefined) {
					sb.onMouseUp(e)
				}
			})

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

		_mouse.event = undefined
		_mouse.down = false
		_mouse.onEntity = false

		let mouseOnScreenButton = false
		_screenButtons
			.filter(sb => sb.isButtonDown)
			.forEach(sb => {
				mouseOnScreenButton = true
				sb.isButtonDown = false
				if (sb.onMouseUp !== undefined) {
					sb.onMouseUp(e)
				}
			})

		if (!mouseOnScreenButton) {
			if (_sliceHandler !== undefined && _enableSlice) {
				_sliceHandler.onMouseUp(e)
			}
			if (_userOnMouseUp) {
				_userOnMouseUp(e)
			}
		}

		if (_mouseJoints.length > 0) {
			_mouseJoints.forEach(mouseJoint => _worldManager.getWorld().DestroyJoint(mouseJoint))
			_mouseJoints = []
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

		body.SetAwake(true)
		return _worldManager.getWorld().CreateJoint(md)
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
		const x = _mouse.x
		const y = _mouse.y
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

	function getElementPosition(element) {
		let elem = element, tagname = "", x = 0, y = 0
	
		while (typeof elem === 'object' && typeof elem.tagName !== 'undefined') {
			y += elem.offsetTop
			x += elem.offsetLeft
			tagname = elem.tagName.toUpperCase()
			if (tagname === "BODY") {
				elem = 0
			}
			if (typeof elem === 'object' && typeof elem.offsetParent === 'object') {
				elem = elem.offsetParent
			}
		}
		return { x, y }
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The TouchMouseHandler details must be an object!")
			}
			for (let def in details) {
				if (_validTouchMouseHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validTouchMouseHandlerDef)
				}
			}

			if (details.enableDrag !== undefined && typeof details.enableDrag !== 'boolean') {
				throw new Error(arguments.callee.name + " : enableDrag must be a true/false!")
			}
			if (details.enableSlice !== undefined && typeof details.enableSlice !== 'boolean') {
				throw new Error(arguments.callee.name + " : enableSlice must be a true/false!")
			}
			if (details.debugTouchMouseLocation !== undefined && typeof details.debugTouchMouseLocation !== 'boolean') {
				throw new Error(arguments.callee.name + " : debugTouchMouseLocation must be a true/false!")
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

			if (details.ontouchstart !== undefined && typeof details.ontouchstart !== 'function') {
				throw new Error(arguments.callee.name + " : ontouchstart must be a function!")
			}
			if (details.ontouchmove !== undefined && typeof details.ontouchmove !== 'function') {
				throw new Error(arguments.callee.name + " : ontouchmove must be a function!")
			}
			if (details.ontouchend !== undefined && typeof details.ontouchend !== 'function') {
				throw new Error(arguments.callee.name + " : ontouchend must be a function!")
			}
		}
	}

})()