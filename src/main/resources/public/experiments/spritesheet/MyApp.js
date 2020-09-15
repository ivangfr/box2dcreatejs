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
					'../../images/ken.png',
					'../../images/runningGrant.png',
					'../../images/explosion.png',
					'../../images/leftarrow.png',
					'../../images/rightarrow.png'
				],
				onComplete: testSpriteSheet
			}
		})
	}

	function testSpriteSheet() {
		createWorldLimits()

		const ken = createKen()
		const ball = createBall()
		const boy = createBoy()

		_worldManager.createTouchMouseHandler()

		_worldManager.createScreenHandler()

		const timeStepHandler = _worldManager.createTimeStepHandler()

		_worldManager.createKeyboardHandler({
			keyboardHint: {
				enabled: true,
				font: 'bold 11px Monaco'
			},
			keys: {
				// -- Screen
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				p: { onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause() },
				o: { onkeydown: () => timeStepHandler.getFPS() === 980 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(980) },
				f: {
					onkeydown: () => {
						const screenHandler = _worldManager.getScreenHandler()
						screenHandler.isFullScreen() ? screenHandler.showNormalCanvasSize() : screenHandler.showFullScreen()
					}
				},

				// -- Ken
				ArrowLeft: {
					onkeydown: () => {
						ken.b2body.view.currentAnimation === "idle" && ken.b2body.view.gotoAndPlay("walk")
						ken.b2body.view.currentAnimation === "walk" && ken.b2body.ApplyForce(new box2d.b2Vec2(-3000, 0), ken.b2body.GetWorldCenter())
					},
					onkeyup: () => ken.b2body.view.gotoAndPlay("idle"),
					keepPressed: true
				},
				ArrowRight: {
					onkeydown: () => {
						ken.b2body.view.currentAnimation === "idle" && ken.b2body.view.gotoAndPlay("walk")
						ken.b2body.view.currentAnimation === "walk" && ken.b2body.ApplyForce(new box2d.b2Vec2(3000, 0), ken.b2body.GetWorldCenter())
					},
					onkeyup: () => ken.b2body.view.gotoAndPlay("idle"),
					keepPressed: true
				},
				ArrowUp: {
					onkeydown: () => {
						if (ken.b2body.view.currentAnimation === "idle") {
							ken.b2body.view.gotoAndPlay("jump")
							ken.b2body.ApplyImpulse(new box2d.b2Vec2(0, -150), ken.b2body.GetWorldCenter())
						}
					}
				},
				ArrowDown: {
					onkeydown: () => ken.b2body.view.gotoAndPlay("squat"),
					onkeyup: () => ken.b2body.view.gotoAndPlay("idle"),
				},
				a: { onkeydown: () => ken.b2body.view.currentAnimation === "idle" && ken.b2body.view.gotoAndPlay("kick") },
				s: { onkeydown: () => ken.b2body.view.currentAnimation === "idle" && ken.b2body.view.gotoAndPlay("highkick") },
				z: { onkeydown: () => ken.b2body.view.currentAnimation === "idle" && ken.b2body.view.gotoAndPlay("haduken") },
				x: { onkeydown: () => ken.b2body.view.currentAnimation === "idle" && ken.b2body.view.gotoAndPlay("punch") },

				// -- Grenade
				c: {
					onkeydown: () => {
						ball.b2body.view.gotoAndPlay("explode")
						boy.b2body.view.gotoAndPlay("jump")
					}
				}
			}
		})

		_worldManager.createScreenButton({
			x: 57, y: 477,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: { text: 'Explode' },
					borderWidth: 2,
					borderColor: 'white',
					borderRadius: 10
				}
			},
			onmousedown: function () {
				ball.b2body.view.gotoAndPlay("explode")
			}
		})

		_worldManager.createScreenButton({
			x: 830, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/leftarrow.png',
					adjustImageSize: true
				}
			},
			onmousedown: function () {
				boy.b2body.ApplyForce(new box2d.b2Vec2(-500, 0), boy.b2body.GetWorldCenter())
			},
			keepPressed: true
		})

		_worldManager.createScreenButton({
			x: 930, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/rightarrow.png',
					adjustImageSize: true
				}
			},
			onmousedown: function () {
				boy.b2body.ApplyForce(new box2d.b2Vec2(500, 0), boy.b2body.GetWorldCenter())
			},
			keepPressed: true
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
			x: 490, y: 450,
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

	function createKen() {
		return _worldManager.createEntity({
			type: 'dynamic',
			x: 200, y: 350,
			shape: 'box',
			boxOpts: { width: 144, height: 152 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/ken.png'],
						animations: {
							idle: [6, 9, 'idle', 0.1],
							walk: [18, 22, 'walk', 0.1],
							haduken: [0, 3, 'idle', 0.2],
							punch: [12, 14, 'idle', 0.25],
							kick: [37, 40, 'idle', 0.25],
							highkick: [42, 46, 'idle', 0.25],
							jump: [48, 53, 'idle', 0.1],
							squat: 54
						},
						frames: { width: 71, height: 80 }
					},
					startAnimation: 'idle',
					adjustImageSize: true
				},
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: {
				friction: 0.7,
				restitution: 0
			}
		})
	}

	function createBall() {
		return _worldManager.createEntity({
			type: 'dynamic',
			x: 500, y: 250,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/explosion.png'],
						animations: {
							normal: 0,
							explode: [1, 47, 'normal']
						},
						frames: { width: 256, height: 256 }
					},
					startAnimation: 'normal'
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { restitution: 0.5 }
		})
	}

	function createBoy() {
		return _worldManager.createEntity({
			type: 'dynamic',
			x: 700, y: 250,
			shape: 'box',
			boxOpts: { width: 60, height: 90 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/runningGrant.png'],
						animations: {
							run: [0, 25],
							jump: [26, 63, 'run']
						},
						frames: { width: 165.75, height: 292.5 }
					},
					startAnimation: 'run',
					adjustImageSize: true
				},
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { friction: 0.1 }
		})
	}

}())