this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	var worldManager;

	function MyApp() {
		this.initialize();
	}

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
				         'images/tire.png',
				         'images/tire2.png',
				         'images/hummer.png',
				         'images/runningGrant.png',
				         'images/explosion.png',
				         'images/start.png',
				         'images/leftarrow.png',
				         'images/rightarrow.png',
				         'images/ball.png',
				         'images/wall.jpg',
				         'images/background.jpg',
				         'images/cloud.png',
				         'images/hill.png',
				         'images/grass.png',
				         'images/asteroid.png',
				         'images/earth.png',
				         'images/moon.png',
				         'images/atomic_explosion.png',
				         {src:'sounds/Aladdin-SNES.mp3', id:'music'},
				         'sounds/Thunder1.mp3',
				         'sounds/Game-Shot.mp3',
				         ],
//				         onComplete : showCar
//				         onComplete : testPerformance
//				         onComplete : testJoints
//				         onComplete : testImpluseForce
//				         onComplete : testDeleteEntities
//				         onComplete : testSpriteSheet
//				         onComplete : testMultiTouch
//				         onComplete : testButtonPressed
//				         onComplete : testGrenade
//				         onComplete : testSticky
//				         onComplete : testWind
//				         onComplete : testSlice
//				         onComplete : testBackground
//				         onComplete : testMoreComplex
//				         onComplete : testGravitation
//				         onComplete : testBreak
//				         onComplete : testChangePlayer
				         onComplete : testSound
//				         onComplete : testRender
			}
		});

//		showCar();
//		worldManager.start();
	}

	MyGameBuilder.MyApp = MyApp;

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

//		worldManager.createLandscape({
//		x : 2000, y : -150,
//		shape : 'box',
//		boxOpts : { width : 4000, height : 1137 },
//		render : {				
//		type : 'draw',
//		drawOpts : {					
//		bgColorStyle : 'transparent',
//		bgImage : 'images/background.jpg'
//		},
//		filters : [greyScaleFilter]
//		}
//		});

		worldManager.createLandscape({
			x : 100, y : 250,
			shape : 'box',
			boxOpts : { width : 200, height : 100 },
			render : {				
				type : 'image',
				imageOpts : {					
					image : 'images/hill.png',
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
//						bgImage : 'images/earth.png',
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
//			var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);

//			for ( var i = 0; i < entities.length; i++ ) {
//			var entity = entities[i];

//			if ( entity === man ) {
//			mainManRender = !mainManRender;
//			if ( mainManRender )
//			entity.changeRender(manRender1);
//			else
//			entity.changeRender(manRender2);
//			}
//			}
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
						images : ['images/runningGrant.png'],
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
						images : ['images/runningGrant.png'],
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
					image : 'images/hummer.png',
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
					bgImage : 'images/tire.png',
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
					image : 'images/leftarrow.png',
					adjustImageSize : true
				}
		};

		var leftBtnRender2 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color: 'white' },
					borderWidth : 2,
					bgImage : 'images/leftarrow.png',
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
					image : 'images/rightarrow.png',
					adjustImageSize : true
				}
		};

		var rightBtnRender2 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color: 'white' },
					borderWidth : 2,
					bgImage : 'images/rightarrow.png',
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
					bgImage : 'images/earth.png',
					adjustBgImageSize : true,
