this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.Wind = Wind

	function Wind(worldManager, details) { initialize(this, worldManager, details) }

	const _validWindDef = ['numRays', 'power', 'on', 'directionTo', 'width', 'height', 'adjustX', 'adjustY']
	const _validWindDirectionToDef = ['left', 'right']

	let _worldManager

	function initialize(wind, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		const canvas = worldManager.getBox2dCanvas()

		let numRays = (details && details.numRays) ? details.numRays : 20
		wind.getNumRays = function () { return numRays }

		let power = (details && details.power) ? details.power : 1000
		wind.getPower = function () { return power }

		let on = (details && details.on !== undefined) ? details.on : true
		wind.isOn = function () { return on }

		let directionTo = -1 //left
		if (details && details.directionTo) {
			if (details.directionTo.toLowerCase() === 'right') {
				directionTo = 1
			}
		}
		wind.getDirectionTo = function () { return directionTo }

		const width = (details && details.width) ? details.width : canvas.width
		const height = (details && details.height) ? details.height : canvas.width
		const adjustX = (details && details.adjustX) ? details.adjustX : 0
		const adjustY = (details && details.adjustY) ? details.adjustY : 0

		const rays = []
		const d = height / (numRays + 1)
		for (let i = d + adjustY; i < height; i += d) {
			let xBegin, xEnd, y
			if (directionTo === -1) {
				xBegin = (canvas.width - adjustX) / _worldManager.getScale()
				xEnd = (canvas.width - width) / _worldManager.getScale()
			}
			else {
				xBegin = adjustX / _worldManager.getScale()
				xEnd = (width + adjustX) / _worldManager.getScale()
			}
			y = i / _worldManager.getScale()

			const begin = new box2d.b2Vec2(xBegin, y)
			const end = new box2d.b2Vec2(xEnd, y)
			rays.push({ begin, end })
		}
		wind.getRays = function () { return rays }

		wind.start = function () { on = true }
		wind.stop = function () { on = false }

		let bodiesAffectedByRay = []
		wind.getBodiesAffectedByRay = function () { return bodiesAffectedByRay }
		wind.clearBodiesAffectedByRay = function () { bodiesAffectedByRay = [] }
	}

	Wind.prototype.update = function (countTick) {
		if (!this.isOn()) {
			return
		}

		const rays = this.getRays()
		const directionTo = this.getDirectionTo()
		const numRays = this.getNumRays()
		const power = this.getPower()

		for (let i = 0; i < rays.length; i++) {
			const ray = rays[i]

			if (_worldManager.getEnableDebug()) {
				drawRay(ray)
			}

			const wind = this
			_worldManager.getWorld().RayCast(
				function (fixture, point, normal, fraction) {
					const rayBody = { body: fixture.GetBody(), point }
					wind.getBodiesAffectedByRay().push(rayBody)
				},
				ray.begin,
				ray.end
			)

			const bodiesAffectedByRay = this.getBodiesAffectedByRay()
			if (bodiesAffectedByRay.length > 0) {
				const fnCompare = (directionTo === -1) ? compareDecrescent : compareCrescent
				bodiesAffectedByRay.sort(fnCompare)

				for (let j = 0; j < bodiesAffectedByRay.length; j++) {
					const body = bodiesAffectedByRay[j].body
					if (body.GetType() === box2d.b2Body.b2_staticBody) {
						break
					}

					const point = bodiesAffectedByRay[j].point
					if (countTick % _worldManager.getTickMod() === 0) {
						const force = new box2d.b2Vec2(directionTo * power / numRays, 0)
						body.ApplyForce(force, point)
					}

					if (_worldManager.getEnableDebug()) {
						drawPointToPoint(ray.begin, point)
					}
				}
				this.clearBodiesAffectedByRay()
			}
		}
	}

	function compareDecrescent(a, b) {
		return b.point.x - a.point.x
	}

	function compareCrescent(a, b) {
		return a.point.x - b.point.x
	}

	function drawRay(ray) {
		const c = _worldManager.getBox2dCanvasCtx()
		c.beginPath()
		c.lineWidth = "1"
		c.strokeStyle = "#bbb"
		c.moveTo(ray.begin.x * _worldManager.getScale(), ray.begin.y * _worldManager.getScale())
		c.lineTo(ray.end.x * _worldManager.getScale(), ray.end.y * _worldManager.getScale())
		c.stroke()
	}

	function drawPointToPoint(p1, p2) {
		const c = _worldManager.getBox2dCanvasCtx()
		c.beginPath()
		c.lineWidth = "1"
		c.strokeStyle = "white"
		c.moveTo(p1.x * _worldManager.getScale(), p1.y * _worldManager.getScale())
		c.lineTo(p2.x * _worldManager.getScale(), p2.y * _worldManager.getScale())
		c.stroke()
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The Wind details must be an object!")
			}

			for (let def in details) {
				if (_validWindDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Wind is not supported! Valid definitions: " + _validWindDef)
				}
			}

			if (details.numRays && (typeof details.numRays !== 'number' || details.numRays <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for numRays!")
			}

			if (details.power && (typeof details.power !== 'number' || details.power <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for power!")
			}

			if (details.on && typeof details.on !== 'boolean') {
				throw new Error(arguments.callee.name + " : on must be true/false!")
			}

			if (details.directionTo) {
				if (typeof details.directionTo !== 'string') {
					throw new Error(arguments.callee.name + " : directionTo must be a string!")
				}
				else if (_validWindDirectionToDef.indexOf(details.directionTo.toLowerCase()) < 0) {
					throw new Error(arguments.callee.name + " : directionTo must be " + _validWindDirectionToDef)
				}
			}

			if (details.width && (typeof details.width !== 'number' || details.width <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for width!")
			}

			if (details.height && (typeof details.height !== 'number' || details.height <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for height!")
			}

			if (details.adjustX && typeof details.adjustX !== 'number') {
				throw new Error(arguments.callee.name + " : adjustX must be a number!")
			}

			if (details.adjustY && typeof details.adjustY !== 'number') {
				throw new Error(arguments.callee.name + " : adjustY must be a number!")
			}
		}
	}

})()