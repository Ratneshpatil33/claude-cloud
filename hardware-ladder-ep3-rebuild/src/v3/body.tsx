import React,{useMemo} from 'react';
import {Img,staticFile} from 'remotion';
import * as THREE from 'three';
import {type Cam,type V3,project} from './studio';
import {ROW,add} from './world';
import {Chip,GREEN,WeightStream,WeightBlock} from './xray';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {useTex} from './assets';

const RED='#C8423A',INK='#23272E',ACCENT='#247D64';
export const ramp=(t:number,a:number,b:number)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const ease=(x:number)=>x*x*(3-2*x);
const on=(t:number,a:number,b:number,d=.3)=>ease(ramp(t,a,a+d))*(1-ease(ramp(t,b,b+.25)));
const mix=(a:number,b:number,k:number)=>a+(b-a)*k;
const mix3=(a:V3,b:V3,k:number):V3=>[mix(a[0],b[0],k),mix(a[1],b[1],k),mix(a[2],b[2],k)];
const orbit=(at:V3,dist:number,pitch:number,yaw:number,shift:number):Cam=>({at,pos:[at[0]+dist*Math.sin(yaw)*Math.cos(pitch),at[1]+dist*Math.sin(pitch),at[2]+dist*Math.cos(yaw)*Math.cos(pitch)],fov:44,shift});
const MEM=orbit([.67,.145,-.015],.91,.52,-.13,230);
const WORK=orbit([.69,.16,-.015],.95,.40,-.12,230);
const LIMIT=orbit([.70,.24,-.015],1.35,.42,-.11,240);
const NEXT=orbit([1.08,.12,-.06],.80,.38,-.28,220);
const WIDE=orbit([.94,.43,-.43],3.20,.25,-.75,280);
export const bodyCamera=(t:number,start:Cam):Cam=>{
 let cur=start;
 for(const [a,b,dest] of [[11.58,13.0,MEM],[16.48,17.28,WORK],[33.32,34.6,LIMIT],[38.32,39.15,NEXT],[40.46,41.35,WIDE]] as Array<[number,number,Cam]>){
  if(t<=a)break;
  const k=ease(ramp(t,a,b));
  if(t<b){cur={at:mix3(cur.at,dest.at,k),pos:mix3(cur.pos,dest.pos,k),fov:mix(cur.fov,dest.fov,k),shift:mix(cur.shift??0,dest.shift??0,k)};break;}
  cur=dest;
 }
 const push=1+.30*ease(ramp(t,10,11.45))*(1-ease(ramp(t,38.10,38.65)));
 // A 30% larger subject, with optical recentering to retain the adjacent memory meter.
 const offset:V3=[-.028*ease(ramp(t,11.58,13)),0,0];
 return {...cur,at:add(cur.at,offset),pos:add(mix3(cur.at,cur.pos,1/push),offset),shift:(cur.shift??0)-40*ease(ramp(t,11.58,13))*(1-ease(ramp(t,38.10,38.65)))};
};
export const xrayAt=(t:number)=>.64*on(t,11.58,16.35,.45);
export const useBodyMedia=()=>({flux:useTex('media/flux-example.jpg')});

// Bounded texture: update one canvas each frame; never allocate a per-frame texture cache.
export const useFluxScreen=(image:THREE.Texture|null,t:number)=>{
 const {cv,texture}=useMemo(()=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=750;const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=true;return{cv,texture};},[]);
 const g=cv.getContext('2d')!;g.fillStyle='#111821';g.fillRect(0,0,1200,750);
 if(image){
  const k=ease(ramp(t,27.38,29.5));
  g.globalAlpha=k;g.drawImage(image.image as HTMLImageElement,900,755,1650,1125,150,50,900,610);g.globalAlpha=1;
  // Deterministic noise tiles dissipate to reveal a credited example, not a measured generation demo.
  for(let y=0;y<610;y+=18)for(let x=0;x<900;x+=18){const n=(Math.sin(x*12.9898+y*78.233+Math.floor(t*25)*.31)*43758.5453)%1;g.fillStyle=`rgba(${Math.floor(Math.abs(n)*220)},${Math.floor(Math.abs(n)*170)},${Math.floor(Math.abs(n)*240)},${1-k})`;g.fillRect(x+150,y+50,18,18);}
  g.fillStyle='#e4eaf0';g.font='23px Helvetica';g.fillText('FLUX.1 [dev] · model-card example · illustrative reveal',95,712);
 }
 texture.needsUpdate=true;return texture;
};

