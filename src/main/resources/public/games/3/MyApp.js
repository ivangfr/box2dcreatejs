this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	let _worldManager
	let _countTick = 0, _score
	let _hintElem
	let _soundHandler
	let _freeFire = false, _gameOver = false
	let _numHitAircraft = 0, _numHitUfo = 0
	let _aircraft, _player, _aircraftDir = 0, _missile = null, _missileLink
	let _ufo, _laser, _laserLink

	const _lasers = [], _storedMissiles = [], _flyingMissiles = []
	const _vP = [0.5, 1, 2, 4]

	const CATEGORY_AIRCRAFT = 0x0001
	const CATEGORY_ENEMY = 0x0002
	const CATEGORY_LIMITS = 0x0004
	const CATEGORY_EARTH = 0x0016
	const CATEGORY_MOON = 0x0008

	function MyApp() {
		this.initialize()
	}

	Box2DCreateJS.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_hintElem = document.getElementById("hint")

		_worldManager = new Box2DCreateJS.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 0), true),
			preLoad: {
				loadingIndicatorOpts: {
					x: 450,
					y: 220,
					color: 'black'
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
					startWorld()
					startCountingDown()
				}
			}
		})
	}

	function startCountingDown() {
		_hintElem.innerHTML = 'Human vs Alien!!!'
		_hintElem.style.display = 'block'

		setTimeout(function () {
			_hintElem.innerHTML = 'READY??'
			setTimeout(function () {
				_hintElem.innerHTML = 'FIGHT!!!'

				_freeFire = true

				setTimeout(function () {
					_hintElem.style.display = 'none'
				}, 2000)
			}, 2000)
		}, 3000)
	}

	function updateScore() {
		const newRender = {
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
		}

		if (!_score) {
			_score = _worldManager.createLandscape({
				x: 490,
				y: 15,
				shape: 'box',
				boxOpts: { width: 100, height: 20 },
				render: newRender
			})
		}
		else {
			_score.changeRender(newRender)
		}
	}

	function getScoreNumbers() {
		return '[' + _storedMissiles.length + '] ' + _numHitUfo + ' x ' + _numHitAircraft + ' [' + _lasers.length + ']'
	}

	function startWorld() {

		_worldManager.createLandscape({
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
		})

		_worldManager.setUserOnTick(function () {
			if (_gameOver) {
				return
			}

			_countTick++

			updateScore()

			if (_storedMissiles.length === 0 && _lasers.length === 0) {
				_gameOver = true
				setTimeout(function () {
					if (_numHitUfo > _numHitAircraft) {
						_hintElem.innerHTML = 'Human wins'
						_soundHandler.createSoundInstance({ id: 'applause' }).play()
					}
					else if (_numHitUfo < _numHitAircraft) {
						_hintElem.innerHTML = 'Alien wins'
						_soundHandler.createSoundInstance({ id: 'aliens' }).play()
					}
					else {
						_hintElem.innerHTML = 'Draw game'
					}
					_hintElem.style.display = 'block'

					setTimeout(function () {
						_worldManager.getTimeStepHandler().pause()
					}, 3000)

				}, 5000)
			}
		})

		_soundHandler = _worldManager.createSoundHandler()
		_soundHandler.createSoundInstance({ id: 'music' }).myPlay({ loop: -1, volume: 1 })

		const timeStepHandler = _worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: { bgColorStyle: 'solid' },
					opacity: 0.2
				}
			}
		})

		_worldManager.createKeyboardHandler({
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				p: { onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause() },
				ArrowUp: {
					onkeydown: () => _player.up(),
					onkeyup: () => _player.upNormal(),
					keepPressed: true
				},
				ArrowDown: {
					onkeydown: () => _player.down(),
					onkeyup: () => _player.downNormal(),
					keepPressed: true
				},
				a: { onkeydown: () => _player.fire() }
			}
		})

		_worldManager.createContactHandler({
			enabledBuoyancy: false,
			enabledStickyTarget: false,
			enabledBreak: false,
			beginContact: function (contact) {
				const bodyA = contact.GetFixtureA().GetBody()
				const bodyB = contact.GetFixtureB().GetBody()
				const bodyAUserData = bodyA.GetUserData()
				const bodyBUserData = bodyB.GetUserData()

				if ((bodyAUserData.group === 'missile' && bodyBUserData.group === 'limit') ||
					(bodyBUserData.group === 'missile' && bodyAUserData.group === 'limit')) {

					const projectileEntity = (bodyAUserData.group === 'missile') ?
						_worldManager.getEntityByItsBody(bodyA) : _worldManager.getEntityByItsBody(bodyB)

					removeFromFlyingMissiles(projectileEntity)
					_worldManager.deleteEntity(projectileEntity)
				}
				else if ((bodyAUserData.group === 'laser' && bodyBUserData.group === 'limit') ||
					(bodyBUserData.group === 'laser' && bodyAUserData.group === 'limit')) {

					const projectileEntity = (bodyAUserData.group === 'laser') ?
						_worldManager.getEntityByItsBody(bodyA) : _worldManager.getEntityByItsBody(bodyB)

					_worldManager.deleteEntity(projectileEntity)
				}
				else if ((bodyAUserData.group === 'missile' && bodyBUserData.name === 'moon') ||
					(bodyBUserData.group === 'missile' && bodyAUserData.name === 'moon')) {

					let projectileEntity, moonEntity
					if (bodyAUserData.group === 'missile') {
						projectileEntity = _worldManager.getEntityByItsBody(bodyA)
						moonEntity = _worldManager.getEntityByItsBody(bodyB)
					}
					else {
						projectileEntity = _worldManager.getEntityByItsBody(bodyB)
						moonEntity = _worldManager.getEntityByItsBody(bodyA)
					}

					removeFromFlyingMissiles(projectileEntity)
					_worldManager.deleteEntity(projectileEntity)
					createMoonExplosion(projectileEntity, moonEntity)
				}
				else if ((bodyAUserData.group === 'laser' && bodyBUserData.name === 'moon') ||
					(bodyBUserData.group === 'laser' && bodyAUserData.name === 'moon')) {

					let projectileEntity, moonEntity
					if (bodyAUserData.group === 'laser') {
						projectileEntity = _worldManager.getEntityByItsBody(bodyA)
						moonEntity = _worldManager.getEntityByItsBody(bodyB)
					}
					else {
						projectileEntity = _worldManager.getEntityByItsBody(bodyB)
						moonEntity = _worldManager.getEntityByItsBody(bodyA)
					}

					_worldManager.deleteEntity(projectileEntity)
					createMoonExplosion(projectileEntity, moonEntity)
				}
				else if ((bodyAUserData.group === 'missile' && bodyBUserData.name === 'ufo') ||
					(bodyBUserData.group === 'missile' && bodyAUserData.name === 'ufo')) {
					_numHitUfo++

					const projectileEntity = (bodyAUserData.group === 'missile') ?
						_worldManager.getEntityByItsBody(bodyA) : _worldManager.getEntityByItsBody(bodyB)

					removeFromFlyingMissiles(projectileEntity)
					_worldManager.deleteEntity(projectileEntity)
					createExplosion(projectileEntity)

					if (_numHitUfo % 2 === 0) {
						_soundHandler.createSoundInstance({ id: 'bravo' }).play()
					}
				}
				else if ((bodyAUserData.group === 'laser' && bodyBUserData.name === 'aircraft') ||
					(bodyBUserData.group === 'laser' && bodyAUserData.name === 'aircraft')) {
					_numHitAircraft++

					const projectileEntity = (bodyAUserData.group === 'laser') ?
						_worldManager.getEntityByItsBody(bodyA) : _worldManager.getEntityByItsBody(bodyB)

					_worldManager.deleteEntity(projectileEntity)
					createExplosion(projectileEntity)

					if (_numHitAircraft % 2 === 0) {
						_soundHandler.createSoundInstance({ id: 'fix_on_that_position' }).play()
					}
				}
				else if ((bodyAUserData.group === 'laser' && bodyBUserData.group === 'missile') ||
					(bodyBUserData.group === 'laser' && bodyAUserData.group === 'missile')) {

					let projectileEntity
					if (bodyAUserData.group === 'missile') {
						projectileEntity = _worldManager.getEntityByItsBody(bodyA)
						_worldManager.deleteEntity(_worldManager.getEntityByItsBody(bodyB))
					}
					else {
						projectileEntity = _worldManager.getEntityByItsBody(bodyB)
						_worldManager.deleteEntity(_worldManager.getEntityByItsBody(bodyA))
					}

					removeFromFlyingMissiles(projectileEntity)
					_worldManager.deleteEntity(projectileEntity)
					createExplosion(projectileEntity)
				}
			}
		})

		createLimits()
		createEarth()
		createMoon()

		createMissiles(100)
		createAircraft()
		loadAircraft()

		createLasers(100)
		createUfo()
		loadUfo()
	}

	function createMoonExplosion(projectileEntity, moonEntity) {
		const dirX = projectileEntity.getPosition().x - moonEntity.getPosition().x
		const dirY = projectileEntity.getPosition().y - moonEntity.getPosition().y
		let theta = Math.atan2(dirY, dirX)
		if (theta < 0) {
			theta += 2 * Math.PI
		}
		const angle = theta * (180 / Math.PI)

		let up = true
		const explosion = _worldManager.createLandscape({
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
						explosion.view.alpha += 0.05
						if (explosion.view.alpha > 1) {
							up = false
						}
					}
					else if (explosion.view.alpha > 0) {
						explosion.view.alpha -= 0.01
					}
				}
			}
		})

		_soundHandler.createSoundInstance({ id: 'explosion' }).myPlay({ volume: 0.7 })
	}

	function createExplosion(projectileEntity) {
		_worldManager.createLandscape({
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
						animations: {
							normal: 47,
							explode: [1, 47, 'normal']
						},
						frames: { width: 64, height: 64 },
					},
					startAnimation: 'explode'
				}
			}
		})

		_soundHandler.createSoundInstance({ id: 'explosion' }).myPlay({ volume: 0.7 })
	}

	function createLimits() {
		const limits = []
		limits.push({ x: 490, y: -20, width: 980, height: 10 })
		limits.push({ x: 490, y: 520, width: 980, height: 10 })
		limits.push({ x: -20, y: 250, width: 10, height: 500 })
		limits.push({ x: 1000, y: 250, width: 10, height: 500 })

		limits.forEach(limit => {
			_worldManager.createEntity({
				type: 'static',
				x: limit.x, y: limit.y,
				shape: 'box',
				boxOpts: { width: limit.width, height: limit.height },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'black' }
					}
				},
				fixtureDefOpts: {
					restitution: 0,
					filterCategoryBits: CATEGORY_LIMITS,
					filterMaskBits: CATEGORY_AIRCRAFT | CATEGORY_ENEMY
				},
				group: 'limit'
			})
		})
	}

	function createEarth() {
		_worldManager.createEntity({
			type: 'static',
			x: -250, y: 250,
			shape: 'circle',
			circleOpts: { radius: 400 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/earth.png',
					adjustImageSize: true
				}
			},
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_EARTH,
				filterMaskBits: CATEGORY_MOON
			},
			name: 'earth'
		})
	}

	function createMoon() {
		const moon = _worldManager.createEntity({
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
		})

		_worldManager.createGravitation(moon, {
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
		})
	}

	function createMissiles(num) {
		for (let i = 0; i < num; i++) {
			const missile = _worldManager.createEntity({
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
			})
			_storedMissiles.push(missile)
		}
	}

	function createAircraft() {
		_aircraft = _worldManager.createEntity({
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
							normal: 12,
							goUp: {
								frames: [12, 7, 2],
								next: false,
								speed: 0.25
							},
							upNormal: {
								frames: [2, 7, 12],
								next: false,
								speed: 0.25
							},
							goDown: {
								frames: [12, 17, 22],
								next: false,
								speed: 0.25
							},
							downNormal: {
								frames: [22, 17, 12],
								next: false,
								speed: 0.25
							}
						},
						frames: { width: 100, height: 100 }
					},
					startAnimation: 'normal'
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: {
				density: 20,
				restitution: 0,
				filterCategoryBits: CATEGORY_AIRCRAFT,
				filterMaskBits: CATEGORY_ENEMY | CATEGORY_LIMITS | CATEGORY_MOON
			},
			name: 'aircraft'
		})

		_player = _worldManager.createPlayer(_aircraft, {
			events: {
				up: () => {
					_aircraft.b2body.ApplyForce(new box2d.b2Vec2(0, -7500), _aircraft.b2body.GetWorldCenter())
					if (_aircraftDir !== -1) {
						_aircraft.b2body.view.gotoAndPlay("goUp")
					}
					_aircraftDir = -1
				},
				down: () => {
					_aircraft.b2body.ApplyForce(new box2d.b2Vec2(0, 7500), _aircraft.b2body.GetWorldCenter())
					if (_aircraftDir !== 1) {
						_aircraft.b2body.view.gotoAndPlay("goDown")
					}
					_aircraftDir = 1
				},
				upNormal: () => {
					_aircraft.b2body.view.gotoAndPlay("upNormal")
					_aircraftDir = 0
				},
				downNormal: () => {
					_aircraft.b2body.view.gotoAndPlay("downNormal")
					_aircraftDir = 0
				},
				fire: () => {
					if (_freeFire) {
						if (_missile) {
							_worldManager.getWorld().DestroyJoint(_missileLink.getJoint())
							_missile.b2body.SetLinearVelocity({ x: 10, y: 0 })
							_soundHandler.createSoundInstance({ id: 'missile' }).myPlay({ volume: 0.2 })
							_flyingMissiles.push(_missile)
							loadAircraft()
						}
						else {
							_soundHandler.createSoundInstance({ id: 'dry_fire' }).myPlay({ volume: 0.2 })
						}
					}
				}
			}
		})
	}

	function loadAircraft() {
		if (_storedMissiles.length > 0) {
			_missile = _storedMissiles[0]
			_missile.setPosition(_aircraft.getPosition().x + 25, _aircraft.getPosition().y)
			_storedMissiles.splice(0, 1)

			_missileLink = _worldManager.createLink({
				entityA: _aircraft,
				entityB: _missile,
				type: 'weld'
			})
		}
		else {
			_missile = null
		}
	}

	function removeFromFlyingMissiles(missile) {
		for (let i = 0; i < _flyingMissiles.length; i++) {
			if (_flyingMissiles[i] === missile) {
				_flyingMissiles.splice(i, 1)
				break
			}
		}
	}

	function createLasers(num) {
		for (let i = 0; i < num; i++) {
			const laser = _worldManager.createEntity({
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
			})
			_lasers.push(laser)
		}
	}

	function createUfo() {
		_ufo = _worldManager.createEntity({
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
							normal: [0, 5, 'normal', 0.25]
						},
						frames: { width: 84, height: 84 }
					},
					startAnimation: 'normal'
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: {
				density: 20,
				restitution: 0,
				filterCategoryBits: CATEGORY_ENEMY,
				filterMaskBits: CATEGORY_AIRCRAFT | CATEGORY_LIMITS | CATEGORY_MOON
			},
			name: 'ufo',
			events: {
				ontick: () => {
					let s = 0;
					for (let i = 0; i < _flyingMissiles.length; i++) {
						for (let j = 0; j < _vP.length; j++) {
							const dir = willHit(_flyingMissiles[i], _vP[j])
							s += dir
							if (dir !== 0) {
								moveUfo(dir, _vP[j] * 200)
								attackAircraft(false)
							}
						}
					}
					if (s === 0) {
						attackAircraft(true)
					}
				}
			}
		})
	}

	function attackAircraft(move) {
		const ufoY = _ufo.getPosition().y
		if (move) {
			_aircraft.getPosition().y < ufoY ? moveUfo(-1, 100) : moveUfo(1, 100)
		}
		if (_countTick % 15 === 0 && /*skip moon*/ (ufoY < 250 - 70 || ufoY > 250 + 70)) {
			fireUfo()
		}
	}

	function loadUfo() {
		if (_lasers.length > 0) {
			_laser = _lasers[0]
			_laser.setPosition(_ufo.getPosition().x, _ufo.getPosition().y)
			_lasers.splice(0, 1)

			_laserLink = _worldManager.createLink({
				entityA: _ufo,
				entityB: _laser,
				type: 'weld'
			})
		}
		else {
			_laser = null
		}
	}

	function willHit(missile, p) {
		const posUfo = {
			x: _ufo.getPosition().x,
			y: _ufo.getPosition().y,
		}
		const posMissile = {
			x: missile.getPosition().x,
			y: missile.getPosition().y,
		}
		const velMissile = {
			x: missile.b2body.GetLinearVelocity().x * _worldManager.getScale(),
			y: missile.b2body.GetLinearVelocity().y * _worldManager.getScale()
		}
		const xF = velMissile.x / p + posMissile.x
		const yF = velMissile.y / p + posMissile.y

		let color
		if (p === 0.5) {
			color = 'cyan'
		}
		else if (p === 1) {
			color = 'yellow'
		}
		else if (p === 2) {
			color = 'orange'
		}
		else {
			color = 'red'
		}

		// -- Uncomment if you want to see the missile path
		// drawMissilePrev(xF, yF, color)

		let dir = 0
		if ((xF >= posUfo.x - 30) && (xF <= posUfo.x + 30) && (yF <= posUfo.y + 30) && (yF >= posUfo.y - 30)) {
			if (velMissile.y < 0) {
				dir = -1
			}
			else if (velMissile.y > 0) {
				dir = 1
			}
			else {
				//Ufo above middle of canvas
				if (posUfo.y < 250) {
					dir = 1
				}
				else {
					dir = -1
				}
			}
		}

		return dir
	}

	function moveUfo(dir, force) {
		_ufo.b2body.ApplyForce(new box2d.b2Vec2(0, dir * force), _ufo.b2body.GetWorldCenter())
	}

	function fireUfo() {
		if (_freeFire && _laser) {
			_worldManager.getWorld().DestroyJoint(_laserLink.getJoint())
			_laser.b2body.SetLinearVelocity({ x: -15, y: 0 })
			_soundHandler.createSoundInstance({ id: 'laser' }).myPlay({ volume: 0.2 })
			loadUfo()
		}
	}

	function drawMissilePrev(x, y, color) {
		const radius = 2
		const c = _worldManager.getBox2dCanvasCtx()
		c.beginPath()
		c.lineWidth = '2'
		c.strokeStyle = color
		c.arc(x, y, radius, 0, Math.PI * 2, true)
		c.stroke()
	}

}())