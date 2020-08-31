//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {

	MyGameBuilder.ScreenHandler = ScreenHandler;
	
	//Constructor
	function ScreenHandler(worldManager, details) {
		initialize(this, worldManager, details);
	}

	var _validScreenHandlerDef = ['fullScreen'];
	
	var _worldManager;

	function initialize(screenHandler, worldManager, details) {
		validate(worldManager, details);
		
		_worldManager = worldManager;
		
		var fullScreen = false;
		if ( details && details.fullScreen != undefined )
			fullScreen = details.fullScreen;
		screenHandler.isFullScreen = function() {
			return fullScreen;
		}
		
		screenHandler.showFullScreen = function() {
			fullScreen = true;
			
			enableCss3Transition(true);
			
			onResizeHandle();
			window.onresize = function() {
				onResizeHandle();
			}
		}

		screenHandler.showNormalCanvasSize = function() {
			fullScreen = false;

			worldManager.getEaseljsCanvas().style.width = worldManager.getEaseljsCanvas().width + "px";
			worldManager.getEaseljsCanvas().style.height = worldManager.getEaseljsCanvas().height + "px";
			
			worldManager.getBox2dCanvas().style.width = worldManager.getBox2dCanvas().width + "px";
			worldManager.getBox2dCanvas().style.height = worldManager.getBox2dCanvas().height + "px";
			
			enableCss3Transition(false);
			
			window.removeEventListener('resize', onResizeHandle, false);
		}		
	}	
	
	function getScreenDimension() {
		var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0],
		x = w.innerWidth || e.clientWidth || g.clientWidth,
		y = w.innerHeight || e.clientHeight || g.clientHeight;
		return {width : x, height : y};
	}

	function onResizeHandle() {
		var screen = getScreenDimension();
		
		var gameWidth = screen.width;
		var gameHeight = screen.height;
		var scaleToFitX = gameWidth / _worldManager.getBox2dCanvas().width;
		var scaleToFitY = gameHeight / _worldManager.getBox2dCanvas().height;

		var currentScreenRatio = gameWidth / gameHeight;
		var optimalRatio = Math.min(scaleToFitX, scaleToFitY);

		if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) {
			_worldManager.getEaseljsCanvas().style.width = gameWidth + "px";
			_worldManager.getEaseljsCanvas().style.height = gameHeight + "px";
			
			_worldManager.getBox2dCanvas().style.width = gameWidth + "px";
			_worldManager.getBox2dCanvas().style.height = gameHeight + "px";
		}
		else {
			_worldManager.getEaseljsCanvas().style.width = _worldManager.getEaseljsCanvas().width * optimalRatio + "px";
			_worldManager.getEaseljsCanvas().style.height = _worldManager.getEaseljsCanvas().height * optimalRatio + "px";
			
			_worldManager.getBox2dCanvas().style.width = _worldManager.getBox2dCanvas().width * optimalRatio + "px";
			_worldManager.getBox2dCanvas().style.height = _worldManager.getBox2dCanvas().height * optimalRatio + "px";
		}		
	}
	
	function enableCss3Transition(value) {
		if ( value ) {
			document.getElementsByTagName('body')[0].style.overflow = 'hidden';
			
			_worldManager.getEaseljsCanvas().style.transitionProperty =
				_worldManager.getBox2dCanvas().style.transitionProperty = 'all';
			
			_worldManager.getEaseljsCanvas().style.transitionDuration =
				_worldManager.getBox2dCanvas().style.transitionDuration = '1s';
			
			_worldManager.getEaseljsCanvas().style.transitionTimingFunction =
				_worldManager.getBox2dCanvas().style.transitionTimingFunction = 'ease';			
		}
		else {
			document.getElementsByTagName('body')[0].style.overflow = 'auto';
			
			_worldManager.getEaseljsCanvas().style.transitionProperty =
				_worldManager.getBox2dCanvas().style.transitionProperty = '';
			
			_worldManager.getEaseljsCanvas().style.transitionDuration =
				_worldManager.getBox2dCanvas().style.transitionDuration = '';
			
			_worldManager.getEaseljsCanvas().style.transitionTimingFunction =
				_worldManager.getBox2dCanvas().style.transitionTimingFunction = '';			
		}
	}
	
	function validate(worldManager, details) {
		var def;
		
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");
		
		if ( details !== undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : details must be an object!");
			
			for ( def in details )
				if ( _validScreenHandlerDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validScreenHandlerDef);
			
			if ( details.fullScreen !== undefined && typeof details.fullScreen != 'boolean' )
				throw new Error(arguments.callee.name + " : fullScreen must be a true/false!");
		}		
	}

})();