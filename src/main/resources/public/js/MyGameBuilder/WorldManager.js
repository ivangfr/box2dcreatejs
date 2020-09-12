this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.WorldManager = WorldManager

	//================================================================================================
	//---------------------------------------- Box2d -------------------------------------------------
	//================================================================================================	

	window.box2d = {
		b2Vec2: Box2D.Common.Math.b2Vec2,
		b2BodyDef: Box2D.Dynamics.b2BodyDef,
		b2Body: Box2D.Dynamics.b2Body,
		b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
		b2Fixture: Box2D.Dynamics.b2Fixture,
		b2World: Box2D.Dynamics.b2World,
		b2MassData: Box2D.Collision.Shapes.b2MassData,
		b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
		b2Math: Box2D.Common.Math.b2Math,
		b2AABB: Box2D.Collision.b2AABB,
		b2MouseJointDef: Box2D.Dynamics.Joints.b2MouseJointDef
	}

	//================================================================================================
	//----------------------------------- WorldManager -----------------------------------------------
	//================================================================================================

	function WorldManager(easeljsCanvas, box2dCanvas, details) {
		initialize(this, easeljsCanvas, box2dCanvas, details)
	}

	const _validWorldManagerDef = ['scale', 'world', 'stepOpts', 'enableRender', 'enableDebug', 'fpsIndicator', 'tickMod', 'userOnTick', 'preLoad']
	const _validWorldManagerStepOptsDef = ['FPS', 'velocityIterations', 'positionIterations',]
	const _validWorldManagerPreLoadDef = ['showLoadingIndicator', 'files', 'onComplete', 'loadingIndicatorOpts']
	const _validWorldManagerFpsIndicatorDef = ['enabled', 'x', 'y', 'font', 'color']

	let _scale
	WorldManager.prototype.getScale = function () { return _scale }

	let _world
	WorldManager.prototype.getWorld = function () { return _world }

	let _enableRender
	WorldManager.prototype.getEnableRender = function () {
		return _enableRender
	}
	WorldManager.prototype.setEnableRender = function (value) { _enableRender = value }

	let _enableDebug
	WorldManager.prototype.getEnableDebug = function () { return _enableDebug }
	WorldManager.prototype.setEnableDebug = function (value) { _enableDebug = value }

	let _tickMod
	WorldManager.prototype.getTickMod = function () { return _tickMod }

	let _entityIdSeq = 0
	WorldManager.prototype.getNextEntityIdSeq = function () { return _entityIdSeq + 1 }

	const _entities = []
	WorldManager.prototype.getEntities = function () { return _entities }

	const _deletedEntities = []

	const _gravitations = []
	WorldManager.prototype.getGravitations = function () { return _gravitations }

	const _landscapes = []
	WorldManager.prototype.getLandscapes = function () { return _landscapes }

	const _screenButtons = []
	WorldManager.prototype.getScreenButtons = function () { return _screenButtons }

	let _box2dCanvas
	WorldManager.prototype.getBox2dCanvas = function () { return _box2dCanvas }

	let _box2dCanvasCtx
	WorldManager.prototype.getBox2dCanvasCtx = function () { return _box2dCanvasCtx }

	let _easeljsCanvas
	WorldManager.prototype.getEaseljsCanvas = function () { return _easeljsCanvas }

	let _easeljsStage
	WorldManager.prototype.getEaseljsStage = function () { return _easeljsStage }

	let _canvasCtxScale
	WorldManager.prototype.getCanvasCtxScale = function () { return _canvasCtxScale }
	WorldManager.prototype.setCanvasCtxScale = function (value) { _canvasCtxScale = value }

	let _player
	WorldManager.prototype.getPlayer = function () { return _player }
	WorldManager.prototype.setPlayer = function (player) { _player = player }
	WorldManager.prototype.getCameraAdjust = function () {
		return _player ? _player.getCameraAdjust() : { adjustX: 0, adjustY: 0 }
	}

	const _players = []
	WorldManager.prototype.getPlayers = function () { return _players }

	let _timeStepHandler
	WorldManager.prototype.getTimeStepHandler = function () { return _timeStepHandler }

	let _zoomHandler
	WorldManager.prototype.getZoomHandler = function () { return _zoomHandler }

	let _screenHandler
	WorldManager.prototype.getScreenHandler = function () { return _screenHandler }

	let _keyboardHandler

	let _multiTouchHandler
	WorldManager.prototype.getMultiTouchHandler = function () { return _multiTouchHandler }

	let _contactHandler
	WorldManager.prototype.getContactHandler = function () { return _contactHandler }

	let _soundHandler
	WorldManager.prototype.getSoundHandler = function () { return _soundHandler }

	let _browserOSHandler
	WorldManager.prototype.getBrowserOSHandler = function () { return _browserOSHandler }

	let _wind
	WorldManager.prototype.getWind = function () { return _wind }

	let _preload
	WorldManager.prototype.getPreLoad = function (id, rawResult) { return _preload }

	let _fpsIndicator, _fpsIndicatorText
	let _loadingIndicator, _showLoadingIndicator, _loadingPercent, _onPreLoadComplete

	let _FPS
	WorldManager.prototype.getFPS = function () { return _FPS }
	WorldManager.prototype.setFPS = function (value) { _FPS = value }

	let _timeStep
	WorldManager.prototype.getTimeStep = function () { return _timeStep }
	WorldManager.prototype.setTimeStep = function (value) { _timeStep = value }

	let _velocityIterations
	WorldManager.prototype.getVelocityIterations = function () { return _velocityIterations }

	let _positionIterations
	WorldManager.prototype.getPositionIterations = function () { return _positionIterations }

	let _debugDraw
	let _countTick

	let _userOnTick
	WorldManager.prototype.setUserOnTick = function (fnUserOnTick) { _userOnTick = fnUserOnTick }

	function initialize(worldManager, easeljsCanvas, box2dCanvas, details) {
		validate(easeljsCanvas, box2dCanvas, details)

		_easeljsCanvas = easeljsCanvas
		_easeljsStage = new createjs.Stage(easeljsCanvas)
		adjustCanvasStyle(_easeljsCanvas)

		_box2dCanvas = box2dCanvas
		_box2dCanvasCtx = _box2dCanvas.getContext("2d")
		adjustCanvasStyle(_box2dCanvas)

		_canvasCtxScale = 1
		_FPS = (details && details.stepOpts !== undefined && details.stepOpts.FPS !== undefined) ? details.stepOpts.FPS : 60
		_timeStep = 1 / _FPS

		_scale = (details && details.scale !== undefined) ? details.scale : 30
		_world = (details && details.world !== undefined) ? details.world : new box2d.b2World(new box2d.b2Vec2(0, 9.8), true)
		_enableRender = (details && details.enableRender !== undefined) ? details.enableRender : true
		_enableDebug = (details && details.enableDebug !== undefined) ? details.enableDebug : false
		_tickMod = (details && details.tickMod !== undefined) ? details.tickMod : 12

		_velocityIterations = (details && details.stepOpts !== undefined && details.stepOpts.velocityIterations !== undefined) ?
			details.stepOpts.velocityIterations : 10

		_positionIterations = (details && details.stepOpts !== undefined && details.stepOpts.positionIterations !== undefined) ?
			details.stepOpts.positionIterations : 10

		_fpsIndicator = {
			enabled: false,
			x: 10, y: 10,
			color: 'white',
			font: 'bold 18px Monaco'
		}
		if (details && details.fpsIndicator !== undefined) {
			if (details.fpsIndicator.enabled !== undefined) {
				_fpsIndicator.enabled = details.fpsIndicator.enabled
			}
			if (details.fpsIndicator.x !== undefined) {
				_fpsIndicator.x = details.fpsIndicator.x
			}
			if (details.fpsIndicator.y !== undefined) {
				_fpsIndicator.y = details.fpsIndicator.y
			}
			if (details.fpsIndicator.color !== undefined) {
				_fpsIndicator.color = details.fpsIndicator.color
			}
			if (details.fpsIndicator.font !== undefined) {
				_fpsIndicator.font = details.fpsIndicator.font
			}
		}

		if (details && details.preLoad !== undefined) {
			if (details.preLoad.onComplete !== undefined) {
				_onPreLoadComplete = details.preLoad.onComplete
			}

			_showLoadingIndicator = (details.preLoad.showLoadingIndicator !== undefined) ? details.preLoad.showLoadingIndicator : true
			if (_showLoadingIndicator) {
				const loadingIndicatorOpts = (details.preLoad.loadingIndicatorOpts !== undefined) ? details.preLoad.loadingIndicatorOpts : {}
				_loadingIndicator = new MyGameBuilder.LoadingIndicator(worldManager, loadingIndicatorOpts)
			}

			if (details.preLoad.files !== undefined) {
				_preload = new createjs.LoadQueue(true)
				_preload.installPlugin(createjs.Sound)
				_preload.addEventListener("fileload", handleFileLoad)
				_preload.addEventListener("complete", handleComplete)
				_preload.addEventListener("error", handleError)
				_preload.addEventListener("progress", handleProgress)
				_preload.loadManifest(details.preLoad.files)
				fnStart()
			}
		}
		else {
			_loadingPercent = 100
		}

		_countTick = 1
		if (details && details.userOnTick !== undefined) {
			_userOnTick = details.userOnTick
		}
		createDebug()
	}

	function handleFileLoad(e) {
		console.log('handleFileLoad: \'' + e.item.id + '\' loaded!')
	}

	function handleComplete(e) {
		console.log('handleComplete')

		if (_loadingIndicator) {
			_loadingIndicator.view.alpha = 0.0
		}

		_onPreLoadComplete()

		if (_fpsIndicator.enabled) {
			createFPSIndicator()
		}
	}

	function handleError(e) {
		console.log('handleError: \'' + e.item.id + '\' error!')
	}

	function handleProgress(e) {
		_loadingPercent = Math.round(e.progress * 100)

		if (_loadingIndicator) {
			_loadingIndicator.update(_loadingPercent)
		}
	}

	function adjustCanvasStyle(canvas) {
		canvas.style.width = canvas.width + "px"
		canvas.style.height = canvas.height + "px"
	}

	WorldManager.prototype.start = function () {
		fnStart()
		if (_fpsIndicator.enabled) {
			createFPSIndicator()
		}
	}

	function fnStart() {
		if (_screenHandler && _screenHandler.isFullScreen()) {
			_screenHandler.showFullScreen()
		}
		createjs.Ticker.addEventListener('tick', tick)
		createjs.Ticker.framerate = _FPS
		createjs.Ticker.useRAF = true
	}

	function createFPSIndicator() {
		_fpsIndicatorText = new createjs.Text("-- fps", _fpsIndicator.font, _fpsIndicator.color)
		_fpsIndicatorText.x = _fpsIndicatorText.x0 = _fpsIndicator.x
		_fpsIndicatorText.y = _fpsIndicatorText.y0 = _fpsIndicator.y
		_easeljsStage.addChild(_fpsIndicatorText)
	}

	function tick(event) {
		_countTick++
		if (_countTick > _FPS) {
			_countTick = 1
		}


		//-- EaselJS Update ----------
		if (!event.paused) {
			_easeljsStage.clear()
			if (_enableRender) {
				if (_player && _player.isNecessaryToFocus()) {
					setFocusOnPlayer()
				}
				_easeljsStage.update({ FPS: _FPS })
			}
		}
		//----------------------------


		//-- Box2d Debug Update ------------------------------------------------
		if (!event.paused) {
			_box2dCanvas.width = _box2dCanvas.width // Clear box2dCanvas
			if (_enableDebug) {
				if (_player && _player.isNecessaryToFocus()) {
					setFocusOnPlayer()
				}
				else {
					_box2dCanvasCtx.scale(_canvasCtxScale, _canvasCtxScale)
				}
				_world.DrawDebugData()
			}
		}
		//----------------------------------------------------------------------


		if (_loadingPercent !== 100) {
			return
		}


		//-- Keyboard -----------------------
		if (_keyboardHandler && _keyboardHandler.update) {
			_keyboardHandler.update(_countTick)
		}
		//-------------------------------------


		//-- MultiTouch -----------------------
		if (_multiTouchHandler && _multiTouchHandler.update) {
			_multiTouchHandler.update(_countTick)

			if (_multiTouchHandler.getEnableSlice()) {
				const sliceHandler = _multiTouchHandler.getSliceHandler()
				if (sliceHandler) {
					sliceHandler.update()
				}
			}
		}
		//-------------------------------------


		if (event.paused) {
			return
		}


		//-- FPS Label ----------------------------------------------------------------
		if (_fpsIndicatorText) {
			_fpsIndicatorText.text = Math.round(createjs.Ticker.getMeasuredFPS()) + "fps"
		}
		//-----------------------------------------------------------------------------


		//-- Contact --------------------------
		if (_contactHandler && _contactHandler.update) {
			_contactHandler.update()
		}
		//-------------------------------------


		//-- Entity ---------------------------
		_entities.forEach(entity => {
			const entityBody = entity.b2body
			if (entityBody.GetUserData().noGravity) {
				const force = new box2d.b2Vec2(0, 0)
				force.x = -entityBody.GetMass() * _world.GetGravity().x
				force.y = -entityBody.GetMass() * _world.GetGravity().y
				entityBody.ApplyForce(force, entityBody.GetWorldCenter())
			}
			if (entity.ontick) {
				entity.ontick(event)
			}
		})
		//-------------------------------------


		//-- Gravitation-----------------------
		_gravitations.forEach(gravitation => gravitation.update())
		//-------------------------------------


		//-- Wind -----------------------------
		if (_wind && _wind.update) {
			_wind.update(_countTick)
		}
		//-------------------------------------		


		//-- userOnTick -----------------------
		if (_userOnTick) {
			_userOnTick(event)
		}
		//-------------------------------------


		//-- Box2d Physics -------------------------
		if (_deletedEntities.length > 0) {
			deleteEntitiesFromWorldManager()
		}
		_world.Step(_timeStep, _velocityIterations, _positionIterations)
		_world.ClearForces()
		//-------------------------------------------
	}

	function createDebug() {
		_debugDraw = new box2d.b2DebugDraw()
		_debugDraw.SetSprite(_box2dCanvasCtx)
		_debugDraw.SetDrawScale(_scale)
		_debugDraw.SetFillAlpha(0.5)
		_debugDraw.SetLineThickness(1.0)
		_debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit /*| box2d.b2DebugDraw.e_aabbBit*/)
		_world.SetDebugDraw(_debugDraw)
	}

	function deleteEntitiesFromWorldManager() {
		while (_deletedEntities.length > 0) {
			const entity = _deletedEntities.shift()
			_easeljsStage.removeChild(entity.b2body.view)
			_world.DestroyBody(entity.b2body)

			for (let i = _gravitations.length - 1; i >= 0; i--) {
				const gravitation = _gravitations[i]
				if (gravitation.getEntity() === entity) {
					_easeljsStage.removeChild(gravitation.view)
					_gravitations.splice(i, 1)
					break
				}
			}

			for (let i = _entities.length - 1; i >= 0; i--) {
				if (_entities[i].getId() === entity.getId()) {
					_entities.splice(i, 1)
					break
				}
			}
		}
	}

	//================================================================================================
	//---------------------------------- ScreenButton ------------------------------------------------
	//================================================================================================
	WorldManager.prototype.createScreenButton = function (details) {
		const screenButton = new MyGameBuilder.ScreenButton(this, details)
		_screenButtons.push(screenButton)
		return screenButton
	}

	//================================================================================================
	//----------------------------------- TimeStep ---------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createTimeStepHandler = function (details) {
		_timeStepHandler = new MyGameBuilder.TimeStepHandler(this, details)
		return _timeStepHandler
	}

	//================================================================================================
	//------------------------------------- Zoom -----------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createZoomHandler = function (details) {
		_zoomHandler = new MyGameBuilder.ZoomHandler(this, details)
		return _zoomHandler
	}

	//================================================================================================
	//------------------------------------- Screen ---------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createScreenHandler = function (details) {
		_screenHandler = new MyGameBuilder.ScreenHandler(this, details)
		return _screenHandler
	}

	//================================================================================================
	//------------------------------------ Landscape -------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createLandscape = function (details) {
		const landscape = new MyGameBuilder.Landscape(this, details)
		_landscapes.push(landscape)
		return landscape
	}

	//================================================================================================
	//--------------------------------------- Entity -------------------------------------------------
	//================================================================================================	

	WorldManager.prototype.createEntity = function (details) {
		const entity = new MyGameBuilder.Entity(this, details)
		_entities.push(entity)
		_entityIdSeq++
		return entity
	}

	WorldManager.prototype.deleteEntity = function (entity) {
		if (!(entity instanceof MyGameBuilder.Entity)) {
			throw new Error(arguments.callee.name + " : invalid value for entity!")
		}
		let found = false
		for (let b = _world.GetBodyList(); b && !found; b = b.m_next) {
			if (b.IsActive() && b.GetUserData() && b.GetUserData().id === entity.getId()) {
				_deletedEntities.push(entity)
				found = true
			}
		}
		if (!found) {
			console.warn("The entity informed to be deleted doesn't exist!")
		}
	}

	WorldManager.prototype.getEntityByItsBody = function (body) {
		if (!(body instanceof box2d.b2Body)) {
			throw new Error(arguments.callee.name + " : invalid value for body!")
		}
		let entity
		for (let i = 0; i < _entities.length; i++) {
			if (_entities[i].b2body == body) {
				entity = _entities[i]
				break
			}
		}
		if (!entity) {
			console.warn("Cannot find an entity with the body informed!", body)
		}
		return entity
	}

	//================================================================================================
	//--------------------------------------- Link ---------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createLink = function (details) {
		return new MyGameBuilder.Link(this, details)
	}

	//================================================================================================
	//---------------------------------- KeyboardHandler ---------------------------------------------
	//================================================================================================

	WorldManager.prototype.createKeyboardHandler = function (details) {
		_keyboardHandler = new MyGameBuilder.KeyboardHandler(this, details)
		return _keyboardHandler
	}

	//================================================================================================
	//--------------------------------- MultiTouchHandler --------------------------------------------
	//================================================================================================	

	WorldManager.prototype.createMultiTouchHandler = function (details) {
		_multiTouchHandler = new MyGameBuilder.MultiTouchHandler(this, details)
		return _multiTouchHandler
	}

	//================================================================================================
	//---------------------------------------- Player ------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createPlayer = function (entity, details) {
		const player = new MyGameBuilder.Player(this, entity, details)
		_players.push(player)
		_player = player
		return player
	}

	WorldManager.prototype.getPlayerByItsEntity = function (entity) {
		if (!(entity instanceof MyGameBuilder.Entity)) {
			throw new Error(arguments.callee.name + " : invalid value for entity!")
		}
		return _players.filter(player => player.getEntity() === entity)[0]
	}

	function setFocusOnPlayer() {
		let x = 0
		if (_player.getCamera().getXAxisOn()) {
			x = -_player.getPosition().x
		}
		if (_player.getCamera().getAdjustX() !== undefined) {
			x += _player.getCamera().getAdjustX()
		}

		let y = 0
		if (_player.getCamera().getYAxisOn()) {
			y = -_player.getPosition().y
		}
		if (_player.getCamera().getAdjustY() !== undefined) {
			y += _player.getCamera().getAdjustY()
		}

		_box2dCanvasCtx.scale(_canvasCtxScale, _canvasCtxScale)
		_box2dCanvasCtx.translate(x, y)

		_easeljsStage.setTransform(x * _canvasCtxScale, y * _canvasCtxScale, _canvasCtxScale, _canvasCtxScale)

		_fpsIndicatorText.x = _fpsIndicatorText.x0 - x
		_fpsIndicatorText.y = _fpsIndicatorText.y0 - y

		if (_keyboardHandler) {
			const keyboardHintText = _keyboardHandler.getKeyboardHintText();
			if (keyboardHintText) {
				keyboardHintText.x = keyboardHintText.x0 - x
				keyboardHintText.y = keyboardHintText.y0 - y
			}
		}

		_screenButtons.forEach(screenButton => {
			if (screenButton.view !== undefined) {
				screenButton.view.x = -x + screenButton.view.x0
				screenButton.view.y = -y + screenButton.view.y0
			}
		})
	}

	//================================================================================================
	//-------------------------------------- Grenade -------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createGrenade = function (entity, details) {
		return new MyGameBuilder.Grenade(this, entity, details)
	}

	//================================================================================================
	//------------------------------------ Gravitation -----------------------------------------------
	//================================================================================================

	WorldManager.prototype.createGravitation = function (entity, details) {
		const gravitation = new MyGameBuilder.Gravitation(this, entity, details)
		_gravitations.push(gravitation)
		return gravitation
	}

	//================================================================================================
	//---------------------------------------- Wind --------------------------------------------------
	//================================================================================================

	WorldManager.prototype.createWind = function (details) {
		_wind = new MyGameBuilder.Wind(this, details)
		return _wind
	}

	//================================================================================================
	//----------------------------------- ContactHandler ---------------------------------------------
	//================================================================================================

	WorldManager.prototype.createContactHandler = function (details) {
		_contactHandler = new MyGameBuilder.ContactHandler(this, details)
		return _contactHandler
	}

	//================================================================================================
	//------------------------------------ SoundHandler ----------------------------------------------
	//================================================================================================

	WorldManager.prototype.createSoundHandler = function (details) {
		_soundHandler = new MyGameBuilder.SoundHandler(details)
		return _soundHandler
	}

	//================================================================================================
	//---------------------------------- BrowserOsHandler --------------------------------------------
	//================================================================================================

	WorldManager.prototype.createBrowserOSHandler = function () {
		_browserOSHandler = new MyGameBuilder.BrowserOSHandler()
		return _browserOSHandler
	}

	//================================================================================================
	//---------------------------------------- Array -------------------------------------------------
	//================================================================================================	

	Array.prototype.remove = function (from, to) {
		const rest = this.slice((to || from) + 1 || this.length)
		this.length = from < 0 ? this.length + from : from
		return this.push.apply(this, rest)
	}

	function validate(easeljsCanvas, box2dCanvas, details) {
		if (!(easeljsCanvas instanceof HTMLCanvasElement)) {
			throw new Error(arguments.callee.name + " : easeljsCanvas must be an instance of HTMLCanvasElement!")
		}
		if (!(box2dCanvas instanceof HTMLCanvasElement)) {
			throw new Error(arguments.callee.name + " : box2dCanvas must be an instance of HTMLCanvasElement!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The WorldManager details must be an object!")
			}
			for (let p in details) {
				if (_validWorldManagerDef.indexOf(p) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + p + ") is not supported! Valid definitions: " + _validWorldManagerDef)
				}
			}
			if (details.scale !== undefined && (typeof details.scale !== 'number' || details.scale <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for scale!")
			}
			if (details.world !== undefined && !(details.world instanceof box2d.b2World)) {
				throw new Error(arguments.callee.name + " : world must be an instance of box2d.b2World!")
			}

			if (details.stepOpts !== undefined) {
				if (typeof details.stepOpts !== 'object') {
					throw new Error(arguments.callee.name + " : stepOpts must be an object!")
				}
				for (let def in details.stepOpts) {
					if (_validWorldManagerStepOptsDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for stepOpts is not supported! Valid definitions: " + _validWorldManagerStepOptsDef)
					}
				}
				if (details.stepOpts.FPS !== undefined && (typeof details.stepOpts.FPS !== 'number' || details.stepOpts.FPS <= 0)) {
					throw new Error(arguments.callee.name + " : invalid number for FPS!")
				}
				if (details.stepOpts.velocityIterations !== undefined && (typeof details.stepOpts.velocityIterations !== 'number' || details.stepOpts.velocityIterations <= 0)) {
					throw new Error(arguments.callee.name + " : invalid number for velocityIterations!")
				}
				if (details.stepOpts.positionIterations !== undefined && (typeof details.stepOpts.positionIterations !== 'number' || details.stepOpts.positionIterations <= 0)) {
					throw new Error(arguments.callee.name + " : invalid number for positionIterations!")
				}
			}

			if (details.activeRender !== undefined && typeof details.activeRender !== 'boolean') {
				throw new Error(arguments.callee.name + " : activeRender must be a true/false!")
			}
			if (details.activeDebug !== undefined && typeof details.activeDebug !== 'boolean') {
				throw new Error(arguments.callee.name + " : activeDebug must be a true/false!")
			}
			if (details.tickMod !== undefined && (typeof details.tickMod !== 'number' || details.tickMod <= 0)) {
				throw new Error(arguments.callee.name + " : invalid number for tickMod!")
			}
			if (details.userOnTick !== undefined && typeof details.userOnTick !== 'function') {
				throw new Error(arguments.callee.name + " : userOnTick must be a function!")
			}

			if (details.fpsIndicator !== undefined) {
				if (typeof details.fpsIndicator !== 'object') {
					throw new Error(arguments.callee.name + " : fpsIndicator must be an object!")
				}
				for (let def in details.fpsIndicator) {
					if (_validWorldManagerFpsIndicatorDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validWorldManagerFpsIndicatorDef)
					}
				}
				if (details.fpsIndicator.enabled !== undefined && typeof details.fpsIndicator.enabled !== 'boolean') {
					throw new Error(arguments.callee.name + " : fpsIndicator.enabled must be true/false!")
				}
				if (details.fpsIndicator.x !== undefined && typeof details.fpsIndicator.x !== 'number') {
					throw new Error(arguments.callee.name + " : fpsIndicator.x must be a number!")
				}
				if (details.fpsIndicator.y !== undefined && typeof details.fpsIndicator.y !== 'number') {
					throw new Error(arguments.callee.name + " : fpsIndicator.y must be a number!")
				}
				if (details.fpsIndicator.font !== undefined && typeof details.fpsIndicator.font !== 'string') {
					throw new Error(arguments.callee.name + " : fpsIndicator.font must be a string! See EaselJS documentation: https://www.createjs.com/docs/easeljs/classes/Text.html")
				}
				if (details.fpsIndicator.color !== undefined && typeof details.fpsIndicator.color !== 'string') {
					throw new Error(arguments.callee.name + " : fpsIndicator.color must be a string! See EaselJS documentation: https://www.createjs.com/docs/easeljs/classes/Text.html")
				}
			}

			if (details.preLoad !== undefined) {
				if (typeof details.preLoad !== 'object') {
					throw new Error(arguments.callee.name + " : preLoad must be an object!")
				}
				for (let def in details.preLoad) {
					if (_validWorldManagerPreLoadDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for preLoad is not supported! Valid definitions: " + _validWorldManagerPreLoadDef)
					}
				}
				if (details.preLoad.files === undefined) {
					throw new Error(arguments.callee.name + " : an array of files to be preloaded must be informed!")
				}
				if (!(details.preLoad.files instanceof Array)) {
					throw new Error(arguments.callee.name + " : preLoad.files must be an Array!")
				}
				if (details.preLoad.files.length === 0) {
					throw new Error(arguments.callee.name + " : preLoad.files must have at least 1 file!")
				}
				if (details.preLoad.onComplete === undefined) {
					throw new Error(arguments.callee.name + " : a function must be informed to the property preLoad.onComplete!")
				}
				if (typeof details.preLoad.onComplete !== 'function') {
					throw new Error(arguments.callee.name + " : preLoad.onComplete must be a function!")
				}
				if (details.preLoad.showLoadingIndicator !== undefined && typeof details.preLoad.showLoadingIndicator !== 'boolean') {
					throw new Error(arguments.callee.name + " : preLoad.showLoadingIndicator must be a true/false!")
				}
			}
		}
	}

})()