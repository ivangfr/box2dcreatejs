this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	var worldManager;

	function MyApp() {
		this.initialize();
	}

	MyGameBuilder.MyApp = MyApp;

	MyApp.prototype.initialize = function () {
		var easeljsCanvas = document.getElementById("easeljsCanvas");
		var box2dCanvas = document.getElementById("box2dCanvas");

		output = document.getElementById("output");

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
		});
	}

	function testGrenade() {
		var renderStatic = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#bbb' }
			}
		};

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: renderStatic
		});

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: renderStatic
		});

		worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: renderStatic
		});

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: renderStatic
		});

		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: function (e) {
					worldManager.setEnableDebug(!worldManager.getEnableDebug());
				}
			},
			82: { // r
				onkeydown: function (e) {
					worldManager.setEnableRender(!worldManager.getEnableRender());
				}
			},
			65: { // a
				onkeydown: function (e) {
					grenade1.explode();
				}
			},
			83: { // s
				onkeydown: function (e) {
					grenade2.explode();
				}
			},
			80: { // p
				onkeydown: function (e) {
					var isPaused = worldManager.getTimeStepHandler().isPaused();
					if (isPaused)
						worldManager.getTimeStepHandler().play();
					else
						worldManager.getTimeStepHandler().pause();
				}
			}
		});

		worldManager.createMultiTouchHandler();

		worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
					},
					opacity: 0.3
				}
			}
		});

		var soundHandler = worldManager.createSoundHandler();

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 350,
			shape: 'box',
			boxOpts: { width: 400, height: 10 },
			render: renderStatic
		});

		worldManager.createEntity({
			type: 'dynamic',
			x: 550, y: 100,
			shape: 'box',
			boxOpts: { width: 20, height: 60 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: '#1316AD' }
				}
			},
			draggable: true
		});

		worldManager.createEntity({
			type: 'dynamic',
			x: 350, y: 400,
			shape: 'box',
			boxOpts: { width: 30, height: 90 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: '#1316AD' }
				}
			},
			draggable: true
		});

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
					startAnimation: 'normal',
					adjustImageSize: false
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { density: 1, friction: 0, restitution: 0.25 },
			draggable: true
		});

		var grenade1 = worldManager.createGrenade(ball1, {
			numParticles: 32,
			blastPower: 1000,
			particleOpts: {
				shape: 'circle',
				circleOpts: { radius: 5 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'yellow' }
					}
				}
			},
			afterExplosion: function () {
				grenade1.getEntity().b2body.view.gotoAndPlay("explode");
				setTimeout(function () {
					grenade1.clearParticles();
				}, 500);

				soundHandler.createSoundInstance({ id: 'explosion' }).play();
			}
		});

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
					startAnimation: 'normal',
					adjustImageSize: false
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { density: 1, friction: 0, restitution: 0.25 },
			draggable: true
		});

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
				grenade2.clearParticles();
			},
			afterExplosion: function () {
				grenade2.getEntity().b2body.view.gotoAndPlay("explode");
				soundHandler.createSoundInstance({ id: 'explosion2' }).play();
			}
		});
	}

}());