function geoToTiles(lon, lat, zoom) {
	lat = constrain(lat, -84.69, 84.69);
	let lonRad = lon * Math.PI / 180.;
	let latRad = lat * Math.PI / 180.;
	n = Math.pow(2, zoom);
	let xTile = n * ((lon +180.) / 360.);
	let yTile = n * (1.-(Math.log(Math.tan(latRad)+1/Math.cos(latRad))/Math.PI))/2.;
	xTile = Math.floor(xTile) % n;
	yTile = Math.floor(yTile) % n;
	// console.log(xTile, yTile);
	return {xTile, yTile, zoom};
}
