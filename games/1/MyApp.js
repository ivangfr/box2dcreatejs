this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	const CATEGORY_CAR = 0x0001
	const CATEGORY_SCENERY = 0x0002
	const TIRE_VS_CONCRETE = 1
	const CAR_VS_CONCRETE = 2
	const CAR_WIDTH = 170, CAR_HEIGHT = 55, CAR_X = 360, CAR_Y = 330
	const FINISH_LINE_X = 18000

	let _worldManager

	let _isMobileTablet
	let _hintElem, _timeElem
	let _soundHandler
	let _tireClockwise
	let _startTime, _carArrived
	let _interval, _overallTime
	let _holdPoint

	function MyApp() {
		this.initialize()
	}

	Box2DCreateJS.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_hintElem = document.getElementById("hint")
		_timeElem = document.getElementById("time")

		_worldManager = new Box2DCreateJS.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			fpsIndicator: {
				enabled: true,
				color: 'black'
			},
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				loadingIndicatorOpts: {
					x: 450,
					y: 220,
					color: 'black'
				},
				files: [
					{ src: '../../sounds/blink-182_dammit.mp3', id: 'music' },
					{ src: '../../sounds/crowd_applause.mp3', id: 'applause' },
					'../../images/tire.png',
					'../../images/hummer.png',
					'../../images/arrow_up.png',
					'../../images/arrow_down.png',
					'../../images/arrow_left.png',
					'../../images/arrow_right.png',
					'../../images/background.jpg',
					'../../images/finishFlag.jpg'
				],
				onComplete: () => {
					startWorld()
					startCountingDown()
				}
			}
		})

		_isMobileTablet = _worldManager.createMobileTabletDetector().isMobileTablet()
	}

	function startWorld() {

		const aContactTireConcrete = [], aContactCarConcrete = []

		buildFloor()
		buildWalls()
		buildFinishLine()

		const car = createCar()

		const player = _worldManager.createPlayer(car.chassis, {
			camera: {
				adjustX: 350,
				adjustY: 90,
				xAxisOn: true,
				yAxisOn: false
			},
			events: {
				backward: () => {
					car.frontTire.getB2Body().SetAngularVelocity(-90)
					_tireClockwise = -1
				},
				forward: () => {
					car.frontTire.getB2Body().SetAngularVelocity(90)
					_tireClockwise = 1
				},
				anticlockwise: () => car.chassis.getB2Body().SetAngularVelocity(-1),
				clockwise: () => car.chassis.getB2Body().SetAngularVelocity(1)
			}
		})

		createHoldPointToCar(car)

		const zoomHandler = _worldManager.createZoomHandler({ max: 1, min: 0.8, step: 0.008 })

		_worldManager.createTouchMouseHandler({ enableDrag: false })

		if (_isMobileTablet) {
			createButtonsForMobile(player)
		}

		const timeStepHandler = _worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: { bgColorStyle: 'solid' },
					opacity: 0.2
				}
			}
		})

		_soundHandler = _worldManager.createSoundHandler()
		_soundHandler.createSoundInstance({ id: 'music' }).myPlay({ loop: -1, volume: 0.3 })

		_worldManager.setUserOnTick(function () {
			if (!_isMobileTablet) {
				car.chassis.getPosition().y < 100 ? zoomHandler.zoomOut() : zoomHandler.zoomIn()
			}

			aContactTireConcrete.forEach(contact => {
				const worldManifold = new Box2D.Collision.b2WorldManifold()
				const intensity = contactIntensity(contact, worldManifold)
				if (intensity > 50) {
					createParticles(TIRE_VS_CONCRETE, worldManifold)
				}
			})

			aContactCarConcrete.forEach(contact => {
				const worldManifold = new Box2D.Collision.b2WorldManifold()
				const intensity = contactIntensity(contact, worldManifold)
				if (intensity > 0.1) {
					createParticles(CAR_VS_CONCRETE, worldManifold)
				}
			})

			if (!_carArrived && (car.chassis.getPosition().x + CAR_WIDTH / 2) >= FINISH_LINE_X) {
				_carArrived = true
				clearInterval(_interval)
				_hintElem.innerHTML = 'FINISHED!!'
				_hintElem.style.display = 'block'

				_overallTime = (new Date()).getTime() - _startTime
				updateTimeInfo(_overallTime, true)

				_soundHandler.createSoundInstance({ id: 'applause' }).play()

				_worldManager.getTimeStepHandler().setFPS(980)

				setTimeout(function () {
					_worldManager.getTimeStepHandler().restoreFPS()
				}, 1000)

				setTimeout(function () {
					_hintElem.innerHTML = "Try again!!!"
					setTimeout(function () {
						_worldManager.getTimeStepHandler().pause()
					}, 3000)
				}, 4000)
			}
		})

		_worldManager.createLandscape({
			x: 10000, y: 139,
			shape: 'box',
			boxOpts: { width: 20000, height: 500 },
			render: {
			    opacity: 0.7,
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					bgImage: '../../images/background.jpg',
					repeatBgImage: 'repeat-x'
				}
			}
		})

		_worldManager.createKeyboardHandler({
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) },
				p: { onkeydown: () => timeStepHandler.isPaused() ? timeStepHandler.play() : timeStepHandler.pause() },
				o: { onkeydown: () => timeStepHandler.getFPS() === 980 ? timeStepHandler.restoreFPS() : timeStepHandler.setFPS(980) },
				ArrowLeft: { onkeydown: (e) => player.anticlockwise(e) },
				ArrowUp: {
					onkeydown: (e) => player.forward(e),
					keepPressed: true
				},
				ArrowRight: {
					onkeydown: (e) => player.clockwise(e)
				},
				ArrowDown: {
					onkeydown: (e) => player.backward(e),
					keepPressed: true
				}
			}
		})

		_worldManager.createContactHandler({
			enabledBuoyancy: false,
			enabledStickyTarget: false,
			beginContact: function (contact) {
				const bodyA = contact.GetFixtureA().GetBody()
				const bodyB = contact.GetFixtureB().GetBody()
				const bodyAUserData = bodyA.GetUserData()
				const bodyBUserData = bodyB.GetUserData()

				if ((bodyAUserData.group === 'tire' && bodyBUserData.group === 'concrete') ||
					(bodyBUserData.group === 'tire' && bodyAUserData.group === 'concrete')) {
					aContactTireConcrete.push(contact)
				}
				else if ((bodyAUserData.name === 'chassis' && bodyBUserData.group === 'concrete') ||
					(bodyBUserData.name === 'chassis' && bodyAUserData.group === 'concrete')) {
					aContactCarConcrete.push(contact)
				}
			},
			endContact: function (contact) {
				const bodyA = contact.GetFixtureA().GetBody()
				const bodyB = contact.GetFixtureB().GetBody()
				const bodyAUserData = bodyA.GetUserData()
				const bodyBUserData = bodyB.GetUserData()

				if ((bodyAUserData.group === 'tire' && bodyBUserData.group === 'concrete') ||
					(bodyBUserData.group === 'tire' && bodyAUserData.group === 'concrete')) {
					for (let i = aContactTireConcrete.length - 1; i >= 0; i--) {
						if (aContactTireConcrete[i] === contact) {
							aContactTireConcrete.splice(i, 1)
							break
						}
					}
				}
				else if ((bodyAUserData.name === 'chassis' && bodyBUserData.group === 'concrete') ||
					(bodyBUserData.name === 'chassis' && bodyAUserData.group === 'concrete')) {
					for (let i = aContactCarConcrete.length - 1; i >= 0; i--) {
						if (aContactCarConcrete[i] === contact) {
							aContactCarConcrete.splice(i, 1)
							break
						}
					}
				}
			}
		})
	}

	function startCountingDown() {
		_hintElem.innerHTML = 'Complete the track as fast as you can!!!'
		_hintElem.style.display = 'block'

		setTimeout(function () {
			_hintElem.innerHTML = 'READY??'
			setTimeout(function () {
				_hintElem.innerHTML = 'GGGOOO!!!'

				_timeElem.innerHTML = '00:00'
				_timeElem.style.display = 'block'
				startTime()

				_worldManager.deleteEntity(_holdPoint)

				setTimeout(function () {
					_hintElem.style.display = 'none'
					_freeBlocks = true
				}, 2000)
			}, 2000)
		}, 5000)
	}

	function startTime() {
		let auxTime
		_startTime = (new Date()).getTime()

		_interval = setInterval(function () {
			auxTime = (new Date()).getTime() - _startTime
			updateTimeInfo(auxTime, false)
		}, 1000)
	}

	function updateTimeInfo(auxTime, updateMil) {
		_timeElem.innerHTML = formatTime(auxTime, updateMil)
	}

	function createCar() {
		const chassis = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X, y: CAR_Y,
			shape: 'box',
			boxOpts: { width: CAR_WIDTH, height: CAR_HEIGHT },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/hummer.png',
					adjustImageSize: true
				}
			},
			fixtureDefOpts: {
				friction: 0.2,
				density: 7,
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			draggable: true,
			name: 'chassis'
		})

		const backAxis = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X - 55, y: CAR_Y + 30,
			shape: 'box',
			boxOpts: { width: 20, height: 20 },
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent'
				}
			}
		})

		const frontAxis = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X + 55, y: CAR_Y + 30,
			shape: 'box',
			boxOpts: { width: 20, height: 20 },
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent'
				}
			}
		})

		const renderTire = {
			type: 'image',
			imageOpts: {
				image: '../../images/tire.png',
				adjustImageSize: true
			}
		}

		const backTire = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X - 55, y: CAR_Y + 30,
			shape: 'circle',
			circleOpts: { radius: 22 },
			render: renderTire,
			fixtureDefOpts: {
				density: 5.0,
				restitution: 1,
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			draggable: true,
			name: 'backTire',
			group: 'tire'
		})

		const frontTire = _worldManager.createEntity({
			type: 'dynamic',
			x: CAR_X + 55, y: CAR_Y + 30,
			shape: 'circle',
			circleOpts: { radius: 22 },
			render: renderTire,
			fixtureDefOpts: {
				density: 5.0,
				restitution: 1,
				filterCategoryBits: CATEGORY_CAR,
				filterMaskBits: CATEGORY_SCENERY
			},
			draggable: true,
			name: 'frontTire',
			group: 'tire'
		})

		_worldManager.createLink({
			entityA: chassis,
			entityB: backAxis,
			type: 'line',
			localAnchorA: { x: -1.85, y: 0.1 },
			localAxisA: { x: 0, y: 0.9 },
			options: {
				enableLimit: true,
				lowerTranslation: 0.8,
				upperTranslation: 0.95,
				enableMotor: true,
				maxMotorForce: 45,
				motorSpeed: 2
			}
		})

		_worldManager.createLink({
			entityA: chassis,
			entityB: frontAxis,
			type: 'line',
			localAnchorA: { x: 1.85, y: 0.1 },
			localAxisA: { x: 0, y: 0.9 },
			options: {
				enableLimit: true,
				lowerTranslation: 0.8,
				upperTranslation: 0.95,
				enableMotor: true,
				maxMotorForce: 45,
				motorSpeed: 2
			}
		})

		_worldManager.createLink({
			entityA: backAxis,
			entityB: backTire,
			type: 'revolute'
		})

		_worldManager.createLink({
			entityA: frontAxis,
			entityB: frontTire,
			type: 'revolute'
		})

		return { chassis, backTire, frontTire }
	}

	function createHoldPointToCar(car) {
		_holdPoint = _worldManager.createEntity({
			type: 'static',
			x: 300, y: 340,
			shape: 'box',
			boxOpts: { width: 20, height: 20 },
			render: {
				type: 'draw',
				drawOpts: { bgColorStyle: 'transparent' }
			}
		})

		_worldManager.createLink({
			entityA: _holdPoint,
			entityB: car.frontTire,
			type: 'distance'
		})
	}

	function createButtonsForMobile(player) {
		
		_worldManager.createScreenButton({
			x: 50, y: 450,
			shape: 'box',
			boxOpts: { width: 100, height: 80 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_up.png',
					adjustImageSize: true
				}
			},
			onmousedown: function (e) { player.anticlockwise(e) },
			keepPressed: false
		})

		_worldManager.createScreenButton({
			x: 150, y: 450,
			shape: 'box',
			boxOpts: { width: 100, height: 80 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_down.png',
					adjustImageSize: true
				}
			},
			onmousedown: function (e) { player.clockwise(e) },
			keepPressed: false
		})

		_worldManager.createScreenButton({
			x: 830, y: 450,
			shape: 'box',
			boxOpts: { width: 100, height: 80 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_left.png',
					adjustImageSize: true
				}
			},
			onmousedown: function (e) { player.backward(e) },
			keepPressed: true
		})

		_worldManager.createScreenButton({
			x: 930, y: 450,
			shape: 'box',
			boxOpts: { width: 100, height: 80 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/arrow_right.png',
					adjustImageSize: true
				}
			},
			onmousedown: function (e) { player.forward(e) },
			keepPressed: true
		})
	}

	function buildWalls() {
		const aWalls = []
		aWalls.push({ x: 0, y: 200 })
		aWalls.push({ x: 20000, y: 0 })

		aWalls.forEach(wall => {
			_worldManager.createEntity({
				type: 'static',
				x: wall.x, y: wall.y,
				shape: 'box',
				boxOpts: { width: 10, height: 1000 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'black' }
					}
				},
				fixtureDefOpts: {
					filterCategoryBits: CATEGORY_SCENERY
				}
			})
		})
	}

	function buildFloor() {
		const aPoints = []

		aPoints.push({ x: 0, y: 10 })

		aPoints.push({ x: 1200, y: 10 })
		aPoints.push({ x: 1500, y: 120 })
		aPoints.push({ x: 2100, y: 120 })
		aPoints.push({ x: 2400, y: 10 })

		aPoints.push({ x: 3000, y: 10 })
		aPoints.push({ x: 3300, y: 80 })
		aPoints.push({ x: 3400, y: 10 })

		aPoints.push({ x: 4000, y: 10 })
		aPoints.push({ x: 4100, y: 80 })
		aPoints.push({ x: 4400, y: 10 })

		aPoints.push({ x: 5000, y: 10 })
		aPoints.push({ x: 6000, y: 200 })
		aPoints.push({ x: 6200, y: 100 })
		aPoints.push({ x: 7000, y: 100 })
		aPoints.push({ x: 7200, y: 200 })
		aPoints.push({ x: 7900, y: 10 })

		aPoints.push({ x: 8500, y: 10 })
		aPoints.push({ x: 9000, y: 120 })
		aPoints.push({ x: 9500, y: 120 })
		aPoints.push({ x: 10000, y: 200 })
		aPoints.push({ x: 10500, y: 50 })

		aPoints.push({ x: 11000, y: 50 })
		aPoints.push({ x: 11500, y: 150 })
		aPoints.push({ x: 12000, y: 150 })
		aPoints.push({ x: 12500, y: 10 })

		aPoints.push({ x: 13000, y: 10 })
		aPoints.push({ x: 13500, y: 200 })
		aPoints.push({ x: 14000, y: 200 })
		aPoints.push({ x: 14500, y: 50 })
		aPoints.push({ x: 15000, y: 50 })
		aPoints.push({ x: 15500, y: 210 })
		aPoints.push({ x: 16000, y: 210 })
		aPoints.push({ x: 16500, y: 250 })
		aPoints.push({ x: 17000, y: 10 })

		aPoints.push({ x: 20000, y: 10 })

		for (let i = 0; i < aPoints.length - 1; i++) {
			const p1 = aPoints[i]
			const p2 = aPoints[i + 1]

			const ps = [
				{ x: p1.x, y: 200 },
				{ x: p1.x, y: -p1.y },
				{ x: p2.x, y: -p2.y },
				{ x: p2.x, y: 200 }
			]
			const center = findCentroid(ps).center

			_worldManager.createEntity({
				type: 'static',
				x: center.x, y: center.y + 400,
				shape: 'polygon',
				polygonOpts: { points: ps },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'black' },
						borderWidth: 2
					}
				},
				fixtureDefOpts: { filterCategoryBits: CATEGORY_SCENERY },
				group: 'concrete'
			})
		}
	}

	function buildFinishLine() {
		_worldManager.createEntity({
			type: 'static',
			x: FINISH_LINE_X, y: 190,
			shape: 'box',
			boxOpts: { width: 40, height: 400 },
			render: {
                type: 'draw',
                drawOpts: {
                    bgColorStyle: 'transparent',
                    bgImage: '../../images/finishFlag.jpg',
                    repeatBgImage: 'repeat-y'
                },
			}
		})
		_worldManager.createEntity({
			type: 'static',
			x: FINISH_LINE_X, y: 180,
			shape: 'box',
			boxOpts: { width: 5, height: 420 },
			render: {
				type: 'draw',
				opacity: 0.5,
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: "yellow" }
				}
			}
		})
	}

	function contactIntensity(contact, worldManifold) {
		const fixtureA = contact.GetFixtureA()
		const fixtureB = contact.GetFixtureB()
		const bodyA = fixtureA.GetBody()
		const bodyB = fixtureB.GetBody()

		contact.GetWorldManifold(worldManifold)

		const velA = bodyA.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0])
		const velB = bodyB.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0])

		const relativeSpeed = box2d.b2Math.SubtractVV(velA, velB)
		const totalFriction = fixtureA.GetFriction() * fixtureB.GetFriction()

		return box2d.b2Math.Abs(relativeSpeed.x * totalFriction)
	}

	function createParticles(type, worldManifold) {
		let x = worldManifold.m_points[0].x
		if (worldManifold.m_points[1].x > 0) {
			x = (x + worldManifold.m_points[1].x) / 2
		}
		x *= _worldManager.getScale()

		let y = worldManifold.m_points[0].y
		if (worldManifold.m_points[1].y > 0) {
			y = (y + worldManifold.m_points[1].y) / 2
		}
		y -= 0.2
		y *= _worldManager.getScale()

		const numParticles = 1
		for (let j = 0; j < numParticles; j++) {
			let color
			const rColor = randomIntFromInterval(1, 3)

			if (type === TIRE_VS_CONCRETE) {
				if (rColor === 3) {
					color = '#EEE'
				}
				else if (rColor === 2) {
					color = '#CCC'
				}
				else {
					color = '#FFF'
				}
			}
			else {
				if (rColor === 1) {
					color = '#FFFF00'
				}
				else if (rColor === 2) {
					color = '#FF3300'
				}
				else {
					color = '#FF9900'
				}
			}

			const power = randomIntFromInterval(1, 5)
			const angle = randomIntFromInterval(210, 270) * _tireClockwise
			const angleDir = new box2d.b2Vec2(Math.sin(angle * Math.PI / 180), Math.cos(angle * Math.PI / 180))
			const timeDisappear = randomIntFromInterval(1, 2) * 1000

			const particle = _worldManager.createEntity({
				type: 'dynamic',
				x: x, y: y,
				shape: 'circle',
				circleOpts: { radius: 3 },
				noGravity: true,
				bodyDefOpts: {
					fixedRotation: false,
					linearDamping: 1,
					linearVelocity: {
						x: angleDir.x * power,
						y: angleDir.y * power
					}
				},
				render: {
					type: 'draw',
					opacity: 0.9,
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: color },
						borderWidth: 3,
						borderColor: color,
						cache: true
					}
				},
				fixtureDefOpts: {
					density: 0.1,
					filterCategoryBits: CATEGORY_CAR,
					filterMaskBits: CATEGORY_SCENERY
				}
			})

			setTimeout(function () {
				_worldManager.deleteEntity(particle)
			}, timeDisappear)
		}
	}

	function formatTime(auxTime, updateMil) {
		const mil = auxTime % 1000
		const sec = Math.floor(auxTime / 1000 % 60)
		const min = Math.floor(auxTime / 1000 / 60)
	
		let timeFormat = (min < 10) ? '0' + min : min
		timeFormat += ':'
		timeFormat += (sec < 10) ? '0' + sec : sec
		if (updateMil) {
			timeFormat += '.'
			if (mil < 10) {
				timeFormat += '00' + mil
			}
			else if (mil < 100) {
				timeFormat += '0' + mil
			}
			else {
				timeFormat += mil
			}
		}
		return timeFormat
	}

	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

}())