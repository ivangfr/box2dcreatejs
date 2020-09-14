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
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				files: ['../../images/tire.png'],
				onComplete: testImpluseForce
			}
		})
	}

	function testImpluseForce() {
		createWorldLimits()

		const tire = _worldManager.createEntity({
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
			},
			fixtureDefOpts: { restitution: 0.5 }
		})

		_worldManager.createMultiTouchHandler()

		let direction = 1
		_worldManager.createKeyboardHandler({
			keyboardHint: { enabled: true },
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				1: { // 1
					onkeydown: () => tire.getB2Body().ApplyForce(new box2d.b2Vec2(direction * 5000, 0), tire.b2body.GetWorldCenter()),
					keepPressed: true
				},
				2: { onkeydown: () => tire.getB2Body().ApplyImpulse(new box2d.b2Vec2(direction * 500, 0), tire.b2body.GetWorldCenter()) },
				3: {
					onkeydown: () => tire.getB2Body().ApplyForce(new box2d.b2Vec2(direction * 500, 0), { x: 1, y: 1 }),
					keepPressed: true
				},
				4: { onkeydown: () => tire.getB2Body().ApplyImpulse(new box2d.b2Vec2(direction * 50, 0), { x: 1, y: 1 }) },
				ArrowLeft: { onkeydown: () => direction = -1 },
				ArrowRight: { onkeydown: () => direction = 1 }
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

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: renderStatic
		})

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: renderStatic
		})

		_worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: renderStatic
		})

		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: renderStatic
		})
	}

}())