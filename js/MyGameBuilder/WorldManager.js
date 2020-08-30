this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	
	MyGameBuilder.WorldManager = WorldManager;
	
	//================================================================================================
	//---------------------------------------- Box2d -------------------------------------------------
	//================================================================================================	
	
	window.box2d = {
		b2Vec2 : Box2D.Common.Math.b2Vec2,
		b2BodyDef : Box2D.Dynamics.b2BodyDef,
		b2Body : Box2D.Dynamics.b2Body,
		b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
		b2Fixture : Box2D.Dynamics.b2Fixture,
		b2World : Box2D.Dynamics.b2World,
		b2MassData : Box2D.Collision.Shapes.b2MassData,
		b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw : Box2D.Dynamics.b2DebugDraw,
		b2Math : Box2D.Common.Math.b2Math,
		
		b2AABB : Box2D.Collision.b2AABB,
		b2MouseJointDef : Box2D.Dynamics.Joints.b2MouseJointDef
	};
	
	//================================================================================================
	//----------------------------------- WorldManager -----------------------------------------------
	//================================================================================================
	
	//Constructor
	function WorldManager(easeljsCanvas, box2dCanvas, details) {
		initialize(this, easeljsCanvas, box2dCanvas, details);
	}
	
	var _validWorldManagerDef = ['scale', 'world', 'stepOpts', 'enableRender', 'enableDebug', 'showFPSIndicator', 'tickMod', 'userOnTick', 'preLoad'];
	var _validWorldManagerStepOptsDef = ['FPS', 'velocityIterations', 'positionIterations',];
	var _validWorldManagerPreLoadDef = ['showLoadingIndicator', 'files', 'onComplete', 'loadingIndicatorOpts'];
	
	var _scale;
	WorldManager.prototype.getScale = function() {
		return _scale;
	}
	
	var _world;
	WorldManager.prototype.getWorld = function() {
		return _world;
	}	
	
	var _enableRender;
	WorldManager.prototype.getEnableRender = function() {
		return _enableRender;
	}
	WorldManager.prototype.setEnableRender = function(value) {
		_enableRender = value;
	}		
	
	var _enableDebug;
	WorldManager.prototype.getEnableDebug = function() {
		return _enableDebug;
	}
	WorldManager.prototype.setEnableDebug = function(value) {
		_enableDebug = value;
	}
	
	var _tickMod;
	WorldManager.prototype.getTickMod = function() {
		return _tickMod;
	}
	
	var _nextEntityId = 0;
	WorldManager.prototype.getNextEntityId = function() {
		return _nextEntityId;
	}
	
	var _entities = [];
	WorldManager.prototype.getEntities = function() {
		return _entities;
	}
	
	var _deletedEntities = [];
	
	var _gravitations = [];
	WorldManager.prototype.getGravitations = function() {
		return _gravitations;
	}
	
	var _landscapes = [];
	WorldManager.prototype.getLandscapes = function() {
		return _landscapes;
	}	
	
	var _screenButtons = [];
	WorldManager.prototype.getScreenButtons = function() {
		return _screenButtons;
	}
	
	var _box2dCanvas;
	WorldManager.prototype.getBox2dCanvas = function() {
		return _box2dCanvas;
	}
	
	var _box2dCanvasCtx;
	WorldManager.prototype.getBox2dCanvasCtx = function() {
		return _box2dCanvasCtx;
	}
	
	var _easeljsCanvas;
	WorldManager.prototype.getEaseljsCanvas = function() {
		return _easeljsCanvas;
	}
	
	var _easeljsStage;
	WorldManager.prototype.getEaseljsStage = function() {
		return _easeljsStage;
	}
	
	var _canvasCtxScale;
	WorldManager.prototype.getCanvasCtxScale = function() {
		return _canvasCtxScale;
	}
	WorldManager.prototype.setCanvasCtxScale = function(value) {
		_canvasCtxScale = value;
	}
	
	var _player;
	WorldManager.prototype.getPlayer = function() {
		return _player;
	}
	WorldManager.prototype.setPlayer = function(player) {
		_player = player;
	}
	
	var _players = [];
	WorldManager.prototype.getPlayers = function() {
		return _players;
	}	

	var _timeStepHandler;
	WorldManager.prototype.getTimeStepHandler = function() {
		return _timeStepHandler;
	}
	
	var _zoomHandler;
	WorldManager.prototype.getZoomHandler = function() {
		return _zoomHandler;
	}
	
	var _screenHandler;
	WorldManager.prototype.getScreenHandler = function() {
		return _screenHandler;
	}	
	
	var _keyboardHandler;
	
	var _multiTouchHandler;
	WorldManager.prototype.getMultiTouchHandler = function() {
		return _multiTouchHandler;
	}	

	var _contactHandler;
	WorldManager.prototype.getContactHandler = function() {
		return _contactHandler;
	}
	
	var _soundHandler;
	WorldManager.prototype.getSoundHandler = function() {
		return _soundHandler;
	}	
	
	var _browserOSHandler;
	WorldManager.prototype.getBrowserOSHandler = function() {
		return _browserOSHandler;
	}
	
	var _wind;
	WorldManager.prototype.getWind = function() {
		return _wind;
	}
	
	var _preload;
	WorldManager.prototype.getPreLoad = function(id, rawResult) {
		return _preload;
	}
	
	var _showFPSIndicator, _fpsIndicator;
	var _loadingIndicator, 	_showLoadingIndicator, _loadingPercent, _onPreLoadComplete;
	
	var _FPS;
	WorldManager.prototype.getFPS = function() {
		return _FPS;
	}
	WorldManager.prototype.setFPS = function(value) {
		_FPS = value;
	}
	
	var _timeStep;
	WorldManager.prototype.getTimeStep = function() {
		return _timeStep;
	}
	WorldManager.prototype.setTimeStep = function(value) {
		_timeStep = value;
	}
	
	var _velocityIterations;
	WorldManager.prototype.getVelocityIterations = function() {
		return _velocityIterations;
	}
	
	var _positionIterations;
	WorldManager.prototype.getPositionIterations = function() {
		return _positionIterations;
	}
	
	var _debugDraw;
	var _countTick;

	var _userOnTick;
	WorldManager.prototype.setUserOnTick = function(fnUserOnTick) {
		_userOnTick = fnUserOnTick;
	}	
	
	function initialize(worldManager, easeljsCanvas, box2dCanvas, details) {
		validate(easeljsCanvas, box2dCanvas, details);
		
		_easeljsCanvas = easeljsCanvas;
		_easeljsStage = new createjs.Stage(document.getElementById("easeljsCanvas"));
		adjustCanvasStyle(_easeljsCanvas);
		
		_box2dCanvas = box2dCanvas;
		_box2dCanvasCtx = _box2dCanvas.getContext("2d");
		adjustCanvasStyle(_box2dCanvas);
		
		_canvasCtxScale = 1;
		
		_FPS = 60;
		if ( details && details.stepOpts !== undefined && details.stepOpts.FPS !== undefined )
			_FPS = details.stepOpts.FPS;
		
		_timeStep = 1/_FPS;
		
		_velocityIterations = 10;
		if ( details && details.stepOpts !== undefined && details.stepOpts.velocityIterations !== undefined )
			_velocityIterations = details.stepOpts.velocityIterations;
		
		_positionIterations = 10;
		if ( details && details.stepOpts !== undefined && details.stepOpts.positionIterations !== undefined )
			_positionIterations = details.stepOpts.positionIterations;
		
		_scale = 30;
		if ( details && details.scale !== undefined )
			_scale = details.scale;
		
		_world = new box2d.b2World(new box2d.b2Vec2(0, 9.8), true);
		if ( details && details.world !== undefined )
			_world = details.world;		

		_enableRender = true;
		if ( details && details.enableRender !== undefined )
			_enableRender = details.enableRender;
		
		_enableDebug = false;
		if ( details && details.enableDebug !== undefined )
			_enableDebug = details.enableDebug;
		
		_showFPSIndicator = false;
		if ( details && details.showFPSIndicator !== undefined )
			_showFPSIndicator = details.showFPSIndicator;
		
		_tickMod = 12;
		if ( details && details.tickMod !== undefined )
			_tickMod = details.tickMod;

		if ( details && details.preLoad ) {
			if ( details.preLoad.onComplete !== undefined )
				_onPreLoadComplete = details.preLoad.onComplete;		
			
			if ( details.preLoad.showLoadingIndicator !== undefined )
				_showLoadingIndicator = details.preLoad.showLoadingIndicator;
			
			if ( _showLoadingIndicator ) {
				var loadingIndicatorOpts = {};
				if ( details.preLoad.loadingIndicatorOpts !== undefined )
					loadingIndicatorOpts = details.preLoad.loadingIndicatorOpts;
				_loadingIndicator = new MyGameBuilder.LoadingIndicator(worldManager, loadingIndicatorOpts);
			}
			
			if ( details.preLoad.files !== undefined ) {
				_preload = new createjs.LoadQueue(true);
				_preload.installPlugin(createjs.Sound);
				
				_preload.addEventListener("fileload", handleFileLoad);
				_preload.addEventListener("complete", handleComplete);
				_preload.addEventListener("error", handleError);
				_preload.addEventListener("progress", handleProgress);
				
				_preload.loadManifest(details.preLoad.files);
				
				fnStart();
			}			
		}
		else {
			_loadingPercent = 100;
		}

		_countTick = 1;
		
		if ( details && details.userOnTick !== undefined )
			_userOnTick = details.userOnTick;
		
		createDebug();
	}
	
	function handleFileLoad(e) {
		console.log('handleFileLoad: \'' + e.item.id + '\' loaded!');
	}
	
	function handleComplete(e) {
		console.log('handleComplete');
		_loadingIndicator.view.alpha = 0.0;
		
		_onPreLoadComplete();
		
		if ( _showFPSIndicator )
			createFPSIndicator();
	}
	
	function handleError(e) {
		console.log('handleError: \'' + e.item.id + '\' error!');
	}
	
	function handleProgress(e) {
		_loadingPercent = Math.round(e.progress * 100);
		
		if ( _loadingIndicator )
			_loadingIndicator.update(_loadingPercent);
	}	
	
	function adjustCanvasStyle(canvas) {
		canvas.style.width = canvas.width + "px";
		canvas.style.height = canvas.height + "px";		
	}
	
	function validate(easeljsCanvas, box2dCanvas, details) {
		if ( !(easeljsCanvas instanceof HTMLCanvasElement) )
			throw new Error(arguments.callee.name + " : easeljsCanvas must be an instance of HTMLCanvasElement!");

		if ( !(box2dCanvas instanceof HTMLCanvasElement) )
			throw new Error(arguments.callee.name + " : box2dCanvas must be an instance of HTMLCanvasElement!");		
		
		if ( details !== undefined ) {
			for ( var p in details )
				if ( _validWorldManagerDef.indexOf(p) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + p + ") is not supported! Valid definitions: " + _validWorldManagerDef);
			
			if ( details.scale !== undefined && (typeof details.scale != 'number' || details.scale <= 0) )
				throw new Error(arguments.callee.name + " : invalid value for scale!");
			
			if ( details.world !== undefined && !(details.world instanceof box2d.b2World) )
				throw new Error(arguments.callee.name + " : world must be an instance of box2d.b2World!");

			if ( details.stepOpts !== undefined ) {
				if ( typeof details.stepOpts != 'object' )
					throw new Error(arguments.callee.name + " : stepOpts must be an object!");
				
				for ( var def in details.stepOpts )
					if ( _validWorldManagerStepOptsDef.indexOf(def) < 0 )
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for stepOpts is not supported! Valid definitions: " + _validWorldManagerStepOptsDef);
				
				if ( details.stepOpts.FPS !== undefined && (typeof details.stepOpts.FPS != 'number' || details.stepOpts.FPS <= 0 ) )
					throw new Error(arguments.callee.name + " : invalid number for FPS!");
				
				if ( details.stepOpts.velocityIterations !== undefined && (typeof details.stepOpts.velocityIterations != 'number' || details.stepOpts.velocityIterations <= 0 ) )
					throw new Error(arguments.callee.name + " : invalid number for velocityIterations!");
				
				if ( details.stepOpts.positionIterations !== undefined && (typeof details.stepOpts.positionIterations != 'number' || details.stepOpts.positionIterations <= 0 ) )
					throw new Error(arguments.callee.name + " : invalid number for positionIterations!");
			}
			
			if ( details.activeRender !== undefined && typeof details.activeRender != 'boolean' )
				throw new Error(arguments.callee.name + " : activeRender must be a true/false!");			
			
			if ( details.activeDebug !== undefined && typeof details.activeDebug != 'boolean' )
				throw new Error(arguments.callee.name + " : activeDebug must be a true/false!");
			
			if ( details.showFPSIndicator !== undefined && typeof details.showFPSIndicator != 'boolean' )
				throw new Error(arguments.callee.name + " : showFPSIndicator must be a true/false!");
			
			if ( details.tickMod !== undefined && (typeof details.tickMod != 'number' || details.tickMod <= 0 ) )
				throw new Error(arguments.callee.name + " : invalid number for tickMod!");
			
			if ( details.userOnTick !== undefined && typeof details.userOnTick !== 'function' )
				throw new Error(arguments.callee.name + " : userOnTick must be a function!");
			
			if ( details.preLoad !== undefined ) {
				if ( typeof details.preLoad != 'object' )
					throw new Error(arguments.callee.name + " : preLoad must be an object!");
				
				for ( var def in details.preLoad )
					if ( _validWorldManagerPreLoadDef.indexOf(def) < 0 )
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for preLoad is not supported! Valid definitions: " + _validWorldManagerPreLoadDef);
				
				if ( details.preLoad.files === undefined )
					throw new Error(arguments.callee.name + " : an array of files to be preloaded must be informed!");
				else if ( !(details.preLoad.files instanceof Array) )
					throw new Error(arguments.callee.name + " : preLoad.files must be an Array!");
				else if ( details.preLoad.files.length == 0 )
					throw new Error(arguments.callee.name + " : preLoad.files must have at least 1 file!");				
				
				if ( details.preLoad.onComplete === undefined )
					throw new Error(arguments.callee.name + " : a function must be informed to the property preLoad.onComplete!");
				else if ( typeof details.preLoad.onComplete != 'function' )
					throw new Error(arguments.callee.name + " : preLoad.onComplete must be a function!");				
				
				if ( details.preLoad.showLoadingIndicator !== undefined && typeof details.preLoad.showLoadingIndicator != 'boolean' )
					throw new Error(arguments.callee.name + " : preLoad.showLoadingIndicator must be a true/false!");				
			}						
		}		
	}
	
	WorldManager.prototype.start = function() {
		fnStart();
		
		if ( _showFPSIndicator )
			createFPSIndicator();
	}
	
	function fnStart() {
		if ( _screenHandler && _screenHandler.isFullScreen() )
			_screenHandler.showFullScreen();
		
		createjs.Ticker.addEventListener('tick', tick);
		createjs.Ticker.setFPS(_FPS);
		createjs.Ticker.useRAF = true;		
	}
	
	function createFPSIndicator() {
		_fpsIndicator = new createjs.Text("-- fps", "bold 18px Arial", "white");
		_fpsIndicator.x = 10;
		_fpsIndicator.y = 10;
        _easeljsStage.addChild(_fpsIndicator);	
	}
	
	function tick(event) {
		_countTick++;
		if ( _countTick > _FPS )
			_countTick = 1;
		
		//-- EaselJS Update ----------
		if ( !event.paused ) {
			_easeljsStage.clear();
			if ( _enableRender ) {
				
				if ( _player && _player.isNecessaryToFocus() )
					setFocusOnPlayer();
				
				var e = { FPS : _FPS };
				_easeljsStage.update(e);
			}
		}
		//----------------------------
		
		if ( _loadingPercent !== 100 )
			return;
		
		
		//-- Keyboard -----------------------
		if ( _keyboardHandler && _keyboardHandler.update )
			_keyboardHandler.update(_countTick);
		//-------------------------------------
		
		
		//-- MultiTouch -----------------------
		if ( _multiTouchHandler && _multiTouchHandler.update ) {
			_multiTouchHandler.update(_countTick);
			
			if ( _multiTouchHandler.getEnableSlice() ) {
				var sliceHandler = _multiTouchHandler.getSliceHandler();
				if ( sliceHandler )
					sliceHandler.update();
			}
		}
		//-------------------------------------
		
		
		if ( event.paused )
			return;
		
		
		//-- FPS Label ----------------------------------------------------------------
		if ( _fpsIndicator )
			_fpsIndicator.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
		//-----------------------------------------------------------------------------
		
		
		//-- Box2d Debug Update ------------------------------------------------
		_box2dCanvas.width = _box2dCanvas.width; //Clear box2dCanvas
		if ( _enableDebug )
		{
			if ( _player && _player.isNecessaryToFocus() )
				setFocusOnPlayer();
			else
				_box2dCanvasCtx.scale(_canvasCtxScale, _canvasCtxScale);
			
			_world.DrawDebugData();
		}
		//----------------------------------------------------------------------

		
		//-- Contact --------------------------
		if ( _contactHandler && _contactHandler.update )
			_contactHandler.update();
		//-------------------------------------
		
		
		//-- Entity ---------------------------
		for ( var i = 0; i < _entities.length; i++ ) {
			var entity = _entities[i];
			var entityBody = entity.b2body;
			
			if ( entityBody.GetUserData().noGravity ) {
				var force = new box2d.b2Vec2(0,0);
				force.x = -(entityBody.GetMass() * _world.GetGravity().x);
				force.y = -(entityBody.GetMass() * _world.GetGravity().y);
				entityBody.ApplyForce(force, entityBody.GetWorldCenter());
			}
			
			if ( entity.ontick )
				entity.ontick(event);
		}
		//-------------------------------------

		
		//-- Gravitation-----------------------
		for ( var i = 0; i < _gravitations.length; i++ ) {
			var gravitation = _gravitations[i];
			gravitation.update();
		}
		//-------------------------------------
		
		
		//-- Wind -----------------------------
		if ( _wind && _wind.update )
			_wind.update(_countTick);
		//-------------------------------------		
		
		
		//-- userOnTick -----------------------
		if ( _userOnTick )
			_userOnTick(event);
		//-------------------------------------
		
		
		//-- Box2d Physics -------------------------
    	if ( _deletedEntities.length > 0 )
    		deleteEntitiesFromWorldManager();
		
		_world.Step(_timeStep, _velocityIterations, _positionIterations);
		_world.ClearForces();
		//-------------------------------------------
	}
	
	function createDebug() {
		_debugDraw = new box2d.b2DebugDraw();
		_debugDraw.SetSprite(_box2dCanvasCtx);
		_debugDraw.SetDrawScale(_scale);
		_debugDraw.SetFillAlpha(0.5);
		_debugDraw.SetLineThickness(1.0);
		_debugDraw.SetFlags(
				box2d.b2DebugDraw.e_shapeBit
				| box2d.b2DebugDraw.e_jointBit
				//| box2d.b2DebugDraw.e_aabbBit
		);
        _world.SetDebugDraw(_debugDraw);
    }
	
	function deleteEntitiesFromWorldManager() {
		var i;
		
		while ( _deletedEntities.length > 0 ) {
			var entity = _deletedEntities.shift();
			_easeljsStage.removeChild(entity.b2body.view);
			_world.DestroyBody(entity.b2body);
			
			for ( i = _gravitations.length-1; i >= 0; i-- ) {
				var gravitation = _gravitations[i];
				if ( gravitation.getEntity() === entity ) {
					_easeljsStage.removeChild(gravitation.view);
					_gravitations.splice(i, 1);
			    	break;
				}
			}
			
			for ( i = _entities.length-1; i >= 0; i-- ) {
			    if ( _entities[i].getId() === entity.getId() ) {
			    	_entities.splice(i, 1);
			    	break;
			    }
			}
		}		
	}

	//================================================================================================
	//---------------------------------- ScreenButton ------------------------------------------------
	//================================================================================================
	WorldManager.prototype.createScreenButton = function(details) {
		var screenButton = new MyGameBuilder.ScreenButton(this, details);
		_screenButtons.push(screenButton);
		return screenButton;
	}
	
	//================================================================================================
	//----------------------------------- TimeStep ---------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createTimeStepHandler = function(details) {
		_timeStepHandler = new MyGameBuilder.TimeStepHandler(this, details);
		return _timeStepHandler;
	}
	
	//================================================================================================
	//------------------------------------- Zoom -----------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createZoomHandler = function(details) {
		_zoomHandler = new MyGameBuilder.ZoomHandler(this, details);
		return _zoomHandler;
	}	
	
	//================================================================================================
	//------------------------------------- Screen ---------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createScreenHandler = function(details) {
		_screenHandler = new MyGameBuilder.ScreenHandler(this, details);
		return _screenHandler;
	}
	
	//================================================================================================
	//------------------------------------ Landscape -------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createLandscape = function(details) {
		var landscape = new MyGameBuilder.Landscape(this, details);
		_landscapes.push(landscape);
		return landscape;
	}	
	
	//================================================================================================
	//--------------------------------------- Entity--------------------------------------------------
	//================================================================================================	
	
	WorldManager.prototype.createEntity = function(details) {
		var entity = new MyGameBuilder.Entity(this, details);
		
		_entities.push(entity);
		_nextEntityId++;
		
		return entity;		
	}
	
	WorldManager.prototype.deleteEntity = function(entity) {
		if ( !(entity instanceof MyGameBuilder.Entity) )
			throw new Error(arguments.callee.name + " : invalid value for entity!");
		
		var found = false;
		for (var b = _world.GetBodyList(); b && !found; b = b.m_next) {
			if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
				if ( b.GetUserData().id === entity.getId()  ) {
					_deletedEntities.push(entity);
					found = true;
				}
			}
		}
		if ( !found )
			console.warn("The entity informed to be deleted doesn't exist!");
	}
	
	WorldManager.prototype.getEntityByItsBody = function(body) {
		if ( !(body instanceof box2d.b2Body) )
			throw new Error(arguments.callee.name + " : invalid value for body!");
		
		var entity = null;
		for ( var i = 0; i < _entities.length; i++ ) {
			if ( _entities[i].b2body === body ) {
				entity = _entities[i];
				break;
			}
		}
		
		return entity;		
	}	
	
	//================================================================================================
	//--------------------------------------- Link ---------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createLink = function(details) {
		var link = new MyGameBuilder.Link(this, details);
		return link;
	}	

	//================================================================================================
	//---------------------------------- KeyboardHandler ---------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createKeyboardHandler = function(details) {
		_keyboardHandler = new MyGameBuilder.KeyboardHandler(this, details);
		return _keyboardHandler;
	}
	
	//================================================================================================
	//--------------------------------- MultiTouchHandler --------------------------------------------
	//================================================================================================	
	
	WorldManager.prototype.createMultiTouchHandler = function(details) {
		_multiTouchHandler = new MyGameBuilder.MultiTouchHandler(this, details);
		return _multiTouchHandler;
	}
	
	//================================================================================================
	//---------------------------------------- Player ------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createPlayer = function(entity, details) {
		var player = new MyGameBuilder.Player(this, entity, details);
		_players.push(player);
		_player = player;
		return player;
	}
	
	WorldManager.prototype.getPlayerByItsEntity = function(entity) {
		if ( !(entity instanceof MyGameBuilder.Entity) )
			throw new Error(arguments.callee.name + " : invalid value for entity!");
		
		var player = null;
		for ( var i = 0; i < _players.length; i++ ) {
			if ( _players[i].getEntity() === entity ) {
				player = _players[i];
				break;
			}
		}
		
		return player;		
	}
	
	function setFocusOnPlayer() {
		var x = 0;
		if ( _player.getCamera().getXAxisOn() )
			x = -(_player.getPosition().x);
		if ( _player.getCamera().getAdjustX() !== undefined )
			x += _player.getCamera().getAdjustX();
		
		var y = 0;
		if ( _player.getCamera().getYAxisOn() )
			y = -(_player.getPosition().y);
		if ( _player.getCamera().getAdjustY() !== undefined )
			y += _player.getCamera().getAdjustY();

		_box2dCanvasCtx.scale(_canvasCtxScale, _canvasCtxScale);
		_box2dCanvasCtx.translate(x, y);

		_easeljsStage.setTransform(x * _canvasCtxScale, y * _canvasCtxScale, _canvasCtxScale, _canvasCtxScale);
		
		_fpsIndicator.x = -x + 10;
		_fpsIndicator.y = -y + 10;
		
		for ( var i = 0; i < _screenButtons.length; i++ ) {
			var screenButton = _screenButtons[i];
			if ( screenButton.view !== undefined ) {
				screenButton.view.x = -x + screenButton.view.x0;
				screenButton.view.y = -y + screenButton.view.y0;
			}
		}
	}
	
	//================================================================================================
	//-------------------------------------- Grenade -------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createGrenade = function(entity, details) {
		var grenade = new MyGameBuilder.Grenade(this, entity, details);
		return grenade;
	}
	
	//================================================================================================
	//------------------------------------ Gravitation -----------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createGravitation = function(entity, details) {
		var gravitation = new MyGameBuilder.Gravitation(this, entity, details);
		_gravitations.push(gravitation);
		return gravitation;
	}	
	
	//================================================================================================
	//---------------------------------------- Wind --------------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createWind = function(details) {
		_wind = new MyGameBuilder.Wind(this, details);
		return _wind;
	}

	//================================================================================================
	//----------------------------------- ContactHandler ---------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createContactHandler = function(details) {
		_contactHandler = new MyGameBuilder.ContactHandler(this, details);
		return _contactHandler;
	}
	
	//================================================================================================
	//------------------------------------ SoundHandler ----------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createSoundHandler = function(details) {
		_soundHandler = new MyGameBuilder.SoundHandler(details);
		return _soundHandler;
	}	
	
	//================================================================================================
	//---------------------------------- BrowserOsHandler --------------------------------------------
	//================================================================================================
	
	WorldManager.prototype.createBrowserOSHandler = function() {
		_browserOSHandler = new MyGameBuilder.BrowserOSHandler();
		return _browserOSHandler;
	}
	
	//================================================================================================
	//---------------------------------------- Array -------------------------------------------------
	//================================================================================================	
	
	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};
	
})();