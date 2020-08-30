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

		testJoints();
		worldManager.start();
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
}());