this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.SoundHandler = SoundHandler

	function SoundHandler(details) {
		initialize(this, details)
	}

	const _validSoundHandlerDef = ['registerFiles']
	const _validSoundInstanceDef = ['id', 'src']

	function initialize(soundHandler, details) {
		validate(details)

		// If initializeDefaultPlugins returns false, sound cannot be played in the browser
		if (!createjs.Sound.initializeDefaultPlugins()) {
			console.warn('It was not possible to initialize sound plugins!')
			return
		}

		const soundInstanceList = []

		if (details && details.registerFiles) {
			createjs.Sound.addEventListener("fileload", handleSoundLoad)
			createjs.Sound.registerSounds(details.registerFiles)
		}

		soundHandler.addSoundInstance = function (soundInstance) {
			soundInstanceList.push(soundInstance)
		}

		soundHandler.getSoundInstance = function (id) {
			const soundInstance = soundInstanceList.filter(si => si.id === id)[0]
			if (!soundInstance) {
				console.warn('The soundInstance \'' + id + '\' was not found!')
			}
			return soundInstance
		}

		soundHandler.createSoundInstance = function (details) {
			validateSoundInstance(details)

			let soundInstance = details.src ?
				createjs.Sound.createInstance(details.src) : createjs.Sound.createInstance(details.id)

			soundInstance.id = details.id ? details.id : details.src

			soundInstance.isPlaying = function () {
				return !soundInstance.paused && soundInstance.playState === createjs.Sound.PLAY_SUCCEEDED
			}

			soundInstance.isStopped = function () {
				return soundInstance.playState === createjs.Sound.PLAY_FINISHED
			}

			soundInstance.isPaused = function () {
				return soundInstance.paused && soundInstance.playState === createjs.Sound.PLAY_SUCCEEDED
			}

			soundInstance.myPlay = function (options) {
				let interrupt = (options && options.interrupt) ? options.interrupt : createjs.Sound.INTERRUPT_NONE
				let delay = (options && options.delay) ? options.delay : 0
				let offset = (options && options.offset) ? options.offset : 0
				let loop = (options && options.loop) ? options.loop : 0
				let volume = (options && options.volume) ? options.volume : 1
				let pan = (options && options.pan) ? options.pan : 0
				return soundInstance.play({ interrupt, delay, offset, loop, volume, pan })
			}

			return soundInstance
		}
	}

	function handleSoundLoad(e) {
		console.log('handleSoundLoad: \'' + e.src + '\' loaded!')
	}

	function validate(details) {
		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : the sound details must be informed!")
			}
			for (let def in details) {
				if (_validSoundHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for soundHandler is not supported! Valid definitions: " + _validSoundHandlerDef)
				}
			}

			if (details.registerFiles) {
				if (!(details.registerFiles instanceof Array)) {
					throw new Error(arguments.callee.name + " : registerFiles must be an Array!")
				}
				if (details.registerFiles.length === 0) {
					throw new Error(arguments.callee.name + " : registerFiles must have at least 1 file!")
				}
				details.registerFiles.forEach(soundInstance => validateSoundInstance(soundInstance))
			}
		}
	}

	function validateSoundInstance(details) {
		if (typeof details !== 'object') {
			throw new Error(arguments.callee.name + " : the sound details must be informed!")
		}
		for (let def in details) {
			if (_validSoundInstanceDef.indexOf(def) < 0) {
				throw new Error(arguments.callee.name + " : the detail (" + def + ") for soundInstance is not supported! Valid definitions: " + _validSoundInstanceDef)
			}
		}
		
		if (details.src === undefined && details.id === undefined) {
			throw new Error(arguments.callee.name + " : src or id must be informed!")
		}
		if (details.src !== undefined && typeof details.src !== 'string') {
			throw new Error(arguments.callee.name + " : src must be a string!")
		}
		if (details.id !== undefined && typeof details.id !== 'string') {
			throw new Error(arguments.callee.name + " : id must be a string!")
		}
	}

})()