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
				showLoadingIndicator: true,
				loadingIndicatorOpts: {
					x: 420,
					y: 210,
					font: 'bold italic 30px Verdana',
					color: 'white'
				},
				files: [
					{ src: '../../sounds/explosion.mp3', id: 'explosion' },
					{ src: '../../sounds/Thunder1.mp3', id: 'explosion2' },
					'../../images/explosion.png'
				],
				onComplete: testGrenade
			}
		})
	}

	function testGrenade() {

		createWorldLimitsAndPlatform()
		createToys()

		const timeStepHandler = _worldManager.createTimeStepHandler()

		_worldManager.createKeyboardHandler({
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
				onkeydown: () => timeStepHandler.getFPS() === 1960 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(1960)
			},
			65: { // a
				onkeydown: () => grenade1.explode()
			},
			83: { // s
				onkeydown: () => grenade2.explode()
			}
		})

		_worldManager.createMultiTouchHandler()

		const soundHandler = _worldManager.createSoundHandler()

		const ball1 = _worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 400,
			shape: 'box',
			boxOpts: { width: 40, height: 40 },
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
			fixtureDefOpts: { density: 1, friction: 0, restitution: 0.25 }
		})

		const grenade1 = _worldManager.createGrenade(ball1, {
			numParticles: 32,
			blastPower: 1000,
			particleOpts: {
				shape: 'circle',
				circleOpts: { radius: 3 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'yellow' }
					}
				}
			},
			afterExplosion: function () {
				grenade1.getEntity().b2body.view.gotoAndPlay("explode")
				soundHandler.createSoundInstance({ id: 'explosion' }).myPlay({ volume: 0.3 })
				setTimeout(function () {
					grenade1.clearParticles()
				}, 500)
			}
		})

		const ball2 = _worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 400,
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
			fixtureDefOpts: { density: 1, friction: 0, restitution: 0.25 }
		})

		const grenade2 = _worldManager.createGrenade(ball2, {
			numParticles: 32,
			blastPower: 1000,
			particleOpts: {
				shape: 'box',
				boxOpts: { width: 10, height: 10 },
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
						startAnimation: 'explode',
						adjustImageSize: true
					}
				}
			},
			beforeExplosion: function () {
				grenade2.clearParticles()
			},
			afterExplosion: function () {
				grenade2.getEntity().b2body.view.gotoAndPlay("explode")
				soundHandler.createSoundInstance({ id: 'explosion2' }).play()
			}
		})
	}

	function createWorldLimitsAndPlatform() {
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

		// Platform
		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 350,
			shape: 'box',
			boxOpts: { width: 400, height: 10 },
			render: staticRender
		})
	}

	function createToys() {
		const toysRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'teal' },
				borderWidth: 2,
				borderColor: 'white'
			}
		}

		_worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 300,
			shape: 'box',
			boxOpts: { width: 20, height: 60 },
			render: toysRender
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 300,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: toysRender
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 150, y: 400,
			shape: 'box',
			boxOpts: { width: 30, height: 90 },
			render: toysRender
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 850, y: 400,
			shape: 'box',
			boxOpts: { width: 30, height: 90 },
			render: toysRender
		})
	}

}())