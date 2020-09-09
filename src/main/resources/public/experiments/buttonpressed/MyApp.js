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
					'../../images/leftarrow.png',
					'../../images/rightarrow.png',
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

		_worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender())
			},
			49: { // 1
				onkeydown: () => createSoccerBall(),
				keepPressed: true
			},
			50: { // 2
				onkeydown: () => createBox()
			},
			65: { // a
				onkeydown: () => {
					const pointerAccurate = _worldManager.getMultiTouchHandler().getPointerAccurate()
					_worldManager.getMultiTouchHandler().setPointerAccurate(!pointerAccurate)
				}
			}
		})

		const multiTouchHandler = _worldManager.createMultiTouchHandler({
			pointerRadius: 20,
			pointerAccurate: false,
			drawPointerLocation: true
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
				}
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