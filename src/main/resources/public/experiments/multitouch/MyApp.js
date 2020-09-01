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
					'../../images/explosion.png',
					'../../images/start.png',
					'../../images/leftarrow.png',
					'../../images/rightarrow.png'
				],
				onComplete: testMultiTouch
			}
		});
	}

	function testMultiTouch() {
		worldManager.setEnableDebug(true);

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

		var ball2 = worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: '#fff' }
				}
			},
			draggable: true
		});

		var ball3 = worldManager.createEntity({
			type: 'dynamic',
			x: 500, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: '#fff' }
				}
			},
			draggable: true
		});

		var ball = worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
			shape: 'circle',
			circleOpts: { radius: 40 },
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
			enableDrag: true,
			drawLocation: true,
			onmousedown: function () {
				output.innerHTML = 'MOUSEDOWN';
			},
			onmouseup: function () {
				output.innerHTML = 'MOUSEUP';
			}
		});

		worldManager.createScreenButton({
			x: 50, y: 480,
			shape: 'box',
			boxOpts: { width: 100, height: 50 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/start.png',
					adjustImageSize: true
				}
			},
			onmousedown: function (e) {
				ball.b2body.view.gotoAndPlay("explode");
				output.innerHTML = 'DOWN';
			},
			onmouseup: function () {
				output.innerHTML = 'UP';
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
				ball.b2body.ApplyForce(new box2d.b2Vec2(-600, 0), ball.b2body.GetWorldCenter());
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
				ball.b2body.ApplyForce(new box2d.b2Vec2(600, 0), ball.b2body.GetWorldCenter());
			},
			keepPressed: true
		});

		var bo = worldManager.createBrowserOSHandler();
		var text = bo.getBrowserName() + ' ' + bo.getBrowserVersion() + ', ' + bo.getOS();
		document.getElementById("browser_os").innerHTML = text;
	}

}());