function formatTime(auxTime, updateMil) {
	const mil = auxTime % 1000
	const sec = Math.floor(auxTime / 1000 % 60)
	const min = Math.floor(auxTime / 1000 / 60)

	let timeFormat = (min < 10) ? '0' + min : min
	timeFormat += ':'
	timeFormat += (sec < 10) ? '0' + sec : sec
	if (updateMil) {
		timeFormat += '.'
		if (mil < 10) {
			timeFormat += '00' + mil
		}
		else if (mil < 100) {
			timeFormat += '0' + mil
		}
		else {
			timeFormat += mil
		}
	}
	return timeFormat
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

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

	return {center, area}
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

function getElementPosition(element) {
	let elem = element, tagname = "", x = 0, y = 0

	while (typeof elem === 'object' && typeof elem.tagName !== 'undefined') {
		y += elem.offsetTop
		x += elem.offsetLeft
		tagname = elem.tagName.toUpperCase()
		if (tagname === "BODY") {
			elem = 0
		}
		if (typeof elem === 'object' && typeof elem.offsetParent === 'object') {
			elem = elem.offsetParent
		}
	}
	return { x, y }
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