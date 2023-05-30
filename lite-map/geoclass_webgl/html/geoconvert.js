class Geo {
	zoom = 0;
	size = 2;

	//Lon in radians
	xFromLonRad(lon, size = this.size, zoom = this.zoom) {
		return size / (2 * PI) * Math.pow(2, zoom) * (lon + PI);
	}

	//Lat in radians
	yFromLatRad(lat, size = this.size, zoom = this.zoom) {
		return size / (2 * PI) * (Math.pow(2, zoom)) * (PI - Math.log(Math.tan(PI / 4 + lat / 2)));
	}

	lonFromX(x, size = this.size, zoom = this.zoom) {
		return constrain(-(size * PI - PI * x * Math.pow(2, 1 - zoom)) / size, -PI, PI);
	}

	latFromY(y, size = this.size, zoom = this.zoom) {
		return constrain(-(PI-4*Math.atan(Math.exp(PI-(PI*y*Math.pow(2,(1-zoom)))/size)))/2, -PI/2, PI/2);
	}
}

function geoToTiles(lon, lat, zoom) {
	lat = constrain(lat, -84.69, 84.69);
	let lonRad = lon * Math.PI / 180;
	// let lonRad = lon;
	let latRad = lat * Math.PI / 180;
	// let latRad = lat;
	n = Math.pow(2, zoom);
	let xTile = n * ((lon + 180) / 360);
	let yTile = n * (1. - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2.;
	xTile = Math.floor(xTile);
	yTile = Math.floor(yTile);
	// console.log(xTile, yTile);
	return { xTile, yTile, zoom };
}

let GeoTransform = new Geo();

function screenToGeo() {
	let offset = new p5.Vector(mouseX- width/2, mouseY-height/2);
	offset.sub(center);
	offset.div(currentScale);
	offset.add(new p5.Vector(1, 1));
	let x = GeoTransform.lonFromX(offset.x);
	let y = GeoTransform.latFromY(offset.y);

	x = rad2deg(x);
	y = rad2deg(y);
	return { x, y };
}

function deg2rad(deg) {
	return deg * PI / 180;
}

function rad2deg(rad) {
	return rad * 180 / PI;
}

