// Boot → Login
//setTimeout(() => {
// document.getElementById('boot').style.display='none';
// document.getElementById('login').style.display='flex';
//},2500);

setTimeout(()=>{
 document.getElementById('boot').style.display='none';
 document.getElementById('lockScreen').style.display='flex';
},2500);



const LOCK_PASSWORD = "1234"; // ← رمز عبور دلخواه

const lockScreen = document.getElementById('lockScreen');
const passwordBox = document.getElementById('passwordBox');
const lockError = document.getElementById('lockError');

let startY = 0;

// Swipe detection
lockScreen.addEventListener('touchstart', e=>{
 startY = e.touches[0].clientY;
});

lockScreen.addEventListener('touchend', e=>{
 const endY = e.changedTouches[0].clientY;
 if(startY - endY > 80){
  showPassword();
 }
});

// Desktop swipe (برای لپتاپ)
lockScreen.addEventListener('mousedown', e=>{
 startY = e.clientY;
});
lockScreen.addEventListener('mouseup', e=>{
 if(startY - e.clientY > 80){
  showPassword();
 }
});

function showPassword(){
 document.getElementById('lockHint').textContent = "Enter Password";
 passwordBox.classList.remove('hidden');
}

function unlock(){
 const val = document.getElementById('lockPass').value;
 if(val === LOCK_PASSWORD){
  lockScreen.style.opacity = 0;
  setTimeout(()=>{
   lockScreen.style.display = 'none';
   document.getElementById('login').style.display='flex';
  },500);
 }else{
  lockError.textContent = "❌Wrong Password";
 }
}


// Login
function login(){
 const u = document.getElementById('username').value.trim();
 if(!u) return alert('Enter a username');
 localStorage.setItem('q_user', u);
 document.getElementById('login').style.display='none';
 alert(`👤 Wellcome ${u}`);
}

function lockSystem(){
 document.getElementById('login').style.display='none';
 showLock();
}


// Modal helpers
const modal = document.getElementById('modal');
const content = document.getElementById('content');
function openM(html){ content.innerHTML=html; modal.style.display='flex'; }
function closeM(){ modal.style.display='none'; }




let snakeM, foodM, dirM, scoreM, snakeTimer;

function openSnakeMobile(){
 openM(`
 <h3 style="color:var(--neon-green)">🐍 Snake Mobile</h3>

 <canvas id="snakeM" width="280" height="280"
  style="background:black;border-radius:16px;touch-action:none"></canvas>

 <p id="scoreM">Score: 0</p>

 <div style="display:grid;grid-template-columns:repeat(3,60px);
  gap:8px;justify-content:center;margin-top:12px">
  <div></div>
  <button class="btn" onclick="setDir(0,-10)">⬆️</button>
  <div></div>
  <button class="btn" onclick="setDir(-10,0)">⬅️</button>
  <button class="btn" onclick="setDir(10,0)">➡️</button>
  <div></div>
  <button class="btn" onclick="setDir(0,10)">⬇️</button>
  <div></div>
 </div>
 `);

 const canvas=document.getElementById('snakeM');
 const ctx=canvas.getContext('2d');

 snakeM=[{x:140,y:140}];
 foodM=randomFood();
 dirM={x:20,y:0};
 scoreM=0;

 let startX,startY;
 canvas.addEventListener('touchstart',e=>{
  const t=e.touches[0];
  startX=t.clientX; startY=t.clientY;
 });

 canvas.addEventListener('touchend',e=>{
  const t=e.changedTouches[0];
  const dx=t.clientX-startX;
  const dy=t.clientY-startY;
  if(Math.abs(dx)>Math.abs(dy)){
   setDir(dx>0?10:-10,0);
  }else{
   setDir(0,dy>0?10:-10);
  }
 });

 clearInterval(snakeTimer);
 snakeTimer=setInterval(()=>snakeLoop(ctx,canvas),140);
}

