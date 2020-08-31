this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	var worldManager;

	function MyApp() {
		this.initialize();
	}
	
	MyGameBuilder.MyApp = MyApp;

	MyApp.prototype.initialize = function() {
		var easeljsCanvas = document.getElementById("easeljsCanvas");		
		var box2dCanvas = document.getElementById("box2dCanvas");

		output = document.getElementById("output");

		worldManager = new MyGameBuilder.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender : true,
			enableDebug : false,
			showFPSIndicator : true,
			world : new box2d.b2World(new box2d.b2Vec2(0, 10), true),
//			preLoad : {
//				showLoadingIndicator : true,
//				loadingIndicatorOpts : {
//					x : 420,
//					y : 210,
//					font : 'bold italic 30px Verdana',
//					color : 'white'
//				},
//				files : [
//				         {src:'../sounds/Aladdin-SNES.mp3', id:'music'},
//				         '../sounds/Thunder1.mp3',
//				         '../sounds/Game-Shot.mp3',
//				         ],
//				onComplete : testSound
//			}
		});

		testSound();
		worldManager.start();
	}

	/*===================================================================================================================
	 *== TESTSOUND ====================================================================================================== 
	 *===================================================================================================================*/		

	function testSound() {
		worldManager.createMultiTouchHandler();

		worldManager.createScreenButton({
			x : 100, y : 100,
			shape : 'box',
			boxOpts : { width : 80, height : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					textOpts : { text : 'Play' },
					borderWidth : 2, borderColor : 'white'
				}
			},
			onmousedown : function(e) {
				music.myPlay({
					loop : -1
				});
			}
		});

		worldManager.createScreenButton({
			x : 100, y : 160,
			shape : 'box',
			boxOpts : { width : 80, height : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					textOpts : { text : 'Stop' },
					borderWidth : 2, borderColor : 'white'
				}
			},
			onmousedown : function(e) {
				music.stop();
			}
		});

		worldManager.createScreenButton({
			x : 300, y : 100,
			shape : 'box',
			boxOpts : { width : 80, height : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					textOpts : { text : 'Resume' },
					borderWidth : 2, borderColor : 'white'
				}
			},
			onmousedown : function(e) {
				music.resume();
			}
		});

		worldManager.createScreenButton({
			x : 300, y : 160,
			shape : 'box',
			boxOpts : { width : 80, height : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					textOpts : { text : 'Pause' },
					borderWidth : 2, borderColor : 'white'
				}
			},
			onmousedown : function(e) {
				music.pause();
			}
		});

		var thunderRender1 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					textOpts : { text : 'Thunder' },
					borderWidth : 2, borderColor : 'white', borderRadius : 10
				}
		};
		var thunderRender2 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color: 'white' },
					textOpts : { text : 'Thunder', color : 'black' },
					borderWidth : 2, borderColor : 'white', borderRadius : 10
				}
		};

		var thunderBtn = worldManager.createScreenButton({
			x : 300, y : 240,
			shape : 'box',
			boxOpts : { width : 80, height : 40 },
			render : thunderRender1,
			onmousedown : function(e) {
				var thunder = soundHandler.createSoundInstance({
					src : '../sounds/Thunder1.mp3'
				});
				thunder.play();
				thunderBtn.changeRender(thunderRender2);
			},
			onmouseup : function(e) {
				thunderBtn.changeRender(thunderRender1);
			}
		});

		worldManager.createScreenButton({
			x : 300, y : 300,
			shape : 'box',
			boxOpts : { width : 80, height : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					textOpts : { text : 'Shot' },
					borderWidth : 2, borderColor : 'white', borderRadius : 10
				}
			},
			onmousedown : function(e) {
				soundHandler.getSoundInstance('shot').play();
			}
		});

		var soundHandler = worldManager.createSoundHandler({
			registerFiles : [
			                 {src:'../sounds/Aladdin-SNES.mp3', id:'music'},
			                 {src:'../sounds/Thunder1.mp3'},
			                 {src:'../sounds/Game-Shot.mp3'}
			                 ]
		});

		var music = soundHandler.createSoundInstance({
			id : 'music'
		});
		soundHandler.addSoundInstance(music);

		var shot = soundHandler.createSoundInstance({
			id : 'shot',
			src : '../sounds/Game-Shot.mp3',
		});
		soundHandler.addSoundInstance(shot);
	}
	
}());