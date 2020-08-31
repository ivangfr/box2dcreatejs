//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {

	MyGameBuilder.Player = Player;
	
	//Constructor
	function Player(worldManager, entity, details) {
		initialize(this, worldManager, entity, details);
	}
	
	var _validPlayerDef = ['camera', 'events'];
	
	function initialize(player, worldManager, entity, details) {
		validate(worldManager, entity, details);

		var playerEntity = entity;
		player.getEntity = function() {
			return playerEntity;
		}		
		
		var b2Body = entity.b2body;
		player.getB2Body = function() {
			return b2Body;
		}
		
		player.getPosition = function() {
			return {
				x: b2Body.GetWorldCenter().x * worldManager.getScale(),
				y: b2Body.GetWorldCenter().y * worldManager.getScale()
			};
		}
		
		var camera = new MyGameBuilder.Camera(worldManager, details.camera);
		player.getCamera = function() {
			return camera;
		}

		if ( details && details.events )
			for ( var event in details.events )
				player[event] = details.events[event];
		
		player.getCameraAdjust = function() {
			var adjustX = 0, adjustY = 0;
			
			if ( camera.getXAxisOn() )
				adjustX = player.getPosition().x;
			if ( camera.getAdjustX() !== 0 )
				adjustX -= camera.getAdjustX();
				
			if ( camera.getYAxisOn() )
				adjustY = player.getPosition().y;
			if ( camera.getAdjustY() !== 0 )
				adjustY -= camera.getAdjustY();

			return {
				adjustX : adjustX,
				adjustY : adjustY
			};
		}
		
		player.isNecessaryToFocus = function() {
			return (camera.getAdjustX() !== 0 || camera.getAdjustY() !== 0 || camera.getXAxisOn() || camera.getYAxisOn());
		}
	}
	
	function validate(worldManager, entity, details) {
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");
		
		if ( !(entity instanceof MyGameBuilder.Entity) )
			throw new Error(arguments.callee.name + " : entity must be an instance of Entity!");
		
		var players = worldManager.getPlayers();
		for ( var i = 0; i < players.length; i++ )
			if ( entity === players[i].getEntity() )
				throw new Error(arguments.callee.name + " : the entity informed is already associated to another player!");
	
		if ( details !== undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : The Player details must be an object!");
			
			for ( var def in details )
				if ( _validPlayerDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Player is not supported! Valid definitions: " + _validPlayerDef);
	
			if ( details.events !== undefined ) {
				for ( var ev in details.events )
					if ( typeof details.events[ev] != 'function' )
						throw new Error(arguments.callee.name + " : (" + ev + ") must be a function!");
			}
		}
	}
	
})();