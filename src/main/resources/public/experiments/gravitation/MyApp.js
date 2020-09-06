this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	let _worldManager

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
					'../../images/explosion.png',
					'../../images/asteroid.png',
					'../../images/earth.png',
					'../../images/moon.png',
					'../../images/atomic_explosion.png'
				],
				onComplete: testGravitation
			}
		})
	}

	function testGravitation() {
		createLandscapeAndWorldLimits()

		_worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender())
			},
			37: { // left arrow
				onkeydown: () => player.left(),
				keepPressed: true
			},
			38: { // up arrow
				onkeydown: () => player.up(),
				keepPressed: true
			},
			39: { // right arrow
				onkeydown: () => player.right(),
				keepPressed: true
			},
			40: { // down arrow
				onkeydown: () => player.down(),
				keepPressed: true
			}
		})

		_worldManager.createContactHandler({
			beginContact: function (contact) {
				const bodyA = contact.GetFixtureA().GetBody()
				const bodyB = contact.GetFixtureB().GetBody()
				const bodyAUserData = bodyA.GetUserData()
				const bodyBUserData = bodyB.GetUserData()

				if ((bodyAUserData.name === 'earth' && bodyBUserData.name === 'asteroid') ||
					(bodyAUserData.name === 'asteroid' && bodyBUserData.name === 'earth')) {
					let earth, asteroid
					if (bodyAUserData.name === 'earth') {
						earth = _worldManager.getEntityByItsBody(bodyA)
						asteroid = _worldManager.getEntityByItsBody(bodyB)
					}
					else {
						earth = _worldManager.getEntityByItsBody(bodyB)
						asteroid = _worldManager.getEntityByItsBody(bodyA)
					}

					const dirX = asteroid.getPosition().x - earth.getPosition().x
					const dirY = asteroid.getPosition().y - earth.getPosition().y
					let theta = Math.atan2(dirY, dirX)
					if (theta < 0) {
						theta += 2 * Math.PI
					}
					const angle = theta * (180 / Math.PI)

					let up = true
					const explosion = _worldManager.createLandscape({
						x: asteroid.getPosition().x,
						y: asteroid.getPosition().y,
						angle: angle + 90,
						shape: 'circle',
						circleOpts: { radius: 40 },
						render: {
							z: earth.b2body.GetUserData().render.z,
							opacity: 0,
							type: 'image',
							drawOpts: {
								bgColorStyle: 'radialGradient',
								bgRadialGradientOpts: { colors: ['red', 'yellow'] }
							},
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
				}

				if ((bodyAUserData.name === 'moon' && bodyBUserData.name === 'asteroid') ||
					(bodyAUserData.name === 'asteroid' && bodyBUserData.name === 'moon')) {
					let moon, asteroid
					if (bodyAUserData.name === 'moon') {
						moon = _worldManager.getEntityByItsBody(bodyA)
						asteroid = _worldManager.getEntityByItsBody(bodyB)
					}
					else {
						moon = _worldManager.getEntityByItsBody(bodyB)
						asteroid = _worldManager.getEntityByItsBody(bodyA)
					}

					_worldManager.createLandscape({
						x: asteroid.getPosition().x,
						y: asteroid.getPosition().y,
						shape: 'circle',
						circleOpts: { radius: 40 },
						render: {
							type: 'spritesheet',
							z: asteroid.b2body.GetUserData().render.z,
							spriteSheetOpts: {
								spriteData: {
									images: ['../../images/explosion.png'],
									animations: { 'normal': [48], 'explode': [0, 48, 'normal'] },
									frames: { 'height': 256, 'width': 256 },
								},
								startAnimation: 'explode',
								adjustImageSize: true
							}
						}
					})
				}
			}
		})

		const asteroid = _worldManager.createEntity({
			type: 'dynamic',
			x: 750, y: 120,
			shape: 'circle',
			circleOpts: { radius: 8 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/asteroid.png',
					adjustImageSize: true
				}
			},
			name: 'asteroid'
		})

		const player = _worldManager.createPlayer(asteroid, {
			camera: { xAxisOn: false, yAxisOn: false },
			events: {
				up: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, -10), this.getB2Body().GetWorldCenter())
				},
				down: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0, 10), this.getB2Body().GetWorldCenter())
				},
				left: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-10, 0), this.getB2Body().GetWorldCenter())
				},
				right: function () {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(10, 0), this.getB2Body().GetWorldCenter())
				}
			}
		})

		let mainEarthRender = true
		const multiTouchHandler = _worldManager.createMultiTouchHandler({
			onmousedown: function (e) {
				const entities = multiTouchHandler.getEntitiesAtMouseTouch(e)
				entities.forEach(entity => {
					if (entity.b2body.GetUserData().name === 'earth') {
						mainEarthRender = !mainEarthRender
						mainEarthRender ? entity.changeRender(earthRender1) : entity.changeRender(earthRender2)
					}
				})
			}
		})

		const earthRender1 = {
			type: 'image',
			imageOpts: {
				image: '../../images/earth.png',
				adjustImageSize: true
			}
		}

		const earthRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'radialGradient',
				bgRadialGradientOpts: { colors: ['red', 'yellow'] },
				borderColor: 'white', borderWidth: 2
			}
		}

		const earth = _worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 250,
			shape: 'circle',
			circleOpts: { radius: 100 },
			render: earthRender1,
			fixtureDefOpts: { density: 100 },
			name: 'earth'
		})

		_worldManager.createGravitation(earth, {
			gravityRadius: 300,
			attractionPower: 5,
			render: {
				opacity: 0.3,
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'radialGradient',
					bgRadialGradientOpts: {
						colors: ['#fff', '#6B6DB5'],
						r0: 100,
						r1: 300
					}
				}
			}
		})

		const moon = _worldManager.createEntity({
			type: 'dynamic',
			x: 750, y: 250,
			shape: 'circle',
			circleOpts: { radius: 30 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/moon.png',
					adjustImageSize: true
				}
			},
			fixtureDefOpts: { density: 100 },
			name: 'moon'
		})

		_worldManager.createGravitation(moon, {
			attractionPower: 5,
			render: {
				opacity: 0.3,
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'radialGradient',
					bgRadialGradientOpts: {
						colors: ['#fff', '#6B6DB5'],
						r0: 30,
						r1: 90
					}
				}
			}
		})
	}

	function createLandscapeAndWorldLimits() {
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

		const staticReander = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticReander
		})

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
			render: staticReander
		})

		_worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticReander
		})

		_worldManager.createEntity({
			type: 'static',
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticReander
		})
	}

}())