const TANK:V3=[.83,0,.005];
const HEIGHT=.32,WIDTH=.095,DEPTH=.095;
const outline=new THREE.EdgesGeometry(new THREE.BoxGeometry(WIDTH,HEIGHT,DEPTH));
const Tank:React.FC<{t:number}>=({t})=>{
 const k=on(t,13.34,38.30,.65),os=ease(ramp(t,15.04,15.65))*11/32;
 const coder=17.2/32*ease(ramp(t,17.28,18.5))*(1-ease(ramp(t,26.34,27.0)));
 const flux=.40*ease(ramp(t,27.38,28.0))*(1-ease(ramp(t,33.32,34.0)));
 const over=ease(ramp(t,37.42,37.70)),f=Math.max(coder,flux,over*(21/32));
 if(k<.001)return null;
 return <group position={add(TANK,[0,-.035*(1-k),0])}>
  <mesh position={[0,HEIGHT/2,0]}><boxGeometry args={[WIDTH,HEIGHT,DEPTH]}/><meshPhysicalMaterial color="#f5faf9" roughness={.22} metalness={.12} transparent opacity={.07*k} depthWrite={false}/></mesh>
  <lineSegments geometry={outline} position={[0,HEIGHT/2,0]}><lineBasicMaterial color={over>.2?RED:'#80938d'} transparent opacity={.58*k}/></lineSegments>
  <mesh position={[0,.004,0]}><boxGeometry args={[WIDTH+.012,.008,DEPTH+.012]}/><meshStandardMaterial color="#7b8587" metalness={.72} roughness={.32} transparent opacity={k}/></mesh>
  <mesh visible={os>.001} position={[0,HEIGHT*os/2+.004,0]} scale={[1,Math.max(.001,os),1]}><boxGeometry args={[WIDTH*.94,HEIGHT-.008,DEPTH*.94]}/><meshStandardMaterial color="#aeb6ba" roughness={.55} metalness={.14} transparent opacity={.92*k}/></mesh>
  <mesh visible={f>.001} position={[0,HEIGHT*os+HEIGHT*f/2,0]} scale={[1,Math.max(.001,f),1]}><boxGeometry args={[WIDTH*.91,HEIGHT,DEPTH*.91]}/><meshStandardMaterial color={over>.2?RED:flux>.02?'#796b9c':ACCENT} roughness={.4} metalness={.18} transparent opacity={.92*k}/></mesh>
  {[0,8,16,24,32].map(v=><mesh key={v} position={[WIDTH/2+.007,HEIGHT*v/32,DEPTH/2]}><boxGeometry args={[v===32?.018:.01,.001,.001]}/><meshBasicMaterial color="#596762" transparent opacity={k}/></mesh>)}
 </group>;
};

