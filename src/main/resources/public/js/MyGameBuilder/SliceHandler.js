this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.SliceHandler = SliceHandler;

	function SliceHandler(worldManager, details) {
		initialize(this, worldManager, details);
	}

	var _validSliceDef = ['drawLine', 'lineWidth', 'lineColor'];

	var _worldManager;
	// var _enterPointsVec;

	var _affectedByLaser, _entryPoint;

	var _mouseBegX, _mouseBegY, _mouseEndX, _mouseEndY, _mouseDown, _mouseReleased, _mouseSliceDraw;
	var _touches;

	function initialize(sliceHandler, worldManager, details) {
		validate(worldManager, details);

		_worldManager = worldManager;

		// _enterPointsVec = [];
		_affectedByLaser = [];
		_entryPoint = [];

		_touches = {};
		_mouseDown = false;
		_mouseReleased = false;

		var drawLine = true;
		if (details && details.drawLine !== undefined)
			drawLine = details.drawLine;
		sliceHandler.getDrawLine = function () {
			return drawLine;
		}
		sliceHandler.setDrawLine = function (value) {
			drawLine = value;
		}

		var lineWidth = 2;
		if (details && details.lineWidth !== undefined)
			lineWidth = details.lineWidth;
		sliceHandler.getLineWidth = function () {
			return lineWidth;
		}
		sliceHandler.setLineWidth = function (value) {
			lineWidth = value;
		}

		var lineColor = 'red';
		if (details && details.lineColor !== undefined)
			var lineColor = details.lineColor;
		sliceHandler.getLineColor = function () {
			return lineColor;
		}
		sliceHandler.setLineColor = function (value) {
			lineColor = value;
		}

		var touchable = 'createTouch' in document;
		sliceHandler.isTouchable = function () {
			return touchable;
		}
	}

	SliceHandler.prototype.onMouseDown = function (e) {
		_mouseBegX = e.x;
		_mouseBegY = e.y;

		_mouseDown = true;
	}

	SliceHandler.prototype.onMouseUp = function (e) {
		_mouseEndX = e.x;
		_mouseEndY = e.y;

		_mouseDown = false;
		_mouseReleased = true;

		if (_mouseSliceDraw) {
			_worldManager.getEaseljsStage().removeChild(_mouseSliceDraw);
			_mouseSliceDraw = undefined;
		}
	}

	SliceHandler.prototype.onMouseMove = function (e) {
		_mouseEndX = e.x;
		_mouseEndY = e.y;
	}

	SliceHandler.prototype.onTouchStart = function (e) {
		_touches[e.identifier] = {};
		_touches[e.identifier].begX = e.clientX;
		_touches[e.identifier].begY = e.clientY;
		_touches[e.identifier].down = true;
	}

	SliceHandler.prototype.onTouchEnd = function (e) {
		if (_touches[e.identifier] == undefined)
			_touches[e.identifier] = {};
		_touches[e.identifier].endX = e.clientX;
		_touches[e.identifier].endY = e.clientY;
		_touches[e.identifier].released = true;
		_touches[e.identifier].down = false;

		if (_touches[e.identifier].sliceDraw) {
			_worldManager.getEaseljsStage().removeChild(_touches[e.identifier].sliceDraw);
			_touches[e.identifier].sliceDraw = undefined;
		}
	}

	SliceHandler.prototype.onTouchMove = function (e) {
		_touches[e.identifier].endX = e.clientX;
		_touches[e.identifier].endY = e.clientY;
	}

	function drawTouchSlice(sliceHandler, touch) {
		var player = _worldManager.getPlayer();
		var adjustX = 0, adjustY = 0;
		if (player) {
			adjustX = player.getCameraAdjust().adjustX;
			adjustY = player.getCameraAdjust().adjustY;
		}

		if (touch.sliceDraw === undefined) {
			touch.sliceDraw = new createjs.Shape();
			_worldManager.getEaseljsStage().addChild(touch.sliceDraw);
		}
		else
			touch.sliceDraw.graphics.clear();
		touch.sliceDraw.graphics.setStrokeStyle(sliceHandler.getLineWidth());
		touch.sliceDraw.graphics.beginStroke(sliceHandler.getLineColor());
		touch.sliceDraw.graphics.moveTo(touch.begX + adjustX, touch.begY + adjustY);
		touch.sliceDraw.graphics.lineTo(touch.endX + adjustX, touch.endY + adjustY);
		touch.sliceDraw.graphics.endStroke();
	}

	function drawMouseSlice(sliceHandler) {
		var player = _worldManager.getPlayer();
		var adjustX = 0, adjustY = 0;
		if (player) {
			adjustX = player.getCameraAdjust().adjustX;
			adjustY = player.getCameraAdjust().adjustY;
		}

		if (_mouseSliceDraw === undefined) {
			_mouseSliceDraw = new createjs.Shape();
			_worldManager.getEaseljsStage().addChild(_mouseSliceDraw);
		}
		else
			_mouseSliceDraw.graphics.clear();
		_mouseSliceDraw.graphics.setStrokeStyle(sliceHandler.getLineWidth());
		_mouseSliceDraw.graphics.beginStroke(sliceHandler.getLineColor());
		_mouseSliceDraw.graphics.moveTo(_mouseBegX + adjustX, _mouseBegY + adjustY);
		_mouseSliceDraw.graphics.lineTo(_mouseEndX + adjustX, _mouseEndY + adjustY);
		_mouseSliceDraw.graphics.endStroke();
	}

	SliceHandler.prototype.update = function () {
		if (this.isTouchable()) {
			for (var id in _touches) {
				var touch = _touches[id];

				if (touch.down && this.getDrawLine())
					drawTouchSlice(this, touch);

				if (touch.released) {
					if (touch.begX == undefined || touch.begY == undefined) {
						delete _touches[id];
						continue;
					}

					//Nao executa o slice se estiver pausado!
					if (_worldManager.getTimeStep() == 0)
						return;

					var player = _worldManager.getPlayer();
					var adjustX = 0, adjustY = 0;
					if (player) {
						adjustX = player.getCameraAdjust().adjustX;
						adjustY = player.getCameraAdjust().adjustY;
					}

					var p1 = new box2d.b2Vec2(
						(touch.begX + adjustX) / _worldManager.getScale(),
						(touch.begY + adjustY) / _worldManager.getScale());

					var p2 = new box2d.b2Vec2(
						(touch.endX + adjustX) / _worldManager.getScale(),
						(touch.endY + adjustY) / _worldManager.getScale());

					var v = arrangeClockwise([p1, p2]);
					p1 = v[0];
					p2 = v[1];

					_worldManager.getWorld().RayCast(laserFired, p1, p2);
					_worldManager.getWorld().RayCast(laserFired, p2, p1);

					delete _touches[id];
				}
			}
			_affectedByLaser = [];
			_entryPoint = [];
			//            _enterPointsVec = [];
		}
		else {
			if (_mouseDown && this.getDrawLine())
				drawMouseSlice(this);

			if (_mouseReleased) {
				_mouseReleased = false;

				if (_mouseBegX == undefined || _mouseBegY == undefined)
					return;

				//Nao executa o slice se estiver pausado!
				if (_worldManager.getTimeStep() == 0)
					return;

				var player = _worldManager.getPlayer();
				var adjustX = 0, adjustY = 0;
				if (player) {
					adjustX = player.getCameraAdjust().adjustX;
					adjustY = player.getCameraAdjust().adjustY;
				}

				var p1 = new box2d.b2Vec2(
					(_mouseBegX + adjustX) / _worldManager.getScale(),
					(_mouseBegY + adjustY) / _worldManager.getScale());

				var p2 = new box2d.b2Vec2(
					(_mouseEndX + adjustX) / _worldManager.getScale(),
					(_mouseEndY + adjustY) / _worldManager.getScale());

				var v = arrangeClockwise([p1, p2]);
				p1 = v[0];
				p2 = v[1];

				_worldManager.getWorld().RayCast(laserFired, p1, p2);
				_worldManager.getWorld().RayCast(laserFired, p2, p1);

				//	            _enterPointsVec = [];
				_affectedByLaser = [];
				_entryPoint = [];

				_mouseBegX = _mouseBegY = undefined;
			}
		}
	}

	function laserFired(fixture, point, normal, fraction) {
		var affectedBody = fixture.GetBody();

		if (affectedBody.GetType() !== box2d.b2Body.b2_dynamicBody) {
			console.warn('A non-dynamic entity cannot be sliced!');
			return;
		}
		else if (fixture.GetShape().GetType() != Box2D.Collision.Shapes.b2Shape.e_polygonShape) {
			console.warn('An entity that has a non-polygonal shape can not be sliced!');
			return;
		}
		else if (!affectedBody.GetUserData().sliceable)
			return;

		var affectedPolygon = fixture.GetShape();
		var fixtureIndex = _affectedByLaser.indexOf(affectedBody);
		if (fixtureIndex == -1) {
			_affectedByLaser.push(affectedBody);
			_entryPoint.push(point);
		}
		else {
			var rayCenter = new box2d.b2Vec2((point.x + _entryPoint[fixtureIndex].x) / 2, (point.y + _entryPoint[fixtureIndex].y) / 2);
			var rayAngle = Math.atan2(_entryPoint[fixtureIndex].y - point.y, _entryPoint[fixtureIndex].x - point.x);
			var polyVertices = affectedPolygon.GetVertices();
			var newPolyVertices1 = [];
			var newPolyVertices2 = [];
			var currentPoly = 0;
			var cutPlaced1 = false;
			var cutPlaced2 = false;
			for (var i = 0; i < polyVertices.length; i++) {
				var worldPoint = affectedBody.GetWorldPoint(polyVertices[i]);
				var cutAngle = Math.atan2(worldPoint.y - rayCenter.y, worldPoint.x - rayCenter.x) - rayAngle;
				if (cutAngle < Math.PI * -1) {
					cutAngle += 2 * Math.PI;
				}
				if (cutAngle > 0 && cutAngle <= Math.PI) {
					if (currentPoly == 2) {
						cutPlaced1 = true;
						newPolyVertices1.push(point);
						newPolyVertices1.push(_entryPoint[fixtureIndex]);
					}
					newPolyVertices1.push(worldPoint);
					currentPoly = 1;
				}
				else {
					if (currentPoly == 1) {
						cutPlaced2 = true;
						newPolyVertices2.push(_entryPoint[fixtureIndex]);
						newPolyVertices2.push(point);
					}
					newPolyVertices2.push(worldPoint);
					currentPoly = 2;

				}
			}
			if (!cutPlaced1) {
				newPolyVertices1.push(point);
				newPolyVertices1.push(_entryPoint[fixtureIndex]);
			}
			if (!cutPlaced2) {
				newPolyVertices2.push(_entryPoint[fixtureIndex]);
				newPolyVertices2.push(point);
			}

			_numPiece = 0;
			var entity = _worldManager.getEntityByItsBody(affectedBody);

			var newEntity1 = createEntityPart(entity, newPolyVertices2, 2);
			var newEntity2 = createEntityPart(entity, newPolyVertices1, 1);

			if (entity.onslice !== undefined)
				entity.onslice(newEntity1, newEntity2);

			_worldManager.deleteEntity(entity);
		}
		return 1;
	}

	//	function intersection(fixture, point, normal, fraction) {
	//		var body = fixture.GetBody();
	//		
	//		if ( body.GetType() !==  box2d.b2Body.b2_dynamicBody ) {
	//			console.warn('A non-dynamic entity cannot be sliced!');
	//			return;
	//		}
	//		else if ( fixture.GetShape().GetType() != Box2D.Collision.Shapes.b2Shape.e_polygonShape ) {
	//			console.warn('An entity that has a non-polygonal shape can not be sliced!');
	//			return;
	//		}
	//		else if ( !body.GetUserData().sliceable )
	//			return;
	//		
	//		var bodyUserData = fixture.GetBody().GetUserData();			
	//			
	//		if ( _enterPointsVec[bodyUserData.id] )
	//			splitObj(fixture.GetBody(), _enterPointsVec[bodyUserData.id], point);
	//		else
	//			_enterPointsVec[bodyUserData.id] = point;
	//		
	//		return true;
	//    }

	//	function splitObj(sliceBody, A, B) {
	//		var origFixture = sliceBody.GetFixtureList();
	//		var poly = origFixture.GetShape();
	//		var verticesVec = poly.GetVertices();
	//		var numVertices = poly.GetVertexCount();
	//		var shape1Vertices = [];
	//		var shape2Vertices = [];
	//		var origUserDataId = sliceBody.GetUserData().id;
	//
	//		var entity = _worldManager.getEntityByItsBody(sliceBody);
	//		
	//		_worldManager.deleteEntity(entity);
	//
	//		shape1Vertices.push(A, B);
	//		shape2Vertices.push(A, B);
	//
	//		for ( var i = 0; i < numVertices; i++ ) {
	//			verticesVec[i] = sliceBody.GetWorldPoint(verticesVec[i]);
	//			var d = det(A.x, A.y, B.x, B.y, verticesVec[i].x, verticesVec[i].y);
	//			if ( d > 0 ) 
	//				shape1Vertices.push(verticesVec[i]);
	//			else
	//				shape2Vertices.push(verticesVec[i]);
	//		}
	//
	//		shape1Vertices = arrangeClockwise(shape1Vertices);
	//		shape2Vertices = arrangeClockwise(shape2Vertices);        
	//
	//		createEntityPart(entity, shape1Vertices, 1);
	//		createEntityPart(entity, shape2Vertices, 2);
	//		
	//		_enterPointsVec[origUserDataId] = null;
	//		_enterPointsVec.push(null);
	//		
	//		if ( entity.onslice !== undefined )
	//			entity.onslice();		
	//	}	

	function arrangeClockwise(vec) {
		var n = vec.length;
		var i1 = 1;
		var i2 = n - 1;

		var tempVec = [];
		var C, D;

		vec.sort(comp);

		tempVec[0] = vec[0];
		C = vec[0];
		D = vec[n - 1];

		for (var i = 1; i < n - 1; i++) {
			var d = det(C.x, C.y, D.x, D.y, vec[i].x, vec[i].y);
			if (d < 0)
				tempVec[i1++] = vec[i];
			else
				tempVec[i2--] = vec[i];
		}

		tempVec[i1] = vec[n - 1];

		return tempVec;

		function comp(a, b) {
			if (a.x > b.x)
				return 1;
			else if (a.x < b.x)
				return -1;
			return 0;
		}
	}

	function det(x1, y1, x2, y2, x3, y3) {
		return x1 * y2 + x2 * y3 + x3 * y1 - y1 * x2 - y2 * x3 - y3 * x1;
	}

	function createEntityPart(entity, shapeVertices, num) {
		var centre = findCentroid(shapeVertices);
		for (var i = 0; i < shapeVertices.length; i++)
			shapeVertices[i].Subtract(centre);

		var scaledVertices = []
		for (var i = 0; i < shapeVertices.length; i++) {
			var scaledVertice = new box2d.b2Vec2();
			scaledVertice.x = shapeVertices[i].x * _worldManager.getScale();
			scaledVertice.y = shapeVertices[i].y * _worldManager.getScale();
			scaledVertices.push(scaledVertice);
		}

		var entityBody = entity.b2body;
		var entityFixture = entityBody.GetFixtureList();
		var entityUserData = entityBody.GetUserData();

		var render = {};
		var entityRender = entityBody.GetUserData().render;

		render.z = entityRender.z;
		render.type = entityRender.type;
		render.opacity = entityRender.opacity;
		render.filters = entityRender.filters;

		if (entityRender.action !== undefined)
			render.action = entityRender.action;

		if (entityRender.drawOpts !== undefined)
			render.drawOpts = entityRender.drawOpts;
		if (entityRender.imageOpts !== undefined)
			render.imageOpts = entityRender.imageOpts;
		if (entityRender.spriteSheetOpts !== undefined)
			render.spriteSheetOpts = entityRender.spriteSheetOpts;
		if (entityRender.textOpts !== undefined)
			render.textOpts = entityRender.textOpts;

		var newEntity = _worldManager.createEntity({
			type: entityBody.GetType(),
			x: centre.x * _worldManager.getScale(),
			y: centre.y * _worldManager.getScale(),
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
			name: entityUserData.name + num,
			group: entityUserData.group,
			draggable: entityUserData.draggable,
			sliceable: entityUserData.sliceable,
			noGravity: entityUserData.noGravity,
			events: {
				onslice: entity.onslice,
				onbreak: entity.onbreak,
				ontick: entity.ontick
			}
		});

		for (i = 0; i < shapeVertices.length; i++)
			shapeVertices[i].Add(centre);

		return newEntity;
	}

	function findCentroid(vs) {
		var c = new box2d.b2Vec2();
		var area = 0.0;
		var p1X = 0.0;
		var p1Y = 0.0;
		var inv3 = 1.0 / 3.0;
		var count = vs.length;

		for (var i = 0; i < count; ++i) {
			var p2 = vs[i];
			var p3 = i + 1 < count ? vs[i + 1] : vs[0];
			var e1X = p2.x - p1X;
			var e1Y = p2.y - p1Y;
			var e2X = p3.x - p1X;
			var e2Y = p3.y - p1Y;
			var D = (e1X * e2Y - e1Y * e2X);
			var triangleArea = 0.5 * D;
			area += triangleArea;
			c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
			c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
		}

		c.x *= 1.0 / area;
		c.y *= 1.0 / area;

		return c;
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager))
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!");

		if (details !== undefined) {
			if (typeof details != 'object')
				throw new Error(arguments.callee.name + " : The SliceHandler details must be an object!");

			for (var def in details)
				if (_validSliceDef.indexOf(def) < 0)
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for SliceHandler is not supported! Valid definitions: " + _validSliceDef);

			if (details.drawLine !== undefined && typeof details.drawLine != 'boolean')
				throw new Error(arguments.callee.name + " : drawLine must be true/false!");

			if (details.lineWidth !== undefined && (typeof details.lineWidth != 'number' || details.lineWidth < 0))
				throw new Error(arguments.callee.name + " : invalid value for lineWidth!");
		}
	}

})();