this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.StickyTargetHandler = StickyTargetHandler

	function StickyTargetHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	// TODO - postSolveStick works better than preSolveStick
	// Maybe, on the next changes, remove preSolveStick
	const _validStickyTargetDef = ['preSolveStick']

	let _worldManager
	let _preSolveStick
	let _targetStickyObjectContacts
	let _debugHitDots

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager
		_targetStickyObjectContacts = []
		_preSolveStick = (details && details.preSolveStick !== undefined) ? details.preSolveStick : false
		_debugHitDots = []
	}

	StickyTargetHandler.prototype.IsStickyTargetContactType = function (contact) {
		const fixAUserData = contact.GetFixtureA().GetUserData()
		const fixBUserData = contact.GetFixtureB().GetUserData()
		return (fixAUserData.isSticky && fixBUserData.isTarget) || (fixBUserData.isSticky && fixAUserData.isTarget)
	}

	StickyTargetHandler.prototype.postSolveStickyTargetContact = function (contact, impulse) {
		const { stickyObject, target } = getStickyTargetFromContact(contact)
		if (impulse.normalImpulses[0] > target.GetUserData().hardness) {
			addTargetStickyObjectContact(target, stickyObject)
		}
	}

	StickyTargetHandler.prototype.preSolveStickyTargetContact = function (contact, oldManifold) {
		const { stickyObject, target } = getStickyTargetFromContact(contact)

		stickyObject.GetBody().SetBullet(true)
		stickyObject.SetRestitution(0)
		stickyObject.SetFriction(1)
		target.SetRestitution(0)
		target.SetFriction(1)

		if (_preSolveStick) {
			const worldManifold = new Box2D.Collision.b2WorldManifold()
			contact.GetWorldManifold(worldManifold)

			const vel1 = target.GetBody().GetLinearVelocity()
			const vel2 = stickyObject.GetBody().GetLinearVelocity()
			const impactVelocity = box2d.b2Math.SubtractVV(vel1, vel2)

			const approachVelocity = box2d.b2Math.Dot(worldManifold.m_normal, impactVelocity)
			const impulse = Math.abs(approachVelocity * stickyObject.GetBody().GetMass())
			if (impulse > target.GetUserData().hardness) {
				addTargetStickyObjectContact(target, stickyObject)
			}

			//This doesn't execute the PostSolve
			contact.SetEnabled(false)
		}
	}

	StickyTargetHandler.prototype.endContactStickyTarget = function (contact) {
		const worldManifold = new Box2D.Collision.b2WorldManifold()
		contact.GetWorldManifold(worldManifold)

		let x = worldManifold.m_points[0].x
		if (worldManifold.m_points[1].x > 0) {
			x = (x + worldManifold.m_points[1].x) / 2
		}
		x *= _worldManager.getScale()

		let y = worldManifold.m_points[0].y
		if (worldManifold.m_points[1].y > 0) {
			y = (y + worldManifold.m_points[1].y) / 2
		}
		y *= _worldManager.getScale()

		_debugHitDots.push({ x, y })
	}

	StickyTargetHandler.prototype.update = function () {
		if (_worldManager.getEnableDebug()) {
			_debugHitDots.forEach(dot => drawDebugHitDot(dot))
		}

		_targetStickyObjectContacts.forEach(contact => {
			//set the joint anchors at the arrow tip - should be good enough
			const worldCoordsAnchorPoint = contact.stickyObject.GetBody().GetWorldPoint(new box2d.b2Vec2(0, 0))

			const weldJointDef = new Box2D.Dynamics.Joints.b2WeldJointDef()
			weldJointDef.bodyA = contact.target.GetBody()
			weldJointDef.bodyB = contact.stickyObject.GetBody()
			weldJointDef.localAnchorA = weldJointDef.bodyA.GetLocalPoint(worldCoordsAnchorPoint)
			weldJointDef.localAnchorB = weldJointDef.bodyB.GetLocalPoint(worldCoordsAnchorPoint)
			weldJointDef.referenceAngle = weldJointDef.bodyB.GetAngle() - weldJointDef.bodyA.GetAngle()

			_worldManager.getWorld().CreateJoint(weldJointDef)
		})
		_targetStickyObjectContacts = []
	}

	function getStickyTargetFromContact(contact) {
		const fixA = contact.GetFixtureA()
		const fixB = contact.GetFixtureB()

		let stickyObject, target
		if (fixA.GetUserData().isTarget) {
			target = fixA
			stickyObject = fixB
		}
		else {
			target = fixB
			stickyObject = fixA
		}
		return { stickyObject, target }
	}

	function addTargetStickyObjectContact(target, stickyObject) {
		_targetStickyObjectContacts.push({ target, stickyObject })
	}

	function deleteTargetStickyObjectContact(target, stickyObject) {
		let idx = -1
		for (let i = 0; i < _targetStickyObjectContacts.length; i++) {
			const contactPair = _targetStickyObjectContacts[i]
			if (contactPair.target === target && contactPair.stickyObject === stickyObject) {
				idx = i
				break
			}
		}
		if (idx >= 0) {
			_targetStickyObjectContacts.remove(idx)
		}
	}

	function drawDebugHitDot(dot) {
		const radius = 2
		const c = _worldManager.getBox2dCanvasCtx()
		c.beginPath()
		c.fillStyle = "yellow"
		c.arc(dot.x, dot.y, radius, 0, Math.PI * 2, true)
		c.fill()
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}
		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The StickyTargetHandler details must be an object!")
			}
			for (let def in details) {
				if (_validStickyTargetDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for StickyTargetHandler is not supported! Valid definitions: " + _validStickyTargetDef)
				}
			}
			if (details.preSolveStick !== undefined && typeof details.preSolveStick !== 'boolean') {
				throw new Error(arguments.callee.name + " : preSolveStick must be true/false!")
			}
		}
	}

})()