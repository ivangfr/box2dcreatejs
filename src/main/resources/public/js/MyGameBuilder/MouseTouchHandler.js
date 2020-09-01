this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.MouseTouchHandler = MouseTouchHandler;

	function MouseTouchHandler(worldManager, details) {
		initialize(worldManager, details);
	}

	var _validMouseTouchHandlerDef = ['enableDrag', 'onmousedown', 'onmouseup'];

	var _worldManager;
	var _enableDrag, _userOnMouseDown, _userOnMouseUp;

	var _mouseX, _mouseY, _mousePVec, _isMouseDown, _selectedBody, _mouseJoint;
	var _canvasPosition;

	var _screenButton;

	function initialize(worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;

		var canvas = worldManager.getBox2dCanvas();
		_canvasPosition = getElementPosition(canvas);

		_enableDrag = true;
		if (details && details.enableDrag !== undefined)
			_enableDrag = details.enableDrag;

		if (details && details.onmousedown !== undefined)
			_userOnMouseDown = details.onmousedown;

		if (details && details.onmouseup !== undefined)
			_userOnMouseUp = details.onmouseup;

		MouseAndTouch(/*document*/canvas, downHandler, upHandler, moveHandler);
	}

	MouseTouchHandler.prototype.update = function () {
		var screenButttons = _worldManager.getScreenButtons();
		for (var i = 0; i < screenButttons.length; i++) {
			var screenButton = screenButttons[i];
			if (screenButton.keepPressed && screenButton.isButtonDown)
				screenButton.onMouseDown();
		}

		if (_enableDrag) {
			drag();
		}
	}

	MouseTouchHandler.prototype.getEntityAtMouseTouch = function () {
		var entity = null;
		var body = getBodyAtMouseTouch();

		if (body != null) {
			for (var i = 0; i < _worldManager.getEntities().length; i++) {
				var entity = _worldManager.getEntities()[i];
				if (entity.getId() == body.GetUserData().id)
					break;
			}
		}

		return entity;
	}

	function downHandler(e) {
		_isMouseDown = true;

		_screenButton = downOnScreenButton(e);

		if (_screenButton != null) {
			_screenButton.isButtonDown = true;
			if (_screenButton.onMouseDown !== undefined)
				_screenButton.onMouseDown();
		}
		else {
			moveHandler(e);

			if (_userOnMouseDown) {
				_userOnMouseDown(e);
			}
		}
	}

	function upHandler(e) {
		_isMouseDown = false;
		_mouseX = undefined;
		_mouseY = undefined;

		if (_screenButton != null) {
			_screenButton.isButtonDown = false;
			if (_screenButton.onMouseUp !== undefined)
				_screenButton.onMouseUp();
			_screenButton = null;
		}
		else if (_userOnMouseUp) {
			_userOnMouseUp(e);
		}
	}

	function moveHandler(e) {
		_mouseX = (e.x - _canvasPosition.x) / _worldManager.getScale();
		_mouseY = (e.y - _canvasPosition.y) / _worldManager.getScale();
	}

	function getBodyAtMouseTouch() {
		_mousePVec = new box2d.b2Vec2(_mouseX, _mouseY);
		var aabb = new box2d.b2AABB();
		aabb.lowerBound.Set(_mouseX - 0.001, _mouseY - 0.001);
		aabb.upperBound.Set(_mouseX + 0.001, _mouseY + 0.001);

		// Query the world for overlapping shapes.

		_selectedBody = null;
		_worldManager.getWorld().QueryAABB(getBodyCB, aabb);
		return _selectedBody;
	}

	function getBodyCB(fixture) {
		if (fixture.GetBody().GetType() != box2d.b2Body.b2_staticBody) {
			if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), _mousePVec)) {
				_selectedBody = fixture.GetBody();
				return false;
			}
		}
		return true;
	}

	function getElementPosition(element) {
		var elem = element, tagname = "", x = 0, y = 0;

		while ((typeof (elem) == "object") && (typeof (elem.tagName) != "undefined")) {
			y += elem.offsetTop;
			x += elem.offsetLeft;
			tagname = elem.tagName.toUpperCase();

			if (tagname == "BODY")
				elem = 0;

			if (typeof (elem) == "object") {
				if (typeof (elem.offsetParent) == "object")
					elem = elem.offsetParent;
			}
		}

		return {
			x: x,
			y: y
		};
	}

	function drag() {
		if (_isMouseDown && (!_mouseJoint)) {
			var body = getBodyAtMouseTouch();
			if (body && body.GetUserData().draggable) {
				var md = new box2d.b2MouseJointDef();
				md.bodyA = _worldManager.getWorld().GetGroundBody();
				md.bodyB = body;
				md.target.Set(_mouseX, _mouseY);
				md.collideConnected = true;
				md.maxForce = 300.0 * body.GetMass();
				_mouseJoint = _worldManager.getWorld().CreateJoint(md);
				body.SetAwake(true);
			}
		}

		if (_mouseJoint) {
			if (_isMouseDown) {
				_mouseJoint.SetTarget(new box2d.b2Vec2(_mouseX, _mouseY));
			} else {
				_worldManager.getWorld().DestroyJoint(_mouseJoint);
				_mouseJoint = null;
			}
		}
	}

	function downOnScreenButton(e) {
		var screenButton = null;

		for (var i = 0; i < _worldManager.getScreenButtons().length; i++) {
			screenButton = _worldManager.getScreenButtons()[i];

			if (e.x >= screenButton.view.x0 && e.x <= screenButton.view.x0 + screenButton.view.width &&
				e.y >= screenButton.view.y0 && e.y <= screenButton.view.y0 + screenButton.view.height)
				break;
			else
				screenButton = null;
		}

		return screenButton;
	}

	function MouseAndTouch(dom, down, up, move) {
		var canvas = dom;
		var isDown = false;

		canvas.addEventListener("mousedown", mouseDownHandler, true);
		canvas.addEventListener("touchstart", touchDownHandler, true);

		//When drawing the "road" get mouse or touch positions
		function mouseMoveHandler(e) {
			updateFromEvent(e);
			move(e);
		}

		function updateFromEvent(e) {
			e.preventDefault();
			var touch = e.originalEvent;
			if (touch && touch.touches && touch.touches.length == 1) {
				//Prevent the default action for the touch event; scrolling
				touch.preventDefault();
				e.x = touch.touches[0].pageX;
				e.y = touch.touches[0].pageY;
			} else {
				e.x = e.pageX;
				e.y = e.pageY;
			}
		}

		function mouseUpHandler(e) {
			canvas.addEventListener("mousedown", mouseDownHandler, true);
			canvas.removeEventListener("mousemove", mouseMoveHandler, true);
			isDown = false;
			updateFromEvent(e);
			up(e);
		}

		function touchUpHandler(e) {
			canvas.addEventListener("touchstart", touchDownHandler, true);
			canvas.removeEventListener("touchmove", mouseMoveHandler, true);
			isDown = false;
			updateFromEvent(e);
			up(e);
		}

		function mouseDownHandler(e) {
			canvas.removeEventListener("mousedown", mouseDownHandler, true);
			canvas.addEventListener("mouseup", mouseUpHandler, true);
			canvas.addEventListener("mousemove", mouseMoveHandler, true);
			isDown = true;
			updateFromEvent(e);
			down(e);
		}

		function touchDownHandler(e) {
			canvas.removeEventListener("touchstart", touchDownHandler, true);
			canvas.addEventListener("touchend", touchUpHandler, true);
			canvas.addEventListener("touchmove", mouseMoveHandler, true);
			isDown = true;
			updateFromEvent(e);
			down(e);
		}

		var ret = {};
		ret.x = function () {
			return e.x;
		}
		ret.y = function () {
			return e.y;
		}
		ret.isDown = function () {
			return isDown
		}

		return ret;
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : The MouseTouchHandler details must be an object!");

			for (var def in details)
				if (_validMouseTouchHandlerDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for MouseTouchHandler is not supported! Valid definitions: " + _validMouseTouchHandlerDef);

			if (details.enableDrag !== undefined && typeof details.enableDrag != 'boolean')
				throw new Error(arguments.callee.name + " : enableDrag must be a true/false!");

			if (details.onmousedown !== undefined && typeof details.onmousedown != 'function')
				throw new Error(arguments.callee.name + " : onmousedown must be a function!");

			if (details.onmouseup !== undefined && typeof details.onmouseup != 'function')
				throw new Error(arguments.callee.name + " : onmouseup must be a function!");
		}
	}

})();