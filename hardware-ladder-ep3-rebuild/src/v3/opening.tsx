import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useTex} from './assets';
import {Callout, LevelCounter} from './callouts';
import {Glyph} from './hook';
import {Studio, ContactShadow, project, type Cam, type V3} from './studio';
import {Device, ROW, add, rackAt, useWorld} from './world';
import {GREEN, GRAPHITE, WeightBlock, WeightStream} from './xray';
import {BodyWorld,BodyOverlay,bodyCamera,useBodyMedia,useFluxScreen,xrayAt} from './body';

// EP3 opening. All cue times are from brief/shot-map.md and the approved narration.
const RED = '#FF3B30';
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, b: number) => clamp((t-a)/(b-a));
const ease = (x: number) => x < .5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2;
const mix = (a: number,b: number,k: number) => a+(b-a)*k;
const mix3 = (a: V3,b: V3,k: number): V3 => [mix(a[0],b[0],k),mix(a[1],b[1],k),mix(a[2],b[2],k)];
const present = (t: number,a: number,b: number,d=.25) => ramp(t,a,a+d)*(1-ramp(t,b,b+.22));
type Orbit = {at: V3; dist: number; yaw: number; pitch: number; shift: number};
const HERO: Orbit = {at:[.58,.075,-.03],dist:.68,yaw:-.23,pitch:.38,shift:270};
const CLOSE: Orbit = {...HERO,dist:.65,yaw:-.10,pitch:.32};
const SMALL: Orbit = {at:[.12,.045,.015],dist:.64,yaw:-.6,pitch:.6,shift:240};
const WIDE: Orbit = {at:[.94,.43,-.43],dist:3.20,yaw:-.75,pitch:.25,shift:280};
const LOWER: Orbit = {at:[.125,.04,.01],dist:.80,yaw:-.20,pitch:.70,shift:275};
const BACK: Orbit = {...CLOSE,dist:.66,shift:250};
const moves: Array<[number,number,Orbit]> = [[0,3.92,CLOSE],[4.10,5.46,SMALL],[5.55,6.58,WIDE],[7.20,7.82,LOWER],[9.00,9.70,BACK]];
export const openingCamera = (t: number): Cam => {
 let o=HERO;
 for(const [a,b,next] of moves){
  if(t<=a) break;
  const k=ease(ramp(t,a,b));
  if(t<b){o={at:mix3(o.at,next.at,k),dist:o.dist*Math.pow(next.dist/o.dist,k),yaw:mix(o.yaw,next.yaw,k),pitch:mix(o.pitch,next.pitch,k),shift:mix(o.shift,next.shift,k)};break;}
  o=next;
 }
 return {at:o.at,pos:[o.at[0]+o.dist*Math.sin(o.yaw)*Math.cos(o.pitch),o.at[1]+o.dist*Math.sin(o.pitch),o.at[2]+o.dist*Math.cos(o.yaw)*Math.cos(o.pitch)],fov:44,shift:o.shift};
};

// Preserve the source GLB and animate its existing lid hierarchy. No synthetic replacement laptop.
const useMacRig = (source: THREE.Object3D|null) => useMemo(()=>{
 if(!source)return null;
 const obj=source.clone(true);
 let lid: THREE.Object3D|undefined,screen: THREE.Mesh|undefined;
 obj.traverse(n=>{
  if(n.name==='Cube016_2' || n.name==='Cube.016_2')lid=n;
  if(n.name==='Object_21')screen=n as THREE.Mesh;
  if((n as THREE.Mesh).isMesh){const m=n as THREE.Mesh;m.material=Array.isArray(m.material)?m.material.map(x=>x.clone()):m.material.clone();}
 });
 // GLTFLoader sanitizes dots, so fall back to the screen's parent (the hinge group).
 if(!lid && screen)lid=screen.parent??undefined;
 if(!lid || !screen)throw new Error('MacBook lid or display mesh is missing');
 const open=lid.quaternion.clone();
 const material=new THREE.MeshBasicMaterial({color:'white',side:THREE.DoubleSide});
 screen.material=material;
 return {obj,lid,open,material};
},[source]);

