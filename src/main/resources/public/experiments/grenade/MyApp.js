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

		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			},
			65: { // a
				onkeydown: () => grenade1.explode()
			},
			83: { // s
				onkeydown: () => grenade2.explode()
			},
			80: { // p
				onkeydown: () => {
					const timeStepHandler = worldManager.getTimeStepHandler()
					timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause()
				}
			}
		})

		worldManager.createMultiTouchHandler()

		worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: { bgColorStyle: 'solid' },
					opacity: 0.3
				}
			}
		})

		var soundHandler = worldManager.createSoundHandler()

		var ball1 = worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 400,
			shape: 'box',
			boxOpts: { width: 40, height: 40 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/explosion.png'],
						animations: { 'normal': [0], 'explode': [1, 47, 'normal'] },
						frames: { 'height': 256, 'width': 256 }
					},
					startAnimation: 'normal'
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { density: 1, friction: 0, restitution: 0.25 }
		})

		var grenade1 = worldManager.createGrenade(ball1, {
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

		var ball2 = worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 400,
			shape: 'circle',
			circleOpts: { radius: 20 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/explosion.png'],
						animations: { 'normal': [0], 'explode': [1, 47, 'normal'] },
						frames: { 'height': 256, 'width': 256 }
					},
					startAnimation: 'normal'
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { density: 1, friction: 0, restitution: 0.25 }
		})

		var grenade2 = worldManager.createGrenade(ball2, {
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
							animations: { 'normal': [0], 'explode': [1, 47, 'normal'] },
							frames: { 'height': 256, 'width': 256 }
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

		// Platform
		worldManager.createEntity({
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

		worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 300,
			shape: 'box',
			boxOpts: { width: 20, height: 60 },
			render: toysRender
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 300,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: toysRender
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 150, y: 400,
			shape: 'box',
			boxOpts: { width: 30, height: 90 },
			render: toysRender
		})

		worldManager.createEntity({
			type: 'dynamic',
			x: 850, y: 400,
			shape: 'box',
			boxOpts: { width: 30, height: 90 },
			render: toysRender
		})
	}

}())