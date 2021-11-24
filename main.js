const cnv = document.querySelector('canvas');
const ctx = cnv.getContext('2d');

const N = 64;
const SCALE = 400 / N;

const WIDTH = N * SCALE;
const HEIGHT = N * SCALE;

const EPSILON = 0.0001;
// const CONTRAST = 4e14;
const CONTRAST = 3e8;

cnv.width = WIDTH;
cnv.height = HEIGHT;

function v(x, y) {
  return new Vector2D(x, y);
}

function vPolar(distance, angle) {
  return new Vector2D(
    Math.cos(angle) * distance,
    Math.sin(angle) * distance
  );
}

class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  mul(factor) {
    return new Vector2D(
      this.x * factor,
      this.y * factor
    );
  }

  div(factor) {
    return this.mul(1 / factor);
  }

  mag() {
    return Math.sqrt(
      Math.pow(this.x, 2) +
      Math.pow(this.y, 2)
    );
  }

  unit() {
    return this.div(this.mag());
  }

  add(other) {
    return new Vector2D(
      this.x + other.x,
      this.y + other.y
    );
  }

  sub(other) {
    return new Vector2D(
      this.x - other.x,
      this.y - other.y
    );
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  dist(other) {
    return this.sub(other).mag();
  }

  cross(other) {
    return this.x * other.y - this.y * other.x;
  }
}

const center = v(
  N / 2,
  N / 2
);

function F(p) {
  const offset = p.sub(center).unit();

  return v(
    offset.x * p.x,
    offset.y * p.y
  );

  // return v(
  //   Math.sin(p.x / 10),
  //   Math.sin(p.y / 10)
  // );

  // return v(
  //   -offset.y,
  //   offset.x
  // );
}

function line(p1, p2) {
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function getCurl(p, n) {
  const initialVector = F(p);
  let curl = 0;

  for (let i = 0; i < n; i++) {
    // Getting the neighbors in a circle around
    // the initial vector using a polar coordinates
    const angle = Math.PI / n * i;
    const offset = vPolar(EPSILON, angle);

    const neighbor = p.add(offset);
    const newVector = F(neighbor);
    const difference = newVector.sub(initialVector);

    curl += offset.cross(difference);
  }

  return curl / n;
}

function rect(p1, p2) {
  ctx.fillRect(p1.x, p1.y, p2.x, p2.y);
}

let m = 1;

function draw() {
  const rectSize = v(N, N);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const pos = v(x, y);
      const vec = F(pos);
      const curl = getCurl(pos, 10) * CONTRAST;

      const adjustedCurl = (curl + 1) / 2;
      if (curl < m) m = curl;

      ctx.fillStyle = `rgb(${(1 - adjustedCurl) * 255}, ${adjustedCurl * 255}, 0)`;
      rect(pos.mul(SCALE), rectSize.mul(SCALE));

      line(
        pos.mul(SCALE),
        pos.add(vec.unit()).mul(SCALE)
      );
    }
  }
}

draw();
console.log(m)