const useScreen = (capture: THREE.Texture|null,t:number) => {
 const surface=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1000;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=true;texture.anisotropy=8;
  return {canvas,texture};
 },[]);
 const g=surface.canvas.getContext('2d')!;
 g.fillStyle='#070b10';g.fillRect(0,0,1600,1000);
 if(capture && t>=.90){
  // Genuine LM Studio page header, followed by an explicitly illustrative code panel.
  g.drawImage(capture.image as HTMLImageElement,300,145,1920,285,45,32,1510,224);
  g.fillStyle='#111d24';g.fillRect(45,280,1510,655);
  g.fillStyle='#91a3ac';g.font='26px Menlo, monospace';g.fillText('CODE ANIMATION · ILLUSTRATION',80,332);
  const lines=['def fix_bug(items):','    result = []','    for item in items:','        if item is not None:','            result.append(item)','    return result','','# Ready to run locally'];
  const n=Math.floor(Math.max(0,t-.94)*95);
  let remaining=n;g.font='36px Menlo, monospace';
  lines.forEach((line,i)=>{g.fillStyle=i===7?'#3DFF8F':i===0?'#c6a5ff':'#b5f7d1';const txt=line.slice(0,remaining);g.fillText(txt,85,405+i*60);remaining=Math.max(0,remaining-line.length);});
  g.fillStyle=t>=2.74?'#3DFF8F':'#adb8c2';g.font='24px Menlo, monospace';g.fillText(t>=2.74?'LOCAL MODEL  /  OFFLINE':'LOCAL MODEL',80,978);
 }
 surface.texture.needsUpdate=true;
 return surface.texture;
};

const TAGS: Array<{level:number;p:V3;x:number;y:number;name:string;mem:string;cue:number}> = [
 {level:1,p:[-.04,.012,.02],x:640,y:1150,name:'ESP + Arduino',mem:'8 MB',cue:5.46},
 {level:2,p:[.25,.02,.02],x:680,y:990,name:'Pi + iPhone',mem:'8 GB / 12 GB',cue:6.35},
 {level:3,p:[.58,.15,-.09],x:710,y:830,name:'MacBook Pro',mem:'32 GB',cue:6.25},
 {level:4,p:[1.08,.23,-.06],x:740,y:665,name:'Strix Halo',mem:'128 GB',cue:6.4},
 {level:5,p:rackAt([.3,1.3,.45]),x:710,y:445,name:'AI server',mem:'640 GB',cue:6.28},
];

