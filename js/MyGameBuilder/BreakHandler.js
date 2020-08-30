//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	
	MyGameBuilder.BreakHandler = BreakHandler;
	
	//Constructor
	function BreakHandler(worldManager, details) {
		initialize(this, worldManager, details);
	}
	
	var _validBreakHandlerDef = ['numCuts', 'explosion', 'explosionRadius'];
	
	var _worldManager;
	
	var _breakCenterX, _breakCenterY;
	var _entryPoint, _breakBodies, _affectedByLaser;
	var _range, _numPiece;
	
	function initialize(breakHandler, worldManager, details) {
		validate(worldManager, details);
		
		_worldManager = worldManager;
		
		var numCuts = 5;
		if ( details && details.numCuts !== undefined )
			numCuts = details.numCuts;
		breakHandler.getNumCuts = function() {
			return numCuts;
		}
		breakHandler.setNumCuts = function(value) {
			numCuts = value;
		}
		
		var explosion = false;
		if ( details && details.explosion !== undefined )
			explosion = details.explosion;
		breakHandler.hasExplosion = function() {
			return explosion;
		}
		breakHandler.setExplosion = function(value) {
			explosion = value;
		}		
		
		var explosionRadius;
		if ( !explosion )
			explosionRadius = 0;
		else {
			explosionRadius = 50;
			if ( details && details.explosionRadius !== undefined )
				explosionRadius = details.explosionRadius;
		}
		breakHandler.getExplosionRadius = function() {
			return explosionRadius;
		}
		breakHandler.setExplosionRadius = function(value) {
			explosionRadius = value;
		}
		
		_range = worldManager.getEaseljsCanvas().width/2;
	}
	
	BreakHandler.prototype.breakEntity = function(entity, x, y, angles) {
		fnBreakEntity(this, entity, x, y, angles);
	}
	
	function fnBreakEntity(breakHandler, entity, x, y, angles) {
		
		//Nao executa o break se estiver pausado!
		if ( _worldManager.getTimeStep() == 0 )
			return;
		
		if ( !(entity instanceof MyGameBuilder.Entity) )
			throw new Error(arguments.callee.name + " : entity must be an instance of Entity!");
		
		var entityBody = entity.b2body;
		
		if ( entityBody.GetType() !==  box2d.b2Body.b2_dynamicBody ) {
			console.warn('A non-dynamic entity cannot be broken!');
			return;
		}
		else if ( entityBody.GetFixtureList() === null ) {
			return;
		}
		else if ( entityBody.GetFixtureList().GetShape().GetType() != Box2D.Collision.Shapes.b2Shape.e_polygonShape ) {
			console.warn('An entity that has a non-polygonal shape can not be broken! Type == ' + entityBody.GetFixtureList().GetShape().GetType());
			return;
		}
		
		if ( angles !== undefined && !(angles instanceof Array) )
			throw new Error(arguments.callee.name + " : angles must be an Array!");
		
		var player = _worldManager.getPlayer();
		var adjustX = 0, adjustY = 0;
		if ( player ) {
			adjustX = player.getCameraAdjust().adjustX;
			adjustY = player.getCameraAdjust().adjustY;
		}		
		
		_breakCenterX = x + adjustX;
		_breakCenterY = y + adjustY;
		_breakBodies = [];
		
		var cutAngles = [];
		var nCuts = 0;
		
		// Informed angles
		if ( angles !== undefined ) {
			for ( var i = 0; i < angles.length; i++ ) {
				cutAngles.push(angles[i]*Math.PI/180);
				nCuts++;
			}
		}
		// Random angles
		while ( nCuts < breakHandler.getNumCuts() ) {
			var cutAngle = Math.random() * Math.PI * 2;
			cutAngles.push(cutAngle);
			nCuts++;
		}
		
		if ( entityBody != null ) {
			_breakBodies.push(entityBody);
			for ( var i = 0; i < breakHandler.getNumCuts(); i++ ) {
				var cutAngle = cutAngles[i];
//				console.log('angle: ' + cutAngle*180/Math.PI);
				
				var laserSegment = new Box2D.Collision.b2Segment();
				
				laserSegment.p1 = new box2d.b2Vec2(
						(_breakCenterX + i/10 - _range * Math.cos(cutAngle)) / _worldManager.getScale(),
						(_breakCenterY - _range * Math.sin(cutAngle)) / _worldManager.getScale()
				);
				laserSegment.p2 = new box2d.b2Vec2(
						(_breakCenterX + _range * Math.cos(cutAngle)) / _worldManager.getScale(),
						(_breakCenterY + _range * Math.sin(cutAngle)) / _worldManager.getScale()
				);
				
				_affectedByLaser = [];
				_entryPoint = [];
				
				
				_worldManager.getWorld().RayCast(
						function(fixture, point, normal, fraction) {
							laserFired(breakHandler, fixture, point, normal, fraction);
						},
						laserSegment.p1,
						laserSegment.p2
				);
				
				_worldManager.getWorld().RayCast(
						function(fixture, point, normal, fraction) {
							laserFired(breakHandler, fixture, point, normal, fraction);
						},
						laserSegment.p2,
						laserSegment.p1
				);
			}
		}		
	}
	
    function laserFired(breakHandler, fixture, point, normal, fraction) {
        var affectedBody = fixture.GetBody();
        if ( _breakBodies.indexOf(affectedBody) != -1 ) {
            var affectedPolygon = fixture.GetShape();
            var fixtureIndex = _affectedByLaser.indexOf(affectedBody);
            if ( fixtureIndex == -1 ) {
                _affectedByLaser.push(affectedBody);
                _entryPoint.push(point);
            }
            else {
                var rayCenter = new box2d.b2Vec2((point.x + _entryPoint[fixtureIndex].x)/2, (point.y + _entryPoint[fixtureIndex].y)/2);
                var rayAngle = Math.atan2(_entryPoint[fixtureIndex].y-point.y, _entryPoint[fixtureIndex].x-point.x);
                var polyVertices = affectedPolygon.GetVertices();
                var newPolyVertices1 = [];
                var newPolyVertices2 = [];
                var currentPoly = 0;
                var cutPlaced1 = false;
                var cutPlaced2 = false;
                for ( var i = 0; i < polyVertices.length; i++ ) {
                    var worldPoint = affectedBody.GetWorldPoint(polyVertices[i]);
                    var cutAngle = Math.atan2(worldPoint.y-rayCenter.y,worldPoint.x-rayCenter.x)-rayAngle;
                    if ( cutAngle < Math.PI*-1 ) {
                        cutAngle += 2*Math.PI;
                    }
                    if ( cutAngle > 0 && cutAngle <= Math.PI ) {
                        if ( currentPoly == 2 ) {
                            cutPlaced1 = true;
                            newPolyVertices1.push(point);
                            newPolyVertices1.push(_entryPoint[fixtureIndex]);
                        }
                        newPolyVertices1.push(worldPoint);
                        currentPoly = 1;
                    }
                    else {
                        if (currentPoly == 1) {
                            cutPlaced2 = true;
                            newPolyVertices2.push(_entryPoint[fixtureIndex]);
                            newPolyVertices2.push(point);
                        }
                        newPolyVertices2.push(worldPoint);
                        currentPoly = 2;

                    }
                }
                if ( !cutPlaced1 ) {
                    newPolyVertices1.push(point);
                    newPolyVertices1.push(_entryPoint[fixtureIndex]);
                }
                if ( !cutPlaced2 ) {
                    newPolyVertices2.push(_entryPoint[fixtureIndex]);
                    newPolyVertices2.push(point);
                }
                
        		_numPiece = 0;
                var entity = _worldManager.getEntityByItsBody(affectedBody);
                
                var newEntity2 = createPiece(breakHandler, entity, newPolyVertices2);
                var newEntity1 = createPiece(breakHandler, entity, newPolyVertices1);
                
                if ( entity.onbreak !== undefined )
                	entity.onbreak(newEntity1, newEntity2);
                
                _worldManager.deleteEntity(entity);
                
                //affectedBody must be destroyed now in order to not interfere in the next laserFired calls
                _worldManager.getWorld().DestroyBody(affectedBody);
            }
        }
        return 1;
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
    
    function getArea(vs) {
    	var count = vs.length;
        var area = 0.0;
        var p1X = 0.0;
        var p1Y = 0.0;
        var inv3 = 1.0/3.0;
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
        }
        return area;
    }

    function createPiece(breakHandler, entity, vertices) {
    	var numVertices = vertices.length;
        if ( getArea(vertices) >= 0.01) {
            var centre = findCentroid(vertices);
            for ( var i = 0; i < numVertices; i++ ) {
                vertices[i].Subtract(centre);
            }
            
            var piece = createEntityPiece(entity, vertices, centre);
            
            for ( i = 0; i < numVertices; i++ ) {
                vertices[i].Add(centre);
            }
            
            if ( breakHandler.hasExplosion() ) {
                var explosionVelocity = getExplosionVelocity(breakHandler, piece.b2body);
                piece.b2body.SetLinearVelocity(explosionVelocity);
            }
            _breakBodies.push(piece.b2body);
        }
        
        return piece;
    }
    
    function getExplosionVelocity(breakHandler, b) {
    	var explosionRadius = breakHandler.getExplosionRadius();
        var distX = b.GetWorldCenter().x * _worldManager.getScale() - _breakCenterX;
        if ( distX < 0 ) {
            if ( distX < -explosionRadius) {
                distX = 0;
            }
            else {
                distX = -explosionRadius - distX;
            }
        }
        else {
            if ( distX > explosionRadius ) {
                distX = 0;
            }
            else {
                distX = explosionRadius - distX;
            }
        }
        var distY = b.GetWorldCenter().y * _worldManager.getScale() - _breakCenterY;
        if ( distY < 0 ) {
            if ( distY < -explosionRadius ) {
                distY = 0;
            }
            else {
                distY = -explosionRadius - distY;
            }
        }
        else {
            if ( distY > explosionRadius ) {
                distY = 0;
            }
            else {
                distY = explosionRadius - distY;
            }
        }
        
        distX*=0.25;
        distY*=0.25;
        
        return new box2d.b2Vec2(distX,distY);
    }
    
    function createEntityPiece(entity, vertices, centre) {
    	var scaledVertices = []
    	for ( var i = 0; i < vertices.length; i++ ) {
    		var scaledVertice = new box2d.b2Vec2();
    		scaledVertice.x = vertices[i].x * _worldManager.getScale();
    		scaledVertice.y = vertices[i].y * _worldManager.getScale();
    		scaledVertices.push(scaledVertice);
    	}
    	
    	var entityBody = entity.b2body;
    	var entityFixture = entityBody.GetFixtureList();
    	var entityUserData = entityBody.GetUserData();
    	
    	var render = {};
    	var entityRender = entityBody.GetUserData().render;
    	
    	render.z = entityRender.z;
    	render.type = entityRender.type;
    	render.opacity = entityRender.opacity;
    	render.filters = entityRender.filters;

    	if ( entityRender.action !== undefined )
    		render.action = entityRender.action;
    	
    	if ( entityRender.drawOpts !== undefined )
    		render.drawOpts = entityRender.drawOpts;
    	if ( entityRender.imageOpts !== undefined )
    		render.imageOpts = entityRender.imageOpts;
    	if ( entityRender.spriteSheetOpts !== undefined )
    		render.spriteSheetOpts = entityRender.spriteSheetOpts;
    	if ( entityRender.textOpts !== undefined )
    		render.textOpts = entityRender.textOpts;
    	
    	_numPiece++;
    	
        var piece = _worldManager.createEntity({
			type : entityBody.GetType(),
			x : centre.x * _worldManager.getScale(),
			y : centre.y * _worldManager.getScale(),
			//angle : doesn't need to be updated!
			shape : 'polygon',
			polygonOpts : { points : scaledVertices },
			render : render,			
			bodyDefOpts : {
				fixedRotation : entityBody.IsFixedRotation(),
				bullet : entityBody.IsBullet(), 
				linearDamping : entityBody.GetLinearDamping(),
				linearVelocity : entityBody.GetLinearVelocity(),
				angularDamping : entityBody.GetAngularDamping(),
				angularVelocity : entityBody.GetAngularVelocity() * 180/Math.PI				
			},
			fixtureDefOpts : {
				density : entityFixture.GetDensity(),
				friction : entityFixture.GetFriction(),
				restitution : entityFixture.GetRestitution(),
				isSensor : entityFixture.IsSensor(),
				filterCategoryBits : entityFixture.GetFilterData().categoryBits,
				filterMaskBits : entityFixture.GetFilterData().maskBits,		
				filterGroupIndex : entityFixture.GetFilterData().groupIndex,
				isFluid : entityFixture.GetUserData().isFluid,
				dragConstant : entityFixture.GetUserData().dragConstant,
				liftConstant : entityFixture.GetUserData().liftConstant,
				isSticky : entityFixture.GetUserData().isSticky,
				isTarget : entityFixture.GetUserData().isTarget,
				hardness : entityFixture.GetUserData().hardness			
			},
			name : entityUserData.name + _numPiece,
			group : entityUserData.group,
			draggable : entityUserData.draggable,
			sliceable : entityUserData.sliceable,
			noGravity : entityUserData.noGravity,
			events : {
				onslice : entity.onslice,
				onbreak : entity.onbreak,
				ontick : entity.ontick
			}
        });
        
        return piece;
    }
    
	function validate(worldManager, details) {
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");
		
		
		if ( details !== undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : The BreakHandler details must be an object!");
			
			for ( var def in details )
				if ( _validBreakHandlerDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for BreakHandler is not supported! Valid definitions: " + _validBreakHandlerDef);
			
			if ( details.numCuts !== undefined && (typeof details.numCuts != 'number' || details.numCuts <= 0) )
				throw new Error(arguments.callee.name + " : invalid value for numCuts!");
			
			if ( details.explosion !== undefined && typeof details.explosion != 'boolean' )
				throw new Error(arguments.callee.name + " : explosion must be true/false!");
			
			if ( details.explosionRadius !== undefined && (typeof details.explosionRadius != 'number' || details.explosionRadius <= 0) )
				throw new Error(arguments.callee.name + " : invalid value for explosionRadius!");
		}
	}
	
})();