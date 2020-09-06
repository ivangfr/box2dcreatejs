this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	let _worldManager

	function MyApp() {
		this.initialize()
	}

	MyGameBuilder.MyApp = MyApp

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
				files: [
					'../../images/runningGrant.png',
					'../../images/explosion.png',
					'../../images/leftarrow.png',
					'../../images/rightarrow.png'
				],
				onComplete: testSpriteSheet
			}
		})
	}

	function testSpriteSheet() {
		createWorldLimits()

		const boy = _worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'box',
			boxOpts: { width: 60, height: 90 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/runningGrant.png'],
						animations: { 'run': [0, 25], 'jump': [26, 63, 'run'] },
						frames: { 'height': 292.5, 'width': 165.75 }
					},
					startAnimation: 'run',
					adjustImageSize: true
				},
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { friction: 0.2 }
		})

		const ball = _worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/explosion.png'],
						animations: { 'normal': [0], 'explode': [1, 47, 'normal'] },
						frames: { 'height': 256, 'width': 256 }
					},
					startAnimation: 'normal'
				}
			},
			bodyDefOpts: { fixedRotation: true }
		})

		_worldManager.createMultiTouchHandler()

		_worldManager.createScreenHandler()

		const timeStepHandler = _worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: { bgColorStyle: 'solid' },
					opacity: 0.3
				}
			}
		})

		_worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender())
			},
			80: { // p
				onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause()
			},
			79: { // o
				onkeydown: () => timeStepHandler.getFPS() === 980 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(980)
			},
			70: { // f
				onkeydown: () => {
					const screenHandler = _worldManager.getScreenHandler()
					screenHandler.isFullScreen() ? screenHandler.showNormalCanvasSize() : screenHandler.showFullScreen()
				}
			},
			65: { // a
				onkeydown: () => ball.b2body.view.gotoAndPlay("explode")
			},
			37: { // left arrow
				onkeydown: () => boy.b2body.ApplyForce(new box2d.b2Vec2(-500, 0), boy.b2body.GetWorldCenter()),
				keepPressed: true
			},
			38: { // up arrow
				onkeydown: () => boy.b2body.view.gotoAndPlay("jump")
			},
			39: { // right arrow
				onkeydown: () => boy.b2body.ApplyForce(new box2d.b2Vec2(500, 0), boy.b2body.GetWorldCenter()),
				keepPressed: true
			}
		})

		_worldManager.createScreenButton({
			x: 57, y: 477,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: { text: 'Explode' },
					borderWidth: 2,
					borderColor: 'white',
					borderRadius: 10
				}
			},
			onmousedown: function () {
				ball.b2body.view.gotoAndPlay("explode")
			}
		})

		_worldManager.createScreenButton({
			x: 830, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/leftarrow.png',
					adjustImageSize: true
				}
			},
			onmousedown: function () {
				boy.b2body.ApplyForce(new box2d.b2Vec2(-500, 0), boy.b2body.GetWorldCenter())
			},
			keepPressed: true
		})

		_worldManager.createScreenButton({
			x: 930, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/rightarrow.png',
					adjustImageSize: true
				}
			},
			onmousedown: function () {
				boy.b2body.ApplyForce(new box2d.b2Vec2(500, 0), boy.b2body.GetWorldCenter())
			},
			keepPressed: true
		})

		const bo = _worldManager.createBrowserOSHandler()
		const text = bo.getBrowserName() + ' ' + bo.getBrowserVersion() + ', ' + bo.getOS()
		document.getElementById("browser_os").innerHTML = text
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
			x: 490, y: 450,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
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
	}

}())