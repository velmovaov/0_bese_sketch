function geoToTiles(lon, lat, zoom) {
	lat = constrain(lat, -84.69, 84.69);
	let lonRad = lon * Math.PI / 180.;
	let latRad = lat * Math.PI / 180.;
	n = Math.pow(2, zoom);
	let xTile = n * ((lon + 180.) / 360.);
	let yTile = n * (1. - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2.;
	xTile = Math.floor(xTile) % n;
	yTile = Math.floor(yTile) % n;
	// console.log(xTile, yTile);
	return { xTile, yTile, zoom };
}

function screenToGeo() {
	// let offset = new p5.Vector(width / 2, height / 2).sub(center);
	let offset = new p5.Vector(0, 0).sub(center);
	let x = constrain(map(mouseX + offset.x, width / 2 - currentScale, width / 2 + currentScale, -1, 1), -1, 1) * 180;
	let y = constrain(map(mouseY + offset.y, height / 2 - currentScale, height / 2 + currentScale, 1, -1), -1, 1);
	y *= 20000000;//19589163.58;
	y = (2 * Math.atan(Math.exp(y / Rearth)) - Math.PI / 2) * (180 / Math.PI);
	return { x, y };
}

function deg2rad(deg) {
	return deg * PI / 180;
}

function rad2deg(rad) {
	return rad * 180 / PI;
}

class Geo {
	zoom = 0;
	size = 2;

	//Lon in radians
	xFromLonRad(lon, size = this.size, zoom = this.zoom) {
		return size / (2 * PI) * Math.pow(2, zoom) * (lon + PI);
	}

	//Lat in radians
	yFromLat(lat, size = this.size, zoom = this.zoom) {
		return size / (2 * PI) * (Math.pow(2, zoom)) * (PI - Math.log(Math.tan(PI / 4 + lat / 2)));
	}

}
