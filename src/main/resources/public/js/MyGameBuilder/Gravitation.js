//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {

	MyGameBuilder.Gravitation = Gravitation;

	//Constructor
	function Gravitation(worldManager, entity, details) {
		initialize(this, worldManager, entity, details);
	}

	var _validGravitationDef = ['gravityRadius', 'attractionPower', 'render'];

	var _worldManager;

	function initialize(gravitation, worldManager, entity, details) {
		validate(worldManager, entity, details);

		_worldManager = worldManager;

		var gravitationEntity = entity;
		gravitation.getEntity = function() {
			return gravitationEntity;
		}

		var gravityRadius;
		if ( details && details.gravityRadius === undefined )
			gravityRadius = getEntityRadius(entity) * 3;
		else
			gravityRadius = details.gravityRadius / worldManager.getScale();
		gravitation.getGravityRadius = function() {
			return gravityRadius;
		}		

		var attractionPower = 1;
		if ( details && details.attractionPower !== undefined )
			attractionPower = details.attractionPower;
		gravitation.getAttractionPower = function() {
			return attractionPower;
		}

		if ( details.render !== undefined ) {
			var positionShape = {};
			positionShape.x = entity.b2body.GetPosition().x * _worldManager.getScale();
			positionShape.y = entity.b2body.GetPosition().y * _worldManager.getScale();
			positionShape.angle = entity.b2body.GetAngle() * (180/Math.PI);
			positionShape.shape = 'circle';
			positionShape.circleOpts = { radius : gravityRadius * _worldManager.getScale() };

			gravitation.view = MyGameBuilder.Render.createView(worldManager, positionShape, details.render);
			gravitation.view.addEventListener('tick', function() {
				gravitation.view.x = entity.b2body.GetPosition().x * _worldManager.getScale();
				gravitation.view.y = entity.b2body.GetPosition().y * _worldManager.getScale();
				gravitation.view.rotation = entity.b2body.GetAngle() * (180/Math.PI);
			});

			var index = entity.b2body.GetUserData().render.z;
			entity.b2body.GetUserData().render.z++;
			_worldManager.getEaseljsStage().addChildAt(gravitation.view, index);
		}
	}

	Gravitation.prototype.update = function() {
		if ( _worldManager.getEnableDebug() )
			drawGravityRadius(this);

		var entities = _worldManager.getEntities();
		for ( var i = 0; i < entities.length; i++ ) {
			var attractedEntity = entities[i];
			var attractedEntityBody = attractedEntity.b2body;

			if ( attractedEntity === this.getEntity() || attractedEntityBody.GetType() !==  box2d.b2Body.b2_dynamicBody )
				continue;

			var attractedEntityPosition = attractedEntityBody.GetWorldCenter();
			if ( _worldManager.getEnableDebug() )
				drawPoint(attractedEntityPosition);

			var gravitationEntityPosition = this.getEntity().b2body.GetWorldCenter();
			if ( _worldManager.getEnableDebug() )
				drawPoint(gravitationEntityPosition);

			var gravitationEntityDistance = new box2d.b2Vec2(0,0);
			gravitationEntityDistance.Add(attractedEntityPosition);
			gravitationEntityDistance.Subtract(gravitationEntityPosition);

			var finalDistance = gravitationEntityDistance.Length();
			if ( finalDistance <= this.getGravityRadius() ) {
				gravitationEntityDistance.NegativeSelf();
				var vecSum = Math.abs(gravitationEntityDistance.x) + Math.abs(gravitationEntityDistance.y);
				gravitationEntityDistance.Multiply((1/vecSum) * (this.getGravityRadius()*this.getAttractionPower()/10)/finalDistance);
				attractedEntityBody.ApplyForce(gravitationEntityDistance, attractedEntityBody.GetWorldCenter());
			}			
		}
	}

	function getEntityRadius(entity) {
		var entityShape = entity.b2body.GetFixtureList().GetShape();

		var entityRadius
		if ( entityShape.GetType() === Box2D.Collision.Shapes.b2Shape.e_circleShape )
			entityRadius = entityShape.GetRadius();
		else {
			var entityCenter = entity.b2body.GetWorldCenter();
			var entityRadius = 0;
			for ( var i = 0; i < entityShape.GetVertices().length; i++ ) {
				var vertice = entityShape.GetVertices()[i];
				var dist = new box2d.b2Vec2(0,0);
				dist.Add(vertice);
				var finalDist = dist.Length();
				if ( finalDist > entityRadius )
					entityRadius = finalDist;
			}
		}

		return entityRadius;
	}

	function drawGravityRadius(gravitation) {
		var c = _worldManager.getBox2dCanvasCtx();

		var x = gravitation.getEntity().b2body.GetPosition().x * _worldManager.getScale();
		var y = gravitation.getEntity().b2body.GetPosition().y * _worldManager.getScale();
		var radius = gravitation.getGravityRadius() * _worldManager.getScale();

		c.beginPath();
		c.lineWidth = "1";
		c.strokeStyle = "cyan";
		c.arc(x, y, radius, 0, Math.PI*2, true); 
		c.stroke()	
	}

	function drawPoint(point) {
		var c = _worldManager.getBox2dCanvasCtx();

		var x = point.x * _worldManager.getScale();
		var y = point.y * _worldManager.getScale();
		var radius = 1;

		c.beginPath();
		c.fillStyle = "yellow";
		c.arc(x, y, radius, 0, Math.PI*2, true); 
		c.fill()	
	}	

	function validate(worldManager, entity, details) {
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if ( !(entity instanceof MyGameBuilder.Entity) )
			throw new Error(arguments.callee.name + " : entity must be an instance of Entity!");

		if ( details !== undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : The Gravitation details must be an object!");

			for ( var def in details )
				if ( _validGravitationDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Gravitation is not supported! Valid definitions: " + _validGravitationDef);

			if ( details.gravityRadius !== undefined && (typeof details.gravityRadius != 'number' || details.gravityRadius <= 0) )
				throw new Error(arguments.callee.name + " : invalid value for gravityRadius!");

			if ( details.attractionPower !== undefined && (typeof details.attractionPower != 'number' || details.attractionPower <= 0) )
				throw new Error(arguments.callee.name + " : invalue value for attractionPower!");
		}
	}

})();