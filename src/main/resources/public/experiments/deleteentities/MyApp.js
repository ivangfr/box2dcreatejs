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
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		});

		testDeleteEntities();
		worldManager.start();
	}

	function testDeleteEntities() {
		var renderStatic = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#8a8a8a' }
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

		for (var i = 0; i < 20; i++) {
			worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 980,
				y: Math.random() * 500,
				shape: 'circle',
				circleOpts: { radius: 30 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'white' },
						borderWidth: 2, borderColor: 'black'
					}
				},
				group: 'ball'
			});
		}

		var square = worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'box',
			boxOpts: { width: 60, height: 60 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			draggable: true,
			noGravity: true
		});

		var ball = worldManager.createEntity({
			type: 'dynamic',
			x: Math.random() * 980,
			y: Math.random() * 500,
			shape: 'circle',
			circleOpts: { radius: 30 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			group: 'ball',
			noGravity: true
		});

		worldManager.createLink({
			entityA: square,
			entityB: ball,
			type: 'revolute',
			localAnchorA: { x: 0, y: 2 }
		});

		worldManager.createMultiTouchHandler({
			enableDrag: true,
			onmousedown: function (e) {
				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				for (var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					if (entity.getGroup() == 'ball')
						worldManager.deleteEntity(entity);
				}
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
			65: { // a
				onkeydown: function (e) {
					worldManager.deleteEntity(square);
				}
			}
		});
	}

}());