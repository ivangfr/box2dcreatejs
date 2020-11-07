this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.ScreenHandler = ScreenHandler

	function ScreenHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validScreenHandlerDef = ['fullScreen']

	let _easeljsCanvas, _box2dCanvas

	function initialize(screenHandler, worldManager, details) {
		validate(worldManager, details)

		_easeljsCanvas = worldManager.getEaseljsCanvas()
		_box2dCanvas = worldManager.getBox2dCanvas()

		let fullScreen = (details && details.fullScreen !== undefined) ? details.fullScreen : false
		screenHandler.isFullScreen = function () { return fullScreen }

		screenHandler.showFullScreen = function () {
			fullScreen = true
			enableCss3Transition(true)

			onResizeHandle()
			window.onresize = function () {
				onResizeHandle()
			}
		}

		screenHandler.showNormalCanvasSize = function () {
			fullScreen = false

			_easeljsCanvas.style.width = _easeljsCanvas.width + "px"
			_easeljsCanvas.style.height = _easeljsCanvas.height + "px"

			_box2dCanvas.style.width = _box2dCanvas.width + "px"
			_box2dCanvas.style.height = _box2dCanvas.height + "px"

			enableCss3Transition(true)
			window.removeEventListener('resize', onResizeHandle, false)
		}
	}

	function getScreenDimension() {
		const w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0]
		const x = w.innerWidth || e.clientWidth || g.clientWidth
		const y = w.innerHeight || e.clientHeight || g.clientHeight
		return { width: x, height: y }
	}

	function onResizeHandle() {
		const screen = getScreenDimension()
		const gameWidth = screen.width
		const gameHeight = screen.height
		const scaleToFitX = gameWidth / _box2dCanvas.width
		const scaleToFitY = gameHeight / _box2dCanvas.height
		const currentScreenRatio = gameWidth / gameHeight
		const optimalRatio = Math.min(scaleToFitX, scaleToFitY)

		if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) {
			_easeljsCanvas.style.width = gameWidth + "px"
			_easeljsCanvas.style.height = gameHeight + "px"

			_box2dCanvas.style.width = gameWidth + "px"
			_box2dCanvas.style.height = gameHeight + "px"
		}
		else {
			_easeljsCanvas.style.width = _easeljsCanvas.width * optimalRatio + "px"
			_easeljsCanvas.style.height = _easeljsCanvas.height * optimalRatio + "px"

			_box2dCanvas.style.width = _box2dCanvas.width * optimalRatio + "px"
			_box2dCanvas.style.height = _box2dCanvas.height * optimalRatio + "px"
		}
	}

	function enableCss3Transition(value) {
		if (value) {
			document.getElementsByTagName('body')[0].style.overflow = 'hidden'
			_easeljsCanvas.style.transitionProperty = _box2dCanvas.style.transitionProperty = 'all'
			_easeljsCanvas.style.transitionDuration = _box2dCanvas.style.transitionDuration = '1s'
			_easeljsCanvas.style.transitionTimingFunction = _box2dCanvas.style.transitionTimingFunction = 'ease'
		}
		else {
			document.getElementsByTagName('body')[0].style.overflow = 'auto'
			_easeljsCanvas.style.transitionProperty = _box2dCanvas.style.transitionProperty = ''
			_easeljsCanvas.style.transitionDuration = _box2dCanvas.style.transitionDuration = ''
			_easeljsCanvas.style.transitionTimingFunction = _box2dCanvas.style.transitionTimingFunction = ''
		}
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}
		
		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : details must be an object!")
			}
			for (let def in details) {
				if (_validScreenHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validScreenHandlerDef)
				}
			}
			if (details.fullScreen !== undefined && typeof details.fullScreen !== 'boolean') {
				throw new Error(arguments.callee.name + " : fullScreen must be a true/false!")
			}
		}
	}

})()