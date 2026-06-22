const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let score = 0;
let lives = 3;
let running = true;
let highScore = 0;

// load high score from localStorage
try{ const hs = localStorage.getItem('cts_highscore'); if(hs) highScore = parseInt(hs,10)||0; }catch(e){}

const player = {w:80,h:12,x:(W-80)/2,y:H-30,speed:6,dx:0};
const stars = [];
let spawnTimer = 0;

function spawnStar(){
  const size = 12 + Math.random()*14;
  stars.push({x:Math.random()*(W-size),y:-size,w:size,h:size,vy:1.2+Math.random()*2});
}

function reset(){ score=0; lives=3; stars.length=0; running=true; updateHighScoreDisplay(); }

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
      maybeSaveHighScore();
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
  document.getElementById('highscore').textContent = 'High: ' + highScore;

  if(!running){
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#fff'; ctx.font='28px sans-serif'; ctx.textAlign='center';
    ctx.fillText('Game Over', W/2, H/2 - 18);
    ctx.font='18px sans-serif'; ctx.fillText('Score: ' + score, W/2, H/2 + 4);
    ctx.font='14px sans-serif'; ctx.fillText('High: ' + highScore, W/2, H/2 + 26);
    ctx.font='12px sans-serif'; ctx.fillText('Press Restart to play again', W/2, H/2 + 46);
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

// High score helpers
function maybeSaveHighScore(){
  if(score > highScore){
    highScore = score;
    try{ localStorage.setItem('cts_highscore', String(highScore)); }catch(e){}
    updateHighScoreDisplay();
  }
}
function updateHighScoreDisplay(){
  const el = document.getElementById('highscore'); if(el) el.textContent = 'High: ' + highScore;
}

// Touch / Pointer controls: drag on canvas to move, and virtual buttons for left/right
const canvasEl = canvas;
let dragging = false;
canvasEl.addEventListener('pointerdown', e=>{
  dragging = true; canvasEl.setPointerCapture(e.pointerId);
  const rect = canvasEl.getBoundingClientRect();
  player.x = Math.max(0, Math.min(W-player.w, e.clientX - rect.left - player.w/2));
});
canvasEl.addEventListener('pointermove', e=>{
  if(!dragging) return;
  const rect = canvasEl.getBoundingClientRect();
  player.x = Math.max(0, Math.min(W-player.w, e.clientX - rect.left - player.w/2));
});
canvasEl.addEventListener('pointerup', e=>{ dragging = false; try{ canvasEl.releasePointerCapture(e.pointerId);}catch(e){} });

// Virtual left/right buttons
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
function startLeft(){ player.dx = -1; }
function startRight(){ player.dx = 1; }
function stopLR(){ player.dx = 0; }
if(leftBtn && rightBtn){
  leftBtn.addEventListener('pointerdown', e=>{ e.preventDefault(); startLeft(); leftBtn.setPointerCapture(e.pointerId); });
  leftBtn.addEventListener('pointerup', e=>{ stopLR(); try{ leftBtn.releasePointerCapture(e.pointerId);}catch(e){} });
  leftBtn.addEventListener('pointercancel', stopLR);
  rightBtn.addEventListener('pointerdown', e=>{ e.preventDefault(); startRight(); rightBtn.setPointerCapture(e.pointerId); });
  rightBtn.addEventListener('pointerup', e=>{ stopLR(); try{ rightBtn.releasePointerCapture(e.pointerId);}catch(e){} });
  rightBtn.addEventListener('pointercancel', stopLR);
}
