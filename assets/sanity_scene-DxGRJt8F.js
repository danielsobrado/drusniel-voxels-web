import{i as Z,u as E,j as H,p as _,k as q,v as x,m as T,t as F,n as j,o as I,q as W,r as J,w as Q,I as Y,g as A,x as N,y as P,z as B,E as ee,F as R,G as V,J as G,K as te,L as S,N as U,O as ne,Q as ae,R as se,T as re,U as oe,V as ie,X as ce,Y as ue,Z as $,W as de,A as le,S as pe,C as me,P as fe,D as he,H as ge,B as be,$ as we,M as ye}from"./index-By3dotia.js";import{i as Pe,b as xe,c as Se,j as Me,f as L,p as _e,d as ve,e as Ie,E as Ae,F as Ce,g as D,P as w,W as Ge}from"./seed-CzjKzhUu.js";import{Hud as Ue}from"./hud-Bfo65RMr.js";function Ee(t,e){const n=new Z,a=E(e%8192/8192),s=H(_.x.mul(.24).add(a.mul(6.283))).mul(q(_.z.mul(.19).add(a.mul(11)))).mul(1.8);return n.positionNode=_.add(x(0,s,0)),n.colorNode=T(x(.16,.3,.42),F(t,j().mul(3).fract()).rgb,.72),n.roughnessNode=I(.86),n}const K=64,O=5,z=4*Uint32Array.BYTES_PER_ELEMENT;function Te(){return typeof Y.prototype.setIndirect=="function"?null:"Phase-0 indirect proof requires InstancedBufferGeometry.setIndirect support"}function Be(t){return Math.max(1,Math.ceil(Math.max(0,Math.floor(t))/K))}async function ke(t,e,n){const a=Te();if(a)throw new Error(a);const s=Math.max(1,Math.floor(e)),d=new W(s,4);d.name="phase0-indirect-instance-a";const l=new W(s,4);l.name="phase0-indirect-instance-b";const r=new J(new Uint32Array(O),O);r.name="phase0-indirect-args";const o=t.backend;o.createStorageAttribute(d),o.createStorageAttribute(l),o.createIndirectStorageAttribute(r);const i=new Q(1,1,1),c=new Y;c.setAttribute("position",i.getAttribute("position")),c.setAttribute("normal",i.getAttribute("normal")),c.setAttribute("uv",i.getAttribute("uv")),c.setIndex(i.getIndex()),c.instanceCount=s;const h=i.getIndex()?.count??i.getAttribute("position").count;i.dispose(),c.setIndirect?.(r,0);const p=t.backend.device;if(!p)throw new Error("Phase-0 indirect proof requires a WebGPU device");await Ne(p,{instanceA:C(o,d),instanceB:C(o,l),indirect:C(o,r),count:s,indexCount:h,seed:n});const f=We(d,l,s),u=new A(c,f);return u.name="phase0-indirect-instances",u.frustumCulled=!1,{mesh:u,count:s,indirectDraws:1}}function We(t,e,n){const a=N(t,"vec4",n).toReadOnly(),s=N(e,"vec4",n).toReadOnly(),d=a.element(P),l=s.element(P),r=new B;return r.positionNode=ee.mul(d.w).add(d.xyz),r.colorNode=l.xyz,r}async function Ne(t,e){const n=new ArrayBuffer(z),a=new Uint32Array(n);a[0]=e.count>>>0,a[1]=e.indexCount>>>0,a[2]=e.seed>>>0,a[3]=0;const s=t.createBuffer({label:"phase0 indirect params",size:z,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});t.queue.writeBuffer(s,0,n);const d=t.createShaderModule({label:"phase0 indirect fill shader",code:`
struct Params {
  count: u32,
  index_count: u32,
  seed: u32,
  _pad: u32,
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> instance_a: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> instance_b: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> indirect_args: array<u32>;

fn hash_u32(v: u32) -> f32 {
  var x = v ^ (v >> 16u);
  x = x * 0x7feb352du;
  x = x ^ (x >> 15u);
  x = x * 0x846ca68bu;
  x = x ^ (x >> 16u);
  return f32(x & 0x00ffffffu) / 16777215.0;
}

@compute @workgroup_size(${K})
fn fill(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  if (i == 0u) {
    indirect_args[0] = params.index_count;
    indirect_args[1] = params.count;
    indirect_args[2] = 0u;
    indirect_args[3] = 0u;
    indirect_args[4] = 0u;
  }
  if (i >= params.count) {
    return;
  }

  let fi = f32(i);
  let columns = 32.0;
  let col = fi - floor(fi / columns) * columns;
  let row = floor(fi / columns);
  let jitter_x = hash_u32(i + params.seed * 17u) - 0.5;
  let jitter_z = hash_u32(i + params.seed * 31u + 97u) - 0.5;
  let scale = 0.22 + hash_u32(i + params.seed * 43u + 211u) * 0.42;

  instance_a[i] = vec4<f32>(
    -30.0 + col * 0.72 + jitter_x * 0.16,
    2.0 + hash_u32(i + params.seed * 59u + 313u) * 3.5,
    8.0 + row * 0.72 + jitter_z * 0.16,
    scale
  );
  instance_b[i] = vec4<f32>(
    0.86,
    0.20 + hash_u32(i + params.seed * 71u + 401u) * 0.35,
    0.12 + hash_u32(i + params.seed * 83u + 557u) * 0.22,
    1.0
  );
}
`}),l=t.createBindGroupLayout({label:"phase0 indirect fill layout",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]}),r=await t.createComputePipelineAsync({label:"phase0 indirect fill pipeline",layout:t.createPipelineLayout({bindGroupLayouts:[l]}),compute:{module:d,entryPoint:"fill"}}),o=t.createBindGroup({label:"phase0 indirect fill bind group",layout:l,entries:[{binding:0,resource:{buffer:s}},{binding:1,resource:{buffer:e.instanceA}},{binding:2,resource:{buffer:e.instanceB}},{binding:3,resource:{buffer:e.indirect}}]}),i=t.createCommandEncoder({label:"phase0 indirect fill encoder"}),c=i.beginComputePass({label:"phase0 indirect fill pass"});c.setPipeline(r),c.setBindGroup(0,o),c.dispatchWorkgroups(Be(e.count)),c.end(),t.queue.submit([i.finish()]),await t.queue.onSubmittedWorkDone(),s.destroy()}function C(t,e){const n=t.get(e).buffer;if(!n)throw new Error(`Missing GPU buffer for ${e.name||"phase0 indirect attribute"}`);return n}async function Re(t,e,n){const a=R(e,"vec4"),s=R(e,"vec4"),d=E(n%1e5),l=V(()=>{const h=P,p=I(h),f=G(p.div(96)),u=te(p.div(96)).mul(Math.PI*2),m=S(h.add(d)),b=S(h.add(d).add(1499)),g=S(h.add(d).add(9157)),M=u.add(f.mul(.57)),k=f.mul(1.55).add(4).add(m.mul(1.2)),X=b.mul(b).mul(.65).add(.18);a.element(h).assign(U(q(M).mul(k),m.mul(1.7).add(.1),H(M).mul(k),X)),s.element(h).assign(U(T(x(.18,.42,.34),x(.8,.54,.24),g),1))})().compute(e);await t.computeAsync(l);const r=new ne(1,1);r.scale(.75,1.4,.75),r.translate(0,1.1,0);const o=new B,i=a.element(P);o.positionNode=_.mul(i.w).add(i.xyz),o.colorNode=ae(s.element(P));const c=new se(r,o,e);return c.name="phase0-storage-instances",c.frustumCulled=!1,c.position.set(0,0,0),{mesh:c,count:e}}async function Le(t,e,n){const a=new re(e,e),s=E(n%1e5),d=V(()=>{const l=P,r=l.mod(e),o=l.div(e),i=oe(I(r),I(o)).div(e),c=S(G(i.x.mul(12)).add(G(i.y.mul(12)).mul(57)).add(s)),h=S(r.add(o.mul(e)).add(s)),p=x(.13,.36,.28),f=x(.82,.44,.18),m=T(p,f,h).mul(c.mul(.55).add(.7));ie(a,ce(r,o),U(m,1)).toWriteOnly()})().compute(e*e);return await t.computeAsync(d),a}function De(t){const e=new B;e.colorNode=F(t,j()),e.side=ue;const n=new A(new $(13,13),e);return n.name="phase0-storage-texture-panel",n.position.set(-18,8,-10),n.rotation.y=Math.PI*.2,n}const v={sunColor:16773328,hemiSky:10275327,hemiGround:3945256,background:1384490};function Oe(){for(const t of["clod-left-stack","project-toolbar","player-mode-bar","terraform-menu","build-progress","crosshair"]){const e=document.getElementById(t);e&&(e.setAttribute("hidden",""),e.style.display="none")}}function y(t,e){window.__drusnielClod&&(window.__drusnielClod.progress=t,window.__drusnielClod.progressMsg=e)}function ze(t){const e=w.cpuTerrainSegments,n=w.cpuTerrainSize,a=n/2,s=[],d=[],r=t.rng("phase0-cpu-terrain").range(0,Math.PI*2);for(let p=0;p<=e;p++)for(let f=0;f<=e;f++){const u=f/e*n-a,m=p/e*n-a,b=Math.sin(u*.24+r)*1.5+Math.cos(m*.31)*.9,g=Math.max(0,1-Math.hypot(u+12,m-8)/9)*5,M=b+g-2.8;s.push(u,M,m)}const o=e+1;for(let p=0;p<e;p++)for(let f=0;f<e;f++){const u=p*o+f,m=u+1,b=u+o,g=b+1;d.push(u,b,m,m,b,g)}const i=new be;i.setAttribute("position",new we(s,3)),i.setIndex(d),i.computeVertexNormals();const c=new ye({color:6253385,roughness:.9,metalness:0}),h=new A(i,c);return h.name="phase0-cpu-procedural-terrain",h.receiveShadow=!0,{mesh:h,verts:s.length/3,tris:d.length/3}}async function He(t,e,n,a){y(.2,"phase0: storage texture compute");const s=await Le(t,w.storageTextureSize,a.sub("storage-texture"));e.add(De(s)),n.stats.counters["phase0.storageTextureBake"]=1,y(.42,"phase0: storage buffer compute");const d=await Re(t,w.storageInstanceCount,a.sub("storage-instances"));e.add(d.mesh),n.stats.counters["phase0.storageInstances"]=d.count,n.stats.counters["phase0.storageInstancedDraws"]=1,y(.54,"phase0: indirect draw compute");const l=await ke(t,w.indirectInstanceCount,a.sub("indirect-instances"));e.add(l.mesh),n.stats.counters["phase0.indirectInstances"]=l.count,n.stats.counters["phase0.indirectDraws"]=l.indirectDraws,y(.62,"phase0: cpu procedural geometry");const r=ze(a);e.add(r.mesh),n.stats.counters["phase0.cpuProceduralVerts"]=r.verts,n.stats.counters["phase0.cpuProceduralTris"]=r.tris,y(.78,"phase0: TSL displacement");const o=new A(new $(20,20,80,80).rotateX(-Math.PI/2),Ee(s,a.sub("displacement")));o.name="phase0-tsl-displacement",o.position.set(18,1.2,-6),o.receiveShadow=!0,e.add(o),n.stats.counters["phase0.tslDisplacement"]=1;const i=new he(v.sunColor,3);i.position.set(60,90,30),i.castShadow=!0,i.shadow.mapSize.set(1024,1024),e.add(i),e.add(new ge(v.hemiSky,v.hemiGround,.62)),n.stats.counters["phase0.seedSignature"]=a.sub("sanity-signature"),y(.92,"phase0: scene ready")}async function Ye(){Oe();const t=Pe();if(xe(),!Se())return;const e=Me();if(e.renderer!=="webgpu"){L("Phase-0 sanity requires WebGPU",["The sanity scene does not silently fall back to WebGL. Remove ?renderer=webgl."]);return}y(.05,"phase0: probing WebGPU");const n=await _e();if(t.diag=n,!n.ok){L("WebGPU probe failed",[n.reason??"unknown failure",...ve(n)]);return}y(.1,"phase0: creating renderer");const a=new de({antialias:!0,trackTimestamp:!0,requiredLimits:Ie(n)});await a.init();const s=a.backend.device;if(s){let u=0;s.onuncapturederror=m=>{u++<8&&console.error("[phase0] WebGPU uncaptured error:",m.error.message)}}const d=e.dpr??Math.min(window.devicePixelRatio,w.dprCap);a.setPixelRatio(d),a.setSize(window.innerWidth,window.innerHeight),a.toneMapping=le,a.toneMappingExposure=1,a.shadowMap.enabled=!0,document.body.appendChild(a.domElement);const l=new pe;l.background=new me(v.background);const r=new fe(55,window.innerWidth/window.innerHeight,.2,1e3),o=new Ae(a,t,n.features.includes("timestamp-query")),i=new Ge(e.seed);await He(a,l,o,i);const c=new Ce(r,a.domElement);c.setPose(D(e.cam??w.initialCam)??D(w.initialCam)),t.setPose=u=>c.setPose(u),t.getPose=()=>c.getPose(),t.flyCamEnabled=u=>{c.enabled=u};const h=new Ue(o.stats,e,r),p=[];t.settle=(u=8)=>new Promise(m=>p.push({frames:u,resolve:m})),window.addEventListener("resize",()=>{r.aspect=window.innerWidth/window.innerHeight,r.updateProjectionMatrix(),a.setSize(window.innerWidth,window.innerHeight)});let f=performance.now();a.setAnimationLoop(u=>{const m=Math.max(1e-4,Math.min((u-f)/1e3,.1));f=u,e.freeze||c.update(m),a.render(l,r),o.update(m),h.update(m);for(const g of p)g.frames-=1;const b=p.filter(g=>g.frames<=0);for(const g of b)g.resolve();for(const g of b)p.splice(p.indexOf(g),1);!t.ready&&o.stats.frame>=w.settleReadyFrames&&(t.ready=!0,t.progress=1,t.progressMsg="ready")})}export{Ye as runPhase0SanityScene};
