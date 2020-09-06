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
				],
				onComplete: testButtonPressed
			}
		})
	}

	function testButtonPressed() {
		createWorldLimits()
		createSmallBalls(250)

		worldManager.createScreenButton({
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

		worldManager.createScreenButton({
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
			onmousedown: () => createSoccerBall()
		})

		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			},
			49: { // 1
				onkeydown: () => createSoccerBall(),
				keepPressed: true
			},
			50: { // 2
				onkeydown: () => createSoccerBall()
			}
		})

		const multiTouchHandler = worldManager.createMultiTouchHandler({
			pointerRadius: 20,
			pointerAccurate: false,
			drawPointerLocation: true,
			onmousedown: function (e) {
				multiTouchHandler.getEntitiesAtMouseTouch(e)
					.forEach(entity => worldManager.deleteEntity(entity))
			},
			onmousemove: function (e) {
				const x = e.x || e.clientX
				const y = e.y || e.clientY
				document.getElementById("output").innerHTML = x + ':' + y

				if (!multiTouchHandler.isTouchable() && !multiTouchHandler.isMouseDown()) {
					return
				}
				multiTouchHandler.getEntitiesAtMouseTouch(e)
					.forEach(entity => worldManager.deleteEntity(entity))
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

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 450,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticReander
		})

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticReander
		})

		worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticReander
		})

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticReander
		})
	}

	function createSmallBalls(number) {
		for (let i = 0; i < number; i++) {
			worldManager.createEntity({
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
		const ball = worldManager.createEntity({
			type: 'dynamic',
			x: 50, y: 100,
			shape: 'circle',
			circleOpts: { radius: 25 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/ball.png',
					adjustImageSize: true
				}
			}
		})
		ball.b2body.ApplyImpulse(new box2d.b2Vec2(-300, 0), ball.b2body.GetWorldCenter())
	}

}())