this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.MultiTouchHandler = MultiTouchHandler;

	function MultiTouchHandler(worldManager, details) {
		initialize(worldManager, details);
	}

	var _validMultiTouchHandlerDef = ['enableDrag', 'drawLocation', 'radius', 'accurate', 'onmousedown', 'onmouseup', 'onmousemove', 'enableSlice', 'sliceOpts'];

	var _worldManager;

	var _enableDrag;
	MultiTouchHandler.prototype.getEnableDrag = function () {
		return _enableDrag;
	}
	MultiTouchHandler.prototype.setEnableDrag = function (value) {
		_enableDrag = value;
	}

	var _enableSlice;
	MultiTouchHandler.prototype.getEnableSlice = function () {
		return _enableSlice;
	}
	MultiTouchHandler.prototype.setEnableSlice = function (value) {
		_enableSlice = value;
		if (_sliceHandler === undefined)
			_sliceHandler = new MyGameBuilder.SliceHandler(_worldManager, _sliceOpts);
	}

	var _sliceHandler;
	MultiTouchHandler.prototype.getSliceHandler = function () {
		return _sliceHandler;
	}

	var _mouseEvent, _mouseX, _mouseY, _isMouseDown;
	MultiTouchHandler.prototype.isMouseDown = function () {
		return _isMouseDown;
	}

	var _userOnMouseDown, _userOnMouseUp, _userOnMouseMove, _sliceOpts;

	var _canvasPosition;

	var _screenButtons;

	var _selectedBodies, _mousePVec, _mouseRadius, _halfSquare, _mouseDownOnEntity, _mouseAccurate, _drawLocation, _mouseJoint;

	var _touches, _touchesJoint, _touchesDownOnEntity;

	var _touchable = 'createTouch' in document;
	MultiTouchHandler.prototype.isTouchable = function () {
		return _touchable;
	}

	function initialize(worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;
		_screenButtons = worldManager.getScreenButtons();

		var canvas = worldManager.getBox2dCanvas();
		_canvasPosition = getElementPosition(canvas);

		_enableDrag = true;
		if (details && details.enableDrag !== undefined)
			_enableDrag = details.enableDrag;

		if (details && details.sliceOpts !== undefined)
			_sliceOpts = details.sliceOpts;

		_enableSlice = false;
		if (details && details.enableSlice !== undefined)
			_enableSlice = details.enableSlice;
		if (_enableSlice)
			_sliceHandler = new MyGameBuilder.SliceHandler(worldManager, _sliceOpts);

		_drawLocation = false;
		if (details && details.drawLocation !== undefined)
			_drawLocation = details.drawLocation;

		_mouseRadius = _halfSquare = 1.0 / worldManager.getScale();
		if (details && details.radius !== undefined) {
			_mouseRadius = details.radius / worldManager.getScale();
			_halfSquare = Math.sqrt((details.radius * details.radius) / 2) / worldManager.getScale();
		}

		_mouseAccurate = true;
		if (details && details.accurate !== undefined)
			_mouseAccurate = details.accurate;

		if (details && details.onmousedown !== undefined)
			_userOnMouseDown = details.onmousedown;

		if (details && details.onmouseup !== undefined)
			_userOnMouseUp = details.onmouseup;

		if (details && details.onmousemove !== undefined)
			_userOnMouseMove = details.onmousemove;

		if (_touchable) {
			canvas.addEventListener('touchstart', onTouchStart, true);
			canvas.addEventListener('touchmove', onTouchMove, true);
			canvas.addEventListener('touchend', onTouchEnd, true);
		}
		else {
			canvas.addEventListener('mousedown', onMouseDown, true);
			canvas.addEventListener('mousemove', onMouseMove, true);
			canvas.addEventListener('mouseup', onMouseUp, true);
		}

		_mouseDownOnEntity = false;

		_mouseJoint = [];

		_touches = [];
		_touchesJoint = {};
		_touchesDownOnEntity = {};
	}

	MultiTouchHandler.prototype.update = function (countTick) {
		if (_touchable) {
			for (var i = 0; i < _touches.length; i++) {
				var touch = _touches[i];

				if (_drawLocation)
					drawDebugTouch(touch);

				var screenButton = downOnScreenButton(touch.clientX, touch.clientY);
				if (screenButton != null) {
					if (screenButton.touchId == undefined) {
						screenButton.isButtonDown = true;
						screenButton.touchId = touch.identifier;
						if (screenButton.onMouseDown !== undefined)
							screenButton.onMouseDown(touch);
					}
					else if (touch.identifier == screenButton.touchId &&
						screenButton.keepPressed &&
						screenButton.isButtonDown &&
						screenButton.onMouseDown !== undefined &&
						countTick % _worldManager.getTickMod() == 0)
						screenButton.onMouseDown(touch);
				}
				else if (_enableDrag && _touchesDownOnEntity[touch.identifier]) {
					var player = _worldManager.getPlayer();
					var adjustX = 0, adjustY = 0;
					if (player) {
						adjustX = player.getCameraAdjust().adjustX;
						adjustY = player.getCameraAdjust().adjustY;
					}

					if (_touchesJoint[touch.identifier] === undefined) {
						_touchesJoint[touch.identifier] = [];

						var bodies = getBodyAtMouseTouch(touch.clientX + adjustX, touch.clientY + adjustY);

						for (var j = 0; j < bodies.length; j++) {
							var body = bodies[j];
							if (body.GetUserData().draggable)
								_touchesJoint[touch.identifier].push(createMouseJoint(body, touch.clientX + adjustX, touch.clientY + adjustY));
						}
					}
					if (_touchesJoint[touch.identifier].length > 0) {
						for (var j = 0; j < _touchesJoint[touch.identifier].length; j++)
							_touchesJoint[touch.identifier][j].SetTarget(new box2d.b2Vec2(
								(touch.clientX + adjustX) / _worldManager.getScale(),
								(touch.clientY + adjustY) / _worldManager.getScale()));
					}
				}
			}
		}
		else {
			if (_drawLocation)
				drawDebugMouse();

			if (_isMouseDown) {
				var screenButton = downOnScreenButton(_mouseX, _mouseY);
				if (screenButton != null) {
					if (!screenButton.isButtonDown) {
						screenButton.isButtonDown = true;
						if (screenButton.onMouseDown !== undefined)
							screenButton.onMouseDown(_mouseEvent);
					}
					else if (screenButton.keepPressed && countTick % _worldManager.getTickMod() == 0)
						screenButton.onMouseDown(_mouseEvent);
				}
				else if (_enableDrag && _mouseDownOnEntity) {
					var player = _worldManager.getPlayer();
					var adjustX = 0, adjustY = 0;
					if (player) {
						adjustX = player.getCameraAdjust().adjustX;
						adjustY = player.getCameraAdjust().adjustY;
					}

					if (_mouseJoint.length == 0) {
						var bodies = getBodyAtMouseTouch(_mouseX + adjustX, _mouseY + adjustY);

						for (var i = 0; i < bodies.length; i++) {
							var body = bodies[i];
							if (body.GetUserData().draggable)
								_mouseJoint.push(createMouseJoint(body, _mouseX + adjustX, _mouseY + adjustY));
						}
					}

					if (_mouseJoint.length > 0) {
						for (var i = 0; i < _mouseJoint.length; i++)
							_mouseJoint[i].SetTarget(
								new box2d.b2Vec2(
									(_mouseX + adjustX) / _worldManager.getScale(),
									(_mouseY + adjustY) / _worldManager.getScale()));
					}
				}
			}
		}
	}

	MultiTouchHandler.prototype.getEntitiesAtMouseTouch = function (e) {
		var x, y;
		if (_touchable) {
			x = e.clientX;
			y = e.clientY;
		}
		else {
			x = e.x;
			y = e.y;
		}

		var player = _worldManager.getPlayer();
		var adjustX = 0, adjustY = 0;
		if (player) {
			adjustX = player.getCameraAdjust().adjustX;
			adjustY = player.getCameraAdjust().adjustY;
		}

		var bodies = getBodyAtMouseTouch(x + adjustX, y + adjustY);

		var entities = [];
		for (var i = 0; i < bodies.length; i++) {
			var entity = _worldManager.getEntityByItsBody(bodies[i]);
			entities.push(entity);
		}

		return entities;
	}

	function onTouchStart(e) {
		e.preventDefault();
		_touches = e.touches;

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i];
			var screenButton = downOnScreenButton(touch.clientX, touch.clientY);

			if (screenButton == null) {

				var player = _worldManager.getPlayer();
				var adjustX = 0, adjustY = 0;
				if (player) {
					adjustX = player.getCameraAdjust().adjustX;
					adjustY = player.getCameraAdjust().adjustY;
				}

				var bodies = getBodyAtMouseTouch(touch.clientX + adjustX, touch.clientY + adjustY);

				if (bodies.length > 0)
					_touchesDownOnEntity[touch.identifier] = true;
				else if (_sliceHandler !== undefined && _enableSlice)
					_sliceHandler.onTouchStart(touch);

				if (_userOnMouseDown !== undefined)
					_userOnMouseDown(touch);
			}
		}
	}

	function onTouchMove(e) {
		e.preventDefault();
		_touches = e.touches;

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i];
			var screenButton = downOnScreenButton(touch.clientX, touch.clientY);

			for (var j = 0; j < _screenButtons.length; j++) {
				var sb = _screenButtons[j];
				if (sb.isButtonDown && sb !== screenButton) {
					sb.touchId = undefined;
					sb.isButtonDown = false;
					if (sb.onMouseUp !== undefined)
						sb.onMouseUp(touch);
				}
			}

			if (screenButton == null) {
				if (_sliceHandler !== undefined && _enableSlice)
					_sliceHandler.onTouchMove(touch);

				if (_userOnMouseMove !== undefined)
					_userOnMouseMove(touch);
			}
		}
	}

	function onTouchEnd(e) {
		e.preventDefault();
		_touches = e.touches;

		for (var i = 0; i < e.changedTouches.length; i++) {
			var touch = e.changedTouches[i];
			_touchesDownOnEntity[touch.identifier] = false;

			var touchOnScreenButton = false;
			for (var j = 0; j < _screenButtons.length; j++) {
				var screenButton = _screenButtons[j];

				if (screenButton.touchId == touch.identifier) {
					touchOnScreenButton = true;

					screenButton.isButtonDown = false;
					screenButton.touchId = undefined;
					if (screenButton.onMouseUp !== undefined)
						screenButton.onMouseUp(touch);
				}
			}

			if (!touchOnScreenButton) {
				if (_sliceHandler !== undefined && _enableSlice)
					_sliceHandler.onTouchEnd(touch);

				if (_userOnMouseUp !== undefined)
					_userOnMouseUp(touch);
			}

			for (var p in _touchesJoint) {
				if (p == touch.identifier) {
					for (var j = 0; j < _touchesJoint[p].length; j++)
						_worldManager.getWorld().DestroyJoint(_touchesJoint[p][j]);
					delete _touchesJoint[p];
				}
			}
		}
	}

	function onMouseDown(e) {
		e.preventDefault();

		_mouseEvent = e;
		_isMouseDown = true;

		var screenButton = downOnScreenButton(_mouseX, _mouseY);
		if (screenButton == null) {

			var player = _worldManager.getPlayer();
			var adjustX = 0, adjustY = 0;
			if (player) {
				adjustX = player.getCameraAdjust().adjustX;
				adjustY = player.getCameraAdjust().adjustY;
			}

			var bodies = getBodyAtMouseTouch(_mouseX + adjustX, _mouseY + adjustY);

			if (bodies.length > 0)
				_mouseDownOnEntity = true;
			else if (_sliceHandler !== undefined && _enableSlice)
				_sliceHandler.onMouseDown(e);

			if (_userOnMouseDown !== undefined)
				_userOnMouseDown(e);
		}

	}

	function onMouseMove(e) {
		e.preventDefault();

		_mouseX = e.x - _canvasPosition.x;
		_mouseY = e.y - _canvasPosition.y;

		var screenButton = downOnScreenButton(_mouseX, _mouseY);

		for (var i = 0; i < _screenButtons.length; i++) {
			var sb = _screenButtons[i];
			if (sb.isButtonDown && sb !== screenButton) {
				sb.isButtonDown = false;
				if (sb.onMouseUp !== undefined)
					sb.onMouseUp(e);
			}
		}

		if (screenButton == null) {
			if (_sliceHandler !== undefined && _enableSlice)
				_sliceHandler.onMouseMove(e);

			if (_userOnMouseMove !== undefined)
				_userOnMouseMove(e);
		}
	}

	function onMouseUp(e) {
		e.preventDefault();

		_mouseEvent = undefined;
		_isMouseDown = false;
		_mouseDownOnEntity = false;

		var mouseOnScreenButton = false;
		for (var i = 0; i < _screenButtons.length; i++) {
			var screenButton = _screenButtons[i];

			if (screenButton.isButtonDown) {
				mouseOnScreenButton = true;

				screenButton.isButtonDown = false;
				if (screenButton.onMouseUp !== undefined)
					screenButton.onMouseUp(e);
			}
		}

		if (!mouseOnScreenButton) {
			if (_sliceHandler !== undefined && _enableSlice)
				_sliceHandler.onMouseUp(e);

			if (_userOnMouseUp)
				_userOnMouseUp(e);
		}

		if (_mouseJoint.length > 0) {
			for (var i = 0; i < _mouseJoint.length; i++)
				_worldManager.getWorld().DestroyJoint(_mouseJoint[i]);
			_mouseJoint = [];
		}
	}

	function createMouseJoint(body, x, y) {
		x /= _worldManager.getScale();
		y /= _worldManager.getScale();

		var md = new box2d.b2MouseJointDef();
		md.bodyA = _worldManager.getWorld().GetGroundBody();
		md.bodyB = body;
		md.target.Set(x, y);
		md.collideConnected = true;
		md.maxForce = 300.0 * body.GetMass();
		var mouseJoint = _worldManager.getWorld().CreateJoint(md);
		body.SetAwake(true);

		return mouseJoint;
	}

	function drawDebugTouch(touch) {
		var c = _worldManager.getBox2dCanvasCtx();

		var x = touch.clientX;
		var y = touch.clientY;
		var radius = _mouseRadius * _worldManager.getScale();
		var halfSquare = _halfSquare * _worldManager.getScale();

		if (_mouseAccurate) {
			c.beginPath();
			c.lineWidth = "1";
			c.strokeStyle = "white";
			c.moveTo(x - 20, y - 20);
			c.lineTo(x + 20, y + 20);
			c.stroke();
			c.moveTo(x + 20, y - 20);
			c.lineTo(x - 20, y + 20);
			c.stroke();
		}
		else {
			c.beginPath();
			c.lineWidth = "1";
			c.strokeStyle = "white";
			c.rect(x - halfSquare, y - halfSquare, halfSquare * 2, halfSquare * 2);
			c.stroke();
		}

		c.beginPath();
		c.lineWidth = "1";
		c.strokeStyle = "cyan";
		c.arc(x, y, radius, 0, Math.PI * 2, true);
		c.stroke();

		c.beginPath();
		c.fillStyle = "white";
		c.fillText("touch id : " + touch.identifier + " x:" + x + " y:" + y, x + 30, y - 30);
	}

	function drawDebugMouse() {
		var c = _worldManager.getBox2dCanvasCtx();

		var x = _mouseX;
		var y = _mouseY;
		var radius = _mouseRadius * _worldManager.getScale();
		var halfSquare = _halfSquare * _worldManager.getScale();

		if (_mouseAccurate) {
			c.beginPath();
			c.lineWidth = "1";
			c.strokeStyle = "white";
			c.moveTo(x - 20, y - 20);
			c.lineTo(x + 20, y + 20);
			c.stroke();
			c.moveTo(x + 20, y - 20);
			c.lineTo(x - 20, y + 20);
			c.stroke();
		}
		else {
			c.beginPath();
			c.lineWidth = "1";
			c.strokeStyle = "white";
			c.rect(x - halfSquare, y - halfSquare, halfSquare * 2, halfSquare * 2);
			c.stroke();
		}

		c.beginPath();
		c.lineWidth = "1";
		c.strokeStyle = "cyan";
		c.arc(x, y, radius, 0, Math.PI * 2, true);
		c.stroke();

		c.fillStyle = "white";
		c.fillText("mouse : " + x + ", " + y, x, y);
	}

	function downOnScreenButton(x, y) {
		var screenButton = null;

		for (var i = 0; i < _worldManager.getScreenButtons().length; i++) {
			screenButton = _worldManager.getScreenButtons()[i];

			if (x >= screenButton.view.x0 - screenButton.view.dimension.width / 2 && x <= screenButton.view.x0 + screenButton.view.dimension.width / 2 &&
				y >= screenButton.view.y0 - screenButton.view.dimension.height / 2 && y <= screenButton.view.y0 + screenButton.view.dimension.height / 2)
				break;
			else
				screenButton = null;
		}

		return screenButton;
	}

	function getBodyAtMouseTouch(x, y) {
		x /= _worldManager.getScale();
		y /= _worldManager.getScale();

		_mousePVec = new box2d.b2Vec2(x, y);
		var aabb = new box2d.b2AABB();
		aabb.lowerBound.Set(x - _halfSquare, y - _halfSquare);
		aabb.upperBound.Set(x + _halfSquare, y + _halfSquare);

		// Query the world for overlapping shapes.

		_selectedBodies = [];
		_worldManager.getWorld().QueryAABB(getBodyCB, aabb);
		return _selectedBodies;
	}

	function getBodyCB(fixture) {
		if (fixture.GetBody().GetType() != box2d.b2Body.b2_staticBody) {
			if (_mouseAccurate) {
				if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), _mousePVec))
					_selectedBodies.push(fixture.GetBody());
			}
			else
				_selectedBodies.push(fixture.GetBody());
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

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details !== undefined) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : The MultiTouchHandler details must be an object!");

			for (var def in details)
				if (_validMultiTouchHandlerDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validMultiTouchHandlerDef);

			if (details.enableDrag !== undefined && typeof details.enableDrag != 'boolean')
				throw new Error(arguments.callee.name + " : enableDrag must be a true/false!");

			if (details.enableSlice !== undefined && typeof details.enableSlice != 'boolean')
				throw new Error(arguments.callee.name + " : enableSlice must be a true/false!");

			if (details.drawLocation !== undefined && typeof details.drawLocation != 'boolean')
				throw new Error(arguments.callee.name + " : drawLocation must be a true/false!");

			if (details.radius !== undefined && (typeof details.radius != 'number' || details.radius <= 0))
				throw new Error(arguments.callee.name + " : invalid value for radius!");

			if (details.accurate !== undefined && typeof details.accurate != 'boolean')
				throw new Error(arguments.callee.name + " : accurate must be a true/false!");

			if (details.onmousedown !== undefined && typeof details.onmousedown != 'function')
				throw new Error(arguments.callee.name + " : onmousedown must be a function!");

			if (details.onmouseup !== undefined && typeof details.onmouseup != 'function')
				throw new Error(arguments.callee.name + " : onmouseup must be a function!");

			if (details.onmousemove !== undefined && typeof details.onmousemove != 'function')
				throw new Error(arguments.callee.name + " : onmousemove must be a function!");
		}
	}

})();