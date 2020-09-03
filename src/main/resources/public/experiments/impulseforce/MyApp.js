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
				files: ['../../images/tire.png'],
				onComplete: testImpluseForce
			}
		})
	}

	function testImpluseForce() {
		createWorldLimits()

		const tire = worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/tire.png',
					adjustImageSize: true
				}
			}
		})

		worldManager.createMultiTouchHandler()

		let direction = 1
		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			},
			49: { // 1
				onkeydown: () => tire.getB2Body().ApplyForce(new box2d.b2Vec2(direction * 5000, 0), tire.b2body.GetWorldCenter()),
				keepPressed: true
			},
			50: { // 2
				onkeydown: () => tire.getB2Body().ApplyImpulse(new box2d.b2Vec2(direction * 500, 0), tire.b2body.GetWorldCenter())
			},
			51: { // 3
				onkeydown: () => tire.getB2Body().ApplyForce(new box2d.b2Vec2(direction * 500, 0), { x: 1, y: 1 }),
				keepPressed: true
			},
			52: { // 4
				onkeydown: () => tire.getB2Body().ApplyImpulse(new box2d.b2Vec2(direction * 50, 0), { x: 1, y: 1 })
			},
			37: { // left arrow
				onkeydown: () => direction = -1
			},
			39: { // right arrow
				onkeydown: ()  => direction = 1
			}
		})
	}

	function createWorldLimits() {
		const renderStatic = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: renderStatic
		})

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: renderStatic
		})

		worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: renderStatic
		})

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: renderStatic
		})
	}

}())