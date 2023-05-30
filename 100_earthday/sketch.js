let data;
let months;
let curYear;
let curMonth;
let anomaly;
let dx;
let dy;
let pdx;
let pdy;
let prevAnomaly
let zeroRadius = 100;
let oneRadius = 200;


function preload() {
	data = loadTable('giss-data.csv', 'csv', 'header');
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	console.log(data.getRowCount());
	console.log(data.getColumnCount());

	months = data.columns.slice(1, 13);
	curYear = 0;
	curMonth = 0;

	// frameRate(5);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	background(255);

	translate(width / 2, height / 2);
	noFill()
	stroke(240);
	circle(0, 0, 100);
	circle(0, 0, 200);
	circle(0, 0, 300);
	stroke(170);
	circle(0, 0, 400);

	let r = 300;
	for (let i = 0; i < months.length; i++) {
		let angle = map(i, 0, 12, PI * 2, 0) + PI;
		let x = r * sin(angle);
		let y = r * cos(angle);
		fill(40, 220, 30);
		noStroke()
		push();
		translate(x, y);
		rotate(PI - angle);
		text(months[i], 0, 0,);
		pop();
	}

	noFill()
	stroke(0);
	stroke(map(curYear, 0, data.getRowCount(), 220, 40));
	// beginShape();
	let firstValue = true;
	for (let i = 0; i <= curYear; i++) {
		row = data.getRow(i);
		if (row === undefined) break;
		// console.log(row);
		let totalMonths = months.length;
		if (i == curYear) {
			totalMonths = curMonth;
		}
		for (let j = 0; j < totalMonths; j++) {
			anomaly = row.getNum(months[j]);
			r = map(anomaly, 0, 1, zeroRadius, oneRadius);
			if (anomaly !== undefined) { }
			// prevAnomaly = anomaly;
			// anomaly = map(dataR, 0, 1, 0, 50);
			let avg = 0;
			if (!firstValue) {
				prevAnomaly = anomaly;
				pdx = dx;
				pdy = dy;
				avg = (anomaly + prevAnomaly) / 2.;
			}
			dx = r * cos(map(j, 0, 12, PI * 2, 0) + PI);
			dy = r * sin(map(j, 0, 12, PI * 2, 0) + PI);
			// fill(map(i, 0, data.getRowCount(), 220, 40));
			// noStroke();
			// circle(dx, dy, 5);
			let cold = color(0, 0, 255);
			let warm = color(255, 0, 0);
			let zero = color(255, 255, 255);
			if(avg > 0) {
				stroke(lerpColor(zero, warm, avg));
			} else {
				stroke(lerpColor(zero, cold, abs(avg)));
			}
			// strokeB = (map(i, 0, data.getRowCount(), 220, 40));
			// strokeR = (map(dataR, 0, -1, 0, 200));
			// strokeB = (map(dataR, 0, 1, 0, 200));
			// stroke(strokeR, 255, strokeB);
			noFill();
			if (!firstValue)
				line(dx, dy, pdx, pdy);

			firstValue = false;
			// stroke(0)
		}

	}
	// endShape();

	fill(40);
	noStroke();
	textAlign(CENTER, CENTER);
	text(row.get("Year"), 0, 0);



	curMonth++;
	if (curMonth == 12) {
		curMonth = 0;
		curYear++;
		if (curYear == data.getRowCount()) {
			noLoop();
		}
	}
	// ellipse(mouseX, mouseY, 21, 21);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
