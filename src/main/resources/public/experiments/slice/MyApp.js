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
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				files: [
					'../../images/tire.png',
					'../../images/wall.jpg',
				],
				onComplete: testSlice
			}
		})
	}

	function testSlice() {
		createWorldLimits()

		const multiTouchHandler = _worldManager.createMultiTouchHandler({
			enableSlice: true,
			sliceOpts: {
				lineColor: 'yellow',
				lineWidth: 4
			}
		})

		const timeStepHandler = _worldManager.createTimeStepHandler()

		let valDrag = multiTouchHandler.getEnableDrag()
		let valSlice = multiTouchHandler.getEnableSlice()

		const output = document.getElementById("output")
		output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice

		_worldManager.createKeyboardHandler({
			keyboardHint: { enabled: true },
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				p: { onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause() },
				o: { onkeydown: () => timeStepHandler.getFPS() === 980 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(980) },
				a: {
					onkeydown: () => {
						valDrag = !multiTouchHandler.getEnableDrag()
						multiTouchHandler.setEnableDrag(valDrag)
						output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice
					}
				},
				s: {
					onkeydown: () => {
						valSlice = !multiTouchHandler.getEnableSlice()
						multiTouchHandler.setEnableSlice(valSlice)
						output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice
					}
				}
			}
		})

		createToys()
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
			x: 100, y: 100, angle: 5,
			shape: 'box',
			boxOpts: { width: 60, height: 120 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'teal' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			sliceable: true,
			noGravity: true,
			events: {
				ontick: function (e) {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(10, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 800, y: 100,
			shape: 'box',
			boxOpts: { width: 100, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'orange' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			bodyDefOpts: { angularVelocity: 820 },
			sliceable: true,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 400,
			shape: 'box',
			boxOpts: { width: 100, height: 100 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/wall.jpg',
					adjustImageSize: true
				}
			},
			sliceable: true,
			noGravity: true,
			events: {
				onslice: function (pieces) {
					// TODO - There is a problem when slicing a entity with image or sprite
					// one dirty way to overcome it is changing the render of the entity
					pieces.forEach(piece => piece.changeRender({
						type: 'draw',
						drawOpts: {
							bgColorStyle: 'solid',
							bgSolidColorOpts: { color: 'gray' },
							borderWidth: 2,
							borderColor: 'black'
						}
					}))
				}
			}
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 400,
			shape: 'box',
			boxOpts: { width: 100, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: {
						text: 'B',
						font: 'bold 38px Arial',
						color: 'yellow'
					},
					borderWidth: 4,
					borderColor: 'white',
					borderRadius: 10,
					cache: true
				}
			},
			sliceable: true,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 300,
			shape: 'polygon',
			polygonOpts: {
				points: [
					{ x: -80, y: 0 },
					{ x: 0, y: -80 },
					{ x: 80, y: 0 }
				]
			},
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2,
					borderColor: 'black'
				}
			},
			sliceable: true
		})

		_worldManager.createEntity({
			type: 'static',
			x: 600, y: 100, angle: 5,
			shape: 'box',
			boxOpts: { width: 60, height: 120 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'gray' },
					borderWidth: 2,
					borderColor: 'black'
				}
			},
			sliceable: true,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 800, y: 400,
			shape: 'circle',
			circleOpts: { radius: 50 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/tire.png',
					adjustImageSize: true
				}
			},
			sliceable: true,
			noGravity: true
		})
	}

}())