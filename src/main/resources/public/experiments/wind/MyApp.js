this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	let _worldManager
	let _mouseX, _mouseY

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
			showFPSIndicator: true,
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		})

		testWind()
		_worldManager.start()
	}

	function testWind() {
		createWorldLimits()
		createToys()

		_worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender())
			},
			65: { // a
				onkeydown: () => {
					const wind = _worldManager.getWind()
					wind.isOn() ? wind.stop() : wind.start()
				}
			},
			83: { // s
				onkeydown: () => createNewToy()
			}
		})

		_worldManager.createMultiTouchHandler({
			onmousemove: (e) => {
				_mouseX = e.x
				_mouseY = e.y
			}
		})

		// Wind
		_worldManager.createWind({
			numRays: 50,
			power: 2000,
			on: true,
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

	function createNewToy(e) {
		_worldManager.createEntity({
			type: 'dynamic',
			x: _mouseX,
			y: _mouseY,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'orange' },
					borderWidth: 1,
					borderColor: 'black'
				}
			}
		})
	}

}())