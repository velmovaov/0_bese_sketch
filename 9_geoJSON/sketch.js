// const Delaunay = require("./delaunay");

// Объект карты
let myMap;
// Холст p5js
let canvas;
// Объект mappa
const mappa = new Mappa('Leaflet');
// Дополнительные настройки карты (координаты центра, масштаб, сервер)
const options = {
	lat: 56,
	lng: 93,
	zoom: 13,
	// style: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'

	style: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'

	// style: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
	// style: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png'
	// style: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png'
};

let objs = [];
let polys = [];

let balls = [];
let attractor;
var gui;
let settingsObject = {
	radius: 10,
	forces_x: 0.1,
	forces_y: 0.1,
	useGlobal: false,
	cleanBackground: true,
	backAlpha: 50,
	playSim: false,
	effectField: 300,
	collide: true,
	offset: {
		x: 0,
		y: 0
	},
	zOffset: {
		x: 0,
		y: 0
	},
	zoom: 12,
	trailLength: 100,
};

let data;

function preload() {
	data = loadJSON('./data/kras_border.geojson');
}
// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);

	myMap = mappa.tileMap(options);

	myMap.overlay(canvas);
	myMap.onChange(onChangedMap);
	attractor = new p5.Vector(width / 2, height / 2);

	gui = new dat.GUI();
	let ballsController = gui.addFolder('Balls');
	ballsController.add(settingsObject, "radius", 5, 50);
	ballsController.add(settingsObject, "forces_x", -2, 2);
	ballsController.add(settingsObject, "forces_y", -2, 2);
	ballsController.add(settingsObject, "useGlobal").listen();
	ballsController.add(settingsObject, "backAlpha", 0, 255);
	ballsController.add(settingsObject, "cleanBackground");
	ballsController.add(settingsObject, "playSim").listen();
	ballsController.add(settingsObject, "effectField", 0, 600).listen();
	ballsController.add(settingsObject, "collide").listen();
	ballsController.add(settingsObject, "trailLength", 0, 1000).listen();

	select(".dg").elt.style.zIndex = 1000;

}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	// background(100);
	clear();

	if (data) {
		noFill();
		stroke(255, 0, 0);
		beginShape();
		for (let i = 0; i < data.features[0].geometry.coordinates[0][0].length; i++) {
			let pt = myMap.latLngToPixel(data.features[0].geometry.coordinates[0][0][i][1], data.features[0].geometry.coordinates[0][0][i][0]);
			// console.log(vert);
			vertex(pt.x, pt.y);
		}
		endShape(CLOSE);
	}


	stroke(150);
	for (let i = 0; i < objs.length; i++) {
		fill(255. / objs.length * i, 0, 0);
		let pt = myMap.latLngToPixel(objs[i]);
		ellipse(pt.x, pt.y, 5, 5);
	}

	polys.forEach(poly => {
		// strokeWeight(5);
		stroke(150);
		fill(255, 0, 0);
		beginShape();
		poly.forEach(vert => {
			let pt = myMap.latLngToPixel(vert);
			// circle(pt.x, pt.y, 5);
			vertex(pt.x, pt.y);
		});
		endShape(CLOSE);
	});

	let vertDelaunay = [];

	for (let i = 0; i < balls.length; i++) {
		if (settingsObject.playSim) {
			balls[i].update();
		}
		balls[i].draw();
		vertDelaunay.push([balls[i].pos.x, balls[i].pos.y]);
	}
	
	let triangles = Delaunay.triangulate(vertDelaunay);

	for (let i = 0; i < triangles.length; i += 3) {
		beginShape();
		fill(255 - (i / triangles.length) * 255, 0, 128, 40);
		stroke(80, 80);
		vertex(vertDelaunay[triangles[i]][0], vertDelaunay[triangles[i]][1]);
		vertex(vertDelaunay[triangles[i + 1]][0], vertDelaunay[triangles[i + 1]][1]);
		vertex(vertDelaunay[triangles[i + 2]][0], vertDelaunay[triangles[i + 2]][1]);
		endShape(CLOSE);
	}

	noFill();
	drawingContext.setLineDash([5, 5]);
	stroke(120);
	circle(mouseX, mouseY, settingsObject.effectField * 2);
	drawingContext.setLineDash([]);
	fill(255);
	ellipse(mouseX, mouseY, 21, 21);

	fill(100);
	noStroke();
	textSize(24);
	text(settingsObject.zoom + '\n' +
		settingsObject.offset.x + ' ' + settingsObject.offset.y + '\n' +
		settingsObject.zOffset.x + ' ' + settingsObject.zOffset.y, 60, 40);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	canvas = resizeCanvas(windowWidth, windowHeight);
	myMap.mappaDiv.style.width = windowWidth + 'px';
	myMap.mappaDiv.style.height = windowHeight + 'px';
}

