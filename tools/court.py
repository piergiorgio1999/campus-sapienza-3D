import time, json
from playwright.sync_api import sync_playwright
OUT='/tmp/claude-0/-home-claude/436a9eb2-c5ea-5361-a879-62b3b13837b8/scratchpad/shots/'
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg=b.new_page(viewport={'width':430,'height':900})
    pg.goto('http://127.0.0.1:8765/index.html?standalone',wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('cortile-modello'))"): break
    time.sleep(3)
    def view(name, tgt, cam):
        pg.evaluate("""([t,c]) => {
          const T=window.THREE, h=window.campus3d.scene.getObjectByName('cortile-modello'), court=h.children[0];
          const w=(u,v,y)=>court.localToWorld(new T.Vector3(u,y,-v));
          const cm=window.campus3d.camera, ct=window.campus3d.controls;
          ct.target.copy(w(...t)); cm.position.copy(w(...c)); ct.update();
        }""", [tgt, cam])
        time.sleep(2.5)
        pg.screenshot(path=OUT+name)
    view('court_top.png', [8.4,6.5,0], [8.4,6.6,32])
    view('court_obl.png', [8.4,6.5,1.5], [8.4,-9,9])
    view('court_back.png', [8.4,4,1.5], [8.4,20,7])
    info = pg.evaluate("""() => {
      const T=window.THREE, h=window.campus3d.scene.getObjectByName('cortile-modello'), court=h.children[0];
      return court.children.map((m,i)=>{const b=new T.Box3().setFromObject(m);const c=m.material&&m.material.color?m.material.color.getHexString():''; return [i,m.type,(m.geometry&&m.geometry.type)||'', c, [b.min,b.max].map(v=>v.toArray().map(x=>+x.toFixed(1)))];});
    }""")
    print(len(info))
    for r in info[:80]: print(r)
    b.close()
