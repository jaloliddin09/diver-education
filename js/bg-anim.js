// ============================================================
// BG-ANIM — 4 ta animatsiya uslubi
// ============================================================
(function () {
  var canvas, ctx, W, H, animId, tick = 0, running = false;
  var CENTER_X, CENTER_Y;
  var particles = [], lines = [], questionMarks = [], cityBuildings = [];
  var matrixCols = [], starField = [];
  var COLORS = ['#7c3aed','#6366f1','#a855f7','#4f46e5','#818cf8','#06b6d4'];

  function getStyle() {
    var c = document.getElementById('bg-canvas');
    return c ? parseInt(c.dataset.style || '1') : 1;
  }
  function hasBg() {
    var b = document.getElementById('bg-img');
    return b && !!b.style.backgroundImage;
  }
  function overlay() {
    // Fon bilan uyg'un: 40% shaffof qoramtir
    if(hasBg()){
      ctx.fillStyle='rgba(4,1,18,0.40)';
    } else {
      var bg=ctx.createRadialGradient(CENTER_X,CENTER_Y,0,CENTER_X,H*0.6,Math.max(W,H)*0.85);
      bg.addColorStop(0,'#1a083a'); bg.addColorStop(0.4,'#0f0528');
      bg.addColorStop(0.8,'#080018'); bg.addColorStop(1,'#030010');
      ctx.fillStyle=bg;
    }
    ctx.fillRect(0,0,W,H);
  }

  function init() {
    canvas=document.getElementById('bg-canvas');
    if(!canvas) return;
    ctx=canvas.getContext('2d');
    resize(); buildAll();
    if(!running){ running=true; loop(); }
    window.addEventListener('resize',function(){ resize(); buildAll(); });
  }
  function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; CENTER_X=W*0.5; CENTER_Y=H*0.32; }

  function buildAll(){
    buildWave(); buildParticles(); buildCity(); buildMatrix(); buildStars();
    questionMarks=[];
    [{x:W*0.28,y:H*0.42},{x:W*0.68,y:H*0.38},{x:W*0.78,y:H*0.52}].forEach(function(q,i){
      questionMarks.push({x:q.x,y:q.y,baseY:q.y,phase:i*1.5,speed:0.008+Math.random()*0.005,alpha:0.25+Math.random()*0.2,size:18+Math.random()*14,color:i%2===0?'#f59e0b':'#a855f7'});
    });
  }

  // ── Style 1: To'lqin + Neyron chiziqlar ──────────────────
  function buildWave(){
    lines=[];
    for(var l=0;l<22;l++){
      var angle=(l/22)*Math.PI*2;
      lines.push({angle:angle,cp1x:CENTER_X+Math.cos(angle-0.4)*W*0.25,cp1y:CENTER_Y+Math.sin(angle-0.4)*H*0.3,cp2x:CENTER_X+Math.cos(angle+0.4)*W*0.45,cp2y:CENTER_Y+Math.sin(angle+0.4)*H*0.45,ex:CENTER_X+Math.cos(angle)*W*0.9,ey:CENTER_Y+Math.sin(angle)*H*0.9,color:COLORS[l%COLORS.length],alpha:0.12+Math.random()*0.14,width:0.6+Math.random()*1.0,phase:Math.random()*Math.PI*2,speed:0.003+Math.random()*0.004});
    }
  }
  function buildParticles(){
    particles=[];
    for(var p=0;p<70;p++){
      var li=lines[Math.floor(Math.random()*lines.length)];
      particles.push({line:li,t:Math.random(),speed:0.0015+Math.random()*0.003,r:1.2+Math.random()*2.2,color:li.color,alpha:0.5+Math.random()*0.5,glow:Math.random()>0.5});
    }
  }
  function bezPt(li,t){
    var m=1-t;
    return{x:m*m*m*CENTER_X+3*m*m*t*li.cp1x+3*m*t*t*li.cp2x+t*t*t*li.ex,y:m*m*m*CENTER_Y+3*m*m*t*li.cp1y+3*m*t*t*li.cp2y+t*t*t*li.ey};
  }

  // ── Style 2: Zarrachalar ──────────────────────────────────
  var floatParticles=[];
  function buildParticleField(){
    floatParticles=[];
    for(var i=0;i<120;i++){
      floatParticles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,r:0.8+Math.random()*2.5,color:COLORS[Math.floor(Math.random()*COLORS.length)],alpha:0.3+Math.random()*0.7,pulse:Math.random()*Math.PI*2});
    }
  }

  // ── Style 3: Shahar + Horizon ────────────────────────────
  function buildCity(){
    cityBuildings=[];
    var bc=Math.floor(W/14);
    for(var i=0;i<bc;i++) cityBuildings.push({x:(i/bc)*W,w:8+Math.random()*12,h:25+Math.random()*110,windows:[]});
    cityBuildings.forEach(function(b){
      for(var w=0;w<4;w++) for(var fl=0;fl<6;fl++) if(Math.random()>0.4) b.windows.push({ox:3+w*5,oy:fl*14+6,on:Math.random()>0.3});
    });
  }

  // ── Style 4: Matrix ──────────────────────────────────────
  function buildMatrix(){
    var cols=Math.floor(W/16);
    matrixCols=[];
    for(var i=0;i<cols;i++) matrixCols.push({x:i*16,y:Math.random()*H,speed:3+Math.random()*6,chars:[],len:6+Math.floor(Math.random()*14)});
    matrixCols.forEach(function(col){
      for(var j=0;j<col.len;j++) col.chars.push(String.fromCharCode(0x30A0+Math.floor(Math.random()*96)));
    });
  }

  // ── Stars (shared) ────────────────────────────────────────
  function buildStars(){
    starField=[];
    for(var i=0;i<80;i++) starField.push({x:Math.random()*W,y:Math.random()*H*0.7,r:0.5+Math.random()*1.5,alpha:0.2+Math.random()*0.6,phase:Math.random()*Math.PI*2});
  }
  function drawStars(){
    starField.forEach(function(s){
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+(s.alpha*(0.6+0.4*Math.sin(tick*0.5+s.phase)))+')';
      ctx.fill();
    });
  }

  function hexA(hex,a){
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a.toFixed(3)+')';
  }

  function loop(){ animId=requestAnimationFrame(loop); tick+=0.016; draw(); }

  function draw(){
    ctx.clearRect(0,0,W,H);
    var style=getStyle();
    overlay();
    drawStars();

    if(style===1) drawWave();
    else if(style===2) drawZarrachalar();
    else if(style===3) drawShahar();
    else if(style===4) drawMatrix();

    // Floating ? (barcha uslublarda)
    if(style!==4){
      questionMarks.forEach(function(q){
        q.y=q.baseY+Math.sin(tick*q.speed*60+q.phase)*10;
        ctx.font='bold '+q.size+'px Georgia,serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle=hexA(q.color,q.alpha*(0.7+0.3*Math.sin(tick+q.phase)));
        ctx.fillText('?',q.x,q.y);
      });
    }
  }

  // Style 1 — To'lqin
  function drawWave(){
    lines.forEach(function(li){
      var pulse=0.5+0.5*Math.sin(tick*li.speed*60+li.phase);
      ctx.beginPath(); ctx.moveTo(CENTER_X,CENTER_Y);
      ctx.bezierCurveTo(li.cp1x,li.cp1y,li.cp2x,li.cp2y,li.ex,li.ey);
      ctx.strokeStyle=hexA(li.color,li.alpha*(0.7+0.3*pulse));
      ctx.lineWidth=li.width; ctx.stroke();
    });
    particles.forEach(function(p){
      p.t+=p.speed; if(p.t>1) p.t=0;
      var pt=bezPt(p.line,p.t);
      if(p.glow){
        var g=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,p.r*3);
        g.addColorStop(0,hexA(p.color,p.alpha)); g.addColorStop(1,hexA(p.color,0));
        ctx.beginPath(); ctx.arc(pt.x,pt.y,p.r*3,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(pt.x,pt.y,p.r,0,Math.PI*2);
      ctx.fillStyle=hexA(p.color,p.alpha); ctx.fill();
    });
    // Brain glow
    var bp=0.8+0.2*Math.sin(tick*1.2);
    var bg2=ctx.createRadialGradient(CENTER_X,CENTER_Y,0,CENTER_X,CENTER_Y,80*bp);
    bg2.addColorStop(0,'rgba(255,255,255,0.18)'); bg2.addColorStop(0.2,'rgba(168,85,247,0.22)');
    bg2.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(CENTER_X,CENTER_Y,80*bp,0,Math.PI*2); ctx.fillStyle=bg2; ctx.fill();
  }

  // Style 2 — Zarrachalar
  function drawZarrachalar(){
    if(!floatParticles.length) buildParticleField();
    floatParticles.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.pulse+=0.02;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      var a=p.alpha*(0.6+0.4*Math.sin(p.pulse));
      // Glow
      var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0,hexA(p.color,a*0.8)); g.addColorStop(1,hexA(p.color,0));
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=hexA(p.color,a); ctx.fill();
    });
    // Yaqin zarrachalarni ulash
    for(var i=0;i<floatParticles.length;i+=2){
      for(var j=i+1;j<floatParticles.length;j+=3){
        var dx=floatParticles[i].x-floatParticles[j].x, dy=floatParticles[i].y-floatParticles[j].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<100){
          ctx.beginPath(); ctx.moveTo(floatParticles[i].x,floatParticles[i].y);
          ctx.lineTo(floatParticles[j].x,floatParticles[j].y);
          ctx.strokeStyle='rgba(139,92,246,'+(0.12*(1-dist/100)).toFixed(3)+')';
          ctx.lineWidth=0.5; ctx.stroke();
        }
      }
    }
  }

  // Style 3 — Shahar
  function drawShahar(){
    // Uzoq shahar (siluet)
    ctx.fillStyle='rgba(20,10,50,0.7)';
    cityBuildings.forEach(function(b){ ctx.fillRect(b.x,H-b.h*0.6,b.w*0.8,b.h*0.6); });
    // Yaqin shahar
    cityBuildings.forEach(function(b){
      var grad=ctx.createLinearGradient(b.x,H-b.h,b.x,H);
      grad.addColorStop(0,'rgba(30,15,70,0.9)'); grad.addColorStop(1,'rgba(10,5,30,0.95)');
      ctx.fillStyle=grad;
      ctx.fillRect(b.x,H-b.h,b.w,b.h);
      // Derazalar
      b.windows.forEach(function(w){
        if(w.on){
          var flicker=Math.random()>0.998;
          ctx.fillStyle=flicker?'rgba(255,100,50,0.9)':'rgba(255,220,100,'+(0.4+Math.random()*0.3)+')';
          ctx.fillRect(b.x+w.ox,H-b.h+w.oy,3,4);
        }
      });
    });
    // Horizon glow
    var hz=ctx.createLinearGradient(0,H-120,0,H-60);
    hz.addColorStop(0,'rgba(99,102,241,0)'); hz.addColorStop(0.5,'rgba(139,92,246,0.15)'); hz.addColorStop(1,'rgba(99,102,241,0)');
    ctx.fillStyle=hz; ctx.fillRect(0,H-120,W,60);
    // Havoda suzuvchi chiziqlar
    lines.forEach(function(li){
      ctx.beginPath(); ctx.moveTo(CENTER_X,CENTER_Y);
      ctx.bezierCurveTo(li.cp1x,li.cp1y,li.cp2x,li.cp2y,li.ex,li.ey);
      ctx.strokeStyle=hexA(li.color,0.06+0.04*Math.sin(tick*li.speed*30+li.phase));
      ctx.lineWidth=0.8; ctx.stroke();
    });
  }

  // Style 4 — Matrix
  function drawMatrix(){
    ctx.font='13px monospace';
    matrixCols.forEach(function(col){
      col.y+=col.speed;
      if(col.y>H+col.len*16){ col.y=-col.len*16; col.speed=3+Math.random()*6; }
      for(var i=0;i<col.chars.length;i++){
        var fy=col.y+i*16;
        if(fy<0||fy>H) continue;
        var bright=i===col.chars.length-1;
        ctx.fillStyle=bright?'rgba(200,255,200,0.95)':'rgba(0,200,80,'+(0.05+0.6*(1-i/col.chars.length)).toFixed(2)+')';
        // Tasodifiy harf almashtirish
        if(Math.random()>0.97) col.chars[i]=String.fromCharCode(0x30A0+Math.floor(Math.random()*96));
        ctx.fillText(col.chars[i],col.x,fy);
      }
    });
    // Binafsha overlay chiziqlar
    for(var c=0;c<12;c++){
      ctx.fillStyle='rgba(139,92,246,'+(0.03+0.02*Math.sin(tick*2+c)).toFixed(3)+')';
      ctx.fillRect(0,c*(H/12),W,1);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();

  // Tashqaridan chaqirish uchun — applySettings dan foydalaniladi
  window.bgAnimRestart = function() {
    var c = document.getElementById('bg-canvas');
    if (!c) return;
    if (c.style.display === 'none') return;
    buildAll();
  };
})();
