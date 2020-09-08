this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.ZoomHandler = ZoomHandler

	function ZoomHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validZoomHandlerDef = ['max', 'min', 'step']

	let _worldManager

	function initialize(zoomHandler, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		const max = (details && details.max !== undefined) ? details.max : 2.0
		zoomHandler.getMax = function () { return max }

		const min = (details && details.min !== undefined) ? details.min : 0.0
		zoomHandler.getMin = function () { return min }

		const step = (details && details.step !== undefined) ? details.step : 0.05
		zoomHandler.getStep = function () { return step }

		zoomHandler.zoomIn = function () {
			const value = _worldManager.getCanvasCtxScale() + this.getStep()
			if (value <= this.getMax()) {
				zoomScale(value)
			}
		}

		zoomHandler.zoomOut = function () {
			const value = _worldManager.getCanvasCtxScale() - this.getStep()
			if (value >= this.getMin()) {
				zoomScale(value)
			}
		}

		zoomHandler.getScale = function () {
			return _worldManager.getCanvasCtxScale()
		}
	}

	function zoomScale(value) {
		_worldManager.setCanvasCtxScale(value)

		_worldManager.getBox2dCanvas().width = _worldManager.getBox2dCanvas().width // Clear box2dCanvas			
		_worldManager.getBox2dCanvasCtx().scale(value, value)

		_worldManager.getEaseljsStage().scaleX = value
		_worldManager.getEaseljsStage().scaleY = value
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : details must be an object!")
			}
			for (let def in details) {
				if (_validZoomHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validZoomHandlerDef)
				}
			}
			
			if (details.max !== undefined && (typeof details.max !== 'number' || details.max <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for max!")
			}
			if (details.min !== undefined && (typeof details.min !== 'number' || details.min <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for min!")
			}
			if (details.step !== undefined && (typeof details.step !== 'number' || details.step <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for step!")
			}
		}
	}

})()