const Take: React.FC<{t:number}> = ({t})=>{
 const world=useWorld();
 const capture=useTex('media/lmstudio-qwen3coder.png');
 const rig=useMacRig(world?.mac??null);
 const screen=useScreen(capture,t);
 const media=useBodyMedia();
 const fluxScreen=useFluxScreen(media.flux,t);
 if(!world||!capture||!rig||!media.flux)return null;
 rig.lid.quaternion.slerpQuaternions(new THREE.Quaternion(),rig.open,ease(ramp(t,0,.9)));
 rig.material.map=t>=27.38&&t<33.32?fluxScreen:screen;rig.material.needsUpdate=true;
 rig.obj.traverse(n=>{if((n as THREE.Mesh).isMesh){const mesh=n as THREE.Mesh;for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){if(m.userData.ep3opacity===undefined)m.userData.ep3opacity=m.opacity;m.opacity=m.userData.ep3opacity*(1-xrayAt(t));m.transparent=m.opacity<1;m.depthWrite=m.opacity>.5;}}});
 rig.obj.updateMatrixWorld(true);
 const cam=t<=10?openingCamera(t):bodyCamera(t,openingCamera(10));
 const at=(p:V3)=>project(cam,1080,1920,p);
 const mac=at(add(ROW.mac,[0,.18,-.08]));
 const cloud:V3=add(ROW.mac,[.15,.28,-.13]);
 const cut=ramp(t,2.74,2.98);
 const wide=Math.max(ease(ramp(t,5.55,6.58))*(1-ease(ramp(t,9.28,9.6))),ease(ramp(t,40.46,41.35)));
 const rejected=t>=8.02;
 const backgroundOn=t<11.58||t>=38.10;
 const backgroundGhost=ramp(t,10.85,11.58)*(1-ramp(t,38.1,38.55));
 const smallK=present(t,5.46,5.95);
 const top=at(add(ROW.esp,[0,.015,0]));
 const rejectPhase=ramp(t,8.02,8.6);
 const rejectedY=.075+.055*Math.sin(rejectPhase*Math.PI);
 return <>
  <Studio w={1080} h={1920} cam={cam} light={mix3(ROW.mac,[1.4,0,-1.3],wide)} sun={{from:[-3,6,4],power:2.6,area:mix(.75,3.5,wide),soft:12,rim:.85}} fill={1} fog={[mix(.85,7,wide),mix(3,26,wide)]}>
   {t>=3.92 && backgroundOn && <Device id="esp" obj={world.esp} xray={backgroundGhost} tint="#F3F4F6" lines={0} />}
   {t>=3.92 && backgroundOn && <Device id="uno" obj={world.uno} xray={backgroundGhost} tint="#F3F4F6" lines={0} />}
   {t>=3.92 && backgroundOn && <Device id="pi" obj={world.pi} xray={backgroundGhost} tint="#F3F4F6" lines={0} />}
   {t>=3.92 && backgroundOn && <Device id="iphone" obj={world.iphone} xray={backgroundGhost} tint="#F3F4F6" lines={0} />}
   <group position={ROW.mac}><primitive object={rig.obj}/><ContactShadow p={[0,0,0]} w={.43} d={.39}/></group>
   {backgroundOn&&<><Device id="fw" obj={world.fw} xray={backgroundGhost} tint="#F3F4F6" lines={0}/><Device id="rack" obj={world.rack} xray={backgroundGhost} tint="#F3F4F6" lines={0}/></>}
   <BodyWorld t={t}/>
   <WeightStream from={cloud} to={add(ROW.mac,[.02,.035,0])} t={t} k={present(t,.9,2.74,.2)} h={1920} arc={.03} size={.006} n={14} speed={.8} seed={73}/>
   <WeightBlock p={add(ROW.mac,[0,.025+.22*(1-ease(ramp(t,1.44,1.90))),.025])} s={[.038,.035,.038]} t={t} k={present(t,1.44,2.06,.12)} seed="ep3-coder"/>
   {t>=1.8 && t<2.5 && <pointLight position={add(ROW.mac,[0,.035,.025])} color={GREEN} intensity={.07*(1-ramp(t,2.06,2.5))} distance={.3}/>}
   <WeightBlock p={[.09,rejectedY,-.015]} s={[.06,.055,.06]} t={t} k={present(t,7.40,9.05,.25)} seed="ep3-reject" over={rejected}/>
   {[ROW.esp,ROW.pi].map((p,i)=><mesh key={i} position={add(p,[0,.003,0])} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[i===0?.032:.052,i===0?.036:.057,64]}/><meshBasicMaterial color={rejected?RED:GREEN} transparent opacity={present(t,7.40,9.12,.2)} depthWrite={false}/></mesh>)}
  </Studio>
  <Callout x={mac.x} y={mac.y} dx={0} dy={-190} label="MacBook Pro" value="14″ M5" k={present(t,.1,3.72,.3)} valueSize={56} center plate/>
  <Glyph x={860} y={245} kind="cloud" label="Cloud" k={present(t,.9,3.55,.25)} cut={cut} s={100}/>
  <Glyph x={860} y={455-230*wide} kind="wifi" label={cut>.5?'Offline':'Wi-Fi'} k={present(t,1.05,7.18,.25)*(t<4.1?1:.42)} cut={cut} s={110}/>

  <LevelCounter level={3} mem="MacBook Pro" k={present(t,4.10,7.14,.3)}/>
  <Callout x={top.x} y={top.y} dx={0} dy={-190} label="LEVEL 1" value="8 MB" note="ESP + Arduino" k={smallK} valueSize={48} center plate/>
  {TAGS.map(tag=>{
    const q=at(tag.p);const closing=t>=40.46;const k=closing?ramp(t,40.7+tag.level*.07,41.15+tag.level*.07):present(t,tag.cue,7.18,.28)*ramp(t,6.1,6.58);
    const red=!closing&&tag.level<=2&&rejected;const col=red?RED:(closing?tag.level<=3:tag.level===3)?GREEN:GRAPHITE;
    return <React.Fragment key={tag.level}>
     <svg width={1080} height={1920} style={{position:'absolute',inset:0,opacity:k}}><path d={`M ${q.x} ${q.y} L ${tag.x-22} ${tag.y+43}`} stroke={col} strokeWidth={2} fill="none"/><circle cx={q.x} cy={q.y} r={5} fill={col}/></svg>
     <div style={{position:'absolute',left:tag.x,top:tag.y,opacity:k,background:'rgba(255,255,255,.94)',borderLeft:`4px solid ${col}`,padding:'10px 16px',borderRadius:8,color:col,fontFamily:'Helvetica Neue, Arial, sans-serif',maxWidth:280}}>
      <div style={{fontSize:22,fontWeight:700,letterSpacing:2}}>LEVEL {tag.level}{closing?(tag.level<=3?' ✓':' · LOCKED'):red?' ×':''}</div>
      <div style={{fontSize:29,fontWeight:650,marginTop:3,whiteSpace:'nowrap'}}>{tag.name}</div>
      <div style={{fontSize:26,marginTop:3}}>{tag.mem}</div>
     </div>
    </React.Fragment>;
  })}
  <Callout x={540} y={510} dx={0} dy={-65} label="CODING MODEL" value="doesn’t fit" accent={RED} k={present(t,8.02,9.0,.22)} valueSize={34} center plate/>
  <div style={{position:'absolute',left:80,top:185,opacity:present(t,7.45,9.0,.22),fontFamily:'Helvetica Neue, Arial, sans-serif',color:GRAPHITE}}><div style={{fontSize:22,letterSpacing:3,color:'#68717a'}}>LEVELS 1 + 2</div><div style={{fontSize:56,fontWeight:600,letterSpacing:-1.6,marginTop:12}}>The first two levels.</div></div>
  <Callout x={at(ROW.esp).x} y={at(ROW.esp).y} dx={-25} dy={125} label="LEVEL 1" value="ESP + Arduino" k={present(t,7.70,9.0,.2)} valueSize={25} center plate/>
  <Callout x={at(ROW.iphone).x} y={at(ROW.iphone).y} dx={35} dy={150} label="LEVEL 2" value="Pi + iPhone" k={present(t,7.78,9.0,.2)} valueSize={25} center plate/>
  <Callout x={mac.x} y={mac.y} dx={0} dy={-210} label="One number" value="? GB" k={ramp(t,9.90,10.22)*(1-ramp(t,11.58,11.8))} valueSize={82} center plate/>
  <BodyOverlay t={t} cam={cam}/>
 </>;
};