function setDir(x,y){
 if(dirM.x===-x && dirM.y===-y) return;
 dirM={x,y};
}

function snakeLoop(ctx,c){
 const head={x:snakeM[0].x+dirM.x,y:snakeM[0].y+dirM.y};
 if(head.x<0||head.y<0||head.x>=c.width||head.y>=c.height){
  return endSnakeMobile();
 }

 snakeM.unshift(head);

 if(head.x===foodM.x && head.y===foodM.y){
  scoreM++;
  playBeep();
  foodM=randomFood();
 }else snakeM.pop();

 ctx.clearRect(0,0,c.width,c.height);

 ctx.fillStyle='#00fff0';
 snakeM.forEach(s=>ctx.fillRect(s.x,s.y,10,10));

 ctx.fillStyle='#ff2bdc';
 ctx.fillRect(foodM.x,foodM.y,10,10);

 document.getElementById('scoreM').textContent=`Score: ${scoreM}`;
}

function randomFood(){
 return {
  x:Math.floor(Math.random()*28)*10,
  y:Math.floor(Math.random()*28)*10
 };
}

function endSnakeMobile(){
 clearInterval(snakeTimer);
 saveScore('Snake',scoreM);
 playLose();
 alert('💀 Game Over | Score: '+scoreM);
}



function saveScore(game,score){
 const user=localStorage.getItem('q_user')||'Guest';
 const all=JSON.parse(localStorage.getItem('scores')||'[]');
 all.push({user,game,score,time:Date.now()});
 localStorage.setItem('scores',JSON.stringify(all));
}

function openLeaderboard(){
 const all=JSON.parse(localStorage.getItem('scores')||'[]');

 openM(`
 <h3 style="color:var(--neon-cyan)">🏆 Leaderboard</h3>
 ${['Snake','TicTacToe','Guess','Reaction'].map(g=>{
  const top=all.filter(s=>s.game===g)
  .sort((a,b)=>b.score-a.score).slice(0,3);
  return `
   <h4>${g}</h4>
   <ul>${top.map(s=>`
    <li>${s.user} — ${s.score}</li>
   `).join('')}</ul>`;
 }).join('')}
 `);
}






function playBeep(){
 const ctx=new AudioContext();
 const o=ctx.createOscillator();
 const g=ctx.createGain();
 o.connect(g);
 g.connect(ctx.destination);
 o.type='sine';
 o.frequency.value=700;
 g.gain.value=0.08;
 o.start();
 o.stop(ctx.currentTime+0.1);
}




let clickScore=0, clickTime=5, clickTimer;

function openClickGame(){
 clickScore=0;
 clickTime=5;

 openM(`
 <h3 style="color:var(--neon-cyan)">👆 Click Speed Challenge</h3>
 <p>!</p>
 <h1 id="clickCount">0</h1>
 <button class="btn"
  style="font-size:1.4rem;margin:20px auto"
  onclick="clickHit()">Click</button>
 <p id="clickTime">Time: 5</p>
 `);

 clickTimer=setInterval(()=>{
  clickTime--;
  document.getElementById('clickTime').textContent=
   'Time: '+clickTime;
  if(clickTime<=0) endClickGame();
 },1000);
}

function clickHit(){
 if(clickTime<=0) return;
 clickScore++;
 playBeep();
 document.getElementById('clickCount').textContent=clickScore;
}

function endClickGame(){
 clearInterval(clickTimer);
 saveScore('Click',clickScore);
 //playWin();
 alert('⏱ End your score:'+clickScore);
}


function openRPS(){
 openM(`
 <h3 style="color:var(--neon-cyan)">🪨✂️ Rock Paper Scissors</h3>
 <p>Choose</p>
 <div style="display:flex;gap:10px;margin:12px 0">
  ${['🪨','📄','✂️'].map(i=>`
   <button class="btn" onclick="playRPS('${i}')">${i}</button>
  `).join('')}
 </div>
 <div id="rpsResult" style="margin-top:12px;font-size:1.1rem"></div>
 `);
}

