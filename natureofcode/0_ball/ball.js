class Ball {
	constructor (pos, vel, acc, r) {
		this.pos = pos;
		this.vel = vel;
		this.acc = acc;
		this.r = r;
	}

	draw () {
		// noStroke();
		fill(200);
		stroke(150);
		ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2);
		console.log(Math.round(this.vel.x * 100)/100 + ' ' + Math.round(this.vel.y*100)/100);
	}

	update() {
		this.vel.add(this.acc);
		this.pos.add(this.vel);

		if(this.pos.x + this.r > width) {
			this.vel.mult([-1, 1]);
		}
		if(this.pos.x - this.r < 0) {
			this.vel.mult([-1, 1]);
		}
		if(this.pos.y + this.r > height) {
			this.vel.mult([1, -1]);
		}
		if(this.pos.y - this.r < 0) {
			this.vel.mult([1, -1]);
		}
	}
}