// A single, physical model cartridge replaces the floating matrix and particle effects.
const ModelCartridge:React.FC<{t:number}>=({t})=>{
 const k=on(t,35.08,38.27,.3),hit=ease(ramp(t,37.42,37.6));
 const texture=useMemo(()=>{
  const cv=document.createElement('canvas');cv.width=900;cv.height=1050;
  const g=cv.getContext('2d')!;g.fillStyle='#263330';g.fillRect(0,0,900,1050);
  g.strokeStyle='#64756e';g.lineWidth=3;g.strokeRect(45,45,810,960);
  g.fillStyle='#b7c9c0';g.font='30px Helvetica';g.fillText('MODEL WEIGHTS / Q4_K_M',90,135);
  g.fillStyle='#f1f5f3';g.font='600 160px Helvetica';g.fillText('70B',80,470);
  g.font='70px Helvetica';g.fillText('42.5 GB',85,595);
  g.fillStyle='#b7c9c0';g.font='36px Helvetica';g.fillText('LLAMA 3.3',90,910);
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;return tex;
 },[]);
 const geometry=useMemo(()=>new RoundedBoxGeometry(.15,.20,.12,3,.006),[]);
 if(k<.001)return null;
 const y=mix(.515,.423,ease(ramp(t,35.08,37.42)))-.004*Math.sin(ramp(t,37.42,37.7)*Math.PI);
 return <group position={add(TANK,[0,y,0])}>
  <mesh geometry={geometry}><meshStandardMaterial color={hit>.5?RED:'#34453e'} metalness={.48} roughness={.36} transparent opacity={k}/></mesh>
  <mesh position={[0,0,.061]}><planeGeometry args={[.135,.178]}/><meshBasicMaterial map={texture} color={hit>.5?'#efbbb4':'#fff'} transparent opacity={k}/></mesh>
 </group>;
};

const PrivateBoundary:React.FC<{t:number}>=({t})=>{
 const k=on(t,24.52,33.32,.6);
 const ring=useMemo(()=>new THREE.BufferGeometry().setFromPoints(Array.from({length:129},(_,i)=>new THREE.Vector3(Math.cos(i/128*Math.PI*2)*.23,0,Math.sin(i/128*Math.PI*2)*.20))),[]);
 const arc=useMemo(()=>new THREE.BufferGeometry().setFromPoints(Array.from({length:97},(_,i)=>new THREE.Vector3(Math.cos(i/96*Math.PI)*.23,Math.sin(i/96*Math.PI)*.245,-.06))),[]);
 if(k<.001)return null;
 return <group position={add(ROW.mac,[0,.003,.005])}>
  <lineLoop geometry={ring}><lineBasicMaterial color={ACCENT} transparent opacity={.62*k}/></lineLoop>
  <lineLoop geometry={arc}><lineBasicMaterial color="#607c70" transparent opacity={.3*k}/></lineLoop>
 </group>;
};
export const BodyWorld:React.FC<{t:number}>=({t})=>{
 const x=xrayAt(t);
 return <>
  {x>.001&&<group position={ROW.mac}>
   <Chip p={[0,.013,-.018]} s={[.048,.007,.048]} label="M5" glow={x*.22}/>
   <Chip p={[-.057,.015,-.015]} s={[.027,.004,.048]} label="RAM" glow={x*.22}/>
   <Chip p={[.057,.015,-.015]} s={[.027,.004,.048]} label="RAM" glow={x*.22}/>
  </group>}
  <Tank t={t}/><PrivateBoundary t={t}/><ModelCartridge t={t}/>
 </>;
};

const font='Helvetica Neue, Arial, sans-serif';
const Plate:React.FC<{k:number;top?:number;title:string;subtitle?:string;accent?:string}>=({k,top=175,title,subtitle,accent=INK})=>k>.001?<div style={{position:'absolute',left:80,top,width:920,opacity:k,fontFamily:font,color:accent}}><div style={{fontSize:top===1645?44:62,fontWeight:650,letterSpacing:-2,lineHeight:1.05}}>{title}</div>{subtitle&&<div style={{fontSize:27,color:'#657078',marginTop:15,lineHeight:1.4}}>{subtitle}</div>}</div>:null;

// Images are authentic source crops, positioned with CSS (no synthesized evidence text).
const Proof:React.FC<{k:number;src:string;credit:string;crop:[number,number,number,number];original:[number,number];height?:number;width?:number}>=({k,src,credit,crop,original,height=245,width=920})=>{
 if(k<.001)return null;
 const [x,y,w,h]=crop,scale=width/w;
 return <div style={{position:'absolute',left:80,top:125,width,opacity:k,transform:`translateY(${(1-k)*18}px)`,fontFamily:font}}>
  <div style={{fontSize:21,color:'#647078',letterSpacing:1,marginBottom:12}}>{credit}</div>
  <div style={{width,height,overflow:'hidden',position:'relative',borderRadius:7,border:'1px solid #d5dadf',background:'#fff',boxShadow:'0 7px 22px -16px #25332d'}}><Img src={staticFile(src)} style={{position:'absolute',maxWidth:'none',width:original[0]*scale,height:original[1]*scale,left:-x*scale,top:-y*scale}}/></div>
 </div>;
};
const Lock:React.FC=()=> <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 10V7a5 5 0 0110 0v3M5 10h14v11H5z"/></svg>;

