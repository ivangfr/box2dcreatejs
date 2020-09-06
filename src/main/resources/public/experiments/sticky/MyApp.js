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
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		})

		testSticky()
		_worldManager.start()
	}

	function testSticky() {
		createWorldLimits()
		createTargets()

		const shooter = _worldManager.createEntity({
			type: 'dynamic',
			x: 20, y: 250,
			shape: 'polygon',
			polygonOpts: {
				points: [
					{ x: -10, y: 0 },
					{ x: 0, y: -10 },
					{ x: 10, y: 0 },
					{ x: 0, y: 10 }
				]
			},
			boxOpts: { width: 20, height: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'blue' }
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: {
				density: 10,
				restitution: 0,
				filterGroupIndex: -1
			},
			draggable: false,
			noGravity: true
		})

		const timeStepHandler = _worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: { bgColorStyle: 'solid' },
					opacity: 0.3
				}
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
				onkeydown: () => timeStepHandler.getFPS() === 1960 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(1960)
			},
			37: { // left arrow
				onkeydown: () => shooter.b2body.ApplyForce(new box2d.b2Vec2(-100, 0), shooter.b2body.GetWorldCenter()),
				keepPressed: true
			},
			38: { // up arrow
				onkeydown: () => shooter.b2body.ApplyForce(new box2d.b2Vec2(0, -100), shooter.b2body.GetWorldCenter()),
				keepPressed: true
			},
			39: { // right arrow
				onkeydown: () => shooter.b2body.ApplyForce(new box2d.b2Vec2(100, 0), shooter.b2body.GetWorldCenter()),
				keepPressed: true
			},
			40: { // down arrow
				onkeydown: () => shooter.b2body.ApplyForce(new box2d.b2Vec2(0, 100), shooter.b2body.GetWorldCenter()),
				keepPressed: true
			}
		})

		let mouseX, mouseY
		_worldManager.createMultiTouchHandler({
			drawPointerLocation: true,
			onmousedown: function () {
				const shooterX = shooter.getPosition().x
				const shooterY = shooter.getPosition().y

				const dirX = mouseX - shooterX
				const dirY = mouseY - shooterY
				let theta = Math.atan2(dirY, dirX)
				if (theta < 0) {
					theta += 2 * Math.PI
				}
				const angle = theta * (180 / Math.PI)

				const bullet = _worldManager.createEntity({
					type: 'dynamic',
					x: shooterX, y: shooterY, angle: angle,
					shape: 'box',
					polygonOpts: {
						points: [
							{ x: -40, y: 0 },
							{ x: 0, y: -2 },
							{ x: 10, y: 0 },
							{ x: 0, y: 2 }
						]
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
				})

				bullet.b2body.ApplyImpulse(new box2d.b2Vec2(dirX, dirY), bullet.b2body.GetWorldCenter())
			},
			onmousemove: function (e) {
				mouseX = e.x
				mouseY = e.y
			}
		})

		_worldManager.createContactHandler({
			stickyTargetOpts: { preSolveStick: false }
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
	}

	function createTargets() {
		const staticRender = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'teal' }
			}
		}

		_worldManager.createEntity({
			type: 'dynamic',
			x: 400, y: 250,
			shape: 'box',
			boxOpts: { width: 50, height: 300 },
			render: staticRender,
			fixtureDefOpts: {
				density: 10,
				restitution: 0,
				isTarget: true,
				hardness: 50
			}
		})

		_worldManager.createEntity({
			type: 'static',
			x: 900, y: 250,
			shape: 'box',
			boxOpts: { width: 10, height: 500 },
			render: staticRender,
			fixtureDefOpts: {
				restitution: 0.1,
				isTarget: true
			},
		})
	}

}())