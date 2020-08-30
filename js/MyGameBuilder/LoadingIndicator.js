//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	
	MyGameBuilder.LoadingIndicator = LoadingIndicator;
	
	//Constructor
	function LoadingIndicator(worldManager, details) {
		initialize(this, worldManager, details);
	}
	
	var _validLoadindIndicatorDef = ['x', 'y', 'font', 'color'];
	
	function initialize(loading, worldManager, details) {
		validate(worldManager, details);
		
		var x = 10;
		if ( details && details.x !== undefined )
			x = details.x;
		
		var y = 30;
		if ( details && details.y !== undefined )
			y = details.y;
		
		var font = 'bold 18px Arial';
		if ( details && details.font !== undefined )
			font = details.font;
		
		var color = 'white';
		if ( details && details.color !== undefined )
			color = details.color;		
		
		loading.view = new createjs.Text("-- %", font, color);
		loading.view.x = x;
		loading.view.y = y;
		worldManager.getEaseljsStage().addChild(loading.view);		
	}
	
	LoadingIndicator.prototype.update = function(progress) {
		this.view.text = progress + " %";
	}
	
	function validate(worldManager, details) {
		if ( !(worldManager instanceof MyGameBuilder.WorldManager) )
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");
		
		if ( details !== undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : The LoadingIndicator details must be an object!");
			
			for ( var def in details )
				if ( _validLoadindIndicatorDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for LoadingIndicator is not supported! Valid definitions: " + _validLoadindIndicatorDef);
			
			if ( details.x !== undefined && typeof details.x != 'number' )
				throw new Error(arguments.callee.name + " : x must be a number!");
			
			if ( details.y !== undefined && typeof details.y != 'number' )
				throw new Error(arguments.callee.name + " : y must be a number!");

			if ( details.font !== undefined && typeof details.font != 'string' )
				throw new Error(arguments.callee.name + " : font must be a string! See EaselJS documentation: http://www.createjs.com/Docs/EaselJS/classes/Text.html");
			
			if ( details.color !== undefined && typeof details.color != 'string' )
				throw new Error(arguments.callee.name + " : color must be a string! See EaselJS documentation: http://www.createjs.com/Docs/EaselJS/classes/Text.html");
		}
	}
	
})();