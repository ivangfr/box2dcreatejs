this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.ContactHandler = ContactHandler

	function ContactHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validContactHandlerDef = ['enabledBuoyancy', 'enabledStickyTarget', 'enabledBreak',
		'buoyancyOpts', 'stickyTargetOpts', 'breakOpts',
		'beginContact', 'endContact', 'preSolve', 'postSolve']

	let _worldManager

	function initialize(contactHandler, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		const contactListener = new Box2D.Dynamics.b2ContactListener

		let userBeginContact
		if (details && details.beginContact !== undefined) {
			userBeginContact = details.beginContact
		}

		let userEndContact
		if (details && details.endContact !== undefined) {
			userEndContact = details.endContact
		}

		let userPreSolve
		if (details && details.preSolve !== undefined) {
			userPreSolve = details.preSolve
		}

		let userPostSolve
		if (details && details.postSolve !== undefined) {
			userPostSolve = details.postSolve
		}

		const enabledBuoyancy = (details && details.enabledBuoyancy !== undefined) ? details.enabledBuoyancy : true
		contactHandler.isEnabledBuoyancy = function () { return enabledBuoyancy }

		let buoyancyHandler
		if (enabledBuoyancy) {
			const buoyancyOpts = (details !== undefined && details.buoyancyOpts !== undefined) ? details.buoyancyOpts : {}
			buoyancyHandler = new MyGameBuilder.BuoyancyHandler(worldManager, buoyancyOpts)
		}
		contactHandler.getBuoyancyHandler = function () { return buoyancyHandler }

		const enabledStickyTarget = (details && details.enabledStickyTarget !== undefined) ? details.enabledStickyTarget : true
		contactHandler.isEnabledStickyTarget = function () { return enabledStickyTarget }

		let stickyTargetHandler
		if (enabledStickyTarget) {
			const stickyTargetOpts = (details !== undefined && details.stickyTargetOpts !== undefined) ? details.stickyTargetOpts : {}
			stickyTargetHandler = new MyGameBuilder.StickyTargetHandler(worldManager, stickyTargetOpts)
		}
		contactHandler.getStickyTargetHandler = function () { return stickyTargetHandler }

		const enabledBreak = (details && details.enabledBreak !== undefined) ? details.enabledBreak : true
		contactHandler.isEnabledBreak = function () { return enabledBreak }

		let breakHandler
		if (enabledBreak) {
			const breakOpts = (details !== undefined && details.breakOpts !== undefined) ? details.breakOpts : {}
			breakHandler = new MyGameBuilder.BreakHandler(worldManager, breakOpts)
		}
		contactHandler.getBreakHandler = function () { return breakHandler }

		const entitiesToBeBroken = []
		contactHandler.getEntitiesToBeBroken = function () { return entitiesToBeBroken }

		//== BeginContact ===========================================================================

		contactListener.BeginContact = function (contact) {

			//-- Buoyancy
			if (enabledBuoyancy && buoyancyHandler.IsBuoyancyContactType(contact)) {
				buoyancyHandler.beginContactBuoyancy(contact)
			}

			//-- User Event
			if (userBeginContact !== undefined) {
				userBeginContact(contact)
			}
		}

		//== EndContact ============================================================================

		contactListener.EndContact = function (contact) {

			//-- Buoyancy
			if (enabledBuoyancy && buoyancyHandler.IsBuoyancyContactType(contact)) {
				buoyancyHandler.endContactBuoyancy(contact)
			}

			//-- StickyTarget
			if (enabledStickyTarget && stickyTargetHandler.IsStickyTargetContactType(contact)) {
				stickyTargetHandler.endContactStickyTarget(contact)
			}

			//-- User Event
			if (userEndContact !== undefined) {
				userEndContact(contact)
			}
		}

		//== PostSolve =============================================================================

		contactListener.PostSolve = function (contact, impulse) {

			//-- StickyTarget
			if (enabledStickyTarget && stickyTargetHandler.IsStickyTargetContactType(contact)) {
				stickyTargetHandler.postSolveStickyTargetContact(contact, impulse)
			}

			//-- User Event
			if (userPostSolve !== undefined) {
				userPostSolve(contact, impulse)
			}
		}

		//== PreSolve ==============================================================================

		contactListener.PreSolve = function (contact, oldManifold) {

			//-- StickyTarget
			if (enabledStickyTarget && stickyTargetHandler.IsStickyTargetContactType(contact)) {
				stickyTargetHandler.preSolveStickyTargetContact(contact, oldManifold)
			}

			//-- User Event
			if (userPreSolve !== undefined) {
				userPreSolve(contact, oldManifold)
			}
		}

		_worldManager.getWorld().SetContactListener(contactListener)
	}

	ContactHandler.prototype.update = function () {
		if (this.isEnabledBuoyancy()) {
			this.getBuoyancyHandler().update()
		}

		if (this.isEnabledStickyTarget()) {
			this.getStickyTargetHandler().update()
		}

		if (this.isEnabledBreak()) {
			const breakEntities = this.getEntitiesToBeBroken()
			while (breakEntities.length > 0) {
				const breakEntity = breakEntities.shift()
				this.getBreakHandler().breakEntity(breakEntity.entity, breakEntity.x, breakEntity.y, breakEntity.angle)
			}
		}
	}

	ContactHandler.prototype.addEntityToBeBroken = function (entity, x, y, angle) {
		const { adjustX, adjustY } = _worldManager.getCameraAdjust()

		const breakEntity = {}
		breakEntity.entity = entity
		breakEntity.x = x - adjustX
		breakEntity.y = y - adjustY
		breakEntity.angle = angle
		
		this.getEntitiesToBeBroken().push(breakEntity)
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The ContactHandler details must be an object!")
			}
			for (let def in details) {
				if (_validContactHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for ContactHandler is not supported! Valid definitions: " + _validContactHandlerDef)
				}
			}

			if (details.enabledBuoyancy !== undefined && typeof details.enabledBuoyancy !== 'boolean') {
				throw new Error(arguments.callee.name + " : enabledBuoyancy must be true/false!")
			}
			if (details.enabledStick !== undefined && typeof details.enabledStick !== 'boolean') {
				throw new Error(arguments.callee.name + " : enabledStick must be true/false!")
			}
			if (details.enabledBreak !== undefined && typeof details.enabledBreak !== 'boolean') {
				throw new Error(arguments.callee.name + " : enabledBreak must be true/false!")
			}

			if (details.buoyancyOpts !== undefined && typeof details.buoyancyOpts !== 'object') {
				throw new Error(arguments.callee.name + " : buoyancyOpts must be informed!")
			}
			if (details.stickyTargetOpts !== undefined && typeof details.stickyTargetOpts !== 'object') {
				throw new Error(arguments.callee.name + " : stickyTargetOpts must be informed!")
			}
			if (details.breakOpts !== undefined && typeof details.breakOpts !== 'object') {
				throw new Error(arguments.callee.name + " : breakOpts must be informed!")
			}

			if (details.beginContact !== undefined && typeof details.beginContact !== 'function') {
				throw new Error(arguments.callee.name + " : beginContact must be a function!")
			}
			if (details.endContact !== undefined && typeof details.endContact !== 'function') {
				throw new Error(arguments.callee.name + " : endContact must be a function!")
			}
			if (details.preSolve !== undefined && typeof details.preSolve !== 'function') {
				throw new Error(arguments.callee.name + " : preSolve must be a function!")
			}
			if (details.postSolve !== undefined && typeof details.postSolve !== 'function') {
				throw new Error(arguments.callee.name + " : postSolve must be a function!")
			}
		}
	}

})()