let view =  {
	center : new p5.Vector(0, 0),
	pCenter : new p5.Vector(0, 0),
	currentScale : 1,
	isDragging: false,
}

function s2w(pt) {
	let wPt = pt.copy();
	wPt.sub(view.center);
	wPt.mult(1/view.currentScale);
	return wPt;
}

function preload() {
	myFont = loadFont('./assets/Roboto-Regular.ttf');
}

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup () {
	createCanvas(windowWidth, windowHeight, WEBGL);
	ortho();
	view.center.set(width/2, height/2);
	view.pCenter.set(view.center);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw () {
	background(100);

	fill(50);
	noStroke();
	translate(-width/2, -height/2);

	push();
	{
		if (view.isDragging) {
			let diff = new p5.Vector(mouseX, mouseY).sub(view.pCenter);
			translate(diff.x, diff.y);
		}
		translate(view.center.x, view.center.y);
		scale(view.currentScale, view.currentScale, 1);

		ellipse(0, 0, 10, 10);
		stroke(255);
		line(-200, 0, 200, 0);
		line(0, -200, 0, 200);
	}
	pop();

	fill(200);
	let wpt = s2w(createVector(mouseX, mouseY));
	textFont(myFont);
	textSize(14);
	text(`(${round(wpt.x, 1)}; ${round(wpt.y, 1)})`, mouseX, mouseY);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight, WEBGL);
}

function mousePressed() {
	if (mouseButton === CENTER) {
		view.isDragging = true;
		view.pCenter.set(mouseX, mouseY);
	}

}

function mouseReleased() {
	if (mouseButton === CENTER) {
		view.isDragging = false;
		let diff = new p5.Vector(mouseX, mouseY).sub(view.pCenter);
		view.center.add(diff);
		view.pCenter.set(view.center);
	}
}

function mouseWheel(event) {
	if (event.delta < 0) {
		let diff = new p5.Vector(mouseX, mouseY).sub(view.center);
		diff.mult(0.5);
		view.center.add(diff);
		console.log('up');
	}
	else {
		let diff = new p5.Vector(mouseX, mouseY).sub(view.center);
		view.center.sub(diff);
		console.log('down');
	}
	view.currentScale *= event.delta > 0 ? 2 : 0.5;
}

