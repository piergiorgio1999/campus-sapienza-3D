import time, json
from playwright.sync_api import sync_playwright
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg=b.new_page(viewport={'width':430,'height':900})
    pg.goto('http://127.0.0.1:8765/index.html?standalone',wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('alberi') && window.campus3d.scene.getObjectByName('chimica-esterni'))"): break
    r=pg.evaluate("""() => {
      const T=window.THREE, s=window.campus3d.scene;
      const g=s.getObjectByName('chimica-esterni').children[0];
      const trunks=s.getObjectByName('alberi').children[0];
      const m=new T.Matrix4(), v=new T.Vector3(), out=[];
      for (let i=0;i<trunks.count;i++){ trunks.getMatrixAt(i,m); v.setFromMatrixPosition(m); const l=g.worldToLocal(v.clone()); const u=l.x, vv=-l.z;
        if (u>50 && u<95 && vv>-26 && vv<8) out.push({i, world:[v.x,v.z], u:+u.toFixed(2), v:+vv.toFixed(2)}); }
      const c=g.localToWorld(new T.Vector3(77.45,0.8,-(-12.0)));
      return {trees:out, lawnCenterWorld:[c.x,c.z]};
    }""")
    print(json.dumps(r))
    b.close()
