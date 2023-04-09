this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.Gravitation = Gravitation

	function Gravitation(worldManager, entity, details) {
		initialize(this, worldManager, entity, details)
	}

	const _validGravitationDef = ['gravityRadius', 'attractionPower', 'render']

	let _worldManager

	function initialize(gravitation, worldManager, entity, details) {
		validate(worldManager, entity, details)

		_worldManager = worldManager

		const gravitationEntity = entity
		gravitation.getEntity = function () { return gravitationEntity }

		let gravityRadius = (details && details.gravityRadius !== undefined) ?
			details.gravityRadius / worldManager.getScale() : getEntityRadius(entity) * 3
		gravitation.getGravityRadius = function () { return gravityRadius }

		let attractionPower = (details && details.attractionPower !== undefined) ? details.attractionPower : 1
		gravitation.getAttractionPower = function () { return attractionPower }

		if (details.render !== undefined) {
			const entityPosition = entity.b2body.GetPosition()
			const entityAngle = entity.b2body.GetAngle()

			const positionShape = {}
			positionShape.x = entityPosition.x * _worldManager.getScale()
			positionShape.y = entityPosition.y * _worldManager.getScale()
			positionShape.angle = entityAngle * (180 / Math.PI)
			positionShape.shape = 'circle'
			positionShape.circleOpts = { radius: gravityRadius * _worldManager.getScale() }

			gravitation.view = Box2DCreateJS.Render.createView(worldManager, positionShape, details.render)
			gravitation.view.addEventListener('tick', function () {
				gravitation.view.x = entityPosition.x * _worldManager.getScale()
				gravitation.view.y = entityPosition.y * _worldManager.getScale()
				gravitation.view.rotation = entityAngle * (180 / Math.PI)
			})

			const entityUserData = entity.b2body.GetUserData()
			const index = entityUserData.render.z
			entityUserData.render.z++
			_worldManager.getEaseljsStage().addChildAt(gravitation.view, index)
		}
	}

	Gravitation.prototype.update = function () {
		if (_worldManager.getEnableDebug()) {
			drawGravityRadius(this)
		}

		const entities = _worldManager.getEntities()
		for (let i = 0; i < entities.length; i++) {
			const attractedEntity = entities[i]
			const attractedEntityBody = attractedEntity.b2body

			if (attractedEntity === this.getEntity() || attractedEntityBody.GetType() !== box2d.b2Body.b2_dynamicBody) {
				continue
			}

			const attractedEntityPosition = attractedEntityBody.GetWorldCenter()
			if (_worldManager.getEnableDebug()) {
				drawPoint(attractedEntityPosition)
			}

			const gravitationEntityPosition = this.getEntity().b2body.GetWorldCenter()
			if (_worldManager.getEnableDebug()) {
				drawPoint(gravitationEntityPosition)
			}

			const gravitationEntityDistance = new box2d.b2Vec2(0, 0)
			gravitationEntityDistance.Add(attractedEntityPosition)
			gravitationEntityDistance.Subtract(gravitationEntityPosition)

			const finalDistance = gravitationEntityDistance.Length()
			if (finalDistance <= this.getGravityRadius()) {
				gravitationEntityDistance.NegativeSelf()
				const vecSum = Math.abs(gravitationEntityDistance.x) + Math.abs(gravitationEntityDistance.y)
				gravitationEntityDistance.Multiply((1 / vecSum) * (this.getGravityRadius() * this.getAttractionPower() / 10) / finalDistance)
				attractedEntityBody.ApplyForce(gravitationEntityDistance, attractedEntityBody.GetWorldCenter())
			}
		}
	}

	function getEntityRadius(entity) {
		const entityShape = entity.b2body.GetFixtureList().GetShape()

		let entityRadius
		if (entityShape.GetType() === Box2D.Collision.Shapes.b2Shape.e_circleShape) {
			entityRadius = entityShape.GetRadius()
		}
		else {
			let entityRadius = 0
			for (let i = 0; i < entityShape.GetVertices().length; i++) {
				const vertice = entityShape.GetVertices()[i]
				const dist = new box2d.b2Vec2(0, 0)
				dist.Add(vertice)
				const finalDist = dist.Length()
				if (finalDist > entityRadius) {
					entityRadius = finalDist
				}
			}
		}
		return entityRadius
	}

	function drawGravityRadius(gravitation) {
		const gravitationPosition = gravitation.getEntity().b2body.GetPosition()
		const x = gravitationPosition.x * _worldManager.getScale()
		const y = gravitationPosition.y * _worldManager.getScale()
		const radius = gravitation.getGravityRadius() * _worldManager.getScale()

		const c = _worldManager.getBox2dCanvasCtx()
		c.beginPath()
		c.lineWidth = "1"
		c.strokeStyle = "cyan"
		c.arc(x, y, radius, 0, Math.PI * 2, true)
		c.stroke()
	}

	function drawPoint(point) {
		const x = point.x * _worldManager.getScale()
		const y = point.y * _worldManager.getScale()
		const radius = 1

		const c = _worldManager.getBox2dCanvasCtx()
		c.beginPath()
		c.fillStyle = "yellow"
		c.arc(x, y, radius, 0, Math.PI * 2, true)
		c.fill()
	}

	function validate(worldManager, entity, details) {
		if (!(worldManager instanceof Box2DCreateJS.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (!(entity instanceof Box2DCreateJS.Entity)) {
			throw new Error(arguments.callee.name + " : entity must be an instance of Entity!")
		}

		if (details !== undefined) {
			if (typeof details !== 'object') {
				throw new Error(arguments.callee.name + " : The Gravitation details must be an object!")
			}
			for (let def in details) {
				if (_validGravitationDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Gravitation is not supported! Valid definitions: " + _validGravitationDef)
				}
			}
			if (details.gravityRadius !== undefined && (typeof details.gravityRadius !== 'number' || details.gravityRadius <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for gravityRadius!")
			}
			if (details.attractionPower !== undefined && (typeof details.attractionPower !== 'number' || details.attractionPower <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for attractionPower!")
			}
		}
	}

})()