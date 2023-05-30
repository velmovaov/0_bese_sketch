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
		case 'yandex_traffic' : return `https://core-jams-rdr-cache.maps.yandex.net/1.1/tiles?l=trf&x=${x}&y=${y}&z=${z}`;
		case 'yandex_gps' : return `https://core-gpstiles.maps.yandex.net/tiles?style=point&x=${x}&y=${y}&z=${z}`;
		default: return `https://${s}.tile.osm.org/${z}/${x}/${y}.png`;
	}
}

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

let myFont;

function preload() {
	myFont = loadFont('./assets/Roboto-Regular.ttf');
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	ortho();
	// center = new p5.Vector(width / 2, height / 2);
	center = new p5.Vector(0, 0);
	pCenter = center.copy();
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
	scale(currentScale);
	rectMode(CORNERS);
	rect(-1, -1, 1, 1);

	for (let i = 0; i < img_tiles.length; i++) {
		let n = Math.pow(2, img_tiles[i].z);
		let offset = 2 / n;
		// image(img_tiles[i].img, img_tiles[i].x * offset - 1, img_tiles[i].y * offset - 1, offset, offset);
		push();
		texture(img_tiles[i].img);
		translate(img_tiles[i].x * offset - 1 + offset / 2, img_tiles[i].y * offset - 1 + offset / 2);
		translate(0, 0, img_tiles[i].z / 1000);
		plane(offset, offset);
		pop();
		// image(img_tiles[i].img, img_tiles[i].x * offset - 1, img_tiles[i].y * offset - 1, offset, offset);
	}

	//Сетка
	translate(0, 0, 0.01);
	noFill();
	stroke(0, 0, 150);
	// strokeWeight(1 / currentScale);
	strokeWeight(1);
	let n = Math.pow(2, curZ);
	rectSize = 2 / n;
	for (let i = 0; i <= n; i++) {
		beginShape();
		vertex(-1, i * rectSize - 1);
		vertex(1, i * rectSize - 1);
		endShape(LINES);
		beginShape();
		vertex(i * rectSize - 1, -1);
		vertex(i * rectSize - 1, 1);
		endShape(LINES);
	}

	// line(-1, i * rectSize - 1, 1, i * rectSize - 1);
	// line(i * rectSize - 1, -1, i * rectSize - 1, 1);
	stroke(255, 0, 0);
	rectMode(CORNER);
	rect(0 / (n / 2) - 1, 0 / (n / 2) - 1, rectSize, rectSize);

	pop();

	//TEXT OUT
	//TODO: сделать рендер текста нормальный
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
	cleanTiles();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}



function mouseDragged() {
	if (mouseButton === LEFT) {
		let geo = screenToGeo();
		// let zoom = Math.floor(random(curZ, curZ + 4));
		getTile(geoToTiles(geo.x, geo.y, curZ))
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

function getImage(z, x, y) {
	let img = new Image();

	let choice = Math.floor(random(tileServers.length));
	img.src = getWMTS(x, y, z, tileNames[Math.floor(random(tileNames.length))]);

	loadImage(img.src, image => {
		img_tiles.push(new Tile(image, z, x, y));
		sortTiles();
	});
}

function sortTiles() {
	img_tiles.sort(function (a, b) { return a.z - b.z; })
}

function getTile({ xTile, yTile, zoom }) {
	let download = true;
	for (let i = 0; i < tile_queue.length; i++) {
		if (tile_queue[i].z == zoom && tile_queue[i].x == xTile && tile_queue[i].y == yTile) {
			download = false;
			break;
		}
	}
	if (download) {
		tile_queue.push(new TileQueue(zoom, xTile, yTile));
		getImage(zoom, xTile, yTile);
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
}
