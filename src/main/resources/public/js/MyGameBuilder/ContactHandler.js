this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.ContactHandler = ContactHandler;

	function ContactHandler(worldManager, details) {
		initialize(this, worldManager, details);
	}

	var _validContactHandlerDef = ['enabledBuoyancy', 'enabledStickyTarget', 'enabledBreak',
		'buoyancyOpts', 'stickyTargetOpts', 'breakOpts',
		'beginContact', 'endContact', 'preSolve', 'postSolve'];

	var _worldManager;

	function initialize(contactHandler, worldManager, details) {
		_worldManager = worldManager;

		var listener = new Box2D.Dynamics.b2ContactListener;

		var userBeginContact;
		if (details && details.beginContact !== undefined)
			userBeginContact = details.beginContact;

		var userEndContact;
		if (details && details.endContact !== undefined)
			userEndContact = details.endContact;

		var userPreSolve;
		if (details && details.preSolve !== undefined)
			userPreSolve = details.preSolve;

		var userPostSolve;
		if (details && details.postSolve !== undefined)
			userPostSolve = details.postSolve;

		var enabledBuoyancy = true;
		if (details && details.enabledBuoyancy !== undefined)
			enabledBuoyancy = details.enabledBuoyancy;
		contactHandler.isEnabledBuoyancy = function () {
			return enabledBuoyancy;
		}

		var buoyancyHandler;
		if (enabledBuoyancy) {
			var buoyancyOpts = {};
			if (details !== undefined && details.buoyancyOpts != undefined)
				buoyancyOpts = details.buoyancyOpts;

			buoyancyHandler = new MyGameBuilder.BuoyancyHandler(worldManager, buoyancyOpts);
		}
		contactHandler.getBuoyancyHandler = function () {
			return buoyancyHandler;
		}

		var enabledStickyTarget = true;
		if (details && details.enabledStickyTarget !== undefined)
			enabledStickyTarget = details.enabledStickyTarget;
		contactHandler.isEnabledStickyTarget = function () {
			return enabledStickyTarget;
		}

		var stickyTargetHandler;
		if (enabledStickyTarget) {
			var stickyTargetOpts = {};
			if (details !== undefined && details.stickyTargetOpts != undefined)
				stickyTargetOpts = details.stickyTargetOpts;

			stickyTargetHandler = new MyGameBuilder.StickyTargetHandler(worldManager, stickyTargetOpts);
		}
		contactHandler.getStickyTargetHandler = function () {
			return stickyTargetHandler;
		}

		var enabledBreak = true;
		if (details && details.enabledBreak !== undefined)
			enabledBreak = details.enabledBreak;
		contactHandler.isEnabledBreak = function () {
			return enabledBreak;
		}

		var breakHandler;
		if (enabledBreak) {
			var breakOpts = {};
			if (details !== undefined && details.breakOpts != undefined)
				breakOpts = details.breakOpts;

			breakHandler = new MyGameBuilder.BreakHandler(worldManager, breakOpts);
		}
		contactHandler.getBreakHandler = function () {
			return breakHandler;
		}

		var entitiesToBeBroken = [];
		contactHandler.getEntitiesToBeBroken = function () {
			return entitiesToBeBroken;
		}

		//== BeginContact ===========================================================================

		listener.BeginContact = function (contact) {

			//-- Buoyancy ------------------------------------------------------------
			if (enabledBuoyancy && buoyancyHandler.IsBuoyancyContactType(contact))
				buoyancyHandler.beginContactBuoyancy(contact);
			//------------------------------------------------------------------------

			//-- User Event ----------------------------------------------------------
			if (userBeginContact !== undefined)
				userBeginContact(contact);
			//------------------------------------------------------------------------			
		}

		//==========================================================================================		


		//== EndContact ============================================================================

		listener.EndContact = function (contact) {

			//-- Buoyancy ------------------------------------------------------------			
			if (enabledBuoyancy && buoyancyHandler.IsBuoyancyContactType(contact))
				buoyancyHandler.endContactBuoyancy(contact);
			//------------------------------------------------------------------------			

			//-- StickyTarget---------------------------------------------------------			
			if (enabledStickyTarget && stickyTargetHandler.IsStickyTargetContactType(contact))
				stickyTargetHandler.endContactStickyTarget(contact);
			//------------------------------------------------------------------------

			//-- User Event ----------------------------------------------------------			
			if (userEndContact !== undefined)
				userEndContact(contact);
			//------------------------------------------------------------------------
		}

		//==========================================================================================


		//== PostSolve =============================================================================

		listener.PostSolve = function (contact, impulse) {

			//-- StickyTarget---------------------------------------------------------			
			if (enabledStickyTarget && stickyTargetHandler.IsStickyTargetContactType(contact))
				stickyTargetHandler.postSolveStickyTargetContact(contact, impulse);
			//------------------------------------------------------------------------			

			//-- User Event ----------------------------------------------------------
			if (userPostSolve !== undefined)
				userPostSolve(contact, impulse);
			//------------------------------------------------------------------------
		}

		//==========================================================================================


		//== PreSolve ==============================================================================

		listener.PreSolve = function (contact, oldManifold) {

			//-- StickyTarget---------------------------------------------------------			
			if (enabledStickyTarget && stickyTargetHandler.IsStickyTargetContactType(contact))
				stickyTargetHandler.preSolveStickyTargetContact(contact, oldManifold);
			//------------------------------------------------------------------------			

			//-- User Event ----------------------------------------------------------
			if (userPreSolve !== undefined)
				userPreSolve(contact, oldManifold);
			//------------------------------------------------------------------------
		}

		//==========================================================================================

		_worldManager.getWorld().SetContactListener(listener);
	}

	ContactHandler.prototype.update = function () {
		if (this.isEnabledBuoyancy())
			this.getBuoyancyHandler().update();

		if (this.isEnabledStickyTarget())
			this.getStickyTargetHandler().update();

		if (this.isEnabledBreak()) {
			var breakEntities = this.getEntitiesToBeBroken();
			while (breakEntities.length > 0) {
				var breakEntity = breakEntities.shift();
				this.getBreakHandler().breakEntity(breakEntity.entity, breakEntity.x, breakEntity.y, breakEntity.angle);
			}
		}
	}

	ContactHandler.prototype.addEntityToBeBroken = function (entity, x, y, angle) {
		var player = _worldManager.getPlayer();
		var adjustX = 0, adjustY = 0;
		if (player) {
			adjustX = player.getCameraAdjust().adjustX;
			adjustY = player.getCameraAdjust().adjustY;
		}

		var breakEntity = {};
		breakEntity.entity = entity;
		breakEntity.x = x - adjustX;
		breakEntity.y = y - adjustY;
		breakEntity.angle = angle
		this.getEntitiesToBeBroken().push(breakEntity);
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details !== undefined) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : The ContactHandler details must be an object!");

			for (var def in details)
				if (_validContactHandlerDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for ContactHandler is not supported! Valid definitions: " + _validContactHandlerDef);

			if (details.enabledBuoyancy !== undefined && typeof details.enabledBuoyancy != 'boolean')
				throw new Error(arguments.callee.name + " : enabledBuoyancy must be true/false!");

			if (details.enabledStick !== undefined && typeof details.enabledStick != 'boolean')
				throw new Error(arguments.callee.name + " : enabledStick must be true/false!");

			if (details.enabledBreak !== undefined && typeof details.enabledBreak != 'boolean')
				throw new Error(arguments.callee.name + " : enabledBreak must be true/false!");

			if (details.beginContact !== undefined && typeof details.beginContact != 'function')
				throw new Error(arguments.callee.name + " : beginContact must be a function!");

			if (details.endContact !== undefined && typeof details.endContact != 'function')
				throw new Error(arguments.callee.name + " : endContact must be a function!");

			if (details.preSolve !== undefined && typeof details.preSolve != 'function')
				throw new Error(arguments.callee.name + " : preSolve must be a function!");

			if (details.postSolve !== undefined && typeof details.postSolve != 'function')
				throw new Error(arguments.callee.name + " : postSolve must be a function!");
		}
	}

})();