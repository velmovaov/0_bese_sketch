

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
	offsetStrength: 5,
	offsetSpeed: 0.001,
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
	for (let i = 0; i < serverNames.length; i++) {
		serverController.add(serverNames[i], serverNames[i].name);
	}
	gui.add(conf, 'offsetStrength', 0, 256);
	gui.add(conf, 'offsetSpeed', 0, 0.01);
}

let xOff = 0;
let yOff = 10;
function draw() {
	background(100);

	fill(50);
	noStroke();

	push();
	{
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
			let disp = offset/256.0 * conf.offsetStrength;
			xOff += conf.offsetSpeed;
			yOff += conf.offsetSpeed;
			let xoff = noise(xOff+i) * disp - disp*0.5;
			let yoff = noise(yOff+i) * disp - disp*0.5;
			// print(xOff);
			push();
			{
				translate(xoff, yoff);
				texture(img_tiles[i].img);
				translate(img_tiles[i].x * offset - 1 + offset / 2, img_tiles[i].y * offset - 1 + offset / 2);
				translate(0, 0, img_tiles[i].z / 1000);
				plane(offset, offset);
			}
			pop();
		}

		//Сетка градусная
		if (conf.drawGeoGrid) drawGeoGrid();
		//Сетка тайлов
		if (conf.drawTileGrid) drawTileGrid();
	}
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



function compileServersList() {
	useServers = [];
	serverNames.forEach(server => {
		// console.log(server);
		if (server[server.name] === true) useServers.push(server.name);
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
	else if (key === 'g') {
		conf.drawGeoGrid = !conf.drawGeoGrid;
	}
	else if (key === 't') {
		conf.drawTileGrid = !conf.drawTileGrid
	}
	// console.log(key);
}
