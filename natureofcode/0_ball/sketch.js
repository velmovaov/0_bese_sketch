// Настройка приложения
// Данная функция будет выполнена первой и только один раз

let ball = new Ball(new p5.Vector(100, 100), new p5.Vector(0, 0), new p5.Vector(0.1, 0.1), 20);

function setup () {
	createCanvas(windowWidth, windowHeight);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw () {
	blendMode(ADD);
	background(255, 1);
	blendMode(BLEND);

	ball.update();

	ball.draw();
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
