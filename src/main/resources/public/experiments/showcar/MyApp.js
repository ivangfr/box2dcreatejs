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

		createLandscape()
		createWorldLimits()

		const car = createCar()

		const timeStepHandler = _worldManager.createTimeStepHandler({
			layer: {
				shape: 'circle',
				circleOpts: {
					radius: _worldManager.getEaseljsCanvas().height / 2
				},
				render: {
					type: 'draw',
					opacity: 0.5,
					drawOpts: {
						bgColorStyle: 'solid',
						textOpts: {
							text: 'Paused',
							font: 'bold 38px Verdana',
							color: 'white'
						}
					}
				}
			}
		})

		const screenHandler = _worldManager.createScreenHandler()

		const zoomHandler = _worldManager.createZoomHandler({ max: 1.1, min: 0.5, step: 0.1 })

		_worldManager.createKeyboardHandler({
			65: { // a
				onkeydown: () => zoomHandler.zoomIn()
			},
			83: { // s
				onkeydown: () => zoomHandler.zoomOut()
			},
			68: { // d
				onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender())
			},
			80: { // p
				onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause()
			},
			79: { // o
				onkeydown: () => timeStepHandler.getFPS() === 980 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(980)
			},
			70: { // f
				onkeydown: () => screenHandler.isFullScreen() ? screenHandler.showNormalCanvasSize() : screenHandler.showFullScreen()
			},
			37: { // left arrow
				onkeydown: () => _worldManager.getPlayer().left(),
				keepPressed: true
			},
			39: { // right arrow
				onkeydown: () => _worldManager.getPlayer().right(),
				keepPressed: true
			},
			49: { // 1
				onkeydown: () => {
					car.chassis.changeScale(1.1)
					car.backTire.changeScale(1.1)
					car.frontTire.changeScale(1.1)
					car.link1.changeScale(1.1)
					car.link2.changeScale(1.1)
				}
			},
			50: { // 2
				onkeydown: () => {
					car.chassis.changeScale(0.9)
					car.backTire.changeScale(0.9)
					car.frontTire.changeScale(0.9)
					car.link1.changeScale(0.9)
					car.link2.changeScale(0.9)
				}
			}
		})

		_worldManager.createMultiTouchHandler({ drawPointerLocation: false })

		const player = _worldManager.createPlayer(car.chassis, {
			camera: {
				adjustX: 490,
				xAxisOn: true,
			},
			events: {
				left: () => {
					car.frontTire.getB2Body().ApplyForce(new box2d.b2Vec2(-500, 0), { x: 1, y: 1 })
					// car.frontTire.getB2Body().SetAngularVelocity(-70)
				},
				right: () => {
					car.frontTire.getB2Body().ApplyForce(new box2d.b2Vec2(500, 0), { x: 1, y: 1 })
					// car.frontTire.getB2Body().SetAngularVelocity(70)
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

		const leftBtn = _worldManager.createScreenButton({
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

		const rightBtn = _worldManager.createScreenButton({
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

	function createLandscape() {
		const colorMatrix = new createjs.ColorMatrix().adjustColor(0, 0, -100, -100)
		const greyScaleFilter = new createjs.ColorMatrixFilter(colorMatrix)

		_worldManager.createLandscape({
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
	}

	function createWorldLimits() {
		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		// Floor
		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 450,
			shape: 'box',
			boxOpts: { width: 20000, height: 10 },
			render: staticRender
		})

		// Wall 1
		_worldManager.createEntity({
			type: 'static',
			x: 0, y: 0,
			shape: 'box',
			boxOpts: { width: 10, height: 2000 },
			render: staticRender
		})

		// Wall 2
		_worldManager.createEntity({
			type: 'static',
			x: 10000, y: 0,
			shape: 'box',
			boxOpts: { width: 10, height: 2000 },
			render: staticRender
		})

		// Ramp 1
		_worldManager.createEntity({
			type: 'static',
			x: 4000, y: 400, angle: 75,
			shape: 'box',
			boxOpts: { width: 10, height: 400 },
			render: staticRender
		})

		// Ramp 2
		_worldManager.createEntity({
			type: 'static',
			x: 4390, y: 400, angle: -75,
			shape: 'box',
			boxOpts: { width: 10, height: 400 },
			render: staticRender
		})
	}

	function createCar() {
		const CAR_X = 360, CAR_Y = 350

		const colorFilter = new createjs.ColorFilter(0.65, 0.84, 0.52, 1) // red, green, blue, alpha

		const chassis = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X, y: CAR_Y,
			shape: 'box',
			boxOpts: { width: 150, height: 50 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/hummer.png',
					adjustImageSize: true
				},
				filters: [colorFilter]
			},
			name: 'chassis'
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
			x: CAR_X - 30, y: CAR_Y + 50,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: tireRender
		})

		const frontTire = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X + 60, y: CAR_Y + 50,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: tireRender
		})

		const link1 = _worldManager.createLink({
			entityA: chassis,
			entityB: backTire,
			type: 'revolute',
			localAnchorA: { x: -1.6, y: 0.9 },
			localAnchorB: { x: 0, y: 0 }
		})

		const link2 = _worldManager.createLink({
			entityA: chassis,
			entityB: frontTire,
			type: 'revolute',
			localAnchorA: { x: 1.8, y: 0.9 },
			localAnchorB: { x: 0, y: 0 }
		})

		return { chassis, backTire, frontTire, link1, link2 }
	}

}())