export const Opening: React.FC<{full?:boolean}> = ({full=false})=>{
 const t=useCurrentFrame()/25;
 const bodyPip=ease(ramp(t,10,11.45))*(1-ease(ramp(t,38.10,38.65)));
 return <AbsoluteFill style={{background:'#F3F4F6'}}>
  <Take t={t}/>
  <Audio src={staticFile(full?'voice/full-mix-v2.wav':'voice/voiceover.wav')}/>
  <div style={{position:'absolute',left:80,top:1090+210*bodyPip,width:380-40*bodyPip,height:380-40*bodyPip,borderRadius:'50%',border:'2px dashed rgba(35,39,46,.25)',background:'rgba(243,244,246,.7)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Helvetica Neue, Arial, sans-serif',color:'#7e838b',fontSize:21,textAlign:'center',letterSpacing:1,lineHeight:1.6}}>AVATAR PLACEHOLDER<br/>REPLACE BEFORE FINAL</div>
  <div style={{position:'absolute',left:80,bottom:145,fontFamily:'Helvetica Neue, Arial, sans-serif',fontSize:18,letterSpacing:2,color:'#858b93'}}>{full?"EPISODE 3 · FULL REVIEW · AVATAR PENDING":"EPISODE 3 · OPENING REVIEW · 00:00–00:10"}</div>
 </AbsoluteFill>;
};
