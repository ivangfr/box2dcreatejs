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
			enableDebug: true,
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		})

		testWind()
		_worldManager.start()
	}

	function testWind() {
		createWorldLimits()
		createToys()
		createPinsAndBlocks()

		_worldManager.createKeyboardHandler({
			keyboardHint: { enabled: true },
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				a: {
					onkeydown: () => {
						const wind = _worldManager.getWind()
						wind.isOn() ? wind.stop() : wind.start()
					}
				}
			}
		})

		_worldManager.createMultiTouchHandler()

		// Wind
		_worldManager.createWind({
			numRays: 50,
			power: 2000,
			on: false,
			directionTo: 'right',
			adjustY: 100,
			height: 500
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

	function createToys() {
		_worldManager.createEntity({
			type: 'dynamic',
			x: 50, y: 400,
			shape: 'box',
			boxOpts: { width: 40, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 1,
					borderColor: 'black'
				}
			}
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 450,
			shape: 'box',
			boxOpts: { width: 40, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'blue' },
					borderWidth: 1,
					borderColor: 'black'
				}
			},
			fixtureDefOpts: { density: 10 }
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 500, y: 350,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'yellow' },
					borderWidth: 1,
					borderColor: 'black'
				}
			}
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 700, y: 450,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'yellow' },
					borderWidth: 1,
					borderColor: 'black'
				}
			}
		})

		_worldManager.createEntity({
			type: 'static',
			x: 650, y: 430,
			shape: 'box',
			boxOpts: { width: 10, height: 150 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'black' }
				}
			}
		})
	}

	function createPinsAndBlocks() {
		const blockRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'orange' },
				borderWidth: 1,
				borderColor: 'black'
			}
		}

		const pinRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		// This function will make the blocks to stop rotating
		function simulateAirResistence() {
			const area = getArea(this.b2body.m_fixtureList.m_shape.m_vertices)
			this.b2body.ApplyTorque(area * -this.b2body.GetAngularVelocity())
		}

		const block1 = _worldManager.createEntity({
			type: 'dynamic',
			x: 200, y: 150,
			shape: 'box',
			boxOpts: { width: 20, height: 100 },
			render: blockRender,
			events: {
				ontick: simulateAirResistence
			}
		})

		const pin1 = _worldManager.createEntity({
			type: 'static',
			x: 200, y: 150,
			shape: 'circle',
			circleOpts: { radius: 5 },
			render: pinRender
		})

		_worldManager.createLink({
			entityA: block1,
			entityB: pin1,
			type: 'revolute',
			localAnchorA: { x: 0, y: -1.4 }
		})

		const block2 = _worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 200,
			shape: 'box',
			boxOpts: { width: 10, height: 100 },
			render: blockRender,
			events: {
				ontick: simulateAirResistence
			}
		})

		const pin2 = _worldManager.createEntity({
			type: 'static',
			x: 400, y: 200,
			shape: 'circle',
			circleOpts: { radius: 2.5 },
			render: pinRender
		})

		_worldManager.createLink({
			entityA: block2,
			entityB: pin2,
			type: 'revolute',
			localAnchorA: { x: 0, y: -1.4 }
		})

		const block3 = _worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 100,
			shape: 'box',
			boxOpts: { width: 10, height: 100 },
			render: blockRender,
			events: {
				ontick: simulateAirResistence
			}
		})

		const pin3 = _worldManager.createEntity({
			type: 'static',
			x: 600, y: 100,
			shape: 'circle',
			circleOpts: { radius: 2.5 },
			render: pinRender
		})

		_worldManager.createLink({
			entityA: block3,
			entityB: pin3,
			type: 'revolute',
			localAnchorA: { x: 0, y: 0 }
		})

		const block4 = _worldManager.createEntity({
			type: 'dynamic',
			x: 800, y: 200,
			shape: 'box',
			boxOpts: { width: 20, height: 200 },
			render: blockRender,
			events: {
				ontick: simulateAirResistence
			}
		})

		const pin4 = _worldManager.createEntity({
			type: 'static',
			x: 800, y: 200,
			shape: 'circle',
			circleOpts: { radius: 5 },
			render: pinRender
		})

		_worldManager.createLink({
			entityA: block4,
			entityB: pin4,
			type: 'revolute',
			localAnchorA: { x: 0, y: 0 }
		})
	}

}())