this.MyGameBuilder = this.MyGameBuilder || {};

(function () {
	var worldManager;

	function MyApp() {
		this.initialize();
	}

	MyGameBuilder.MyApp = MyApp;

	MyApp.prototype.initialize = function () {
		var easeljsCanvas = document.getElementById("easeljsCanvas");
		var box2dCanvas = document.getElementById("box2dCanvas");

		output = document.getElementById("output");

		worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
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
					{ src: '../../sounds/blink-182_dammit.mp3', id: 'music' },
					'../../sounds/shotgun.mp3',
					'../../sounds/Game-Shot.mp3',
				],
				onComplete: testSound
			}
		});
	}

	function testSound() {
		worldManager.createMultiTouchHandler();

		worldManager.createScreenButton({
			x: 100, y: 100,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Play' },
					borderWidth: 2, borderColor: 'white'
				}
			},
			onmousedown: function (e) {
				music.myPlay({
					loop: -1
				});
			}
		});

		worldManager.createScreenButton({
			x: 100, y: 160,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Stop' },
					borderWidth: 2, borderColor: 'white'
				}
			},
			onmousedown: function (e) {
				music.stop();
			}
		});

		worldManager.createScreenButton({
			x: 300, y: 100,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Resume' },
					borderWidth: 2, borderColor: 'white'
				}
			},
			onmousedown: function (e) {
				music.paused = false;
			}
		});

		worldManager.createScreenButton({
			x: 300, y: 160,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'transparent',
					textOpts: { text: 'Pause' },
					borderWidth: 2, borderColor: 'white'
				}
			},
			onmousedown: function (e) {
				music.paused = true;
			}
		});

		var shotgunRender1 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				textOpts: { text: 'Shotgun' },
				borderWidth: 2, borderColor: 'white', borderRadius: 10
			}
		};
		var shotgunRender2 = {
			type: 'draw',
			drawOpts: {
				bgColorStyle: 'solid',
				bgSolidColorOpts: { color: 'white' },
				textOpts: { text: 'Shotgun', color: 'black' },
				borderWidth: 2, borderColor: 'white', borderRadius: 10
			}
		};

		var shotgunBtn = worldManager.createScreenButton({
			x: 300, y: 240,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: shotgunRender1,
			onmousedown: function (e) {
				var shotgun = soundHandler.createSoundInstance({
					src: '../../sounds/shotgun.mp3'
				});
				shotgun.play();
				shotgunBtn.changeRender(shotgunRender2);
			},
			onmouseup: function (e) {
				shotgunBtn.changeRender(shotgunRender1);
			}
		});

		worldManager.createScreenButton({
			x: 300, y: 300,
			shape: 'box',
			boxOpts: { width: 80, height: 40 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					textOpts: { text: 'Shot' },
					borderWidth: 2, borderColor: 'white', borderRadius: 10
				}
			},
			onmousedown: function (e) {
				soundHandler.getSoundInstance('shot').play();
			}
		});

		var soundHandler = worldManager.createSoundHandler();

		var music = soundHandler.createSoundInstance({
			id: 'music'
		});
		soundHandler.addSoundInstance(music);

		var shot = soundHandler.createSoundInstance({
			id: 'shot',
			src: '../../sounds/Game-Shot.mp3',
		});
		soundHandler.addSoundInstance(shot);
	}

}());