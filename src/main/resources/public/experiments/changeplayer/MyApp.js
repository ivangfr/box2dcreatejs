this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	let _worldManager, _playerSelected, _prevPlayerSelected, _isMobileTablet

	function MyApp() {
		this.initialize()
	}

	Box2DCreateJS.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

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
					'../../images/arrow_up.png',
					'../../images/arrow_down.png',
					'../../images/arrow_left.png',
					'../../images/arrow_right.png'
				],
				onComplete: function () {
					testChangePlayer()
				}
			}
		})

		_isMobileTablet = _worldManager.createMobileTabletDetector().isMobileTablet()
	}

	function testChangePlayer() {

		createLandscapeAndWorldLimits()
		createBalls(10)

		function handleMouseDownOrTouchStart(e, touchMouseHandler) {
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

		const touchMouseHandler = _worldManager.createTouchMouseHandler({
			onmousedown: (e) => handleMouseDownOrTouchStart(e, touchMouseHandler),
			ontouchstart: (e) => handleMouseDownOrTouchStart(e, touchMouseHandler)
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

		if (_isMobileTablet) {
			createButtonsForMobile()
		}
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
			bodyDefOpts: { fixedRotation: true },
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
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -500), this.getB2Body().GetWorldCenter())
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 500), this.getB2Body().GetWorldCenter())
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-500, 0), this.getB2Body().GetWorldCenter())
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(500, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		const entity2 = _worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 300,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			bodyDefOpts: { fixedRotation: true },
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
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -500), this.getB2Body().GetWorldCenter())
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 500), this.getB2Body().GetWorldCenter())
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-500, 0), this.getB2Body().GetWorldCenter())
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(500, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		const entity3 = _worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 450,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			bodyDefOpts: { fixedRotation: true },
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
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -500), this.getB2Body().GetWorldCenter())
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 500), this.getB2Body().GetWorldCenter())
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-500, 0), this.getB2Body().GetWorldCenter())
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(500, 0), this.getB2Body().GetWorldCenter())
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

	function createButtonsForMobile() {
		const staticBoxOpts = { width: 80, height: 80 }

		_worldManager.createScreenButton({
			x: 40, y: 410,
			shape: 'box',
			boxOpts: staticBoxOpts,
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_left.png',
					adjustImageSize: true
				}
			},
			onmousedown: () => _playerSelected.left(),
			keepPressed: true
		})

		_worldManager.createScreenButton({
			x: 100, y: 360,
			shape: 'box',
			boxOpts: staticBoxOpts,
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_up.png',
					adjustImageSize: true
				}
			},
			onmousedown: () => _playerSelected.up(),
			keepPressed: true
		})

		_worldManager.createScreenButton({
			x: 160, y: 410,
			shape: 'box',
			boxOpts: staticBoxOpts,
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_right.png',
					adjustImageSize: true
				}
			},
			onmousedown: () => _playerSelected.right(),
			keepPressed: true
		})

		_worldManager.createScreenButton({
			x: 100, y: 460,
			shape: 'box',
			boxOpts: staticBoxOpts,
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_down.png',
					adjustImageSize: true
				}
			},
			onmousedown: () => _playerSelected.down(),
			keepPressed: true
		})
	}

}())