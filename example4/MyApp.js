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
				files : ['../images/tire.png'],
				onComplete : testImpluseForce
			}
		});

//		testImpluseForce();
//		worldManager.start();
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
					bgImage : '../images/tire.png',
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
	
}());