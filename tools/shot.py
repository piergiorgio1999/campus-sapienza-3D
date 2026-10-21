import sys, time, json
from playwright.sync_api import sync_playwright

OUT = '/tmp/claude-0/-home-claude/436a9eb2-c5ea-5361-a879-62b3b13837b8/scratchpad/shots/'
EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE, headless=True,
                          args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                                '--ignore-gpu-blocklist', '--no-sandbox'])
    pg = b.new_page(viewport={'width': 430, 'height': 900})
    logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:200]))
    pg.on('pageerror', lambda e: logs.append('PAGEERROR: ' + str(e)[:300]))
    pg.goto('http://127.0.0.1:8765/index.html?standalone', wait_until='load')
    ok = False
    for _ in range(90):
        time.sleep(1)
        ok = pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('chimica-esterni'))")
        if ok:
            break
    print('scene ready:', ok)
    time.sleep(4)
    pg.screenshot(path=OUT + 'overview.png')
    info = pg.evaluate("""() => {
      const s = window.campus3d.scene, THREE_ = window.THREE;
      const holder = s.getObjectByName('chimica-esterni');
      const g = holder.children[0];               // terrazza
      const w = (u, v, h) => g.localToWorld(new THREE_.Vector3(u, h, -v));
      const c = w(77, -8, 0.8);
      const cam = window.campus3d.camera, ctl = window.campus3d.controls;
      const tr = w(67, -5, 0.8);
      ctl.target.copy(tr);
      const a = w(67, -5 - 20, 0.8 + 24);   // da dietro, verso l'esterno guardando la terrazza
      cam.position.copy(a);
      ctl.update();
      return {terrace: c.toArray(), cam: cam.position.toArray(), kids: holder.children.length};
    }""")
    print(json.dumps(info))
    time.sleep(3)
    pg.screenshot(path=OUT + 'terrace.png')
    # vista dall'alto
    pg.evaluate("""() => {
      const ctl = window.campus3d.controls, cam = window.campus3d.camera;
      const t = ctl.target.clone();
      cam.position.set(t.x + 0.5, t.y + 60, t.z + 0.5);
      ctl.update();
    }""")
    time.sleep(3)
    pg.screenshot(path=OUT + 'terrace_top.png')
    print('\n'.join(l for l in logs if 'error' in l.lower() or 'PAGEERROR' in l)[:2000])
    b.close()
