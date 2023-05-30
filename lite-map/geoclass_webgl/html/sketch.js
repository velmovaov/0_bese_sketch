function getWMTS(x, y, z, serverName = 'osm') {
	let prefix = ['a', 'b', 'c'];
	let s = prefix[Math.floor(random(prefix.length))];

	switch (serverName) {
		case 'osm': return `https://${s}.tile.osm.org/${z}/${x}/${y}.png`;
		case 'light': return `http://${s}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`;
		case 'dark': return `http://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
		case 'voyager': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
		case 'light_nolabels': return `http://${s}.basemaps.cartocdn.com/light_nolabels/${z}/${x}/${y}.png`;
		case 'light_only_labels': return `http://${s}.basemaps.cartocdn.com/light_only_labels/${z}/${x}/${y}.png`;
		case 'dark_nolabels': return `http://${s}.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png`;
		case 'dark_only_labels': return `http://${s}.basemaps.cartocdn.com/dark_only_labels/${z}/${x}/${y}.png`;
		case 'voyager_nolabels': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/${z}/${x}/${y}.png`;
		case 'voyager_only_labels': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/${z}/${x}/${y}.png`;
		case 'voyager_labels_under': return `http://${s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}.png`;
		case 'toner': return `https://stamen-tiles.a.ssl.fastly.net/toner/${z}/${x}/${y}.png`;
		case 'terrain': return `https://stamen-tiles.a.ssl.fastly.net/terrain/${z}/${x}/${y}.png`;
		case 'watercolor': return `https://stamen-tiles.a.ssl.fastly.net/watercolor/${z}/${x}/${y}.png`;
		case 'yandex_sat': return `https://sat04.maps.yandex.net/tiles?l=sat&x=${x}&y=${y}&z=${z}`;
		case 'yandex_traffic': return `https://core-jams-rdr-cache.maps.yandex.net/1.1/tiles?l=trf&x=${x}&y=${y}&z=${z}`;
		case 'yandex_gps': return `https://core-gpstiles.maps.yandex.net/tiles?style=point&x=${x}&y=${y}&z=${z}`;
		default: return `https://${s}.tile.osm.org/${z}/${x}/${y}.png`;
	}
}

let serverNames = [
	{ 'name' : 'osm', 'osm' : true },
	{ 'name' : 'light', 'light' : false },
	{ 'name' : 'dark', 'dark' : false },
	{ 'name' : 'voyager', 'voyager' : false },
	{ 'name' : 'light_nolabels', 'light_nolabels' : false },
	{ 'name' : 'light_only_labels', 'light_only_labels' : false },
	{ 'name' : 'dark_nolabels', 'dark_nolabels' : false },
	{ 'name' : 'dark_only_labels', 'dark_only_labels' : false },
	{ 'name' : 'voyager_nolabels', 'voyager_nolabels' : false },
	{ 'name' : 'voyager_only_labels', 'voyager_only_labels' : false },
	{ 'name' : 'voyager_labels_under', 'voyager_labels_under' : false },
	{ 'name' : 'toner', 'toner' : false },
	{ 'name' : 'terrain', 'terrain' : false },
	{ 'name' : 'watercolor', 'watercolor' : false },
	{ 'name' : 'yandex_sat', 'yandex_sat' : false },
	{ 'name' : 'yandex_traffic', 'yandex_traffic' : false },
	{ 'name' : 'yandex_gps', 'yandex_gps' : false }
];

let useServers = ['osm'];

class Tile {
	constructor(img, z, x, y) {
		this.img = img;
		this.z = z;
		this.x = x;
		this.y = y;
	}
}

class TileQueue {
	constructor(z, x, y) {
		this.z = z;
		this.x = x;
		this.y = y;
	}
}

let img_tiles = [];
let tile_queue = [];

let Rearth = 6378137.;
let currentScale = 300;
let curZ = 0;
let isDragging = false;
let center;
let pCenter;
let sizeT = 2;

