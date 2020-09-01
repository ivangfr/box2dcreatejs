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
					'../../images/leftarrow.png',
					'../../images/rightarrow.png',
					'../../images/ball.png',
				],
				onComplete: testButtonPressed
			}
		});
	}

	function testButtonPressed() {
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
				createBullet();
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
				createBullet();
			}
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
			49: { // 1
				onkeydown: function (e) {
					createBullet();
				},
				keepPressed: true
			},
			50: { // 2
				onkeydown: function (e) {
					console.log('down' + e.which);
					createBullet();
				},
				onkeyup: function (e) {
					console.log('up' + e.which);
				}
			}
		});

		worldManager.createMultiTouchHandler({
			radius: 20,
			accurate: false,
			drawLocation: true,
			onmousedown: function (e) {
				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				for (var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					worldManager.deleteEntity(entity);
				}
			},
			onmousemove: function (e) {
				var x = e.x || e.clientX;
				var y = e.y || e.clientY;
				output.innerHTML = x + ':' + y;
				if (!worldManager.getMultiTouchHandler().isTouchable() && !worldManager.getMultiTouchHandler().isMouseDown())
					return;

				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				for (var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					worldManager.deleteEntity(entity);
				}
			}
		});

		for (var i = 0; i < 200; i++) {
			worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 980,
				y: Math.random() * 400,
				shape: 'circle',
				circleOpts: { radius: 10 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'black' }
					}
				},
				draggable: true
			});
		}

		function createBullet() {
			var ball = worldManager.createEntity({
				type: 'dynamic',
				x: 50, y: 100,
				shape: 'circle',
				circleOpts: { radius: 30 },
				render: {
					type: 'image',
					imageOpts: {
						image: '../../images/ball.png',
						adjustImageSize: true
					}
				},
				draggable: true
			});
			ball.b2body.ApplyImpulse(new box2d.b2Vec2(-300, 0), ball.b2body.GetWorldCenter());
		}
	}

}());