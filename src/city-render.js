// Presentation-only shared city: no role, player, skill or persistence data.
// Successful images/decodes survive redraws and new games in this document.
const CITY_ART=Object.freeze({night:'assets/scenes/city-night-v1.webp',day:'assets/scenes/city-day-v1.webp'});
const cityArtwork=new Map();
function cityArtKey(phase){return phase==='night'||phase==='eclipse'?'night':'day'}
function prepareGraphicCity(phase){
 const key=cityArtKey(phase),prior=cityArtwork.get(key);
 if(prior)return prior.ready;
 if(typeof Image==='undefined')return Promise.resolve(null);
 const image=new Image(),entry={image,loaded:false,ready:null};
 entry.ready=new Promise(resolve=>{
  const fail=()=>{image.onload=image.onerror=null;if(cityArtwork.get(key)===entry)cityArtwork.delete(key);resolve(null)};
  image.onerror=fail;
  image.onload=async()=>{
   try{if(image.decode)await image.decode();if(!image.naturalWidth||!image.naturalHeight){fail();return}entry.loaded=true;image.onload=image.onerror=null;resolve(image)}catch{fail()}
  };
 });
 cityArtwork.set(key,entry);image.decoding='async';image.src=CITY_ART[key];return entry.ready;
}
function drawGraphicCity(ctx,w,h,phase){
 if(w<=0||h<=0)return;
 const key=cityArtKey(phase),image=cityArtwork.get(key)?.loaded?cityArtwork.get(key).image:null;
 ctx.save();ctx.clearRect(0,0,w,h);
 // Network/decode failure leaves a quiet, usable scene; controls never wait.
 ctx.fillStyle=key==='night'?'#15232e':'#7e8d91';ctx.fillRect(0,0,w,h);
 if(image){
  // Cover without distortion; the shared framing preserves sky and landmarks.
  const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight),iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;
  ctx.drawImage(image,(w-iw)/2,(h-ih)*.22,iw,ih);
 }
 const veil=ctx.createLinearGradient(0,0,0,h);
 veil.addColorStop(0,key==='night'?'#08131d25':'#15232d28');
 veil.addColorStop(.5,key==='night'?'#08131d12':'#15232d18');
 veil.addColorStop(1,'#0c172375');ctx.fillStyle=veil;ctx.fillRect(0,0,w,h);
 if(phase==='eclipse'){ctx.fillStyle='#42233538';ctx.fillRect(0,0,w,h)}
 ctx.restore();
}
