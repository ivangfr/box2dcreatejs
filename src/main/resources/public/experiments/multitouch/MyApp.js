this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	let worldManager

	function MyApp() {
		this.initialize()
	}

	MyGameBuilder.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: true,
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
					'../../images/explosion.png',
					'../../images/leftarrow.png',
					'../../images/rightarrow.png'
				],
				onComplete: testMultiTouch
			}
		})
	}

	function testMultiTouch() {

		createWorldLimits()

		worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' }
				}
			}
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 500, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' }
				}
			}
		})

		const explosive = worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
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

		worldManager.createMultiTouchHandler({
			drawLocation: true,
			onmousedown: function () {
				document.getElementById("output").innerHTML = 'MOUSEDOWN'
			},
			onmouseup: function () {
				document.getElementById("output").innerHTML = 'MOUSEUP'
			}
		})

		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			}
		})

		const explodeRender1 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				textOpts: { text: 'Explode' },
				borderWidth: 2,
				borderColor: 'white',
				borderRadius: 10
			}
		}

		const explodeRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				textOpts: { text: 'Explode', color: 'black' },
				borderWidth: 2,
				borderColor: 'white',
				borderRadius: 10
			}
		}

		const explodeBtn = worldManager.createScreenButton({
			x: 57, y: 477,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: explodeRender1,
			onmousedown: function () {
				explosive.b2body.view.gotoAndPlay("explode")
				document.getElementById("output").innerHTML = 'DOWN'
				explodeBtn.changeRender(explodeRender2)
			},
			onmouseup: function () {
				document.getElementById("output").innerHTML = 'UP'
				explodeBtn.changeRender(explodeRender1)
			}
		})

		worldManager.createScreenButton({
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
				explosive.b2body.ApplyForce(new box2d.b2Vec2(-600, 0), explosive.b2body.GetWorldCenter())
			},
			keepPressed: true
		})

		worldManager.createScreenButton({
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
				explosive.b2body.ApplyForce(new box2d.b2Vec2(600, 0), explosive.b2body.GetWorldCenter())
			},
			keepPressed: true
		})

		const bo = worldManager.createBrowserOSHandler()
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

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 450,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticRender
		})

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticRender
		})

		worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})
	}

}())