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
	textSize(24);
	let info = 'тайлов ' + tiles.length;
	text(info, 60, 40);
	//курсор
	fill(100, 0, 0, 50);
	noStroke();
	ellipse(mouseX, mouseY, 51, 51);
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
	tiles = [];
	const regex = /translate\(([-\d]+)px,\s+([-.\d]+)px\)/;
	const regex3d = /translate3d\(([-\d]+)px,\s+([-.\d]+)px,\s+([-.\d]+)px\)/;

	let zooms = selectAll('.leaflet-zoom-animated').length;
	let curZoom = 0;
	for (let i = 0; i < zooms; i++) {
		curZoom = selectAll('.leaflet-zoom-animated')[i].elt.childElementCount > 0 ? i : curZoom;
		// console.log(curZoom);
	}
	let zt = selectAll('.leaflet-zoom-animated')[curZoom].elt.style.transform;
	let zoomTrans = zt.match(regex3d);
	// zoomPos[0] = zoomTrans[1];
	// zoomPos[1] = zoomTrans[2];
	drawOffset.zoomed.x = zoomTrans[1];
	drawOffset.zoomed.y = zoomTrans[2];
	tileNum = selectAll('.leaflet-zoom-animated')[curZoom].length;
	let t = select('#defaultCanvas0').elt.style.transform;
	const matches = t.match(regex);
	let mp = select('.leaflet-map-pane').elt.style.transform;
	const matches3d = mp.match(regex3d);
	let imgs = document.getElementsByTagName("img");
	gridTransform = [];
	tileColors = [];
	for (let i = 0; i < imgs.length; i++) {
		let gt = imgs[i].style.transform.match(regex3d);
		gridTransform.push([gt[1], gt[2]]);
		tileColors.push([0, 0, 0, 0]);

		let img = new Image();
		img.src = imgs[i].src;
		loadImage(img.src, image => {
			image.loadPixels();
			let avg = 0;
			image.pixels.forEach(pix => {
				avg += pix;
			});
			avg /= image.pixels.length;
			for (let j = 0; j < tiles.length; j++) {
				if (tiles[j].index == i) {
					c = [image.pixels[(127 * 256 + 127) * 4 + 0],
					image.pixels[(127 * 256 + 127) * 4 + 1],
					image.pixels[(127 * 256 + 127) * 4 + 2],
					image.pixels[(127 * 256 + 127) * 4 + 3]];
					tiles[j].color = [avg, avg, avg, avg]; //image.get(127, 127); только быстрее
					tiles[j].img = image;
					redraw();
					break;
				}
			}
		});
		tiles.push(new tileObj(i, 256, 256, [100, 100, 100, 0], gt[1], gt[2]));
	}


	if (matches3d) {
		// canvasPos[0] = matches3d[1];
		// canvasPos[1] = matches3d[2];
		drawOffset.canvas.x = Number(matches3d[1]);
		drawOffset.canvas.y = Number(matches3d[2]);
	}
}

function drawGrid() {
	stroke(150);
	strokeWeight(0.1);
	push();
	translate(drawOffset.canvas.x, drawOffset.canvas.y);
	push();
	// translate(Number(zoomPos[0]), Number(zoomPos[1]));
	translate(drawOffset.zoomed.x, drawOffset.zoomed.y);
	textSize(12);

	for (let i = 0; i < tiles.length; i++) {
		push();
		translate(Number(tiles[i].posX), Number(tiles[i].posY));
		fill(0, 0, 150);
		let textC = 'tile ' + i + '\npos ' + 'x' + tiles[i].posX + ' y' + tiles[i].posY + 
								'\ncanvas ' + 'x' + drawOffset.canvas.x + ' y' + drawOffset.canvas.y + 
								'\nzoom ' + 'x' + drawOffset.zoomed.x + ' y' + drawOffset.zoomed.y;
		text(textC, 20, 20);
		fill(tiles[i].color[0], tiles[i].color[1], tiles[i].color[2], 150);
		rect(0, 0, 256, 256);
		pop();
	}

	pop();
	pop();
}
