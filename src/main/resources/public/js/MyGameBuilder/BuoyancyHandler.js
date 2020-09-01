this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.BuoyancyHandler = BuoyancyHandler;

	var _DEGTORAD = 0.0174532925199432957;
	var _numVerticesInsideCircle = 8;

	function BuoyancyHandler(worldManager, details) {
		initialize(worldManager, details);
	}

	var _validBuoyancyDef = ['complexDragFunction'];

	var _complexDragFunction;

	var _worldManager;

	var _fluidFloatingObjectContacts;

	function initialize(worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;
		_fluidFloatingObjectContacts = [];

		_complexDragFunction = true;
		if (details && details.complexDragFunction !== undefined)
			_complexDragFunction = details.complexDragFunction;
	}

	BuoyancyHandler.prototype.IsBuoyancyContactType = function (contact) {
		var fixA = contact.GetFixtureA();
		var fixB = contact.GetFixtureB();

		if ((fixA.GetUserData().isFluid && fixB.GetBody().GetType() == box2d.b2Body.b2_dynamicBody) ||
			(fixB.GetUserData().isFluid && fixA.GetBody().GetType() == box2d.b2Body.b2_dynamicBody)) {
			return true;
		}
		else
			return false;
	}

	BuoyancyHandler.prototype.beginContactBuoyancy = function (contact) {
		var objects = getFloatingFluidFromContact(contact);
		var floatingObject = objects.floatingObject;
		var fluid = objects.fluid;

		addfluidFloatingObjectContact(fluid, floatingObject);
	}

	BuoyancyHandler.prototype.endContactBuoyancy = function (contact) {
		var objects = getFloatingFluidFromContact(contact);
		var floatingObject = objects.floatingObject;
		var fluid = objects.fluid;

		deletefluidFloatingObjectContact(fluid, floatingObject);
	}

	function getFloatingFluidFromContact(contact) {
		var fixA = contact.GetFixtureA();
		var fixB = contact.GetFixtureB();

		var fluid, floatingObject;
		if (fixA.GetUserData().isFluid) {
			fluid = fixA;
			floatingObject = fixB;
		}
		else {
			fluid = fixB;
			floatingObject = fixA;
		}

		return { floatingObject: floatingObject, fluid: fluid };
	}

	function addfluidFloatingObjectContact(fluid, floatingObject) {
		var contactPair = { fluid: fluid, floatingObject: floatingObject };
		_fluidFloatingObjectContacts.push(contactPair);
	}

	function deletefluidFloatingObjectContact(fluid, floatingObject) {
		var idx = -1;
		for (var i = 0; i < _fluidFloatingObjectContacts.length; i++) {
			var contactPair = _fluidFloatingObjectContacts[i];
			if (contactPair.fluid === fluid && contactPair.floatingObject === floatingObject) {
				idx = i;
				break;
			}
		}

		if (idx >= 0)
			_fluidFloatingObjectContacts.remove(idx);
	}

	BuoyancyHandler.prototype.update = function () {
		for (var i = 0; i < _fluidFloatingObjectContacts.length; i++) {
			var contactPair = _fluidFloatingObjectContacts[i];
			var fluid = contactPair.fluid;
			var floatingObject = contactPair.floatingObject;

			var density = fluid.GetDensity();

			var intersectionPoints = findIntersectionOfFixtures(fluid, floatingObject);
			if (intersectionPoints.length > 0) {

				//find centroid
				var centroidArea = ComputeCentroid(intersectionPoints);
				var centroid = centroidArea.centroid;
				var area = centroidArea.area;

				//apply buoyancy force
				var displacedMass = fluid.GetDensity() * area;
				var gravity = _worldManager.getWorld().GetGravity();
				var buoyancyForce = new box2d.b2Vec2(0, 0);
				buoyancyForce.x = displacedMass * -gravity.x;
				buoyancyForce.y = displacedMass * -gravity.y;
				floatingObject.GetBody().ApplyForce(buoyancyForce, centroid);

				if (!_complexDragFunction) {
					//-- simple drag --------------------------------------------------------------
					//find relative velocity between object and fluid
					var velDir = box2d.b2Math.SubtractVV(
						floatingObject.GetBody().GetLinearVelocityFromWorldPoint(centroid),
						fluid.GetBody().GetLinearVelocityFromWorldPoint(centroid)
					);
					var vel = velDir.Normalize();

					var dragMod = fluid.GetUserData().dragConstant;
					var dragMag = fluid.GetDensity() * vel * vel;

					var dragForce = new box2d.b2Vec2(0, 0);
					dragForce.x = dragMod * dragMag * -velDir.x;
					dragForce.y = dragMod * dragMag * -velDir.y;

					floatingObject.GetBody().ApplyForce(dragForce, centroid);
					var angularDrag = area * -floatingObject.GetBody().GetAngularVelocity();
					floatingObject.GetBody().ApplyTorque(angularDrag);
					//-----------------------------------------------------------------------------
				}
				else {
					//-- apply complex drag -------------------------------------------------------
					var dragMod = fluid.GetUserData().dragConstant;
					var liftMod = fluid.GetUserData().liftConstant;
					var maxDrag = 3000;//adjust as desired
					var maxLift = 1000;//adjust as desired
					for (var j = 0; j < intersectionPoints.length; j++) {
						var v0 = intersectionPoints[j];
						var v1 = intersectionPoints[(j + 1) % intersectionPoints.length];

						var vS = box2d.b2Math.AddVV(v0, v1);
						var midPoint = new box2d.b2Vec2(0, 0);
						midPoint.x = 0.5 * vS.x;
						midPoint.y = 0.5 * vS.y;

						//find relative velocity between object and fluid at edge midpoint
						var velDir = box2d.b2Math.SubtractVV(
							floatingObject.GetBody().GetLinearVelocityFromWorldPoint(midPoint),
							fluid.GetBody().GetLinearVelocityFromWorldPoint(midPoint)
						);
						var vel = velDir.Normalize();

						var edge = box2d.b2Math.SubtractVV(v1, v0);
						var edgeLength = edge.Normalize();

						var normal = box2d.b2Math.CrossFV(-1, edge);
						var dragDot = box2d.b2Math.Dot(normal, velDir);
						if (dragDot < 0)
							continue;//normal points backwards - this is not a leading edge

						//apply drag
						var dragMag = dragDot * dragMod * edgeLength * density * vel * vel;
						dragMag = box2d.b2Math.Min(dragMag, maxDrag);

						var dragForce = new box2d.b2Vec2(0, 0);
						dragForce.x = dragMag * -velDir.x;
						dragForce.y = dragMag * -velDir.y;

						floatingObject.GetBody().ApplyForce(dragForce, midPoint);

						//apply lift
						var liftDot = box2d.b2Math.Dot(edge, velDir);
						var liftMag = dragDot * liftDot * liftMod * edgeLength * density * vel * vel;
						liftMag = box2d.b2Math.Min(liftMag, maxLift);
						var liftDir = box2d.b2Math.CrossFV(1, velDir);

						var liftForce = new box2d.b2Vec2(0, 0);
						liftForce.x = liftMag * -liftDir.x;
						liftForce.y = liftMag * -liftDir.y;

						floatingObject.GetBody().ApplyForce(liftForce, midPoint);
					}
					//-----------------------------------------------------------------------------
				}
			}
		}
	}

	function ComputeCentroid(vs) {
		var count = vs.length;

		var c = new box2d.b2Vec2();
		c.Set(0.0, 0.0);
		area = 0.0;

		// pRef is the reference point for forming triangles.
		// It's location doesn't change the result (except for rounding error).
		var pRef = new box2d.b2Vec2(0.0, 0.0);

		var inv3 = 1.0 / 3.0;

		for (var i = 0; i < count; ++i) {
			// Triangle vertices.
			var p1 = pRef;
			var p2 = vs[i];
			var p3 = i + 1 < count ? vs[i + 1] : vs[0];

			var e1 = box2d.b2Math.SubtractVV(p2, p1);
			var e2 = box2d.b2Math.SubtractVV(p3, p1);

			var D = box2d.b2Math.CrossVV(e1, e2);

			var triangleArea = 0.5 * D;
			area += triangleArea;

			// Area weighted centroid
			c.x += triangleArea * inv3 * (p1.x + p2.x + p3.x);
			c.y += triangleArea * inv3 * (p1.y + p2.y + p3.y);
		}

		// Centroid
		if (area > 0 /*Box2D.b2_epsilon*/) {
			c.x *= 1.0 / area;
			c.y *= 1.0 / area;
		}
		else
			area = 0;

		return { centroid: c, area: area };
	}

	function findIntersectionOfFixtures(fA, fB) {
		if (fA.GetShape().GetType() != Box2D.Collision.Shapes.b2Shape.e_polygonShape)
			return false;

		var polyA = fA.GetShape();
		var polyB = fB.GetShape();

		if (polyB.GetType() == Box2D.Collision.Shapes.b2Shape.e_circleShape) {
			var radius = polyB.GetRadius();

			//Setting up Vertices in an Array
			var vertices = [];
			for (var i = _numVerticesInsideCircle; i > 0; i--) {
				var angle = (i / _numVerticesInsideCircle) * 360 * _DEGTORAD;
				vertices.push(new box2d.b2Vec2(Math.sin(angle) * radius, Math.cos(angle) * radius));
			}

			polyB.numVertices = _numVerticesInsideCircle;
			polyB.vertices = vertices;

			//Draw the internal polygon inside a circle
			if (_worldManager.getEnableDebug())
				drawInternalPolygon(fB);
		}

		//fill 'subject polygon' from fixtureA polygon
		var outputVertices = [];
		for (var i = 0; i < polyA.GetVertexCount(); i++)
			outputVertices.push(fA.GetBody().GetWorldPoint(polyA.GetVertices()[i]));

		//fill 'clip polygon' from fixtureB polygon
		var clipPolygon = [];
		if (polyB.GetType() == Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			for (var i = 0; i < polyB.GetVertexCount(); i++)
				clipPolygon.push(fB.GetBody().GetWorldPoint(polyB.GetVertices()[i]));
		}
		else {
			for (var i = 0; i < polyB.numVertices; i++)
				clipPolygon.push(fB.GetBody().GetWorldPoint(polyB.vertices[i]));
		}

		var cp1 = clipPolygon[clipPolygon.length - 1];
		for (var j = 0; j < clipPolygon.length; j++) {
			var cp2 = clipPolygon[j];
			if (outputVertices.length <= 0)
				return false;
			var inputList = outputVertices;
			outputVertices = [];
			var s = inputList[inputList.length - 1]; //last on the input list
			for (var i = 0; i < inputList.length; i++) {
				var e = inputList[i];
				if (inside(cp1, cp2, e)) {
					if (!inside(cp1, cp2, s)) {
						outputVertices.push(intersection(cp1, cp2, s, e));
					}
					outputVertices.push(e);
				}
				else if (inside(cp1, cp2, s)) {
					outputVertices.push(intersection(cp1, cp2, s, e));
				}
				s = e;
			}
			cp1 = cp2;
		}

		return outputVertices;
	}

	function inside(cp1, cp2, p) {
		return (cp2.x - cp1.x) * (p.y - cp1.y) > (cp2.y - cp1.y) * (p.x - cp1.x);
	}

	function intersection(cp1, cp2, s, e) {
		var dc = new box2d.b2Vec2(cp1.x - cp2.x, cp1.y - cp2.y);
		var dp = new box2d.b2Vec2(s.x - e.x, s.y - e.y);
		var n1 = cp1.x * cp2.y - cp1.y * cp2.x;
		var n2 = s.x * e.y - s.y * e.x;
		var n3 = 1.0 / (dc.x * dp.y - dc.y * dp.x);
		return new box2d.b2Vec2((n1 * dp.x - n2 * dc.x) * n3, (n1 * dp.y - n2 * dc.y) * n3);
	}

	function drawInternalPolygon(fixture) {
		var c = _worldManager.getBox2dCanvasCtx();
		var v = fixture.GetShape().vertices;
		var center = fixture.GetBody().GetWorldCenter();

		c.beginPath();
		c.lineWidth = "1";
		c.strokeStyle = "#bbb";
		for (var i = 0; i < v.length - 1; i++) {
			c.moveTo((center.x + v[i].x) * _worldManager.getScale(), (center.y + v[i].y) * _worldManager.getScale());
			c.lineTo((center.x + v[i + 1].x) * _worldManager.getScale(), (center.y + v[i + 1].y) * _worldManager.getScale());
			c.stroke();
		}
		c.moveTo((center.x + v[v.length - 1].x) * _worldManager.getScale(), (center.y + v[v.length - 1].y) * _worldManager.getScale());
		c.lineTo((center.x + v[0].x) * _worldManager.getScale(), (center.y + v[0].y) * _worldManager.getScale());
		c.stroke();
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details !== undefined) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : The BuoyancyHandler details must be an object!");

			for (var def in details)
				if (_validBuoyancyDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for BuoyancytHandler is not supported! Valid definitions: " + _validBuoyancyDef);

			if (details.complexDragFunction !== undefined && typeof details.complexDragFunction != 'boolean')
				throw new Error(arguments.callee.name + " : complexDragFunction must be true/false!");
		}
	}

})();