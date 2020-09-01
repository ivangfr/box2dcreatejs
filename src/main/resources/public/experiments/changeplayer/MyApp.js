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
			world: new box2d.b2World(new box2d.b2Vec2(0, 0), true)
		});

		testChangePlayer();
		worldManager.start();
	}

	function testChangePlayer() {
		var renderStatic = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#000' }
			}
		};

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 500,
			shape: 'box',
			boxOpts: { width: 1960, height: 10 },
			render: renderStatic,
			name: 'floor'
		});

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 0,
			shape: 'box',
			boxOpts: { width: 1960, height: 10 },
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
			x: 1960, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: renderStatic
		});

		worldManager.createLandscape({
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 1960, height: 500 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'radialGradient',
					bgRadialGradientOpts: { colors: ['#fff', '#3399cc'] }
				}
			}
		});

		worldManager.createMultiTouchHandler({
			onmousedown: function (e) {
				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				if (entities.length > 0) {

					var selectedEntity = null;
					for (var i = 0; i < entities.length; i++) {
						var entity = entities[i];
						if (entity.getGroup() !== 'square')
							continue;

						if (!entity.isSelected) {
							entity.changeRender(renderSelected);
							entity.isSelected = true;
							selectedEntity = entity;
						}

						var player = worldManager.getPlayerByItsEntity(entity);
						worldManager.setPlayer(player);
					}

					var allEntities = worldManager.getEntities();
					for (var i = 0; i < allEntities.length; i++) {
						var ent = allEntities[i];
						if (ent.getGroup() !== 'square')
							continue;

						if (worldManager.getPlayerByItsEntity(ent) && selectedEntity !== null && ent !== selectedEntity) {
							ent.isSelected = false;
							ent.changeRender(renderUnselected);
						}
					}
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
			49: { // 1
				onkeydown: function (e) {
					var player = worldManager.getPlayer();
					var isOn = player.getCamera().getXAxisOn();
					if (isOn) {
						player.getCamera().setXAxisOn(false);
						player.getCamera().setAdjustX(-player.getPosition().x + 490);
					}
					else {
						player.getCamera().setXAxisOn(true);
						player.getCamera().setAdjustX(490);
					}
				}
			},
			37: { // left arrow
				onkeydown: function (e) {
					worldManager.getPlayer().left();
				},
				keepPressed: true
			},
			38: { // up arrow
				onkeydown: function (e) {
					worldManager.getPlayer().up();
				},
				keepPressed: true
			},
			39: { // right arrow
				onkeydown: function (e) {
					worldManager.getPlayer().right();
				},
				keepPressed: true
			},
			40: { // down arrow
				onkeydown: function (e) {
					worldManager.getPlayer().down();
				},
				keepPressed: true
			}
		});

		var renderSelected = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'yellow' },
				borderWidth: 2, borderColor: 'black', borderRadius: 10
			},
		};

		var renderUnselected = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#fff' },
				borderWidth: 2, borderColor: 'black', borderRadius: 10
			},
			opacity: 0.5
		};

		var entity1 = worldManager.createEntity({
			x: 100, y: 150,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			type: 'dynamic',
			render: renderUnselected,
			draggable: true,
			group: 'square'
		});
		entity1.isSelected = false;

		var player1 = worldManager.createPlayer(entity1, {
			camera: {
				adjustX: 490,
				xAxisOn: true
			},
			events: {
				up: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -100), this.getB2Body().GetWorldCenter());
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 100), this.getB2Body().GetWorldCenter());
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100, 0), this.getB2Body().GetWorldCenter());
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100, 0), this.getB2Body().GetWorldCenter());
				}
			}
		});

		var entity2 = worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 300,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: renderUnselected,
			draggable: true,
			group: 'square'
		});
		entity2.isSelected = false;

		var player2 = worldManager.createPlayer(entity2, {
			camera: {
				adjustX: 490,
				xAxisOn: true
			},
			events: {
				up: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -100), this.getB2Body().GetWorldCenter());
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 100), this.getB2Body().GetWorldCenter());
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100, 0), this.getB2Body().GetWorldCenter());
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100, 0), this.getB2Body().GetWorldCenter());
				}
			}
		});

		var entity3 = worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 450,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: renderSelected,
			draggable: true,
			group: 'square'
		});
		entity3.isSelected = true;

		var player3 = worldManager.createPlayer(entity3, {
			camera: {
				adjustX: 490,
				xAxisOn: true
			},
			events: {
				up: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -100), this.getB2Body().GetWorldCenter());
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 100), this.getB2Body().GetWorldCenter());
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100, 0), this.getB2Body().GetWorldCenter());
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100, 0), this.getB2Body().GetWorldCenter());
				}
			}
		});

		for (var i = 0; i < 10; i++) {
			worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 980,
				y: Math.random() * 500,
				shape: 'circle',
				circleOpts: { radius: 25 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: '#fff' },
						borderWidth: 2,
						borderColor: 'black',
					},
					opacity: 0.5
				},
				draggable: true
			});
		}
	}

}());