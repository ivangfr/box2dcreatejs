this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	let _worldManager

	function MyApp() {
		this.initialize()
	}

	Box2DCreateJS.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_worldManager = new Box2DCreateJS.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		})

		testDeleteEntities()
		_worldManager.start()
	}

	function testDeleteEntities() {

		createWorldLimits()
		createBalls(300)
		createBoxes(150)

		const touchMouseHandler = _worldManager.createTouchMouseHandler({
			pointerRadius: 20,
			pointerAccurate: false,
			debugTouchMouseLocation: true,
			onmousedown: function (e) {
				touchMouseHandler.getEntitiesAtMouseTouch(e)
					.filter(entity => entity.getGroup() === 'ball')
					.forEach(entity => _worldManager.deleteEntity(entity))
			},
			onmousemove: function (e) {
				const x = e.x || e.clientX
				const y = e.y || e.clientY

				if (touchMouseHandler.isTouchable() || touchMouseHandler.isMouseDown()) {
					touchMouseHandler.getEntitiesAtMouseTouch(e)
						.filter(entity => entity.getGroup() === 'ball')
						.forEach(entity => _worldManager.deleteEntity(entity))
				}
			}
		})

		_worldManager.createKeyboardHandler({
			keyboardHint: { enabled: true },
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				a: {
					onkeydown: () => touchMouseHandler.setPointerAccurate(!touchMouseHandler.getPointerAccurate())
				}
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

	function createBalls(number) {
		for (let i = 0; i < number; i++) {
			_worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 980,
				y: Math.random() * 500,
				shape: 'circle',
				circleOpts: { radius: 10 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'teal' },
						borderWidth: 2,
						borderColor: 'black',
						cache: true
					}
				},
				group: 'ball'
			})
		}
	}

	function createBoxes(number) {
		for (let i = 0; i < number; i++) {
			_worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 980,
				y: Math.random() * 500,
				shape: 'box',
				boxOpts: { width: 20, height: 20 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'white' },
						borderWidth: 2,
						borderColor: 'black',
						cache: true
					}
				},
				draggable: false,
				group: 'box'
			})
		}
	}

}())