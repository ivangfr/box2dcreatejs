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
				         '../images/cloud.png',
				         '../images/hill.png',
				         '../images/grass.png',
				         ],
				onComplete : testBackground
			}
		});

//		testBackground();
//		worldManager.start();
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
					image : '../images/cloud.png',
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
					image : '../images/hill.png',
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
					image : '../images/cloud.png',
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
					image : '../images/grass.png',
					adjustImageSize : false,
				},
				action : function() {
					this.x += 1;
				}
			}
		});
	}

}());