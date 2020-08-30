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
				files : ['../images/wall.jpg'],
				onComplete : testBreak
			}
		});

//		testBreak();
//		worldManager.start();
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
	
}());