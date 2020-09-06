this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.Camera = Camera

	function Camera(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validCameraDef = ['xAxisOn', 'yAxisOn', 'adjustX', 'adjustY']

	function initialize(camera, worldManager, details) {
		validate(worldManager, details)

		let adjustX = (details && details.adjustX !== undefined) ? details.adjustX : 0
		camera.getAdjustX = function () { return adjustX }
		camera.setAdjustX = function (value) { adjustX = value }

		let adjustY = (details && details.adjustY !== undefined) ? details.adjustY : 0
		camera.getAdjustY = function () { return adjustY }
		camera.setAdjustY = function (value) { adjustY = value }

		let xAxisOn = (details && details.xAxisOn !== undefined) ? details.xAxisOn : false
		camera.getXAxisOn = function () { return xAxisOn }
		camera.setXAxisOn = function (value) { xAxisOn = value }

		let yAxisOn = (details && details.yAxisOn !== undefined) ? details.yAxisOn : false
		camera.getYAxisOn = function () { return yAxisOn }
		camera.setYAxisOn = function (value) { yAxisOn = value }
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The Camera details must be an object!")
			}
			for (let def in details) {
				if (_validCameraDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the details (" + def + ") is not supported! Valid definitions: " + _validCameraDef)
				}
			}
			if (details.xAxisOn !== undefined && typeof details.xAxisOn !== 'boolean') {
				throw new Error(arguments.callee.name + " : xAxisOn must be a true/false!")
			}
			if (details.yAxisOn !== undefined && typeof details.yAxisOn !== 'boolean') {
				throw new Error(arguments.callee.name + " : yAxisOn must be a true/false!")
			}
			if (details.adjustX !== undefined && typeof details.adjustX !== 'number') {
				throw new Error(arguments.callee.name + " : adjustX must be a number!")
			}
			if (details.adjustY !== undefined && typeof details.adjustY !== 'number') {
				throw new Error(arguments.callee.name + " : adjustY must be a number!")
			}
		}
	}

})()