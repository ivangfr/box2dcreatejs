this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	let _worldManager

	function MyApp() {
		this.initialize()
	}

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_worldManager = new Box2DCreateJS.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			fpsIndicator: {
				enabled: true,
				color: 'black'
			},
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				loadingIndicatorOpts: { color: 'black' },
				files: ['../../images/background.jpg'],
				onComplete: testPerformance
			}
		})
	}

	Box2DCreateJS.MyApp = MyApp

	function testPerformance() {

		createLandscape()
		createWorldLimits()

		const balls = createBalls(250)

		_worldManager.createKeyboardHandler({
			keyboardHint: {
				enabled: true,
				color: 'black'
			},
			keys: {
				a: { onkeydown: () => _worldManager.getZoomHandler().zoomIn() },
				s: { onkeydown: () => _worldManager.getZoomHandler().zoomOut() },
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				f: {
					onkeydown: () => {
						const screenHandler = _worldManager.getScreenHandler()
						screenHandler.isFullScreen() ? screenHandler.showNormalCanvasSize() : screenHandler.showFullScreen()
					}
				},
				1: { onkeydown: () => balls.forEach(ball => ball.changeScale(1.1)) },
				2: { onkeydown: () => balls.forEach(ball => ball.changeScale(0.9)) }
			}
		})

		_worldManager.createTouchMouseHandler()
		_worldManager.createZoomHandler()
		_worldManager.createScreenHandler()
	}

	function createLandscape() {
		const greyScaleFilter = new createjs.ColorMatrixFilter([
			0.33, 0.33, 0.33, 0, 0, // red
			0.33, 0.33, 0.33, 0, 0, // green
			0.33, 0.33, 0.33, 0, 0, // blue
			0, 0, 0, 1, 0  // alpha
		])

		_worldManager.createLandscape({
			x: 490, y: 250,
			shape: 'box',
			boxOpts: {
				width: 980,
				height: 500,
			},
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/background.jpg',
					adjustImageSize: true
				},
				filters: [greyScaleFilter]
			}
		})
	}

	function createWorldLimits() {
		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 750, y: 100,
			shape: 'box',
			boxOpts: { width: 5, height: 260 },
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 880, y: 280, angle: -15,
			shape: 'box',
			boxOpts: { width: 200, height: 5 },
			render: staticRender
		})
	}

	function createBalls(number) {
		const balls = []
		for (let i = 0; i < number; i++) {
			const ball = _worldManager.createEntity({
				type: 'dynamic',
				x: 980 - (Math.random() * 200),
				y: Math.random() * 150,
				shape: 'circle',
				circleOpts: { radius: 7 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'radialGradient',
						borderWidth: 2,
						cache: true,
					},
				},
				fixtureDefOpts: { restitution: 0.5 }
			})
			balls.push(ball)
		}
		return balls
	}

}())