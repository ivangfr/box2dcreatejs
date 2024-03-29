this.Box2DCreateJS = this.Box2DCreateJS || {};

(function () {

	let _worldManager

	function MyApp() {
		this.initialize()
	}

	Box2DCreateJS.MyApp = MyApp

	MyApp.prototype.initialize = function () {
		const easeljsCanvas = document.getElementById("easeljsCanvas")
		const box2dCanvas = document.getElementById("box2dCanvas")

		_worldManager = new Box2DCreateJS.WorldManager(easeljsCanvas, box2dCanvas, {
			enableRender: true,
			enableDebug: true,
			fpsIndicator: { enabled: true },
			world: new box2d.b2World(new box2d.b2Vec2(0, 10), true),
			preLoad: {
				files: [
					'../../images/cloud.png',
					'../../images/hill.png',
					'../../images/grass.png',
				],
				onComplete: testBackground
			}
		})
	}

	function testBackground() {

		_worldManager.createLandscape({
			x: 490, y: 250,
			shape: 'box',
			boxOpts: { width: 980, height: 500 },
			render: {
				type: 'draw',
				drawOpts: {
					bgColorStyle: 'linearGradient',
					bgLinearGradientOpts: {
						colors: ['#85C8F2', 'white']
					}
				}
			}
		})

		const cloud1 = _worldManager.createLandscape({
			x: 300, y: 200,
			shape: 'box',
			boxOpts: { width: 200, height: 150 },
			render: {
				type: 'image',
				imageOpts: {
					image: '../../images/cloud.png',
					adjustImageSize: true,
				},
				action: () => cloud1.view.x -= 0.1
			}
		})

		const hill = _worldManager.createLandscape({
			x: 500, y: 320,
			shape: 'box',
			boxOpts: { width: 600, height: 264 },
			render: {
				type: 'image',
				imageOpts: { image: '../../images/hill.png' },
				action: () => hill.view.x -= 0.2
			}
		})

		const cloud2 = _worldManager.createLandscape({
			x: 750, y: 220,
			shape: 'box',
			boxOpts: { width: 415, height: 343 },
			render: {
				type: 'image',
				imageOpts: { 
					image: '../../images/cloud.png',
					adjustImageSize: true
				 },
				action: () => cloud2.view.x -= 0.3
			}
		})

		const grass = _worldManager.createLandscape({
			x: 1000, y: 250,
			shape: 'box',
			boxOpts: { width: 1990, height: 500 },
			render: {
				type: 'image',
				imageOpts: { image: '../../images/grass.png' },
				action: () => grass.view.x -= 0.6
			}
		})
	}

}())