function playRPS(user){
 const map={'🪨':'✂️','📄':'🪨','✂️':'📄'};
 const ai=['🪨','📄','✂️'][Math.floor(Math.random()*3)];
 let res='';
 if(user===ai) res='😐 Draw';
 else if(map[user]===ai) res='🎉 won!';
 else res='🤖 lost';
 document.getElementById('rpsResult').innerHTML=
 `تو: ${user} | AI: ${ai}<br><b>${res}</b>`;
}




let reactionTime, reactionStart;

function openReaction(){
 openM(`
 <h3 style="color:var(--neon-green)">🚨Reaction Speed Test</h3>
 <div id="reactionBox"
  style="margin:20px auto;width:200px;height:200px;
  background:#222;border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer">
  wait...
 </div>
 <p id="reactionResult"></p>
 `);

 setTimeout(()=>{
  const box=document.getElementById('reactionBox');
  box.style.background='var(--neon-green)';
  box.textContent='Click';
  reactionStart=Date.now();
  box.onclick=()=>{
   reactionTime=Date.now()-reactionStart;
   document.getElementById('reactionResult')
   .textContent=`⏱ Reaction Speed: ${reactionTime} ms`;
  };
 },Math.random()*3000+2000);
}





let memFirst=null, memLock=false;

function openMemory(){
 const icons=['⚛','🚀','💎','👾','⚛','🚀','💎','👾']
 .sort(()=>Math.random()-0.5);

 openM(`
 <h3 style="color:var(--neon-pink)">🧠 Memory Game</h3>
 <div id="mem"
  style="display:grid;grid-template-columns:repeat(4,1fr);
  gap:10px;margin-top:12px">
  ${icons.map(i=>`
   <div class="neon-card mem"
    style="height:60px;display:flex;
    align-items:center;justify-content:center;
    font-size:1.5rem;color:transparent"
    onclick="flipMem(this,'${i}')">${i}</div>
  `).join('')}
 </div>
 `);
}

function flipMem(el,val){
 if(memLock || el.classList.contains('open')) return;
 el.style.color='white';
 el.classList.add('open');

 if(!memFirst){
  memFirst={el,val};
 }else{
  memLock=true;
  if(memFirst.val===val){
   memFirst=null;
   memLock=false;
  }else{
   setTimeout(()=>{
    el.style.color='transparent';
    memFirst.el.style.color='transparent';
    el.classList.remove('open');
    memFirst.el.classList.remove('open');
    memFirst=null;
    memLock=false;
   },800);
  }
 }
}












// Tic Tac Toe
let tttBoard, tttGameOver;
function openTicTacToe(){
 tttBoard=Array(9).fill(null); tttGameOver=false;
 openM(`<h3 style="color:var(--neon-cyan)">Tic Tac Toe — vs AI</h3><p id="tttStatus"> Its your turn (X)</p><div class="ttt-board" id="tttboard"></div><button class="btn" onclick="openTicTacToe()">Restart</button>`);
 renderTTT();
}
function renderTTT(){
 const board=document.getElementById('tttboard'); board.innerHTML='';
 tttBoard.forEach((v,i)=>{
  const c=document.createElement('div'); c.className='ttt-cell neon-card'; c.textContent=v||''; c.onclick=()=>playerMove(i); board.appendChild(c);
 });
}
function playerMove(i){ if(tttBoard[i]||tttGameOver) return; tttBoard[i]='X'; updateTTT(); if(!tttGameOver) setTimeout(aiMove,400);}
function aiMove(){ const move=findBestMove(); if(move!==null) tttBoard[move]='O'; updateTTT();}
function updateTTT(){
 renderTTT();
 const win=checkTTTWinner();
 if(win){ tttGameOver=true; document.getElementById('tttStatus').textContent = win==='draw'?'draw':(win==='X'?'You won':'AI won'); }
 else{document.getElementById('tttStatus').textContent='';}
}
function checkTTTWinner(){ const l=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for(const [a,b,c] of l){ if(tttBoard[a] && tttBoard[a]===tttBoard[b] && tttBoard[a]===tttBoard[c]) return tttBoard[a]; } return tttBoard.every(Boolean)?'draw':null;}
function findBestMove(){for(let i=0;i<9;i++){if(!tttBoard[i]){tttBoard[i]='O';if(checkTTTWinner()==='O'){tttBoard[i]=null; return i;}tttBoard[i]=null;}}for(let i=0;i<9;i++){if(!tttBoard[i]){tttBoard[i]='X';if(checkTTTWinner()==='X'){tttBoard[i]=null;return i;}tttBoard[i]=null;}}const free=tttBoard.map((v,i)=>v?null:i).filter(v=>v!==null);return free[Math.floor(Math.random()*free.length)]??null;}

