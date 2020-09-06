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
					'../../images/tire.png',
					'../../images/wall.jpg',
				],
				onComplete: testBreak
			}
		})
	}

	function testBreak() {
		createWorldLimits()

		const multiTouchHandler = _worldManager.createMultiTouchHandler({
			onmousedown: function (e) {
				const entities = multiTouchHandler.getEntitiesAtMouseTouch(e)
				if (entities.length > 0) {
					const breakHandler = new MyGameBuilder.BreakHandler(_worldManager, {
						numCuts: 2,
						explosion: false
					})

					entities.filter(entity => entity.b2body.GetUserData().group === 'breakable')
						.forEach(entity => {
							const x = e.x || e.clientX
							const y = e.y || e.clientY
							breakHandler.breakEntity(entity, x, y)
						})
				}
			}
		})

		const timeStepHandler = _worldManager.createTimeStepHandler()

		const contactHandler = _worldManager.createContactHandler({
			breakOpts: { numCuts: 2 },
			beginContact: function (contact) {
				const bodyA = contact.GetFixtureA().GetBody()
				const bodyB = contact.GetFixtureB().GetBody()
				const bodyAUserData = bodyA.GetUserData()
				const bodyBUserData = bodyB.GetUserData()

				if ((bodyAUserData.name === 'projectile' && bodyBUserData.group === 'breakable') ||
					(bodyBUserData.name === 'projectile' && bodyAUserData.group === 'breakable')) {
					let block, projectile
					if (bodyAUserData.group === 'breakable') {
						block = _worldManager.getEntityByItsBody(bodyA)
						projectile = _worldManager.getEntityByItsBody(bodyB)
					}
					else {
						block = _worldManager.getEntityByItsBody(bodyB)
						projectile = _worldManager.getEntityByItsBody(bodyA)
					}

					const worldManifold = new Box2D.Collision.b2WorldManifold()
					contact.GetWorldManifold(worldManifold)

					const vel1 = projectile.b2body.GetLinearVelocity()
					const vel2 = block.b2body.GetLinearVelocity()
					const impactVelocity = box2d.b2Math.SubtractVV(vel1, vel2)
					const approachVelocity = box2d.b2Math.Dot(worldManifold.m_normal, impactVelocity)
					const impulse = Math.abs(approachVelocity * projectile.b2body.GetMass())

					if (impulse > 10) {
						let angle = Math.atan2(vel1.y, vel1.x)
						angle *= 180 / Math.PI

						const angles = []
						angles.push(angle)
						angles.push(angle - 15)
						angles.push(angle + 15)

						let x = worldManifold.m_points[0].x
						if (worldManifold.m_points[1].x > 0) {
							x = (x + worldManifold.m_points[1].x) / 2
						}
						x *= _worldManager.getScale()

						let y = worldManifold.m_points[0].y
						if (worldManifold.m_points[1].y > 0) {
							y = (y + worldManifold.m_points[1].y) / 2
						}
						y *= _worldManager.getScale()

						const numCuts = Math.round(impulse / 20)

						const output = document.getElementById("output")
						output.innerHTML += ' - numCuts ' + numCuts

						contactHandler.getBreakHandler().setNumCuts(numCuts)
						contactHandler.addEntityToBeBroken(block, x, y, angles)
					}
				}
			},
			preSolve: function (contact) {
				// const bodyA = contact.GetFixtureA().GetBody()
				// const bodyB = contact.GetFixtureB().GetBody()
				// const bodyAUserData = bodyA.GetUserData()
				// const bodyBUserData = bodyB.GetUserData()

				// if ((bodyAUserData.name === 'projectile' && bodyBUserData.group === 'breakable') ||
				// 	(bodyBUserData.name === 'projectile' && bodyAUserData.group === 'breakable')) {
				// 	console.log('preSolve')
				// }
			},
			postSolve: function (contact, impulse) {
				// const bodyA = contact.GetFixtureA().GetBody()
				// const bodyB = contact.GetFixtureB().GetBody()
				// const bodyAUserData = bodyA.GetUserData()
				// const bodyBUserData = bodyB.GetUserData()

				// if ((bodyAUserData.name === 'projectile' && bodyBUserData.group === 'breakable') ||
				// 	(bodyBUserData.name === 'projectile' && bodyAUserData.group === 'breakable')) {
				// 	console.log('postSolve')
				// }
			},
			endContact: function (contact) {
				// const bodyA = contact.GetFixtureA().GetBody()
				// const bodyB = contact.GetFixtureB().GetBody()
				// const bodyAUserData = bodyA.GetUserData()
				// const bodyBUserData = bodyB.GetUserData()

				// if ((bodyAUserData.name === 'projectile' && bodyBUserData.group === 'breakable') ||
				// 	(bodyBUserData.name === 'projectile' && bodyAUserData.group === 'breakable')) {
				// 	console.log('endContact')
				// }
			}
		})

		_worldManager.createKeyboardHandler({
			68: { // d
				onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug())
			},
			82: { // r
				onkeydown: () => _worldManager.setEnableRender(!_worldManager.getEnableRender())
			},
			80: { // p
				onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause()
			},
			79: { // o
				onkeydown: () => timeStepHandler.getFPS() === 980 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(980)
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

		createToys()

		const projectile = _worldManager.createEntity({
			type: 'dynamic',
			x: 100, y: 250,
			shape: 'box',
			boxOpts: { width: 50, height: 50 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'white' },
					borderWidth: 4,
					borderRadius: 10,
					borderColor: 'black',
				},
			},
			fixtureDefOpts: { filterGroupIndex: -1 },
			noGravity: true,
			name: 'projectile'
		})

		const player = _worldManager.createPlayer(projectile, {
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

	function createWorldLimits() {
		const staticRender = {
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
			render: staticRender
		})

		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 0,
			shape: 'box',
			boxOpts: { width: 980, height: 10 },
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
			x: 980, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender
		})
	}

	function createToys() {
		_worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 325,
			shape: 'box',
			boxOpts: { width: 100, height: 200 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'yellow' },
					borderWidth: 4,
					borderColor: 'black'
				},
			},
			fixtureDefOpts: { density: 1000 },
			group: 'breakable',
			draggable: false,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 300, y: 100,
			shape: 'box',
			boxOpts: { width: 100, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: {
						text: 'B',
						font: 'bold 38px Arial',
						color: 'yellow'
					},
					borderWidth: 4,
					borderColor: 'white',
					borderRadius: 10,
					cache: true
				}
			},
			group: 'breakable',
			draggable: false,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 500, y: 400,
			shape: 'box',
			boxOpts: { width: 100, height: 100 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/wall.jpg',
					adjustImageSize: true
				}
			},
			group: 'breakable',
			draggable: false,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 500, y: 100,
			shape: 'box',
			boxOpts: { width: 100, height: 100 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'teal' },
					borderWidth: 2, borderColor: 'black'
				}
			},
			bodyDefOpts: { angularVelocity: 820 },
			group: 'breakable',
			draggable: false,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 700, y: 200, angle: 30,
			shape: 'polygon',
			polygonOpts: {
				points: [
					{ x: -50, y: 0 },
					{ x: 0, y: -50 },
					{ x: 50, y: 0 },
					{ x: 0, y: 50 }
				]
			},
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: {
						text: 'P',
						font: 'bold 38px Arial',
						color: 'yellow'
					},
					borderWidth: 4,
					borderColor: 'white',
					cache: true
				}
			},
			group: 'breakable',
			draggable: false
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 900, y: 100,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: {
						text: 'C',
						font: 'bold 38px Arial',
						color: 'yellow'
					},
					borderWidth: 4,
					borderColor: 'white',
					borderRadius: 10,
					cache: true
				}
			},
			group: 'breakable',
			draggable: false,
			noGravity: true
		})

		_worldManager.createEntity({
			type: 'dynamic',
			x: 900, y: 300,
			shape: 'circle',
			circleOpts: { radius: 40 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/tire.png',
					adjustImageSize: true
				}
			},
			group: 'breakable',
			draggable: false,
			noGravity: true
		})
	}

}())