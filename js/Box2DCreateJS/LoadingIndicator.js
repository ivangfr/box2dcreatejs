this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.LoadingIndicator = LoadingIndicator

	function LoadingIndicator(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validLoadingIndicatorDef = ['x', 'y', 'font', 'color']

	function initialize(loading, worldManager, details) {
		validate(worldManager, details)

		const x = (details && details.x !== undefined) ? details.x : worldManager.getEaseljsCanvas().width / 2
		const y = (details && details.y !== undefined) ? details.y : worldManager.getEaseljsCanvas().height / 2
		const font = (details && details.font !== undefined) ? details.font : 'bold 30px Monaco'
		const color = (details && details.color !== undefined) ? details.color : 'white'

		loading.view = new createjs.Text("--%", font, color)
		loading.view.x = x
		loading.view.y = y
		worldManager.getEaseljsStage().addChild(loading.view)
	}

	LoadingIndicator.prototype.update = function (progress) {
		this.view.text = progress + "%"
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The LoadingIndicator details must be an object!")
			}
			for (let def in details) {
				if (_validLoadingIndicatorDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for LoadingIndicator is not supported! Valid definitions: " + _validLoadingIndicatorDef)
				}
			}
			
			if (details.x !== undefined && typeof details.x !== 'number') {
				throw new Error(arguments.callee.name + " : x must be a number!")
			}
			if (details.y !== undefined && typeof details.y !== 'number') {
				throw new Error(arguments.callee.name + " : y must be a number!")
			}
			if (details.font !== undefined && typeof details.font !== 'string') {
				throw new Error(arguments.callee.name + " : font must be a string! See EaselJS documentation: https://www.createjs.com/docs/easeljs/classes/Text.html")
			}
			if (details.color !== undefined && typeof details.color !== 'string') {
				throw new Error(arguments.callee.name + " : color must be a string! See EaselJS documentation: https://www.createjs.com/docs/easeljs/classes/Text.html")
			}
		}
	}

})()