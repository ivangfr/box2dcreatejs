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
					'../../images/tire.png',
					'../../images/wall.jpg',
				],
				onComplete: testSlice
			}
		});
	}

	function testSlice() {
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

		worldManager.createMultiTouchHandler({
			enableSlice: true,
			sliceOpts: {
				lineColor: 'yellow',
				lineWidth: 4
			}
		});

		var valDrag = worldManager.getMultiTouchHandler().getEnableDrag();
		var valSlice = worldManager.getMultiTouchHandler().getEnableSlice();
		output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice;
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
					valDrag = !worldManager.getMultiTouchHandler().getEnableDrag();
					worldManager.getMultiTouchHandler().setEnableDrag(valDrag);
					output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice;
				}
			},
			83: { // s
				onkeydown: function (e) {
					valSlice = !worldManager.getMultiTouchHandler().getEnableSlice()
					worldManager.getMultiTouchHandler().setEnableSlice(valSlice);
					output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice;
				}
			}
		});

		var box = worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 100, angle: 5,
			shape: 'box',
			boxOpts: { width: 60, height: 120 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			sliceable: true,
			noGravity: true,
			events: {
				ontick: function (e) {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(10, 0), this.getB2Body().GetWorldCenter());
				}
			}
		});

		var box3 = worldManager.createEntity({
			type: 'static',
			x: 700, y: 100, angle: 5,
			shape: 'box',
			boxOpts: { width: 60, height: 120 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'gray' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			sliceable: true,
			noGravity: true
		});

		var box2 = worldManager.createEntity({
			type: 'dynamic',
			x: 200, y: 400,
			shape: 'box',
			boxOpts: { width: 100, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					bgImage: '../../images/wall.jpg',
					adjustBgImageSize: false
				}
			},
			sliceable: true,
			noGravity: true,
			events: {
				onslice: function (e1, e2) {
					e1.changeRender({
						type: 'draw',
						drawOpts: {
							bgColorStyle: 'solid',
							bgSolidColorOpts: { color: 'gray' },
							borderWidth: 2, borderColor: 'black'
						}
					});
					e2.changeRender({
						type: 'draw',
						drawOpts: {
							bgColorStyle: 'solid',
							bgSolidColorOpts: { color: 'white' },
							borderWidth: 2, borderColor: 'black'
						}
					});
				}
			}
		});

		var circle = worldManager.createEntity({
			type: 'dynamic',
			x: 800, y: 400,
			shape: 'circle',
			circleOpts: { radius: 50 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					bgImage: '../../images/tire.png',
					adjustBgImageSize: true
				}
			},
			sliceable: true,
			noGravity: true
		});

		var triangle = worldManager.createEntity({
			type: 'dynamic',
			x: 600, y: 200,
			shape: 'polygon',
			polygonOpts: { points: [{ x: -80, y: 0 }, { x: 0, y: -80 }, { x: 80, y: 0 }] },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			bodyDefOpts: { angularVelocity: 30 },
			sliceable: true
		});
	}

}());