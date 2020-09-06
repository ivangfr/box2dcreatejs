this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.Link = Link

	function Link(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validLinkDef = ['entityA', 'entityB', 'type', 'localAnchorA', 'localAnchorB', 'localAxisA', 'options']
	const _validJointTypes = ['distance', 'rope', 'revolute', 'prismatic', 'pulley', 'gear', 'line', 'weld']
	const _validJointDefOpts = ['collideConnected', 'dampingRatio', 'frequencyHz', 'length', 'maxLength',
		'enableMotor', 'motorSpeed', 'maxMotorTorque', 'maxMotorForce', 'lowerTranslation',
		'upperTranslation', 'enableLimit', 'referenceAngle', 'lowerAngle', 'upperAngle']

	let _worldManager

	function initialize(link, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		const jointDef = createJointDef(details)
		let joint = worldManager.getWorld().CreateJoint(jointDef)
		link.getJoint = function () { return joint }

		link.changeScale = function (scale) {
			_worldManager.getWorld().DestroyJoint(joint)

			if (details.localAnchorA !== undefined) {
				details.localAnchorA.x *= scale
				details.localAnchorA.y *= scale
			}

			if (details.localAnchorB !== undefined) {
				details.localAnchorB.x *= scale
				details.localAnchorB.y *= scale
			}

			if (details.localAxisA !== undefined) {
				details.localAxisA.x *= scale
				details.localAxisA.y *= scale
			}

			const jointDef = createJointDef(details)
			joint = worldManager.getWorld().CreateJoint(jointDef)
		}
	}

	function createJointDef(details) {
		const bodyA = details.entityA.b2body
		const bodyB = details.entityB.b2body

		let jointDef
		if (details.type === 'distance') {
			jointDef = handleDistanceJointDef(bodyA, bodyB, details)
		} else if (details.type === 'revolute') {
			jointDef = handleRevoluteJointDef(bodyA, bodyB, details)
		} else if (details.type === 'weld') {
			jointDef = handleWeldJointDef(bodyA, bodyB, details)
		} else if (details.type === 'rope') {
			// TODO
		} else if (details.type === 'prismatic') {
			jointDef = handlePrismaticJointDef(bodyA, bodyB, details)
		} else if (details.type === 'line') {
			jointDef = handleLineJointDef(bodyA, bodyB, details)
		} else if (details.type === 'pulley') {
			// TODO
		} else if (details.type === 'gear') {
			// TODO
		}

		if (details.options !== undefined) {
			for (let def in details.options) {
				jointDef[def] = details.options[def]
			}
		}
		return jointDef
	}

	function handleDistanceJointDef(bodyA, bodyB, details) {
		const bodyAWorldCenter = bodyA.GetWorldCenter()
		let x = bodyAWorldCenter.x
		let y = bodyAWorldCenter.y
		if (details && details.localAnchorA !== undefined) {
			x = details.localAnchorA.x || bodyAWorldCenter.x
			y = details.localAnchorA.y || bodyAWorldCenter.y
		}
		const localAnchorA = new box2d.b2Vec2(x, y)

		const bodyBWorldCenter = bodyB.GetWorldCenter()
		x = bodyBWorldCenter.x
		y = bodyBWorldCenter.y
		if (details && details.localAnchorB !== undefined) {
			x = details.localAnchorB.x || bodyBWorldCenter.x
			y = details.localAnchorB.y || bodyBWorldCenter.y
		}
		const localAnchorB = new box2d.b2Vec2(x, y)

		const jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef()
		jointDef.Initialize(bodyA, bodyB, localAnchorA, localAnchorB)
		//--
		//jointDef.bodyA = bodyA
		//jointDef.bodyB = bodyB
		//jointDef.localAnchorA = localAnchorA
		//jointDef.localAnchorB = localAnchorB
		//--
		return jointDef
	}

	function handleRevoluteJointDef(bodyA, bodyB, details) {
		let x = y = 0
		if (details && details.localAnchorA !== undefined) {
			x = details.localAnchorA.x || 0
			y = details.localAnchorA.y || 0
		}
		const localAnchorA = new box2d.b2Vec2(x, y)

		x = y = 0
		if (details && details.localAnchorB !== undefined) {
			x = details.localAnchorB.x || 0
			y = details.localAnchorB.y || 0
		}
		const localAnchorB = new box2d.b2Vec2(x, y)

		const jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef()
		//jointDef.Initialize(bodyA, bodyB, localAnchorA)
		//--
		jointDef.bodyA = bodyA
		jointDef.bodyB = bodyB
		jointDef.localAnchorA = localAnchorA
		jointDef.localAnchorB = localAnchorB
		//--
		return jointDef
	}

	function handleWeldJointDef(bodyA, bodyB, details) {
		const bodyAWorldCenter = bodyA.GetWorldCenter()
		let x = bodyAWorldCenter.x
		let y = bodyAWorldCenter.y
		if (details && details.localAnchorA !== undefined) {
			x = details.localAnchorA.x || bodyAWorldCenter.x
			y = details.localAnchorA.y || bodyAWorldCenter.y
		}
		const localAnchorA = new box2d.b2Vec2(x, y)

		const bodyBWorldCenter = bodyB.GetWorldCenter()
		x = bodyBWorldCenter.x
		y = bodyBWorldCenter.y
		if (details && details.localAnchorB !== undefined) {
			x = details.localAnchorB.x || bodyBWorldCenter.x
			y = details.localAnchorB.y || bodyBWorldCenter.y
		}
		const localAnchorB = new box2d.b2Vec2(x, y)

		const jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef()
		jointDef.Initialize(bodyA, bodyB, localAnchorA)
		//--
		//jointDef.bodyA = bodyA
		//jointDef.bodyB = bodyB
		//jointDef.localAnchorA = localAnchorA
		//jointDef.localAnchorB = localAnchorB
		//--
		return jointDef
	}

	function handlePrismaticJointDef(bodyA, bodyB, details) {
		let x = y = 0
		if (details && details.localAnchorA !== undefined) {
			x = details.localAnchorA.x || 0
			y = details.localAnchorA.y || 0
		}
		const localAnchorA = new box2d.b2Vec2(x, y)

		x = y = 0
		if (details && details.localAxisA !== undefined) {
			x = details.localAxisA.x || 0
			y = details.localAxisA.y || 0
		}
		const localAxisA = new box2d.b2Vec2(x, y)

		const jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef()
		//jointDef.Initialize(bodyA, bodyB, localAnchorA, localAxisA)
		//--
		jointDef.bodyA = bodyA
		jointDef.bodyB = bodyB
		jointDef.localAnchorA = localAnchorA
		jointDef.localAxisA = localAxisA
		//--
		return jointDef
	}

	function handleLineJointDef(bodyA, bodyB, details) {
		let x = y = 0
		if (details && details.localAnchorA !== undefined) {
			x = details.localAnchorA.x || 0
			y = details.localAnchorA.y || 0
		}
		const localAnchorA = new box2d.b2Vec2(x, y)

		x = y = 0
		if (details && details.localAxisA !== undefined) {
			x = details.localAxisA.x || 0
			y = details.localAxisA.y || 0
		}
		const localAxisA = new box2d.b2Vec2(x, y)

		const jointDef = new Box2D.Dynamics.Joints.b2LineJointDef()
		//jointDef.Initialize(bodyA, bodyB, localAnchorA, localAxisA)
		//--
		jointDef.bodyA = bodyA
		jointDef.bodyB = bodyB
		jointDef.localAnchorA = localAnchorA
		jointDef.localAxisA = localAxisA
		//--
		return jointDef
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The Link details must be an object!")
			}
			for (let def in details) {
				if (_validLinkDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Link is not supported! Valid definitions: " + _validLinkDef)
				}
			}

			if (details.entityA === undefined) {
				throw new Error(arguments.callee.name + " : entityA must be informed!")
			}
			if (!(details.entityA instanceof MyGameBuilder.Entity)) {
				throw new Error(arguments.callee.name + " : entityA must be an instance of Entity!")
			}

			if (details.entityB === undefined) {
				throw new Error(arguments.callee.name + " : entityB must be informed!")
			}
			if (!(details.entityB instanceof MyGameBuilder.Entity)) {
				throw new Error(arguments.callee.name + " : entityB must be an instance of Entity!")
			}

			if (details.type === undefined) {
				throw new Error(arguments.callee.name + " : type must be informed!")
			}
			if (typeof details.type !== 'string') {
				throw new Error(arguments.callee.name + " : type must be a string!")
			}
			if (_validJointTypes.indexOf(details.type) < 0) {
				throw new Error(arguments.callee.name + " : type must be " + _validJointTypes + "!")
			}

			if (details.localAnchorA !== undefined) {
				if (typeof details.localAnchorA !== 'object') {
					throw new Error(arguments.callee.name + " : The localAnchorA must be an object!")
				}
				if (details.localAnchorA.x === undefined) {
					throw new Error(arguments.callee.name + " : localAnchorA.x must be informed!")
				}
				if (typeof details.localAnchorA.x !== 'number') {
					throw new Error(arguments.callee.name + " : localAnchorA.x must be a number!")
				}
				if (details.localAnchorA.y === undefined) {
					throw new Error(arguments.callee.name + " : localAnchorA.y must be informed!")
				}
				if (typeof details.localAnchorA.y !== 'number') {
					throw new Error(arguments.callee.name + " : localAnchorA.y must be a number!")
				}
			}

			if (details.localAnchorB !== undefined) {
				if (typeof details.localAnchorB !== 'object') {
					throw new Error(arguments.callee.name + " : The localAnchorB must be an object!")
				}
				if (details.localAnchorB.x === undefined) {
					throw new Error(arguments.callee.name + " : localAnchorB.x must be informed!")
				}
				if (typeof details.localAnchorB.x !== 'number') {
					throw new Error(arguments.callee.name + " : localAnchorB.x must be a number!")
				}
				if (details.localAnchorB.y === undefined) {
					throw new Error(arguments.callee.name + " : localAnchorB.y must be informed!")
				}
				if (typeof details.localAnchorB.y !== 'number') {
					throw new Error(arguments.callee.name + " : localAnchorB.y must be a number!")
				}
			}

			if (details.localAxisA !== undefined) {
				if (typeof details.localAxisA !== 'object') {
					throw new Error(arguments.callee.name + " : The localAxisA must be an object!")
				}
				if (details.localAxisA.x === undefined) {
					throw new Error(arguments.callee.name + " : localAxisA.x must be informed!")
				}
				if (typeof details.localAxisA.x !== 'number') {
					throw new Error(arguments.callee.name + " : localAxisA.x must be a number!")
				}
				if (details.localAxisA.y === undefined) {
					throw new Error(arguments.callee.name + " : localAxisA.y must be informed!")
				}
				if (typeof details.localAxisA.y !== 'number') {
					throw new Error(arguments.callee.name + " : localAxisA.y must be a number!")
				}
			}

			if (details.options !== undefined) {
				if (typeof details.options !== 'object') {
					throw new Error(arguments.callee.name + " : options must be an object!")
				}
				for (let def in details.options) {
					if (_validJointDefOpts.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the details.options (" + def + ") for joint is not supported! Valid definitions: " + _validJointDefOpts)
					}
				}
			}
		}
	}

})()
