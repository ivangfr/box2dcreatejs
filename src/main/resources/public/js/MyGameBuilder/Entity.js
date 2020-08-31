//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {

	MyGameBuilder.Entity = Entity;
	
	//Constructor
	function Entity(worldManager, details) {
		initialize(this, worldManager, details);
	}
	
	var _validEntityDef = ['x', 'y', 'angle', 'shape', 'circleOpts', 'boxOpts', 'polygonOpts',
	                       'name', 'group', 'type', 'render', 'draggable', 'sliceable', 'noGravity',
	                       'fixtureDefOpts', 'bodyDefOpts', 'events'];
	
	var _validEntityShapeDef = ['circle', 'box', 'polygon'];
	
	var _validEntityCircleOptsDef = ['radius'];
	var _validEntityBoxOptsDef = ['width', 'height'];
	var _validEntityPolygonOptsDef = ['points'];
	
	var _validEntityDefType = ['static', 'dynamic', 'kinematic', 0, 1, 2];
	var _validEntityBodyDefOpts = ['fixedRotation', 'bullet', 'linearDamping', 'linearVelocity', 'angularDamping', 'angularVelocity'];
	var _validEntityFixtureDefOpts = ['density', 'friction', 'restitution', 'isSensor', 'filterGroupIndex', 'filterCategoryBits', 'filterMaskBits',
	                                  'isFluid', 'dragConstant', 'liftConstant', 'isSticky', 'isTarget', 'hardness'];
	var _validEntityEventsDef = ['onslice', 'onbreak', 'ontick'];
	
	var _worldManager;

	Entity.prototype.getId = function() {
		return this.b2body.GetUserData().id;
	}	

	Entity.prototype.getName = function() {
		return this.b2body.GetUserData().name;
	}	
	
	Entity.prototype.getGroup = function() {
		return this.b2body.GetUserData().group;
	}
	
	Entity.prototype.isDraggable = function() {
		return this.b2body.GetUserData().draggable;
	}

	Entity.prototype.setDraggable = function(value) {
		this.b2body.GetUserData().draggable = value;
	}
	
	Entity.prototype.isSliceable = function() {
		return this.b2body.GetUserData().sliceable;
	}

	Entity.prototype.setSliceable = function(value) {
		this.b2body.GetUserData().sliceable = value;
	}	
	
	Entity.prototype.getB2Body = function() {
		return this.b2body;
	}	
	
	Entity.prototype.getPosition = function() {
		var x = this.b2body.GetPosition().x * _worldManager.getScale();
		var y = this.b2body.GetPosition().y * _worldManager.getScale();
		return {x:x, y:y};
	}
	
	Entity.prototype.setPosition = function(x, y) {
		var newPosX = x / _worldManager.getScale();
		var newPosY = y / _worldManager.getScale();
		this.b2body.SetPosition(new box2d.b2Vec2(newPosX, newPosY));
	}	
	
	Entity.prototype.changeRender = function(render) {
		_worldManager.getEaseljsStage().removeChild(this.b2body.view);
		
		var positionShape = {};
		positionShape.x = this.getPosition().x;
		positionShape.y = this.getPosition().y;
		positionShape.angle = this.b2body.GetAngle() * (180/Math.PI);
		positionShape.shape = this.b2body.view.shape;
		positionShape.circleOpts = this.b2body.view.circleOpts;
		positionShape.boxOpts = this.b2body.view.boxOpts;
		positionShape.polygonOpts = this.b2body.view.polygonOpts;
		
		this.b2body.view = MyGameBuilder.Render.createView(_worldManager, positionShape, render);
		
		var entity = this;
		this.b2body.view.addEventListener('tick', function() {
			fnEntityTick(entity);
		});
		
		_worldManager.getEaseljsStage().addChildAt(this.b2body.view, this.b2body.GetUserData().render.z);
	}
	
	Entity.prototype.changeScale = function(scale) {
        var entityFixture = this.b2body.GetFixtureList();
        var entityShape = entityFixture.GetShape();
        
        if ( entityShape.GetType() === Box2D.Collision.Shapes.b2Shape.e_circleShape ) {
            var radius = entityShape.GetRadius() * scale;
            entityFixture.m_shape = new box2d.b2CircleShape(radius);
            
            this.b2body.view.circleOpts.radius *= scale;        	
        }
        else {
        	var vertices = entityShape.GetVertices();
        	for ( var i = 0; i < vertices.length; i++ ) {
        		var vertice = vertices[i];
        		vertice.Multiply(scale);
        	}
        	entityFixture.m_shape = new box2d.b2PolygonShape();
        	entityFixture.m_shape.SetAsArray(vertices, vertices.length);
        	
        	if ( this.b2body.view.shape === 'box' ) {
        		this.b2body.view.boxOpts.width *= scale;
        		this.b2body.view.boxOpts.height *= scale;
        	}
        	else { // shape === 'polygon'
            	var points = this.b2body.view.polygonOpts.points;
            	for ( var j = 0; j < points.length; j++ ) {
            		var point = points[j];
            		point.x *= scale;
            		point.y *= scale;
            	}
        	}
        }

        this.changeRender(this.b2body.view.render0);
        this.b2body.ResetMassData();
        this.b2body.SetAwake(true);
	}
	
	function initialize(entity, worldManager, details) {
		validate(worldManager, details);	
		
		_worldManager = worldManager;
		
		if ( details.x === undefined )
			details.x = 0;

		if ( details.y === undefined )
			details.y = 0;
		
		if ( details.angle === undefined )
			details.angle = 0;
		
		var b2body = createBox2dBody(details);
		entity.b2body = b2body;
		
		var view = null;
		if ( details.render !== undefined ) {
			var positionShape = {};
			positionShape.x = details.x;
			positionShape.y = details.y;
			positionShape.angle = details.angle;
			positionShape.shape = details.shape;
			positionShape.circleOpts = details.circleOpts;
			positionShape.boxOpts = details.boxOpts;
			positionShape.polygonOpts = details.polygonOpts;
			
			view = MyGameBuilder.Render.createView(worldManager, positionShape, details.render);
		}
		
		if ( view !== null ) {
			entity.b2body.view = view;
			entity.b2body.view.addEventListener('tick', function() {
				fnEntityTick(entity);
			});
			worldManager.getEaseljsStage().addChildAt(entity.b2body.view, view.z);			
		}
		
		if ( details.events !== undefined )
			for ( var ev in details.events )
				entity[ev] = details.events[ev];
	}
	
	function fnEntityTick(entity) {
		entity.b2body.view.x = entity.b2body.GetPosition().x * _worldManager.getScale();
		entity.b2body.view.y = entity.b2body.GetPosition().y * _worldManager.getScale();
		entity.b2body.view.rotation = entity.b2body.GetAngle() * (180/Math.PI);
		
		if ( entity.b2body.view.cacheCanvas && entity.b2body.view.type === "spritesheet" && entity.b2body.view.filters !== null )
			entity.b2body.view.updateCache();		
	}
	
	function createBox2dBody(details) {
		var shape, radius, width, height, points;
		shape = details.shape;
		if ( shape === 'circle' )
			radius = details.circleOpts.radius;
		else if ( shape === 'box' ) {
			width = details.boxOpts.width;
			height = details.boxOpts.height;
		}
		else if ( shape === 'polygon' ) {
			points = details.polygonOpts.points;
		}
		
		var fixDef = new box2d.b2FixtureDef;
	
		if ( shape === 'circle' )
			fixDef.shape = new box2d.b2CircleShape(radius/_worldManager.getScale());
		else if ( shape === 'box' ) {
			fixDef.shape = new box2d.b2PolygonShape();
			fixDef.shape.SetAsBox(width/2/_worldManager.getScale(), height/2/_worldManager.getScale());
		}
		else if ( shape === 'polygon' ) {
			var centre = findCentroid(points);
			var vertices = [];
			for (var i = 0; i < points.length; i++) {
				var point = points[i];
				point.x -= centre.x;
				point.y -= centre.y;
				
				var vertice = new box2d.b2Vec2();
				vertice.Set(point.x/_worldManager.getScale(), point.y/_worldManager.getScale());
				vertices[i] = vertice;
			}
			vertices = arrangeClockwise(vertices);
			
			fixDef.shape = new box2d.b2PolygonShape();
			fixDef.shape.SetAsArray(vertices, vertices.length);
		}
	
		if ( details.fixtureDefOpts === undefined )
			details.fixtureDefOpts = {};
	
		fixDef.density = 1.0;
		if ( details.fixtureDefOpts.density !== undefined )
			fixDef.density = details.fixtureDefOpts.density;
		
		fixDef.friction = 1.0;
		if ( details.fixtureDefOpts.friction !== undefined )
			fixDef.friction = details.fixtureDefOpts.friction;
		
		fixDef.restitution = 0.5;
		if ( details.fixtureDefOpts.restitution !== undefined )
			fixDef.restitution = details.fixtureDefOpts.restitution;	
		
		fixDef.isSensor = false;
		if ( details.fixtureDefOpts.isSensor !== undefined )
			fixDef.isSensor = details.fixtureDefOpts.isSensor;
		
		fixDef.userData = {};
		
		fixDef.userData.isFluid = false;
		if ( details.fixtureDefOpts.isFluid !== undefined ) {
			fixDef.userData.isFluid = details.fixtureDefOpts.isFluid;
			fixDef.isSensor = fixDef.userData.isFluid;
		}
		
		fixDef.userData.dragConstant = 0.25;
		if ( details.fixtureDefOpts.dragConstant !== undefined )
			fixDef.userData.dragConstant = details.fixtureDefOpts.dragConstant;
		
		fixDef.userData.liftConstant = 0.25;
		if ( details.fixtureDefOpts.liftConstant !== undefined )
			fixDef.userData.liftConstant = details.fixtureDefOpts.liftConstant;
		
		fixDef.userData.isSticky = false;
		if ( details.fixtureDefOpts.isSticky !== undefined )
			fixDef.userData.isSticky = details.fixtureDefOpts.isSticky;
		
		fixDef.userData.isTarget = false;
		if ( details.fixtureDefOpts.isTarget !== undefined )
			fixDef.userData.isTarget = details.fixtureDefOpts.isTarget;
		
		fixDef.userData.hardness = 1;
		if ( details.fixtureDefOpts.hardness !== undefined )
			fixDef.userData.hardness = details.fixtureDefOpts.hardness;			
		
		if ( details.fixtureDefOpts.filterGroupIndex !== undefined )
			fixDef.filter.groupIndex = details.fixtureDefOpts.filterGroupIndex;
		
		if ( details.fixtureDefOpts.filterCategoryBits !== undefined )
			fixDef.filter.categoryBits = details.fixtureDefOpts.filterCategoryBits;
		
		if ( details.fixtureDefOpts.filterMaskBits !== undefined )
			fixDef.filter.maskBits = details.fixtureDefOpts.filterMaskBits;
		
		var bodyDef = new box2d.b2BodyDef();
		
		if ( details.type == 'static' || details.type == 'dynamic' || details.type == 'kinematic' )
			bodyDef.type = getBodyDefType(details.type);
		else
			bodyDef.type = details.type;
		
		if ( details.angle !== undefined )
			bodyDef.angle = details.angle * Math.PI/180;		
		
		bodyDef.position.Set(details.x/_worldManager.getScale(), details.y/_worldManager.getScale());

		if ( details.bodyDefOpts !== undefined ) {
			if ( details.bodyDefOpts.fixedRotation !== undefined )
				bodyDef.fixedRotation = details.bodyDefOpts.fixedRotation;
			
			if ( details.bodyDefOpts.bullet !== undefined )
				bodyDef.bullet = details.bodyDefOpts.bullet;
			
			if ( details.bodyDefOpts.linearDamping !== undefined )
				bodyDef.linearDamping = details.bodyDefOpts.linearDamping;
			
			if ( details.bodyDefOpts.linearVelocity !== undefined )
				bodyDef.linearVelocity = details.bodyDefOpts.linearVelocity;
			
			if ( details.bodyDefOpts.angularDamping !== undefined )
				bodyDef.angularDamping = details.bodyDefOpts.angularDamping;
			
			if ( details.bodyDefOpts.angularVelocity !== undefined )
				bodyDef.angularVelocity = details.bodyDefOpts.angularVelocity * Math.PI/180;
		}
		
		if ( details.name === undefined ){
			var num = _worldManager.getNextEntityId() + 1;
			details.name = 'entity' + num;	
		}
		
		if ( details.group === undefined )
			details.group = 'none';		
	
		if ( details.draggable === undefined )
			details.draggable = true;
		
		if ( details.sliceable === undefined )
			details.sliceable = false;		
		
		if ( details.noGravity === undefined )
			details.noGravity = false;
		
		details.userData = {};
	
		details.userData.id = _worldManager.getNextEntityId();
		details.userData.name = details.name;
		details.userData.group = details.group;
		details.userData.shape = shape;
		details.userData.render = details.render;
		details.userData.draggable = details.draggable;
		details.userData.sliceable = details.sliceable;
		details.userData.noGravity = details.noGravity;
	
		bodyDef.userData = details.userData;
	
		var body = _worldManager.getWorld().CreateBody(bodyDef);
		body.CreateFixture(fixDef);
	
		return body;
	}
	
	function getBodyDefType(type) {
		var bodyDefType;

		switch(type) {
		case 'static':
			bodyDefType = box2d.b2Body.b2_staticBody;
			break;
		case 'kinematic':
			bodyDefType = box2d.b2Body.b2_kinematic;
			break;
		case 'dynamic':
			bodyDefType = box2d.b2Body.b2_dynamicBody;
			break;			
		default:
		}

		return bodyDefType;
	}
	
    function arrangeClockwise(vec) {
        var n = vec.length;
        var i1 = 1;
        var i2 = n-1;
        
        var tempVec = [];
        var C, D;

        vec.sort(comp);

        tempVec[0] = vec[0];
        C = vec[0];
        D = vec[n-1];

        for ( var i = 1; i < n-1; i++ ) {
            var d = det(C.x, C.y, D.x, D.y, vec[i].x, vec[i].y);
            if ( d < 0 )
                tempVec[i1++] = vec[i];
            else
                tempVec[i2--] = vec[i];
        }

        tempVec[i1] = vec[n-1];

        return tempVec;
        
        function comp(a, b) {
            if ( a.x > b.x )
                return 1;
            else if ( a.x < b.x )
                return -1;
            return 0;
        }
        
        function det(x1, y1, x2, y2, x3, y3) {
            return x1*y2 + x2*y3 + x3*y1 - y1*x2 - y2*x3 - y3*x1;
        }
    }
	
    function findCentroid(vs) {
        var c = new box2d.b2Vec2();
        var area = 0.0;
        var p1X = 0.0;
        var p1Y = 0.0;
        var inv3 = 1.0/3.0;
        var count = vs.length;
        
        for ( var i = 0; i < count; ++i ) {
            var p2 = vs[i];
            var p3 = i+1 < count ? vs[i+1] : vs[0];
            var e1X = p2.x - p1X;
            var e1Y = p2.y - p1Y;
            var e2X = p3.x - p1X;
            var e2Y = p3.y - p1Y;
            var D = (e1X * e2Y - e1Y * e2X);
            var triangleArea = 0.5 * D;
            area += triangleArea;
            c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
            c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
        }
        
        c.x *= 1.0/area;
        c.y *= 1.0/area;
        
        return c;
    }
    
	function validate(worldManager, details) {
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");
		
		if ( typeof details != 'object' )
			throw new Error(arguments.callee.name + " : The Entity details must be informed!");
		
		for ( var def in details )
			if ( _validEntityDef.indexOf(def) < 0 )
				throw new Error(arguments.callee.name + " : the detail (" + def + ") for Entity is not supported! Valid definitions: " + _validEntityDef);

		if ( details.x !== undefined && typeof details.x != 'number' )
			throw new Error(arguments.callee.name + " : x must be a number!");
		
		if ( details.y !== undefined && typeof details.y != 'number' )
			throw new Error(arguments.callee.name + " : y must be a number!");
		
		if ( details.angle !== undefined && typeof details.angle != 'number' )
			throw new Error(arguments.callee.name + " : angle must be a number!");
		
		if ( details.shape === undefined )
			throw new Error(arguments.callee.name + " : shape must be informed!");
		else if ( _validEntityShapeDef.indexOf(details.shape) < 0 )
			throw new Error(arguments.callee.name + " : shape must be " + _validEntityShapeDef);
		else {
			if ( details.shape === 'circle' ) {
				if ( details.circleOpts === undefined )
					throw new Error(arguments.callee.name + " : circleOpts must be informed!");
				else if ( typeof details.circleOpts !== 'object' )
					throw new Error(arguments.callee.name + " : circleOpts must be an object!");
				
				for ( var def in details.circleOpts )
					if ( _validEntityCircleOptsDef.indexOf(def) < 0 )
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for circleOpts is not supported! Valid definitions: " + _validEntityCircleOptsDef);
				
				if ( details.circleOpts.radius === undefined )
					throw new Error(arguments.callee.name + " : circleOpts.radius must be informed!");
				else if ( typeof details.circleOpts.radius != 'number' )
					throw new Error(arguments.callee.name + " : circleOpts.radius must be a number!");
			}
			else if ( details.shape === 'box' ) {
				if ( details.boxOpts === undefined )
					throw new Error(arguments.callee.name + " : boxOpts must be informed!");
				else if ( typeof details.boxOpts !== 'object' )
					throw new Error(arguments.callee.name + " : boxOpts must be an object!");
				
				for ( var def in details.boxOpts )
					if ( _validEntityBoxOptsDef.indexOf(def) < 0 )
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for boxOpts is not supported! Valid definitions: " + _validEntityBoxOptsDef);
				
				if ( details.boxOpts.width === undefined )
					throw new Error(arguments.callee.name + " : boxOpts.width be informed!");
				else if ( typeof details.boxOpts.width != 'number' )
					throw new Error(arguments.callee.name + " : boxOpts.width must be a number!");
				
				if ( details.boxOpts.height === undefined )
					throw new Error(arguments.callee.name + " : boxOpts.height be informed!");
				else if ( typeof details.boxOpts.height != 'number' )
					throw new Error(arguments.callee.name + " : boxOpts.height must be a number!");					
			}
			else if ( details.shape === 'polygon' ) {
				if ( details.polygonOpts === undefined )
					throw new Error(arguments.callee.name + " : polygonOpts must be informed!");
				else if ( typeof details.polygonOpts !== 'object' )
					throw new Error(arguments.callee.name + " : polygonOpts must be an object!");
				
				for ( var def in details.polygonOpts )
					if ( _validEntityPolygonOptsDef.indexOf(def) < 0 )
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for polygonOpts is not supported! Valid definitions: " + _validEntityPolygonOptsDef);
				
				if ( details.polygonOpts.points === undefined )
					throw new Error(arguments.callee.name + " : polygonOpts.points be informed!");
				else if ( !(details.polygonOpts.points instanceof Array) )
					throw new Error(arguments.callee.name + " : polygonOpts.points must be an Array!");
				else if ( details.polygonOpts.points.length < 3 )
					throw new Error(arguments.callee.name + " : polygonOpts.points array must have at least 3 points!");
				else {
					for ( var i = 0; i < details.polygonOpts.points.length; i++ ) {
						var point = details.polygonOpts.points[i];
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
		
		if ( details.render !== undefined && typeof details.render != 'object')
			throw new Error(arguments.callee.name + " : render must be an object!");
		
		if ( details.name !== undefined && typeof details.name != 'string' )
			throw new Error(arguments.callee.name + " : name must be a string!");		
		
		if ( details.group !== undefined && typeof details.group != 'string' )
			throw new Error(arguments.callee.name + " : group must be a string!");

		if ( details.type === undefined )
			throw new Error(arguments.callee.name + " : type must be informed!");
		else if ( _validEntityDefType.indexOf(details.type) < 0 )
			throw new Error(arguments.callee.name + " : type must be " + _validEntityDefType + "!");		
		
		if ( details.bodyDefOpts !== undefined ) {
			for ( var def in details.bodyDefOpts )
				if ( _validEntityBodyDefOpts.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail.bodyDefOpts (" + def + ") is not supported! Valid definitions: " + _validEntityBodyDefOpts);
			
			if ( details.bodyDefOpts.fixedRotation !== undefined && typeof details.bodyDefOpts.fixedRotation != 'boolean' )
				throw new Error(arguments.callee.name + " : bodyDefOpts.fixedRotation must be true/false!");
			
			if ( details.bodyDefOpts.bullet !== undefined && typeof details.bodyDefOpts.bullet != 'boolean' )
				throw new Error(arguments.callee.name + " : bodyDefOpts.bullet must be true/false!");
			
			if ( details.bodyDefOpts.linearDamping  !== undefined && typeof details.bodyDefOpts.linearDamping  != 'number' )
				throw new Error(arguments.callee.name + " : bodyDefOpts.linearDamping  must be a number!");
			
			if ( details.bodyDefOpts.linearVelocity !== undefined ) {
				if ( !(details.bodyDefOpts.linearVelocity instanceof Object) )
					throw new Error(arguments.callee.name + " : bodyDefOpts.linearVelocity must be a Object!");

				if ( details.bodyDefOpts.linearVelocity.x === undefined )
					throw new Error(arguments.callee.name + " : bodyDefOpts.linearVelocity.x must be informed!");
				else if ( typeof details.bodyDefOpts.linearVelocity.x != 'number' )
					throw new Error(arguments.callee.name + " : bodyDefOpts.linearVelocity.x must be a number!");

				if ( details.bodyDefOpts.linearVelocity.y === undefined )
					throw new Error(arguments.callee.name + " : bodyDefOpts.linearVelocity.y must be informed!");
				else if ( typeof details.bodyDefOpts.linearVelocity.y != 'number' )
					throw new Error(arguments.callee.name + " : bodyDefOpts.linearVelocity.y must be a number!");
			}
			
			if ( details.bodyDefOpts.angularDamping !== undefined && typeof details.bodyDefOpts.angularDamping != 'number' )
				throw new Error(arguments.callee.name + " : bodyDefOpts.angularDamping  must be a number!");
			
			if ( details.bodyDefOpts.angularVelocity !== undefined && typeof details.bodyDefOpts.angularVelocity != 'number' )
				throw new Error(arguments.callee.name + " : bodyDefOpts.angularVelocity must be a number!");
		}		
	
		if ( details.fixtureDefOpts !== undefined ) {
			for ( var def in details.fixtureDefOpts )
				if ( _validEntityFixtureDefOpts.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail.fixtureDefOpts (" + def + ") is not supported! Valid definitions: " + _validEntityFixtureDefOpts);
			
			if ( details.fixtureDefOpts.density !== undefined && typeof details.fixtureDefOpts.density != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.density must be a number!");
	
			if ( details.fixtureDefOpts.friction !== undefined && typeof details.fixtureDefOpts.friction != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.friction must be a number!");
	
			if ( details.fixtureDefOpts.restitution !== undefined && typeof details.fixtureDefOpts.restitution != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.restitution must be a number!");
			
			if ( details.fixtureDefOpts.filterGroupIndex !== undefined && typeof details.fixtureDefOpts.filterGroupIndex != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.filterGroupIndex must be a number!");
			
			if ( details.fixtureDefOpts.filterCategoryBits !== undefined && typeof details.fixtureDefOpts.filterCategoryBits != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.filterCategoryBits must be a number!");
			
			if ( details.fixtureDefOpts.filterMaskBits !== undefined && typeof details.fixtureDefOpts.filterMaskBits != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.filterMaskBits must be a number!");
			
			if ( details.fixtureDefOpts.isSensor !== undefined && typeof details.fixtureDefOpts.isSensor != 'boolean' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.isSensor must be true/false!");
			
			if ( details.fixtureDefOpts.isFluid !== undefined && typeof details.fixtureDefOpts.isFluid != 'boolean' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.isFluid must be true/false!");
			
			if ( details.fixtureDefOpts.dragConstant !== undefined && typeof details.fixtureDefOpts.dragConstant != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.dragConstant must be a number!");
			
			if ( details.fixtureDefOpts.liftConstant !== undefined && typeof details.fixtureDefOpts.liftConstant != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.liftConstant must be a number!");
			
			if ( details.fixtureDefOpts.isSticky !== undefined && typeof details.fixtureDefOpts.isSticky != 'boolean' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.isSticky must be true/false!");
			
			if ( details.fixtureDefOpts.isTarget !== undefined && typeof details.fixtureDefOpts.isTarget != 'boolean' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.isTarget must be true/false!");
			
			if ( details.fixtureDefOpts.hardness !== undefined && typeof details.fixtureDefOpts.hardness != 'number' )
				throw new Error(arguments.callee.name + " : fixtureDefOpts.hardness must be a number!");			
		}
	
		if ( details.draggable !== undefined && typeof details.draggable != 'boolean' )
			throw new Error(arguments.callee.name + " : draggable must be a true/false!");
		
		if ( details.sliceable !== undefined && typeof details.sliceable != 'boolean' )
			throw new Error(arguments.callee.name + " : sliceable must be a true/false!");
		
		if ( details.noGravity !== undefined && typeof details.noGravity != 'boolean' )
			throw new Error(arguments.callee.name + " : noGravity must be a true/false!");
		
		if ( details.events !== undefined ) {
			if ( typeof details.events !== 'object' )
				throw new Error(arguments.callee.name + " : events must be an object!");
			
			for ( var ev in details.events )
				if ( _validEntityEventsDef.indexOf(ev) < 0 )
					throw new Error(arguments.callee.name + " : the event (" + ev + ") is not supported! Valid definitions: " + _validEntityEventsDef);
			
			if ( details.events.onslice !== undefined && typeof details.events.onslice !== 'function' )
				throw new Error(arguments.callee.name + " : events.onslice must be a function!");

			if ( details.events.onbreak !== undefined && typeof details.events.onbreak !== 'function' )
				throw new Error(arguments.callee.name + " : events.onbreak must be a function!");			
			
			if ( details.events.ontick !== undefined && typeof details.events.ontick !== 'function' )
				throw new Error(arguments.callee.name + " : events.ontick must be a function!");
		}
	}

})();