// Настройка приложения
// Данная функция будет выполнена первой и только один раз

let balls = [];

var gui;
var radius = 10;
var forces_x = 0.1;
var forces_y = 0.1;
var useGlobal = false;
var cleanBackground = false;

function setup() {
	createCanvas(windowWidth, windowHeight);
	gui = createGui("Настройка шариков");
	sliderRange(5, 50, 1);
	gui.addGlobals('radius');
	sliderRange(-2, 2, 0.1);
	gui.addGlobals('forces_x', 'forces_y');
	gui.addGlobals('useGlobal', 'cleanBackground');
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	if (cleanBackground) {
		blendMode(ADD);
		background(255, 1);
		blendMode(BLEND);
	}
	
	for (let i = 0; i < balls.length; i++) {
		balls[i].update();
		balls[i].draw();
	}	
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
	if (keyIsPressed && keyCode === CONTROL) {
		balls.push(new Ball(radius, new p5.Vector(mouseX, mouseY), new p5.Vector(0, 0), new p5.Vector(forces_x, forces_y)));
	}
}
