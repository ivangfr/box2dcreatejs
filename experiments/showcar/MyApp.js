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
			fpsIndicator: {
				enabled: true,
				color: 'black'
			},
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				loadingIndicatorOpts: {
					x: 420,
					y: 210,
					font: 'bold italic 30px Verdana',
					color: 'black'
				},
				files: [
					'../../images/monster-chassis.png',
					'../../images/monster-tire.png',
					'../../images/arrow_left.png',
					'../../images/arrow_right.png',
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
			keyboardHint: {
				enabled: true,
				color: 'black'
			},
			keys: {
				a: { onkeydown: () => zoomHandler.zoomIn() },
				s: { onkeydown: () => zoomHandler.zoomOut() },
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				p: { onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause() },
				o: { onkeydown: () => timeStepHandler.getFPS() === 980 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(980) },
				f: { onkeydown: () => screenHandler.isFullScreen() ? screenHandler.showNormalCanvasSize() : screenHandler.showFullScreen() },
				ArrowLeft: {
					onkeydown: () => _worldManager.getPlayer().left(),
					keepPressed: true
				},
				ArrowRight: {
					onkeydown: () => _worldManager.getPlayer().right(),
					keepPressed: true
				},
				1: { onkeydown: () => changeCarScale(car, 1.1) },
				2: { onkeydown: () => changeCarScale(car, 0.9) }
			}
		})

		_worldManager.createTouchMouseHandler({ debugTouchMouseLocation: false })

		const player = _worldManager.createPlayer(car.chassis, {
			camera: {
				adjustX: 490,
				xAxisOn: true,
			},
			events: {
				left: () => {
					car.frontTire.getB2Body().SetAngularVelocity(-70)
				},
				right: () => {
					car.frontTire.getB2Body().SetAngularVelocity(70)
				}
			}
		})

		const leftBtnRender1 = {
			type: 'image',
			imageOpts: {
				image: '../../images/arrow_left.png',
				adjustImageSize: true
			}
		}

		const leftBtnRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				borderWidth: 2,
				bgImage: '../../images/arrow_left.png',
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
				image: '../../images/arrow_right.png',
				adjustImageSize: true
			}
		}

		const rightBtnRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				borderWidth: 2,
				bgImage: '../../images/arrow_right.png',
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
			x: 5000, y: -70,
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
		const CAR_X = 360, CAR_Y = 250

		const colorFilter = new createjs.ColorFilter(0.65, 0.84, 0.52, 1) // red, green, blue, alpha

		const chassis = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X, y: CAR_Y,
			shape: 'box',
			boxOpts: { width: 150, height: 50 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/monster-chassis.png',
					adjustImageSize: true
				},
				filters: [colorFilter]
			},
			name: 'chassis'
		})

		const tireRender = {
			type: 'image',
			imageOpts: {
				image: '../../images/monster-tire.png',
				adjustImageSize: true
			}
		}

		const backTire = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X - 30, y: CAR_Y + 50,
			shape: 'circle',
			circleOpts: { radius: 30 },
			render: tireRender,
			bodyDefOpts: { angularVelocity: 70 },
			fixtureDefOpts: { restitution: 0.2 }
		})

		const frontTire = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X + 60, y: CAR_Y + 50,
			shape: 'circle',
			circleOpts: { radius: 30 },
			render: tireRender,
			bodyDefOpts: { angularVelocity: 70 },
			fixtureDefOpts: { restitution: 0.2 }
		})

		const link1 = _worldManager.createLink({
			entityA: chassis,
			entityB: backTire,
			type: 'revolute',
			localAnchorA: { x: -1.6, y: 1.6 },
			localAnchorB: { x: 0, y: 0 }
		})

		const link2 = _worldManager.createLink({
			entityA: chassis,
			entityB: frontTire,
			type: 'revolute',
			localAnchorA: { x: 1.6, y: 1.6 },
			localAnchorB: { x: 0, y: 0 }
		})

		return { chassis, backTire, frontTire, link1, link2 }
	}

	function changeCarScale(car, scale) {
		car.chassis.changeScale(scale)
		car.backTire.changeScale(scale)
		car.frontTire.changeScale(scale)
		car.link1.changeScale(scale)
		car.link2.changeScale(scale)
	}

}())