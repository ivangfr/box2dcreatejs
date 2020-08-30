function buildRankTable(tableElem, data, title, currentId) {
	var i, p, th, tr, td, numCols;
	if ( data.rank.length > 0 ) {

		numCols = 0;
		tr = document.createElement("tr");
		for ( p in data.rank[0] ) {
			if ( p != 'id' ) {
				th = document.createElement("th");
				th.innerHTML = p;
				tr.appendChild(th);
				numCols++;
			}
		}
		tableElem.appendChild(tr);

		tr = document.createElement("tr");
		th = document.createElement('th');
		th.colSpan = numCols;
		th.innerHTML = title
		tr.appendChild(th);
		tableElem.insertBefore(tr, tableElem.firstChild);

		for ( i = 0; i < data.rank.length; i++ ) {
			tr = document.createElement("tr");
			for ( p in data.rank[i] ) {
				if ( p == 'id' ) {
					if ( data.rank[i][p] == currentId )
						tr.className = 'highlight';
				} 
				else {
					td = document.createElement('td');
					if ( p == 'time' ) {
						td.innerHTML = formatTime(data.rank[i][p], true);
					}
					else {
						td.innerHTML = data.rank[i][p];
					}
					tr.appendChild(td);
				}
			}
			tableElem.appendChild(tr);
		}
	}
}

function formatTime(auxTime, updateMil) {
	var timeFormat, mil, sec, min;
	
	mil = auxTime % 1000;
	sec = Math.floor(auxTime / 1000 % 60);
	min = Math.floor(auxTime / 1000 / 60);
	
	timeFormat = (min < 10) ? '0'+min : min;
	timeFormat += ':';
	timeFormat += (sec < 10) ? '0'+sec : sec;
	if ( updateMil ) {
		timeFormat += '.';
		if ( mil < 10 )
			timeFormat += '00'+mil;
		else if ( mil < 100 )
			timeFormat += '0'+mil;
		else
			timeFormat += mil;		
	}
	
	return timeFormat;
}

function getDateNow() {
	var d = new Date();
	var now =
		d.getFullYear() +
		"-" +
		((d.getMonth() < 10) ? '0'+d.getMonth() : d.getMonth()) +
		"-" +
		((d.getDate() < 10) ? '0'+d.getDate() : d.getDate()) +
		" " + 
		((d.getHours() < 10) ? '0'+d.getHours() : d.getHours()) +
		":" +
		((d.getMinutes() < 10) ? '0'+d.getMinutes() : d.getMinutes()) +
		":" + 
		((d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds());
	return now;
}

function ajaxCall(url, data, fnSuccess, fnError) {

	if ( typeof XMLHttpRequest === "undefined" ) {
		XMLHttpRequest = function () {
			try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
			catch (e) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
			catch (e) {}
			try { return new ActiveXObject("Microsoft.XMLHTTP"); }
			catch (e) {}
			throw new Error("This browser does not support XMLHttpRequest.");
		};
	}

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if ( xmlHttp.readyState == 4 ) {
			if ( xmlHttp.status == 200 )
				fnSuccess(JSON.parse(xmlHttp.responseText));
			else
				fnError(xmlHttp.status);
		}
	};	

	xmlHttp.open("POST", "../"+url, true);
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	var params = "";
	for ( var property in data )
		params += property + "=" + data[property] + "&";
	params = params.substring(0, params.length-1);	

	xmlHttp.send(params);
}

function randomIntFromInterval(min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function findCentroid(vs) {
	var c = new box2d.b2Vec2();
	var area = 0.0;
	var p1X = 0.0;
	var p1Y = 0.0;
	var inv3 = 1.0/3.0;
	var count = vs.length;

	for ( var i = 0; i < count; ++i ) {
		var p2 = vs[i];
		var p3 = i+1 < count ? vs[i+1] : vs[0];
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

	c.x *= 1.0/area;
	c.y *= 1.0/area;

	return c;
}

function getArea(vs) {
	var count = vs.length;
    var area = 0.0;
    var p1X = 0.0;
    var p1Y = 0.0;
    var inv3 = 1.0/3.0;
    for ( var i = 0; i < count; ++i ) {
        var p2 = vs[i];
        var p3 = i+1 < count ? vs[i+1] : vs[0];
        var e1X = p2.x - p1X;
        var e1Y = p2.y - p1Y;
        var e2X = p3.x - p1X;
        var e2Y = p3.y - p1Y;
        var D = (e1X * e2Y - e1Y * e2X);
        var triangleArea = 0.5 * D;
        area += triangleArea;
    }
    return area;
}