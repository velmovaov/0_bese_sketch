// Настройка приложения
// Данная функция будет выполнена первой и только один раз

let balls = [];
let attractor;

var gui;
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
};

function setup() {
	createCanvas(windowWidth, windowHeight);
	attractor = new p5.Vector(width / 2, height / 2);
	// gui = createGui("Настройка шариков");
	gui = new dat.GUI();
	let ballsController = gui.addFolder('Balls');
	ballsController.add(settingsObject, "radius", 5, 50);
	// sliderRange(5, 50, 1);
	// gui.addGlobals('radius');
	// sliderRange(-2, 2, 0.1);
	// gui.addGlobals('forces_x', 'forces_y');
	ballsController.add(settingsObject, "forces_x", -2, 2);
	ballsController.add(settingsObject, "forces_y", -2, 2);
	// sliderRange(0, 255, 1);
	// gui.addGlobals('useGlobal', 'backAlpha', 'cleanBackground', 'playSim');
	ballsController.add(settingsObject, "useGlobal").listen();
	ballsController.add(settingsObject, "backAlpha", 0, 255);
	ballsController.add(settingsObject, "cleanBackground");
	ballsController.add(settingsObject, "playSim").listen();
	ballsController.add(settingsObject, "effectField", 0, 600).listen();
	ballsController.add(settingsObject, "collide").listen();
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	if (settingsObject.cleanBackground) {
		blendMode(ADD);
		background(255, settingsObject.backAlpha);
		blendMode(BLEND);
	}
	noStroke();
	fill(240);
	ellipse(attractor.x, attractor.y, settingsObject.effectField*2, settingsObject.effectField*2);
	fill(50);
	ellipse(attractor.x, attractor.y, 20, 20);

	for (let i = 0; i < balls.length; i++) {
		if (settingsObject.playSim) {
			balls[i].update();
		}
		balls[i].draw();
	}
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
	if (keyIsPressed && keyCode === CONTROL) {
		balls.push(new Ball(settingsObject.radius, new p5.Vector(mouseX, mouseY), new p5.Vector(0, 0), new p5.Vector(settingsObject.forces_x, settingsObject.forces_y)));
	}
}

function mouseMoved() {
	attractor.x = mouseX;
	attractor.y = mouseY;
}

function keyPressed() {
	console.log(key);
	if (key == 'p') {
		settingsObject.playSim = !settingsObject.playSim;
	} else if(key == 'c') {
		settingsObject.collide = !settingsObject.collide;
	} else if(key == 'g') {
		settingsObject.useGlobal = !settingsObject.useGlobal;
	}
}

function mouseWheel(event) {
	settingsObject.effectField += event.delta;
}
