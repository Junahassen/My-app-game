const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let score = 0;
let lives = 3;
let running = true;

const player = {w:80,h:12,x:(W-80)/2,y:H-30,speed:6,dx:0};
const stars = [];
let spawnTimer = 0;

function spawnStar(){
  const size = 12 + Math.random()*14;
  stars.push({x:Math.random()*(W-size),y:-size,w:size,h:size,vy:1.2+Math.random()*2});
}

function reset(){ score=0; lives=3; stars.length=0; running=true; }

function update(){
  if(!running) return;
  player.x += player.dx*player.speed;
  player.x = Math.max(0, Math.min(W-player.w, player.x));

  spawnTimer += 1;
  if(spawnTimer > 30){ spawnTimer = 0; spawnStar(); }

  for(let i=stars.length-1;i>=0;i--){
    const s = stars[i];
    s.y += s.vy;
    if(s.y > H){ stars.splice(i,1); lives--; if(lives<=0){ running=false } }
    else if(collide(s, player)){
      stars.splice(i,1); score += Math.round(10 + s.w); 
      if(score%100===0) player.speed += 0.2;
    }
  }
}

function collide(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#0f2540';
  ctx.fillRect(0,0,W,H);

  // player
  ctx.fillStyle = '#ffd66b';
  roundRect(ctx, player.x, player.y, player.w, player.h, 6, true, false);

  // stars
  for(const s of stars){
    const g = ctx.createLinearGradient(s.x,s.y,s.x+s.w,s.y+s.h);
    g.addColorStop(0,'#fff7'); g.addColorStop(1,'#ffd');
    ctx.fillStyle = g;
    roundRect(ctx, s.x, s.y, s.w, s.h, 4, true, false);
  }

  // HUD
  document.getElementById('score').textContent = 'Score: ' + score;
  document.getElementById('lives').textContent = 'Lives: ' + lives;

  if(!running){
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#fff'; ctx.font='28px sans-serif'; ctx.textAlign='center';
    ctx.fillText('Game Over', W/2, H/2 - 10);
    ctx.font='16px sans-serif'; ctx.fillText('Press Restart to play again', W/2, H/2 + 20);
  }
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }

function roundRect(ctx,x,y,w,h,r,fill,stroke){
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}

document.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft' || e.key==='a') player.dx = -1;
  if(e.key==='ArrowRight' || e.key==='d') player.dx = 1;
});
document.addEventListener('keyup', e=>{
  if(e.key==='ArrowLeft' || e.key==='a') player.dx = 0;
  if(e.key==='ArrowRight' || e.key==='d') player.dx = 0;
});

document.getElementById('restart').addEventListener('click', ()=>{ reset(); });

loop();
