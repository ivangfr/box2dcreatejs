//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function() {
	
	MyGameBuilder.SoundHandler = SoundHandler;
	
	//Constructor
	function SoundHandler(details) {
		initialize(this, details);
	}
	
	var _validSoundHandlerDef = ['registerFiles'];
	var _validSoundInstanceDef = ['id', 'src'];
	
	function initialize(soundHandler, details) {
		validate(details);
		
		// if initializeDefaultPlugins returns false, we cannot play sound in this browser
        if ( !createjs.Sound.initializeDefaultPlugins() ) {
            console.warn('It was not possible to initialize sound plugins!');
            return;
        }
		
		var soundInstanceList = [];
		
		
		if ( details && details.registerFiles !== undefined ) {
			createjs.Sound.addEventListener("fileload", handleSoundLoad);
			
			createjs.Sound.registerManifest(details.registerFiles);
		}

		soundHandler.addSoundInstance = function(soundInstance) {
			soundInstanceList.push(soundInstance);
		}
		
		soundHandler.getSoundInstance = function(id) {
			var soundInstance = null;
			for ( var i = 0; i < soundInstanceList.length; i++ ) {
				var si = soundInstanceList[i];
				if ( si.id == id ) {
					soundInstance = si;
					break;
				}
			}
			
			if ( soundInstance === null )
				console.warn('The soundInstance \'' + id + '\' was not found!');
			
			return soundInstance;
		}
		
		soundHandler.createSoundInstance = function(details) {
			validateCreateSoundParams(details);
			
			var soundInstance;
			if ( details.src !== undefined )
				soundInstance = createjs.Sound.createInstance(details.src);
			else
				soundInstance = createjs.Sound.createInstance(details.id);
			
			soundInstance.id = details.src;
			if ( details.id !== undefined )
				soundInstance.id = details.id;
			
			soundInstance.isPlaying = function() {
				return (!soundInstance.paused && soundInstance.playState == createjs.Sound.PLAY_SUCCEEDED);
			}
			
			soundInstance.isStopped = function() {
				return (soundInstance.playState == createjs.Sound.PLAY_FINISHED);
			}
			
			soundInstance.isPaused = function() {
				return (soundInstance.paused && soundInstance.playState == createjs.Sound.PLAY_SUCCEEDED);
			}
			
			soundInstance.myPlay = function(options) {
				var interrupt = createjs.Sound.INTERRUPT_NONE,
				    delay = 0,
				    offset = 0,
				    loop = 0,
				    volume = 1,
				    pan = 0;
				
				if ( options !== undefined ) {
					if ( options.interrupt !== undefined )
						interrupt = options.interrupt;
					
					if ( options.delay !== undefined )
						delay = options.delay;
					
					if ( options.offset !== undefined )
						offset = options.offset;
					
					if ( options.loop !== undefined )
						loop = options.loop;
					
					if ( options.volume !== undefined )
						volume = options.volume;
					
					if ( options.pan !== undefined )
						pan = options.pan;
				}
				
				return soundInstance.play(interrupt, delay, offset, loop, volume, pan);
			}			
			
			return soundInstance;
		}
	}
	
	function handleSoundLoad(e) {
		console.log('handleSoundLoad: \'' + e.src + '\' loaded!');
	}
	
	function validate(details) {
		
		if ( details !== undefined ) {
			if ( typeof details != 'object' )
				throw new Error(arguments.callee.name + " : the sound details must be informed!");
			
			for ( var def in details )
				if ( _validSoundHandlerDef.indexOf(def) < 0 )
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for soundHandler is not supported! Valid definitions: " + _validSoundHandlerDef);
			
			if ( details.registerFiles !== undefined ) {
				if ( !(details.registerFiles instanceof Array) )
					throw new Error(arguments.callee.name + " : registerFiles must be an Array!");
				else if ( details.registerFiles.length == 0 )
					throw new Error(arguments.callee.name + " : registerFiles must have at least 1 file!");
				else {
					for ( var i = 0; i < details.registerFiles.length; i++ ) {
						if ( typeof details.registerFiles[i] != 'object' )
							throw new Error(arguments.callee.name + " : registerFiles element must be an object! See http://www.createjs.com/Docs/SoundJS/classes/Sound.html#method_registerManifest");
						else if ( details.registerFiles[i].src === undefined )
							throw new Error(arguments.callee.name + " : src property of the registerFiles element must be informed! See http://www.createjs.com/Docs/SoundJS/classes/Sound.html#method_registerManifest");
					}
				}
			}
		}		
	}
	
	function validateCreateSoundParams(details) {
		if ( typeof details != 'object' )
			throw new Error(arguments.callee.name + " : the sound details must be informed!");
		
		for ( var def in details )
			if ( _validSoundInstanceDef.indexOf(def) < 0 )
				throw new Error(arguments.callee.name + " : the detail (" + def + ") for soundInstance is not supported! Valid definitions: " + _validSoundInstanceDef);
		
		if ( details.src === undefined && details.id === undefined )
			throw new Error(arguments.callee.name + " : src or id must be informed!");
		
		if ( details.src !== undefined && typeof details.src != 'string' )
			throw new Error(arguments.callee.name + " : src must be a string!");
		
		if ( details.id !== undefined && typeof details.id != 'string' )
			throw new Error(arguments.callee.name + " : id must be a string!");
	}
	
})();