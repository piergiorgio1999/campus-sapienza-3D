import time, json
from playwright.sync_api import sync_playwright
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg=b.new_page(viewport={'width':430,'height':900})
    pg.goto('http://127.0.0.1:8765/index.html?standalone',wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('chimica-esterni'))"): break
    time.sleep(2)
    r=pg.evaluate("""() => {
      const T=window.THREE, s=window.campus3d.scene, g=s.getObjectByName('chimica-esterni').children[0];
      s.updateMatrixWorld(true); const w=(u,v,h)=>g.localToWorld(new T.Vector3(u,h,-v));
      const out={};
      for (const [k,u,v] of [['u56_vfac',56.3,-20.4],['u78_vfac',78.3,-20.4],['u56_vout',56.3,9.6],['u78_vout',78.3,9.6]]) { const p=w(u,v,0.8); out[k]=[+p.x.toFixed(1),+p.z.toFixed(1)]; }
      return out;}""")
    print(json.dumps(r)); b.close()
