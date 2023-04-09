this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	Box2DCreateJS.Grenade = Grenade

	const _DEGTORAD = 0.0174532925199432957

	function Grenade(worldManager, entity, details) {
		initialize(this, worldManager, entity, details)
	}

	const _validGrenadeDef = ['numParticles', 'blastPower', 'particleOpts', 'beforeExplosion', 'afterExplosion']
	const _validGrenadeParticleOptsDef = ['shape', 'circleOpts', 'boxOpts', 'polygonOpts', 'render']
	const _validGrenadeParticleOptsShapeDef = ['circle', 'box', 'polygon']
	const _validGrenadeParticleOptsCircleOptsDef = ['radius']
	const _validGrenadeParticleOptsBoxOptsDef = ['width', 'height']
	const _validGrenadeParticleOptsPolygonOptsDef = ['points']

	let _worldManager

	function initialize(grenade, worldManager, entity, details) {
		validate(worldManager, entity, details)

		_worldManager = worldManager

		const grenadeEntity = entity
		grenade.getEntity = function () { return grenadeEntity }
		grenadeEntity.b2body.GetFixtureList().m_filter.groupIndex = -1 // grenade should not collide with its particles

		const numParticles = (details && details.numParticles !== undefined) ? details.numParticles : 36
		grenade.getNumParticles = function () { return numParticles }

		const blastPower = (details && details.blastPower !== undefined) ? details.blastPower : 1000
		grenade.getBlastPower = function () { return blastPower }

		let _beforeExplosion
		if (details && details.beforeExplosion !== undefined) {
			_beforeExplosion = details.beforeExplosion
		}

		let _afterExplosion
		if (details && details.afterExplosion !== undefined) {
			_afterExplosion = details.afterExplosion
		}

		const particleOpts = {
			shape: 'circle',
			circleOpts: { radius: 2 },
			render: {
				type: 'draw',
				drawOpts: { bgColorStyle: 'transparent' }
			}
		}
		if (details && details.particleOpts !== undefined) {
			if (details.particleOpts.shape !== undefined) {
				particleOpts.shape = details.particleOpts.shape
			}
			if (details.particleOpts.circleOpts !== undefined) {
				particleOpts.circleOpts = details.particleOpts.circleOpts
			}
			if (details.particleOpts.boxOpts !== undefined) {
				particleOpts.boxOpts = details.particleOpts.boxOpts
			}
			if (details.particleOpts.polygonOpts !== undefined) {
				particleOpts.polygonOpts = details.particleOpts.polygonOpts
			}
			if (details.particleOpts.render !== undefined) {
				particleOpts.render = details.particleOpts.render
			}
		}
		grenade.getParticleOpts = function () { return particleOpts }

		const blastType = 'particle'
		grenade.getBlastType = function () { return blastType }

		const blastParticles = []
		grenade.getBlastParticles = function () { return blastParticles }

		grenade.getPosition = function () {
			return {
				x: grenadeEntity.b2body.GetWorldCenter().x * _worldManager.getScale(),
				y: grenadeEntity.b2body.GetWorldCenter().y * _worldManager.getScale()
			}
		}

		grenade.explode = function () {
			if (_worldManager.getTimeStep() === 0) { // Do not execute when it's paused
				return
			}
			if (_beforeExplosion !== undefined) {
				_beforeExplosion()
			}
			if (blastType === 'particle') {
				explosionByParticleMethod(grenade)
			}
			if (_afterExplosion !== undefined) {
				_afterExplosion()
			}
		}

		grenade.clearParticles = function () {
			while (blastParticles.length > 0) {
				_worldManager.deleteEntity(blastParticles.shift())
			}
		}
	}

	function explosionByParticleMethod(grenade) {
		const center = grenade.getEntity().b2body.GetWorldCenter()
		const grenadeCenterX = center.x * _worldManager.getScale()
		const grenadeCenterY = center.y * _worldManager.getScale()
		const numParticles = grenade.getNumParticles()
		const blastPower = grenade.getBlastPower()

		for (let i = 0; i < numParticles; i++) {
			const angle = (i / numParticles) * 360 * _DEGTORAD
			const rayDir = new box2d.b2Vec2(Math.sin(angle), Math.cos(angle))

			const particle = _worldManager.createEntity({
				type: 'dynamic',
				x: grenadeCenterX,
				y: grenadeCenterY,
				shape: grenade.getParticleOpts().shape,
				circleOpts: grenade.getParticleOpts().circleOpts,
				boxOpts: grenade.getParticleOpts().boxOpts,
				polygonOpts: grenade.getParticleOpts().polygonOpts,
				render: grenade.getParticleOpts().render,
				bodyDefOpts: {
					fixedRotation: true, // rotation is not necessary
					bullet: true,        // prevent tunneling at high speed
					linearDamping: 10,   // drag due to moving through air
					linearVelocity: {
						x: 0.125 * blastPower * rayDir.x,
						y: 0.125 * blastPower * rayDir.y
					}
				},
				fixtureDefOpts: {
					density: 60 / numParticles, // very high - shared across all particles
					friction: 0,				        // friction not necessary
					restitution: 0.99,			    // high restitution to reflect off obstacles
					filterGroupIndex: -1		    // particles should not collide with each other
				},
				draggable: false
			})

			grenade.getBlastParticles().push(particle)
		}
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
				throw new Error(arguments.callee.name + " : The Grenade details must be an object!")
			}
			for (let def in details) {
				if (_validGrenadeDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for Grenade is not supported! Valid definitions: " + _validGrenadeDef)
				}
			}
			if (details.numParticles !== undefined && (typeof details.numParticles !== 'number' || details.numParticles <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for numParticles!")
			}
			if (details.blastPower !== undefined && (typeof details.blastPower !== 'number' || details.blastPower <= 0)) {
				throw new Error(arguments.callee.name + " : invalid value for blastPower!")
			}

			if (details.particleOpts !== undefined) {
				for (let def in details.particleOpts) {
					if (_validGrenadeParticleOptsDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for details.particleOpts is not supported! Valid definitions: " + _validGrenadeParticleOptsDef)
					}
				}
				if (details.particleOpts.shape === undefined) {
					throw new Error(arguments.callee.name + " : particleOpts.shape must be informed!")
				}
				if (_validGrenadeParticleOptsShapeDef.indexOf(details.particleOpts.shape) < 0) {
					throw new Error(arguments.callee.name + " : particleOpts.shape must be " + _validGrenadeParticleOptsShapeDef)
				}

				if (details.particleOpts.shape === 'circle') {
					if (details.particleOpts.circleOpts === undefined) {
						throw new Error(arguments.callee.name + " : particleOpts.circleOpts must be informed!")
					}
					if (typeof details.particleOpts.circleOpts !== 'object') {
						throw new Error(arguments.callee.name + " : particleOpts.circleOpts must be an object!")
					}
					for (let def in details.particleOpts.circleOpts) {
						if (_validGrenadeParticleOptsCircleOptsDef.indexOf(def) < 0) {
							throw new Error(arguments.callee.name + " : the detail (" + def + ") for particleOpts.circleOpts is not supported! Valid definitions: " + _validGrenadeParticleOptsCircleOptsDef)
						}
					}
					if (details.particleOpts.circleOpts.radius === undefined) {
						throw new Error(arguments.callee.name + " : particleOpts.circleOpts.radius must be informed!")
					}
					if (typeof details.particleOpts.circleOpts.radius !== 'number') {
						throw new Error(arguments.callee.name + " : particleOpts.circleOpts.radius must be a number!")
					}
				}
				else if (details.particleOpts.shape === 'box') {
					if (details.particleOpts.boxOpts === undefined) {
						throw new Error(arguments.callee.name + " : particleOpts.boxOpts must be informed!")
					}
					if (typeof details.particleOpts.boxOpts !== 'object') {
						throw new Error(arguments.callee.name + " : particleOpts.boxOpts must be an object!")
					}
					for (let def in details.particleOpts.boxOpts) {
						if (_validGrenadeParticleOptsBoxOptsDef.indexOf(def) < 0) {
							throw new Error(arguments.callee.name + " : the detail (" + def + ") for particleOpts.boxOpts is not supported! Valid definitions: " + _validGrenadeParticleOptsBoxOptsDef)
						}
					}
					if (details.particleOpts.boxOpts.width === undefined) {
						throw new Error(arguments.callee.name + " : particleOpts.boxOpts.width be informed!")
					}
					if (typeof details.particleOpts.boxOpts.width !== 'number') {
						throw new Error(arguments.callee.name + " : particleOpts.boxOpts.width must be a number!")
					}
					if (details.particleOpts.boxOpts.height === undefined) {
						throw new Error(arguments.callee.name + " : particleOpts.boxOpts.height be informed!")
					}
					if (typeof details.particleOpts.boxOpts.height !== 'number') {
						throw new Error(arguments.callee.name + " : particleOpts.boxOpts.height must be a number!")
					}
				}
				else if (details.particleOpts.shape === 'polygon') {
					if (details.particleOpts.polygonOpts === undefined) {
						throw new Error(arguments.callee.name + " : particleOpts.polygonOpts must be informed!")
					}
					if (typeof details.particleOpts.polygonOpts !== 'object') {
						throw new Error(arguments.callee.name + " : particleOpts.polygonOpts must be an object!")
					}
					for (let def in details.particleOpts.polygonOpts) {
						if (_validGrenadeParticleOptsPolygonOptsDef.indexOf(def) < 0) {
							throw new Error(arguments.callee.name + " : the detail (" + def + ") for particleOpts.polygonOpts is not supported! Valid definitions: " + _validGrenadeParticleOptsPolygonOptsDef)
						}
					}
					if (details.particleOpts.polygonOpts.points === undefined) {
						throw new Error(arguments.callee.name + " : particleOpts.polygonOpts.points be informed!")
					}
					if (!(details.particleOpts.polygonOpts.points instanceof Array)) {
						throw new Error(arguments.callee.name + " : particleOpts.polygonOpts.points must be an Array!")
					}
					if (details.particleOpts.polygonOpts.points.length < 3) {
						throw new Error(arguments.callee.name + " : particleOpts.polygonOpts.points array must have at least 3 points!")
					}

					for (let i = 0; i < details.particleOpts.polygonOpts.points.length; i++) {
						const point = details.particleOpts.polygonOpts.points[i]
						if (!(point instanceof Object)) {
							throw new Error(arguments.callee.name + " : points element must be an Object!")
						}
						if (point.x === undefined) {
							throw new Error(arguments.callee.name + " : points[i].x must be informed!")
						}
						if (typeof point.x !== 'number') {
							throw new Error(arguments.callee.name + " : points[i].x must be a number!")
						}
						if (point.y === undefined) {
							throw new Error(arguments.callee.name + " : points[i].y must be informed!")
						}
						if (typeof point.y !== 'number') {
							throw new Error(arguments.callee.name + " : points[i].y must be a number!")
						}
					}
				}
			}

			if (details.beforeExplosion !== undefined && typeof details.beforeExplosion !== 'function') {
				throw new Error(arguments.callee.name + " : beforeExplosion must be a function!")
			}
			if (details.afterExplosion !== undefined && typeof details.afterExplosion !== 'function') {
				throw new Error(arguments.callee.name + " : afterExplosion must be a function!")
			}
		}
	}

})()