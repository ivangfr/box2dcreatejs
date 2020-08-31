this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	var worldManager;

	var _os;
	
	var _hintElem, _timeElem, _rankElem;
	
	var CATEGORY_CAR = 0x0001;
	var CATEGORY_SCENERY = 0x0002;
	
	var TIRE_VS_CONCRETE = 1;
	var CAR_VS_CONCRETE = 2;
	
	var CAR_WIDTH = 170, CAR_HEIGHT = 55, CAR_X = 360, CAR_Y = 330;
	
	var _soundHandler;
	
	var _tireClockwise;
	
	var FINISHLINE_X = 18000;
	
	var _startTime, _carArrived;
	
	var _holdPoint, _interval, _overallTime;
	
	function MyApp() {
		this.initialize();
	}
	
	MyGameBuilder.MyApp = MyApp;

	MyApp.prototype.initialize = function() {
		var easeljsCanvas = document.getElementById("easeljsCanvas");		
		var box2dCanvas = document.getElementById("box2dCanvas");

		_hintElem = document.getElementById("hint");
		_timeElem = document.getElementById("time");
		_rankElem = document.getElementById("rank");
		
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
				         {src:'../sounds/blink-182_dammit.mp3', id:'music'},
				         {src:'../sounds/crowd_applause.mp3', id:'applause'},
				         '../images/box.jpg',
				         '../images/tire.png',
				         '../images/hummer.png',
				         '../images/leftarrow.png',
				         '../images/rightarrow.png',
				         '../images/uparrow.png',
				         '../images/downarrow.png',
				         '../images/background2.jpg',
				         '../images/girl_dancing.png',
				         '../images/finishFlag.jpg'
				         ],
				onComplete : function() {
					startWorld();
					
					startCountingDown();
				}
			}
		});
		
		_os = worldManager.createBrowserOSHandler().getOS();
	}

	function startCountingDown() {		
		_hintElem.innerHTML = 'Complete the track as fast as you can!!!';
		_hintElem.style.display = 'block';

		setTimeout(function() {
			_hintElem.innerHTML = 'READY??';
			setTimeout(function() {
				_hintElem.innerHTML = 'GGGOOO!!!';
				
				_timeElem.innerHTML = '00:00';
				_timeElem.style.display = 'block';
				startTime();
				
				worldManager.deleteEntity(_holdPoint);
				
				setTimeout(function() {
					_hintElem.style.display = 'none';
					_freeBlocks = true;
				}, 2000);
			}, 2000);
		}, 5000);		
	}
	
	function startTime() {
		var auxTime;
		_startTime = (new Date()).getTime();
		
		_interval = setInterval(function() {
			auxTime = (new Date()).getTime() - _startTime;
			updateTimeInfo(auxTime, false);
		}, 1000);
	}
	
	function updateTimeInfo(auxTime, updateMil) {
		_timeElem.innerHTML = formatTime(auxTime, updateMil);		
	}
	
	function startWorld() {		
		
		var aContactTireConcrete = [], aContactCarConcrete = [];

		var zoomHandler = worldManager.createZoomHandler({
			max : 1,
			min : 0.8,
			step : 0.008
		});		
		
		_soundHandler = worldManager.createSoundHandler();
		_soundHandler.createSoundInstance({
			id : 'music'
		}).myPlay({
			loop : -1,
			volume : 0.3
		});
		
		worldManager.setUserOnTick(function() {
			var i, j;
			
			if ( _os !== "iOS" && _os !== "Android" ) {
				if ( car.getPosition().y < 100 )
					zoomHandler.zoomOut();
				else
					zoomHandler.zoomIn();			
			}
			
			for ( i = 0; i < aContactTireConcrete.length; i++ ) {
				var contact = aContactTireConcrete[i];
				
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();				
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();

				var worldManifold = new Box2D.Collision.b2WorldManifold();
				contact.GetWorldManifold(worldManifold);

				var velA = bodyA.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
				var velB = bodyB.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
				var relativeSpeed = box2d.b2Math.SubtractVV(velA, velB);
				
				var totalFriction = fixtureA.GetFriction() * fixtureB.GetFriction();
				var intensity = box2d.b2Math.Abs(relativeSpeed.x * totalFriction);

				if ( intensity > 100 && intensity < 800 ) {
					createParticles(TIRE_VS_CONCRETE, worldManifold);
				}				
			}
			
			for ( i = 0; i < aContactCarConcrete.length; i++ ) {
				var contact = aContactCarConcrete[i];
				
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();				
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();

				var worldManifold = new Box2D.Collision.b2WorldManifold();
				contact.GetWorldManifold(worldManifold);

				var velA = bodyA.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
				var velB = bodyB.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
				var relativeSpeed = box2d.b2Math.SubtractVV(velA, velB);
				
				var totalFriction = fixtureA.GetFriction() * fixtureB.GetFriction();
				var intensity = box2d.b2Math.Abs(relativeSpeed.x * totalFriction);

				if ( intensity > 0.1 ) {
					createParticles(CAR_VS_CONCRETE, worldManifold);
				}
			}
			
			if ( !_carArrived && (car.getPosition().x + CAR_WIDTH/2) >= FINISHLINE_X ) {
				_carArrived = true;
				clearInterval(_interval);
				_hintElem.innerHTML = 'FINISHED!!';
				_hintElem.style.display = 'block';
				
				_overallTime = (new Date()).getTime() - _startTime;
				updateTimeInfo(_overallTime, true);
				
				_soundHandler.createSoundInstance({
					id : 'applause'
				}).play();				
				
				worldManager.getTimeStepHandler().setFPS(980);
				
				setTimeout(function() {
					worldManager.getTimeStepHandler().restoreFPS();
				}, 1000);
				
				setTimeout(function() {
					_hintElem.innerHTML = "Try again!!!"
					setTimeout(function() {
						worldManager.getTimeStepHandler().pause();
					}, 3000);
				}, 4000);
			}
		});
		
		if ( _os !== "iOS" && _os !== "Android" ) {
			worldManager.createLandscape({
				x : 10000, y : 115,
				shape : 'box',
				boxOpts : { width : 20000, height : 575 },
				render : {				
					type : 'draw',
					drawOpts : {					
						bgColorStyle : 'transparent',
						bgImage : '../images/background2.jpg',
						repeatBgImage : 'repeat-x'
					}
				}
			});			
		}		
		
		worldManager.createMultiTouchHandler({
			enableDrag : false
		});		
		
		worldManager.createKeyboardHandler({
			68 : { //d
				onkeydown : function(e){
					worldManager.setEnableDebug(!worldManager.getEnableDebug());
				}
			},			
			37 : { //left arrow
				onkeydown : function(e){
					player.anticlockwise(e);
				}
			},
			38 : { //up arrow
				onkeydown : function(e){
					player.foward(e);
				},
				keepPressed : true
			},			
			39 : { //right arrow
				onkeydown : function(e){
					player.clockwise(e);
				}
			},
			40 : { //down arrow
				onkeydown : function(e){
					player.backward(e);
				},
				keepPressed : true
			},			
			69 : { //e
				onkeydown : function(e){
					var isPaused = worldManager.getTimeStepHandler().isPaused();
					if ( isPaused )
						worldManager.getTimeStepHandler().play();
					else
						worldManager.getTimeStepHandler().pause();
				}
			},
			81 : { //q
				onkeydown : function(e){
					worldManager.getTimeStepHandler().setFPS(980);
				}
			},
			87 : { //w
				onkeydown : function(e){
					worldManager.getTimeStepHandler().restoreFPS();
				}
			},
			65 : { //a
				onkeydown : function(e) {
					worldManager.getWorld().DestroyJoint(link1.getJoint());
					worldManager.getWorld().DestroyJoint(link2.getJoint());
				}
			},
			83 : { //s
				onkeydown : function(e) {
				}
			},
			90 : { //z
				onkeydown : function(e) {
				}
			},
			88 : { //x
				onkeydown : function(e) {
				}
			},
		});
		
		worldManager.createTimeStepHandler({
			layer : {
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid'
					},
					opacity : 0.1
				}				
			}
		});

		buildFloor();
		buildWalls();
		
		_holdPoint = worldManager.createEntity({
			type : 'static',
			x : 300, y : 340,
			shape : 'box',
			boxOpts : { width : 20, height : 20 },
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent'				
				}
			}
		});
		
		var car = worldManager.createEntity({
			type : 'dynamic',
			x : CAR_X, y : CAR_Y,
			shape : 'box',
			boxOpts : { width : CAR_WIDTH, height : CAR_HEIGHT },
			render : {
				type : 'image',
				imageOpts : {
					image : '../images/hummer.png',
					adjustImageSize : true
				}
			},
			fixtureDefOpts : {
				friction : 0.2,
				density : 7,
				filterCategoryBits : CATEGORY_CAR,
				filterMaskBits : CATEGORY_SCENERY
			},
			draggable : true,
			name : 'car'
		});

		var backAxis = worldManager.createEntity({
			type : 'dynamic',
			x : CAR_X - 55, y : CAR_Y + 30,
			shape : 'box',
			boxOpts : { width : 20, height : 20 },
			fixtureDefOpts : {
				filterCategoryBits : CATEGORY_CAR,
				filterMaskBits : CATEGORY_SCENERY
			},
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent'
				}
			}
		});
		
		var frontAxis = worldManager.createEntity({
			type : 'dynamic',
			x : CAR_X + 55, y : CAR_Y + 30,
			shape : 'box',
			boxOpts : { width : 20, height : 20 },
			fixtureDefOpts : {
				filterCategoryBits : CATEGORY_CAR,
				filterMaskBits : CATEGORY_SCENERY
			},
			render : {
				type : 'draw',
				drawOpts : {
					bgColorStyle : 'transparent'
				}
			}
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
		
		var backTire = worldManager.createEntity({
			type : 'dynamic',
			x : CAR_X - 55, y : CAR_Y + 30,
			shape : 'circle',
			circleOpts : { radius : 22 },
			render : renderTire,
			fixtureDefOpts : {
				density : 5.0,
				filterCategoryBits : CATEGORY_CAR,
				filterMaskBits : CATEGORY_SCENERY
			},
			draggable : true,
			name : 'backTire',
			group : 'tire'
		});		

		var frontTire = worldManager.createEntity({
			type : 'dynamic',
			x : CAR_X + 55, y : CAR_Y + 30,
			shape : 'circle',
			circleOpts : { radius : 22 },
			render : renderTire,
			fixtureDefOpts : {
				density : 5.0,
				friction : 3.0,
				filterCategoryBits : CATEGORY_CAR,
				filterMaskBits : CATEGORY_SCENERY
			},			
			draggable : true,
			name : 'frontTire',
			group : 'tire'
		});

		var holdingLink = worldManager.createLink({
			entityA : _holdPoint,
			entityB : frontTire,
			type : 'distance'
		});		
		
		var link1 = worldManager.createLink({
			entityA : car,
			entityB : backAxis,
			type : 'line',
			localAnchorA : {x : -1.85, y : 0.1},
			localAxisA : { x : 0, y : 0.9 },
			options : {
				enableLimit : true,
				lowerTranslation : 0.8,
				upperTranslation : 0.95,
				enableMotor : true,
				maxMotorForce : 45,
				motorSpeed : 2
			}
		});

		var link2 = worldManager.createLink({
			entityA : car,
			entityB : frontAxis,
			type : 'line',
			localAnchorA : {x : 1.85, y : 0.1},
			localAxisA : { x : 0, y : 0.9 },
			options : {
				enableLimit : true,
				lowerTranslation : 0.8,
				upperTranslation : 0.95,
				enableMotor : true,
				maxMotorForce : 45,
				motorSpeed : 2
			}
		});
		
		var link3 = worldManager.createLink({
			entityA : backAxis,
			entityB : backTire,
			type : 'revolute'
		});
		
		var link4 = worldManager.createLink({
			entityA : frontAxis,
			entityB : frontTire,
			type : 'revolute'
		});

		var player = worldManager.createPlayer(car, {
			camera : {
				adjustX : 300,
				adjustY : 90,
				xAxisOn: true,
				yAxisOn: false
			},
			events : {
				backward : function(e) {
					frontTire.getB2Body().SetAngularVelocity(-70);
					_tireClockwise = 1;
				},
				foward : function(e) {
					frontTire.getB2Body().SetAngularVelocity(70);
					_tireClockwise = -1
				},
				anticlockwise : function(e) {
					car.getB2Body().SetAngularVelocity(-1);
				},
				clockwise : function(e) {
					car.getB2Body().SetAngularVelocity(1);
				}
			}			
		});

		buildFinishLine();
		placeGirls();
		
		var contactHandler = worldManager.createContactHandler({
			enabledBuoyancy : false,
			enabledStickyTarget : false,
			beginContact : function(contact) {
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();				
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();

				if ( (bodyA.GetUserData().group == 'tire' && bodyB.GetUserData().group == 'concrete') ||
						(bodyB.GetUserData().group == 'tire' && bodyA.GetUserData().group == 'concrete') )
				{
					aContactTireConcrete.push(contact);
				}
				else if ( (bodyA.GetUserData().name == 'car' && bodyB.GetUserData().group == 'concrete') ||
						(bodyB.GetUserData().name == 'car' && bodyA.GetUserData().group == 'concrete') )
				{
					aContactCarConcrete.push(contact);
				}				
			},
			endContact : function(contact) {
				var i;
				var fixtureA = contact.GetFixtureA();
				var fixtureB = contact.GetFixtureB();				
				var bodyA = fixtureA.GetBody();
				var bodyB = fixtureB.GetBody();
				
				if ( (bodyA.GetUserData().group == 'tire' && bodyB.GetUserData().group == 'concrete') ||
						(bodyB.GetUserData().group == 'tire' && bodyA.GetUserData().group == 'concrete') )
				{
					for ( i = aContactTireConcrete.length-1; i >= 0; i-- ) {
					    if ( aContactTireConcrete[i] === contact ) {
					    	aContactTireConcrete.splice(i, 1);
					    	break;
					    }
					}
				}
				else if ( (bodyA.GetUserData().name == 'car' && bodyB.GetUserData().group == 'concrete') ||
						(bodyB.GetUserData().name == 'car' && bodyA.GetUserData().group == 'concrete') )
				{	
					for ( i = aContactCarConcrete.length-1; i >= 0; i-- ) {
					    if ( aContactCarConcrete[i] === contact ) {
					    	aContactCarConcrete.splice(i, 1);
					    	break;
					    }
					}
				}
			}
		});		
		
		if ( _os === "iOS" || _os === "Android" ) {
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
					player.anticlockwise(e);
					leftBtn.changeRender(leftBtnRender2);
				},
				onmouseup : function(e) {
					leftBtn.changeRender(leftBtnRender1);
				},			
				keepPressed : false
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
					player.clockwise(e);
					rightBtn.changeRender(rightBtnRender2);
				},
				onmouseup : function(e) {
					rightBtn.changeRender(rightBtnRender1);
				},
				keepPressed : false
			});
			
			var upBtnRender1 = {				
					type : 'image',
					imageOpts : {
						image : '../images/uparrow.png',
						adjustImageSize : true
					}
			};

			var upBtnRender2 = {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color: 'white' },
						borderWidth : 2,
						bgImage : '../images/uparrow.png',
						adjustBgImageSize : true
					}
			};		

			var upBtn = worldManager.createScreenButton({
				x : 50, y : 440,
				shape : 'box',
				boxOpts : { width : 100, height : 40 },
				render : upBtnRender1,
				onmousedown : function(e) {
					player.foward(e);
					upBtn.changeRender(upBtnRender2);
				},
				onmouseup : function(e) {
					upBtn.changeRender(upBtnRender1);
				},
				keepPressed : true
			});
			
			var downBtnRender1 = {				
					type : 'image',
					imageOpts : {
						image : '../images/downarrow.png',
						adjustImageSize : true
					}
			};

			var downBtnRender2 = {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color: 'white' },
						borderWidth : 2,
						bgImage : '../images/downarrow.png',
						adjustBgImageSize : true
					}
			};		

			var downBtn = worldManager.createScreenButton({
				x : 50, y : 480,
				shape : 'box',
				boxOpts : { width : 100, height : 40 },
				render : downBtnRender1,
				onmousedown : function(e) {
					player.backward(e);
					downBtn.changeRender(downBtnRender2);
				},
				onmouseup : function(e) {
					downBtn.changeRender(downBtnRender1);
				},
				keepPressed : true
			});				
		}
	}
	
	function buildWalls() {
		var i, aWalls = [];
		aWalls.push({x : 0, y : 200});
		aWalls.push({x : 20000, y : 0});
		
		for (i = 0; i < aWalls.length; i++) {
			worldManager.createEntity({
				type : 'static',
				x : aWalls[i].x, y : aWalls[i].y,
				shape : 'box',
				boxOpts : { width : 10, height: 1000 },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color : '#000' }
					}
				},
				fixtureDefOpts : {
					filterCategoryBits : CATEGORY_SCENERY
				}			
			});
		}	
	}
	
	function buildFloor() {
		var i, px, aPoints = [], p1, p2, ps, c;
		
		aPoints.push({x : 0, y : 10});

		aPoints.push({x : 600, y : 10});
		aPoints.push({x : 610, y : 13});
		aPoints.push({x : 620, y : 10});		
		
		aPoints.push({x : 700, y : 10});
		aPoints.push({x : 710, y : 13});
		aPoints.push({x : 720, y : 10});		
		
		aPoints.push({x : 800, y : 10});
		aPoints.push({x : 810, y : 13});
		aPoints.push({x : 820, y : 10});

		aPoints.push({x : 1200, y : 10});
		aPoints.push({x : 1500, y : 120});
		aPoints.push({x : 2100, y : 120});
		aPoints.push({x : 2400, y : 10});		
		
		aPoints.push({x : 3000, y : 10});
		aPoints.push({x : 3300, y : 80});
		aPoints.push({x : 3400, y : 10});
		
		aPoints.push({x : 4000, y : 10});
		aPoints.push({x : 4100, y : 80});
		aPoints.push({x : 4400, y : 10});
		
		aPoints.push({x : 5000, y : 10});
		aPoints.push({x : 6000, y : 200});
		aPoints.push({x : 6200, y : 100});
		aPoints.push({x : 7000, y : 100});
		aPoints.push({x : 7200, y : 200});
		aPoints.push({x : 7900, y : 10});
		
		aPoints.push({x : 8500, y : 10});
		aPoints.push({x : 9000, y : 120});
		aPoints.push({x : 9500, y : 120});
		aPoints.push({x : 10000, y : 200});
		aPoints.push({x : 10500, y : 50});
		
		aPoints.push({x : 11000, y : 50});
		aPoints.push({x : 11500, y : 150});
		aPoints.push({x : 12000, y : 150});
		aPoints.push({x : 12500, y : 10});
		
		aPoints.push({x : 13000, y : 10});
		aPoints.push({x : 13500, y : 200});
		aPoints.push({x : 14000, y : 200});
		aPoints.push({x : 14500, y : 50});
		aPoints.push({x : 15000, y : 50});
		aPoints.push({x : 15500, y : 210});
		aPoints.push({x : 16000, y : 210});
		aPoints.push({x : 16500, y : 250});
		aPoints.push({x : 17000, y : 10});
		
		aPoints.push({x : 20000, y : 10});
		
		for ( i = 0; i < aPoints.length-1; i++ ) {
			p1 = aPoints[i];
			p2 = aPoints[i+1];

			var ps = [ {x: p1.x, y: 200}, {x: p1.x, y: -p1.y}, {x: p2.x, y: -p2.y}, {x: p2.x, y: 200} ];
			var c = findCentroid(ps);
			
			worldManager.createEntity({
				type : 'static',
				x : c.x, y : c.y+400,
				shape : 'polygon',
				polygonOpts : { points : ps },
				render : {
					type : 'draw',
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color : '#000' },
						borderWidth : 2
					}
				},
				fixtureDefOpts : {
					filterCategoryBits : CATEGORY_SCENERY
				},
				group : 'concrete'
			});			
		}
	}
	
	function buildFinishLine() {
		worldManager.createEntity({
			type : 'static',
			x : FINISHLINE_X, y : 190,
			shape : 'box',
			boxOpts : { width : 50, height : 400 },
			render : {
				type : 'image',
				imageOpts : {
					image : '../images/finishFlag.jpg',
					adjustImageSize : true
				}				
			}
		});
		worldManager.createEntity({
			type : 'static',
			x : FINISHLINE_X, y : 180,
			shape : 'box',
			boxOpts : { width : 5, height : 420 },
			render : {
				type : 'draw',
				opacity : 0.5,
				drawOpts : {
					bgColorStyle : 'solid',
					bgSolidColorOpts : { color : "yellow" }
				}				
			}
		});		
	}
	
	function placeGirls() {
		worldManager.createEntity({
			type : 'dynamic',
			x : 520, y : 350,
			shape : 'box',
			boxOpts : { width : 50, height : 80 },
			render : {				
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['../images/girl_dancing.png'],
						animations : {
							'left': {
					             frames: [0,1,2,3,4],
					             next: "right",
					             speed: 0.1
					         },
					         'right': {
					             frames: [4,3,2,1,0],
					             next: "left",
					             speed: 0.1
					         }
						},
						frames : {'height': 80, 'width': 100}
					},
					startAnimation : 'left'
				}
			}
		});
		
		worldManager.createEntity({
			type : 'dynamic',
			x : 570, y : 350,
			shape : 'box',
			boxOpts : { width : 50, height : 80 },
			render : {				
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['../images/girl_dancing.png'],
						animations : {
							'down': {
					             frames: [2,3,4,5,6,7],
					             next: "up",
					             speed: 0.1
					         },
					         'up': {
					             frames: [7,6,5,4,3,2],
					             next: "down",
					             speed: 0.1
					         }
						},
						frames : {'height': 80, 'width': 100}
					},
					startAnimation : 'down'
				}
			}
		});
		
		worldManager.createEntity({
			type : 'dynamic',
			x : 620, y : 350,
			shape : 'box',
			boxOpts : { width : 50, height : 80 },
			render : {				
				type : 'spritesheet',
				spriteSheetOpts : {
					spriteData : {
						images : ['../images/girl_dancing.png'],
						animations : {
							'turn': {
					             frames: [0,1,2,3,4,8,9],
					             next: "turn",
					             speed: 0.1
					         }
						},
						frames : {'height': 80, 'width': 100}
					},
					startAnimation : 'turn'
				}
			}
		});		
	}
	
	function createParticles(type, worldManifold) {
		var x = worldManifold.m_points[0].x;
		if ( worldManifold.m_points[1].x > 0 )
			x = (x + worldManifold.m_points[1].x)/2;		
		x *= worldManager.getScale();

		var y = worldManifold.m_points[0].y;
		if ( worldManifold.m_points[1].y > 0 )
			y = (y + worldManifold.m_points[1].y)/2;
		y -= 0.2;
		y *= worldManager.getScale();					
		
		var numParticles = 1;
		for ( j = 0; j < numParticles; j++ ) {
			var color;
			var rColor = randomIntFromInterval(1,3);
			
			if ( type == TIRE_VS_CONCRETE ) {
				if ( rColor == 3 )
					color = '#EEE';
				else if ( rColor == 2 )
					color = '#CCC';
				else
					color = '#FFF';				
			}
			else {
				if ( rColor == 1 )
					color = '#FFFF00';
				else if ( rColor == 2 )
					color = '#FF3300';
				else
					color = '#FF9900';					
			}		

			var power = randomIntFromInterval(2,15);
			
			var angle = randomIntFromInterval(30,90);
			angle *= _tireClockwise;
            var angleDir = new box2d.b2Vec2( Math.sin(angle*Math.PI/180), Math.cos(angle*Math.PI/180) );
			
			var timeDisapear = randomIntFromInterval(0.5,1.5) * 1000;
			
			var particle = worldManager.createEntity({
				type : 'dynamic',
				x : x, y : y,
				shape : 'circle',
				circleOpts : { radius : 3 },
				noGravity : true,
				bodyDefOpts : {
					fixedRotation : false,
					linearDamping : 5,
					linearVelocity : {
						x : angleDir.x*power, 
						y : angleDir.y*power
					}
				},
				render : {
					type : 'draw',
					opacity : 0.9,
					drawOpts : {
						bgColorStyle : 'solid',
						bgSolidColorOpts : { color : color },
						borderWidth : 3,
						borderColor : color,
						cache : true
					}
				},
				fixtureDefOpts : {
					density : 0.1,
					filterCategoryBits : CATEGORY_CAR,
					filterMaskBits : CATEGORY_SCENERY
				}				
			});
			
			(function(p) {
				setTimeout(function() {
					worldManager.deleteEntity(p);
				}, timeDisapear);							
			})(particle)
		}		
	}

}());