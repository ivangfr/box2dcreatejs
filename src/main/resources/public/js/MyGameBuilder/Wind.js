this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.Wind = Wind;

	function Wind(worldManager, details) {
		initialize(this, worldManager, details);
	}

	var _validWindDef = ['numRays', 'power', 'on', 'directionTo', 'width', 'height', 'adjustX', 'adjustY'];
	var _validWindDirectionToDef = ['left', 'right'];

	var _worldManager;

	function initialize(wind, worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;

		var canvas = worldManager.getBox2dCanvas();

		var numRays = 20;
		if (details && details.numRays !== undefined)
			numRays = details.numRays;
		wind.getNumRays = function () {
			return numRays;
		}

		var power = 1000;
		if (details && details.power !== undefined)
			power = details.power;
		wind.getPower = function () {
			return power
		}

		var on = true;
		if (details && details.on !== undefined)
			on = details.on;
		wind.isOn = function () {
			return on;
		}

		var directionTo = -1; //left
		if (details && details.directionTo !== undefined) {
			if (details.directionTo.toLowerCase() == 'right')
				directionTo = 1;
			else
				directionTo = -1;
		}
		wind.getDirectionTo = function () {
			return directionTo;
		}

		var width = canvas.width;
		if (details && details.width !== undefined)
			width = details.width;

		var height = canvas.width;
		if (details && details.height !== undefined)
			height = details.height;

		var adjustX = 0;
		if (details && details.adjustX !== undefined)
			adjustX = details.adjustX;

		var adjustY = 0;
		if (details && details.adjustY !== undefined)
			adjustY = details.adjustY;

		var rays = [];
		var d = height / (numRays + 1);
		for (var i = d + adjustY; i < height; i += d) {
			var xBegin, xEnd, y;
			if (directionTo == -1) {
				xBegin = (canvas.width - adjustX) / _worldManager.getScale();
				xEnd = (canvas.width - width) / _worldManager.getScale();
			}
			else {
				xBegin = adjustX / _worldManager.getScale();
				xEnd = (width + adjustX) / _worldManager.getScale();
			}
			y = i / _worldManager.getScale();

			var begin = new box2d.b2Vec2(xBegin, y);
			var end = new box2d.b2Vec2(xEnd, y);
			var ray = { begin: begin, end: end };
			rays.push(ray);
		}
		wind.getRays = function () {
			return rays;
		}

		wind.start = function () {
			on = true;
		}

		wind.stop = function () {
			on = false;
		}

		var bodiesAffectedByRay = [];
		wind.getBodiesAffectedByRay = function () {
			return bodiesAffectedByRay;
		}
		wind.clearBodiesAffectedByRay = function () {
			bodiesAffectedByRay = [];
		}
	}

	Wind.prototype.update = function (countTick) {
		if (!this.isOn())
			return;

		var rays = this.getRays();
		var directionTo = this.getDirectionTo();
		var numRays = this.getNumRays();
		var power = this.getPower();

		for (var i = 0; i < rays.length; i++) {
			var ray = rays[i];

			if (_worldManager.getEnableDebug())
				drawRay(ray);

			var wind = this;
			_worldManager.getWorld().RayCast(
				function (fixture, point, normal, fraction) {
					var rayBody = { body: fixture.GetBody(), point: point };
					wind.getBodiesAffectedByRay().push(rayBody);
				},
				ray.begin,
				ray.end
			);

			var bodiesAffectedByRay = this.getBodiesAffectedByRay();
			if (bodiesAffectedByRay.length > 0) {
				if (directionTo == -1)
					bodiesAffectedByRay.sort(compareDecrescent);
				else
					bodiesAffectedByRay.sort(compareCrescent);

				for (var j = 0; j < bodiesAffectedByRay.length; j++) {
					var body = bodiesAffectedByRay[j].body;

					if (body.GetType() == box2d.b2Body.b2_staticBody)
						break;

					var point = bodiesAffectedByRay[j].point;
					if (countTick % _worldManager.getTickMod() == 0) {
						var force = new box2d.b2Vec2(directionTo * power / numRays, 0);
						body.ApplyForce(force, point);
					}

					if (_worldManager.getEnableDebug())
						drawPointToPoint(ray.begin, point);
				}
				this.clearBodiesAffectedByRay();
			}
		}
	}

	function compareDecrescent(a, b) {
		if (a.point.x > b.point.x)
			return -1;
		if (a.point.x < b.point.x)
			return 1;
		return 0;
	}

	function compareCrescent(a, b) {
		if (a.point.x < b.point.x)
			return -1;
		if (a.point.x > b.point.x)
			return 1;
		return 0;
	}

	function drawRay(ray) {
		var c = _worldManager.getBox2dCanvasCtx();

		c.beginPath();
		c.lineWidth = "1";
		c.strokeStyle = "#bbb";
		c.moveTo(ray.begin.x * _worldManager.getScale(), ray.begin.y * _worldManager.getScale());
		c.lineTo(ray.end.x * _worldManager.getScale(), ray.end.y * _worldManager.getScale());
		c.stroke();
	}

	function drawPointToPoint(p1, p2) {
		var c = _worldManager.getBox2dCanvasCtx();

		c.beginPath();
		c.lineWidth = "1";
		c.strokeStyle = "white";
		c.moveTo(p1.x * _worldManager.getScale(), p1.y * _worldManager.getScale());
		c.lineTo(p2.x * _worldManager.getScale(), p2.y * _worldManager.getScale());
		c.stroke();
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details !== undefined) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : The Wind details must be an object!");

			for (var def in details)
				if (_validWindDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Wind is not supported! Valid definitions: " + _validWindDef);

			if (details.numRays !== undefined && (typeof details.numRays != 'number' || details.numRays <= 0))
				throw new Error(arguments.callee.name + " : invalid value for numRays!");

			if (details.power !== undefined && (typeof details.power != 'number' || details.power <= 0))
				throw new Error(arguments.callee.name + " : invalid value for power!");

			if (details.on !== undefined && typeof details.on != 'boolean')
				throw new Error(arguments.callee.name + " : on must be true/false!");

			if (details.directionTo !== undefined) {
				if (typeof details.directionTo != 'string')
					throw new Error(arguments.callee.name + " : directionTo must be a string!");
				else if (_validWindDirectionToDef.indexOf(details.directionTo.toLowerCase()) < 0)
					throw new Error(arguments.callee.name + " : directionTo must be " + _validWindDirectionToDef);
			}

			if (details.width !== undefined && (typeof details.width != 'number' || details.width <= 0))
				throw new Error(arguments.callee.name + " : invalid value for width!");

			if (details.height !== undefined && (typeof details.height != 'number' || details.height <= 0))
				throw new Error(arguments.callee.name + " : invalid value for height!");

			if (details.adjustX !== undefined && typeof details.adjustX != 'number')
				throw new Error(arguments.callee.name + " : adjustX must be a number!");

			if (details.adjustY !== undefined && typeof details.adjustY != 'number')
				throw new Error(arguments.callee.name + " : adjustY must be a number!");
		}
	}

})();