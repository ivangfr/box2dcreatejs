this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	let _worldManager

	function MyApp() {
		this.initialize()
	}

	Box2DCreateJS.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_worldManager = new Box2DCreateJS.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: true,
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				files: [
					'../../images/explosion.png',
					'../../images/arrow_left.png',
					'../../images/arrow_right.png'
				],
				onComplete: testMultiTouch
			}
		})
	}

	function testMultiTouch() {

		createWorldLimits()

		_worldManager.createEntity({
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
			},
			fixtureDefOpts: { restitution: 0.3 }
		})

		_worldManager.createEntity({
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
			},
			fixtureDefOpts: { restitution: 0.3 }
		})

		const explosive = _worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/explosion.png'],
						animations: {
							normal: 0,
							explode: [1, 47, 'normal']
						},
						frames: { width: 256, height: 256 }
					},
					startAnimation: 'normal'
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { restitution: 0.3 }
		})

		_worldManager.createTouchMouseHandler({
			debugTouchMouseLocation: true,
			onmousedown: () => document.getElementById("output").innerHTML = 'MOUSEDOWN',
			onmouseup: () => document.getElementById("output").innerHTML = 'MOUSEUP',
			ontouchstart: () => document.getElementById("output").innerHTML = 'TOUCHSTART',
			ontouchend: () => document.getElementById("output").innerHTML = 'TOUCHEND',
		})

		_worldManager.createKeyboardHandler({
			keyboardHint: { enabled: true },
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) }
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

		const explodeBtn = _worldManager.createScreenButton({
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

		_worldManager.createScreenButton({
			x: 830, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_left.png',
					adjustImageSize: true
				}
			},
			onmousedown: function () {
				explosive.b2body.ApplyForce(new box2d.b2Vec2(-600, 0), explosive.b2body.GetWorldCenter())
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
					image: '../../images/arrow_right.png',
					adjustImageSize: true
				}
			},
			onmousedown: function () {
				explosive.b2body.ApplyForce(new box2d.b2Vec2(600, 0), explosive.b2body.GetWorldCenter())
			},
			keepPressed: true
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