// Sudoku
const sudokuPuzzle=[
 [5,3,0,0,7,0,0,0,0],
 [6,0,0,1,9,5,0,0,0],
 [0,9,8,0,0,0,0,6,0],
 [8,0,0,0,6,0,0,0,3],
 [4,0,0,8,0,3,0,0,1],
 [7,0,0,0,2,0,0,0,6],
 [0,6,0,0,0,0,2,8,0],
 [0,0,0,4,1,9,0,0,5],
 [0,0,0,0,8,0,0,7,9]
];
let sudokuBoard=[];
function openSudoku(){
 sudokuBoard=JSON.parse(JSON.stringify(sudokuPuzzle));
 openM(`<h3 style="color:var(--neon-green)">Sudoku</h3><div class="sudoku-board" id="sudokuboard"></div><button class="btn" onclick="checkSudoku()">Check solve</button><button class="btn" onclick="openSudoku()">New puzzle</button>`);
 renderSudoku();
}
function renderSudoku(){
 const board=document.getElementById('sudokuboard'); board.innerHTML='';
 sudokuBoard.forEach((row,y)=>{
  row.forEach((val,x)=>{
   const div=document.createElement('div'); div.className='sudoku-cell'+(sudokuPuzzle[y][x]?' fixed':'');
   if(val) div.textContent=val;
   else{ const input=document.createElement('input'); input.type='text'; input.maxLength=1; input.oninput=(e)=>{const n=parseInt(e.target.value); sudokuBoard[y][x]=isNaN(n)?0:n;}; div.appendChild(input);}
   board.appendChild(div);
  });
 });
}
function checkSudoku(){
 for(let y=0;y<9;y++){for(let x=0;x<9;x++){const v=sudokuBoard[y][x]; if(v===0) return alert('❌ Table is not complet'); if(!isValidSudoku(y,x,v)) return alert(`❌ خطا در سطر ${y+1} ستون ${x+1}`);}}
 alert('✅  You won');
}
function isValidSudoku(r,c,val){ for(let i=0;i<9;i++){if(i!==c && sudokuBoard[r][i]===val) return false; if(i!==r && sudokuBoard[i][c]===val) return false;} const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3; for(let y=br;y<br+3;y++) for(let x=bc;x<bc+3;x++) if((y!==r||x!==c)&&sudokuBoard[y][x]===val) return false; return true; }