let myFont;

let conf = {
	drawGeoGrid: true,
	drawTileGrid: false,
}

var gui;

function preload() {
	myFont = loadFont('./assets/Roboto-Regular.ttf');
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	ortho();
	// center = new p5.Vector(width / 2, height / 2);
	center = new p5.Vector(0, 0);
	pCenter = center.copy();
	gui = new dat.GUI();
	let serverController = gui.addFolder('Servers');
	for(let i = 0; i < serverNames.length; i++) {
		serverController.add(serverNames[i], serverNames[i].name);
	}
}

function draw() {
	background(100);

	fill(50);
	noStroke();

	push();
	if (isDragging) {
		let diff = new p5.Vector(mouseX, mouseY).sub(pCenter);
		translate(diff.x, diff.y);
	}
	translate(center.x, center.y);
	scale(currentScale, currentScale, 1);
	rectMode(CORNERS);
	rect(-1, -1, 1, 1);

	for (let i = 0; i < img_tiles.length; i++) {
		let n = Math.pow(2, img_tiles[i].z);
		let offset = 2 / n;
		push();
		texture(img_tiles[i].img);
		translate(img_tiles[i].x * offset - 1 + offset / 2, img_tiles[i].y * offset - 1 + offset / 2);
		translate(0, 0, img_tiles[i].z / 1000);
		plane(offset, offset);
		pop();
	}

	//Сетка градусная
	if(conf.drawGeoGrid)
		drawGeoGrid();

	//Сетка тайлов
	if(conf.drawTileGrid)
		drawTileGrid();
	pop();


	//TEXT OUT
	//TODO: сделать рендер текста нормальный
	blendMode(EXCLUSION);
	push();
	translate(0, 0, 1);
	let geo = screenToGeo();
	textFont(myFont);
	textSize(14);
	fill(255);
	text(`${Math.floor(geo.x)} ${Math.floor(geo.y)} \n\n Загружено: ${img_tiles.length} шт.`, mouseX - width / 2, mouseY - height / 2 - 5);
	let tileInfo = geoToTiles(geo.x, geo.y, curZ)
	text(`xTile: ${tileInfo.xTile}, yTile: ${tileInfo.yTile}, zoom: ${tileInfo.zoom}`, mouseX - width / 2, mouseY - height / 2 - 20);
	fill(255, 0, 0);
	noStroke();
	circle(mouseX - width / 2, mouseY - height / 2, 6);
	pop();
	blendMode(BLEND);

	push();
	translate(mouseX - width / 2, mouseY - height / 2);
	scale(currentScale, currentScale, 1);
	translate(0, 0, 1);
	rectMode(CENTER);
	noFill()
	stroke(150, 150, 200);
	// drawingContext.setLineDash([10,5]);
	let n = Math.pow(2, curZ);
	rectSize = 2 / n;
	rect(0, 0, rectSize, rectSize);
	pop();
	cleanTiles();
	compileServersList();
}

function drawTileGrid() {
	push();
	translate(-sizeT / 2, -sizeT / 2);

	translate(0, 0, 0.01);
	noFill();
	stroke(0, 0, 150);
	strokeWeight(1);
	let n = Math.pow(2, curZ);
	rectSize = 2 / n;
	for (let i = 0; i <= n; i++) {
		beginShape();
		vertex(0, i * rectSize);
		vertex(2, i * rectSize);
		endShape(LINES);
		beginShape();
		vertex(i * rectSize, 0);
		vertex(i * rectSize, 2);
		endShape(LINES);
	}
	pop();
}

