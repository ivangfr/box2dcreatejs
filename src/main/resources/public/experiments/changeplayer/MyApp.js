this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	let worldManager

	function MyApp() {
		this.initialize()
	}

	MyGameBuilder.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			showFPSIndicator: true,
			world: new box2d.b2World(new box2d.b2Vec2(0, 0), true)
		})

		testChangePlayer()

		worldManager.start()
	}

	function testChangePlayer() {

		createLandscapeAndWorldLimits()

		createBalls(10)

		worldManager.createMultiTouchHandler({
			onmousedown: function (e) {
				const entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e)
				if (entities.length > 0) {

					let selectedEntity
					for (let i = 0; i < entities.length; i++) {
						let entity = entities[i]
						if (entity.getGroup() !== 'square') {
							continue
						}

						if (!entity.isSelected) {
							entity.changeRender(renderSelected)
							entity.isSelected = true
							selectedEntity = entity
						}

						const player = worldManager.getPlayerByItsEntity(entity)
						worldManager.setPlayer(player)
					}

					const allEntities = worldManager.getEntities()
					for (let i = 0; i < allEntities.length; i++) {
						let ent = allEntities[i]
						if (ent.getGroup() !== 'square') {
							continue
						}

						if (worldManager.getPlayerByItsEntity(ent) && selectedEntity !== null && ent !== selectedEntity) {
							ent.isSelected = false
							ent.changeRender(renderUnselected)
						}
					}
				}
			}
		})

		worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => worldManager.setEnableDebug(!worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => worldManager.setEnableRender(!worldManager.getEnableRender())
			},
			49: { // 1
				onkeydown: () => {
					const player = worldManager.getPlayer()
					const playerCamera = player.getCamera()
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
			37: { // left arrow
				onkeydown: () => worldManager.getPlayer().left(),
				keepPressed: true
			},
			38: { // up arrow
				onkeydown: () => worldManager.getPlayer().up(),
				keepPressed: true
			},
			39: { // right arrow
				onkeydown: () => worldManager.getPlayer().right(),
				keepPressed: true
			},
			40: { // down arrow
				onkeydown: () => worldManager.getPlayer().down(),
				keepPressed: true
			}
		})

		const renderSelected = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'yellow' },
				borderWidth: 2, borderColor: 'black', borderRadius: 10
			},
		}

		const renderUnselected = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				borderWidth: 2, borderColor: 'black', borderRadius: 10
			},
			opacity: 0.5
		}

		const entity1 = worldManager.createEntity({
			x: 100, y: 150,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			type: 'dynamic',
			render: renderUnselected,
			group: 'square'
		})
		entity1.isSelected = false

		const player1 = worldManager.createPlayer(entity1, {
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

		const entity2 = worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 300,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: renderUnselected,
			group: 'square'
		})
		entity2.isSelected = false

		const player2 = worldManager.createPlayer(entity2, {
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

		const entity3 = worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 450,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: renderSelected,
			group: 'square'
		})
		entity3.isSelected = true

		const player3 = worldManager.createPlayer(entity3, {
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
	}

	function createLandscapeAndWorldLimits() {
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
		})

		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'black' }
			}
		}

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 500,
			shape: 'box',
			boxOpts: { width: 1960, height: 10 },
			render: staticRender,
			name: 'floor'
		})

		worldManager.createEntity({
			type: 'static',
			x: 980, y: 0,
			shape: 'box',
			boxOpts: { width: 1960, height: 10 },
			render: staticRender
		})

		worldManager.createEntity({
			type: 'static',
			x: 0, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})

		worldManager.createEntity({
			type: 'static',
			x: 1960, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})
	}

	function createBalls(number) {
		for (let i = 0; i < number; i++) {
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