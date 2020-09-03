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
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		})

		testWind()
		worldManager.start()
	}

	function testWind() {
		createWorldLimits()
		createToys()
		
		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			},
			65: { // a
				onkeydown: () => {
					const wind = worldManager.getWind()
					wind.isOn() ? wind.stop() : wind.start()
				}
			}
		})

		worldManager.createMultiTouchHandler()

		// Wind
		worldManager.createWind({
			numRays: 50,
			power: 1000,
			on: true,
			directionTo: 'right',
			height: 400
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

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
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

	function createToys() {
		worldManager.createEntity({
			type: 'dynamic',
			x: 800, y: 100,
			shape: 'box',
			boxOpts: { width: 40, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'blue' }
				}
			},
			fixtureDefOpts: { density: 10 }
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 500, y: 100,
			shape: 'box',
			boxOpts: { width: 40, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' }
				}
			}
		})

		worldManager.createEntity({
			type: 'static',
			x: 650, y: 450,
			shape: 'box',
			boxOpts: { width: 10, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'black' }
				}
			}
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 100,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'yellow' }
				}
			}
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'polygon',
			polygonOpts: { points: [{ x: -40, y: 0 }, { x: 0, y: -40 }, { x: 40, y: 0 }] },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'green' }
				}
			},
			fixtureDefOpts: { density: 1.0 }
		})
	}

}())