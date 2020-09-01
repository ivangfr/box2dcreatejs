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
					'../../images/runningGrant.png',
					'../../images/explosion.png',
					'../../images/leftarrow.png',
					'../../images/rightarrow.png'
				],
				onComplete: testSpriteSheet
			}
		});
	}

	function testSpriteSheet() {
		var renderStatic = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#8a8a8a' }
			}
		};

		worldManager.createEntity({
			type: 'static',
			x: 490, y: 450,
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

		var man = worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'box',
			boxOpts: { width: 60, height: 90 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/runningGrant.png'],
						animations: { 'run': [0, 25], 'jump': [26, 63, 'run'] },
						frames: { 'height': 292.5, 'width': 165.75 }
					},
					startAnimation: 'run',
					adjustImageSize: true
				},
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { friction: 0.2 },
			draggable: true
		});

		var ball = worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
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
			draggable: true
		});

		worldManager.createMultiTouchHandler({
			enableDrag: true
		});

		worldManager.createScreenHandler();

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
			70: { // f
				onkeydown: function (e) {
					var fullScreen = !worldManager.getScreenHandler().isFullScreen();
					if (fullScreen)
						worldManager.getScreenHandler().showFullScreen();
					else
						worldManager.getScreenHandler().showNormalCanvasSize();
				}
			},
			65: { // a
				onkeydown: function (e) {
					ball.b2body.view.gotoAndPlay("explode");
				}
			},
			37: { // left arrow
				onkeydown: function (e) {
					man.b2body.ApplyForce(new box2d.b2Vec2(-500, 0), man.b2body.GetWorldCenter());
				},
				keepPressed: true
			},
			38: { // up arrow
				onkeydown: function (e) {
					man.b2body.view.gotoAndPlay("jump");
				},
			},
			39: { // right arrow
				onkeydown: function (e) {
					man.b2body.ApplyForce(new box2d.b2Vec2(500, 0), man.b2body.GetWorldCenter());
				},
				keepPressed: true
			}
		});

		worldManager.createScreenButton({
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
			onmousedown: function (e) {
				man.b2body.ApplyForce(new box2d.b2Vec2(-500, 0), man.b2body.GetWorldCenter());
			},
			keepPressed: true
		});

		worldManager.createScreenButton({
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
			onmousedown: function (e) {
				man.b2body.ApplyForce(new box2d.b2Vec2(500, 0), man.b2body.GetWorldCenter());
			},
			keepPressed: true
		});

		var bo = worldManager.createBrowserOSHandler();
		var text = bo.getBrowserName() + ' ' + bo.getBrowserVersion() + ', ' + bo.getOS();
		document.getElementById("browser_os").innerHTML = text;
	}

}());