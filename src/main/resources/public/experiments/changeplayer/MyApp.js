this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	let _worldManager, _playerSelected, _prevPlayerSelected

	function MyApp() {
		this.initialize()
	}

	MyGameBuilder.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 0), true)
		})

		testChangePlayer()
		_worldManager.start()
	}

	function testChangePlayer() {

		createLandscapeAndWorldLimits()
		createBalls(10)

		const touchMouseHandler = _worldManager.createTouchMouseHandler({
			onmousedown: function (e) {
				touchMouseHandler.getEntitiesAtMouseTouch(e)
					.filter(entity => entity.getGroup() === 'square')
					.map(entity => _worldManager.getPlayerByItsEntity(entity))
					.filter(player => player !== _playerSelected)
					.forEach(player => {
						_prevPlayerSelected = _playerSelected
						_playerSelected = player
						_worldManager.setPlayer(_playerSelected)

						_playerSelected.getEntity().changeRender(getPlayerSelectedRender())
						_prevPlayerSelected.getEntity().changeRender(getPlayerUnselectedRender())
					})
			}
		})

		_worldManager.createKeyboardHandler({
			keyboardHint: { enabled: true },
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				r: { onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender()) },
				1: {
					onkeydown: () => {
						const playerCamera = _playerSelected.getCamera()
						if (playerCamera.getXAxisOn()) {
							playerCamera.setXAxisOn(false)
							playerCamera.setAdjustX(490 - player.getPosition().x)
						}
						else {
							playerCamera.setXAxisOn(true)
							playerCamera.setAdjustX(490)
						}
					}
				},
				ArrowLeft: {
					onkeydown: () => _playerSelected.left(),
					keepPressed: true
				},
				ArrowUp: {
					onkeydown: () => _playerSelected.up(),
					keepPressed: true
				},
				ArrowRight: {
					onkeydown: () => _playerSelected.right(),
					keepPressed: true
				},
				ArrowDown: {
					onkeydown: () => _playerSelected.down(),
					keepPressed: true
				}
			}
		})

		createPlayers()
	}

	function getPlayerSelectedRender() {
		return {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'yellow' },
				borderWidth: 2, borderColor: 'black', borderRadius: 10
			},
		}
	}

	function getPlayerUnselectedRender() {
		return {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				borderWidth: 2, borderColor: 'black', borderRadius: 10
			},
			opacity: 0.5
		}
	}

	function createPlayers() {

		const entity1 = _worldManager.createEntity({
			x: 100, y: 150,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			type: 'dynamic',
			render: getPlayerSelectedRender(),
			group: 'square'
		})

		// Player 1
		const player1 = _worldManager.createPlayer(entity1, {
			camera: {
				adjustX: 490,
				xAxisOn: true
			},
			events: {
				up: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -100), this.getB2Body().GetWorldCenter())
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 100), this.getB2Body().GetWorldCenter())
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100, 0), this.getB2Body().GetWorldCenter())
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		const entity2 = _worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 300,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: getPlayerUnselectedRender(),
			group: 'square'
		})

		// Player 2
		_worldManager.createPlayer(entity2, {
			camera: {
				adjustX: 490,
				xAxisOn: true
			},
			events: {
				up: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -100), this.getB2Body().GetWorldCenter())
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 100), this.getB2Body().GetWorldCenter())
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100, 0), this.getB2Body().GetWorldCenter())
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		const entity3 = _worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 450,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: getPlayerUnselectedRender(),
			group: 'square'
		})

		// Player 3
		_worldManager.createPlayer(entity3, {
			camera: {
				adjustX: 490,
				xAxisOn: true
			},
			events: {
				up: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -100), this.getB2Body().GetWorldCenter())
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 100), this.getB2Body().GetWorldCenter())
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100, 0), this.getB2Body().GetWorldCenter())
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		_playerSelected = player1
		_worldManager.setPlayer(_playerSelected)
	}

	function createLandscapeAndWorldLimits() {
		_worldManager.createLandscape({
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
		})

		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 500,
			shape: 'box',
			boxOpts: { width: 1960, height: 10 },
			render: staticRender,
			name: 'floor'
		})

		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 0,
			shape: 'box',
			boxOpts: { width: 1960, height: 10 },
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 1960, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})
	}

	function createBalls(number) {
		for (let i = 0; i < number; i++) {
			_worldManager.createEntity({
				type: 'dynamic',
				x: Math.random() * 980,
				y: Math.random() * 500,
				shape: 'circle',
				circleOpts: { radius: 25 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'green' },
						borderWidth: 2,
						borderColor: 'black',
					},
					opacity: 0.5
				}
			})
		}
	}

}())