this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.BreakHandler = BreakHandler

	const _MIN_PIECE_AREA = 0.1

	function BreakHandler(worldManager, details) {
		initialize(this, worldManager, details)
	}

	const _validBreakHandlerDef = ['numCuts', 'explosion', 'explosionRadius']

	let _worldManager
	let _entryPoint, _breakBodies, _affectedByLaser
	let _pieces

	function initialize(breakHandler, worldManager, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		let numCuts = (details && details.numCuts !== undefined) ? details.numCuts : 5
		breakHandler.getNumCuts = function () { return numCuts }
		breakHandler.setNumCuts = function (value) { numCuts = value }

		let explosion = (details && details.explosion !== undefined) ? details.explosion : false
		breakHandler.hasExplosion = function () { return explosion }
		breakHandler.setExplosion = function (value) { explosion = value }

		let explosionRadius = 0
		if (explosion) {
			explosionRadius = (details && details.explosionRadius !== undefined) ? details.explosionRadius : 50
		}
		breakHandler.getExplosionRadius = function () { return explosionRadius }
		breakHandler.setExplosionRadius = function (value) { explosionRadius = value }
	}

	BreakHandler.prototype.breakEntity = function (entity, x, y, angles) {
		validateBreakEntity(entity, x, y, angles)
		fnBreakEntity(this, entity, x, y, angles)
	}

	function validateBreakEntity(entity, x, y, angles) {
		if (!(entity instanceof Box2DCreateJS.Entity)) {
			throw new Error(arguments.callee.name + " : entity must be an instance of Entity!")
		}

		const entityBody = entity.b2body
		if (entityBody.GetType() !== box2d.b2Body.b2_dynamicBody) {
			console.warn('A non-dynamic entity cannot be broken!')
			return
		}
		if (!entityBody.GetFixtureList()) {
			return
		}
		if (entityBody.GetFixtureList().GetShape().GetType() !== Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			console.warn('An entity that has a non-polygonal shape can not be broken! Type == ' + entityBody.GetFixtureList().GetShape().GetType())
			return
		}

		if (x !== undefined && typeof x !== 'number') {
			throw new Error(arguments.callee.name + " : x must be a number!")
		}
		if (y !== undefined && typeof y !== 'number') {
			throw new Error(arguments.callee.name + " : y must be a number!")
		}
		if (angles !== undefined && !(angles instanceof Array)) {
			throw new Error(arguments.callee.name + " : angles must be an Array!")
		}
	}

	function fnBreakEntity(breakHandler, entity, x, y, angles) {
		if (_worldManager.getTimeStep() === 0) { // Do not execute when it's paused
			return
		}

		const { adjustX, adjustY } = _worldManager.getCameraAdjust()
		const breakCenterX = x + adjustX
		const breakCenterY = y + adjustY
		const cutAngles = getCutAngles(breakHandler, angles)

		_breakBodies = [entity.b2body]

		const range = _worldManager.getEaseljsCanvas().width / 2
		const scale = _worldManager.getScale()

		cutAngles.forEach(cutAngle => {
			const laserSegment = new Box2D.Collision.b2Segment()
			laserSegment.p1 = new box2d.b2Vec2(
				(breakCenterX + i / 10 - range * Math.cos(cutAngle)) / scale,
				(breakCenterY - range * Math.sin(cutAngle)) / scale
			)
			laserSegment.p2 = new box2d.b2Vec2(
				(breakCenterX + range * Math.cos(cutAngle)) / scale,
				(breakCenterY + range * Math.sin(cutAngle)) / scale
			)

			_affectedByLaser = []
			_entryPoint = []
			_pieces = []

			_worldManager.getWorld().RayCast(rayCastCallback, laserSegment.p1, laserSegment.p2)
			_worldManager.getWorld().RayCast(rayCastCallback, laserSegment.p2, laserSegment.p1)
		})

		if (breakHandler.hasExplosion()) {
			_breakBodies.forEach(b2body => {
				const vel = getExplosionVelocity(breakHandler, b2body, breakCenterX, breakCenterY)
				b2body.SetLinearVelocity(vel)
			})
		}

		if (entity.onbreak !== undefined) {
			entity.onbreak(_pieces)
		}
	}

	function rayCastCallback(fixture, point, normal, fraction) {
		laserFired(fixture, point, normal, fraction)
	}

	function laserFired(fixture, point) {
		const fixtureBody = fixture.GetBody()

		if (_breakBodies.indexOf(fixtureBody) === -1) {
			return
		}

		const fixtureIndex = _affectedByLaser.indexOf(fixtureBody)
		if (fixtureIndex === -1) {
			_affectedByLaser.push(fixtureBody)
			_entryPoint.push(point)
		}
		else {
			const { polygon1Vertices, polygon2Vertices } = getNew2PolygonVertices(fixture, point, _entryPoint[fixtureIndex])

			const entity = _worldManager.getEntityByItsBody(fixtureBody)
			if (getArea(polygon1Vertices) >= _MIN_PIECE_AREA) {
				_pieces.push(createPiece(entity, polygon1Vertices, 1))
			}
			if (getArea(polygon2Vertices) >= _MIN_PIECE_AREA) {
				_pieces.push(createPiece(entity, polygon2Vertices, 2))
			}

			_worldManager.deleteEntity(entity)

			// fixtureBody must be destroyed now in order to not interfere in the next laserFired calls
			_worldManager.getWorld().DestroyBody(fixtureBody)
		}
	}

	function getCutAngles(breakHandler, angles) {
		const cutAngles = []
		let nCuts = 0
		if (angles) { // Informed angles
			angles.forEach(angle => cutAngles.push(angle * Math.PI / 180))
			nCuts += angles.length
		}
		while (nCuts < breakHandler.getNumCuts()) { // Random angles
			cutAngles.push(Math.random() * Math.PI * 2)
			nCuts++
		}
		return cutAngles
	}

	function createPiece(entity, vertices, id) {
		const center = findCentroid(vertices).center
		vertices.forEach(vertice => vertice.Subtract(center))

		const piece = createEntityPiece(_worldManager, entity, vertices, center, id)

		vertices.forEach(vertice => vertice.Add(center))

		_breakBodies.push(piece.b2body)
		return piece
	}

	function getExplosionVelocity(breakHandler, b2body, breakCenterX, breakCenterY) {
		const explosionRadius = breakHandler.getExplosionRadius()

		let distX = b2body.GetWorldCenter().x * _worldManager.getScale() - breakCenterX
		if (distX < 0) {
			distX = (distX < -explosionRadius) ? 0 : -explosionRadius - distX
		}
		else {
			distX = (distX > explosionRadius) ? 0 : explosionRadius - distX
		}

		let distY = b2body.GetWorldCenter().y * _worldManager.getScale() - breakCenterY
		if (distY < 0) {
			distY = (distY < -explosionRadius) ? 0 : -explosionRadius - distY
		}
		else {
			distY = (distY > explosionRadius) ? 0 : explosionRadius - distY
		}

		distX *= 0.25
		distY *= 0.25
		return new box2d.b2Vec2(distX, distY)
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The BreakHandler details must be an object!")
			}
			for (let def in details) {
				if (_validBreakHandlerDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for BreakHandler is not supported! Valid definitions: " + _validBreakHandlerDef)
				}
			}
			if (details.numCuts !== undefined && (typeof details.numCuts !== 'number' || details.numCuts <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for numCuts!")
			}
			if (details.explosion !== undefined && typeof details.explosion !== 'boolean') {
				throw new Error(arguments.callee.name + " : explosion must be true/false!")
			}
			if (details.explosionRadius !== undefined && (typeof details.explosionRadius !== 'number' || details.explosionRadius <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for explosionRadius!")
			}
		}
	}

})()