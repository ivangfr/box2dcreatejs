this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	
	let _worldManager

	function MyApp() {
		this.initialize()
	}

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			showFPSIndicator: true,
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				showLoadingIndicator: true,
				loadingIndicatorOpts: {
					x: 420,
					y: 210,
					font: 'bold italic 30px Verdana',
					color: 'white'
				},
				files: ['../../images/background.jpg'],
				onComplete: testPerformance
			}
		})
	}

	MyGameBuilder.MyApp = MyApp

	function testPerformance() {

		createLandscape()
		createWorldLimits()

		const balls = createBalls(250)

		_worldManager.createKeyboardHandler({
			65: { // a
				onkeydown: () => _worldManager.getZoomHandler().zoomIn()
			},
			83: { // s
				onkeydown: () => _worldManager.getZoomHandler().zoomOut()
			},
			68: { // d
				onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender())
			},
			70: {
				onkeydown: () => {
					const screenHandler = _worldManager.getScreenHandler()
					screenHandler.isFullScreen() ? screenHandler.showNormalCanvasSize() : screenHandler.showFullScreen()
				}
			},
			49: { // 1
				onkeydown: () => balls.forEach(ball => ball.changeScale(1.1))
			},
			50: { // 2
				onkeydown: () => balls.forEach(ball => ball.changeScale(0.9))
			}
		})

		_worldManager.createMultiTouchHandler()
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
				}
			})
			balls.push(ball)
		}
		return balls
	}

}())