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
	zoom: 12,
	style: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'

	// style: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
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

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);

	myMap = mappa.tileMap(options);

	myMap.overlay(canvas);

}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	// background(100);
	clear();

	// objs.forEach(element => {
	// 	let pt = myMap.latLngToPixel(element);
	// 	ellipse(pt.x, pt.y, 15, 15);
	// });

	for (let i = 0; i < objs.length; i++) {
		fill(255. / objs.length * i, 0, 0);
		let pt = myMap.latLngToPixel(objs[i]);
		ellipse(pt.x, pt.y, 3 + 5 * i, 3 + 5 * i);
	}

	polys.forEach(poly => {
		noStroke();
		fill(255, 0, 0);
		poly.forEach(vert => {
			let pt = myMap.latLngToPixel(vert);
			circle(pt.x, pt.y, 5);
		});
	});

	fill(255);
	ellipse(mouseX, mouseY, 21, 21);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	canvas = resizeCanvas(windowWidth, windowHeight);
	myMap.mappaDiv.style.width = windowWidth + 'px';
	myMap.mappaDiv.style.height = windowHeight + 'px';
}

function mouseClicked() {
	// console.log(mouseX, mouseY);
	console.log(myMap.pixelToLatLng(mouseX, mouseY));
	let coords = myMap.pixelToLatLng(mouseX, mouseY);
	if (keyIsPressed === true && keyCode === CONTROL) {
		objs.push(myMap.pixelToLatLng(mouseX, mouseY));
	} else {
		
		// Define the Overpass query
		var query = `[out:json];
               		way(around:1, ${coords.lat}, ${coords.lng})["building"];
             			out center;`;
		console.log(query);

		// Send the Overpass query using the Fetch API
		fetch("https://overpass-api.de/api/interpreter", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: "data=" + encodeURIComponent(query),
		})
			.then((response) => response.json()) // Parse the response as JSON
			.then((data) => {
				// The data variable now contains the GeoJSON data for the area you queried
				console.log(data);
				if (data.elements.length > 0) {
					console.log(data.elements[0]);
					//Получили список вершин
					// Define the Overpass query
					var query = `[out:json];
												node(id:${data.elements[0].nodes.join(",")});
												out center;`;

					// Send the Overpass query using the Fetch API
					fetch("https://overpass-api.de/api/interpreter", {
						method: "POST",
						headers: { "Content-Type": "application/x-www-form-urlencoded" },
						body: "data=" + encodeURIComponent(query),
					})
						.then((response) => response.json()) // Parse the response as JSON
						.then((data) => {
							// The data variable now contains the GeoJSON data for the nodes with the specified IDs
							console.log(data);
							if (data.elements.length > 0) {
								let vts = [];
								data.elements.forEach(element => {
									vts.push([element.lat, element.lon]);
								});
								polys.push(vts);
							}
						});


				}
			});
	}
}
