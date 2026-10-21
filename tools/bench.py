import time
from playwright.sync_api import sync_playwright
OUT='/tmp/claude-0/-home-claude/436a9eb2-c5ea-5361-a879-62b3b13837b8/scratchpad/shots/'
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg=b.new_page(viewport={'width':430,'height':900})
    pg.goto('http://127.0.0.1:8765/index.html?standalone',wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('chimica-esterni'))"): break
    pg.evaluate("""() => {
      const T=window.THREE,g=window.campus3d.scene.getObjectByName('chimica-esterni').children[0];
      const w=(u,v,h)=>g.localToWorld(new T.Vector3(u,h,-v));
      const cam=window.campus3d.camera,ctl=window.campus3d.controls;
      ctl.target.copy(w(77.5,-5,1.0));
      cam.position.copy(w(77.5,-12,6.5));
      ctl.update();
    }""")
    time.sleep(4)
    pg.screenshot(path=OUT+'benches_side.png')
    pg.evaluate("""() => {
      const T=window.THREE,g=window.campus3d.scene.getObjectByName('chimica-esterni').children[0];
      const w=(u,v,h)=>g.localToWorld(new T.Vector3(u,h,-v));
      const cam=window.campus3d.camera,ctl=window.campus3d.controls;
      ctl.target.copy(w(75,-2.3,1.0));
      cam.position.copy(w(71,1.5,3.4));
      ctl.update();
    }""")
    time.sleep(3)
    pg.screenshot(path=OUT+'benches_close.png')
    b.close()
