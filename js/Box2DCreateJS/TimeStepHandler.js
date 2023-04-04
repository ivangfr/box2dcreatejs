this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.TimeStepHandler = TimeStepHandler

	function TimeStepHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validTimeStepHandlerDef = ['layer']
	const _validTimeStepHandlerLayerDef = ['x', 'y', 'angle', 'shape', 'circleOpts', 'boxOpts', 'polygonOpts', 'render']
	const _validTimeStepHandlerShapeDef = ['circle', 'box', 'polygon']
	const _validTimeStepHandlerCircleOptsDef = ['radius']
	const _validTimeStepHandlerBoxOptsDef = ['width', 'height']
	const _validTimeStepHandlerPolygonOptsDef = ['points']

	let _worldManager
	let _easeljsCanvas, _easeljsStage
	let _normalFPS, _actualFPS

	function initialize(timeStepHandler, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager
		_easeljsCanvas = worldManager.getEaseljsCanvas()
		_easeljsStage = worldManager.getEaseljsStage()
		_normalFPS = _actualFPS = worldManager.getFPS()

		timeStepHandler.view = createView(details)

		timeStepHandler.isPaused = function () {
			return createjs.Ticker.paused
		}

		timeStepHandler.pause = function () {
			worldManager.setTimeStep(0)
			createjs.Ticker.paused = true

			if (timeStepHandler.view) {
				const { adjustX, adjustY } = _worldManager.getCameraAdjust()
				timeStepHandler.view.x += adjustX
				timeStepHandler.view.y += adjustY

				_easeljsStage.addChild(timeStepHandler.view)
				_easeljsStage.update()
			}
		}

		timeStepHandler.play = function () {
			worldManager.setTimeStep(1 / _actualFPS)
			createjs.Ticker.paused = false

			if (timeStepHandler.view) {
				const { adjustX, adjustY } = _worldManager.getCameraAdjust()
				timeStepHandler.view.x -= adjustX
				timeStepHandler.view.y -= adjustY

				_easeljsStage.removeChild(timeStepHandler.view)
			}
		}

		timeStepHandler.setFPS = function (fps) {
			_actualFPS = fps
			worldManager.setFPS(fps)
			worldManager.setTimeStep(1 / fps)
			createjs.Ticker.framerate = fps
			setSpriteSheetFrequency(fps)
		}
		timeStepHandler.getFPS = function () {
			return _actualFPS
		}

		timeStepHandler.restoreFPS = function () {
			timeStepHandler.setFPS(_normalFPS)
		}
	}

	function createView(details) {
		const defaultValues = {
			layer: {
				x: _easeljsCanvas.width / 2,
				y: _easeljsCanvas.height / 2,
				angle: 0,
				shape: 'box',
				boxOpts: {
					width: _easeljsCanvas.width,
					height: _easeljsCanvas.height
				},
				render: {
					type: 'draw',
					opacity: 0.5,
					drawOpts: {
						bgColorStyle: 'solid',
						textOpts: {
							text: 'Paused',
							font: 'bold 38px Verdana',
							color: 'white'
						}
					}
				}
			}
		}

		const timeStepHandlerDetails = defaultValues
		if (details && details.layer) {
			if (details.layer.x !== undefined) {
				timeStepHandlerDetails.layer.x = details.layer.x
			}
			if (details.layer.y !== undefined) {
				timeStepHandlerDetails.layer.y = details.layer.y
			}
			if (details.layer.angle !== undefined) {
				timeStepHandlerDetails.layer.angle = details.layer.angle
			}
			if (details.layer.shape !== undefined) {
				timeStepHandlerDetails.layer.shape = details.layer.shape
			}
			if (details.layer.circleOpts !== undefined) {
				timeStepHandlerDetails.layer.circleOpts = details.layer.circleOpts
			}
			if (details.layer.boxOpts !== undefined) {
				timeStepHandlerDetails.layer.boxOpts = details.layer.boxOpts
			}
			if (details.layer.polygonOpts !== undefined) {
				timeStepHandlerDetails.layer.polygonOpts = details.layer.polygonOpts
			}
			if (details.layer.render !== undefined) {
				timeStepHandlerDetails.layer.render = details.layer.render
			}
		}

		const positionShape = {}
		positionShape.x = timeStepHandlerDetails.layer.x
		positionShape.y = timeStepHandlerDetails.layer.y
		positionShape.angle = timeStepHandlerDetails.layer.angle
		positionShape.shape = timeStepHandlerDetails.layer.shape
		positionShape.circleOpts = timeStepHandlerDetails.layer.circleOpts
		positionShape.boxOpts = timeStepHandlerDetails.layer.boxOpts
		positionShape.polygonOpts = timeStepHandlerDetails.layer.polygonOpts

		return Box2DCreateJS.Render.createView(_worldManager, positionShape, timeStepHandlerDetails.layer.render)
	}

	function setSpriteSheetFrequency(fps) {
		_worldManager.getEntities()
			.filter(entity => entity.b2body.view && entity.b2body.view.type === "spritesheet")
			.map(entity => entity.b2body.view.spriteSheet)
			.forEach(spriteSheet => {
				spriteSheet.animations
					.map(name => spriteSheet.getAnimation(name))
					.forEach(animation => {
						animation.speed = (fps === _normalFPS) ? animation.speed0 : animation.speed0 * _normalFPS / fps
					})
			})
	}

	function validate(worldManager, details) {		
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The TimeStepHandler details must be informed!")
			}
			for (let def in details) {
				if (_validTimeStepHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for TimeStepHandler is not supported! Valid definitions: " + _validTimeStepHandlerDef)
				}
			}

			if (details.layer) {
				for (let def in details.layer) {
					if (_validTimeStepHandlerLayerDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for layer is not supported! Valid definitions: " + _validTimeStepHandlerLayerDef)
					}
				}
				if (details.layer.x !== undefined && typeof details.layer.x !== 'number') {
					throw new Error(arguments.callee.name + " : layer.x must be a number!")
				}
				if (details.layer.y !== undefined && typeof details.layer.y !== 'number') {
					throw new Error(arguments.callee.name + " : layer.y must be a number!")
				}
				if (details.layer.angle !== undefined && typeof details.layer.angle !== 'number') {
					throw new Error(arguments.callee.name + " : layer.angle must be a number!")
				}
				if (details.layer.shape !== undefined) {
					if (_validTimeStepHandlerShapeDef.indexOf(details.layer.shape) < 0) {
						throw new Error(arguments.callee.name + " : layer.shape must be " + _validTimeStepHandlerShapeDef)
					}
					if (details.layer.shape === 'circle') {
						if (details.layer.circleOpts === undefined) {
							throw new Error(arguments.callee.name + " : layer.circleOpts must be informed!")
						}
						if (typeof details.layer.circleOpts !== 'object') {
							throw new Error(arguments.callee.name + " : layer.circleOpts must be an object!")
						}
						for (let def in details.layer.circleOpts) {
							if (_validTimeStepHandlerCircleOptsDef.indexOf(def) < 0) {
								throw new Error(arguments.callee.name + " : the detail (" + def + ") for layer.circleOpts is not supported! Valid definitions: " + _validTimeStepHandlerCircleOptsDef)
							}
						}
						if (details.layer.circleOpts.radius === undefined) {
							throw new Error(arguments.callee.name + " : layer.circleOpts.radius must be informed!")
						}
						if (typeof details.layer.circleOpts.radius !== 'number') {
							throw new Error(arguments.callee.name + " : layer.circleOpts.radius must be a number!")
						}
					}
					else if (details.layer.shape === 'box') {
						if (details.layer.boxOpts === undefined) {
							throw new Error(arguments.callee.name + " : layer.boxOpts must be informed!")
						}
						if (typeof details.layer.boxOpts !== 'object') {
							throw new Error(arguments.callee.name + " : layer.boxOpts must be an object!")
						}
						for (let def in details.layer.boxOpts) {
							if (_validTimeStepHandlerBoxOptsDef.indexOf(def) < 0) {
								throw new Error(arguments.callee.name + " : the detail (" + def + ") for layer.boxOpts is not supported! Valid definitions: " + _validTimeStepHandlerBoxOptsDef)
							}
						}
						if (details.layer.boxOpts.width === undefined) {
							throw new Error(arguments.callee.name + " : layer.boxOpts.width be informed!")
						}
						if (typeof details.layer.boxOpts.width !== 'number') {
							throw new Error(arguments.callee.name + " : layer.boxOpts.width must be a number!")
						}
						if (details.layer.boxOpts.height === undefined) {
							throw new Error(arguments.callee.name + " : layer.boxOpts.height be informed!")
						}
						if (typeof details.layer.boxOpts.height !== 'number') {
							throw new Error(arguments.callee.name + " : layer.boxOpts.height must be a number!")
						}
					}
					else if (details.layer.shape === 'polygon') {
						if (details.layer.polygonOpts === undefined) {
							throw new Error(arguments.callee.name + " : layer.polygonOpts must be informed!")
						}
						if (typeof details.layer.polygonOpts !== 'object') {
							throw new Error(arguments.callee.name + " : layer.polygonOpts must be an object!")
						}
						for (let def in details.layer.polygonOpts) {
							if (_validTimeStepHandlerPolygonOptsDef.indexOf(def) < 0) {
								throw new Error(arguments.callee.name + " : the detail (" + def + ") for layer.polygonOpts is not supported! Valid definitions: " + _validTimeStepHandlerPolygonOptsDef)
							}
						}
						if (details.layer.polygonOpts.points === undefined) {
							throw new Error(arguments.callee.name + " : layer.polygonOpts.points be informed!")
						}
						if (!(details.layer.polygonOpts.points instanceof Array)) {
							throw new Error(arguments.callee.name + " : layer.polygonOpts.points must be an Array!")
						}
						if (details.layer.polygonOpts.points.length < 3) {
							throw new Error(arguments.callee.name + " : layer.polygonOpts.points array must have at least 3 points!")
						}
						for (let i = 0; i < details.layer.polygonOpts.points.length; i++) {
							const point = details.layer.polygonOpts.points[i]
							if (!(point instanceof Object)) {
								throw new Error(arguments.callee.name + " : points elemtent must be an Object!")
							}
							if (point.x === undefined) {
								throw new Error(arguments.callee.name + " : points[i].x must be informed!")
							}
							else if (typeof point.x !== 'number') {
								throw new Error(arguments.callee.name + " : points[i].x must be a number!")
							}
							if (point.y === undefined) {
								throw new Error(arguments.callee.name + " : points[i].y must be informed!")
							}
							else if (typeof point.y !== 'number') {
								throw new Error(arguments.callee.name + " : points[i].y must be a number!")
							}
						}
					}
				}
				if (details.layer.render !== undefined && typeof details.layer.render !== 'object') {
					throw new Error(arguments.callee.name + " : layer.render must be an object!")
				}
			}
		}
	}

})()