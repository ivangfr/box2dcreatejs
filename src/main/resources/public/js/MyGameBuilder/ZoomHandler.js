this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.ZoomHandler = ZoomHandler;

	function ZoomHandler(worldManager, details) {
		initialize(this, worldManager, details);
	}

	var _validZoomHandlerDef = ['max', 'min', 'step'];

	var _worldManager;

	function initialize(zoomHandler, worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;

		var max = 2.0
		if (details && details.max !== undefined)
			max = details.max;
		zoomHandler.getMax = function () {
			return max;
		}

		var min = 0.0
		if (details && details.min !== undefined)
			min = details.min;
		zoomHandler.getMin = function () {
			return min;
		}

		var step = 0.05
		if (details && details.step !== undefined)
			step = details.step;
		zoomHandler.getStep = function () {
			return step;
		}

		zoomHandler.zoomIn = function () {
			var value = _worldManager.getCanvasCtxScale() + this.getStep();
			if (value <= this.getMax())
				zoomScale(value);
		}

		zoomHandler.zoomOut = function () {
			var value = _worldManager.getCanvasCtxScale() - this.getStep();
			if (value >= this.getMin())
				zoomScale(value);
		}

		zoomHandler.getScale = function () {
			return _worldManager.getCanvasCtxScale();
		}
	}

	function zoomScale(value) {
		_worldManager.setCanvasCtxScale(value);

		_worldManager.getBox2dCanvas().width = _worldManager.getBox2dCanvas().width; //Clear box2dCanvas			
		_worldManager.getBox2dCanvasCtx().scale(value, value);

		_worldManager.getEaseljsStage().scaleX = value;
		_worldManager.getEaseljsStage().scaleY = value;
	}

	function validate(worldManager, details) {
		var def;

		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details !== undefined) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : details must be an object!");

			for (def in details)
				if (_validZoomHandlerDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validZoomHandlerDef);

			if (details.max !== undefined && (typeof details.max != 'number' || details.max <= 0))
				throw new Error(arguments.callee.name + " : invalid value for max!");

			if (details.min !== undefined && (typeof details.min != 'number' || details.min <= 0))
				throw new Error(arguments.callee.name + " : invalid value for min!");

			if (details.step !== undefined && (typeof details.step != 'number' || details.step <= 0))
				throw new Error(arguments.callee.name + " : invalid value for step!");
		}
	}

})();