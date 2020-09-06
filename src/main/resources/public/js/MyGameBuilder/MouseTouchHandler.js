this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.MouseTouchHandler = MouseTouchHandler

	function MouseTouchHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validMouseTouchHandlerDef = ['enableDrag', 'onmousedown', 'onmouseup']

	let _worldManager
	let _enableDrag, _userOnMouseDown, _userOnMouseUp
	let _mouseX, _mouseY, _mousePVec, _isMouseDown, _selectedBody, _mouseJoint
	let _canvasPosition
	let _screenButton

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		const box2dCanvas = worldManager.getBox2dCanvas()
		_canvasPosition = getElementPosition(box2dCanvas)

		_enableDrag = (details && details.enableDrag !== undefined) ? details.enableDrag : true

		if (details && details.onmousedown !== undefined) {
			_userOnMouseDown = details.onmousedown
		}
		if (details && details.onmouseup !== undefined) {
			_userOnMouseUp = details.onmouseup
		}

		MouseAndTouch(canvas, downHandler, upHandler, moveHandler)
	}

	MouseTouchHandler.prototype.update = function () {
		_worldManager.getScreenButtons().forEach(screenButton => {
			if (screenButton.keepPressed && screenButton.isButtonDown) {
				screenButton.onMouseDown()
			}
		})

		if (_enableDrag) {
			drag()
		}
	}

	MouseTouchHandler.prototype.getEntityAtMouseTouch = function () {
		const body = getBodyAtMouseTouch()
		let entity = null
		if (body !== null) {
			for (let i = 0; i < _worldManager.getEntities().length; i++) {
				entity = _worldManager.getEntities()[i]
				if (entity.getId() === body.GetUserData().id) {
					break
				}
			}
		}
		return entity
	}

	function downHandler(e) {
		_isMouseDown = true
		_screenButton = downOnScreenButton(e)

		if (_screenButton !== null) {
			_screenButton.isButtonDown = true
			if (_screenButton.onMouseDown !== undefined) {
				_screenButton.onMouseDown()
			}
		}
		else {
			moveHandler(e)
			if (_userOnMouseDown) {
				_userOnMouseDown(e)
			}
		}
	}

	function upHandler(e) {
		_isMouseDown = false
		_mouseX = undefined
		_mouseY = undefined

		if (_screenButton !== null) {
			_screenButton.isButtonDown = false
			if (_screenButton.onMouseUp !== undefined) {
				_screenButton.onMouseUp()
			}
			_screenButton = null
		}
		else if (_userOnMouseUp) {
			_userOnMouseUp(e)
		}
	}

	function moveHandler(e) {
		_mouseX = (e.x - _canvasPosition.x) / _worldManager.getScale()
		_mouseY = (e.y - _canvasPosition.y) / _worldManager.getScale()
	}

	function getBodyAtMouseTouch() {
		_mousePVec = new box2d.b2Vec2(_mouseX, _mouseY)

		const aabb = new box2d.b2AABB()
		aabb.lowerBound.Set(_mouseX - 0.001, _mouseY - 0.001)
		aabb.upperBound.Set(_mouseX + 0.001, _mouseY + 0.001)

		// Query the world for overlapping shapes.
		_selectedBody = null
		_worldManager.getWorld().QueryAABB(getBodyCB, aabb)
		return _selectedBody
	}

	function getBodyCB(fixture) {
		const fixtureBody = fixture.GetBody()
		if (fixtureBody.GetType() !== box2d.b2Body.b2_staticBody) {
			if (fixture.GetShape().TestPoint(fixtureBody.GetTransform(), _mousePVec)) {
				_selectedBody = fixtureBody
				return false
			}
		}
		return true
	}

	function drag() {
		const world = _worldManager.getWorld()

		if (_isMouseDown && (!_mouseJoint)) {
			const body = getBodyAtMouseTouch()
			if (body && body.GetUserData().draggable) {
				const md = new box2d.b2MouseJointDef()
				md.bodyA = world.GetGroundBody()
				md.bodyB = body
				md.target.Set(_mouseX, _mouseY)
				md.collideConnected = true
				md.maxForce = 300.0 * body.GetMass()
				_mouseJoint = world.CreateJoint(md)
				body.SetAwake(true)
			}
		}

		if (_mouseJoint) {
			if (_isMouseDown) {
				_mouseJoint.SetTarget(new box2d.b2Vec2(_mouseX, _mouseY))
			} else {
				world.DestroyJoint(_mouseJoint)
				_mouseJoint = null
			}
		}
	}

	function downOnScreenButton(e) {
		let screenButton = null
		for (let i = 0; i < _worldManager.getScreenButtons().length; i++) {
			screenButton = _worldManager.getScreenButtons()[i]
			if (e.x >= screenButton.view.x0 && e.x <= screenButton.view.x0 + screenButton.view.width &&
				e.y >= screenButton.view.y0 && e.y <= screenButton.view.y0 + screenButton.view.height) {
				break
			}
		}
		return screenButton
	}

	function MouseAndTouch(dom, down, up, move) {
		const canvas = dom
		let isDown = false

		canvas.addEventListener("mousedown", mouseDownHandler, true)
		canvas.addEventListener("touchstart", touchDownHandler, true)

		//When drawing the "road" get mouse or touch positions
		function mouseMoveHandler(e) {
			updateFromEvent(e)
			move(e)
		}

		function updateFromEvent(e) {
			e.preventDefault()
			const touch = e.originalEvent
			if (touch && touch.touches && touch.touches.length === 1) {
				//Prevent the default action for the touch event scrolling
				touch.preventDefault()
				e.x = touch.touches[0].pageX
				e.y = touch.touches[0].pageY
			} else {
				e.x = e.pageX
				e.y = e.pageY
			}
		}

		function mouseUpHandler(e) {
			canvas.addEventListener("mousedown", mouseDownHandler, true)
			canvas.removeEventListener("mousemove", mouseMoveHandler, true)
			isDown = false
			updateFromEvent(e)
			up(e)
		}

		function touchUpHandler(e) {
			canvas.addEventListener("touchstart", touchDownHandler, true)
			canvas.removeEventListener("touchmove", mouseMoveHandler, true)
			isDown = false
			updateFromEvent(e)
			up(e)
		}

		function mouseDownHandler(e) {
			canvas.removeEventListener("mousedown", mouseDownHandler, true)
			canvas.addEventListener("mouseup", mouseUpHandler, true)
			canvas.addEventListener("mousemove", mouseMoveHandler, true)
			isDown = true
			updateFromEvent(e)
			down(e)
		}

		function touchDownHandler(e) {
			canvas.removeEventListener("touchstart", touchDownHandler, true)
			canvas.addEventListener("touchend", touchUpHandler, true)
			canvas.addEventListener("touchmove", mouseMoveHandler, true)
			isDown = true
			updateFromEvent(e)
			down(e)
		}

		const ret = {}
		ret.x = function () { return e.x }
		ret.y = function () { return e.y }
		ret.isDown = function () { return isDown }
		return ret
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The MouseTouchHandler details must be an object!")
			}
			for (let def in details) {
				if (_validMouseTouchHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for MouseTouchHandler is not supported! Valid definitions: " + _validMouseTouchHandlerDef)
				}
			}

			if (details.enableDrag !== undefined && typeof details.enableDrag !== 'boolean') {
				throw new Error(arguments.callee.name + " : enableDrag must be a true/false!")
			}
			if (details.onmousedown !== undefined && typeof details.onmousedown !== 'function') {
				throw new Error(arguments.callee.name + " : onmousedown must be a function!")
			}
			if (details.onmouseup !== undefined && typeof details.onmouseup !== 'function') {
				throw new Error(arguments.callee.name + " : onmouseup must be a function!")
			}
		}
	}

})()