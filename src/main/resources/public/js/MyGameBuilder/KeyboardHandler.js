this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.KeyboardHandler = KeyboardHandler

	function KeyboardHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validKeyboardHandlerDef = ['keys', 'keyboardHint']
	const _validKeyboardHandlerKeyboardHintDef = ['enabled', 'x', 'y', 'color', 'font']
	const _validKeyboardHandlerKeysDef = ['onkeydown', 'onkeyup', 'keepPressed']

	let _worldManager
	let _keyboardHint, _keyboardHintText
	let _keyboardEvents, _downKeyboardEvents

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager
		_keyboardEvents = []
		_downKeyboardEvents = {}

		_keyboardHint = {
			enabled: false,
			x: 80, y: 10,
			color: 'white',
			font: 'bold 12px Monaco'
		}

		if (details !== undefined) {
			if (details.keyboardHint !== undefined) {
				if (details.keyboardHint.enabled !== undefined) {
					_keyboardHint.enabled = details.keyboardHint.enabled
				}
				if (details.keyboardHint.x !== undefined) {
					_keyboardHint.x = details.keyboardHint.x
				}
				if (details.keyboardHint.y !== undefined) {
					_keyboardHint.y = details.keyboardHint.y
				}
				if (details.keyboardHint.color !== undefined) {
					_keyboardHint.color = details.keyboardHint.color
				}
				if (details.keyboardHint.font !== undefined) {
					_keyboardHint.font = details.keyboardHint.font
				}
			}

			const keyList = []
			if (details.keys !== undefined) {
				for (let key in details.keys) {
					const keyboardEvent = {}
					keyboardEvent.key = key
					keyboardEvent.isKeyDown = false
					keyboardEvent.keepPressed = (details.keys[key].keepPressed !== undefined) ? details.keys[key].keepPressed : false

					if (details.keys[key].onkeydown !== undefined) {
						keyboardEvent.onKeyDown = details.keys[key].onkeydown
					}
					if (details.keys[key].onkeyup !== undefined) {
						keyboardEvent.onKeyUp = details.keys[key].onkeyup
					}
					_keyboardEvents.push(keyboardEvent)
					keyList.push(key)
				}
			}

			if (_keyboardHint.enabled) {
				createKeyboardHintBoard(keyList)
			}
		}

		window.addEventListener("keydown", keyDownHandler)
		window.addEventListener("keyup", keyUpHandler)
	}

	KeyboardHandler.prototype.getKeyboardHintText = function () { return _keyboardHintText }

	KeyboardHandler.prototype.update = function (countTick) {
		_keyboardEvents.forEach(keyboardEvent => {
			for (let downKey in _downKeyboardEvents) {
				if (keyboardEvent.key === downKey) {
					if (!keyboardEvent.isKeyDown) {
						keyboardEvent.isKeyDown = true
						if (keyboardEvent.onKeyDown !== undefined) {
							keyboardEvent.onKeyDown(_downKeyboardEvents[downKey])
						}
					}
					else if (keyboardEvent.keepPressed && countTick % _worldManager.getTickMod() === 0) {
						keyboardEvent.onKeyDown(_downKeyboardEvents[downKey])
					}
				}
			}
		})
	}

	function keyDownHandler(e) {
		e = e || window.event
		for (let i = 0; i < _keyboardEvents.length; i++) {
			const keyboardEvent = _keyboardEvents[i]
			if (keyboardEvent.key == e.key) {
				_downKeyboardEvents[e.key] = e
				break
			}
		}
	}

	function keyUpHandler(e) {
		e = e || window.event
		for (let i = 0; i < _keyboardEvents.length; i++) {
			const keyboardEvent = _keyboardEvents[i]
			if (keyboardEvent.key == e.key) {
				keyboardEvent.isKeyDown = false
				if (keyboardEvent.onKeyUp !== undefined) {
					keyboardEvent.onKeyUp(e)
				}
				delete _downKeyboardEvents[e.key]
				break
			}
		}
	}

	function createKeyboardHintBoard(keyList) {
		const keys = keyList.map(key => `[ ${key} ]`).join(' ')
		_keyboardHintText = new createjs.Text('Keyboard: ' + keys, _keyboardHint.font, _keyboardHint.color)
		_keyboardHintText.x = _keyboardHintText.x0 = _keyboardHint.x
		_keyboardHintText.y = _keyboardHintText.y0 = _keyboardHint.y
		_worldManager.getEaseljsStage().addChild(_keyboardHintText)
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The KeyboardHandler details must be an object!")
			}
			for (let p in details) {
				if (_validKeyboardHandlerDef.indexOf(p) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + p + ") is not supported! Valid definitions: " + _validKeyboardHandlerDef)
				}
			}

			if (details.keyboardHint !== undefined) {
				if (typeof details.keyboardHint !== 'object') {
					throw new Error(arguments.callee.name + " : keyboardHint must be an object!")
				}
				for (let def in details.keyboardHint) {
					if (_validKeyboardHandlerKeyboardHintDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validKeyboardHandlerKeyboardHintDef)
					}
				}
				if (details.keyboardHint.enabled !== undefined && typeof details.keyboardHint.enabled !== 'boolean') {
					throw new Error(arguments.callee.name + " : keyboardHint.enabled must be true/false!")
				}
				if (details.keyboardHint.x !== undefined && typeof details.keyboardHint.x !== 'number') {
					throw new Error(arguments.callee.name + " : keyboardHint.x must be a number!")
				}
				if (details.keyboardHint.y !== undefined && typeof details.keyboardHint.y !== 'number') {
					throw new Error(arguments.callee.name + " : keyboardHint.y must be a number!")
				}
				if (details.keyboardHint.font !== undefined && typeof details.keyboardHint.font !== 'string') {
					throw new Error(arguments.callee.name + " : keyboardHint.font must be a string! See EaselJS documentation: https://www.createjs.com/docs/easeljs/classes/Text.html")
				}
				if (details.keyboardHint.color !== undefined && typeof details.keyboardHint.color !== 'string') {
					throw new Error(arguments.callee.name + " : keyboardHint.color must be a string! See EaselJS documentation: https://www.createjs.com/docs/easeljs/classes/Text.html")
				}
			}

			if (details.keys !== undefined) {
				for (let key in details.keys) {
					for (let def in details.keys[key]) {
						if (_validKeyboardHandlerKeysDef.indexOf(def) < 0) {
							throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validKeyboardHandlerKeysDef)
						}
					}
					if (details.keys[key].keepPressed !== undefined && typeof details.keys[key].keepPressed !== 'boolean') {
						throw new Error(arguments.callee.name + " : keepPressed must be a true/false!")
					}
					if (details.keys[key].onkeydown !== undefined && typeof details.keys[key].onkeydown !== 'function') {
						throw new Error(arguments.callee.name + " : onkeydown must be a function!")
					}
					if (details.keys[key].onkeyup !== undefined && typeof details.keys[key].onkeyup !== 'function') {
						throw new Error(arguments.callee.name + " : onkeyup must be a function!")
					}
				}
			}
		}
	}

})()