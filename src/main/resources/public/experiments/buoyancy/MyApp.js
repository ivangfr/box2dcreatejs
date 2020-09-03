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
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		})

		testWater()
		worldManager.start()
	}

	function testWater() {
		createWorldLimits()

		worldManager.createLandscape({
			x: 490, y: 250,
			shape: 'box',
			boxOpts: { width: 980, height: 500 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'linearGradient',
					bgLinearGradientOpts: { colors: ['#3399cc', '#fff'] }
				}
			}
		})

		createToys()

		// Water
		worldManager.createEntity({
			type: 'static',
			x: 300, y: 395,
			shape: 'box',
			boxOpts: { width: 590, height: 200 },
			render: {
				type: 'draw',
				opacity: 0.8,
				drawOpts: {
					bgColorStyle: 'linearGradient',
					bgLinearGradientOpts: { colors: ['#4CABB0', '#65DFE6'] }
				},
			},
			fixtureDefOpts: {
				isFluid: true,
				dragConstant: 0.25,
				liftConstant: 0.25
			}
		})

		// Pool border
		worldManager.createEntity({
			type: 'static',
			x: 595, y: 390,
			shape: 'box',
			boxOpts: { width: 5, height: 210 },
			render: {
				type: 'draw',
				opacity: 0.8,
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: '#000' }
				},
			}
		})

		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			}
		})

		worldManager.createMultiTouchHandler({
			enableSlice: true,
			sliceOpts: { lineWidth: 3 }
		})

		worldManager.createContactHandler({
			enabledBuoyancy: true,
			buoyancyOpts: { complexDragFunction: true }
		})
	}

	function createWorldLimits() {
		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#000' }
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
			x: 50, y: 250,
			shape: 'polygon',
			polygonOpts: { points: [{ x: -40, y: 0 }, { x: 0, y: -40 }, { x: 40, y: 0 }] },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'orange' },
					borderWidth: 2
				},
			},
			fixtureDefOpts: { density: 1.0 },
			sliceable: true
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 120, y: 100, angle: 15,
			shape: 'box',
			boxOpts: { width: 10, height: 90 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'gray' },
					borderWidth: 2
				},
			},
			fixtureDefOpts: { density: 0.8 },
			sliceable: true
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 100, angle: 90,
			shape: 'box',
			boxOpts: { width: 20, height: 120 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'purple' },
					borderWidth: 2
				},
			},
			fixtureDefOpts: { density: 0.8 },
			name: 'rect',
			sliceable: true
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 440, y: 250, angle: 15,
			shape: 'box',
			boxOpts: { width: 60, height: 60 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2
				},
			},
			fixtureDefOpts: { density: 0.9 },
			sliceable: true
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 550, y: 200,
			shape: 'circle',
			circleOpts: { radius: 30 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'olive' },
					borderWidth: 2
				}
			},
			fixtureDefOpts: { density: 0.7 }
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 800, y: 250,
			shape: 'box',
			boxOpts: { width: 120, height: 120 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'teal' },
					borderWidth: 2
				},
			},
			fixtureDefOpts: { density: 0.8 },
			sliceable: true,
			events: {
				onslice: function () {
					console.log(this.b2body.GetUserData().name + ' Sliced!')
				}
			}
		})
	}

}())