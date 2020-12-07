var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');
const log = document.getElementById('log');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.addEventListener('mousedown', function (event) {
  if (event.detail > 1) {
    event.preventDefault();
    // of course, you still do not know what you prevent here...
    // You could also check event.ctrlKey/event.shiftKey/event.altKey
    // to not prevent something useful.
  }
}, false);

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
class Vector2d {
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }
  getRotateRad(cx, cy, x, y, radian) {
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const nx = (cos * (x - cx)) + (sin * (y - cy));
    const ny = (cos * (y - cy)) - (sin * (x - cx));
    return { x: nx, y: ny };
  }  
  rotateRad(cx, cy, x, y, radian) {
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    this.x = (cos * (x - cx)) + (sin * (y - cy));
    this.y = (cos * (y - cy)) - (sin * (x - cx));
  }
  add (x, y) {
    this.x += x;
    this.y += y;
  }
  sub (x, y) {
    this.x -= x;
    this.y -= y;
  }
  mul (x, y) {
    this.x *= x;
    this.y *= y;
  }
}
class Ball {
  constructor(x, y, vecX, vecY, speed, scale) {
    this.x = x;
    this.y = y;
    this.defX = x;
    this.defY = y;
    this.vec = new Vector2d(vecX, vecY);
    this.forceVec = new Vector2d(0, 0);
    this.speed = speed;
    this.scale = scale;
    this.life = Math.random() * 500 + 500;
    this.mass = scale;
    this.color = `rgb(${Math.random() * 100 + 155}, ${Math.random() * 150 + 40}, ${Math.random() * 150 + 40})`;
    this.eye = new Eye(this);
  }
  setHit(val, hitObj, distance) {
    this.isHit = true;
    this.isHitObj = hitObj;
    this.hitdistance = distance;
  }
  draw(context) {
    context.beginPath(); //パス作成
    //描写cmd　start
    context.arc(this.x, this.y, this.scale, 0, 2 * Math.PI, true);
    context.fillStyle = this.color; //線の色指定
    context.fill(); //線を描写
    
    // vector表示
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.vec.x * 5, this.y + this.vec.y * 5);
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.stroke();
    context.closePath();
    this.eye.draw(context);
  }
  update() {
    this.beforeX = this.x;
    this.beforeY = this.y;
    if(this.isHit && this.isHitObj){
      let rad = Math.atan2(this.isHitObj.y - this.y, this.isHitObj.x - this.x);
      
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      // 衝突の重なり部分解消
      this.x += (this.hitdistance / 2) * cos;
      this.y += (this.hitdistance / 2) * sin;
      this.isHitObj.x -= (this.hitdistance / 2) * cos;
      this.isHitObj.y -= (this.hitdistance / 2) * sin;
      
      // 反射角出し参考
      // https://thinkit.co.jp/article/8466
      
      // 円同士の接点
      const cx = cos * this.scale + this.x;
      const cy = sin * this.scale + this.y;
      
      // 180度回転後の座標
      const rx = Math.cos(rad + Math.PI) * this.scale + this.x;
      const ry = Math.sin(rad + Math.PI) * this.scale + this.y;
      
      // 次の移動地点　反射後の地点
      const gx = rx + this.vec.x;
      const gy = ry + this.vec.y;
      
      this.vec.x = (gx - cx) / this.scale;
      this.vec.y = (gy - cy) / this.scale;
      
      this.setHit(false, null);
    }
    this.x += this.speed * (this.vec.x + this.forceVec.x);
    this.y += this.speed * (this.vec.y + this.forceVec.y);
    // 上にめり込んだら
    if (this.y - this.scale <= 0) {
      this.y = this.scale;
      this.vec.y *= -1;
      this.forceVec.y *= -1;
    }
    // 下にめり込んだら
    if (this.y + this.scale > canvas.height) {
      //this.y -= this.vec.y * this.speed;
      this.y = canvas.height - this.scale;
      this.vec.y *= -1;
      this.forceVec.y *= -1;
    }
    // 左にめり込んだ時
    if (this.x - this.scale <= 0) {
      //this.x -= this.vec.x * this.speed;
      this.x = this.scale;
      this.vec.x *= -1;
      this.forceVec.x *= -1;
    }
    // 右にめり込んだら
    if (this.x + this.scale > canvas.width) {
      //this.x -= this.vec.x * this.speed;
      this.x = canvas.width - this.scale;
      this.vec.x *= -1;
      this.forceVec.x *= -1;
    }
    this.vec.y += gravity;
    this.forceVec.mul(0.9, 0.9);
  }
}

class Eye {
  constructor (ball){
    this.ball = ball;
    this.eyeX = Math.random() * 7 + 5;
    this.eyeY = Math.random() * 4 + 5;
    this.eyeWhiteScale = Math.random() * 8 + 5;
    this.eyeBlackScale = Math.random() * 3 + 2;
    this.isBlink = false;
    this.blink();
  }
  blink() {
    setTimeout(() => {
      this.isBlink = !this.isBlink;
      this.blink();
      setTimeout(()=>{
        this.isBlink = false;
      }, 100)
    }, Math.random() * 2000 + 300);
  }
  draw(context) {
    // context.scale(1, 0.2);
    context.beginPath(); //パス作成
    //描写cmd　start
    if(!this.isBlink) {
      context.arc(this.ball.x + this.eyeX, this.ball.y - this.eyeY, this.eyeWhiteScale, 0, Math.PI * 2, true);
      context.arc(this.ball.x - this.eyeX, this.ball.y - this.eyeY, this.eyeWhiteScale, 0, Math.PI * 2, true);
      context.fillStyle = '#fff'; //線の色指定
      context.fill(); //線を描写
      context.closePath();
      context.beginPath(); //パス作成
      context.arc(this.ball.x + this.eyeX, this.ball.y - this.eyeY, this.eyeBlackScale, 0, Math.PI * 2, true);
      context.arc(this.ball.x - this.eyeX, this.ball.y - this.eyeY, this.eyeBlackScale, 0, Math.PI * 2, true);
      context.fillStyle = '#000'; //線の色指定
      context.fill(); //線を描写
    }
  }
}

let len = 20;
let ballList = [];
const space = canvas.width / len;
let posX = 0;
let posY = space;
const friction = 0.8;
const gravity = 0.1;

function addBall (posX, posY) {
  const radian = Math.random() * Math.PI * 2;
  const vx = Math.sin(radian);
  const vy = Math.cos(radian);
  ballList.push(new Ball(posX, posY, vx, vy, 1, 20 + Math.random() * 15));
}
for (let i = 0; i < len; i++) {
  posX += space;
  if (posX >= canvas.width) {
    posY += space;
    posX = space;
  }
  addBall(posX, posY);
}

canvas.addEventListener('click', (e) => {
  for (let i = 0; i < ballList.length; i++) {
    ballList[i].forceVec.add(Math.random() * 10 - 5, Math.random() * -12);
  }
  addBall(e.offsetX, e.offsetY);
});
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < ballList.length; i++) {
    const ball = ballList[i];
    // 衝突判定
    for (let i2 = 0; i2 < ballList.length; i2++) {
      const ball2 = ballList[i2];
      if (i != i2) {
        const dis = distance(ball.x, ball.y, ball2.x, ball2.y) - (ball.scale + ball2.scale);
        if(dis < 0) {
          // hit
          ball.setHit(true, ball2, dis);
        }
      }
    }
    ball.update();
    ball.draw(context);
  }
  requestAnimationFrame(render);

}

render();


