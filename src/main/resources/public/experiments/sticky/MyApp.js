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

		testSticky();
		worldManager.start();
	}

	function testSticky() {
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
			x: 800, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'red' }
				}
			},
			fixtureDefOpts: { restitution: 0.1, isTarget: true },
		});

		var box = worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
			shape: 'box',
			boxOpts: { width: 50, height: 300 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'red' }
				}
			},
			fixtureDefOpts: { density: 10, restitution: 0, isTarget: true, hardness: 50 }
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
					var windOn = worldManager.getWind().isOn();
					if (windOn)
						worldManager.getWind().stop();
					else
						worldManager.getWind().start();
				}
			},
			37: { // left arrow
				onkeydown: function (e) {
					aim.b2body.ApplyForce(new box2d.b2Vec2(-100, 0), aim.b2body.GetWorldCenter());
				},
				keepPressed: true
			},
			38: { // up arrow
				onkeydown: function (e) {
					aim.b2body.ApplyForce(new box2d.b2Vec2(0, -100), aim.b2body.GetWorldCenter());
				},
				keepPressed: true
			},
			39: { // right arrow
				onkeydown: function (e) {
					aim.b2body.ApplyForce(new box2d.b2Vec2(100, 0), aim.b2body.GetWorldCenter());
				},
				keepPressed: true
			},
			40: { // down arrow
				onkeydown: function (e) {
					aim.b2body.ApplyForce(new box2d.b2Vec2(0, 100), aim.b2body.GetWorldCenter());
				},
				keepPressed: true
			}
		});

		worldManager.createWind({
			numRays: 50,
			power: 2500,
			on: false,
			directionTo: 'left',
			adjustX: 80
		});

		var mouseX, mouseY;
		worldManager.createMultiTouchHandler({
			drawLocation: false,
			onmousedown: function (e) {
				var aimX = aim.getPosition().x;
				var aimY = aim.getPosition().y;

				var dirX = mouseX - aimX;
				var dirY = mouseY - aimY;
				var theta = Math.atan2(dirY, dirX);
				if (theta < 0)
					theta += 2 * Math.PI;
				var angle = theta * (180 / Math.PI);

				console.log(angle);

				var bullet = worldManager.createEntity({
					type: 'dynamic',
					x: aimX, y: aimY, angle: angle,
					shape: 'box',
					polygonOpts: {
						points: [{ x: -40, y: 0 }, { x: 0, y: -2 }, { x: 10, y: 0 }, { x: 0, y: 2 }]
					},
					circleOpts: { radius: 5 },
					boxOpts: { width: 10, height: 10 },
					render: {
						type: 'draw',
						drawOpts: {
							bgColorStyle: 'solid',
							bgSolidColorOpts: { color: 'black' }
						}
					},
					bodyDefOpts: { bullet: false },
					fixtureDefOpts: { density: 15, restitution: 0.1, isSticky: true, filterGroupIndex: -1 }
				});

				bullet.b2body.ApplyImpulse(new box2d.b2Vec2(dirX, dirY), bullet.b2body.GetWorldCenter());
			},
			onmousemove: function (e) {
				mouseX = e.x;
				mouseY = e.y;
			}
		});

		worldManager.createContactHandler({
			stickyTargetOpts: {
				preSolveStick: false
			}
		});

		var aim = worldManager.createEntity({
			type: 'dynamic',
			x: 20, y: 250,
			shape: 'polygon',
			polygonOpts: {
				points: [{ x: -10, y: 0 }, { x: 0, y: -10 }, { x: 10, y: 0 }, { x: 0, y: 10 }],
				// points: [{ x: 0, y: -10 }, { x: -10, y: 0 }, { x: 0, y: 10 }, { x: 50, y: 0 }],
				// points: [{ x: 0, y: 10 }, { x: 10, y: 30 }, { x: 60, y: 20 }, { x: 20, y: 0 }],
			},
			boxOpts: { width: 20, height: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'blue' },
					textOpts: {
						text: 'I'
					},
					// cache: true
				},
				// filters: [greyScaleFilter]
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: { density: 10, restitution: 0, filterGroupIndex: -1 },
			draggable: false,
			noGravity: true
		});
	}

}());