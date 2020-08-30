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
			world : new box2d.b2World(new box2d.b2Vec2(0, 0), true),
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
				         '../images/runningGrant.png',
				         '../images/wall.jpg',
				         '../images/start.png'
				         ],
				onComplete : testRender
			}
		});

//		testRender();
//		worldManager.start();
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

		worldManager.createTimeStepHandler({
			layer : {
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
					},
					opacity : 0.3
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
//					bgImage : '../images/wall.jpg',
//					adjustBgImageSize : true,
//					repeatBgImage : 'repeat-x'
					cache : true
				},
				imageOpts : {
					image : '../images/tire.png',
					adjustImageSize : true
				},
				spriteSheetOpts : {
					spriteData : {
						images : ['../images/runningGrant.png'],
						animations : {'run': [0, 25], 'jump': [26, 63,'run']},
						frames : {'height': 292.5, 'width': 165.75}
					},
					startAnimation : 'run',
					adjustImageSize : true
				}
			},
			bodyDefOpts : { angularVelocity : 820 },
			draggable : true,
			sliceable : true,
			group : 'breakable'
		});

//		worldManager.createGravitation(entity, {
//			gravityRadius : 300,
//			attractionPower : 5,
//			render : {
////				//opacity : 0.5,
//				type : 'image',
//				drawOpts : {
//					bgColorStyle : 'radialGradient',
//					//bgSolidColorOpts : { color : 'white' },
//					//bgRadialGradientOpts : { colors : ['yellow', 'green'] },
//					borderWidth : 4,
//					borderColor : 'yellow',
////					bgImage : '../images/tire.png',
////					adjustBgImageSize : true,
//					//repeatBgImage : 'repeat-x'
//				},
//				imageOpts : {
//					image : '../images/tire.png',
//					adjustImageSize : true
//				},
//				spriteSheetOpts : {
//					spriteData : {
//						images : ['../images/runningGrant.png'],
//						animations : {'run': [0, 25], 'jump': [26, 63,'run']},
//						frames : {'height': 292.5, 'width': 165.75}
//					},
//					startAnimation : 'run',
//					adjustImageSize : false
//				}
//			}
//		});
		
		worldManager.createScreenButton({
			x : 50, y : 480,
			shape : 'box',
			boxOpts : { width : 100, height : 50 },
			render : {
				type : 'image',
				imageOpts : {
					image : '../images/start.png',
					adjustImageSize : true
				}
			},
			onmousedown : function(e) {
				var isPaused = worldManager.getTimeStepHandler().isPaused();
				if ( isPaused )
					worldManager.getTimeStepHandler().play();
				else
					worldManager.getTimeStepHandler().pause();
			}
		});
	}
	
}());