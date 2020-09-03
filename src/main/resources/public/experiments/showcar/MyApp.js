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
				showLoadingIndicator: false,
				loadingIndicatorOpts: {
					x: 420,
					y: 210,
					font: 'bold italic 30px Verdana',
					color: 'white'
				},
				files: [
					'../../images/tire.png',
					'../../images/tire2.png',
					'../../images/hummer.png',
					'../../images/leftarrow.png',
					'../../images/rightarrow.png',
					'../../images/background.jpg',
					'../../images/earth.png',
				],
				onComplete: showCar
			}
		})
	}

	function showCar() {
		
		createLandscapeAndWorldLimits()
		
		const car = createCar()

		worldManager.createKeyboardHandler({
			65: { // a
				onkeydown: () => worldManager.getZoomHandler().zoomIn()
			},
			83: { // s
				onkeydown: () => worldManager.getZoomHandler().zoomOut()
			},
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			},
			70: { // f
				onkeydown: () => {
					const screenHandler = worldManager.getScreenHandler()
					screenHandler.isFullScreen() ? screenHandler.showNormalCanvasSize() : screenHandler.showFullScreen()
				}
			},
			37: { // left arrow
				onkeydown: (e) => worldManager.getPlayer().left(e),
				keepPressed: true
			},
			39: { // right arrow
				onkeydown: (e) => worldManager.getPlayer().right(e),
				keepPressed: true
			},
			80: { // p
				onkeydown: () => {
					const timeStepHandler = worldManager.getTimeStepHandler()
					timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause()
				}
			},
			79: { // o
				onkeydown: () => worldManager.getTimeStepHandler().setFPS(980)
			},
			73: { // i
				onkeydown: () => worldManager.getTimeStepHandler().restoreFPS()
			},
			49: { // 1
				onkeydown: () => {
					car.chassis.changeScale(1.1)
					car.tire1.changeScale(1.1)
					car.tire2.changeScale(1.1)
					car.link1.changeScale(1.1)
					car.link2.changeScale(1.1)
				}
			},
			50: { // 2
				onkeydown: () => {
					car.chassis.changeScale(0.9)
					car.tire1.changeScale(0.9)
					car.tire2.changeScale(0.9)
					car.link1.changeScale(0.9)
					car.link2.changeScale(0.9)
				}
			}
		})

		worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: { bgColorStyle: 'solid' },
					opacity: 0.3
				}
			}
		})

		worldManager.createMultiTouchHandler({
			enableSlice: true,
			drawLocation: false,
		})

		worldManager.createZoomHandler({ max: 1.1, min: 0.5, step: 0.1 })

		worldManager.createScreenHandler({ fullScreen: false })

		const player = worldManager.createPlayer(car.chassis, {
			camera: {
				adjustX: 490,
				// adjustY: 400,
				xAxisOn: true,
				// yAxisOn: true
			},
			events: {
				left: function (e) {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-1500, 0), this.getB2Body().GetWorldCenter())
				},
				right: function (e) {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(1500, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		const leftBtnRender1 = {
			type: 'image',
			imageOpts: {
				image: '../../images/leftarrow.png',
				adjustImageSize: true
			}
		}

		const leftBtnRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				borderWidth: 2,
				bgImage: '../../images/leftarrow.png',
				adjustBgImageSize: true
			}
		}

		const leftBtn = worldManager.createScreenButton({
			x: 830, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: leftBtnRender1,
			onmousedown: function (e) {
				player.left(e)
				leftBtn.changeRender(leftBtnRender2)
			},
			onmouseup: function (e) {
				leftBtn.changeRender(leftBtnRender1)
			},
			keepPressed: true
		})

		const rightBtnRender1 = {
			type: 'image',
			imageOpts: {
				image: '../../images/rightarrow.png',
				adjustImageSize: true
			}
		}

		const rightBtnRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				borderWidth: 2,
				bgImage: '../../images/rightarrow.png',
				adjustBgImageSize: true
			}
		}

		const rightBtn = worldManager.createScreenButton({
			x: 930, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: rightBtnRender1,
			onmousedown: function (e) {
				player.right(e)
				rightBtn.changeRender(rightBtnRender2)
			},
			onmouseup: function (e) {
				rightBtn.changeRender(rightBtnRender1)
			},
			keepPressed: true
		})
	}

	function createLandscapeAndWorldLimits() {

		// Not Working!
		const greyScaleFilter = new createjs.ColorMatrixFilter([
			0.33, 0.33, 0.33, 0, 0, // red
			0.33, 0.33, 0.33, 0, 0, // green
			0.33, 0.33, 0.33, 0, 0, // blue
			0, 0, 0, 1, 0  // alpha
		])

		worldManager.createLandscape({
			x: 5000, y: -100,
			shape: 'box',
			boxOpts: { width: 10000, height: 1137 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/background.jpg',
					adjustImageSize: true
				},
				filters: [greyScaleFilter]
			}
		})

		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		// Floor
		worldManager.createEntity({
			type: 'static',
			x: 980, y: 450,
			shape: 'box',
			boxOpts: { width: 20000, height: 10 },
			render: staticRender
		})

		// Wall 1
		worldManager.createEntity({
			type: 'static',
			x: 0, y: 0,
			shape: 'box',
			boxOpts: { width: 10, height: 2000 },
			render: staticRender
		})

		// Wall 2
		worldManager.createEntity({
			type: 'static',
			x: 10000, y: 0,
			shape: 'box',
			boxOpts: { width: 10, height: 2000 },
			render: staticRender
		})

		// Ramp 1
		worldManager.createEntity({
			type: 'static',
			x: 4000, y: 400, angle: 75,
			shape: 'box',
			boxOpts: { width: 10, height: 400 },
			render: staticRender
		})

		// Ramp 2
		worldManager.createEntity({
			type: 'static',
			x: 4390, y: 400, angle: -75,
			shape: 'box',
			boxOpts: { width: 10, height: 400 },
			render: staticRender
		})
	}

	function createCar() {
		const CAR_X = 360
		const CAR_Y = 350

		const chassis = worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X, y: CAR_Y,
			shape: 'box',
			boxOpts: { width: 150, height: 50 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/hummer.png',
					adjustImageSize: true
				}
			},
			name: 'chassis'
		})

		const renderTire = {
			type: 'image',
			imageOpts: {
				image: '../../images/tire.png',
				adjustImageSize: true
			}
		}

		const tire1 = worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X - 30, y: CAR_Y + 50,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: renderTire
		})

		const tire2 = worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X + 60, y: CAR_Y + 50,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: renderTire
		})

		const link1 = worldManager.createLink({
			entityA: chassis,
			entityB: tire1,
			type: 'revolute',
			localAnchorA: { x: -1.6, y: 1.1 },
			localAnchorB: { x: 0, y: 0 }
		})

		const link2 = worldManager.createLink({
			entityA: chassis,
			entityB: tire2,
			type: 'revolute',
			localAnchorA: { x: 1.8, y: 1.1 },
			localAnchorB: { x: 0, y: 0 }
		})

		return { chassis, tire1, tire2, link1, link2 }
	}

}())