// Number Guess
let secretNumber=0, attempts=0;
function openNumberGuess(){
 secretNumber=Math.floor(Math.random()*100)+1; attempts=0;
 openM(`<h3 style="color:var(--neon-purple)">Guess Game</h3><p style="margin:16px 0">من یک عدد بین <b>1 تا 100</b> انتخاب کردم. حدس بزن!</p><div style="display:flex;gap:8px"><input id="guessInput" type="number" min="1" max="100" placeholder="حدست چیه؟" /><button class="btn" onclick="checkGuess()">حدس بزن</button></div><div id="guessResult" style="margin-top:16px;font-size:1.1rem;height:120px;overflow:auto"></div><button class="btn" style="margin-top:12px" onclick="openNumberGuess()">بازی جدید</button>`);
}
function checkGuess(){
 const input=document.getElementById('guessInput'), result=document.getElementById('guessResult'), guess=parseInt(input.value);
 if(isNaN(guess)||guess<1||guess>100){result.innerHTML+=`<div style="color:var(--neon-red)">⚠️ لطفاً عددی بین 1 تا 100 وارد کن!</div>`; return;}
 attempts++; let message='', color='';
 if(guess<secretNumber){message=`📈 بالاتر! (حدس ${attempts})`; color='var(--neon-cyan)';}
 else if(guess>secretNumber){message=`📉 پایین‌تر! (حدس ${attempts})`; color='var(--neon-pink)';}
 else{message=`🎉 آفرین! درست حدس زدی: <b>${secretNumber}</b> در ${attempts} حدس!`; color='var(--neon-green)';}
 result.innerHTML+=`<div style="color:${color};margin:8px 0">${message}</div>`; result.scrollTop=result.scrollHeight; input.value=''; input.focus();
}



function openM(html){ content.innerHTML = html; modal.style.display='flex'; }
function closeM(){ modal.style.display='none'; }

// هوش مصنوعی واقعی با Puter.js
function openAI(){
 openM(`
 <h3 style="color:var(--neon-cyan)">Quantum AI (واقعی و قدرتمند)</h3>
 <div id="chat"></div>
 <div style="display:flex;gap:8px;margin-top:8px">
  <input id="msg" placeholder="سوال خود را بپرسید..." />
  <button class="btn" onclick="sendPuterAI()">ارسال</button>
 </div>
 <p style="font-size:0.8rem;color:#aaa;margin-top:8px">متصل به مدل‌های GPT-5 / GPT-4o / Claude / Grok — کاملاً رایگان و بدون کلید</p>
 `);
 document.getElementById('chat').innerHTML = ''; // پاک کردن چت قبلی
}

async function sendPuterAI(){
 const msgInput = document.getElementById('msg');
 const chat = document.getElementById('chat');
 if(!msgInput.value.trim()) return;

 const userMsg = msgInput.value.trim();
 chat.innerHTML += `<div class="bubble-user">🧑 ${userMsg}</div>`;
 const thinking = document.createElement('div');
 thinking.className='bubble-ai';
 thinking.textContent='🤖 در حال فکر کردن...';
 chat.appendChild(thinking);
 chat.scrollTop=chat.scrollHeight;
 msgInput.value='';

 try{
  const res = await puter.ai.chat(userMsg,{
   model:'grok-2',
   temperature:0.7
  });
  thinking.textContent = '🤖 ' + (res?.text || res || 'پاسخی دریافت نشد');
 }catch(e){
  thinking.textContent = '❌ خطا در اتصال به هوش مصنوعی';
 }
}

