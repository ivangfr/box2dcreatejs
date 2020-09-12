this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	let _worldManager
	let _hintElem, _helpElem, _scoreElem, _freeBlocks
	let _soundHandler
	let _countTick = 0, _numBreaks = 0
	let _fish, _fishDir = -1, _water

	const _blocks = []

	const BLOCK_DIM = 80, BLOCK_BORDER_WIDTH = 3
	const BLOCK_SIZE = BLOCK_DIM + 2 * BLOCK_BORDER_WIDTH
	const CATEGORY_BLOCK = 0x0001
	const CATEGORY_SCENERY = 0x0002

	function MyApp() {
		this.initialize()
	}

	MyGameBuilder.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_helpElem = document.getElementById("help")
		_hintElem = document.getElementById("hint")
		_scoreElem = document.getElementById("score")

		_worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: false,
			fpsIndicator: { enabled: true },
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
				onComplete: () => {
					startCountingDown()
					startWorld()
				}
			}
		})
	}

	function startCountingDown() {
		_hintElem.innerHTML = 'Use the mouse to break or slice the blocks!!!'
		_hintElem.style.display = 'block'
		_helpElem.style.display = 'block'

		setTimeout(function () {
			_helpElem.style.display = 'none'
			_hintElem.innerHTML = 'READY??'
			setTimeout(function () {
				_hintElem.innerHTML = 'GGGOOO!!!'

				_scoreElem.innerHTML = '0'
				_scoreElem.style.display = 'block'

				setTimeout(function () {
					_hintElem.style.display = 'none'
					_freeBlocks = true
				}, 2000)
			}, 2000)
		}, 3000)
	}

	function startWorld() {

		_soundHandler = _worldManager.createSoundHandler()
		_soundHandler.createSoundInstance({ id: 'stream' }).myPlay({ loop: -1, volume: 0.3 })
		_soundHandler.createSoundInstance({ id: 'birds' }).myPlay({ loop: -1, volume: 0.1 })

		const multiTouchHandler = _worldManager.createMultiTouchHandler({
			enableDrag: false,
			enableSlice: true,
			sliceOpts: {
				lineWidth: 10,
				lineColor: 'yellow'
			},
			onmousedown: function (e) {
				const x = e.x || e.clientX
				const y = e.y || e.clientY
				const entities = multiTouchHandler.getEntitiesAtMouseTouch(e)

				multiTouchHandler.getEntitiesAtMouseTouch(e).forEach(entity => {
					const entityUserData = entity.b2body.GetUserData()
					if (entityUserData.group === 'breakable') {
						const breakHandler = new MyGameBuilder.BreakHandler(_worldManager, {
							numCuts: 2,
							explosion: true
						})
						breakHandler.breakEntity(entity, x, y)
						createExplosion(x, y)
					}
					else if (entityUserData.name === 'fish' && _fishDir !== 0) {
						const fishView = _fish.b2body.view
						_fishDir === 1 ? fishView.gotoAndPlay("turnLeftDie") : fishView.gotoAndPlay("die")
						_fishDir = 0
						_fish.b2body.GetFixtureList().SetDensity(0.8)
						createExplosion(x, y)
					}
				})
			}
		})

		_worldManager.createKeyboardHandler({
			keys: {
				d: { onkeydown: () => _worldManager.setEnableDebug(!_worldManager.getEnableDebug()) }
			}
		})

		_worldManager.createTimeStepHandler({
			layer: {
				render: {
					type: 'draw',
					drawOpts: { bgColorStyle: 'solid' },
					opacity: 0.2
				}
			}
		})

		_worldManager.createContactHandler({
			enabledBuoyancy: true,
			enabledStickyTarget: false,
			beginContact: function (contact) {
				const bodyA = contact.GetFixtureA().GetBody()
				const bodyB = contact.GetFixtureB().GetBody()
				const bodyAUserData = bodyA.GetUserData()
				const bodyBUserData = bodyB.GetUserData()

				if ((bodyAUserData.group === 'breakable' && bodyBUserData.group === 'water_floor') ||
					(bodyBUserData.group === 'breakable' && bodyAUserData.group === 'water_floor')) {
					const pieceBlock = (bodyAUserData.group === 'breakable') ? bodyAUserData : bodyBUserData
					pieceBlock.group = 'unbreakable'
					pieceBlock.sliceable = false
				}
			}
		})

		_worldManager.setUserOnTick(function () {
			_countTick++
			if (_countTick % 120 === 0) {

				//FISH
				if (_fishDir !== 0) {
					if (_countTick % 480 === 0) {
						if (_fishDir !== -1) {
							_fish.b2body.view.gotoAndPlay("turnLeft")
							_fishDir = -1
						}
						else {
							_fish.b2body.view.gotoAndPlay("turnRight")
							_fishDir = 1
						}
						_fish.b2body.SetLinearVelocity({ x: 1 * _fishDir, y: 0 })
					}
					else {
						_fish.b2body.SetLinearVelocity({ x: 5 * _fishDir, y: 0 })
					}
				}

				//BLOCKS
				if (_freeBlocks && _blocks.length > 0) {
					block = _blocks[0]
					block.entity.b2body.SetLinearVelocity(block.bodyDefOpts.linearVelocity)
					block.entity.b2body.SetAngularVelocity(block.bodyDefOpts.angularVelocity)

					_blocks.splice(0, 1)
				}
				if (_countTick === 2040) {
					_hintElem.innerHTML = 'FINISHED!!!'
					_hintElem.style.display = 'block'

					setTimeout(function () {
						_hintElem.innerHTML = "Try again!!!"
						setTimeout(function () {
							_worldManager.getTimeStepHandler().pause()
						}, 3000)
					}, 4000)
				}
			}
		})

		buildBackground()
		buildFloor()
		buildWalls()
		createBlocks(10)
		buildWater()
	}

	function buildBackground() {
		_worldManager.createLandscape({
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
		})

		const cloud1 = _worldManager.createLandscape({
			x: 0, y: 200,
			shape: 'box',
			boxOpts: { width: 200, height: 150 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/cloud.png',
					adjustImageSize: true
				},
				action: () => cloud1.view.x += 0.1
			}
		})

		const cloud2 = _worldManager.createLandscape({
			x: 200, y: 100,
			shape: 'box',
			boxOpts: { width: 315, height: 243 },
			render: {
				type: 'image',
				imageOpts: { image: '../../images/cloud.png' },
				action: () => cloud2.view.x += 0.2
			}
		})

		_fish = _worldManager.createEntity({
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
							normalLeft: [0, 9, 'normalLeft', 0.25],
							normalRight: [19],
							turnRight: [10, 19, 'normalRight', 0.25],
							turnLeft: {
								frames: [19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
								next: 'normalLeft',
								speed: 0.25
							},
							turnLeftDie: {
								frames: [19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
								next: "die",
								speed: 0.25
							},
							die: [20, 39, 'dead', 0.25],
							dead: [39]
						},
						frames: { 'height': 85, 'width': 80 }
					},
					startAnimation: 'normalLeft'
				}
			},
			bodyDefOpts: { fixedRotation: true },
			fixtureDefOpts: {
				density: 1.0,
				filterCategoryBits: CATEGORY_BLOCK,
				filterMaskBits: CATEGORY_SCENERY
			},
			name: 'fish'
		})
	}

	function buildWalls() {
		const aWalls = []
		aWalls.push({ x: -110, y: 440 })
		aWalls.push({ x: 1090, y: 440 })

		aWalls.forEach(wall => {
			_worldManager.createEntity({
				type: 'static',
				x: wall.x, y: wall.y,
				shape: 'box',
				boxOpts: { width: 20, height: 100 },
				render: {
					type: 'draw',
					drawOpts: {
						bgColorStyle: 'solid',
						bgSolidColorOpts: { color: 'black' }
					}
				},
				fixtureDefOpts: {
					filterCategoryBits: CATEGORY_SCENERY,
					filterMaskBits: CATEGORY_BLOCK
				},
				group: 'water_floor'
			})
		})
	}

	function buildFloor() {
		_worldManager.createEntity({
			type: 'static',
			x: 490, y: 500,
			shape: 'box',
			boxOpts: { width: 1180, height: 20 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'black' }
				}
			},
			fixtureDefOpts: {
				filterCategoryBits: CATEGORY_SCENERY,
				filterMaskBits: CATEGORY_BLOCK
			},
			group: 'water_floor'
		})
	}

	function buildWater() {
		_water = _worldManager.createEntity({
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
		})
	}

	function createBlocks(num) {
		for (let i = 0; i < num; i++) {
			const block = {}
			const y = randomIntFromInterval(BLOCK_SIZE / 2, 500 - 130 - BLOCK_SIZE / 2)
			const randomInt = randomIntFromInterval(0, 1)
			const x = randomInt === 0 ? 980 + BLOCK_SIZE / 2 : 0 - BLOCK_SIZE / 2
			const dir = randomInt === 0 ? -1 : 1
			const angVel = randomIntFromInterval(0, 2) * 5

			block.entity = _worldManager.createEntity({
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
				bodyDefOpts: { linearDamping: 0 },
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
			})

			block.bodyDefOpts = {
				linearVelocity: { x: dir * 15, y: 0 },
				angularVelocity: angVel
			}

			_blocks.push(block)
		}
	}

	function fnOnBreak(pieces) {
		pieces.forEach(piece => piece.b2body.GetUserData().noGravity = false)
		_numBreaks++
		_scoreElem.innerHTML = _numBreaks
	}

	function fnOnSlice(pieces) {
		fnOnBreak(pieces)
		_soundHandler.createSoundInstance({ id: 'slice' }).play()
	}

	function createExplosion(x, y) {
		const shot = _worldManager.createEntity({
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
		})

		_soundHandler.createSoundInstance({ id: 'explosion' }).play()

		setTimeout(function () {
			_worldManager.deleteEntity(shot)
		}, 300)
	}

}())