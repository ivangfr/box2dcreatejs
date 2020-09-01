//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	
	MyGameBuilder.TimeStepHandler = TimeStepHandler;
	
	//Constructor
	function TimeStepHandler(worldManager, details) {
		initialize(this, worldManager, details);
	}
	
	var _validTimeStepHandlerDef = ['layer'];
	var _validTimeStepHandlerLayerDef = ['x', 'y', 'angle', 'shape', 'circleOpts', 'boxOpts', 'polygonOpts', 'render'];
	
	var _validTimeStepHandlerShapeDef = ['circle', 'box', 'polygon'];
	
	var _validTimeStepHandlerCircleOptsDef = ['radius'];
	var _validTimeStepHandlerBoxOptsDef = ['width', 'height'];
	var _validTimeStepHandlerPolygonOptsDef = ['points'];
	
	var _worldManager;
	
	function initialize(timeStepHandler, worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;
		
		var normalFPS = worldManager.getFPS();
		var actualFPS = normalFPS;
		
		timeStepHandler.view = null;
		if ( details && details.layer && details.layer.render ) {
			if ( details.layer.x === undefined )
				details.layer.x = worldManager.getEaseljsCanvas().width/2;

			if ( details.layer.y === undefined )
				details.layer.y = worldManager.getEaseljsCanvas().height/2;
			
			if ( details.layer.angle === undefined )
				details.layer.angle = 0;
			
			if ( details.layer.shape === undefined ) {
				details.layer.shape = 'box';
				details.layer.boxOpts = {
						width : worldManager.getEaseljsCanvas().width,
						height : worldManager.getEaseljsCanvas().height
				};
			}
			
			var positionShape = {};
			positionShape.x = details.layer.x;
			positionShape.y = details.layer.y;
			positionShape.angle = details.layer.angle;
			positionShape.shape = details.layer.shape;
			positionShape.circleOpts = details.layer.circleOpts;
			positionShape.boxOpts = details.layer.boxOpts;
			positionShape.polygonOpts = details.layer.polygonOpts;
			
			timeStepHandler.view = MyGameBuilder.Render.createView(worldManager, positionShape, details.layer.render);
		}
		
		timeStepHandler.isPaused = function() {
			return createjs.Ticker.paused;
		}
		
		timeStepHandler.pause = function() {
			worldManager.setTimeStep(0);
			createjs.Ticker.paused = true;
			
			if ( timeStepHandler.view !== null ) {
				var player = worldManager.getPlayer();
				if ( player ) {
					timeStepHandler.view.x += player.getCameraAdjust().adjustX;
					timeStepHandler.view.y += player.getCameraAdjust().adjustY;
				}
				
				worldManager.getEaseljsStage().addChild(timeStepHandler.view);
				
				var e = { FPS : worldManager.getFPS() };
				worldManager.getEaseljsStage().update(e);
			}
		}
		
		timeStepHandler.play = function() {
			worldManager.setTimeStep(1/actualFPS);
			createjs.Ticker.paused = false;
			
			if ( timeStepHandler.view !== null ) {
				var player = worldManager.getPlayer();
				if ( player ) {
					timeStepHandler.view.x -= player.getCameraAdjust().adjustX;
					timeStepHandler.view.y -= player.getCameraAdjust().adjustY;
				}
				
				worldManager.getEaseljsStage().removeChild(timeStepHandler.view);
			}
		}
		
		timeStepHandler.setFPS = function(fps) {
			actualFPS = fps;
			
			worldManager.setFPS(fps);
			worldManager.setTimeStep(1/fps);
			createjs.Ticker.framerate = fps;
			
			setSpriteSheetFrequency(fps);

			function setSpriteSheetFrequency(fps) {
				var entities = _worldManager.getEntities();
				for ( var i = 0; i < entities.length; i++ ) {
					var entity = entities[i];
					if ( entity.b2body.view && entity.b2body.view.type === "spritesheet" ) {
						var animations = entity.b2body.view.spriteSheet.animations;
						for ( var j = 0; j < animations.length; j++ ) {
							var anim = entity.b2body.view.spriteSheet.getAnimation(animations[j]);
							if ( fps == normalFPS )
								anim.frequency = anim.frequency0;
							else
								anim.frequency = Math.round(fps/anim.frames.length);
						}
					}
				}		
			}			
		}
		
		timeStepHandler.restoreFPS = function() {
			timeStepHandler.setFPS(normalFPS);
		}
	}	
	
	function validate(worldManager, details) {
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");
		
		if ( details != undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : The TimeStepHandler details must be informed!");
			
			for ( var def in details )
				if ( _validTimeStepHandlerDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for TimeStepHandler is not supported! Valid definitions: " + _validTimeStepHandlerDef);
			
			if ( details.layer !== undefined ) {
				
				if ( details.layer.x !== undefined && typeof details.layer.x != 'number' )
					throw new Error(arguments.callee.name + " : layer.x must be a number!");
				
				if ( details.layer.y !== undefined && typeof details.layer.y != 'number' )
					throw new Error(arguments.callee.name + " : layer.y must be a number!");
				
				if ( details.layer.angle !== undefined && typeof details.layer.angle != 'number' )
					throw new Error(arguments.callee.name + " : layer.angle must be a number!");
				
				if ( details.layer.shape !== undefined ) {
					if ( _validTimeStepHandlerShapeDef.indexOf(details.layer.shape) < 0 )
						throw new Error(arguments.callee.name + " : layer.shape must be " + _validTimeStepHandlerShapeDef);
					else {
						if ( details.layer.shape === 'circle' ) {
							if ( details.layer.circleOpts === undefined )
								throw new Error(arguments.callee.name + " : layer.circleOpts must be informed!");
							else if ( typeof details.layer.circleOpts !== 'object' )
								throw new Error(arguments.callee.name + " : layer.circleOpts must be an object!");
							
							for ( var def in details.layer.circleOpts )
								if ( _validTimeStepHandlerCircleOptsDef.indexOf(def) < 0 )
									throw new Error(arguments.callee.name + " : the detail (" + def + ") for layer.circleOpts is not supported! Valid definitions: " + _validTimeStepHandlerCircleOptsDef);
							
							if ( details.layer.circleOpts.radius === undefined )
								throw new Error(arguments.callee.name + " : layer.circleOpts.radius must be informed!");
							else if ( typeof details.layer.circleOpts.radius != 'number' )
								throw new Error(arguments.callee.name + " : layer.circleOpts.radius must be a number!");
						}
						else if ( details.layer.shape === 'box' ) {
							if ( details.layer.boxOpts === undefined )
								throw new Error(arguments.callee.name + " : layer.boxOpts must be informed!");
							else if ( typeof details.layer.boxOpts !== 'object' )
								throw new Error(arguments.callee.name + " : layer.boxOpts must be an object!");
							
							for ( var def in details.layer.boxOpts )
								if ( _validTimeStepHandlerBoxOptsDef.indexOf(def) < 0 )
									throw new Error(arguments.callee.name + " : the detail (" + def + ") for layer.boxOpts is not supported! Valid definitions: " + _validTimeStepHandlerBoxOptsDef);
							
							if ( details.layer.boxOpts.width === undefined )
								throw new Error(arguments.callee.name + " : layer.boxOpts.width be informed!");
							else if ( typeof details.layer.boxOpts.width != 'number' )
								throw new Error(arguments.callee.name + " : layer.boxOpts.width must be a number!");
							
							if ( details.layer.boxOpts.height === undefined )
								throw new Error(arguments.callee.name + " : layer.boxOpts.height be informed!");
							else if ( typeof details.layer.boxOpts.height != 'number' )
								throw new Error(arguments.callee.name + " : layer.boxOpts.height must be a number!");					
						}
						else if ( details.layer.shape === 'polygon' ) {
							if ( details.layer.polygonOpts === undefined )
								throw new Error(arguments.callee.name + " : layer.polygonOpts must be informed!");
							else if ( typeof details.layer.polygonOpts !== 'object' )
								throw new Error(arguments.callee.name + " : layer.polygonOpts must be an object!");
							
							for ( var def in details.layer.polygonOpts )
								if ( _validTimeStepHandlerPolygonOptsDef.indexOf(def) < 0 )
									throw new Error(arguments.callee.name + " : the detail (" + def + ") for layer.polygonOpts is not supported! Valid definitions: " + _validTimeStepHandlerPolygonOptsDef);
							
							if ( details.layer.polygonOpts.points === undefined )
								throw new Error(arguments.callee.name + " : layer.polygonOpts.points be informed!");
							else if ( !(details.layer.polygonOpts.points instanceof Array) )
								throw new Error(arguments.callee.name + " : layer.polygonOpts.points must be an Array!");
							else if ( details.layer.polygonOpts.points.length < 3 )
								throw new Error(arguments.callee.name + " : layer.polygonOpts.points array must have at least 3 points!");
							else {
								for ( var i = 0; i < details.layer.polygonOpts.points.length; i++ ) {
									var point = details.layer.polygonOpts.points[i];
									if ( !(point instanceof Object) )
										throw new Error(arguments.callee.name + " : points elemtent must be an Object!");
					
									if ( point.x === undefined )
										throw new Error(arguments.callee.name + " : points[i].x must be informed!");
									else if ( typeof point.x != 'number' )
										throw new Error(arguments.callee.name + " : points[i].x must be a number!");
					
									if ( point.y === undefined )
										throw new Error(arguments.callee.name + " : points[i].y must be informed!");
									else if ( typeof point.y != 'number' )
										throw new Error(arguments.callee.name + " : points[i].y must be a number!");
								}
							}						
						}
					}
				}
				
				if ( details.layer.render !== undefined && typeof details.layer.render != 'object')
					throw new Error(arguments.callee.name + " : layer.render must be an object!");
				
			}
		}
	}
	
})();