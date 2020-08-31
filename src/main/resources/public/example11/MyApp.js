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
			world : new box2d.b2World(new box2d.b2Vec2(0, 10), true)
		});

		testWind();
		worldManager.start();
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

}());