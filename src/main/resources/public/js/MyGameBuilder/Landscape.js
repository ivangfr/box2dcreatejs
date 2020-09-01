this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.Landscape = Landscape;

	function Landscape(worldManager, details) {
		initialize(this, worldManager, details);
	}

	var _validLandscapeDef = ['x', 'y', 'angle', 'shape', 'circleOpts', 'boxOpts', 'polygonOpts', 'render'];

	var _validLandscapeShapeDef = ['circle', 'box', 'polygon'];

	var _validLandscapeCircleOptsDef = ['radius'];
	var _validLandscapeBoxOptsDef = ['width', 'height'];
	var _validLandscapePolygonOptsDef = ['points'];

	var _worldManager;

	function initialize(landscape, worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;

		if (details.x === undefined)
			details.x = 0;

		if (details.y === undefined)
			details.y = 0;

		if (details.angle === undefined)
			details.angle = 0;

		var positionShape = {};
		positionShape.x = details.x;
		positionShape.y = details.y;
		positionShape.angle = details.angle;
		positionShape.shape = details.shape;
		positionShape.circleOpts = details.circleOpts;
		positionShape.boxOpts = details.boxOpts;
		positionShape.polygonOpts = details.polygonOpts;

		if (details.render.z === undefined)
			details.render.z = worldManager.getLandscapes().length;

		landscape.view = MyGameBuilder.Render.createView(worldManager, positionShape, details.render);

		worldManager.getEaseljsStage().addChildAt(landscape.view, details.render.z);
	}

	Landscape.prototype.changeRender = function (render) {
		_worldManager.getEaseljsStage().removeChild(this.view);

		var positionShape = {};
		positionShape.x = this.view.x;
		positionShape.y = this.view.y;
		positionShape.angle = this.view.angle;
		positionShape.shape = this.view.shape;
		positionShape.circleOpts = this.view.circleOpts;
		positionShape.boxOpts = this.view.boxOpts;
		positionShape.polygonOpts = this.view.polygonOpts;

		this.view = MyGameBuilder.Render.createView(_worldManager, positionShape, render);

		_worldManager.getEaseljsStage().addChildAt(this.view, this.view.z);
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (typeof details != 'object')
			throw new Error(arguments.callee.name + " : The Landscape details must be informed!");

		for (var def in details)
			if (_validLandscapeDef.indexOf(def) < 0)
				throw new Error(arguments.callee.name + " : the detail (" + def + ") for Landscape is not supported! Valid definitions: " + _validLandscapeDef);

		if (details.x !== undefined && typeof details.x != 'number')
			throw new Error(arguments.callee.name + " : x must be a number!");

		if (details.y !== undefined && typeof details.y != 'number')
			throw new Error(arguments.callee.name + " : y must be a number!");

		if (details.angle !== undefined && typeof details.angle != 'number')
			throw new Error(arguments.callee.name + " : angle must be a number!");

		if (details.shape === undefined)
			throw new Error(arguments.callee.name + " : shape must be informed!");
		else if (_validLandscapeShapeDef.indexOf(details.shape) < 0)
			throw new Error(arguments.callee.name + " : shape must be " + _validLandscapeShapeDef);
		else {
			if (details.shape === 'circle') {
				if (details.circleOpts === undefined)
					throw new Error(arguments.callee.name + " : circleOpts must be informed!");
				else if (typeof details.circleOpts !== 'object')
					throw new Error(arguments.callee.name + " : circleOpts must be an object!");

				for (var def in details.circleOpts)
					if (_validLandscapeCircleOptsDef.indexOf(def) < 0)
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for circleOpts is not supported! Valid definitions: " + _validLandscapeCircleOptsDef);

				if (details.circleOpts.radius === undefined)
					throw new Error(arguments.callee.name + " : circleOpts.radius must be informed!");
				else if (typeof details.circleOpts.radius != 'number')
					throw new Error(arguments.callee.name + " : circleOpts.radius must be a number!");
			}
			else if (details.shape === 'box') {
				if (details.boxOpts === undefined)
					throw new Error(arguments.callee.name + " : boxOpts must be informed!");
				else if (typeof details.boxOpts !== 'object')
					throw new Error(arguments.callee.name + " : boxOpts must be an object!");

				for (var def in details.boxOpts)
					if (_validLandscapeBoxOptsDef.indexOf(def) < 0)
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for boxOpts is not supported! Valid definitions: " + _validLandscapeBoxOptsDef);

				if (details.boxOpts.width === undefined)
					throw new Error(arguments.callee.name + " : boxOpts.width be informed!");
				else if (typeof details.boxOpts.width != 'number')
					throw new Error(arguments.callee.name + " : boxOpts.width must be a number!");

				if (details.boxOpts.height === undefined)
					throw new Error(arguments.callee.name + " : boxOpts.height be informed!");
				else if (typeof details.boxOpts.height != 'number')
					throw new Error(arguments.callee.name + " : boxOpts.height must be a number!");
			}
			else if (details.shape === 'polygon') {
				if (details.polygonOpts === undefined)
					throw new Error(arguments.callee.name + " : polygonOpts must be informed!");
				else if (typeof details.polygonOpts !== 'object')
					throw new Error(arguments.callee.name + " : polygonOpts must be an object!");

				for (var def in details.polygonOpts)
					if (_validLandscapePolygonOptsDef.indexOf(def) < 0)
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for polygonOpts is not supported! Valid definitions: " + _validLandscapePolygonOptsDef);

				if (details.polygonOpts.points === undefined)
					throw new Error(arguments.callee.name + " : polygonOpts.points be informed!");
				else if (!(details.polygonOpts.points instanceof Array))
					throw new Error(arguments.callee.name + " : polygonOpts.points must be an Array!");
				else if (details.polygonOpts.points.length < 3)
					throw new Error(arguments.callee.name + " : polygonOpts.points array must have at least 3 points!");
				else {
					for (var i = 0; i < details.polygonOpts.points.length; i++) {
						var point = details.polygonOpts.points[i];
						if (!(point instanceof Object))
							throw new Error(arguments.callee.name + " : points elemtent must be an Object!");

						if (point.x === undefined)
							throw new Error(arguments.callee.name + " : points[i].x must be informed!");
						else if (typeof point.x != 'number')
							throw new Error(arguments.callee.name + " : points[i].x must be a number!");

						if (point.y === undefined)
							throw new Error(arguments.callee.name + " : points[i].y must be informed!");
						else if (typeof point.y != 'number')
							throw new Error(arguments.callee.name + " : points[i].y must be a number!");
					}
				}
			}
		}

		if (details.render === undefined)
			throw new Error(arguments.callee.name + " : render must be informed!");
		else if (typeof details.render != 'object')
			throw new Error(arguments.callee.name + " : render must be an object!");
	}

})();