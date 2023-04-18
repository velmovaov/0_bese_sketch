// Настройка приложения
// Данная функция будет выполнена первой и только один раз

let balls = [];
let attractor;

var gui;
var radius = 10;
var forces_x = 0.1;
var forces_y = 0.1;
var useGlobal = false;
var cleanBackground = true;
var backAlpha = 50;
var playSim = false;

function setup() {
	createCanvas(windowWidth, windowHeight);
	attractor = new p5.Vector(width / 2, height / 2);
	gui = createGui("Настройка шариков");
	sliderRange(5, 50, 1);
	gui.addGlobals('radius');
	sliderRange(-2, 2, 0.1);
	gui.addGlobals('forces_x', 'forces_y');
	sliderRange(0, 255, 1);
	gui.addGlobals('useGlobal', 'backAlpha', 'cleanBackground', 'playSim');
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	if (cleanBackground) {
		blendMode(ADD);
		background(255, backAlpha);
		blendMode(BLEND);
	}
	noStroke();
	fill(240);
	ellipse(attractor.x, attractor.y, 600, 600);
	fill(50);
	ellipse(attractor.x, attractor.y, 20, 20);

	for (let i = 0; i < balls.length; i++) {
		if (playSim) {
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
		balls.push(new Ball(radius, new p5.Vector(mouseX, mouseY), new p5.Vector(0, 0), new p5.Vector(forces_x, forces_y)));
	}
}

function mouseMoved() {
	attractor.x = mouseX;
	attractor.y = mouseY;
}

function keyPressed() {
	console.log(key);
	if (key == 'p') {
		playSim = !playSim;
		// setValue('playSim');
	}
}
