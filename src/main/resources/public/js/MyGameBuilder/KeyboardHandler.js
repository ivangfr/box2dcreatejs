this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.KeyboardHandler = KeyboardHandler

	function KeyboardHandler(worldManager, details) {
		initialize(worldManager, details)
	}

	const _validKeyboardHandlerDef = ['onkeydown', 'onkeyup', 'keepPressed']

	let _worldManager
	let _keys, _keysDown

	function initialize(worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		_keys = []
		_keysDown = {}

		if (details !== undefined) {
			for (let k in details) {
				const key = {}

				key.keyCode = k
				key.isKeyDown = false
				key.keepPressed = (details[k].keepPressed !== undefined) ? details[k].keepPressed : false

				if (details[k].onkeydown !== undefined) {
					key.onKeyDown = details[k].onkeydown
				}
				if (details[k].onkeyup !== undefined) {
					key.onKeyUp = details[k].onkeyup
				}

				_keys.push(key)
			}
		}

		window.addEventListener("keydown", keyDownHandler)
		window.addEventListener("keyup", keyUpHandler)
	}

	KeyboardHandler.prototype.update = function (countTick) {
		_keys.forEach(key => {
			for (let p in _keysDown) {
				if (key.keyCode === p) {
					if (!key.isKeyDown) {
						key.isKeyDown = true
						if (key.onKeyDown !== undefined) {
							key.onKeyDown(_keysDown[p])
						}
					}
					else if (key.keepPressed && countTick % _worldManager.getTickMod() === 0) {
						key.onKeyDown(_keysDown[p])
					}
				}
			}
		})
	}

	function keyDownHandler(e) {
		e = e || window.event

		for (let i = 0; i < _keys.length; i++) {
			const key = _keys[i]
			if (key.keyCode == e.which) {
				_keysDown[e.which] = e
				break
			}
		}
	}

	function keyUpHandler(e) {
		e = e || window.event

		for (let i = 0; i < _keys.length; i++) {
			const key = _keys[i]
			if (key.keyCode == e.which) {
				key.isKeyDown = false
				if (key.onKeyUp !== undefined) {
					key.onKeyUp(e)
				}
				delete _keysDown[e.which]
				break
			}
		}
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The KeyboardHandler details must be an object!")
			}

			for (let key in details) {
				if (!isPositiveInteger(key)) {
					throw new Error(arguments.callee.name + " : incorrect value for keyboard keycode (" + key + ")!")
				}
				for (let def in details[key]) {
					if (_validKeyboardHandlerDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") is not supported! Valid definitions: " + _validKeyboardHandlerDef)
					}
				}
				if (details[key].keepPressed !== undefined && typeof details[key].keepPressed !== 'boolean') {
					throw new Error(arguments.callee.name + " : keepPressed must be a true/false!")
				}
				if (details[key].onkeydown !== undefined && typeof details[key].onkeydown !== 'function') {
					throw new Error(arguments.callee.name + " : onkeydown must be a function!")
				}
				if (details[key].onkeyup !== undefined && typeof details[key].onkeyup !== 'function') {
					throw new Error(arguments.callee.name + " : onkeyup must be a function!")
				}
			}
		}

		function isPositiveInteger(value) {
			return value === "0" || ((value | 0) > 0 && value % 1 === 0)
		}
	}

})()