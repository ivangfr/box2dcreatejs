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
				         '../images/explosion.png',
				         '../images/asteroid.png',
				         '../images/earth.png',
				         '../images/moon.png',
				         '../images/atomic_explosion.png'
				         ],
				onComplete : testGravitation
			}
		});

//		testGravitation();
//		worldManager.start();
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
								image : '../images/atomic_explosion.png',
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
									images : ['../images/explosion.png'],
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
					bgImage : '../images/asteroid.png',
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
					bgImage : '../images/earth.png',
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
					bgImage : '../images/moon.png',
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
	
}());