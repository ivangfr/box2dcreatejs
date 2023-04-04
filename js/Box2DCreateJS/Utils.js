function findCentroid(vs) {
	const center = new box2d.b2Vec2()
	const p1X = 0.0
	const p1Y = 0.0
	const inv3 = 1.0 / 3.0

	let area = 0.0
	for (let i = 0; i < vs.length; ++i) {
		const p2 = vs[i]
		const p3 = i + 1 < vs.length ? vs[i + 1] : vs[0]
		const e1X = p2.x - p1X
		const e1Y = p2.y - p1Y
		const e2X = p3.x - p1X
		const e2Y = p3.y - p1Y
		const D = (e1X * e2Y - e1Y * e2X)
		const triangleArea = 0.5 * D
		area += triangleArea
		center.x += triangleArea * inv3 * (p1X + p2.x + p3.x)
		center.y += triangleArea * inv3 * (p1Y + p2.y + p3.y)
	}

	center.x *= 1.0 / area
	center.y *= 1.0 / area

	return { center, area }
}

function getArea(vs) {
	const count = vs.length
	const p1X = 0.0
	const p1Y = 0.0
	let area = 0.0

	for (let i = 0; i < count; ++i) {
		const p2 = vs[i]
		const p3 = i + 1 < count ? vs[i + 1] : vs[0]
		const e1X = p2.x - p1X
		const e1Y = p2.y - p1Y
		const e2X = p3.x - p1X
		const e2Y = p3.y - p1Y
		const D = (e1X * e2Y - e1Y * e2X)
		const triangleArea = 0.5 * D
		area += triangleArea
	}
	return area
}

function arrangeClockwise(vec) {
	vec.sort((a, b) => a.x - b.x)

	const n = vec.length
	let i1 = 1
	let i2 = n - 1
	let C = vec[0]
	let D = vec[n - 1]
	const tempVec = [vec[0]]

	for (let i = 1; i < n - 1; i++) {
		const d = det(C.x, C.y, D.x, D.y, vec[i].x, vec[i].y)
		if (d < 0) {
			tempVec[i1++] = vec[i]
		}
		else {
			tempVec[i2--] = vec[i]
		}
	}

	tempVec[i1] = vec[n - 1]
	return tempVec

	function det(x1, y1, x2, y2, x3, y3) {
		return x1 * y2 + x2 * y3 + x3 * y1 - y1 * x2 - y2 * x3 - y3 * x1
	}
}

function createEntityPiece(worldManager, entity, vertices, center, id) {
	const scaledVertices = []
	vertices.forEach(shapeVertice => {
		const scaledVertice = new box2d.b2Vec2()
		scaledVertice.x = shapeVertice.x * worldManager.getScale()
		scaledVertice.y = shapeVertice.y * worldManager.getScale()
		scaledVertices.push(scaledVertice)
	})

	const entityBody = entity.b2body
	const entityFixture = entityBody.GetFixtureList()
	const entityUserData = entityBody.GetUserData()
	const entityRender = entityUserData.render

	const render = {}
	render.z = entityRender.z
	render.type = entityRender.type
	render.opacity = entityRender.opacity
	render.filters = entityRender.filters

	if (entityRender.action !== undefined) {
		render.action = entityRender.action
	}
	if (entityRender.drawOpts !== undefined) {
		render.drawOpts = entityRender.drawOpts
	}
	if (entityRender.imageOpts !== undefined) {
		render.imageOpts = entityRender.imageOpts
	}
	if (entityRender.spriteSheetOpts !== undefined) {
		render.spriteSheetOpts = entityRender.spriteSheetOpts
	}
	if (entityRender.textOpts !== undefined) {
		render.textOpts = entityRender.textOpts
	}

	const newEntity = worldManager.createEntity({
		type: entityBody.GetType(),
		x: center.x * worldManager.getScale(),
		y: center.y * worldManager.getScale(),
		//angle : doesn't need to be updated!
		shape: 'polygon',
		polygonOpts: { points: scaledVertices },
		render: render,
		bodyDefOpts: {
			fixedRotation: entityBody.IsFixedRotation(),
			bullet: entityBody.IsBullet(),
			linearDamping: entityBody.GetLinearDamping(),
			linearVelocity: entityBody.GetLinearVelocity(),
			angularDamping: entityBody.GetAngularDamping(),
			angularVelocity: entityBody.GetAngularVelocity() * 180 / Math.PI
		},
		fixtureDefOpts: {
			density: entityFixture.GetDensity(),
			friction: entityFixture.GetFriction(),
			restitution: entityFixture.GetRestitution(),
			isSensor: entityFixture.IsSensor(),
			filterCategoryBits: entityFixture.GetFilterData().categoryBits,
			filterMaskBits: entityFixture.GetFilterData().maskBits,
			filterGroupIndex: entityFixture.GetFilterData().groupIndex,
			isFluid: entityFixture.GetUserData().isFluid,
			dragConstant: entityFixture.GetUserData().dragConstant,
			liftConstant: entityFixture.GetUserData().liftConstant,
			isSticky: entityFixture.GetUserData().isSticky,
			isTarget: entityFixture.GetUserData().isTarget,
			hardness: entityFixture.GetUserData().hardness
		},
		name: `${entityUserData.name}_${id}`,
		group: entityUserData.group,
		draggable: entityUserData.draggable,
		sliceable: entityUserData.sliceable,
		noGravity: entityUserData.noGravity,
		events: {
			onslice: entity.onslice,
			onbreak: entity.onbreak,
			ontick: entity.ontick
		}
	})

	return newEntity
}

function getNew2PolygonVertices(fixture, point, fixtureEntryPoint) {
	const rayCenter = new box2d.b2Vec2((point.x + fixtureEntryPoint.x) / 2, (point.y + fixtureEntryPoint.y) / 2)
	const rayAngle = Math.atan2(fixtureEntryPoint.y - point.y, fixtureEntryPoint.x - point.x)
	const affectedPolygonVertices = fixture.GetShape().GetVertices()
	const newPolygonVertices1 = []
	const newPolygonVertices2 = []

	let currentPoly = 0
	let cutPlaced1 = false
	let cutPlaced2 = false

	affectedPolygonVertices.forEach(polyVertice => {
		const worldPoint = fixture.GetBody().GetWorldPoint(polyVertice)
		let cutAngle = Math.atan2(worldPoint.y - rayCenter.y, worldPoint.x - rayCenter.x) - rayAngle
		if (cutAngle < Math.PI * -1) {
			cutAngle += 2 * Math.PI
		}
		if (cutAngle > 0 && cutAngle <= Math.PI) {
			if (currentPoly === 2) {
				cutPlaced1 = true
				newPolygonVertices1.push(point)
				newPolygonVertices1.push(fixtureEntryPoint)
			}
			newPolygonVertices1.push(worldPoint)
			currentPoly = 1
		}
		else {
			if (currentPoly === 1) {
				cutPlaced2 = true
				newPolygonVertices2.push(fixtureEntryPoint)
				newPolygonVertices2.push(point)
			}
			newPolygonVertices2.push(worldPoint)
			currentPoly = 2
		}
	})

	if (!cutPlaced1) {
		newPolygonVertices1.push(point)
		newPolygonVertices1.push(fixtureEntryPoint)
	}
	if (!cutPlaced2) {
		newPolygonVertices2.push(fixtureEntryPoint)
		newPolygonVertices2.push(point)
	}

	return {
		polygon1Vertices: newPolygonVertices1,
		polygon2Vertices: newPolygonVertices2
	}
}