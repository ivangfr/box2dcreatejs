this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	var worldManager;

	var _os;

	var _hintElem, _helpElem, _scoreElem, _freeBlocks;
	var _soundHandler;
	var _countTick = 0, _numBreaks = 0;
	var _startTime;

	var _fish, _fishDir = -1, _water, _blocks = [];

	var BLOCK_DIM = 80, BLOCK_BORDER_WIDTH = 3;
	var BLOCK_SIZE = BLOCK_DIM + 2 * BLOCK_BORDER_WIDTH;

	var CATEGORY_BLOCK = 0x0001;
	var CATEGORY_SCENERY = 0x0002;

	function MyApp() {
		this.initialize();
	}

	MyGameBuilder.MyApp = MyApp;

	MyApp.prototype.initialize = function () {
		var easeljsCanvas = document.getElementById("easeljsCanvas");
		var box2dCanvas = document.getElementById("box2dCanvas");

		_helpElem = document.getElementById("help");
		_hintElem = document.getElementById("hint");
		_scoreElem = document.getElementById("score");

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
					{ src: '../../sounds/stream-3.mp3', id: 'stream' },
					{ src: '../../sounds/bird_chirping_1.mp3', id: 'birds' },
					{ src: '../../sounds/shotgun.mp3', id: 'explosion' },
					{ src: '../../sounds/slice.mp3', id: 'slice' },
					'../../images/cloud.png',
					'../../images/fish.png',
					'../../images/background_river.jpg'
				],
				onComplete: function () {
					showHelp();
					startWorld();
				}
			}
		});

		_os = worldManager.createBrowserOSHandler().getOS();
	}

	function showHelp() {
		_helpElem.style.display = 'block';
		setTimeout(function () {
			startCountingDown();
		}, 3000);
	}

	function startCountingDown() {
		_hintElem.innerHTML = 'Use the mouse to break or slice the blocks!!!';
		_hintElem.style.display = 'block';

		setTimeout(function () {
			_hintElem.innerHTML = 'READY??';
			setTimeout(function () {
				_hintElem.innerHTML = 'GGGOOO!!!';

				_scoreElem.innerHTML = '0';
				_scoreElem.style.display = 'block';

				_helpElem.style.display = 'none';

				setTimeout(function () {
					_hintElem.style.display = 'none';
					_freeBlocks = true;
				}, 2000);
			}, 2000);
		}, 5000);
	}

	function startWorld() {

		_soundHandler = worldManager.createSoundHandler();

		_soundHandler.createSoundInstance({
			id: 'stream'
		}).myPlay({
			loop: -1,
			volume: 0.3
		});

		_soundHandler.createSoundInstance({
			id: 'birds'
		}).myPlay({
			loop: -1,
			volume: 0.1
		});

		worldManager.createMultiTouchHandler({
			enableDrag: false,
			enableSlice: true,
			sliceOpts: {
				lineWidth: 10,
				lineColor: 'yellow'
			},
			onmousedown: function (e) {
				var breakHandler, explosion;
				var x = e.x || e.clientX;
				var y = e.y || e.clientY;

				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				if (entities.length > 0) {

					for (var i = 0; i < entities.length; i++) {
						var entity = entities[i];

						if (entity.b2body.GetUserData().group == 'breakable') {
							breakHandler = new MyGameBuilder.BreakHandler(worldManager, {
								numCuts: 1
							});
							breakHandler.breakEntity(entity, x, y);

							createExplosion(x, y);
						}
						else if (entity.b2body.GetUserData().name == 'fish' && _fishDir != 0) {
							if (_fishDir == 1)
								_fish.b2body.view.gotoAndPlay("turnLeftDie");
							else
								_fish.b2body.view.gotoAndPlay("die");
							_fishDir = 0;
							_fish.b2body.GetFixtureList().SetDensity(0.8);

							createExplosion(x, y);
						}
					}
				}
			}
		});

		worldManager.createKeyboardHandler({
			68: { //d
				onkeydown: function (e) {
					worldManager.setEnableDebug(!worldManager.getEnableDebug());
				}
			}
		});

		worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid'
					},
					opacity: 0.1
				}
			}
		});

		var contactHandler = worldManager.createContactHandler({
			enabledBuoyancy: true,
			enabledStickyTarget: false,
			beginContact: function (contact) {
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();
				var pieceBlock;

				if ((bodyA.GetUserData().group == 'breakable' && bodyB.GetUserData().group == 'water_floor') ||
					(bodyB.GetUserData().group == 'breakable' && bodyA.GetUserData().group == 'water_floor')) {
					if (bodyA.GetUserData().group == 'breakable')
						pieceBlock = bodyA;
					else
						pieceBlock = bodyB;

					pieceBlock.GetUserData().group = 'unbreakable';
					pieceBlock.GetUserData().sliceable = false;
				}
			},
			endContact: function (contact) {
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();
			}
		});

		worldManager.setUserOnTick(function () {
			var entity;

			_countTick++;
			if (_countTick % 120 == 0) {

				//FISH
				if (_fishDir != 0) {
					if (_countTick % 480 == 0) {
						if (_fishDir != -1) {
							_fish.b2body.view.gotoAndPlay("turnLeft");
							_fishDir = -1;
						}
						else {
							_fish.b2body.view.gotoAndPlay("turnRight");
							_fishDir = 1;
						}
						_fish.b2body.SetLinearVelocity({ x: 1 * _fishDir, y: 0 });
					}
					else
						_fish.b2body.SetLinearVelocity({ x: 5 * _fishDir, y: 0 });
				}

				//BLOCKS
				if (_freeBlocks && _blocks.length > 0) {
					block = _blocks[0];
					block.entity.b2body.SetLinearVelocity(block.bodyDefOpts.linearVelocity);
					block.entity.b2body.SetAngularVelocity(block.bodyDefOpts.angularVelocity);

					_blocks.splice(0, 1);

					console.log(_countTick);
				}
				if (_countTick == 2040) {
					_hintElem.innerHTML = 'FINISHED!!!';
					_hintElem.style.display = 'block';

					setTimeout(function () {
						_hintElem.innerHTML = "Try again!!!"
						setTimeout(function () {
							worldManager.getTimeStepHandler().pause();
						}, 3000);
					}, 4000);
				}
			}
		});

		buildBackground();
		buildFloor();
		buildWalls();
		createBlocks(10);
		buildWater();
	}

	function buildBackground() {
		worldManager.createLandscape({
			x: 490, y: 250,
			shape: 'box',
			boxOpts: { width: 980, height: 500 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					bgImage: '../../images/background_river.jpg',
					adjustBgImageSize: true
				}
			}
		});

		var cloud1 = worldManager.createLandscape({
			x: 0, y: 200,
			shape: 'box',
			boxOpts: { width: 200, height: 150 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/cloud.png',
					adjustImageSize: true,
				},
				action: function () {
					cloud1.view.x += 0.1;
				}
			}
		});

		var cloud2 = worldManager.createLandscape({
			x: 200, y: 100,
			shape: 'box',
			boxOpts: { width: 315, height: 243 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/cloud.png',
					adjustImageSize: false,
				},
				action: function () {
					cloud2.view.x += 0.2;
				}
			}
		});

		_fish = worldManager.createEntity({
			type: 'dynamic',
			x: 800, y: 430,
			shape: 'box',
			boxOpts: { width: 85, height: 60 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/fish.png'],
						animations: {
							'normalLeft': [0, 9, 'normalLeft', 0.25],
							'normalRight': [19],
							'turnRight': [10, 19, 'normalRight', 0.25],
							'turnLeft': {
								frames: [19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
								next: "normalLeft",
								speed: 0.25
							},
							'turnLeftDie': {
								frames: [19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
								next: "die",
								speed: 0.25
							},
							'die': [20, 39, 'dead', 0.25],
							'dead': [39]
						},
						frames: { 'height': 85, 'width': 80 }
					},
					startAnimation: 'normalLeft',
					adjustImageSize: false
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: {
				density: 1.0,
				filterCategoryBits: CATEGORY_BLOCK,
				filterMaskBits: CATEGORY_SCENERY
			},
			name: 'fish'
		});
	}

	function buildWalls() {
		var i, aWalls = [];
		aWalls.push({ x: -110, y: 440 });
		aWalls.push({ x: 1090, y: 440 });

		for (i = 0; i < aWalls.length; i++) {
			worldManager.createEntity({
				type: 'static',
				x: aWalls[i].x, y: aWalls[i].y,
				shape: 'box',
				boxOpts: { width: 20, height: 100 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: '#000' }
					}
				},
				fixtureDefOpts: {
					filterCategoryBits: CATEGORY_SCENERY,
					filterMaskBits: CATEGORY_BLOCK
				},
				group: 'water_floor'
			});
		}
	}

	function buildFloor() {
		worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 1180, height: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: '#000' }
				}
			},
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_SCENERY,
				filterMaskBits: CATEGORY_BLOCK
			},
			group: 'water_floor'
		});
	}

	function buildWater() {
		_water = worldManager.createEntity({
			type: 'static',
			x: 490, y: 440,
			shape: 'box',
			boxOpts: { width: 1180, height: 100 },
			render: {
				type: 'draw',
				opacity: 0.6,
				drawOpts: {
					bgColorStyle: 'linearGradient',
					bgLinearGradientOpts: { colors: ['#96cdeb', '#3e5269'] }
				}
			},
			fixtureDefOpts: {
				isFluid: true, dragConstant: 0.25, liftConstant: 0.25,
				filterCategoryBits: CATEGORY_SCENERY,
				filterMaskBits: CATEGORY_BLOCK
			},
			group: 'water_floor'
		});
	}

	function createBlocks(num) {
		var i, x, y, dir, angVel;
		var block, entity, bodyDefOpts;

		for (i = 0; i < num; i++) {
			block = {};

			y = randomIntFromInterval(BLOCK_SIZE / 2, 500 - 130 - BLOCK_SIZE / 2);
			if (randomIntFromInterval(0, 1) == 0) {
				x = 980 + BLOCK_SIZE / 2;
				dir = -1;
			}
			else {
				x = 0 - BLOCK_SIZE / 2;
				dir = 1;
			}

			angVel = randomIntFromInterval(0, 2);
			if (angVel == 2) angVel = 10;
			else if (angVel == 1) angVel = 5;

			block.entity = worldManager.createEntity({
				type: 'dynamic',
				x: x, y: y,
				shape: 'box',
				boxOpts: { width: BLOCK_DIM, height: BLOCK_DIM },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: '#ccc' },
						borderWidth: BLOCK_BORDER_WIDTH
					}
				},
				bodyDefOpts: {
					linearDamping: 0
				},
				fixtureDefOpts: {
					density: 0.8,
					filterCategoryBits: CATEGORY_BLOCK,
					filterMaskBits: CATEGORY_SCENERY
				},
				noGravity: true,
				sliceable: true,
				group: 'breakable',
				events: {
					onbreak: fnOnBreak,
					onslice: fnOnSlice
				}
			});

			block.bodyDefOpts = {
				linearVelocity: { x: dir * 15, y: 0 },
				angularVelocity: angVel
			};

			_blocks.push(block);
		}
	}

	function fnOnBreak(e1, e2) {
		var i, area, vel, dir, aE = [];
		if (e1) aE.push(e1);
		if (e2) aE.push(e2);

		dir = 1;
		for (i = 0; i < aE.length; i++) {
			area = getArea(aE[i].b2body.GetFixtureList().GetShape().GetVertices());
			if (area < 0.02) {
				console.log('entity deleted, very small : ' + area);
				worldManager.deleteEntity(aE[i]);
				continue;
			}

			vel = {}
			vel.x = aE[i].b2body.GetLinearVelocity().x / 2;
			vel.y = 3 * dir;

			aE[i].b2body.GetUserData().noGravity = false;
			aE[i].b2body.SetLinearVelocity(vel);

			dir = -1;
		}

		_numBreaks++;
		_scoreElem.innerHTML = _numBreaks;
	}

	function fnOnSlice(e1, e2) {
		fnOnBreak(e1, e2);
		_soundHandler.createSoundInstance({
			id: 'slice'
		}).play();
	}

	function createExplosion(x, y) {
		var shot = worldManager.createEntity({
			type: 'static',
			x: x, y: y,
			shape: 'circle',
			circleOpts: { radius: 10 },
			render: {
				type: 'draw',
				opacity: 0.8,
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'yellow' }
				}
			},
			bodyDefOpts: { fixedRotation: true }
		});

		_soundHandler.createSoundInstance({
			id: 'explosion'
		}).play();

		setTimeout(function () {
			worldManager.deleteEntity(shot);
		}, 300);
	}

}());