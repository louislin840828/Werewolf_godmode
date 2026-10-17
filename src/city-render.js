// Quiet, shared illustrated city. No player/role data: markers never own a house.
// Replace this painter with approved city artwork without touching the engine.
function drawGraphicCity(ctx,w,h,phase){
 const night=phase==='night'||phase==='eclipse';
 const p=night?{sky:'#12202c',paper:'#1c303b',roof:'#172730',wall:'#30434b',line:'#0c1820',river:'#314c57',light:'#bfa977'}:{sky:'#89999e',paper:'#6b7d80',roof:'#344953',wall:'#88958e',line:'#293c44',river:'#839fa8',light:'#dfcfaa'};
 const sx=w/600,sy=h/440;
 ctx.save();ctx.scale(sx,sy);ctx.fillStyle=p.sky;ctx.fillRect(0,0,600,440);
 // Aurora is restrained scenery, never an interactive glow or endless animation.
 if(night){const aurora=ctx.createLinearGradient(0,0,600,170);aurora.addColorStop(0,'#507e8130');aurora.addColorStop(.5,phase==='eclipse'?'#9b4c6038':'#7f929330');aurora.addColorStop(1,'#26455200');ctx.fillStyle=aurora;ctx.beginPath();ctx.moveTo(0,38);ctx.bezierCurveTo(150,120,260,-20,600,60);ctx.lineTo(600,132);ctx.bezierCurveTo(290,18,130,182,0,91);ctx.fill();for(let i=0;i<22;i++){ctx.strokeStyle='#879e9e12';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(i*31,4);ctx.lineTo(i*31-16,105+(i%4)*17);ctx.stroke();}}
 // One continuous district, river and streets, viewed from above at a shallow angle.
 ctx.fillStyle=p.paper;ctx.beginPath();ctx.moveTo(0,108);ctx.lineTo(96,68);ctx.lineTo(225,104);ctx.lineTo(370,63);ctx.lineTo(600,103);ctx.lineTo(600,440);ctx.lineTo(0,440);ctx.fill();
 ctx.strokeStyle=p.river;ctx.lineWidth=44;ctx.beginPath();ctx.moveTo(366,80);ctx.bezierCurveTo(280,180,392,254,264,440);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle=p.line;ctx.stroke();
 const polygon=(points,fill)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=p.line;ctx.lineWidth=1.7;ctx.stroke();};
 // Deterministic dry-brush marks; no randomness that flickers between turns.
 for(let row=0;row<7;row++)for(let col=0;col<10;col++){
  const x=col*66-20+(row%2)*23,y=120+row*48+(col%3)*7;
  const riverX=335-(y-160)*.16;if(Math.abs(x-riverX)<37)continue;
  const bw=30+(col*7+row*3)%18,bh=19+(row+col)%13;
  polygon([[x,y],[x+bw,y-4],[x+bw+2,y+bh],[x-2,y+bh+4]],p.wall);
  polygon([[x-5,y],[x+bw/2,y-20-(col%3)*5],[x+bw+6,y-4],[x+bw+2,y+6],[x+bw/2,y-10],[x-4,y+9]],p.roof);
  ctx.strokeStyle=p.line;ctx.lineWidth=.8;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x+4+k*6,y-2);ctx.lineTo(x+8+k*6,y+bh-3);ctx.stroke();}
  if((row+col)%3===0){ctx.fillStyle=p.light;ctx.globalAlpha=night?.6:.25;ctx.fillRect(x+bw-9,y+8,3,5);ctx.globalAlpha=1;}
 }
 // Civic tower / bridge are landmarks, not seat addresses.
 polygon([[442,98],[454,46],[467,99]],p.roof);polygon([[446,98],[464,96],[465,157],[445,159]],p.wall);
 polygon([[272,241],[363,221],[368,235],[278,255]],p.wall);
 ctx.strokeStyle=p.line;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(280,247);ctx.lineTo(360,227);ctx.stroke();
 for(let i=0;i<110;i++){const x=(i*83)%600,y=105+(i*47)%335;ctx.strokeStyle=night?'#adc0bd0b':'#e2e3cb12';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4+(i%3),y+2);ctx.stroke();}
 // Flatten the scene under text/lines. City remains present but secondary.
 ctx.fillStyle=night?'#07121d45':'#182a3338';ctx.fillRect(0,0,600,440);ctx.restore();
}
