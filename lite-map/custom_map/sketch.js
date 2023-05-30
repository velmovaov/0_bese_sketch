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
let curZ = 3;
let isDragging = false;
let center;
let pCenter;


function setup() {
	createCanvas(windowWidth, windowHeight);
	center = new p5.Vector(width / 2, height / 2);
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
		image(img_tiles[i].img, img_tiles[i].x * offset - 1, img_tiles[i].y * offset - 1, offset, offset);
	}

	noFill();
	stroke(0, 0, 150);
	strokeWeight(1 / currentScale);
	let n = Math.pow(2, curZ);
	rectSize = 2 / n;
	for (let i = 0; i <= n; i++) {
		line(-1, i * rectSize - 1, 1, i * rectSize - 1);
		line(i * rectSize - 1, -1, i * rectSize - 1, 1);
	}
	stroke(255, 0, 0);
	rectMode(CORNER);
	rect(0 / (n / 2) - 1, 0 / (n / 2) - 1, rectSize, rectSize);

	pop();

	let geo = screenToGeo();
	fill(255);
	text(`${Math.floor(geo.x)} ${Math.floor(geo.y)} \n\n ${img_tiles.length}`, mouseX, mouseY);
	let tileInfo = geoToTiles(geo.x, geo.y, curZ)
	text(`xTile: ${tileInfo.xTile}, yTile: ${tileInfo.yTile}, zoom: ${tileInfo.zoom}`, mouseX, mouseY - 30);
	fill(255, 0, 0);
	noStroke();
	circle(mouseX, mouseY, 6);

	cleanTiles();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function screenToGeo() {
	let offset = new p5.Vector(width / 2, height / 2).sub(center);
	let x = constrain(map(mouseX + offset.x, width / 2 - currentScale, width / 2 + currentScale, -1, 1), -1, 1) * 180;
	let y = constrain(map(mouseY + offset.y, height / 2 - currentScale, height / 2 + currentScale, 1, -1), -1, 1);
	y *= 20000000;
	y = (2 * Math.atan(Math.exp(y / Rearth)) - Math.PI / 2) * (180 / Math.PI);
	return { x, y };
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
		let diff = new p5.Vector(mouseX, mouseY).sub(center);
		diff.mult(0.5);
		center.add(diff);
	} else {
		let diff = new p5.Vector(mouseX, mouseY).sub(center);
		diff.mult(1);
		center.sub(diff);
	}
	// let diff = center.sub(new p5.Vector(mouseX, mouseY));
	currentScale *= event.delta > 0 ? 2 : 0.5;
}

function getImage(z, x, y) {
	let tileServers = [
		`https://a.tile.osm.org/${z}/${x}/${y}.png`,
		`https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
		`https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`,
		`https://stamen-tiles.a.ssl.fastly.net/terrain/${z}/${x}/${y}.png`,
		`https://stamen-tiles.a.ssl.fastly.net/watercolor/${z}/${x}/${y}.png`,//];
		`http://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`,
		`https://stamen-tiles.a.ssl.fastly.net/toner/${z}/${x}/${y}.png`];
	let img = new Image();

	let choice = Math.floor(random(tileServers.length));
	img.src = tileServers[choice];

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
