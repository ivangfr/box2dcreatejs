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
					{ src: '../../sounds/blink-182_dammit.mp3', id: 'music' },
					'../../sounds/shotgun.mp3',
					'../../sounds/slice.mp3'
				],
				onComplete: testSound
			}
		})
	}

	function testSound() {
		const soundHandler = _worldManager.createSoundHandler()

		// Create music just with id, as the preload has the src
		const music = soundHandler.createSoundInstance({ id: 'music' })
		soundHandler.addSoundInstance(music)

		// Create slice with id and src
		const slice = soundHandler.createSoundInstance({ id: 'slice', src: '../../sounds/slice.mp3' })
		soundHandler.addSoundInstance(slice)

		// Note: shotgun is not created yet, just preload

		_worldManager.createMultiTouchHandler()

		_worldManager.createScreenButton({
			x: 100, y: 100,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Play' },
					borderWidth: 2,
					borderColor: 'white'
				}
			},
			onmousedown: () => music.myPlay({ loop: -1 })
		})

		_worldManager.createScreenButton({
			x: 100, y: 160,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Stop' },
					borderWidth: 2,
					borderColor: 'white'
				}
			},
			onmousedown: () => music.stop()
		})

		_worldManager.createScreenButton({
			x: 300, y: 100,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Resume' },
					borderWidth: 2,
					borderColor: 'white'
				}
			},
			onmousedown: () => music.paused = false
		})

		_worldManager.createScreenButton({
			x: 300, y: 160,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Pause' },
					borderWidth: 2,
					borderColor: 'white'
				}
			},
			onmousedown: () => music.paused = true
		})

		const shotgunRender1 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				textOpts: { text: 'Shotgun' },
				borderWidth: 2,
				borderColor: 'white',
				borderRadius: 10
			}
		}

		const shotgunRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				textOpts: { text: 'Shotgun', color: 'black' },
				borderWidth: 2,
				borderColor: 'white',
				borderRadius: 10
			}
		}

		const shotgunBtn = _worldManager.createScreenButton({
			x: 300, y: 240,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: shotgunRender1,
			onmousedown: () => {
				// Here shotgun is created and played
				// It can be fired several times
				soundHandler.createSoundInstance({src: '../../sounds/shotgun.mp3'}).play()
				shotgunBtn.changeRender(shotgunRender2)
			},
			onmouseup: () => shotgunBtn.changeRender(shotgunRender1)
		})

		_worldManager.createScreenButton({
			x: 300, y: 300,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: { text: 'Slice' },
					borderWidth: 2,
					borderColor: 'white',
					borderRadius: 10
				}
			},
			// Here slice is played. It is not fired several as shotgun.
			// It need to stop the first execution to start a new one
			onmousedown: () => soundHandler.getSoundInstance('slice').play()
		})
	}

}())