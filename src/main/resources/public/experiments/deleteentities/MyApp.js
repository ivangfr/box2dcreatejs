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

		testDeleteEntities()
		worldManager.start()
	}

	function testDeleteEntities() {

		createWorldLimits()

		createToys(30)

		const square = worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'box',
			boxOpts: { width: 60, height: 60 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2,
					borderColor: 'black'
				}
			},
			noGravity: true
		})

		const ball = worldManager.createEntity({
			type: 'dynamic',
			x: Math.random() * 980,
			y: Math.random() * 500,
			shape: 'circle',
			circleOpts: { radius: 30 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2,
					borderColor: 'black'
				}
			},
			group: 'ball',
			noGravity: true
		})

		worldManager.createLink({
			entityA: square,
			entityB: ball,
			type: 'revolute',
			localAnchorA: { x: 0, y: 2 }
		})

		worldManager.createMultiTouchHandler({
			onmousedown: (e) => {
				worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e).forEach(entity => {
					if (entity.getGroup() === 'ball') {
						worldManager.deleteEntity(entity)
					}
				})
			}
		})

		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			},
			65: { // a
				onkeydown: () => worldManager.deleteEntity(square)
			}
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

	function createToys(number) {
		for (let i = 0; i < number; i++) {
			worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 980,
				y: Math.random() * 500,
				shape: 'circle',
				circleOpts: { radius: 30 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'teal' },
						borderWidth: 2,
						borderColor: 'black'
					}
				},
				group: 'ball'
			})
		}
	}

}())