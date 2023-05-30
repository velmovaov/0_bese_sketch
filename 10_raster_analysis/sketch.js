let canvas; // Холст p5js
let myMap; // Объект карты
const mappa = new Mappa('Leaflet'); // Объект mappa

// Дополнительные настройки карты (координаты центра, масштаб, сервер)
const options = {
	lat: 56,
	lng: 93,
	zoom: 12,
	// style: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'

	// style: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
	style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
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

// Заготовка класса для хранения и описания данных о тайлах
class tileObj {

	constructor(index, width, height, color, posX, posY, img) {
		this.index = index;
		this.width = width;
		this.height = height;
		this.color = color;
		this.posX = posX;
		this.posY = posY;
		this.img = img;
	}
}

let settingsObject = {
	radius : 10,
	forces_x : 0.1,
	forces_y : 0.1,
	useGlobal : false,
	cleanBackground : true,
	backAlpha : 50,
	playSim : false,
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

let drawOffset = {
	canvas: {
		x: 0,
		y: 0,
	},
	zoomed: {
		x: 0,
		y: 0,
	}
};

let canvasPos = [0, 0];
let zoomPos = [0, 0];
let gridTransform = [];
let tileNum = 0;
let tileColors = [];

let tiles = [];

let objs = [];

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);

	myMap = mappa.tileMap(options);

	myMap.overlay(canvas);
	myMap.onChange(onChangedMap); //Вызывает onChangedMap() при сдвиге, масштабировании карты
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	clear();
	//знакомимся с тайлами
	drawGrid();
	//рисуем свои метки
	for (let i = 0; i < objs.length; i++) {
		fill(255. / objs.length * i, 0, 0);
		let pt = myMap.latLngToPixel(objs[i]);
		ellipse(pt.x, pt.y, 3 + 5 * i, 3 + 5 * i);
	}
	//общая информация
	fill(0, 155, 0);
	noStroke();
	textSize(24);
	let info = 'тайлов ' + tiles.length;
	text(info, 60, 40);
	//курсор
	// fill(100, 0, 0, 50);
	stroke(255, 0, 0);
	strokeWeight(1);
	line(mouseX - 30, mouseY, mouseX + 30, mouseY);
	line(mouseX, mouseY - 30, mouseX, mouseY + 30);
	// ellipse(mouseX, mouseY, 51, 51);
	fill(80);
	noStroke();
	textSize(16);
	text("screen: " + "x" + mouseX + " y" + mouseY, mouseX+10, mouseY - 10);
	text("canvas: " + "x" + (mouseX - drawOffset.canvas.x) + " y" + (mouseY - drawOffset.canvas.y), mouseX+10, mouseY + 20);
	text("zoomed: " + "x" + (mouseX - drawOffset.canvas.x - drawOffset.zoomed.x) + " y" + (mouseY - drawOffset.canvas.y - drawOffset.zoomed.y), mouseX+10, mouseY + 40);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	canvas = resizeCanvas(windowWidth, windowHeight);
	myMap.mappaDiv.style.width = windowWidth + 'px';
	myMap.mappaDiv.style.height = windowHeight + 'px';
}

function mouseClicked() {
	if (keyIsPressed === true && keyCode === CONTROL) {
		objs.push(myMap.pixelToLatLng(mouseX, mouseY));
	}
}

function mouseDragged() {
}

function onChangedMap() {
	analyzeTiles();
	redraw();
}

function analyzeTiles() {
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
	if(src)
		zoomMatch = src.match(zoomRegex);
		console.log(zoomMatch);
	if(zoomMatch)
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

function drawGrid() {
	noStroke();
	push();
	translate(drawOffset.canvas.x, drawOffset.canvas.y);

	push();
	translate(drawOffset.zoomed.x, drawOffset.zoomed.y);
	
	for (let i = 0; i < tiles.length; i++) {
		push();
		translate(Number(tiles[i].posX), Number(tiles[i].posY));
		
		fill(0, 0, 150);
		noStroke();
		let textC = 'tile ' + i + '\npos ' + 'x' + tiles[i].posX + ' y' + tiles[i].posY + 
		'\ncanvas ' + 'x' + drawOffset.canvas.x + ' y' + drawOffset.canvas.y + 
		'\nzoom ' + 'x' + drawOffset.zoomed.x + ' y' + drawOffset.zoomed.y;
		textSize(12);
		text(textC, 20, 20);
		// strokeWeight(12);
		// stroke(tiles[i].color[0], tiles[i].color[1], tiles[i].color[2]);
		noStroke();
		fill(tiles[i].color[0], tiles[i].color[1], tiles[i].color[2], 200);
		// noFill();
		let off = 5;
		rect(0 + off, 0 + off, 256 - 2*off, 256 - 2*off);
		strokeWeight(4);
		off = 2;
		stroke(255 - tiles[i].color[0], 255 - tiles[i].color[1], 255 - tiles[i].color[2]);
		rect(0 + off, 0 + off, 256 - 2*off, 256 - 2*off);
		pop();
	}

	pop();
	pop();
}
