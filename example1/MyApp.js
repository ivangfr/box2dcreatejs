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
			preLoad : {
				showLoadingIndicator : true,
				loadingIndicatorOpts : {
					x : 420,
					y : 210,
					font : 'bold italic 30px Verdana',
					color : 'white'
				},
				files : [
				         '../images/tire.png',
				         '../images/tire2.png',
				         '../images/hummer.png',
				         '../images/runningGrant.png',
				         '../images/explosion.png',
				         '../images/start.png',
				         '../images/leftarrow.png',
				         '../images/rightarrow.png',
				         '../images/ball.png',
				         '../images/wall.jpg',
				         '../images/background.jpg',
				         '../images/cloud.png',
				         '../images/hill.png',
				         '../images/grass.png',
				         '../images/asteroid.png',
				         '../images/earth.png',
				         '../images/moon.png',
				         '../images/atomic_explosion.png',
				         {src:'../sounds/Aladdin-SNES.mp3', id:'music'},
				         '../sounds/Thunder1.mp3',
				         '../sounds/Game-Shot.mp3',
				         ],
				onComplete : showCar
			}
		});

//		showCar();
//		worldManager.start();
	}

	var greyScaleFilter = new createjs.ColorMatrixFilter([
	                                                      0.33, 0.33, 0.33, 0, 0, // red
	                                                      0.33, 0.33, 0.33, 0, 0, // green
	                                                      0.33, 0.33, 0.33, 0, 0, // blue
	                                                      0, 0, 0, 1, 0  // alpha
	                                                      ]);


	/*===================================================================================================================
	 *== SHOWCAR ======================================================================================================== 
	 *===================================================================================================================*/

	function showCar() {

		worldManager.createLandscape({
			x : 2000, y : -150,
			shape : 'box',
			boxOpts : { width : 4000, height : 1137 },
			render : {				
				type : 'draw',
				drawOpts : {					
					bgColorStyle : 'transparent',
					bgImage : '../images/background.jpg'
				},
				filters : [greyScaleFilter]
			}
		});

		worldManager.createLandscape({
			x : 100, y : 250,
			shape : 'box',
			boxOpts : { width : 200, height : 100 },
			render : {				
				type : 'image',
				imageOpts : {					
					image : '../images/hill.png',
					adjustImageSize : true
				},
				action : function(e) {
					this.x += 60/e.FPS;
				},
				filters : [greyScaleFilter]
			}
		});		

		worldManager.createKeyboardHandler({
			65 : {
				onkeydown : function(e){
					worldManager.getZoomHandler().zoomIn();
				}
			},
			83 : {
				onkeydown : function(e){
					worldManager.getZoomHandler().zoomOut();
				}
			},
			68 : {
				onkeydown : function(e){
					worldManager.setEnableDebug(!worldManager.getEnableDebug());
				}
			},
			82 : {
				onkeydown : function(e){
					worldManager.setEnableRender(!worldManager.getEnableRender());
				}
			},
			70 : {
				onkeydown : function(e){
					var fullScreen = !worldManager.getScreenHandler().isFullScreen();
					if ( fullScreen )
						worldManager.getScreenHandler().showFullScreen();
					else
						worldManager.getScreenHandler().showNormalCanvasSize();
				}
			},
			37 : {
				onkeydown : function(e){
					worldManager.getPlayer().left(e);
				},
				keepPressed : true
			},
			39 : {
				onkeydown : function(e){
					worldManager.getPlayer().right(e);
				},
				keepPressed : true
			},
			80 : {
				onkeydown : function(e){
					var isPaused = worldManager.getTimeStepHandler().isPaused();
					if ( isPaused )
						worldManager.getTimeStepHandler().play();
					else
						worldManager.getTimeStepHandler().pause();
				}
			},
			79 : {
				onkeydown : function(e){
					worldManager.getTimeStepHandler().setFPS(980);
				}
			},
			73 : {
				onkeydown : function(e){
					worldManager.getTimeStepHandler().restoreFPS();
				}
			},
			49 : {
				onkeydown : function(e) {
					chassis.changeScale(1.1);
					tire1.changeScale(1.1);
					tire2.changeScale(1.1);
					link1.changeScale(1.1);
					link2.changeScale(1.1);

					man.changeScale(1.1);
					triangle.changeScale(1.1);
					letter.changeScale(1.1);
				}
			},
			50 : {
				onkeydown : function(e) {
					chassis.changeScale(0.9);					
					tire1.changeScale(0.9);
					tire2.changeScale(0.9);
					link1.changeScale(0.9);
					link2.changeScale(0.9);

					man.changeScale(0.9);
					triangle.changeScale(0.9);
					letter.changeScale(0.9);
				}
			}
		});

		worldManager.createTimeStepHandler({
			layer : {
//				shape : 'circle',
//				circleOpts : { radius : 200 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
//						bgImage : '../images/earth.png',
//						adjustBgImageSize : true
					},
					opacity : 0.3
				}				
			}
		});

		var mainManRender = true; 
		worldManager.createMultiTouchHandler({
			enableDrag : true,
			enableSlice : true,
			drawLocation : false,
//			onmousedown : function(e) {
//				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
//
//				for ( var i = 0; i < entities.length; i++ ) {
//					var entity = entities[i];
//
//					if ( entity === man ) {
//						mainManRender = !mainManRender;
//						if ( mainManRender )
//							entity.changeRender(manRender1);
//						else
//							entity.changeRender(manRender2);
//					}
//				}
//			}
		});

		worldManager.createZoomHandler({
			max : 1.1,
			min : 0.5,
			step : 0.1
		});

		worldManager.createScreenHandler({
			fullScreen: false
		});

		var floor = worldManager.createEntity({
			type : 'static',
			x : 980, y : 400,
			shape : 'box',
			boxOpts : { width : 20000, height: 10 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
			}			
		});

		var wall = worldManager.createEntity({
			type : 'static',
			x : 10000, y : 0,
			shape : 'box',
			boxOpts : { width : 10, height: 2000 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
			}			
		});

		var ramp = worldManager.createEntity({
			type : 'static',
			x : 4000, y : 400, angle : 75,
			shape : 'box',
			boxOpts : { width : 10, height: 400 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#000' }
				},
			},
		});

		var triangle = worldManager.createEntity({
			type : 'dynamic',
			x : 50, y : 250,
			shape : 'polygon',
//			polygonOpts : { points : [ {x:  -40, y: 0}, {x: 0, y: -40}, {x: 40, y: 0} ] },
			polygonOpts : { points : [ {x:  0, y: 0}, {x: 40, y: -40}, {x: 80, y: 0} ] },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#757575' },
					borderWidth : 2,
					cache : true
				},
			}
		});	

		var manRender1 = {
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['../images/runningGrant.png'],
						animations : {'run': [0, 25], 'jump': [26, 63,'run']},
						frames : {'height': 292.5, 'width': 165.75}
					},
					startAnimation : 'run',
					adjustImageSize : true
				}
		}

		var manRender2 = {
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['../images/runningGrant.png'],
						animations : {'run': [0, 25], 'jump': [26, 63,'run']},
						frames : {'height': 292.5, 'width': 165.75}
					},
					startAnimation : 'run',
					adjustImageSize : true
				},
				filters : [greyScaleFilter]
		}		

		var man = worldManager.createEntity({
			type : 'dynamic',
			x : 200, y : 250,
			shape : 'box',
			boxOpts : { width : 60, height : 90 },
			render : manRender1,
			bodyDefOpts : {	fixedRotation : false },
			draggable : true,
		});

		var chassis = worldManager.createEntity({
			type : 'dynamic',
			x : 360, y : 150,
			shape : 'box',
			boxOpts : { width : 150, height : 50 },
			render : {
				type : 'image',
				imageOpts : {
					image : '../images/hummer.png',
					adjustImageSize : true
				}
			},
			draggable : true,
			name : 'chassis'
		});

		var renderTire = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					bgImage : '../images/tire.png',
					adjustBgImageSize : true,
					cache : true
				}
		};

		var tire1 = worldManager.createEntity({
			type : 'dynamic',
			x : 330, y : 200,
			shape : 'circle',
			circleOpts : { radius : 20 },
			render : renderTire,
			draggable : true
		});		

		var tire2 = worldManager.createEntity({
			type : 'dynamic',
			x : 420, y : 200,
			shape : 'circle',
			circleOpts : { radius : 20 },
			render : renderTire,
			draggable : true
		});

		var link1 = worldManager.createLink({
			entityA : chassis,
			entityB : tire1,
			type : 'revolute',
			localAnchorA : {x : -1.6, y : 1.1},
			localAnchorB : {x : 0, y : 0}
		});

		var link2 = worldManager.createLink({
			entityA : chassis,
			entityB : tire2,
			type : 'revolute',
			localAnchorA : {x : 1.8, y : 1.1},
			localAnchorB : {x : 0, y : 0}
		});		

		var player = worldManager.createPlayer(chassis, {
			camera : {
				adjustX : 490,
//				adjustY : 400,
				xAxisOn: true,
//				yAxisOn: true
			},
			events : {
				left : function(e) {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-1500,0), this.getB2Body().GetWorldCenter());
				},
				right : function(e) {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(1500,0), this.getB2Body().GetWorldCenter());
				}
			}
		});

		var leftBtnRender1 = {
				type : 'image',
				imageOpts : {
					image : '../images/leftarrow.png',
					adjustImageSize : true
				}
		};

		var leftBtnRender2 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color: 'white' },
					borderWidth : 2,
					bgImage : '../images/leftarrow.png',
					adjustBgImageSize : true
				}
		};		

		var leftBtn = worldManager.createScreenButton({
			x : 830, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },
			render : leftBtnRender1,
			onmousedown : function(e) {
				player.left(e);
				leftBtn.changeRender(leftBtnRender2);
			},
			onmouseup : function(e) {
				leftBtn.changeRender(leftBtnRender1);
			},			
			keepPressed : true
		});

		var rightBtnRender1 = {				
				type : 'image',
				imageOpts : {
					image : '../images/rightarrow.png',
					adjustImageSize : true
				}
		};

		var rightBtnRender2 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color: 'white' },
					borderWidth : 2,
					bgImage : '../images/rightarrow.png',
					adjustBgImageSize : true
				}
		};		

		var rightBtn = worldManager.createScreenButton({
			x : 930, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },
			render : rightBtnRender1,
			onmousedown : function(e) {
				player.right(e);
				rightBtn.changeRender(rightBtnRender2);
			},
			onmouseup : function(e) {
				rightBtn.changeRender(rightBtnRender1);
			},
			keepPressed : true
		});

		var letter = worldManager.createEntity({
			type : 'dynamic',
			x : 600, y : 200,
			shape : 'circle',
			boxOpts : { width : 100, height: 100 },
			circleOpts : { radius : 40 },
			polygonOpts : { points : [ {x: -50, y: 0}, {x: 0, y: -50}, {x: 50, y: 0} ] },			
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					textOpts : {
						text : '8',
						font : 'bold 38px Arial',
						color : 'yellow'
					},
					borderWidth : 3,
					borderColor : 'white',
					bgImage : '../images/earth.png',
					adjustBgImageSize : true,
//					cache : true,
				},
				filters : [greyScaleFilter]
			}
		});
	}

}());