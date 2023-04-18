class Ball {
	constructor(r, pos, vel, acc) {
		this.pos = pos;
		this.vel = vel;
		this.acc = acc;
		this.r = r;
		this.friction = 0.99;
		this.bounce_friction = 0.8;
	}

	draw() {
		fill(200, 10);
		stroke(100, 100);
		ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);

		let f = this.acc.copy();
		// f.normalize();
		// f.mult(this.acc.mag());
		f.mult(200);
		f.add(this.pos);
		stroke(230, 0, 0, 100);
		line(this.pos.x, this.pos.y, f.x, f.y);

		let d = this.vel.copy();
		// d.normalize();
		// d.mult(this.vel.mag());
		d.mult(10);
		d.add(this.pos);
		stroke(0, 0, 230, 100);
		line(this.pos.x, this.pos.y, d.x, d.y);
		// console.log(Math.round(this.vel.x * 100)/100 + ' ' + Math.round(this.vel.y*100)/100);
	}

	update() {
		if (useGlobal) {
			this.acc.x = forces_x;
			this.acc.y = forces_y;
		}

		this.vel.add(this.acc);
		this.vel.mult(this.friction);
		this.pos.add(this.vel);

		if (this.pos.x + this.r > width) {
			this.pos.x = width - this.r;
			this.vel.mult([-1, 1]);
			this.vel.mult(this.bounce_friction);
		}
		if (this.pos.x + this.r < 0) {
			this.pos.x = this.r;
			this.vel.mult([-1, 1]);
			this.vel.mult(this.bounce_friction);
		}
		if (this.pos.y + this.r > height) {
			this.pos.y = height - this.r;
			this.vel.mult([1, -1]);
			this.vel.mult(this.bounce_friction);
		}
		if (this.pos.y + this.r < 0) {
			this.pos.y = this.r;
			this.vel.mult([1, -1]);
			this.vel.mult(this.bounce_friction);
		}
	}
}