function drawGeoGrid() {
	push();
	translate(-sizeT / 2, -sizeT / 2);
	let G = new Geo();
	G.zoom = 0;
	G.size = 2;
	translate(0, 0, 0.005);
	noFill();
	stroke(0, 150, 0);
	strokeWeight(1);
	for (let lon = -180; lon <= 180; lon += 10) {
		let x1 = G.xFromLonRad(deg2rad(lon));
		let y1 = G.yFromLatRad(deg2rad(-85.051));
		let y2 = G.yFromLatRad(deg2rad(85.051));
		beginShape();
		vertex(x1, y1);
		vertex(x1, y2);
		endShape(LINES);
	}
	for (let lat = -80; lat <= 80; lat += 10) {
		let x1 = G.xFromLonRad(deg2rad(-180));
		let x2 = G.xFromLonRad(deg2rad(180));
		let y1 = G.yFromLatRad(deg2rad(lat));
		beginShape();
		vertex(x1, y1);
		vertex(x2, y1);
		endShape(LINES);
	}
	pop();
}

function compileServersList() {
	useServers = [];
	serverNames.forEach(server => {
		// console.log(server);
		if(server[server.name] === true) useServers.push(server.name);
	});
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseDragged() {
	if (mouseButton === LEFT) {
		let geo = screenToGeo();
		// let zoom = Math.floor(random(curZ, curZ + 4));
		getTile(geoToTiles(geo.x, geo.y, curZ), useServers[Math.floor(random(useServers.length))]);
	}

}

function mousePressed() {
	if (mouseButton === CENTER) {
		isDragging = true;
		pCenter.set(mouseX, mouseY);
	}

}

function mouseReleased() {
	if (mouseButton === CENTER) {
		isDragging = false;
		let diff = new p5.Vector(mouseX, mouseY).sub(pCenter);
		center.add(diff);
		pCenter.set(center);
	}
}

function mouseWheel(event) {
	if (event.delta < 0) {
		let diff = new p5.Vector(mouseX - width / 2, mouseY - height / 2).sub(center);
		diff.mult(0.5);
		center.add(diff);
	}
	else {
		let diff = new p5.Vector(mouseX - width / 2, mouseY - height / 2).sub(center);
		diff.mult(1);
		center.sub(diff);
	}
	// let diff = center.sub(new p5.Vector(mouseX, mouseY));
	currentScale *= event.delta > 0 ? 2 : 0.5;
}

function getImage(z, x, y, serverName = 'osm') {
	let img = new Image();

	// let choice = Math.floor(random(tileServers.length));
	img.src = getWMTS(x, y, z, serverName);
	// img.src = getWMTS(x, y, z, serverNames[0]);

	loadImage(img.src, image => {
		img_tiles.push(new Tile(image, z, x, y));
		sortTiles();
	});
}

function sortTiles() {
	img_tiles.sort(function (a, b) { return a.z - b.z; })
}

function getTile({ xTile, yTile, zoom }, serverName = 'osm') {
	let download = true;
	for (let i = 0; i < tile_queue.length; i++) {
		if (tile_queue[i].z == zoom && tile_queue[i].x == xTile && tile_queue[i].y == yTile) {
			download = false;
			break;
		}
	}
	if (download) {
		tile_queue.push(new TileQueue(zoom, xTile, yTile));
		getImage(zoom, xTile, yTile, serverName);
	}
}

function cleanTiles() {
	for (let i = 0; i < img_tiles.length; i++) {
		for (let j = i + 1; j < img_tiles.length; j++) {
			if (img_tiles[i].z == img_tiles[j].z && img_tiles[i].x == img_tiles[j].x && img_tiles[i].y == img_tiles[j].y) {
				img_tiles.splice(j, 1);
				j--;
			}
		}
	}
}

function keyPressed() {
	if (key === '+') {
		curZ += 1;
	}
	else if (key === '-') {
		curZ -= 1;
	}
	else if(key === 'g') {
		conf.drawGeoGrid = !conf.drawGeoGrid;
	}
	else if(key === 't') {
		conf.drawTileGrid = !conf.drawTileGrid 
	}
	// console.log(key);
}
