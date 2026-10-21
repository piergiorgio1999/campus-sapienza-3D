import time, json, sys
from playwright.sync_api import sync_playwright
OUT='/tmp/claude-0/-home-claude/436a9eb2-c5ea-5361-a879-62b3b13837b8/scratchpad/shots/'
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
views = json.loads(sys.argv[1])
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg=b.new_page(viewport={'width':430,'height':800})
    pg.goto('http://127.0.0.1:8765/index.html?standalone',wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('chimica-esterni'))"): break
    time.sleep(3)
    for v in views:
        r = pg.evaluate("""(v) => {
          const b={west:12.5040,south:41.8946,east:12.5257,north:41.9108};
          const mlon=111320*Math.cos(((b.south+b.north)/2)*Math.PI/180), mlat=111132;
          const W=(b.east-b.west)*mlon, D=(b.north-b.south)*mlat;
          const P=(lon,lat)=>({x:(lon-b.west)*mlon-W/2, n:(lat-b.south)*mlat-D/2});
          const t=P(v.lon,v.lat);
          const cm=window.campus3d.camera, ct=window.campus3d.controls;
          ct.target.set(t.x, v.ty||0, -t.n);
          cm.position.set(t.x+v.dx, v.h, -t.n+v.dz);
          ct.update();
          return [t.x,t.n];
        }""", v)
        time.sleep(2.5)
        pg.screenshot(path=OUT+v['name'])
    b.close()
