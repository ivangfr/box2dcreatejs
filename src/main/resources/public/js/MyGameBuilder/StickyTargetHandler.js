this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.StickyTargetHandler = StickyTargetHandler

	function StickyTargetHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validStickyTargetDef = ['preSolveStick']

	let _worldManager
	let _preSolveStick
	let _targetStickyObjectContacts

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager
		_targetStickyObjectContacts = []
		_preSolveStick = (details && details.preSolveStick !== undefined) ? details.preSolveStick : false
	}

	StickyTargetHandler.prototype.IsStickyTargetContactType = function (contact) {
		const fixAUserData = contact.GetFixtureA().GetUserData()
		const fixBUserData = contact.GetFixtureB().GetUserData()
		return (fixAUserData.isSticky && fixBUserData.isTarget) || (fixBUserData.isSticky && fixAUserData.isTarget)
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

	StickyTargetHandler.prototype.postSolveStickyTargetContact = function (contact, impulse) {
		const objects = getStickyTargetFromContact(contact)
		const stickyObject = objects.stickyObject
		const target = objects.target

		if (impulse.normalImpulses[0] > target.GetUserData().hardness) {
			console.log('Post - Fixed! ' + 'Impulse ' + impulse.normalImpulses[0] + ' ' + impulse.normalImpulses[1])
			addTargetStickyObjectContact(target, stickyObject)
		}
		else {
			console.log('Post - Not Fixed! ' + 'Impulse ' + impulse.normalImpulses[0] + ' ' + impulse.normalImpulses[1])
		}
	}

	StickyTargetHandler.prototype.preSolveStickyTargetContact = function (contact, oldManifold) {
		const objects = getStickyTargetFromContact(contact)
		const stickyObject = objects.stickyObject
		const target = objects.target

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
				console.log('Pre - Fixed! ' + 'Impulse ' + impulse)
				addTargetStickyObjectContact(target, stickyObject)
			}
			else {
				console.log('Pre - Not Fixed! ' + 'Impulse ' + impulse)
			}

			//This doesn't execute the PostSolve
			contact.SetEnabled(false)
		}
	}

	StickyTargetHandler.prototype.endContactStickyTarget = function (contact) {
		const objects = getStickyTargetFromContact(contact)
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

		console.log('end x:' + x + '- y:' + y)

		// Create a small yellow dot
		_worldManager.createLandscape({
			x: x, y: y,
			shape: 'circle',
			circleOpts: { radius: 2 },
			render: {
				z: _worldManager.getEaseljsStage().numChildren,
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'solid',
					bgSolidColorOpts: { color: 'yellow' }
				}
			}
		})
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

	StickyTargetHandler.prototype.update = function () {
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

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
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