//					cache : true,
				},
				filters : [greyScaleFilter]
			}
		});
	}


	/*===================================================================================================================
	 *== TESTPERFORMANCE ================================================================================================ 
	 *===================================================================================================================*/	

	function testPerformance() {

		worldManager.createLandscape({
			x : 490, y : 250,
			shape : 'box',
			boxOpts : {
				width : 980, //4000
				height : 500, //1137
			},
			render : {
				type : 'image',
				imageOpts : {					
					image : 'images/background.jpg',
					adjustImageSize : true
				},
				filters : [greyScaleFilter]
			}
		});

		var k = worldManager.createKeyboardHandler({
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
			49 : {
				onkeydown : function(e) {
					for ( var i = 0; i < balls.length; i++ )
						balls[i].changeScale(1.1);
				}
			},
			50 : {
				onkeydown : function(e) {
					for ( var i = 0; i < balls.length; i++ )
						balls[i].changeScale(0.9);
				}
			}
		});

		worldManager.createMultiTouchHandler({
			enableDrag : true
		});		

		worldManager.createZoomHandler();
		worldManager.createScreenHandler();

		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#000' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 800, y : 100,
			shape : 'box',
			boxOpts : { width : 5, height: 260 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 880, y : 280, angle : -15,
			shape : 'box',
			boxOpts : { width : 200, height: 5 },
			render : renderStatic
		});

		var balls = [];
		for ( var i = 0; i < 200; i++ ) {
			var ball = worldManager.createEntity({
				type : 'dynamic',
				x : 980 - (Math.random() * 180),
				y : Math.random() * 150,
				shape : 'circle',
				circleOpts : { radius : 7 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'radialGradient',
//						bgSolidColorOpts : { color : '#3399cc' },
						borderWidth : 2,
						textOpts : {
							text : '8',
							font : '12px Arial'
						},
						cache : true,
					},
//					filters : [greyScaleFilter],
				},
				draggable : true
			});
			balls.push(ball);
		}		
	}


	/*===================================================================================================================
	 *== TESTJOINTS ===================================================================================================== 
	 *===================================================================================================================*/	

	function testJoints() {
		worldManager.createKeyboardHandler({
			68 : {
				onkeydown : function(e){
					worldManager.setEnableDebug(!worldManager.getEnableDebug());
				}
			},
			82 : {
				onkeydown : function(e){
					worldManager.setEnableRender(!worldManager.getEnableRender());
				}
			}
		});		

		worldManager.createMultiTouchHandler({
			enableDrag : true
		});		

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
			}			
		});

		var b1 = worldManager.createEntity({
			type : 'dynamic',
			x : 450, y : 250,
			shape : 'box',
			boxOpts : { width : 40, height: 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'blue' }
				}
			},
			draggable : true
		});

		var b2 = worldManager.createEntity({
			type : 'dynamic',
			x : 540, y : 250,
			shape : 'box',
			boxOpts : { width : 40, height: 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'red' }
				}
			},
			draggable : true
		});

		worldManager.createLink({
			entityA : b1,
			entityB : b2,
			type : 'prismatic',
			localAxisA : {x: 0, y: 1},
			options : {
				lowerTranslation : 2,
				upperTranslation : 5,
				enableLimit : true
			}
		});
	}


	/*===================================================================================================================
	 *== TESTIMPULSEFORCE================================================================================================ 
	 *===================================================================================================================*/

	function testImpluseForce() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic			
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic			
		});		

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic			
		});		

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic			
		});

		var entity = worldManager.createEntity({
			type : 'dynamic',
			x : 300, y : 250,
			shape : 'circle',
			circleOpts : { radius : 30 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					bgImage : 'images/tire.png',
					adjustBgImageSize : true
				}
			},
			draggable : true,
			group : 'bolas'
		});

		worldManager.createMultiTouchHandler();

		var direction = 1;
		worldManager.createKeyboardHandler({
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
			49 : {
				onkeydown : function(e){
					entity.getB2Body().ApplyForce(new box2d.b2Vec2(direction * 50,0), entity.b2body.GetWorldCenter());
				},
				keepPressed : true
			},
			50 : {
				onkeydown : function(e){
					entity.getB2Body().ApplyImpulse(new box2d.b2Vec2(direction * 50,0), entity.b2body.GetWorldCenter());
				}				
			},
			51 : {
				onkeydown : function(e){
					entity.getB2Body().ApplyForce(new box2d.b2Vec2(direction * 50,0), {x:1, y:1});
				},
				keepPressed : true
			},
			52 : {
				onkeydown : function(e){
					entity.getB2Body().ApplyImpulse(new box2d.b2Vec2(direction * 50,0), {x:1, y:1});
				}				
			},
			37 : {
				onkeydown : function(e){
					direction = -1;
				}
			},
			39 : {
				onkeydown : function(e){
					direction = 1;
				}
			}
		});
	}

	/*===================================================================================================================
	 *== TESTDELETEENTITIES ============================================================================================= 
	 *===================================================================================================================*/

	function testDeleteEntities() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#8a8a8a' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic			
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic			
		});		

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		for ( var i = 0; i < 20; i++ ) {
			worldManager.createEntity({
				type : 'dynamic',
				x : Math.random() * 980,
				y : Math.random() * 500,
				shape : 'circle',
				circleOpts : { radius : 30 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color : 'white' },
						borderWidth : 2, borderColor : 'black'
					}
				},
				group : 'ball'
			});
		}

		var square = worldManager.createEntity({
			type : 'dynamic',
			x : 400, y : 250,
			shape : 'box',
			boxOpts : { width : 60, height : 60 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' },
					borderWidth : 2, borderColor : 'black'
				}				
			},
			draggable : true,
			noGravity : true
		});

		var ball = worldManager.createEntity({
			type : 'dynamic',
			x : Math.random() * 980,
			y : Math.random() * 500,
			shape : 'circle',
			circleOpts : { radius : 30 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' },
					borderWidth : 2, borderColor : 'black'
				}
			},
			group : 'ball',
			noGravity : true
		});

		worldManager.createLink({
			entityA : square,
			entityB : ball,
			type : 'revolute',
			localAnchorA : {x:0, y:2}
		});

		worldManager.createMultiTouchHandler({
			enableDrag : true,
			onmousedown : function(e) {
				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				for ( var i = 0; i < entities.length; i++ ) {
					var entity = entities[i];
					if ( entity.getGroup() == 'ball' )
						worldManager.deleteEntity(entity);
				}
			}
		});

		worldManager.createKeyboardHandler({
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
			65 : {
				onkeydown : function(e){
					worldManager.deleteEntity(square);
				}				
			}
		});
	}


	/*===================================================================================================================
	 *== TESTSPRITESHEET ================================================================================================ 
	 *===================================================================================================================*/

	function testSpriteSheet() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#8a8a8a' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 450,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		var man = worldManager.createEntity({
			type : 'dynamic',
			x : 400, y : 250,
			shape : 'box',
			boxOpts : { width : 60, height : 90 },
			render : {
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['images/runningGrant.png'],
						animations : {'run': [0, 25], 'jump': [26, 63,'run']},
						frames : {'height': 292.5, 'width': 165.75}
					},
					startAnimation : 'run',
					adjustImageSize : true
				},
			},
			bodyDefOpts : {	fixedRotation : true },
			fixtureDefOpts : { friction : 0.2 },
			draggable : true
		});

		var ball = worldManager.createEntity({
			type : 'dynamic',
			x : 300, y : 250,
			shape : 'circle',
			circleOpts : { radius : 20 },
			render : {
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['images/explosion.png'],
						animations : {'normal' : [0], 'explode': [1, 47, 'normal']},
						frames : {'height': 256, 'width': 256}
					},
					startAnimation : 'normal',
					adjustImageSize : false
				}				
			},
			bodyDefOpts : { fixedRotation : true },
			draggable : true
		});

		worldManager.createMultiTouchHandler({
			enableDrag : true
		});

		worldManager.createScreenHandler();

		worldManager.createKeyboardHandler({
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
			65 : {
				onkeydown : function(e){
					ball.b2body.view.gotoAndPlay("explode");
					man.b2body.view.gotoAndPlay("jump");
				}
			},
			37 : {
				onkeydown : function(e){
					man.b2body.ApplyForce(new box2d.b2Vec2(-300,0), man.b2body.GetWorldCenter());
				},
				keepPressed : true
			},
			39 : {
				onkeydown : function(e){
					man.b2body.ApplyForce(new box2d.b2Vec2(300,0), man.b2body.GetWorldCenter());
				},
				keepPressed : true
			}
		});	

		worldManager.createScreenButton({
			x : 50, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 50 },
			render : {
				type : 'image',
				imageOpts : {
					image : 'images/start.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				ball.b2body.view.gotoAndPlay("explode");
				man.b2body.view.gotoAndPlay("jump");
			}
		});

		worldManager.createScreenButton({
			x : 830, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },
			render : {				
				type : 'image',
				imageOpts : {
					image : 'images/leftarrow.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				man.b2body.ApplyForce(new box2d.b2Vec2(-300,0), man.b2body.GetWorldCenter());
			},
			keepPressed : true
		});

		worldManager.createScreenButton({
			x : 930, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },
			render : {
				type : 'image',
				imageOpts : {
					image : 'images/rightarrow.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				man.b2body.ApplyForce(new box2d.b2Vec2(300,0), man.b2body.GetWorldCenter());
			},
			keepPressed : true
		});

		var bo = worldManager.createBrowserOSHandler();
		var text = bo.getBrowserName() + ' ' + bo.getBrowserVersion() + ', ' + bo.getOS(); 
		document.getElementById("browser_os").innerHTML = text;
	}


	/*===================================================================================================================
	 *== TESTMULTITOUCH ================================================================================================= 
	 *===================================================================================================================*/

	function testMultiTouch() {
		worldManager.setEnableDebug(true);

		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#8a8a8a' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 450,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		var ball2 = worldManager.createEntity({
			type : 'dynamic',
			x : 400, y : 250,
			shape : 'circle',
			circleOpts : { radius : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#fff' }
				}
			},
			draggable : true
		});

		var ball3 = worldManager.createEntity({
			type : 'dynamic',
			x : 500, y : 250,
			shape : 'circle',
			circleOpts : { radius : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#fff' }
				}
			},
			draggable : true
		});

		var ball = worldManager.createEntity({
			type : 'dynamic',
			x : 300, y : 250,
			shape : 'circle',
			circleOpts : { radius : 40 },
			render : {
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['images/explosion.png'],
						animations : {'normal' : [0], 'explode': [1, 47, 'normal']},
						frames : {'height': 256, 'width': 256}
					},
					startAnimation : 'normal',
					adjustImageSize : false
				}
			},
			bodyDefOpts : { fixedRotation : true },
			draggable : true
		});		

		worldManager.createMultiTouchHandler({
			enableDrag : true,
			drawLocation : true,
			onmousedown : function() {
				output.innerHTML = 'MOUSEDOWN';
			},
			onmouseup : function() {
				output.innerHTML = 'MOUSEUP';
			}
		});

		worldManager.createScreenButton({
			x : 50, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 50 },
			render : {
				type : 'image',
				imageOpts : {
					image : 'images/start.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				ball.b2body.view.gotoAndPlay("explode");
				output.innerHTML = 'DOWN';
			},
			onmouseup : function() {
				output.innerHTML = 'UP';
			}
		});

		worldManager.createScreenButton({
			x : 830, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },	
			render : {			
				type : 'image',
				imageOpts : {
					image : 'images/leftarrow.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				ball.b2body.ApplyForce(new box2d.b2Vec2(-600,0), ball.b2body.GetWorldCenter());
			},
			keepPressed : true
		});

		worldManager.createScreenButton({
			x : 930, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },
			render : {			
				type : 'image',
				imageOpts : {
					image : 'images/rightarrow.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				ball.b2body.ApplyForce(new box2d.b2Vec2(600,0), ball.b2body.GetWorldCenter());
			},
			keepPressed : true
		});

		var bo = worldManager.createBrowserOSHandler();
		var text = bo.getBrowserName() + ' ' + bo.getBrowserVersion() + ', ' + bo.getOS(); 
		document.getElementById("browser_os").innerHTML = text;
	}


	/*===================================================================================================================
	 *== TESTBUTTONPRESSED ============================================================================================== 
	 *===================================================================================================================*/

	function testButtonPressed() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#8a8a8a' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 450,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createScreenButton({
			x : 830, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },
			render : {
				type : 'image',
				imageOpts : {
					image : 'images/leftarrow.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				createBullet();
			},
			keepPressed : true
		});

		worldManager.createScreenButton({
			x : 930, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 40 },
			render : {				
				type : 'image',
				imageOpts : {
					image : 'images/rightarrow.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				createBullet();
			}
		});	

		worldManager.createKeyboardHandler({
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
			49 : {
				onkeydown : function(e){
					createBullet();
				},
				keepPressed : true
			},
			50 : {
				onkeydown : function(e){
					console.log('down' + e.which);
					createBullet();
				},
				onkeyup : function(e){
					console.log('up' + e.which);
				}
			}
		});		

		worldManager.createMultiTouchHandler({
			radius : 20,
			accurate : false,
			drawLocation : true,
			onmousedown : function(e) {
				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				for ( var i = 0; i < entities.length; i++ ) {
					var entity = entities[i];
					worldManager.deleteEntity(entity);
				}
			},
			onmousemove : function(e) {
				var x = e.x || e.clientX;
				var y = e.y || e.clientY;
				output.innerHTML = x + ':' + y;
				if ( !worldManager.getMultiTouchHandler().isTouchable() && !worldManager.getMultiTouchHandler().isMouseDown() )
					return;

				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				for ( var i = 0; i < entities.length; i++ ) {
					var entity = entities[i];
					worldManager.deleteEntity(entity);
				}
			}
		});

		for ( var i = 0; i < 200; i++ ) {
			worldManager.createEntity({
				type : 'dynamic',
				x : Math.random() * 980,
				y : Math.random() * 400,
				shape : 'circle',
				circleOpts : { radius : 10 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color : 'black' }
					}
				},
				draggable : true
			});
		}

		function createBullet() {
			var ball = worldManager.createEntity({
				type : 'dynamic',
				x : 50, y : 100,
				shape : 'circle',
				circleOpts : { radius : 30 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'transparent',
						bgImage : 'images/ball.png',
						adjustBgImageSize : true,
						borderColor : 'white', borderWidth : 1
					}					
				},
				draggable : true
			});
			ball.b2body.ApplyImpulse(new box2d.b2Vec2(-300,0), ball.b2body.GetWorldCenter());
		}
	}


	/*===================================================================================================================
	 *== TESTGRENADE ==================================================================================================== 
	 *===================================================================================================================*/

	function testGrenade() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createKeyboardHandler({
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
			65 : {
				onkeydown : function(e){
					grenade1.explode();
					grenade1.getEntity().b2body.view.gotoAndPlay("explode");
					setTimeout(function() {
						grenade1.clearParticles();
					}, 500);

					soundHandler.createSoundInstance({id : 'explosion'}).play();
				}
			},
			83 : {
				onkeydown : function(e){
					grenade2.clearParticles();
					grenade2.explode();
					grenade2.getEntity().b2body.view.gotoAndPlay("explode");

					soundHandler.createSoundInstance({id : 'explosion2'}).play();
				}
			}			
		});

		worldManager.createMultiTouchHandler();

		var soundHandler = worldManager.createSoundHandler({
			registerFiles : [{src : 'sounds/explosion.mp3', id:'explosion'}, {src : 'sounds/Thunder1.mp3', id:'explosion2'}]
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 350,
			shape : 'box',
			boxOpts : { width : 400, height: 10 },
			render : renderStatic
		});		

		worldManager.createEntity({
			type : 'dynamic',
			x : 550, y : 100,
			shape : 'box',
			boxOpts : { width : 20, height: 60 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#1316AD' }
				}
			},
			draggable : true
		});

		worldManager.createEntity({
			type : 'dynamic',
			x : 350, y : 400,
			shape : 'box',
			boxOpts : { width : 30, height: 90 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#1316AD' }
				}
			},
			draggable : true
		});

		var ball1 = worldManager.createEntity({
			type : 'dynamic',
			x : 400, y : 400,
			shape : 'box',
			boxOpts : { width : 40, height: 40 },
			render : {
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['images/explosion.png'],
						animations : {'normal' : [0], 'explode': [1, 47, 'normal']},
						frames : {'height': 256, 'width': 256}
					},
					startAnimation : 'normal',
					adjustImageSize : false
				}
			},
			bodyDefOpts : { fixedRotation : true },
			fixtureDefOpts : { density : 1, friction : 0, restitution : 0.25 },
			draggable : true
		});

		var grenade1 = worldManager.createGrenade(ball1, {
			numParticles : 32,
			blastPower : 1000,
			particleOpts : {
				shape : 'circle',
				circleOpts : { radius : 5 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color : 'yellow' }
					}
				}
			}
		});

		var ball2 = worldManager.createEntity({
			type : 'dynamic',
			x : 600, y : 400,
			shape : 'circle',
			circleOpts : { radius : 20 },
			render : {				
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['images/explosion.png'],
						animations : {'normal' : [0], 'explode': [1, 47, 'normal']},
						frames : {'height': 256, 'width': 256}
					},
					startAnimation : 'normal',
					adjustImageSize : false
				}
			},
			bodyDefOpts : { fixedRotation : true },
			fixtureDefOpts : { density : 1, friction : 0, restitution : 0.25 },
			draggable : true
		});		

		var grenade2 = worldManager.createGrenade(ball2, {
			numParticles : 32,
			blastPower : 1000,
			particleOpts : {
				shape : 'box',
				boxOpts : { width : 10, height: 10 },
				render : {
					type : 'spritesheet',
					spriteSheetOpts : {
						spriteData : {
							images : ['images/explosion.png'],
							animations : {'normal' : [0], 'explode': [1, 47, 'normal']},
							frames : {'height': 256, 'width': 256}
						},
						startAnimation : 'explode',
						adjustImageSize : true
					}
				}
			}
		});		
	}


	/*===================================================================================================================
	 *== TESTSTICKY ===================================================================================================== 
	 *===================================================================================================================*/

	function testSticky() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 800, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'red' }
				}
			},
			fixtureDefOpts : { restitution : 0.1, isTarget : true },
		});

		var box = worldManager.createEntity({
			type : 'dynamic',
			x : 300, y : 250,
			shape : 'box',
			boxOpts : { width: 50, height: 300 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'red' }
				}
			},
			fixtureDefOpts : { density : 10, restitution : 0, isTarget : true, hardness : 50 }
		});

		worldManager.createKeyboardHandler({
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
			65 : {
				onkeydown : function(e){
					var windOn = worldManager.getWind().isOn();
					if ( windOn )
						worldManager.getWind().stop();
					else
						worldManager.getWind().start();
				}
			},
			37 : {
				onkeydown : function(e){
					aim.b2body.ApplyForce(new box2d.b2Vec2(-100,0), aim.b2body.GetWorldCenter());
				},
				keepPressed : true
			},			
			38 : {
				onkeydown : function(e){
					aim.b2body.ApplyForce(new box2d.b2Vec2(0,-100), aim.b2body.GetWorldCenter());
				},
				keepPressed : true
			},
			39 : {
				onkeydown : function(e){
					aim.b2body.ApplyForce(new box2d.b2Vec2(100,0), aim.b2body.GetWorldCenter());
				},
				keepPressed : true
			},
			40 : {
				onkeydown : function(e){
					aim.b2body.ApplyForce(new box2d.b2Vec2(0,100), aim.b2body.GetWorldCenter());
				},
				keepPressed : true
			}
		});		

		worldManager.createWind({
			numRays: 50,
			power: 2500,
			on: false,
			directionTo: 'left',
			adjustX : 80
		});

		var mouseX, mouseY;
		worldManager.createMultiTouchHandler({
			drawLocation : false,
			onmousedown : function(e) {
				var aimX = aim.getPosition().x;
				var aimY = aim.getPosition().y;

				var dirX = mouseX - aimX;
				var dirY = mouseY - aimY;
				var theta = Math.atan2(dirY, dirX);
				if (theta < 0)
					theta += 2 * Math.PI;
				var angle = theta * (180/Math.PI);

				console.log( angle );

				var bullet = worldManager.createEntity({
					type : 'dynamic',
					x : aimX, y : aimY, angle : angle,
					shape : 'box',
					polygonOpts : {
						points : [ {x:-40, y:0 }, {x:0 , y:-2 }, {x:10 , y:0 }, {x:0 , y:2 }]
					},
					circleOpts : { radius : 5 },
					boxOpts : { width : 10, height : 10 },
					render : {						
						type : 'draw',
						drawOpts : {
							bgColorStyle : 'solid',
							bgSolidColorOpts : { color : 'black' }
						}
					},
					bodyDefOpts : { bullet : false },
					fixtureDefOpts : { density: 15, restitution : 0.1, isSticky : true, filterGroupIndex : -1 }
				});				

				bullet.b2body.ApplyImpulse(new box2d.b2Vec2(dirX, dirY), bullet.b2body.GetWorldCenter());
			},
			onmousemove : function(e) {
				mouseX = e.x;
				mouseY = e.y;
			}
		});

		worldManager.createContactHandler({
			stickyTargetOpts : {
				preSolveStick : false
			}
		});

		var aim = worldManager.createEntity({
			type : 'dynamic',
			x : 20, y : 250,
			shape : 'polygon',
			polygonOpts : {
				points : [ {x:-10, y:0 }, {x:0 , y:-10 }, {x:10 , y:0 }, {x:0 , y:10 }],
//				points : [ {x:0, y:-10 }, {x:-10 , y:0 }, {x:0 , y:10 }, {x:50 , y:0 }],
//				points : [ {x:0, y:10 }, {x:10 , y:30 }, {x:60 , y:20 }, {x:20 , y:0 }],
			},
			boxOpts : { width : 20, height : 20 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'blue' },
					textOpts : {
						text : 'I'
					},
//					cache : true
				},
//				filters : [greyScaleFilter]
			},
			bodyDefOpts : { fixedRotation : true },
			fixtureDefOpts : { density: 10, restitution : 0, filterGroupIndex : -1 },
			draggable : false,
			noGravity : true
		});	
	}


	/*===================================================================================================================
	 *== TESTWIND ======================================================================================================= 
	 *===================================================================================================================*/

	function testWind() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createKeyboardHandler({
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
			65 : {
				onkeydown : function(e){
					var windOn = worldManager.getWind().isOn();
					if ( windOn )
						worldManager.getWind().stop();
					else
						worldManager.getWind().start();
				}
			}
		});		

		worldManager.createMultiTouchHandler();
		worldManager.createWind({
			numRays: 50,
			power: 300,
			on: false,
			directionTo: 'right',
			width : 800,
			height : 250,
			adjustY : 100,
			adjustX : 100
		});

		var box = worldManager.createEntity({
			type : 'dynamic',
			x : 800, y : 100,
			shape : 'box',
			boxOpts : { width : 40, height : 100 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' }
				}
			},
			fixtureDefOpts : {density: 10},
			draggable : true
		});

		var box2 = worldManager.createEntity({
			type : 'dynamic',
			x : 500, y : 100,
			shape : 'box',
			boxOpts : { width : 40, height : 40 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' }
				}
			},
			draggable : true
		});

		var box3 = worldManager.createEntity({
			type : 'static',
			x : 650, y : 450,
			shape : 'box',
			boxOpts : { width : 10, height : 100 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'black' }
				}
			},
			draggable : true
		});		

		var circle = worldManager.createEntity({
			type : 'dynamic',
			x : 600, y : 100,
			shape : 'circle',
			circleOpts : { radius : 20 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' }
				}
			},
			draggable : true
		});

		var triangle = worldManager.createEntity({
			type : 'dynamic',
			x : 400, y : 250,
			shape : 'polygon',
			polygonOpts : { points : [ {x: -40, y: 0}, {x: 0, y: -40}, {x: 40, y: 0} ] },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' }
				}
			},
			fixtureDefOpts : { density : 1.0 },
			draggable : true
		});
	}


	/*===================================================================================================================
	 *== TESTSLICE ====================================================================================================== 
	 *===================================================================================================================*/

	function testSlice() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createMultiTouchHandler({
			enableSlice : true,
			sliceOpts : {
				lineColor : 'yellow',
				lineWidth : 4
			}
		});

		var valDrag = worldManager.getMultiTouchHandler().getEnableDrag();
		var valSlice = worldManager.getMultiTouchHandler().getEnableSlice();
		output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice;
		worldManager.createKeyboardHandler({
			68 : {
				onkeydown : function(e) {
					worldManager.setEnableDebug(!worldManager.getEnableDebug());
				}
			},
			82 : {
				onkeydown : function(e) {
					worldManager.setEnableRender(!worldManager.getEnableRender());
				}
			},
			65 : {
				onkeydown : function(e) {
					valDrag = !worldManager.getMultiTouchHandler().getEnableDrag();
					worldManager.getMultiTouchHandler().setEnableDrag(valDrag);
					output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice;
				}
			},
			83 : {
				onkeydown : function(e) {
					valSlice = !worldManager.getMultiTouchHandler().getEnableSlice()
					worldManager.getMultiTouchHandler().setEnableSlice(valSlice);
					output.innerHTML = 'DRAG:' + valDrag + ' - SLICE:' + valSlice;
				}
			}			
		});

		var box = worldManager.createEntity({
			type : 'dynamic',
			x : 100, y : 100, angle : 5,
			shape : 'box',
			boxOpts : { width : 60, height : 120 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' },
					borderWidth : 2, borderColor : 'black'
				}
			},
			sliceable : true,
			noGravity : true,
			events : {
				ontick : function(e) {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(10,0), this.getB2Body().GetWorldCenter());
				}
			}
		});

		var box3 = worldManager.createEntity({
			type : 'static',
			x : 700, y : 100, angle : 5,
			shape : 'box',
			boxOpts : { width : 60, height : 120 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'gray' },
					borderWidth : 2, borderColor : 'black'
				}
			},
			sliceable : true,
			noGravity : true
		});

		var box2 = worldManager.createEntity({
			type : 'dynamic',
			x : 200, y : 400,
			shape : 'box',
			boxOpts : { width : 100, height : 100 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					bgImage : 'images/wall.jpg',
					adjustBgImageSize : false
				}
			},
			sliceable : true,
			noGravity : true
		});

		var circle = worldManager.createEntity({
			type : 'dynamic',
			x : 800, y : 400,
			shape : 'circle',
			circleOpts : { radius : 50 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					bgImage : 'images/tire.png',
					adjustBgImageSize : true
				}
			},
			sliceable : true,
			noGravity : true
		});	

		var triangle = worldManager.createEntity({
			type : 'dynamic',
			x : 600, y : 200,
			shape : 'polygon',
			polygonOpts : { points : [ {x: -80, y: 0}, {x: 0, y: -80}, {x: 80, y: 0} ] },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' },
					borderWidth : 2, borderColor : 'black'
				}
			},
			bodyDefOpts : { angularVelocity : 30 },
			sliceable : true
		});		
	}


	/*===================================================================================================================
	 *== TESTBACKGROUND ================================================================================================= 
	 *===================================================================================================================*/

	function testBackground() {

		worldManager.createLandscape({
			x : 490, y : 250,
			shape : 'box',
			boxOpts : { width : 980, height : 500 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'linearGradient',
					bgLinearGradientOpts : {
						colors: ['#85C8F2', 'white']
					}
				}
			}
		});

		worldManager.createLandscape({
			x : 200, y : 200,
			shape : 'box',
			boxOpts : { width : 200, height : 150 },
			render : {
				type : 'image',
				imageOpts : {
					image : 'images/cloud.png',
					adjustImageSize : true,					
				},
				action : function() {
					this.x += 0.1;
				}				
			}
		});		

		worldManager.createLandscape({
			x : 300, y : 320,
			shape : 'box',
			boxOpts : { width : 600, height : 264 },
			render : {
				type : 'image',
				imageOpts : {					
					image : 'images/hill.png',
					adjustImageSize : false,
				},
				action : function() {
					this.x += 0.2;
				}				
			}
		});

		worldManager.createLandscape({
			x : 400, y : 100,
			shape : 'box',
			boxOpts : { width : 315, height : 243 },
			render : {
				type : 'image',
				imageOpts : {					
					image : 'images/cloud.png',
					adjustImageSize : false,
				},
				action : function() {
					this.x += 0.4;
				}				
			}
		});

		worldManager.createLandscape({
			x : -15, y : 250,
			shape : 'box',
			boxOpts : { width : 1990, height : 500 },
			render : {
				type : 'image',
				imageOpts : {
					image : 'images/grass.png',
					adjustImageSize : false,
				},
				action : function() {
					this.x += 1;
				}
			}
		});
	}


	/*===================================================================================================================
	 *== TESTMORECOMPLEX ================================================================================================ 
	 *===================================================================================================================*/		

	function testMoreComplex() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#000' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createKeyboardHandler({
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
			65 : {
				onkeydown : function(e){
					var windOn = worldManager.getWind().isOn();
					if ( windOn )
						worldManager.getWind().stop();
					else
						worldManager.getWind().start();
				}
			}
		});		

		worldManager.createMultiTouchHandler({
			enableSlice : true,
			sliceOpts : {
				lineWidth : 3
			}
		});

		worldManager.createContactHandler({
			enabledBuoyancy : true,
			buoyancyOpts : {
				complexDragFunction : true
			}			
		});

		worldManager.createWind({
			numRays: 100,
			power: 5000,
			on: false,
			directionTo: 'left'
		});

		worldManager.createLandscape({
			x : 490, y : 250,
			shape : 'box',
			boxOpts : { width : 980, height : 500 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'linearGradient',
					bgLinearGradientOpts : {
						colors : ['#3399cc', '#fff']
					}
				}				
			}
		});

		worldManager.createLandscape({
			y : 170,
			shape : 'box',
			boxOpts : { width : 200, height : 150 },
			render : {
				type : 'image',
				imageOpts : {					
					image : 'images/cloud.png',
					adjustImageSize : true
				},
				action : function() {
					this.x += 0.2;
					if ( this.x > 1080 )
						this.x = -100;
				}
			}
		});

		worldManager.createLandscape({
			x : 400, y : 100,
			shape : 'box',
			boxOpts : { width : 315, height : 243 },
			render : {
				type : 'image',
				imageOpts : {
					image : 'images/cloud.png'
				},
				action : function() {
					this.x += 0.3;
					if ( this.x > 1080 )
						this.x = -100;
				}				
			}
		});

		var square = worldManager.createEntity({
			type : 'dynamic',
			x : 400, y : 250,
			shape : 'box',
			boxOpts : { width : 60, height: 60 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#757575' },
					borderWidth : 2
				},
			},
			fixtureDefOpts : { density : 0.9 },
			sliceable : true
		});

		var square2 = worldManager.createEntity({
			type : 'dynamic',
			x : 700, y : 250,
			shape : 'box',
			boxOpts : { width : 120, height: 120 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#757575' },
					borderWidth : 2
				},
			},
			fixtureDefOpts : { density : 0.8 },
			sliceable : true,
			events : {
				onslice : function() {
					console.log(this.b2body.GetUserData().name + ' Sliced!');
				}
			}
		});

		var rect = worldManager.createEntity({
			type : 'dynamic',
			x : 120, y : 100, angle : 15,
			shape : 'box',
			boxOpts : { width : 10, height: 90 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#757575' },
					borderWidth : 2
				},
			},
			fixtureDefOpts : { density : 0.8 },
			sliceable : true
		});

		var rect2 = worldManager.createEntity({
			type : 'dynamic',
			x : 300, y : 100, angle : 90,
			shape : 'box',
			boxOpts : { width : 10, height: 90 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#757575' },
					borderWidth : 2
				},
			},
			fixtureDefOpts : { density : 0.8 },
			name : 'rect',
			sliceable : true
		});		

		var triangle = worldManager.createEntity({
			type : 'dynamic',
			x : 50, y : 250,
			shape : 'polygon',
			polygonOpts : { points : [ {x: -40, y: 0}, {x: 0, y: -40}, {x: 40, y: 0} ] },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#757575' },
					borderWidth : 2
				},
			},			
			fixtureDefOpts : { density : 1.0 },
			sliceable : true
		});		

		var water = worldManager.createEntity({
			type : 'static',
			x : 250, y : 395,
			shape : 'box',
			boxOpts : { width : 490, height: 200 },
			render : {
				type : 'draw',
				opacity : 0.8,
				drawOpts : {
					bgColorStyle : 'linearGradient',
					bgLinearGradientOpts : { colors : ['#4CABB0','#65DFE6'] }
				},
			},
			fixtureDefOpts : { isFluid : true, dragConstant : 0.25, liftConstant : 0.25 }
		});

		var border = worldManager.createEntity({
			type : 'static',
			x : 495, y : 390,
			shape : 'box',
			boxOpts : { width : 5, height: 210 },
			render : {
				type : 'draw',
				opacity : 0.8,
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#000' }
				},
			}			
		});
	}


	/*===================================================================================================================
	 *== TESTGRAVITATION ================================================================================================ 
	 *===================================================================================================================*/	

	function testGravitation() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
		}

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createKeyboardHandler({
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
			37 : {
				onkeydown : function(e){
					player.left();
				},
				keepPressed : true
			},			
			38 : {
				onkeydown : function(e){
					player.up();
				},
				keepPressed : true
			},
			39 : {
				onkeydown : function(e){
					player.right();
				},
				keepPressed : true
			},
			40 : {
				onkeydown : function(e){
					player.down();
				},
				keepPressed : true
			}			
		});

		worldManager.createContactHandler({
			beginContact : function(contact) {
				var bodyA = contact.GetFixtureA().GetBody();
				var bodyB = contact.GetFixtureB().GetBody();

				if ( (bodyA.GetUserData().name == 'earth' && bodyB.GetUserData().name == 'asteroid') ||
						(bodyA.GetUserData().name == 'asteroid' && bodyB.GetUserData().name == 'earth') ) {
					var earth, asteroid;
					if ( bodyA.GetUserData().name == 'earth' ) {
						earth = worldManager.getEntityByItsBody(bodyA);
						asteroid = worldManager.getEntityByItsBody(bodyB);	
					}
					else {
						earth = worldManager.getEntityByItsBody(bodyB);
						asteroid = worldManager.getEntityByItsBody(bodyA);						
					}

					var dirX = asteroid.getPosition().x - earth.getPosition().x;
					var dirY = asteroid.getPosition().y - earth.getPosition().y;
					var theta = Math.atan2(dirY, dirX);
					if (theta < 0)
						theta += 2 * Math.PI;
					var angle = theta * (180/Math.PI);
					console.log(angle);

					worldManager.deleteEntity(asteroid);

					var up = true;
					worldManager.createLandscape({
						x : asteroid.getPosition().x,
						y : asteroid.getPosition().y,
						angle : angle+90,
						shape : 'circle',
						circleOpts : { radius : 40 },
						render : {
							z : earth.b2body.GetUserData().render.z,
							opacity : 0,
							type : 'image',
							drawOpts : {
								bgColorStyle : 'radialGradient',
								bgRadialGradientOpts : { colors : ['red', 'yellow'] }
							},
							imageOpts : {
								image : 'images/atomic_explosion.png',
								adjustImageSize : true
							},							
							action : function() {
								if ( up ) {
									this.alpha += 0.05;
									if ( this.alpha > 1 )
										up = false;
								}
								else {
									if ( this.alpha > 0 )
										this.alpha -= 0.01;
								}
							}
						}
					});
				}

				if ( (bodyA.GetUserData().name == 'moon' && bodyB.GetUserData().name == 'asteroid') ||
						(bodyA.GetUserData().name == 'asteroid' && bodyB.GetUserData().name == 'moon') ) {
					var moon, asteroid;
					if ( bodyA.GetUserData().name == 'moon' ) {
						moon = worldManager.getEntityByItsBody(bodyA);
						asteroid = worldManager.getEntityByItsBody(bodyB);	
					}
					else {
						moon = worldManager.getEntityByItsBody(bodyB);
						asteroid = worldManager.getEntityByItsBody(bodyA);						
					}

					worldManager.deleteEntity(asteroid);

					worldManager.createLandscape({
						x : asteroid.getPosition().x,
						y : asteroid.getPosition().y,
						shape : 'circle',
						circleOpts : { radius : 40 },
						render : {
							type : 'spritesheet',
							z : asteroid.b2body.GetUserData().render.z,
							spriteSheetOpts : {
								spriteData : {
									images : ['images/explosion.png'],
									animations : {'normal' : [0], 'explode': [1, 47, 'normal']},
									frames : {'height': 256, 'width': 256},
								},
								startAnimation : 'explode',
								adjustImageSize : true
							}
						}
					});
				}				
			}
		});

		worldManager.createLandscape({
			x : 490, y : 250,
			shape : 'box',
			boxOpts : { width : 980, height : 500 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#6B6DB5' }
				}
			}
		});

		var asteroid = worldManager.createEntity({
			type : 'dynamic',
			x : 750, y : 120,
			shape : 'circle',
			circleOpts : { radius : 8 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					bgImage : 'images/asteroid.png',
					adjustBgImageSize : true
				}
			},
			name : 'asteroid',
			draggable : true
		});

		var player = worldManager.createPlayer(asteroid, {
			camera : { xAxisOn: false, yAxisOn: false },
			events : {
				up : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,-10), this.getB2Body().GetWorldCenter());
				},
				down : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,10), this.getB2Body().GetWorldCenter());
				},
				left : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-10,0), this.getB2Body().GetWorldCenter());
				},
				right : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(10,0), this.getB2Body().GetWorldCenter());
				}			
			}
		});

		var mainEarthRender = true;
		var multiTouchHandler = worldManager.createMultiTouchHandler({
			onmousedown : function(e) {
				var entities = multiTouchHandler.getEntitiesAtMouseTouch(e);

				for ( var i = 0; i < entities.length; i++ ) {
					var entity = entities[i];

					if ( entity.b2body.GetUserData().name == 'earth' ) {
						mainEarthRender = !mainEarthRender;
						if ( mainEarthRender )
							entity.changeRender(earthRender1);
						else
							entity.changeRender(earthRender2);
					}
				}
			}
		});

		var earthRender1 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					bgImage : 'images/earth.png',
					adjustBgImageSize : true
				}		
		};

		var earthRender2 = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'radialGradient',
					bgRadialGradientOpts : { colors : ['red', 'yellow'] },
					borderColor : 'white', borderWidth : 2
				}
		};

		var earth = worldManager.createEntity({
			type : 'dynamic',
			x : 300, y : 250,
			shape : 'circle',
			circleOpts : { radius : 100 },
			render : earthRender1,
			fixtureDefOpts : { density: 100 },
			name : 'earth',
			draggable : true
		});

		worldManager.createGravitation(earth, {
			gravityRadius : 300,
			attractionPower : 5,
			render : {
				opacity : 0.3,
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'radialGradient',
					bgRadialGradientOpts : {
						colors : ['#fff', '#6B6DB5'],
						r0 : 100,
						r1 : 300
					}
				}
			}
		});

		var moon = worldManager.createEntity({
			type : 'dynamic',
			x : 750, y : 250,
			shape : 'circle',
			circleOpts : { radius : 30 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent',
					bgImage : 'images/moon.png',
					adjustBgImageSize : true
				}
			},
			fixtureDefOpts : { density: 100 },
			name : 'moon',
			draggable : true
		});

		worldManager.createGravitation(moon, {
			attractionPower : 5,
			render : {
				opacity : 0.3,
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'radialGradient',
					bgRadialGradientOpts : {
						colors : ['#fff', '#6B6DB5'],
						r0 : 30,
						r1 : 90
					}
				}
			}			
		});		
	}


	/*===================================================================================================================
	 *== TESTBREAK ===================================================================================================== 
	 *===================================================================================================================*/		

	function testBreak() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#000' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 500,
			shape : 'box',
			boxOpts : { width : 1960, height: 10 },
			render : renderStatic,
			name : 'floor'
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 0,
			shape : 'box',
			boxOpts : { width : 1960, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 1960, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createMultiTouchHandler({
			enableSlice : true,
			onmousedown : function(e) {
				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				if ( entities.length > 0 ) {
					var breakHandler = new MyGameBuilder.BreakHandler(worldManager, {
						numCuts : 2,
						explosion : false
					});					

					for ( var i = 0; i < entities.length; i++ ) {
						var entity = entities[i];

						if ( entity.b2body.GetUserData().group == 'breakable' ) {
							var x = e.x || e.clientX;
							var y = e.y || e.clientY;
							breakHandler.breakEntity(entity, x, y);
						}
					}
				}
			}
		});

		var contactHandler = worldManager.createContactHandler({
			breakOpts : { numCuts : 2 },
			beginContact : function(contact) {
				var bodyA = contact.GetFixtureA().GetBody();
				var bodyB = contact.GetFixtureB().GetBody();

				if ( (bodyA.GetUserData().name == 'projectile' && bodyB.GetUserData().group == 'breakable') ||
						(bodyB.GetUserData().name == 'projectile' && bodyA.GetUserData().group == 'breakable')	)
				{
					var block, projectile;
					if ( bodyA.GetUserData().group == 'breakable' ) {
						block = worldManager.getEntityByItsBody(bodyA);
						projectile = worldManager.getEntityByItsBody(bodyB);
					}
					else {
						block = worldManager.getEntityByItsBody(bodyB);
						projectile = worldManager.getEntityByItsBody(bodyA);
					}

					var worldManifold = new Box2D.Collision.b2WorldManifold();
					contact.GetWorldManifold(worldManifold);

					var vel1 = projectile.b2body.GetLinearVelocity();
					var vel2 = block.b2body.GetLinearVelocity();
					var impactVelocity = box2d.b2Math.SubtractVV(vel1, vel2);
					var approachVelocity = box2d.b2Math.Dot(worldManifold.m_normal, impactVelocity);	
					var impulse = Math.abs(approachVelocity * projectile.b2body.GetMass());
					console.log('impulse : ' + impulse);

					if ( impulse > 10 ) {
						var angle = Math.atan2(vel1.y, vel1.x);
						angle *= 180/Math.PI

						var angles = [];
						angles.push(angle);
						angles.push(angle-15);
						angles.push(angle+15);

						var x = worldManifold.m_points[0].x;
						if ( worldManifold.m_points[1].x > 0 )
							x = (x + worldManifold.m_points[1].x)/2;
						x *= worldManager.getScale();

						var y = worldManifold.m_points[0].y;
						if ( worldManifold.m_points[1].y > 0 )
							y = (y + worldManifold.m_points[1].y)/2;
						y *= worldManager.getScale();

						var numCuts = Math.round(impulse/20);

						output.innerHTML += ' - numCuts ' + numCuts;

						contactHandler.getBreakHandler().setNumCuts(numCuts);
						contactHandler.addEntityToBeBroken(block, x, y, angles);
					}
				}
			},
//			preSolve : function(contact) {
//			var bodyA = contact.GetFixtureA().GetBody();
//			var bodyB = contact.GetFixtureB().GetBody();

//			if ( (bodyA.GetUserData().name == 'projectile' && bodyB.GetUserData().group == 'breakable') ||
//			(bodyB.GetUserData().name == 'projectile' && bodyA.GetUserData().group == 'breakable')	)
//			{
//			console.log('preSolve');
//			}
//			},
			postSolve : function(contact, impulse) {
				var bodyA = contact.GetFixtureA().GetBody();
				var bodyB = contact.GetFixtureB().GetBody();

				if ( (bodyA.GetUserData().name == 'projectile' && bodyB.GetUserData().group == 'breakable') ||
						(bodyB.GetUserData().name == 'projectile' && bodyA.GetUserData().group == 'breakable')	)
				{
					console.log('postSolve');
				}
			},
//			endContact : function(contact) {
//			var bodyA = contact.GetFixtureA().GetBody();
//			var bodyB = contact.GetFixtureB().GetBody();

//			if ( (bodyA.GetUserData().name == 'projectile' && bodyB.GetUserData().group == 'breakable') ||
//			(bodyB.GetUserData().name == 'projectile' && bodyA.GetUserData().group == 'breakable')	)
//			{
//			console.log('endContact');
//			}
//			}
		});

		worldManager.createKeyboardHandler({
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
			49 : {
				onkeydown : function(e) {
					var isOn = player.getCamera().getXAxisOn();
					if ( isOn ) {
						player.getCamera().setXAxisOn(false);
						player.getCamera().setAdjustX(-player.getPosition().x + 490);
					}
					else {
						player.getCamera().setXAxisOn(true);
						player.getCamera().setAdjustX(490);
					}
				}
			},
			37 : {
				onkeydown : function(e){
					player.left();
				},
				keepPressed : true
			},			
			38 : {
				onkeydown : function(e){
					player.up();
				},
				keepPressed : true
			},
			39 : {
				onkeydown : function(e){
					player.right();
				},
				keepPressed : true
			},
			40 : {
				onkeydown : function(e){
					player.down();
				},
				keepPressed : true
			},
			50 : {
				onkeydown : function(e) {
					block.changeScale(1.1);
				}
			},
			51 : {
				onkeydown : function(e) {
					block.changeScale(0.9);
				}
			}			
		});

		var projectile = worldManager.createEntity({
			type : 'dynamic',
			x : 100, y : 250,
			shape : 'box',
			boxOpts : { width : 50, height : 50 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#fff' },
					borderWidth : 2,
					borderColor : 'black',
				},
			},
			fixtureDefOpts : { filterGroupIndex : -1 },
			draggable : true,
			noGravity : true,
			name : 'projectile'
		});		

		var block = worldManager.createEntity({
			type : 'dynamic',
			x : 400, y : 325,
			shape : 'box',
			boxOpts : { width : 200, height : 200 },
			polygonOpts : { points : [ {x:0, y:0}, {x:0, y:90}, {x:90, y:90}, {x:90, y:0} ] },
//			polygonOpts : { points : [ {x:-50, y:-50}, {x:50, y:-50}, {x:50, y:50}, {x:-50, y:50} ] },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'yellow' },
					borderWidth : 2,
					borderColor : 'black',
//					cache : true,
//					bgImage : 'images/wall.jpg',
//					repeatBgImage : 'repeat',
//					adjustBgImageSize : false
				},
//				filters : [greyScaleFilter]
			},
			fixtureDefOpts : { density : 1000 },
			draggable : true,
			sliceable : true,
			group : 'breakable'
		});

		var player = worldManager.createPlayer(projectile, {
			camera : {
				adjustX: 490,
				adjustY: 250,
				xAxisOn: true,
				yAxisOn: true
			},
			events : {
				up : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,-100), this.getB2Body().GetWorldCenter());
				},
				down : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,100), this.getB2Body().GetWorldCenter());
				},
				left : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100,0), this.getB2Body().GetWorldCenter());
				},
				right : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100,0), this.getB2Body().GetWorldCenter());
				}			
			}
		});

		worldManager.createWind({
			on : false,
			adjustX : -980,
			width : 980,
			numRays : 30
		});

		worldManager.createEntity({
			type : 'dynamic',
			x : 600, y : 200,
			shape : 'box',
			boxOpts : { width : 100, height: 100 },
			circleOpts : { radius : 40 },
			polygonOpts : { points : [ {x: -50, y: 0}, {x: 0, y: -50}, {x: 50, y: 0}, {x: 0, y: 50} ] },			
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					textOpts : {
						text : 'P',
						font : 'bold 38px Arial',
						color : 'yellow'
					},
					borderWidth : 4, borderColor : 'white', borderRadius : 10,
					cache : true
				}
			},
			sliceable : true,
			group : 'breakable'
		});	
	}


	/*===================================================================================================================
	 *== TESTCHANGEPLAYER =============================================================================================== 
	 *===================================================================================================================*/		

	function testChangePlayer() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#000' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 500,
			shape : 'box',
			boxOpts : { width : 1960, height: 10 },
			render : renderStatic,
			name : 'floor'
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 0,
			shape : 'box',
			boxOpts : { width : 1960, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 1960, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createLandscape({
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 1960, height : 500 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'radialGradient',
					bgRadialGradientOpts : { colors : ['#fff', '#3399cc'] }
				}
			}
		});

		worldManager.createMultiTouchHandler({
			onmousedown : function(e) {
				var entities = worldManager.getMultiTouchHandler().getEntitiesAtMouseTouch(e);
				if ( entities.length > 0 ) {

					var selectedEntity = null;
					for ( var i = 0; i < entities.length; i++ ) {
						var entity = entities[i];
						if ( entity.getGroup() !== 'square' )
							continue;

						if ( !entity.isSelected ) {
							entity.changeRender(renderSelected);
							entity.isSelected = true;
							selectedEntity = entity;
						}

						var player = worldManager.getPlayerByItsEntity(entity);
						worldManager.setPlayer(player);
					}

					var allEntities = worldManager.getEntities();
					for ( var i = 0; i < allEntities.length; i++ ) {
						var ent = allEntities[i];
						if ( ent.getGroup() !== 'square' )
							continue;

						if ( worldManager.getPlayerByItsEntity(ent) && selectedEntity !== null && ent !== selectedEntity ) {
							ent.isSelected = false;
							ent.changeRender(renderUnselected);
						}
					}
				}
			}
		});

		worldManager.createKeyboardHandler({
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
			49 : {
				onkeydown : function(e) {
					var player = worldManager.getPlayer();
					var isOn = player.getCamera().getXAxisOn();
					if ( isOn ) {
						player.getCamera().setXAxisOn(false);
						player.getCamera().setAdjustX(-player.getPosition().x + 490);
					}
					else {
						player.getCamera().setXAxisOn(true);
						player.getCamera().setAdjustX(490);
					}
				}
			},
			37 : {
				onkeydown : function(e){
					worldManager.getPlayer().left();
				},
				keepPressed : true
			},			
			38 : {
				onkeydown : function(e){
					worldManager.getPlayer().up();
				},
				keepPressed : true
			},
			39 : {
				onkeydown : function(e){
					worldManager.getPlayer().right();
				},
				keepPressed : true
			},
			40 : {
				onkeydown : function(e){
					worldManager.getPlayer().down();
				},
				keepPressed : true
			}
		});

		var renderSelected = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'yellow' },
					borderWidth : 2, borderColor : 'black', borderRadius : 10
				},
		};

		var renderUnselected = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#fff' },
					borderWidth : 2, borderColor : 'black', borderRadius : 10
				},
				opacity : 0.5
		};

		var entity1 = worldManager.createEntity({
			x : 100, y : 150,
			shape : 'box',
			boxOpts : { width : 50, height : 50 },
			type : 'dynamic',
			render : renderUnselected,
			draggable : true,
			group : 'square'
		});
		entity1.isSelected = false;

		var player1 = worldManager.createPlayer(entity1, {
			camera : {
				adjustX: 490,
				xAxisOn: true
			},
			events : {
				up : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,-100), this.getB2Body().GetWorldCenter());
				},
				down : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,100), this.getB2Body().GetWorldCenter());
				},
				left : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100,0), this.getB2Body().GetWorldCenter());
				},
				right : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100,0), this.getB2Body().GetWorldCenter());
				}			
			}
		});

		var entity2 = worldManager.createEntity({
			type : 'dynamic',
			x : 100, y : 300,
			shape : 'box',
			boxOpts : { width : 50, height : 50 },
			render : renderUnselected,
			draggable : true,
			group : 'square'
		});
		entity2.isSelected = false;

		var player2 = worldManager.createPlayer(entity2, {
			camera : {
				adjustX: 490,
				xAxisOn: true
			},
			events : {
				up : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,-100), this.getB2Body().GetWorldCenter());
				},
				down : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,100), this.getB2Body().GetWorldCenter());
				},
				left : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100,0), this.getB2Body().GetWorldCenter());
				},
				right : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100,0), this.getB2Body().GetWorldCenter());
				}			
			}
		});

		var entity3 = worldManager.createEntity({
			type : 'dynamic',
			x : 100, y : 450,
			shape : 'box',
			boxOpts : { width : 50, height : 50 },
			render : renderSelected,
			draggable : true,
			group : 'square'
		});
		entity3.isSelected = true;

		var player3 = worldManager.createPlayer(entity3, {
			camera : {
				adjustX: 490,
				xAxisOn: true
			},
			events : {
				up : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,-100), this.getB2Body().GetWorldCenter());
				},
				down : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(0,100), this.getB2Body().GetWorldCenter());
				},
				left : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(-100,0), this.getB2Body().GetWorldCenter());
				},
				right : function() {
					this.getB2Body().ApplyForce(new box2d.b2Vec2(100,0), this.getB2Body().GetWorldCenter());
				}			
			}
		});

		for ( var i = 0; i < 10; i++ ) {
			worldManager.createEntity({
				type : 'dynamic',
				x : Math.random() * 980,
				y : Math.random() * 500,
				shape : 'circle',
				circleOpts : { radius : 25 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color : '#fff' },
						borderWidth : 2,
						borderColor : 'black',
					},
					opacity : 0.5
				},
				draggable : true
			});
		}
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
					src : 'sounds/Thunder1.mp3'
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
			                 {src:'sounds/Aladdin-SNES.mp3', id:'music'},
			                 {src:'sounds/Thunder1.mp3'},
			                 {src:'sounds/Game-Shot.mp3'}
			                 ]
		});

		var music = soundHandler.createSoundInstance({
			id : 'music'
		});
		soundHandler.addSoundInstance(music);

		var shot = soundHandler.createSoundInstance({
			id : 'shot',
			src : 'sounds/Game-Shot.mp3',
		});
		soundHandler.addSoundInstance(shot);
	}


	/*===================================================================================================================
	 *== TESTRENDER ===================================================================================================== 
	 *===================================================================================================================*/		

	function testRender() {
		var renderStatic = {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : '#bbb' }
				}
		};

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 500,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 490, y : 0,
			shape : 'box',
			boxOpts : { width : 980, height: 10 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 0, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createEntity({
			type : 'static',
			x : 980, y : 250,
			shape : 'box',
			boxOpts : { width : 10, height: 500 },
			render : renderStatic
		});

		worldManager.createMultiTouchHandler({
			enableSlice : true
		});

		worldManager.createTimeStepHandler({
		});

		worldManager.createKeyboardHandler({
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
			80 : {
				onkeydown : function(e){
					var isPaused = worldManager.getTimeStepHandler().isPaused();
					if ( isPaused )
						worldManager.getTimeStepHandler().play();
					else
						worldManager.getTimeStepHandler().pause();
				}
			}
		});

		var entity = worldManager.createEntity({
			type : 'dynamic',
			x : 590, y : 250,
			shape : 'box',
			circleOpts : { radius : 50 },
			boxOpts : { width : 200, height : 200 },
			polygonOpts : { points : [ {x: -50, y: 0}, {x: 0, y: -50}, {x: 50, y: 0}, {x: 0, y: 50} ] },
			render : {				
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : 'white' },
					//bgRadialGradientOpts : { colors : ['yellow', 'green'] },
					borderWidth : 2,
					borderColor : 'black',
//					bgImage : 'images/wall.jpg',
//					adjustBgImageSize : true,
//					repeatBgImage : 'repeat-x'
					cache : true
				},
				imageOpts : {
					image : 'images/tire.png',
					adjustImageSize : true
				},
				spriteSheetOpts : {
					spriteData : {
						images : ['images/runningGrant.png'],
						animations : {'run': [0, 25], 'jump': [26, 63,'run']},
						frames : {'height': 292.5, 'width': 165.75}
					},
					startAnimation : 'run',
					adjustImageSize : true
				}
			},
			bodyDefOpts : { angularVelocity : 720 },
			draggable : true,
			sliceable : true
		});

//		worldManager.createGravitation(entity, {
//		gravityRadius : 300,
//		attractionPower : 5,
//		render : {
////		//opacity : 0.5,
//		type : 'image',
//		drawOpts : {
//		bgColorStyle : 'radialGradient',
//		//bgSolidColorOpts : { color : 'white' },
//		//bgRadialGradientOpts : { colors : ['yellow', 'green'] },
//		borderWidth : 4,
//		borderColor : 'yellow',
////		bgImage : 'images/tire.png',
////		adjustBgImageSize : true,
//		//repeatBgImage : 'repeat-x'
//		},
//		imageOpts : {
//		image : 'images/tire.png',
//		adjustImageSize : true
//		},
//		spriteSheetOpts : {
//		spriteData : {
//		images : ['images/runningGrant.png'],
//		animations : {'run': [0, 25], 'jump': [26, 63,'run']},
//		frames : {'height': 292.5, 'width': 165.75}
//		},
//		startAnimation : 'run',
//		adjustImageSize : false
//		}
//		}
//		});
	}
}());