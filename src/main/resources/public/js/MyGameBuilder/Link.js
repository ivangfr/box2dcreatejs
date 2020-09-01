this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.Link = Link;

	function Link(worldManager, details) {
		initialize(this, worldManager, details);
	}

	var _validLinkDef = ['entityA', 'entityB', 'type', 'localAnchorA', 'localAnchorB', 'localAxisA', 'options'];

	var _validJointTypes = ['distance', 'rope', 'revolute', 'prismatic', 'pulley', 'gear', 'line', 'weld'];

	var _validJointDefOpts = ['collideConnected', 'dampingRatio', 'frequencyHz', 'length', 'maxLength',
		'enableMotor', 'motorSpeed', 'maxMotorTorque', 'maxMotorForce', 'lowerTranslation',
		'upperTranslation', 'enableLimit', 'referenceAngle', 'lowerAngle', 'upperAngle'];

	var _worldManager;

	function initialize(link, worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;

		var jointDef = createJointDef(details);

		var joint = worldManager.getWorld().CreateJoint(jointDef);
		link.getJoint = function () {
			return joint;
		}

		link.changeScale = function (scale) {
			_worldManager.getWorld().DestroyJoint(joint);

			if (details.localAnchorA !== undefined) {
				details.localAnchorA.x *= scale;
				details.localAnchorA.y *= scale;
			}

			if (details.localAnchorB !== undefined) {
				details.localAnchorB.x *= scale;
				details.localAnchorB.y *= scale;
			}

			if (details.localAxisA !== undefined) {
				details.localAxisA.x *= scale;
				details.localAxisA.y *= scale;
			}

			var jointDef = createJointDef(details);

			joint = worldManager.getWorld().CreateJoint(jointDef);
		}
	}

	function createJointDef(details) {
		var jointDef;

		var bodyA = details.entityA.b2body;
		var bodyB = details.entityB.b2body;

		var x, y;

		switch (details.type) {
			case 'distance':
				jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();

				x = bodyA.GetWorldCenter().x;
				y = bodyA.GetWorldCenter().y;
				if (details && details.localAnchorA) {
					x = details.localAnchorA.x;
					y = details.localAnchorA.y;
				}
				var localAnchorA = new box2d.b2Vec2(x, y);

				x = bodyB.GetWorldCenter().x;
				y = bodyB.GetWorldCenter().y;
				if (details && details.localAnchorB) {
					x = details.localAnchorB.x;
					y = details.localAnchorB.y;
				}
				var localAnchorB = new box2d.b2Vec2(x, y);

				jointDef.Initialize(bodyA, bodyB, localAnchorA, localAnchorB);
				//--
				//jointDef.bodyA = bodyA;
				//jointDef.bodyB = bodyB;
				//jointDef.localAnchorA = localAnchorA;
				//jointDef.localAnchorB = localAnchorB;
				//--

				break;

			case 'revolute':
				jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();

				x = 0;
				y = 0;
				if (details && details.localAnchorA) {
					x = details.localAnchorA.x;
					y = details.localAnchorA.y;
				}
				var localAnchorA = new box2d.b2Vec2(x, y);

				x = 0;
				y = 0;
				if (details && details.localAnchorB) {
					x = details.localAnchorB.x;
					y = details.localAnchorB.y;
				}
				var localAnchorB = new box2d.b2Vec2(x, y);

				//jointDef.Initialize(bodyA, bodyB, localAnchorA);
				//--
				jointDef.bodyA = bodyA;
				jointDef.bodyB = bodyB;
				jointDef.localAnchorA = localAnchorA;
				jointDef.localAnchorB = localAnchorB;
				//--

				break;

			case 'weld':
				jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();

				x = bodyA.GetWorldCenter().x;
				y = bodyA.GetWorldCenter().y;
				if (details && details.localAnchorA) {
					x = details.localAnchorA.x;
					y = details.localAnchorA.y;
				}
				var localAnchorA = new box2d.b2Vec2(x, y);

				x = bodyB.GetWorldCenter().x;
				y = bodyB.GetWorldCenter().y;
				if (details && details.localAnchorB) {
					x = details.localAnchorB.x;
					y = details.localAnchorB.y;
				}
				var localAnchorB = new box2d.b2Vec2(x, y);

				jointDef.Initialize(bodyA, bodyB, localAnchorA);
				//--
				//jointDef.bodyA = bodyA;
				//jointDef.bodyB = bodyB;
				//jointDef.localAnchorA = localAnchorA;
				//jointDef.localAnchorB = localAnchorB;
				//--			
				break;

			case 'rope':
				break;

			case 'prismatic':
				jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();

				x = 0;
				y = 0;
				if (details && details.localAnchorA) {
					x = details.localAnchorA.x;
					y = details.localAnchorA.y;
				}
				var localAnchorA = new box2d.b2Vec2(x, y);

				x = 0;
				y = 0;
				if (details && details.localAxisA) {
					x = details.localAxisA.x || 0;
					y = details.localAxisA.y || 0
				}
				var localAxisA = new box2d.b2Vec2(x, y);

				//jointDef.Initialize(bodyA, bodyB, localAnchorA, localAxisA);
				//--
				jointDef.bodyA = bodyA;
				jointDef.bodyB = bodyB;
				jointDef.localAnchorA = localAnchorA;
				jointDef.localAxisA = localAxisA;
				//--

				break;

			case 'line':
				jointDef = new Box2D.Dynamics.Joints.b2LineJointDef();

				x = 0;
				y = 0;
				if (details && details.localAnchorA) {
					x = details.localAnchorA.x;
					y = details.localAnchorA.y;
				}
				var localAnchorA = new box2d.b2Vec2(x, y);

				x = 0;
				y = 0;
				if (details && details.localAxisA) {
					x = details.localAxisA.x || 0;
					y = details.localAxisA.y || 0;
				}
				var localAxisA = new box2d.b2Vec2(x, y);

				//jointDef.Initialize(bodyA, bodyB, localAnchorA, localAxisA);
				//--
				jointDef.bodyA = bodyA;
				jointDef.bodyB = bodyB;
				jointDef.localAnchorA = localAnchorA;
				jointDef.localAxisA = localAxisA;
				//--	

				break;

			case 'pulley':
				break;

			case 'gear':
				break;
		}

		if (details.options) {
			for (var def in details.options)
				jointDef[def] = details.options[def];
		}

		return jointDef;
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details !== undefined) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : The Link details must be an object!");

			for (var def in details)
				if (_validLinkDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Link is not supported! Valid definitions: " + _validLinkDef);

			if (details.entityA === undefined)
				throw new Error(arguments.callee.name + " : entityA must be informed!");
			else if (!(details.entityA instanceof MyGameBuilder.Entity))
				throw new Error(arguments.callee.name + " : entityA must be an instance of Entity!");

			if (details.entityB === undefined)
				throw new Error(arguments.callee.name + " : entityB must be informed!");
			else if (!(details.entityB instanceof MyGameBuilder.Entity))
				throw new Error(arguments.callee.name + " : entityB must be an instance of Entity!");

			if (details.type === undefined)
				throw new Error(arguments.callee.name + " : type must be informed!");
			else if (typeof details.type !== 'string')
				throw new Error(arguments.callee.name + " : type must be a string!");
			else if (_validJointTypes.indexOf(details.type) < 0)
				throw new Error(arguments.callee.name + " : type must be " + _validJointTypes + "!");

			if (details.localAnchorA !== undefined) {
				if (typeof details.localAnchorA !== 'object')
					throw new Error(arguments.callee.name + " : The localAnchorA must be an object!");
				else {
					if (details.localAnchorA.x === undefined)
						throw new Error(arguments.callee.name + " : localAnchorA.x must be informed!");
					else if (typeof details.localAnchorA.x != 'number')
						throw new Error(arguments.callee.name + " : localAnchorA.x must be a number!");

					if (details.localAnchorA.y === undefined)
						throw new Error(arguments.callee.name + " : localAnchorA.y must be informed!");
					else if (typeof details.localAnchorA.y != 'number')
						throw new Error(arguments.callee.name + " : localAnchorA.y must be a number!");
				}
			}

			if (details.localAnchorB !== undefined) {
				if (typeof details.localAnchorB !== 'object')
					throw new Error(arguments.callee.name + " : The localAnchorB must be an object!");
				else {
					if (details.localAnchorB.x === undefined)
						throw new Error(arguments.callee.name + " : localAnchorB.x must be informed!");
					else if (typeof details.localAnchorB.x != 'number')
						throw new Error(arguments.callee.name + " : localAnchorB.x must be a number!");

					if (details.localAnchorB.y === undefined)
						throw new Error(arguments.callee.name + " : localAnchorB.y must be informed!");
					else if (typeof details.localAnchorB.y != 'number')
						throw new Error(arguments.callee.name + " : localAnchorB.y must be a number!");
				}
			}

			if (details.localAxisA !== undefined) {
				if (typeof details.localAxisA !== 'object')
					throw new Error(arguments.callee.name + " : The localAxisA must be an object!");
				else {
					if (details.localAxisA.x === undefined)
						throw new Error(arguments.callee.name + " : localAxisA.x must be informed!");
					else if (typeof details.localAxisA.x != 'number')
						throw new Error(arguments.callee.name + " : localAxisA.x must be a number!");

					if (details.localAxisA.y === undefined)
						throw new Error(arguments.callee.name + " : localAxisA.y must be informed!");
					else if (typeof details.localAxisA.y != 'number')
						throw new Error(arguments.callee.name + " : localAxisA.y must be a number!");
				}
			}

			if (details.options !== undefined) {
				if (typeof details.options != 'object')
					throw new Error(arguments.callee.name + " : options must be an object!");

				for (var def in details.options)
					if (_validJointDefOpts.indexOf(def) < 0)
						throw new Error(arguments.callee.name + " : the details.options (" + def + ") for joint is not supported! Valid definitions: " + _validJointDefOpts);
			}
		}
	}

})();