function mouseClicked() {
	// console.log(mouseX, mouseY);
	// console.log(myMap.pixelToLatLng(mouseX, mouseY));
	let coords = myMap.pixelToLatLng(mouseX, mouseY);
	if (keyIsPressed === true && keyCode === CONTROL) {
		objs.push(myMap.pixelToLatLng(mouseX, mouseY));
	} else if (keyIsPressed === true && keyCode === ALT) {
		let vert = myMap.pixelToLatLng(mouseX, mouseY);
		balls.push(new Ball(settingsObject.radius, new p5.Vector(vert.lat, vert.lng), new p5.Vector(0, 0), new p5.Vector(settingsObject.forces_x, settingsObject.forces_y), myMap));
	} else {
		queryOSM(coords);
	}
}

function keyPressed() {
	console.log(key);
	if (key == 'p') {
		settingsObject.playSim = !settingsObject.playSim;
	} else if (key == 'c') {
		settingsObject.collide = !settingsObject.collide;
	} else if (key == 'g') {
		settingsObject.useGlobal = !settingsObject.useGlobal;
	}
}

function mouseMoved() {
	attractor.x = mouseX;
	attractor.y = mouseY;
}

function onChangedMap() {
	console.log('changed');
	analyzeLeaflet();
	balls.forEach(ball => {
		ball.syncToPixel();
		console.log(ball);
	});
	redraw();
}

function analyzeLeaflet() {
	const regex = /translate\(([-\d]+)px,\s+([-.\d]+)px\)/;
	const regex3d = /translate3d\(([-\d]+)px,\s+([-.\d]+)px,\s+([-.\d]+)px\)/;

	let zooms = selectAll('.leaflet-zoom-animated').length;
	let curZoom = 0;
	for (let i = 0; i < zooms; i++) {
		curZoom = selectAll('.leaflet-zoom-animated')[i].elt.childElementCount > 0 ? i : curZoom;
	}

	let imgs = document.getElementsByTagName("img");

	let src = imgs[0].src;
	// let src = selectAll('.leaflet-zoom-animated')[curZoom].elt.src;
	const zoomRegex = /\/(\d+)\/\d+\/\d+\.png$/;
	let zoomMatch;
	if (src)
		zoomMatch = src.match(zoomRegex);
	console.log(zoomMatch);
	if (zoomMatch)
		settingsObject.zoom = zoomMatch[1];
	console.log(settingsObject.zoom);



	let zt = selectAll('.leaflet-zoom-animated')[curZoom].elt.style.transform;
	let zoomTrans = zt.match(regex3d);
	settingsObject.zOffset.x = zoomTrans[1];
	settingsObject.zOffset.y = zoomTrans[2];

	tileNum = selectAll('.leaflet-zoom-animated')[curZoom].length;
	let t = select('#defaultCanvas0').elt.style.transform;
	let mp = select('.leaflet-map-pane').elt.style.transform;
	const matches3d = mp.match(regex3d);
	if (matches3d) {
		settingsObject.offset.x = Number(matches3d[1]);
		settingsObject.offset.y = Number(matches3d[2]);
	}
	console.log("tiles");
	console.log(settingsObject.offset);
	console.log(settingsObject.zOffset);
}
