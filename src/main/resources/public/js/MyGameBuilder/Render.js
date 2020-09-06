this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.Render = Render

	function Render() { }

	const _validRenderDef = ['z', 'type', 'opacity', 'action', 'filters', 'drawOpts', 'imageOpts', 'spriteSheetOpts']

	const _validRenderTypeDef = ['draw', 'image', 'spritesheet']

	const _validRenderDrawOptsDef = ['borderWidth', 'borderColor', 'borderRadius', 'bgColorStyle',
		'bgSolidColorOpts', 'bgLinearGradientOpts', 'bgRadialGradientOpts',
		'bgImage', 'repeatBgImage', 'adjustBgImageSize', 'cache', 'textOpts']

	const _validRenderImageOptsDef = ['image', 'adjustImageSize']

	const _validRenderRepeatBgImageDef = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y']
	const _validRenderBgColorStyleDef = ['transparent', 'solid', 'linearGradient', 'radialGradient']

	const _validRenderBgColorStyleSolidColorOptsDef = ['color']
	const _validRenderBgColorStyleLinearGradientOptsDef = ['colors', 'ratios', 'x0', 'y0', 'x1', 'y1']
	const _validRenderBgColorStyleRadialGradientOptsDef = ['colors', 'ratios', 'x0', 'y0', 'r0', 'x1', 'y1', 'r1']

	const _validRenderSpriteSheetOptsDef = ['startAnimation', 'spriteData', 'adjustImageSize']
	const _validRenderSpriteSheetDataDef = ['animations', 'frames', 'images']

	const _validRenderTextOptsDef = ['text', 'font', 'color']

	let _worldManager

	Render.createView = function (worldManager, positionShape, details) {
		return fnCreateView(worldManager, positionShape, details)
	}

	function fnCreateView(worldManager, positionShape, details) {
		validate(worldManager, details)

		_worldManager = worldManager

		if (details.z === undefined || details.z > worldManager.getEaseljsStage().numChildren) {
			details.z = worldManager.getEaseljsStage().numChildren
		}
		if (details.opacity === undefined) {
			details.opacity = 1
		}
		if (details.filters === undefined) {
			details.filters = null
		}

		let view = null
		if (details.type === 'draw') {
			view = (details.drawOpts.textOpts === undefined) ? createShapeView(positionShape, details) : createContainerView(positionShape, details)
		}
		else if (details.type === 'image') {
			view = createImageView(positionShape, details)
		}
		else if (details.type === 'spritesheet') {
			view = createSpriteSheetView(positionShape, details)
		}
		return view
	}

	function createShapeView(positionShape, details) {
		const view = new createjs.Shape()
		view.render0 = details
		view.type = details.type

		view.shape = positionShape.shape
		if (positionShape.shape === 'circle') {
			view.circleOpts = positionShape.circleOpts
			view.x = view.x0 = view.regX = positionShape.x
			view.y = view.y0 = view.regY = positionShape.y
		}
		else if (positionShape.shape === 'box') {
			view.boxOpts = positionShape.boxOpts
			view.x = view.x0 = view.regX = positionShape.x
			view.y = view.y0 = view.regY = positionShape.y
		}
		else if (positionShape.shape === 'polygon') {
			view.polygonOpts = positionShape.polygonOpts
			view.x = view.x0 = 0
			view.y = view.y0 = 0
		}
		view.rotation = positionShape.angle
		view.z = details.z
		view.alpha = details.opacity
		view.filters = details.filters
		view.dimension = getDimension(view)
		view.doCache = (details.drawOpts.cache !== undefined) ? details.drawOpts.cache : false

		if (details.action !== undefined) {
			view.addEventListener('tick', details.action)
		}

		setShapeViewBorderBackground(view, details)

		return view
	}

	function createImageView(positionShape, details) {
		let image
		if (_worldManager.getPreLoad() !== undefined) {
			image = _worldManager.getPreLoad().getResult(details.imageOpts.image)
		}

		let preloaded = false
		if (image) {
			console.log('Render image \'' + details.imageOpts.image + '\' loaded with preload!')
			preloaded = true
		}
		else {
			image = new Image()
			image.src = details.imageOpts.image
			image.onload = function () {
				console.log('Render image \'' + details.imageOpts.image + '\' loaded at the time!')
				onLoadImage(view, image)
			}
		}

		const view = new createjs.Bitmap(image)
		view.render0 = details
		view.type = details.type

		view.shape = positionShape.shape
		if (positionShape.shape === 'circle') {
			view.circleOpts = positionShape.circleOpts
			view.x = view.x0 = positionShape.x
			view.y = view.y0 = positionShape.y
		}
		else if (positionShape.shape === 'box') {
			view.boxOpts = positionShape.boxOpts
			view.x = view.x0 = positionShape.x
			view.y = view.y0 = positionShape.y
		}
		else if (positionShape.shape === 'polygon') {
			view.polygonOpts = positionShape.polygonOpts
			view.x = view.x0 = 0
			view.y = view.y0 = 0
		}
		view.rotation = positionShape.angle
		view.z = details.z
		view.alpha = details.opacity
		view.filters = details.filters
		view.dimension = getDimension(view)

		if (details.action !== undefined) {
			view.addEventListener('tick', details.action)
		}

		view.adjustImageSize = false
		if (details.imageOpts.adjustImageSize !== undefined) {
			view.adjustImageSize = details.imageOpts.adjustImageSize
		}

		if (preloaded) {
			onLoadImage(view, image)
		}

		return view
	}

	function createSpriteSheetView(positionShape, details) {
		const spriteData = details.spriteSheetOpts.spriteData

		if (spriteData.frames.regX === undefined) {
			spriteData.frames.regX = spriteData.frames.width / 2
		}
		if (spriteData.frames.regY === undefined) {
			spriteData.frames.regY = spriteData.frames.height / 2
		}

		const spriteSheet = new createjs.SpriteSheet(spriteData)
		spriteSheet.animations.forEach(animation => {
			const spriteSheetAnimation = spriteSheet.getAnimation(animation)
			spriteSheetAnimation.speed0 = 1
		})

		const view = new createjs.Sprite(spriteSheet)
		view.render0 = details
		view.type = details.type

		view.shape = positionShape.shape
		if (positionShape.shape === 'circle') {
			view.circleOpts = positionShape.circleOpts
			view.x = view.x0 = positionShape.x
			view.y = view.y0 = positionShape.y
		}
		else if (positionShape.shape === 'box') {
			view.boxOpts = positionShape.boxOpts
			view.x = view.x0 = positionShape.x
			view.y = view.y0 = positionShape.y
		}
		else if (positionShape.shape === 'polygon') {
			view.polygonOpts = positionShape.polygonOpts
			view.x = view.x0 = 0
			view.y = view.y0 = 0
		}
		view.rotation = positionShape.angle
		view.z = details.z
		view.alpha = details.opacity
		view.filters = details.filters
		view.dimension = getDimension(view)

		if (details.action !== undefined) {
			view.addEventListener('tick', details.action)
		}

		view.adjustImageSize = (details.spriteSheetOpts.adjustImageSize !== undefined) ? details.spriteSheetOpts.adjustImageSize : false
		view.gotoAndPlay(details.spriteSheetOpts.startAnimation)

		if (view.filters !== null) {
			view.cache(-spriteData.frames.width / 2, -spriteData.frames.height / 2, spriteData.frames.width, spriteData.frames.height)
		}

		if (view.adjustImageSize) {
			view.scaleX = view.dimension.width / spriteData.frames.width
			view.scaleY = view.dimension.height / spriteData.frames.height
		}

		return view
	}

	function createShapeViewForContainer(positionShape, details) {
		const view = new createjs.Shape()
		view.type = details.type

		view.shape = positionShape.shape
		view.x = view.x0 = positionShape.x
		view.y = view.y0 = positionShape.y

		if (positionShape.shape === 'circle') {
			view.circleOpts = positionShape.circleOpts
			view.regX = positionShape.x
			view.regY = positionShape.y
		}
		else if (positionShape.shape === 'box') {
			view.boxOpts = positionShape.boxOpts
			view.regX = positionShape.x
			view.regY = positionShape.y
		}
		else if (positionShape.shape === 'polygon') {
			view.polygonOpts = positionShape.polygonOpts
		}
		view.dimension = getDimension(view)

		// Filters and cache are applied in the container view
		view.filters = null
		view.doCache = false

		setShapeViewBorderBackground(view, details)

		return view
	}

	function createTextView(positionShape, details) {
		const text = (details.drawOpts.textOpts.text !== undefined) ? details.drawOpts.textOpts.text : ''
		const font = (details.drawOpts.textOpts.font !== undefined) ? details.drawOpts.textOpts.font : 'bold 18px Arial'
		const color = (details.drawOpts.textOpts.color !== undefined) ? details.drawOpts.textOpts.color : 'white'

		const view = new createjs.Text(text, font, color)

		const textWidth = view.getMeasuredWidth()
		const textHeight = view.getMeasuredHeight()

		view.x = view.x0 = positionShape.x
		view.regX = textWidth / 2

		view.y = view.y0 = positionShape.y
		view.regY = textHeight / 2

		return view
	}

	function createContainerView(positionShape, details) {
		const container = new createjs.Container()

		const viewShape = createShapeViewForContainer(positionShape, details)
		const viewText = createTextView(positionShape, details)
		container.addChild(viewShape, viewText)

		container.render0 = details
		container.shape = positionShape.shape
		if (positionShape.shape === 'circle') {
			container.circleOpts = positionShape.circleOpts
		}
		else if (positionShape.shape === 'box') {
			container.boxOpts = positionShape.boxOpts
		}
		else if (positionShape.shape === 'polygon') {
			container.polygonOpts = positionShape.polygonOpts
		}

		container.x = container.x0 = container.regX = positionShape.x
		container.y = container.y0 = container.regY = positionShape.y
		container.rotation = positionShape.angle
		container.z = details.z
		container.alpha = details.opacity
		container.filters = details.filters
		container.dimension = getDimension(viewShape)

		if (details.action !== undefined) {
			container.onTick = details.action
		}

		container.doCache = (details.drawOpts.cache !== undefined) ? details.drawOpts.cache : false
		container.borderWidth = (details.drawOpts.borderWidth > 0) ? details.drawOpts.borderWidth : 0

		if (container.filters !== null || container.doCache) {
			if (container.borderWidth > 0) {
				container.dimension.width += container.borderWidth * _worldManager.getScale() * 2
				container.dimension.height += container.borderWidth * _worldManager.getScale() * 2
			}

			container.cache(
				container.x - container.dimension.width / 2,
				container.y - container.dimension.height / 2,
				container.dimension.width,
				container.dimension.height)
		}

		return container
	}

	function setShapeViewBorderBackground(view, details) {
		view.repeatBgImage = (details.drawOpts.repeatBgImage !== undefined) ? details.drawOpts.repeatBgImage : 'no-repeat'
		view.adjustBgImageSize = (details.drawOpts.adjustBgImageSize !== undefined) ? details.drawOpts.adjustBgImageSize : false
		view.borderRadius = (details.drawOpts.borderRadius > 0) ? details.drawOpts.borderRadius : 0

		view.borderWidth = 0
		if (details.drawOpts.borderWidth > 0) {
			view.borderWidth = details.drawOpts.borderWidth
			view.graphics.setStrokeStyle(details.drawOpts.borderWidth)

			if (details.drawOpts.borderColor === undefined) {
				details.drawOpts.borderColor = 'black'
			}

			view.graphics.beginStroke(details.drawOpts.borderColor)

			if (details.drawOpts.bgColorStyle === 'transparent' && details.drawOpts.bgImage === undefined) {
				drawShape(view)
			}
		}

		if (details.drawOpts.bgColorStyle !== 'transparent') {
			if (details.drawOpts.bgColorStyle === 'solid') {
				const sc = (details.drawOpts.bgSolidColorOpts !== undefined && details.drawOpts.bgSolidColorOpts.color !== undefined) ?
					details.drawOpts.bgSolidColorOpts.color : 'black'
				view.graphics.beginFill(sc)
			}
			else if (details.drawOpts.bgColorStyle === 'linearGradient') {
				const edge = {
					x: view.x - view.dimension.width / 2,
					y: view.y - view.dimension.height / 2
				}

				const lg = {
					colors: ['blue', 'white'],
					ratios: [0, 1],
					x0: edge.x,
					y0: edge.y,
					x1: edge.x,
					y1: edge.y + view.dimension.height
				}

				if (details.drawOpts.bgLinearGradientOpts !== undefined && details.drawOpts.bgLinearGradientOpts.colors !== undefined) {
					lg.colors = details.drawOpts.bgLinearGradientOpts.colors
				}
				if (details.drawOpts.bgLinearGradientOpts !== undefined && details.drawOpts.bgLinearGradientOpts.ratios !== undefined) {
					lg.ratios = details.drawOpts.bgLinearGradientOpts.ratios
				}
				if (details.drawOpts.bgLinearGradientOpts !== undefined && details.drawOpts.bgLinearGradientOpts.x0 !== undefined) {
					lg.x0 = details.drawOpts.bgLinearGradientOpts.x0
				}
				if (details.drawOpts.bgLinearGradientOpts !== undefined && details.drawOpts.bgLinearGradientOpts.y0 !== undefined) {
					lg.y0 = details.drawOpts.bgLinearGradientOpts.y0
				}
				if (details.drawOpts.bgLinearGradientOpts !== undefined && details.drawOpts.bgLinearGradientOpts.x1 !== undefined) {
					lg.x1 = details.drawOpts.bgLinearGradientOpts.x1
				}
				if (details.drawOpts.bgLinearGradientOpts !== undefined && details.drawOpts.bgLinearGradientOpts.y1 !== undefined) {
					lg.y1 = details.drawOpts.bgLinearGradientOpts.y1
				}

				view.graphics.beginLinearGradientFill(lg.colors, lg.ratios, lg.x0, lg.y0, lg.x1, lg.y1)
			}

			else { //radialGradient
				const center = {
					x: view.x,
					y: view.y
				}
				const rg = {
					colors: ['white', 'blue'],
					ratios: [0, 1],
					x0: center.x,
					y0: center.y,
					r0: 0,
					x1: center.x,
					y1: center.y,
					r1: view.dimension.width / 2
				}

				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.colors !== undefined) {
					rg.colors = details.drawOpts.bgRadialGradientOpts.colors
				}
				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.ratios !== undefined) {
					rg.ratios = details.drawOpts.bgRadialGradientOpts.ratios
				}
				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.x0 !== undefined) {
					rg.x0 = details.drawOpts.bgRadialGradientOpts.x0
				}
				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.y0 !== undefined) {
					rg.y0 = details.drawOpts.bgRadialGradientOpts.y0
				}
				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.r0 !== undefined) {
					rg.r0 = details.drawOpts.bgRadialGradientOpts.r0
				}
				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.x1 !== undefined) {
					rg.x1 = details.drawOpts.bgRadialGradientOpts.x1
				}
				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.y1 !== undefined) {
					rg.y1 = details.drawOpts.bgRadialGradientOpts.y1
				}
				if (details.drawOpts.bgRadialGradientOpts !== undefined && details.drawOpts.bgRadialGradientOpts.r1 !== undefined) {
					rg.r1 = details.drawOpts.bgRadialGradientOpts.r1
				}

				view.graphics.beginRadialGradientFill(rg.colors, rg.ratios, rg.x0, rg.y0, rg.r0, rg.x1, rg.y1, rg.r1)
			}

			drawShape(view)

			if (details.drawOpts.bgImage === undefined) {
				if (view.filters !== null || view.doCache) {
					if (view.borderWidth > 0) {
						view.dimension.width += view.borderWidth * _worldManager.getScale() * 2
						view.dimension.height += view.borderWidth * _worldManager.getScale() * 2
					}

					view.cache(view.x - view.dimension.width / 2, view.y - view.dimension.height / 2, view.dimension.width, view.dimension.height)
				}
			}
		}

		if (details.drawOpts.bgImage !== undefined) {
			let image
			if (_worldManager.getPreLoad() !== undefined) {
				image = _worldManager.getPreLoad().getResult(details.drawOpts.bgImage)
			}

			if (image) {
				console.log('Render bgImage \'' + details.drawOpts.bgImage + '\' loaded with preload!')
				onLoadImage(view, image)
			}
			else {
				image = new Image()
				image.src = details.drawOpts.bgImage
				image.onload = function () {
					console.log('Render bgImage \'' + details.drawOpts.bgImage + '\' loaded at the time!')
					onLoadImage(view, image)
				}
			}
		}

		view.graphics.endStroke()
		view.graphics.endFill()
	}

	function onLoadImage(view, image) {
		if (view.type === 'draw') {
			const matrix = new createjs.Matrix2D()

			if (view.adjustBgImageSize) {
				matrix.scale(view.dimension.width / image.width, view.dimension.height / image.height)
			}
			matrix.translate(view.x - view.dimension.width / 2, view.y - view.dimension.height / 2)
			view.graphics.beginBitmapFill(image, view.repeatBgImage, matrix)

			drawShape(view)

			if (view.filters !== null || view.doCache) {
				if (view.borderWidth > 0) {
					view.dimension.width += view.borderWidth * _worldManager.getScale() * 2
					view.dimension.height += view.borderWidth * _worldManager.getScale() * 2
				}

				view.cache(view.x - view.dimension.width / 2, view.y - view.dimension.height / 2, view.dimension.width, view.dimension.height)
			}
		}
		else if (view.type === 'image') {
			if (view.filters !== null) {
				view.cache(0, 0, image.width, image.height)
			}

			view.regX = image.width / 2
			view.regY = image.height / 2

			if (view.adjustImageSize) {
				view.scaleX = view.dimension.width / image.width
				view.scaleY = view.dimension.height / image.height
			}
		}
	}

	function drawShape(view) {
		switch (view.shape) {
			case 'circle':
				view.graphics.drawCircle(view.x, view.y, view.circleOpts.radius)
				break

			case 'box':
				view.graphics.drawRoundRect(view.x - view.boxOpts.width / 2, view.y - view.boxOpts.height / 2, view.boxOpts.width, view.boxOpts.height, view.borderRadius)
				break

			case 'polygon':
				const points = view.polygonOpts.points
				view.graphics.moveTo(points[0].x, points[0].y)
				points.forEach(point => view.graphics.lineTo(point.x, point.y))
				view.graphics.lineTo(points[0].x, points[0].y)
				break

			default:
				break
		}
	}

	function getDimension(view) {
		const shape = view.shape
		let width, height
		if (shape === 'circle') {
			width = height = view.circleOpts.radius * 2
		}
		else if (shape === 'box') {
			width = view.boxOpts.width
			height = view.boxOpts.height
		}
		else if (shape === 'polygon') {
			const v = view.polygonOpts.points
			let dist = 0
			for (let i = 1; i < v.length; i++) {
				x = v[0].x - v[i].x
				y = v[0].y - v[i].y
				d = Math.sqrt(x * x + y * y)
				if (d > dist) {
					dist = d
				}
			}
			width = height = dist * 2
		}
		return { width, height }
	}

	function validate(worldManager, details) {
		if (!(worldManager instanceof MyGameBuilder.WorldManager)) {
			throw new Error(arguments.callee.name + " : worldManager must be an instance of WorldManager!")
		}

		if (typeof details !== 'object') {
			throw new Error(arguments.callee.name + " : the Render details must be informed!")
		}
		for (let def in details)
			if (_validRenderDef.indexOf(def) < 0) {
				throw new Error(arguments.callee.name + " : the detail (" + def + ") for Render is not supported! Valid definitions: " + _validRenderDef)
			}
		if (details.z !== undefined && typeof details.z !== 'number') {
			throw new Error(arguments.callee.name + " : z must be a number!")
		}
		if (details.type === undefined) {
			throw new Error(arguments.callee.name + " : type must be informed!")
		}
		if (_validRenderTypeDef.indexOf(details.type) < 0) {
			throw new Error(arguments.callee.name + " : type must be " + _validRenderTypeDef)
		}
		if (details.opacity !== undefined && typeof details.opacity !== 'number') {
			throw new Error(arguments.callee.name + " : opacity must be a number!")
		}
		if (details.opacity < 0 || details.opacity > 1) {
			throw new Error(arguments.callee.name + " : opacity must be between 0 and 1!")
		}
		if (details.action !== undefined && typeof details.action !== 'function') {
			throw new Error(arguments.callee.name + " : action must be a function!")
		}

		if (details.filters !== undefined && details.filters !== null) {
			if (!(details.filters instanceof Array)) {
				throw new Error(arguments.callee.name + " : filters must be an Array! See: http://www.createjs.com/Docs/EaselJS/classes/Filter.html")
			}

			for (let i = 0; i < details.filters.length; i++) {
				const filter = details.filters[i]

				let validInstance = false
				if (!validInstance && createjs.AlphaMapFilter !== undefined && filter instanceof createjs.AlphaMapFilter)
					validInstance = true
				if (!validInstance && createjs.AlphaMaskFilter !== undefined && filter instanceof createjs.AlphaMaskFilter)
					validInstance = true
				if (!validInstance && createjs.BoxBlurFilter !== undefined && filter instanceof createjs.BoxBlurFilter)
					validInstance = true
				if (!validInstance && createjs.ColorFilter !== undefined && filter instanceof createjs.ColorFilter)
					validInstance = true
				if (!validInstance && createjs.ColorMatrixFilter !== undefined && filter instanceof createjs.ColorMatrixFilter)
					validInstance = true

				if (!validInstance) {
					throw new Error(arguments.callee.name + " : filters element must be instanceof: AlphaMapFilter, AlphaMaskFilter, BoxBlurFilter, ColorFilter or ColorMatrixFilter! See: http://www.createjs.com/Docs/EaselJS/classes/Filter.html")
				}
			}
		}

		if (details.type === 'draw') {
			if (details.drawOpts === undefined) {
				throw new Error(arguments.callee.name + " : drawOpts must be informed!")
			}
			if (typeof details.drawOpts !== 'object') {
				throw new Error(arguments.callee.name + " : drawOpts must be an object!")
			}

			for (let def in details.drawOpts) {
				if (_validRenderDrawOptsDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for drawOpts is not supported! Valid definitions: " + _validRenderDrawOptsDef)
				}
			}
			if (details.drawOpts.bgColorStyle === undefined) {
				throw new Error(arguments.callee.name + " : drawOpts.bgColorStyle must be informed!")
			}
			if (_validRenderBgColorStyleDef.indexOf(details.drawOpts.bgColorStyle) < 0) {
				throw new Error(arguments.callee.name + " : drawOpts.bgColorStyle must be " + _validRenderBgColorStyleDef)
			}
			if (details.drawOpts.borderWidth !== undefined && typeof details.drawOpts.borderWidth !== 'number') {
				throw new Error(arguments.callee.name + " : drawOpts.borderWidth must be a number!")
			}
			if (details.drawOpts.borderColor !== undefined && typeof details.drawOpts.borderColor !== 'string') {
				throw new Error(arguments.callee.name + " : drawOpts.borderColor must be a string!")
			}
			if (details.drawOpts.borderRadius !== undefined && typeof details.drawOpts.borderRadius !== 'number') {
				throw new Error(arguments.callee.name + " : drawOpts.borderRadius must be a number!")
			}

			if (details.drawOpts.bgSolidColorOpts !== undefined) {
				if (typeof details.drawOpts.bgSolidColorOpts !== 'object') {
					throw new Error(arguments.callee.name + " : drawOpts.bgSolidColorOpts must be an object!")
				}
				for (let def in details.drawOpts.bgSolidColorOpts) {
					if (_validRenderBgColorStyleSolidColorOptsDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for drawOpts.bgSolidColorOpts is not supported! Valid definitions: " + _validRenderBgColorStyleSolidColorOptsDef)
					}
				}
				if (details.drawOpts.bgSolidColorOpts.color !== undefined && typeof details.drawOpts.bgSolidColorOpts.color !== 'string') {
					throw new Error(arguments.callee.name + " : drawOpts.bgSolidColorOpts.color must be a string!")
				}
			}

			if (details.drawOpts.bgLinearGradientOpts !== undefined) {
				if (typeof details.drawOpts.bgLinearGradientOpts !== 'object') {
					throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts must be an object!")
				}
				for (let def in details.drawOpts.bgLinearGradientOpts) {
					if (_validRenderBgColorStyleLinearGradientOptsDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for drawOpts.bgLinearGradientOpts is not supported! Valid definitions: " + _validRenderBgColorStyleLinearGradientOptsDef)
					}
				}
				if (details.drawOpts.bgLinearGradientOpts.colors !== undefined) {
					if (!(details.drawOpts.bgLinearGradientOpts.colors instanceof Array)) {
						throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.colors must be an array!")
					}
					for (let i = 0; i < details.drawOpts.bgLinearGradientOpts.colors.length; i++) {
						if (typeof details.drawOpts.bgLinearGradientOpts.colors[i] !== 'string') {
							throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.colors element must be a string!")
						}
					}
				}
				if (details.drawOpts.bgLinearGradientOpts.ratios !== undefined) {
					if (!(details.drawOpts.bgLinearGradientOpts.ratios instanceof Array)) {
						throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.ratios must be an array!")
					}
					for (let i = 0; i < details.drawOpts.bgLinearGradientOpts.ratios.length; i++) {
						if (typeof details.drawOpts.bgLinearGradientOpts.ratios[i] !== 'number') {
							throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.ratios element must be a number!")
						}
					}
				}
				if (details.drawOpts.bgLinearGradientOpts.x0 !== undefined && typeof details.drawOpts.bgLinearGradientOpts.x0 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.x0 element must be a number!")
				}
				if (details.drawOpts.bgLinearGradientOpts.y0 !== undefined && typeof details.drawOpts.bgLinearGradientOpts.y0 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.y0 element must be a number!")
				}
				if (details.drawOpts.bgLinearGradientOpts.x1 !== undefined && typeof details.drawOpts.bgLinearGradientOpts.x1 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.x1 element must be a number!")
				}
				if (details.drawOpts.bgLinearGradientOpts.y1 !== undefined && typeof details.drawOpts.bgLinearGradientOpts.y1 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgLinearGradientOpts.y1 element must be a number!")
				}
			}

			if (details.drawOpts.bgRadialGradientOpts !== undefined) {
				if (typeof details.drawOpts.bgRadialGradientOpts !== 'object') {
					throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts must be an object!")
				}
				for (let def in details.drawOpts.bgRadialGradientOpts) {
					if (_validRenderBgColorStyleRadialGradientOptsDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for drawOpts.bgRadialGradientOpts is not supported! Valid definitions: " + _validRenderBgColorStyleRadialGradientOptsDef)
					}
				}
				if (details.drawOpts.bgRadialGradientOpts.colors !== undefined) {
					if (!(details.drawOpts.bgRadialGradientOpts.colors instanceof Array)) {
						throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.colors must be an array!")
					}
					for (let i = 0; i < details.drawOpts.bgRadialGradientOpts.colors.length; i++) {
						if (typeof details.drawOpts.bgRadialGradientOpts.colors[i] !== 'string') {
							throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.colors element must be a string!")
						}
					}
				}
				if (details.drawOpts.bgRadialGradientOpts.ratios !== undefined) {
					if (!(details.drawOpts.bgRadialGradientOpts.ratios instanceof Array)) {
						throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.ratios must be an array!")
					}
					for (let i = 0; i < details.drawOpts.bgRadialGradientOpts.ratios.length; i++) {
						if (typeof details.drawOpts.bgRadialGradientOpts.ratios[i] !== 'number') {
							throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.ratios element must be a number!")
						}
					}
				}
				if (details.drawOpts.bgRadialGradientOpts.x0 !== undefined && typeof details.drawOpts.bgRadialGradientOpts.x0 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.x0 element must be a number!")
				}
				if (details.drawOpts.bgRadialGradientOpts.y0 !== undefined && typeof details.drawOpts.bgRadialGradientOpts.y0 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.y0 element must be a number!")
				}
				if (details.drawOpts.bgRadialGradientOpts.r0 !== undefined && typeof details.drawOpts.bgRadialGradientOpts.r0 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.r0 element must be a number!")
				}
				if (details.drawOpts.bgRadialGradientOpts.x1 !== undefined && typeof details.drawOpts.bgRadialGradientOpts.x1 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.x1 element must be a number!")
				}
				if (details.drawOpts.bgRadialGradientOpts.y1 !== undefined && typeof details.drawOpts.bgRadialGradientOpts.y1 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.y1 element must be a number!")
				}
				if (details.drawOpts.bgRadialGradientOpts.r1 !== undefined && typeof details.drawOpts.bgRadialGradientOpts.r1 !== 'number') {
					throw new Error(arguments.callee.name + " : drawOpts.bgRadialGradientOpts.r1 element must be a number!")
				}
			}

			if (details.drawOpts.bgImage !== undefined) {
				if (typeof details.drawOpts.bgImage !== 'string') {
					throw new Error(arguments.callee.name + " : drawOpts.bgImage must be a string!")
				}
				if (worldManager.getPreLoad() !== undefined && !worldManager.getPreLoad().getResult(details.drawOpts.bgImage)) {
					console.warn(arguments.callee.name + " : the bgImage '" + details.drawOpts.bgImage + "' should be informed on the WorldManager preLoad.files property!")
				}
			}

			if (details.drawOpts.repeatBgImage !== undefined) {
				if (_validRenderRepeatBgImageDef.indexOf(details.drawOpts.repeatBgImage) < 0) {
					throw new Error(arguments.callee.name + " : repeatBgImage must be " + _validRenderRepeatBgImageDef)
				}
			}
			if (details.drawOpts.adjustBgImageSize !== undefined && typeof details.drawOpts.adjustBgImageSize !== 'boolean') {
				throw new Error(arguments.callee.name + " : drawOpts.adjustBgImageSize must be true/false!")
			}
			if (details.drawOpts.cache !== undefined && typeof details.drawOpts.cache !== 'boolean') {
				throw new Error(arguments.callee.name + " : drawOpts.cache must be true/false!")
			}

			if (details.drawOpts.textOpts !== undefined) {
				if (typeof details.drawOpts.textOpts !== 'object') {
					throw new Error(arguments.callee.name + " : drawOpts.textOpts must be an object!")
				}
				for (let def in details.drawOpts.textOpts) {
					if (_validRenderTextOptsDef.indexOf(def) < 0) {
						throw new Error(arguments.callee.name + " : the detail (" + def + ") for drawOpts.textOpts is not supported! Valid definitions: " + _validRenderTextOptsDef)
					}
				}
				if (details.drawOpts.textOpts.text !== undefined && typeof details.drawOpts.textOpts.text !== 'string') {
					throw new Error(arguments.callee.name + " : drawOpts.textOpts.text must be a string!")
				}
				if (details.drawOpts.textOpts.font !== undefined && typeof details.drawOpts.textOpts.font !== 'string') {
					throw new Error(arguments.callee.name + " : drawOpts.textOpts.font must be a string! See EaselJS documentation: http://www.createjs.com/Docs/EaselJS/classes/Text.html")
				}
				if (details.drawOpts.textOpts.color !== undefined && typeof details.drawOpts.textOpts.color !== 'string') {
					throw new Error(arguments.callee.name + " : drawOpts.textOpts.color must be a string! See EaselJS documentation: http://www.createjs.com/Docs/EaselJS/classes/Text.html")
				}
			}
		}
		else if (details.type === 'image') {
			if (details.imageOpts === undefined) {
				throw new Error(arguments.callee.name + " : imageOpts must be informed!")
			}
			if (typeof details.imageOpts !== 'object') {
				throw new Error(arguments.callee.name + " : imageOpts must be an object!")
			}
			for (let def in details.imageOpts) {
				if (_validRenderImageOptsDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the detail (" + def + ") for imageOpts is not supported! Valid definitions: " + _validRenderImageOptsDef)
				}
			}
			if (details.imageOpts.image === undefined) {
				throw new Error(arguments.callee.name + " : imageOpts.image must be informed!")
			}
			if (worldManager.getPreLoad() !== undefined && !worldManager.getPreLoad().getResult(details.imageOpts.image)) {
				console.warn(arguments.callee.name + " : the image '" + details.imageOpts.image + "' should be informed on the WorldManager preLoad.files property!")
			}
			if (details.imageOpts.adjustImageSize !== undefined && typeof details.imageOpts.adjustImageSize !== 'boolean') {
				throw new Error(arguments.callee.name + " : imageOpts.adjustImageSize must be true/false!")
			}
		}
		else if (details.type === 'spritesheet') {
			if (details.spriteSheetOpts === undefined) {
				throw new Error(arguments.callee.name + " : spriteSheetOpts must be informed!")
			}
			if (typeof details.spriteSheetOpts !== 'object') {
				throw new Error(arguments.callee.name + " : spriteSheetOpts must be an object!")
			}
			for (let def in details.spriteSheetOpts) {
				if (_validRenderSpriteSheetOptsDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the spriteSheetOpts (" + def + ") is not supported! Valid definitions: " + _validRenderSpriteSheetOptsDef)
				}
			}
			if (details.spriteSheetOpts.spriteData === undefined) {
				throw new Error(arguments.callee.name + " : spriteSheetOpts.spriteData must be informed!")
			}
			if (typeof details.spriteSheetOpts.spriteData !== 'object') {
				throw new Error(arguments.callee.name + " : spriteSheetOpts.spriteData must be an object!")
			}
			for (let def in details.spriteSheetOpts.spriteData) {
				if (_validRenderSpriteSheetDataDef.indexOf(def) < 0) {
					throw new Error(arguments.callee.name + " : the spriteSheetOpts.spriteData (" + def + ") is not supported! Valid definitions: " + _validRenderSpriteSheetDataDef)
				}
			}
			if (details.spriteSheetOpts.spriteData.images === undefined ||
				details.spriteSheetOpts.spriteData.animations === undefined ||
				details.spriteSheetOpts.spriteData.frames === undefined) {
				throw new Error(arguments.callee.name + " : the spriteSheetOpts.spriteData must have images, animations and frames. See EaselJS documentation: http://www.createjs.com/Docs/EaselJS/classes/SpriteSheet.html")
			}

			if (!(details.spriteSheetOpts.spriteData.images instanceof Array)) {
				throw new Error(arguments.callee.name + " : spriteSheetOpts.spriteData.images must be an Array!")
			}
			if (worldManager.getPreLoad() !== undefined) {
				for (let i = 0; i < details.spriteSheetOpts.spriteData.images.length; i++) {
					if (!worldManager.getPreLoad().getResult(details.spriteSheetOpts.spriteData.images[i])) {
						console.warn(arguments.callee.name + " : the image '" + details.spriteSheetOpts.spriteData.images[i] + "' should be informed on the WorldManager preLoad.files property!")
					}
				}
			}
			if (details.spriteSheetOpts.startAnimation === undefined) {
				throw new Error(arguments.callee.name + " : spriteSheetOpts.startAnimation must be informed!")
			}
			if (typeof details.spriteSheetOpts.startAnimation !== 'string') {
				throw new Error(arguments.callee.name + " : spriteSheetOpts.startAnimation must be a string!")
			}

			let found = false
			for (let anim in details.spriteSheetOpts.spriteData.animations) {
				if (details.spriteSheetOpts.startAnimation === anim) {
					found = true
					break
				}
			}
			if (!found) {
				throw new Error(arguments.callee.name + " : the value (" + details.spriteSheetOpts.startAnimation + ") for spriteSheetOpts.startAnimation is invalid!")
			}
			if (details.spriteSheetOpts.adjustImageSize !== undefined && typeof details.spriteSheetOpts.adjustImageSize !== 'boolean') {
				throw new Error(arguments.callee.name + " : spriteSheetOpts.adjustImageSize must be true/false!")
			}
		}
	}

})()