this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	var worldManager;

	var _os, _countTick = 0, _score;

	var _hintElem;
	var _soundHandler;
	var _freeFire = false, _gameOver = false;

	var _numHitAircraft = 0, _numHitUfo = 0;

	var _aircraft, _player, _aircraftDir = 0, _missile = null, _missilesStored = [], _missilesFlying = [], _missileLink;
	var _ufo, _laser, _lasers = [], _laserLink;
	var _vP = [0.5, 1, 2, 4];

	var CATEGORY_AIRCRAFT = 0x0001;
	var CATEGORY_ENEMY = 0x0002;
	var CATEGORY_LIMITS = 0x0004;
	var CATEGORY_EARTH = 0x0016;
	var CATEGORY_MOON = 0x0008;

	function MyApp() {
		this.initialize();
	}

	MyGameBuilder.MyApp = MyApp;

	MyApp.prototype.initialize = function () {
		var easeljsCanvas = document.getElementById("easeljsCanvas");
		var box2dCanvas = document.getElementById("box2dCanvas");

		_hintElem = document.getElementById("hint");

		worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			showFPSIndicator: true,
			world: new box2d.b2World(new box2d.b2Vec2(0, 0), true),
			preLoad: {
				showLoadingIndicator: true,
				loadingIndicatorOpts: {
					x: 420,
					y: 210,
					font: 'bold italic 30px Verdana',
					color: 'white'
				},
				files: [
					'../../images/ufo.png',
					'../../images/aircraft.png',
					'../../images/earth.png',
					'../../images/moon.png',
					'../../images/atomic_explosion.png',
					'../../images/explosion_small.png',
					{ src: '../../sounds/lifes_a_breeze.mp3', id: 'music' },
					{ src: '../../sounds/explosion-01.mp3', id: 'explosion' },
					{ src: '../../sounds/laser.mp3', id: 'laser' },
					{ src: '../../sounds/handgun_dry_fire.mp3', id: 'dry_fire' },
					{ src: '../../sounds/gunshot_rifle_exterior.mp3', id: 'missile' },
					{ src: '../../sounds/radio_bravo.mp3', id: 'bravo' },
					{ src: '../../sounds/radio_weak_fix_on_that_position_.mp3', id: 'fix_on_that_position' },
					{ src: '../../sounds/aliens_talking.mp3', id: 'aliens' },
					{ src: '../../sounds/crowd_applause.mp3', id: 'applause' }
				],
				onComplete: function () {
					startWorld();
					startCountingDown();
				}
			}
		});

		_os = worldManager.createBrowserOSHandler().getOS();
	}

	function startCountingDown() {
		_hintElem.innerHTML = 'Human vs Alien!!!';
		_hintElem.style.display = 'block';

		setTimeout(function () {
			_hintElem.innerHTML = 'READY??';
			setTimeout(function () {
				_hintElem.innerHTML = 'FIGHT!!!';

				_freeFire = true;

				setTimeout(function () {
					_hintElem.style.display = 'none';
				}, 2000);
			}, 2000);
		}, 3000);
	}

	function updateScore() {
		var newRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: '#6B6DB5' },
				textOpts: {
					text: getScoreNumbers(),
					font: 'bold 20px Courier',
					color: 'white'
				},
				borderWidth: 0
			}
		};

		if (!_score) {
			_score = worldManager.createLandscape({
				x: 490,
				y: 15,
				shape: 'box',
				boxOpts: { width: 100, height: 20 },
				render: newRender
			});
		}
		else {
			_score.changeRender(newRender);
		}
	}

	function getScoreNumbers() {
		return '[' + _missilesStored.length + '] ' + _numHitUfo + ' x ' + _numHitAircraft + ' [' + _lasers.length + ']';
	}

	function startWorld() {

		worldManager.createLandscape({
			x: 490, y: 250,
			shape: 'box',
			boxOpts: { width: 980, height: 500 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: '#6B6DB5' }
				}
			}
		});

		worldManager.setUserOnTick(function () {
			if (_gameOver)
				return;

			_countTick++;

			updateScore();

			if (_missilesStored.length == 0 && _lasers.length == 0) {
				_gameOver = true;
				setTimeout(function () {
					if (_numHitUfo > _numHitAircraft) {
						_hintElem.innerHTML = 'Human wins';
						_soundHandler.createSoundInstance({
							id: 'applause'
						}).play();
					}
					else if (_numHitUfo < _numHitAircraft) {
						_hintElem.innerHTML = 'Alien wins';
						_soundHandler.createSoundInstance({
							id: 'aliens'
						}).play();
					}
					else
						_hintElem.innerHTML = 'Draw game';
					_hintElem.style.display = 'block';

					setTimeout(function () {
						worldManager.getTimeStepHandler().pause();
					}, 3000);

				}, 5000);
			}
		});

		_soundHandler = worldManager.createSoundHandler();

		_soundHandler.createSoundInstance({
			id: 'music'
		}).myPlay({
			loop: -1,
			volume: 1
		});

		worldManager.createKeyboardHandler({
			68: { //d
				onkeydown: function (e) {
					worldManager.setEnableDebug(!worldManager.getEnableDebug());
				}
			},
			38: { //up arrow
				onkeydown: function (e) {
					_player.up();
				},
				onkeyup: function (e) {
					_player.upNormal();
				},
				keepPressed: true
			},
			40: { //down arrow
				onkeydown: function (e) {
					_player.down();
				},
				onkeyup: function (e) {
					_player.downNormal();
				},
				keepPressed: true
			},
			65: { //a
				onkeydown: function (e) {
					_player.fire();
				}
			},
			83: { //s
				onkeydown: function (e) {
					if (worldManager.getTimeStepHandler().isPaused())
						worldManager.getTimeStepHandler().play();
					else
						worldManager.getTimeStepHandler().pause();
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
			enabledBuoyancy: false,
			enabledStickyTarget: false,
			enabledBreak: false,
			beginContact: function (contact) {
				var projectileEntity, moonEntity;
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();

				if ((bodyA.GetUserData().group == 'missile' && bodyB.GetUserData().group == 'limit') ||
					(bodyB.GetUserData().group == 'missile' && bodyA.GetUserData().group == 'limit')) {
					if (bodyA.GetUserData().group == 'missile')
						projectileEntity = worldManager.getEntityByItsBody(bodyA);
					else
						projectileEntity = worldManager.getEntityByItsBody(bodyB);

					removeFromMissilesFlying(projectileEntity);
					worldManager.deleteEntity(projectileEntity);
				}
				else if ((bodyA.GetUserData().group == 'laser' && bodyB.GetUserData().group == 'limit') ||
					(bodyB.GetUserData().group == 'laser' && bodyA.GetUserData().group == 'limit')) {
					if (bodyA.GetUserData().group == 'laser')
						projectileEntity = worldManager.getEntityByItsBody(bodyA);
					else
						projectileEntity = worldManager.getEntityByItsBody(bodyB);

					worldManager.deleteEntity(projectileEntity);
				}
				else if ((bodyA.GetUserData().group == 'missile' && bodyB.GetUserData().name == 'moon') ||
					(bodyB.GetUserData().group == 'missile' && bodyA.GetUserData().name == 'moon')) {
					if (bodyA.GetUserData().group == 'missile') {
						projectileEntity = worldManager.getEntityByItsBody(bodyA);
						moonEntity = worldManager.getEntityByItsBody(bodyB);
					}
					else {
						projectileEntity = worldManager.getEntityByItsBody(bodyB);
						moonEntity = worldManager.getEntityByItsBody(bodyA);
					}

					removeFromMissilesFlying(projectileEntity);
					worldManager.deleteEntity(projectileEntity);
					createMoonExplosion(projectileEntity, moonEntity);
				}
				else if ((bodyA.GetUserData().group == 'laser' && bodyB.GetUserData().name == 'moon') ||
					(bodyB.GetUserData().group == 'laser' && bodyA.GetUserData().name == 'moon')) {
					if (bodyA.GetUserData().group == 'laser') {
						projectileEntity = worldManager.getEntityByItsBody(bodyA);
						moonEntity = worldManager.getEntityByItsBody(bodyB);
					}
					else {
						projectileEntity = worldManager.getEntityByItsBody(bodyB);
						moonEntity = worldManager.getEntityByItsBody(bodyA);
					}

					worldManager.deleteEntity(projectileEntity);
					createMoonExplosion(projectileEntity, moonEntity);
				}
				else if ((bodyA.GetUserData().group == 'missile' && bodyB.GetUserData().name == 'ufo') ||
					(bodyB.GetUserData().group == 'missile' && bodyA.GetUserData().name == 'ufo')) {
					_numHitUfo++;

					if (bodyA.GetUserData().group == 'missile')
						projectileEntity = worldManager.getEntityByItsBody(bodyA);
					else
						projectileEntity = worldManager.getEntityByItsBody(bodyB);

					removeFromMissilesFlying(projectileEntity);
					worldManager.deleteEntity(projectileEntity);
					createExplosion(projectileEntity);

					if (_numHitUfo % 2 == 0) {
						_soundHandler.createSoundInstance({
							id: 'bravo'
						}).play();
					}
				}
				else if ((bodyA.GetUserData().group == 'laser' && bodyB.GetUserData().name == 'aircraft') ||
					(bodyB.GetUserData().group == 'laser' && bodyA.GetUserData().name == 'aircraft')) {
					_numHitAircraft++;

					if (bodyA.GetUserData().group == 'laser')
						projectileEntity = worldManager.getEntityByItsBody(bodyA);
					else
						projectileEntity = worldManager.getEntityByItsBody(bodyB);

					worldManager.deleteEntity(projectileEntity);
					createExplosion(projectileEntity);

					if (_numHitAircraft % 2 == 0) {
						_soundHandler.createSoundInstance({
							id: 'fix_on_that_position'
						}).play();
					}
				}
				else if ((bodyA.GetUserData().group == 'laser' && bodyB.GetUserData().group == 'missile') ||
					(bodyB.GetUserData().group == 'laser' && bodyA.GetUserData().group == 'missile')) {
					if (bodyA.GetUserData().group == 'missile') {
						projectileEntity = worldManager.getEntityByItsBody(bodyA);
						worldManager.deleteEntity(worldManager.getEntityByItsBody(bodyB));
					}
					else {
						projectileEntity = worldManager.getEntityByItsBody(bodyB);
						worldManager.deleteEntity(worldManager.getEntityByItsBody(bodyA));
					}

					removeFromMissilesFlying(projectileEntity);
					worldManager.deleteEntity(projectileEntity);
					createExplosion(projectileEntity);
				}
			},
			endContact: function (contact) {
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();
			}
		});

		createLimits();
		createEarth();
		createMoon();

		createMissiles(100);
		createAircraft();
		loadAircraft();

		createLasers(100);
		createUfo();
		loadUfo();
	}

	function createMoonExplosion(projectileEntity, moonEntity) {
		var dirX = projectileEntity.getPosition().x - moonEntity.getPosition().x;
		var dirY = projectileEntity.getPosition().y - moonEntity.getPosition().y;
		var theta = Math.atan2(dirY, dirX);
		if (theta < 0)
			theta += 2 * Math.PI;
		var angle = theta * (180 / Math.PI)

		var up = true;
		var explosion = worldManager.createLandscape({
			x: projectileEntity.getPosition().x,
			y: projectileEntity.getPosition().y,
			angle: angle + 90,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				z: moonEntity.b2body.GetUserData().render.z,
				opacity: 0,
				type: 'image',
				imageOpts: {
					image: '../../images/atomic_explosion.png',
					adjustImageSize: true
				},
				action: function () {
					if (up) {
						explosion.view.alpha += 0.05;
						if (explosion.view.alpha > 1)
							up = false;
					}
					else {
						if (explosion.view.alpha > 0)
							explosion.view.alpha -= 0.01;
					}
				}
			}
		});

		_soundHandler.createSoundInstance({
			id: 'explosion'
		}).myPlay({
			volume: 0.7
		});
	}

	function createExplosion(projectileEntity) {
		worldManager.createLandscape({
			x: projectileEntity.getPosition().x,
			y: projectileEntity.getPosition().y,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'spritesheet',
				z: projectileEntity.b2body.GetUserData().render.z,
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/explosion_small.png'],
						animations: { 'normal': [47], 'explode': [1, 47, 'normal'] },
						frames: { 'height': 64, 'width': 64 },
					},
					startAnimation: 'explode',
					adjustImageSize: false
				}
			}
		});

		_soundHandler.createSoundInstance({
			id: 'explosion'
		}).myPlay({
			volume: 0.7
		});
	}

	function createLimits() {
		var i, limits = [];
		limits.push({ x: 490, y: -20, width: 980, height: 10 });
		limits.push({ x: 490, y: 520, width: 980, height: 10 });
		limits.push({ x: -20, y: 250, width: 10, height: 500 });
		limits.push({ x: 1000, y: 250, width: 10, height: 500 });

		for (i = 0; i < limits.length; i++) {
			worldManager.createEntity({
				type: 'static',
				x: limits[i].x, y: limits[i].y,
				shape: 'box',
				boxOpts: { width: limits[i].width, height: limits[i].height },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: '#000' }
					}
				},
				fixtureDefOpts: {
					restitution: 0,
					filterCategoryBits: CATEGORY_LIMITS,
					filterMaskBits: CATEGORY_AIRCRAFT | CATEGORY_ENEMY
				},
				group: 'limit'
			});
		}
	}

	function createEarth() {
		var earth = worldManager.createEntity({
			type: 'static',
			x: -250, y: 250,
			shape: 'circle',
			circleOpts: { radius: 400 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					bgImage: '../../images/earth.png',
					adjustBgImageSize: true
				}
			},
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_EARTH,
				filterMaskBits: CATEGORY_MOON
			},
			name: 'earth'
		});
	}

	function createMoon() {
		var moon = worldManager.createEntity({
			type: 'static',
			x: 490, y: 250,
			shape: 'circle',
			circleOpts: { radius: 70 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/moon.png',
					adjustImageSize: true
				}
			},
			fixtureDefOpts: {
				density: 10,
				filterCategoryBits: CATEGORY_MOON
			},
			name: 'moon'
		});

		worldManager.createGravitation(moon, {
			attractionPower: 0.5,
			render: {
				opacity: 0.3,
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'radialGradient',
					bgRadialGradientOpts: {
						colors: ['#ccc', '#6B6DB5'],
						r0: 70,
						r1: 210
					}
				}
			}
		});
	}

	function createMissiles(num) {
		var i;
		for (i = 0; i < num; i++) {
			var missile = worldManager.createEntity({
				type: 'dynamic',
				x: -100, y: 250,
				shape: 'box',
				boxOpts: { width: 10, height: 3 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'white' }
					}
				},
				fixtureDefOpts: {
					density: 0.5,
					filterCategoryBits: CATEGORY_AIRCRAFT,
					filterMaskBits: CATEGORY_ENEMY | CATEGORY_LIMITS | CATEGORY_MOON
				},
				group: 'missile'
			});
			_missilesStored.push(missile);
		}
	}

	function createAircraft() {
		_aircraft = worldManager.createEntity({
			type: 'dynamic',
			x: 50, y: 250,
			shape: 'box',
			boxOpts: { width: 50, height: 90 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/aircraft.png'],
						animations: {
							'normal': [12],
							'goUp': {
								frames: [12, 7, 2],
								next: false,
								speed: 0.25
							},
							'upNormal': {
								frames: [2, 7, 12],
								next: false,
								speed: 0.25
							},
							'goDown': {
								frames: [12, 17, 22],
								next: false,
								speed: 0.25
							},
							'downNormal': {
								frames: [22, 17, 12],
								next: false,
								speed: 0.25
							}
						},
						frames: { 'height': 100, 'width': 100 }
					},
					startAnimation: 'normal',
					adjustImageSize: false
				}
			},
			bodyDefOpts: {
				fixedRotation: true
			},
			fixtureDefOpts: {
				density: 20,
				restitution: 0,
				filterCategoryBits: CATEGORY_AIRCRAFT,
				filterMaskBits: CATEGORY_ENEMY | CATEGORY_LIMITS | CATEGORY_MOON
			},
			name: 'aircraft'
		});

		_player = worldManager.createPlayer(_aircraft, {
			camera: { xAxisOn: false, yAxisOn: false },
			events: {
				up: function () {
					_aircraft.b2body.ApplyForce(new box2d.b2Vec2(0, -7500), _aircraft.b2body.GetWorldCenter());
					if (_aircraftDir != -1)
						_aircraft.b2body.view.gotoAndPlay("goUp");
					_aircraftDir = -1;
				},
				down: function () {
					_aircraft.b2body.ApplyForce(new box2d.b2Vec2(0, 7500), _aircraft.b2body.GetWorldCenter());
					if (_aircraftDir != 1)
						_aircraft.b2body.view.gotoAndPlay("goDown");
					_aircraftDir = 1;
				},
				upNormal: function () {
					_aircraft.b2body.view.gotoAndPlay("upNormal");
					_aircraftDir = 0;
				},
				downNormal: function () {
					_aircraft.b2body.view.gotoAndPlay("downNormal");
					_aircraftDir = 0;
				},
				fire: function () {
					if (_freeFire) {
						if (_missile != null) {
							worldManager.getWorld().DestroyJoint(_missileLink.getJoint());
							_missile.b2body.SetLinearVelocity({ x: 10, y: 0 });

							_soundHandler.createSoundInstance({
								id: 'missile'
							}).myPlay({
								volume: 0.2
							});

							_missilesFlying.push(_missile);
							loadAircraft();
						}
						else {
							_soundHandler.createSoundInstance({
								id: 'dry_fire'
							}).myPlay({
								volume: 0.2
							});
						}
					}
				}
			}
		});
	}

	function loadAircraft() {
		if (_missilesStored.length > 0) {
			_missile = _missilesStored[0];
			_missile.setPosition(_aircraft.getPosition().x + 25, _aircraft.getPosition().y);
			_missilesStored.splice(0, 1);

			_missileLink = worldManager.createLink({
				entityA: _aircraft,
				entityB: _missile,
				type: 'weld'
			});
		}
		else
			_missile = null;
	}

	function removeFromMissilesFlying(missile) {
		var i;
		for (i = 0; i < _missilesFlying.length; i++) {
			if (_missilesFlying[i] === missile) {
				_missilesFlying.splice(i, 1);
				break;
			}
		}
	}

	function createLasers(num) {
		var i;
		for (i = 0; i < num; i++) {
			var laser = worldManager.createEntity({
				type: 'dynamic',
				x: 1080, y: 250,
				shape: 'box',
				boxOpts: { width: 10, height: 3 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'yellow' }
					}
				},
				fixtureDefOpts: {
					density: 0.5,
					filterCategoryBits: CATEGORY_ENEMY,
					filterMaskBits: CATEGORY_AIRCRAFT | CATEGORY_LIMITS | CATEGORY_MOON
				},
				group: 'laser'
			});
			_lasers.push(laser);
		}
	}

	function createUfo() {
		_ufo = worldManager.createEntity({
			type: 'dynamic',
			x: 940, y: 250,
			shape: 'circle',
			circleOpts: { radius: 25 },
			render: {
				type: 'spritesheet',
				spriteSheetOpts: {
					spriteData: {
						images: ['../../images/ufo.png'],
						animations: {
							'normal': [0, 5, 'normal', 0.25]
						},
						frames: { 'height': 84, 'width': 84 }
					},
					startAnimation: 'normal',
					adjustImageSize: false
				}
			},
			bodyDefOpts: {
				fixedRotation: true
			},
			fixtureDefOpts: {
				density: 20,
				restitution: 0,
				filterCategoryBits: CATEGORY_ENEMY,
				filterMaskBits: CATEGORY_AIRCRAFT | CATEGORY_LIMITS | CATEGORY_MOON
			},
			name: 'ufo',
			events: {
				ontick: function () {
					var i, j, dir = 0, s = 0, r;
					for (i = 0; i < _missilesFlying.length; i++) {
						for (j = 0; j < _vP.length; j++) {
							dir = willHit(_missilesFlying[i], _vP[j]);
							s += dir;
							if (dir != 0) {
								moveUfo(dir, _vP[j] * 200);
								attackAircraft(false);
							}
						}
					}
					if (s == 0) {
						attackAircraft(true);
					}
				}
			}
		});
	}

	function attackAircraft(move) {
		var ufoY = _ufo.getPosition().y;

		if (move) {
			if (_aircraft.getPosition().y < ufoY)
				moveUfo(-1, 100);
			else
				moveUfo(1, 100);
		}

		if (_countTick % 15 == 0
			&& (ufoY < 250 - 70 || ufoY > 250 + 70) /*devia da lua*/) {
			fireUfo();
		}
	}

	function loadUfo() {
		if (_lasers.length > 0) {
			_laser = _lasers[0];
			_laser.setPosition(_ufo.getPosition().x, _ufo.getPosition().y);
			_lasers.splice(0, 1);

			_laserLink = worldManager.createLink({
				entityA: _ufo,
				entityB: _laser,
				type: 'weld'
			});
		}
		else
			_laser = null;
	}

	function willHit(missile, p) {
		var color;
		var posUfo = {
			x: _ufo.getPosition().x,
			y: _ufo.getPosition().y,
		}
		var posMissile = {
			x: missile.getPosition().x,
			y: missile.getPosition().y,
		}
		var velMissile = {
			x: missile.b2body.GetLinearVelocity().x * worldManager.getScale(),
			y: missile.b2body.GetLinearVelocity().y * worldManager.getScale()
		}
		var xF = velMissile.x / p + posMissile.x;
		var yF = velMissile.y / p + posMissile.y;

		if (p == 0.5)
			color = 'cyan';
		else if (p == 1)
			color = 'yellow';
		else if (p == 2)
			color = 'orange';
		else
			color = 'red';

		//drawMissilePrev(xF, yF, color);

		var dir = 0;
		if ((xF >= posUfo.x - 30) && (xF <= posUfo.x + 30) && (yF <= posUfo.y + 30) && (yF >= posUfo.y - 30)) {
			if (velMissile.y < 0)
				dir = -1;
			else if (velMissile.y > 0)
				dir = 1;
			else {
				//Ufo acima do meio da canvas
				if (posUfo.y < 250)
					dir = 1;
				else
					dir = -1;
			}
		}

		return dir;
	}

	function moveUfo(dir, force) {
		_ufo.b2body.ApplyForce(new box2d.b2Vec2(0, dir * force), _ufo.b2body.GetWorldCenter());
	}

	function stopUfo() {
		var force = new box2d.b2Vec2(0, 0);
		force.x = -(_ufo.b2body.GetMass() * _ufo.b2body.GetLinearVelocity().x);
		force.y = -(_ufo.b2body.GetMass() * _ufo.b2body.GetLinearVelocity().y);
		_ufo.b2body.ApplyForce(force, _ufo.b2body.GetWorldCenter());
	}

	function fireUfo() {
		if (_freeFire && _laser != null) {
			worldManager.getWorld().DestroyJoint(_laserLink.getJoint());
			_laser.b2body.SetLinearVelocity({ x: -15, y: 0 });

			_soundHandler.createSoundInstance({
				id: 'laser'
			}).myPlay({
				volume: 0.2
			});

			loadUfo();
		}
	}

	function drawMissilePrev(x, y, color) {
		var c = worldManager.getBox2dCanvasCtx();
		var radius = 2;

		c.beginPath();
		c.lineWidth = '2';
		c.strokeStyle = color;
		c.arc(x, y, radius, 0, Math.PI * 2, true);
		c.stroke();
	}

}());