this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	const CATEGORY_CAR = 0x0001
	const CATEGORY_SCENERY = 0x0002
	const CAR_WIDTH = 170, CAR_HEIGHT = 55, CAR_X = 360, CAR_Y = 230

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
				showLoadingIndicator: true,
				loadingIndicatorOpts: {
					x: 420,
					y: 210,
					font: 'bold italic 30px Verdana',
					color: 'white'
				},
				files: [
					'../../images/tire.png',
					'../../images/hummer.png'
				],
				onComplete: testJoints
			}
		})
	}

	function testJoints() {
		createWorldLimits()
		createCar()

		_worldManager.createKeyboardHandler({
			keyboardHint: {
				enabled: true,
				x: 440
			},
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) }
			}
		})

		_worldManager.createMultiTouchHandler()
	}

	function createWorldLimits() {

		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		const fixtureStatic = { filterCategoryBits: CATEGORY_SCENERY }

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticRender,
			fixtureDefOpts: fixtureStatic
		})

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticRender,
			fixtureDefOpts: fixtureStatic
		})

		_worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender,
			fixtureDefOpts: fixtureStatic
		})

		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender,
			fixtureDefOpts: fixtureStatic
		})
	}

	function createCar() {

		const car = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X, y: CAR_Y,
			shape: 'box',
			boxOpts: { width: CAR_WIDTH, height: CAR_HEIGHT },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/hummer.png',
					adjustImageSize: true
				}
			},
			fixtureDefOpts: {
				friction: 0.2,
				density: 7,
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			name: 'car'
		})

		const axisRender = {
			type: 'draw',
			drawOpts: { bgColorStyle: 'transparent' }
		}

		const backAxis = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X - 55, y: CAR_Y + 30,
			shape: 'box',
			boxOpts: { width: 20, height: 20 },
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			render: axisRender
		})

		const frontAxis = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X + 55, y: CAR_Y + 30,
			shape: 'box',
			boxOpts: { width: 20, height: 20 },
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			render: axisRender
		})

		const tireRender = {
			type: 'image',
			imageOpts: {
				image: '../../images/tire.png',
				adjustImageSize: true
			}
		}

		const backTire = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X - 55, y: CAR_Y + 30,
			shape: 'circle',
			circleOpts: { radius: 22 },
			render: tireRender,
			fixtureDefOpts: {
				density: 5.0,
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			name: 'backTire',
			group: 'tire'
		})

		const frontTire = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X + 55, y: CAR_Y + 30,
			shape: 'circle',
			circleOpts: { radius: 22 },
			render: tireRender,
			fixtureDefOpts: {
				density: 5.0,
				friction: 3.0,
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			name: 'frontTire',
			group: 'tire'
		})

		_worldManager.createLink({
			entityA: car,
			entityB: backAxis,
			type: 'line',
			localAnchorA: { x: -1.85, y: 0.1 },
			localAxisA: { x: 0, y: 0.9 },
			options: {
				enableLimit: true,
				lowerTranslation: 0.8,
				upperTranslation: 0.95,
				enableMotor: true,
				maxMotorForce: 45,
				motorSpeed: 2
			}
		})

		_worldManager.createLink({
			entityA: car,
			entityB: frontAxis,
			type: 'line',
			localAnchorA: { x: 1.85, y: 0.1 },
			localAxisA: { x: 0, y: 0.9 },
			options: {
				enableLimit: true,
				lowerTranslation: 0.8,
				upperTranslation: 0.95,
				enableMotor: true,
				maxMotorForce: 45,
				motorSpeed: 2
			}
		})

		_worldManager.createLink({
			entityA: backAxis,
			entityB: backTire,
			type: 'revolute'
		})

		_worldManager.createLink({
			entityA: frontAxis,
			entityB: frontTire,
			type: 'revolute'
		})
	}

}())