// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup () {
	createCanvas(windowWidth, windowHeight);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw () {
	background(100);
	ellipse(mouseX, mouseY, 21, 21);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
