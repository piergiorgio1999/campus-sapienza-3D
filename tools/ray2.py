import time, json
from playwright.sync_api import sync_playwright
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
courts = json.load(open('/tmp/claude-0/-home-claude/436a9eb2-c5ea-5361-a879-62b3b13837b8/scratchpad/campus/courtyards.json'))['courtyards']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg=b.new_page(viewport={'width':430,'height':800})
    pg.goto('http://127.0.0.1:8765/index.html?standalone',wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('chimica-esterni'))"): break
    time.sleep(2)
    res = pg.evaluate("""(courts) => {
      const T=window.THREE, s=window.campus3d.scene;
      const b={west:12.5040,south:41.8946,east:12.5257,north:41.9108};
      const mlon=111320*Math.cos(((b.south+b.north)/2)*Math.PI/180), mlat=111132;
      const W=(b.east-b.west)*mlon, D=(b.north-b.south)*mlat;
      const out=[]; const rc=new T.Raycaster();
      const meshes=[]; s.traverse(o=>{ if(o.isMesh && !o.userData.ground) meshes.push(o); });
      for (const [code, rings] of Object.entries(courts)) rings.forEach((r, i) => {
        const cx=r.reduce((a,p)=>a+p[0],0)/r.length, cy=r.reduce((a,p)=>a+p[1],0)/r.length;
        const x=(cx-b.west)*mlon-W/2, n=(cy-b.south)*mlat-D/2;
        rc.set(new T.Vector3(x,200,-n), new T.Vector3(0,-1,0));
        const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
        const walls=dirs.map(d=>{ rc.set(new T.Vector3(x,6,-n), new T.Vector3(d[0],0,d[1])); const h=rc.intersectObjects(meshes,false)[0]; return h?[+h.distance.toFixed(1), h.face? +(h.face.normal.dot(rc.ray.direction)).toFixed(2):null, h.object.geometry.type]:null; });
        const ext = r.map(p=>[(p[0]-cx)*mlon,(p[1]-cy)*mlat]); const hw=Math.max(...ext.map(e=>Math.abs(e[0]))), hd=Math.max(...ext.map(e=>Math.abs(e[1])));
        out.push([code,i,'halfsize',+hw.toFixed(1),+hd.toFixed(1),walls]);
      });
      return out;
    }""", courts)
    for r in res: print(r)
    b.close()
