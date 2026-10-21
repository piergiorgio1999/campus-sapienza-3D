import time, json
from playwright.sync_api import sync_playwright
EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE, headless=True, args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg = b.new_page(viewport={'width': 430, 'height': 900})
    pg.goto('http://127.0.0.1:8765/index.html?standalone', wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('chimica-esterni'))"): break
    res = pg.evaluate("""() => {
      const T = window.THREE, g = window.campus3d.scene.getObjectByName('chimica-esterni').children[0];
      return g.children.map((m, i) => { const b = new T.Box3().setFromObject(m); return [i, m.type, +(b.min.x).toFixed(2), +(b.min.y).toFixed(2), +(b.min.z).toFixed(2), +(b.max.x).toFixed(2), +(b.max.y).toFixed(2), +(b.max.z).toFixed(2)]; });
    }""")
    for r in res: print(r)
    b.close()
