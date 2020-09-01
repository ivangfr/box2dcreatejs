this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	var worldManager;

	function MyApp() {
		this.initialize();
	}

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
				files: ['../../images/background.jpg'],
				onComplete: testPerformance
			}
		});
	}

	MyGameBuilder.MyApp = MyApp;

	var greyScaleFilter = new createjs.ColorMatrixFilter([
		0.33, 0.33, 0.33, 0, 0, // red
		0.33, 0.33, 0.33, 0, 0, // green
		0.33, 0.33, 0.33, 0, 0, // blue
		0, 0, 0, 1, 0  // alpha
	]);

	function testPerformance() {

		worldManager.createLandscape({
			x: 490, y: 250,
			shape: 'box',
			boxOpts: {
				width: 980, //4000
				height: 500, //1137
			},
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/background.jpg',
					adjustImageSize: true
				},
				filters: [greyScaleFilter]
			}
		});

		var k = worldManager.createKeyboardHandler({
			65: { // a
				onkeydown: function (e) {
					worldManager.getZoomHandler().zoomIn();
				}
			},
			83: { // s
				onkeydown: function (e) {
					worldManager.getZoomHandler().zoomOut();
				}
			},
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
			70: {
				onkeydown: function (e) {
					var fullScreen = !worldManager.getScreenHandler().isFullScreen();
					if (fullScreen)
						worldManager.getScreenHandler().showFullScreen();
					else
						worldManager.getScreenHandler().showNormalCanvasSize();
				}
			},
			49: { // 1
				onkeydown: function (e) {
					for (var i = 0; i < balls.length; i++)
						balls[i].changeScale(1.1);
				}
			},
			50: { // 2
				onkeydown: function (e) {
					for (var i = 0; i < balls.length; i++)
						balls[i].changeScale(0.9);
				}
			}
		});

		worldManager.createMultiTouchHandler({
			enableDrag: true
		});

		worldManager.createZoomHandler();
		worldManager.createScreenHandler();

		var renderStatic = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#000' }
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

		worldManager.createEntity({
			type: 'static',
			x: 750, y: 100,
			shape: 'box',
			boxOpts: { width: 5, height: 260 },
			render: renderStatic
		});

		worldManager.createEntity({
			type: 'static',
			x: 880, y: 280, angle: -15,
			shape: 'box',
			boxOpts: { width: 200, height: 5 },
			render: renderStatic
		});

		var balls = [];
		for (var i = 0; i < 400; i++) {
			var ball = worldManager.createEntity({
				type: 'dynamic',
				x: 980 - (Math.random() * 180),
				y: Math.random() * 150,
				shape: 'circle',
				circleOpts: { radius: 7 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'radialGradient',
						borderWidth: 2,
						cache: true,
					},
				},
				draggable: true
			});
			balls.push(ball);
		}
	}
}());