export const BodyOverlay:React.FC<{t:number;cam:Cam}>=({t,cam})=>{
 const q=project(cam,1080,1920,add(TANK,[0,.32,0]));
 const base=project(cam,1080,1920,TANK);
 const tank=on(t,15.04,38.25,.35);
 const code=on(t,21.96,26.10,.25),fixed=t>=23.58;
 return <>
  <Plate k={on(t,11.58,16.48,.35)} title={t<15.04?'Unified memory':'32 GB'} subtitle={t<13.34?'The model has to fit.':t<15.04?'One shared pool for CPU and GPU.':'≈ 21 GB default GPU budget for AI'}/>
  {tank>.01&&<div style={{position:'absolute',left:t>=35.08?910:Math.min(875,Math.max(680,q.x+40)),top:Math.max(480,q.y+(t>=35.08?35:-12)),opacity:tank,fontFamily:font,color:INK}}>
   <div style={{fontSize:30,fontWeight:650}}>32 GB</div>
   <div style={{fontSize:18,color:'#737e86',marginTop:8,maxWidth:120}}>total memory</div>
  </div>}
  {tank>.01&&<div style={{position:'absolute',left:540,top:1250,width:460,opacity:tank,fontFamily:font,color:INK}}>
   <div style={{fontSize:20,letterSpacing:2,color:'#76818a'}}>MEMORY BUDGET</div>
   <div style={{fontSize:36,fontWeight:600,marginTop:10,color:t>=37.42?RED:ACCENT}}>≈ 21 GB for AI</div>
   <div style={{fontSize:22,lineHeight:1.5,marginTop:12}}>≈ 11 GB outside the<br/>default GPU budget</div>
   <div style={{fontSize:19,color:'#7c848c',lineHeight:1.4,marginTop:10}}>macOS + apps share memory.<br/>Default limit is adjustable.</div>
   {t>=17.28&&t<26.34&&<div style={{fontSize:30,fontWeight:650,color:ACCENT,marginTop:18}}>Qwen: ≈ 17 GB ✓</div>}
   {t>=27.38&&t<33.32&&<div style={{fontSize:25,fontWeight:600,color:'#796b9c',marginTop:18}}>FLUX · one model at a time</div>}
   {t>=35.08&&<div style={{fontSize:30,fontWeight:650,color:RED,marginTop:18}}>Llama: ≈ 42.5 GB ×</div>}
  </div>}
  <Proof k={on(t,17.28,20.65,.32)} src="media/qwen-files.jpg" credit="HUGGING FACE · MLX COMMUNITY · 4-BIT WEIGHTS" crop={[16,90,710,225]} original={[1265,712]} height={292}/>
  {t>=18.62&&t<20.8&&<div style={{position:'absolute',left:80,top:470,fontFamily:font,fontSize:28,color:INK,opacity:on(t,18.62,20.65)}}>30 B parameters · 3 B active at a time</div>}
  <Proof k={on(t,20.94,21.75,.18)} src="media/lmstudio-qwen3coder.png" credit="LM STUDIO · QWEN3 CODER · RUNS OFFLINE" crop={[325,180,1890,360]} original={[2520,1725]} height={195}/>
  {code>.01&&<div style={{position:'absolute',left:80,top:175,width:920,opacity:code,fontFamily:font}}>
   <div style={{fontSize:21,letterSpacing:2,color:'#657078',marginBottom:15}}>WRITES · EXPLAINS · FIXES / ILLUSTRATION</div>
   <div style={{padding:'28px 34px',borderRadius:8,background:'#111c24',color:'#b8efd5',fontFamily:'Menlo, monospace',fontSize:30,lineHeight:1.6}}>
    <div>{'def safe_divide(a, b):'.slice(0,Math.floor(ramp(t,21.96,22.35)*22))}</div>
    <div style={{color:fixed?'#a6dbc4':'#d98a82'}}>{fixed?'    return a / b if b else None':'    return a / b'}</div>
   </div>
   {t>=22.8&&<div style={{marginTop:13,fontSize:26,color:fixed?ACCENT:INK,opacity:ramp(t,22.8,23.0)}}>{fixed?'✓ Handles division by zero':'“This divides a by b — but b could be zero.”'}</div>}
  </div>}
  <Plate k={on(t,24.52,26.08,.3)} top={1645} title="Nothing leaves the laptop." subtitle="Local model · private code" accent={ACCENT}/>
  <Plate k={on(t,26.34,28.15,.25)} title="FLUX.1 [dev]" subtitle="Black Forest Labs · image generation"/>
  <Proof k={on(t,28.40,30.43,.24)} src="media/flux-card.png" credit="BLACK FOREST LABS · FLUX.1 [dev] MODEL CARD" crop={[100,125,1530,300]} original={[2520,1725]} height={180}/>
  {t>=27.38&&t<30.6&&<div style={{position:'absolute',left:80,top:490,fontFamily:font,fontSize:22,color:'#647078',opacity:on(t,27.38,30.35)}}>Example image from the FLUX.1 model card</div>}
  <Proof k={on(t,30.7,31.62,.18)} src="media/drawthings.png" credit="DRAW THINGS · FREE APP · LOCAL AND OFFLINE" crop={[0,0,1600,415]} original={[1600,1144]} height={240}/>
  {t>=31.72&&t<33.5&&<div style={{position:'absolute',left:80,top:175,width:920,opacity:on(t,31.72,33.26,.2),fontFamily:font}}>
   <div style={{fontSize:44,fontWeight:650,color:INK}}>Slower. But private.</div>
   {[['Cloud',ramp(t,31.72,32.13),'#9199a3'],['This Mac',ramp(t,31.72,33.28),ACCENT]].map(([name,k,col])=><div key={String(name)} style={{display:'flex',alignItems:'center',gap:20,marginTop:23,fontSize:27}}><span style={{width:145}}>{name}</span><div style={{width:580,height:15,background:'#e0e4e8',borderRadius:10,overflow:'hidden'}}><div style={{width:`${Number(k)*100}%`,height:'100%',background:String(col)}}/></div>{name==='This Mac'&&t>=32.56&&<Lock/>}</div>)}
   <div style={{fontSize:20,color:'#78828a',marginTop:20}}>Illustrative comparison · no measured speed claim</div>
  </div>}
  <Plate k={on(t,33.32,35.7,.3)} title={t<35.08?'What can’t it run?':'Llama 3.3 70B'} subtitle="At this 4-bit quantization"/>
  <Proof k={on(t,36.12,37.35,.2)} src="media/llama-size.jpg" credit="HUGGING FACE · BARTOWSKI · Q4_K_M" crop={[17,290,580,112]} original={[1265,712]} height={105} width={520}/>
  <Plate k={on(t,37.42,38.18,.15)} title="Doesn’t fit." subtitle="42.5 GB weights > 32 GB total memory" accent={RED}/>
  {t>=35.08&&t<37.5&&<div style={{position:'absolute',left:80,top:450,color:INK,fontFamily:font,fontSize:32,fontWeight:600,opacity:on(t,35.08,37.3)}}>Llama 3.3 70B · 4-bit ≈ 42.5 GB</div>}
  <Plate k={on(t,38.50,40.32,.25)} title="Level 4 · 128 GB" subtitle="Strix Halo · next video"/>
  <Plate k={ramp(t,40.46,40.8)} top={1495} title="Follow for the next levels." subtitle="HARDWARE LADDER · 3 OF 5 COMPLETE"/>
 </>;
};
