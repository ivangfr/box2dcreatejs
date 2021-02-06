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
			enableDebug: false,
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				files: [
					'../../images/ball.png',
					'../../images/box.jpg',
				],
				onComplete: testButtonPressed
			}
		})
	}

	function testButtonPressed() {
		createWorldLimits()
		createBalls(200)

		_worldManager.createScreenButton({
			x: 810, y: 478,
			shape: 'box',
			boxOpts: { width: 100, height: 35 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: { text: 'Button 1' },
					borderWidth: 2,
					borderColor: 'white',
					borderRadius: 10
				}
			},
			onmousedown: () => createSoccerBall(),
			keepPressed: true
		})

		_worldManager.createScreenButton({
			x: 920, y: 478,
			shape: 'box',
			boxOpts: { width: 100, height: 35 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: { text: 'Button 2' },
					borderWidth: 2,
					borderColor: 'white',
					borderRadius: 10
				}
			},
			onmousedown: () => createBox()
		})

		const touchMouseHandler = _worldManager.createTouchMouseHandler({
			pointerRadius: 20,
			pointerAccurate: false,
			debugTouchMouseLocation: true
		})

		_worldManager.createKeyboardHandler({
			keyboardHint: { enabled: true },
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				1: { // 1
					onkeydown: () => createSoccerBall(),
					keepPressed: true
				},
				2: { onkeydown: () => createBox() },
				a: {
					onkeydown: () => touchMouseHandler.setPointerAccurate(!touchMouseHandler.getPointerAccurate())
				}
			}
		})
	}

	function createWorldLimits() {
		const staticReander = {
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
			render: staticReander
		})

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticReander
		})

		_worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticReander
		})

		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticReander
		})
	}

	function createBalls(number) {
		for (let i = 0; i < number; i++) {
			_worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 960 + 10,
				y: Math.random() * 400 + 20,
				shape: 'circle',
				circleOpts: { radius: 10 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'white' },
						borderWidth: 2
					}
				},
				fixtureDefOpts: { restitution: 0.5 },
			})
		}
	}

	function createSoccerBall() {
		const ball = _worldManager.createEntity({
			type: 'dynamic',
			x: 50, y: 100,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/ball.png',
					adjustImageSize: true
				}
			},
			bodyDefOpts: { angularVelocity: 150 }
		})
		ball.b2body.ApplyImpulse(new box2d.b2Vec2(50, 0), ball.b2body.GetWorldCenter())
	}

	function createBox() {
		const box = _worldManager.createEntity({
			type: 'dynamic',
			x: 50, y: 100, angle: 25,
			shape: 'box',
			boxOpts: { width: 40, height: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/box.jpg',
					adjustImageSize: true
				}
			},
			bodyDefOpts: { angularVelocity: 150 }
		})
		box.b2body.ApplyImpulse(new box2d.b2Vec2(50, 0), box.b2body.GetWorldCenter())
	}

}())