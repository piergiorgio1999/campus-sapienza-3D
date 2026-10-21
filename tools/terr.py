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
    time.sleep(3)
    def view(name,t,c):
        pg.evaluate("""([t,c]) => {
          const T=window.THREE,g=window.campus3d.scene.getObjectByName('chimica-esterni').children[0];
          const w=(u,v,h)=>g.localToWorld(new T.Vector3(u,h,-v));
          const cm=window.campus3d.camera,ct=window.campus3d.controls;
          ct.target.copy(w(...t)); cm.position.copy(w(...c)); ct.update();
        }""",[t,c]); time.sleep(2.5); pg.screenshot(path=OUT+name)
    view('terr_top.png',[77.5,-9,0.8],[77.5,-8.4,30])
    view('terr_obl.png',[77.5,-8.5,0.8],[77.5,2,9])
    b.close()