function openFinance(){
 openM(`
 <h3 style="color:var(--neon-green)">Quantum Finance</h3>
 <canvas id="chart" height="220"></canvas>
 <p style="color:#aaa;font-size:.8rem">نمودار زنده شبیه‌سازی‌شده</p>
 `);
 const ctx=document.getElementById('chart').getContext('2d');
 let data=Array.from({length:60},()=>100+Math.random()*10);
 function draw(){
  ctx.clearRect(0,0,chart.width,chart.height);
  ctx.strokeStyle='#00fff0';
  ctx.lineWidth=2;
  ctx.beginPath();
  data.forEach((v,i)=>{
   const x=i*(chart.width/60);
   const y=chart.height-(v-80)*2;
   i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.stroke();
  data.push(data[data.length-1]+(Math.random()-.45)*4);
  data.shift();
  requestAnimationFrame(draw);
 }
 draw();
}

let expr='';
const scr = document.createElement('div'); // برای ماشین حساب
function openCalc(){
 openM(`
 <h3 style="color:var(--neon-pink)">Calculator</h3>
 <div id="scr" style="background:black;color:white;padding:12px;border-radius:10px;font-size:1.2rem">0</div>
 <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px">
  ${['7','8','9','/','4','5','6','*','1','2','3','-','0','.','C','+']
    .map(b=>`<button class="btn" onclick="press('${b}')">${b}</button>`).join('')}
  <button class="btn" style="grid-column:1/5" onclick="calc()">=</button>
 </div>`);
}
function press(v){
 if(v==='C'){expr='';document.getElementById('scr').textContent='0';return;}
 expr+=v; document.getElementById('scr').textContent=expr||'0';
}
function calc(){
 try{expr=String(eval(expr));document.getElementById('scr').textContent=expr;}
 catch{document.getElementById('scr').textContent='Err';expr='';}
}



function browser(){
 openM(`
 <h3 style="color:var(--neon-cyan)">Quantum Browser 🌐</h3>

 <div style="display:flex;gap:6px;margin-bottom:8px">
  <input id="qurl" placeholder="جستجو یا وارد کردن آدرس..."
   style="flex:1"
   onkeydown="if(event.key==='Enter') loadPage()">
  <button class="btn" onclick="loadPage()">🔍</button>
 </div>

 <div style="display:flex;gap:6px;margin-bottom:8px">
  <button class="btn" onclick="goBack()">◀</button>
  <button class="btn" onclick="goForward()">▶</button>
  <button class="btn" onclick="reloadPage()">⟳</button>
 </div>

 <iframe id="browserFrame"
  style="width:100%;height:360px;border-radius:14px;background:black"
  src="https://duckduckgo.com"></iframe>

 <p style="font-size:.75rem;color:#aaa;margin-top:6px">
  🔐 مرور امن با DuckDuckGo — برخی سایت‌ها به‌دلیل سیاست امنیتی اجازه iframe نمی‌دهند
 </p>
 `);
}



function music(){ openM(`<input type="file" accept="audio/*" onchange="p(this)"><audio id="audio" controls></audio>`); window.p=i=>audio.src=URL.createObjectURL(i.files[0]); }
function phone(){ openM(`<input placeholder="شماره"><button class="btn" onclick="alert('در حال تماس...')">تماس</button>`); }
function files(){ openM(`<input type="file" multiple onchange="for(let f of this.files){list.innerHTML+= '<li>'+f.name+'</li>'}"><ul id="list"></ul>`); }
function settings(){
 openM(`
 <label>رنگ تم</label>
 <input type="color" onchange="document.documentElement.style.setProperty('--neon-cyan',this.value)">
 <label>اندازه فونت</label>
 <input type="range" min="10" max="22" value="16" onchange="document.body.style.fontSize=this.value+'px'">
 <label>گردی آیکون‌ها</label>
 <input type="range" min="4" max="40" value="20" onchange="document.documentElement.style.setProperty('--radius',this.value+'px')">
 `)
}
function about(){ openM(`<h3 class="neon-text">POWERED BY SALEH AMOO</h3>`); }
function about2(){ openM(`<h2 class="neon-text">Developed By SA||Saleh Amoo</h2>`); }
function openSystem(){ openM(`<h3 style="color:var(--neon-cyan)">Quantum System</h3><ul><li>AI: Real GPT-5 / Claude / Grok</li><li>Games: 3 Active</li></ul>`); }




function shutdownSystem(){
 document.body.innerHTML=`<div style="background:black;color:#ff3b3b;height:100vh;display:flex;align-items:center;justify-content:center;font-size:1.5rem;text-shadow:0 0 30px #ff3b3b;">System is shutting down...</div>`;
}



