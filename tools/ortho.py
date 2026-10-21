import time, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
OUT='/tmp/claude-0/-home-claude/436a9eb2-c5ea-5361-a879-62b3b13837b8/scratchpad/shots/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'])
    pg=b.new_page(viewport={'width':900,'height':900})
    pg.goto('http://127.0.0.1:8765/index.html?standalone',wait_until='load')
    for _ in range(90):
        time.sleep(1)
        if pg.evaluate("() => !!(window.campus3d && window.campus3d.scene && window.campus3d.scene.getObjectByName('chimica-esterni'))"): break
    time.sleep(2)
    pts=pg.evaluate("""() => {
      const T=window.THREE, s=window.campus3d.scene, cam=window.campus3d.camera, ctl=window.campus3d.controls;
      s.updateMatrixWorld(true);
      const holder=s.getObjectByName('chimica-esterni'); holder.visible=false;
      s.traverse(o=>{ if (o.isInstancedMesh) o.visible=false; });
      const g=holder.children[0];
      const w=(u,v)=>g.localToWorld(new T.Vector3(u,0,-v));
      const c=w(60,-5); ctl.target.copy(c);
      // camera straight above, screen up = facade direction (v negative)
      const up=w(60,-30).sub(c).normalize();
      cam.up.copy(up); cam.position.set(c.x, 95, c.z); cam.lookAt(c); ctl.update();
      cam.up.copy(up); cam.lookAt(c); cam.updateMatrixWorld(true);
      const out={};
      for (let u=10; u<=100; u+=10) for (let v=-30; v<=20; v+=10) { const q=w(u,v); q.y=0.1; q.project(cam); out[u+','+v]=[(q.x+1)/2*900,(1-q.y)/2*900]; }
      return out;}""")
    time.sleep(3)
    # re-apply camera (controls may reset)
    pg.screenshot(path=OUT+'ortho.png')
    b.close()
im=Image.open(OUT+'ortho.png').convert('RGB'); d=ImageDraw.Draw(im)
for k,(x,y) in pts.items():
    d.ellipse([x-3,y-3,x+3,y+3],fill=(255,0,0)); d.text((x+4,y-10),k,fill=(255,255,0))
im.save(OUT+'ortho_grid.png'); print(json.dumps({k:[round(a) for a in v] for k,v in list(pts.items())[:6]}))
