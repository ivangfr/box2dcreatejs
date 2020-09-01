//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	
	MyGameBuilder.StickyTargetHandler = StickyTargetHandler;
	
	//Constructor
	function StickyTargetHandler(worldManager, details) {
		initialize(worldManager, details);
	}
	
	var _validStickyTargetDef = ['preSolveStick'];
	
	var _preSolveStick;
	
	var _worldManager;
	
	var _targetStickyObjectContacts;
	
	function initialize(worldManager, details) {
		validate(worldManager, details);
		
		_worldManager = worldManager;
		_targetStickyObjectContacts = [];
		
		_preSolveStick = false;
		if ( details && details.preSolveStick != undefined )
			_preSolveStick = details.preSolveStick;
	}
	
	StickyTargetHandler.prototype.IsStickyTargetContactType = function(contact) {
		var fixA = contact.GetFixtureA();
		var fixB = contact.GetFixtureB();
		
		if ( (fixA.GetUserData().isSticky && fixB.GetUserData().isTarget) ||
			 (fixB.GetUserData().isSticky && fixA.GetUserData().isTarget) ) {
			return true;
		}
		else
			return false;
	}
	
	function getStickyTargetFromContact(contact) {
		var fixA = contact.GetFixtureA();
		var fixB = contact.GetFixtureB();
		
		var stickyObject, target;
		if ( fixA.GetUserData().isTarget ) {
			target = fixA;
			stickyObject = fixB;
		}
		else {
			target = fixB;
			stickyObject = fixA;
		}
		
		return {stickyObject: stickyObject, target: target};
	}
	
	StickyTargetHandler.prototype.postSolveStickyTargetContact = function(contact, impulse) {
		var objects = getStickyTargetFromContact(contact);
		var stickyObject = objects.stickyObject;
		var target = objects.target;
		
		if ( impulse.normalImpulses[0] > target.GetUserData().hardness ) {
			console.log('Post - Fixed! ' + 'Impulse ' + impulse.normalImpulses[0] + ' ' + impulse.normalImpulses[1]);
			
			addTargetStickyObjectContact(target, stickyObject);
		}
		else {
			console.log('Post - Not Fixed! ' + 'Impulse ' + impulse.normalImpulses[0] + ' ' + impulse.normalImpulses[1]);
		}
	}
	
	StickyTargetHandler.prototype.preSolveStickyTargetContact = function(contact, oldManifold) {
		var objects = getStickyTargetFromContact(contact);
		var stickyObject = objects.stickyObject;
		var target = objects.target;
		
		stickyObject.GetBody().SetBullet(true);
		stickyObject.SetRestitution(0);
		stickyObject.SetFriction(1);
		target.SetRestitution(0);
		target.SetFriction(1);
		
		if ( _preSolveStick ) {
			var worldManifold = new Box2D.Collision.b2WorldManifold();
			contact.GetWorldManifold(worldManifold);
			
			var vel1 = target.GetBody().GetLinearVelocity();
			var vel2 = stickyObject.GetBody().GetLinearVelocity();
			var impactVelocity = box2d.b2Math.SubtractVV(vel1, vel2);
			
			var approachVelocity = box2d.b2Math.Dot(worldManifold.m_normal, impactVelocity);
			var impulse = Math.abs(approachVelocity * stickyObject.GetBody().GetMass());
			if ( impulse > target.GetUserData().hardness ) {
				console.log('Pre - Fixed! ' + 'Impulse ' + impulse);
				
				addTargetStickyObjectContact(target, stickyObject);
			}
			else {
				console.log('Pre - Not Fixed! ' + 'Impulse ' + impulse);
			}
			
			//This don't execute the PostSolve
			contact.SetEnabled(false);
		}
	}
	
	StickyTargetHandler.prototype.endContactStickyTarget = function(contact) {
		var objects = getStickyTargetFromContact(contact);
		var stickyObject = objects.stickyObject;
		var target = objects.target;		
		
		var worldManifold = new Box2D.Collision.b2WorldManifold();
		contact.GetWorldManifold(worldManifold);
		
		var x = worldManifold.m_points[0].x;
		if ( worldManifold.m_points[1].x > 0 )
			x = (x + worldManifold.m_points[1].x)/2;
		x *= _worldManager.getScale();
		
		var y = worldManifold.m_points[0].y;
		if ( worldManifold.m_points[1].y > 0 )
			y = (y + worldManifold.m_points[1].y)/2;
		y *= _worldManager.getScale();
		
		console.log('end x:' + x + '- y:' + y);
		
		_worldManager.createLandscape({
			x : x, y : y,
			shape : 'circle',
			circleOpts : { radius : 2 },
			render : {
				z : _worldManager.getEaseljsStage().numChildren,
				type : 'draw',
				drawOpts : { bgColorStyle : 'solid', bgSolidColorOpts : { color : 'yellow' } }
			}
		});
	}
	
	function addTargetStickyObjectContact(target, stickyObject) {
		var contactPair = { target : target, stickyObject : stickyObject };
		_targetStickyObjectContacts.push(contactPair);
	}
	
	function deleteTargetStickyObjectContact(target, stickyObject) {
		var idx = -1;
		for ( var i = 0; i < _targetStickyObjectContacts.length; i++ ) {
			var contactPair = _targetStickyObjectContacts[i];
			if ( contactPair.target === target && contactPair.stickyObject === stickyObject ) {
				idx = i;
				break;
			}
		}
		
		if ( idx >= 0 )
			_targetStickyObjectContacts.remove(idx);
	}
	
	StickyTargetHandler.prototype.update = function() {
		for ( var i = 0; i < _targetStickyObjectContacts.length; i++ ) {
			var contact = _targetStickyObjectContacts[i];
			
			//set the joint anchors at the arrow tip - should be good enough
			var worldCoordsAnchorPoint = contact.stickyObject.GetBody().GetWorldPoint( new box2d.b2Vec2(0, 0) );			
			
			var weldJointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();
			weldJointDef.bodyA = contact.target.GetBody();
			weldJointDef.bodyB = contact.stickyObject.GetBody();
			weldJointDef.localAnchorA = weldJointDef.bodyA.GetLocalPoint(worldCoordsAnchorPoint);
			weldJointDef.localAnchorB = weldJointDef.bodyB.GetLocalPoint(worldCoordsAnchorPoint);
			weldJointDef.referenceAngle = weldJointDef.bodyB.GetAngle() - weldJointDef.bodyA.GetAngle();
			
			_worldManager.getWorld().CreateJoint(weldJointDef);
			
		}
		_targetStickyObjectContacts = [];
	}
	
	function validate(worldManager, details) {
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");
		
		if ( details !== undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : The StickyTargetHandler details must be an object!");
			
			for ( var def in details )
				if ( _validStickyTargetDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for StickyTargetHandler is not supported! Valid definitions: " + _validStickyTargetDef);
						
			if ( details.preSolveStick !== undefined && typeof details.preSolveStick != 'boolean' )
				throw new Error(arguments.callee.name + " : preSolveStick must be true/false!");
		}
	}	
	
})();