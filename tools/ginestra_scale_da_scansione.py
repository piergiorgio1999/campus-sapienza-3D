import json, math
C=(28.72,-50.38); AX=-92.75; rad=math.pi/180
def pol(r,a): return (C[0]+r*math.cos(a*rad), C[1]+r*math.sin(a*rad))
R2=lambda x: round(x,2)
def piece(r0,r1,aA,aB,h0,h1,rise_to=None,radial=False):
    """box tangent (or radial) between angles aA..aB in band r0..r1; rise_to: angle toward which +x points"""
    am=(aA+aB)/2; rm=(r0+r1)/2
    if radial: L=r1-r0; W=0; ang=am
    else:
        L=2*rm*math.sin(abs(aB-aA)/2*rad); W=r1-r0
        ang = am+90 if (rise_to is None or rise_to>am) else am-90
    cu,cv=pol(rm,am)
    return {"u0":R2(cu-L/2),"u1":R2(cu+L/2),"v0":R2(cv-W/2),"v1":R2(cv+W/2),"h0":h0,"h1":h1}, round(ang%360,2)
def thin(r,aA,aB,h0,h1,w=0.05,rise_to=None):
    b,a=piece(r-w/2,r+w/2,aA,aB,h0,h1,rise_to); return b,a
def sector(r0,r1,aA,aB):
    lo,hi=min(aA,aB),max(aA,aB); n=max(2,int(math.ceil((hi-lo)/1.0)))
    out=[pol(r1,lo+(hi-lo)*i/n) for i in range(n+1)]+[pol(r0,hi-(hi-lo)*i/n) for i in range(n+1)]
    return [[R2(u),R2(v)] for u,v in out]
Q=3.25; LAND=1.23; PEN=4.1
west={}
# scale (lato ovest; il lato est è lo specchio rispetto all'asse −92,75°)
b,a=piece(33.4,34.8,-110.0,-101.8,LAND,Q,rise_to=-101.8); west['rampa-2']=dict(forma='oggetto',modello='rampaScala',ruota=0,angolo=a,box=b)
b,a=piece(33.4,34.8,-110.0,-101.8,0,LAND); west['rampa-2-sotto']=dict(forma='box',materiale='travertino',angolo=a,box=b)
b,a=piece(34.8,35.3,-108.1,-102.3,0,PEN); west['pilone']=dict(forma='box',materiale='travertino',angolo=a,box=b)
b,a=piece(35.3,37.3,-110.0,-103.6,0,LAND,rise_to=-110.0); west['rampa-1']=dict(forma='oggetto',modello='rampaScala',ruota=0,angolo=a,box=b)
am=-103.6+0.7/36.3/rad; b,a=piece(35.6,37.0,am-0.7/36.3/rad,am+0.7/36.3/rad,0,0.34); west['base']=dict(forma='box',materiale='travertino',angolo=a,box=b)
b,a=piece(35.0,38.0,-103.2,-100.8,0,0.15); west['gradino-angolo']=dict(forma='box',materiale='travertino',angolo=a,box=b)
west['pianerottolo']=dict(forma='prisma',materiale='travertino',poligono=sector(32.3,37.3,-110.0,-114.3),base=0,altezza=LAND)
b,a=thin(35.05,-108.0,-110.3,LAND,3.75); west['cancello']=dict(forma='oggetto',modello='cancelloScala',ruota=0,angolo=a,box=b)
west['pensilina']=dict(forma='prisma',materiale='travertino',poligono=sector(33.3,37.6,-101.3,-117.0),base=PEN,altezza=0.35)
b,a=thin(37.25,-110.0,-103.6,0.0,LAND+1.0,rise_to=-110.0); west['staccionata-rampa1']=dict(forma='oggetto',modello='staccionata',ruota=0,angolo=a,box=b)
b,a=thin(37.25,-110.0,-114.3,LAND,LAND+1.0); west['staccionata-pianerottolo']=dict(forma='oggetto',modello='staccionata',ruota=0,angolo=a,box=b)
b,a=piece(32.3,37.3,-114.3,-114.3,LAND,LAND+1.0,radial=True); cu,cv=pol(34.8,-114.3); b={"u0":R2(cu-2.5),"u1":R2(cu+2.5),"v0":R2(cv-0.025),"v1":R2(cv+0.025),"h0":LAND,"h1":LAND+1.0}; west['staccionata-testata']=dict(forma='oggetto',modello='staccionata',ruota=0,angolo=round(-114.3%360,2),box=b)
def mirror(p):
    q=json.loads(json.dumps(p))
    if 'box' in q:
        b=q['box']; cu=(b['u0']+b['u1'])/2; cv=(b['v0']+b['v1'])/2; L=b['u1']-b['u0']; W=b['v1']-b['v0']
        r=math.hypot(cu-C[0],cv-C[1]); a=math.degrees(math.atan2(cv-C[1],cu-C[0])); u2,v2=pol(r,2*AX-a)
        q['box'].update(u0=R2(u2-L/2),u1=R2(u2+L/2),v0=R2(v2-W/2),v1=R2(v2+W/2))
        q['angolo']=round((2*AX-q['angolo'])%360,2)
    if 'poligono' in q:
        pts=[]
        for u,v in q['poligono']:
            r=math.hypot(u-C[0],v-C[1]); a=math.degrees(math.atan2(v-C[1],u-C[0])); pts.append([R2(x) for x in pol(r,2*AX-a)])
        q['poligono']=pts[::-1]
    return q
# id: lato ovest e lato est (alcuni sono id dati dall'utente)
IDS={'rampa-2':('gin-ovest-rampa-2','gin-est-rampa-2'),'rampa-2-sotto':('gin-ovest-rampa-2-sotto','gin-est-rampa-2-sotto'),'pilone':('pmvk7o45ss9','gin-est-pmvk7o45ss9'),
 'rampa-1':('gin-ovest-rampa-1','gin-est-rampa-1'),'base':('gin-ovest-base','gin-est-base'),'gradino-angolo':('gin-ovest-gradino-angolo','gin-est-gradino-angolo'),
 'pianerottolo':('gin-ovest-pianerottolo','gin-est-pianerottolo'),'cancello':('gin-ovest-cancello','gin-est-cancello'),'pensilina':('gin-ovest-pensilina','gin-est-pensilina'),
 'staccionata-rampa1':('pmvk7skt3lh','gin-est-pmvk7skt3lh'),'staccionata-pianerottolo':('gin-ovest-staccionata-pianerottolo','gin-est-staccionata-pianerottolo'),'staccionata-testata':('gin-ovest-staccionata-testata','gin-est-staccionata-testata')}
RIMOSSI=['gin-ovest-pianerottolo-dentro','gin-est-pianerottolo-dentro','gin-ovest-pilone','gin-est-pilone','gin-ovest-staccionata-corsia','gin-est-staccionata-corsia']
out={}
for k,(w,e) in IDS.items(): out[w]=west[k]; out[e]=mirror(west[k])
# balconata: 4 colonne ai bordi (scansione: interasse ~3,4 m), balaustre e porte nelle 3 campate
cols=[-99.65,-94.95,-90.55,-85.85]  # disegno dell'utente sull'alzato: esterne a ±4,5 m, interne a ±1,4 m dall'asse
for i,a in enumerate(cols,1):
    b,ang=piece(36.4,37.3,a-0.89/36.85/rad/2,a+0.89/36.85/rad/2,Q,None); out[f'gin-pilone-{i}']=dict(box=b,angolo=ang)
for i in range(3):
    a=(cols[i]+cols[i+1])/2; half=(cols[i+1]-cols[i])/2-0.89/37.15/rad/2
    b,ang=piece(37.0,37.3,a-half,a+half,Q,Q+1.0); out[f'gin-balaustra-{i+1}']=dict(box=b,angolo=ang)
    b,ang=piece(33.35,33.43,a-1.66/33.39/rad/2,a+1.66/33.39/rad/2,Q,Q+2.78); out[f'gin-porta-{i+1}']=dict(box=b,angolo=ang)
json.dump({'pezzi':out,'rimossi':RIMOSSI},open('stair_out.json','w'),indent=1)
for k,v in out.items(): print(k, v.get('box') or ('poly',len(v['poligono'])), v.get('angolo'))
# cancellata sul bordo esterno del pianerottolo (scansione: grata alta ~2,4 m sopra il pianerottolo, su entrambi i lati)
b,a=thin(37.25,-110.0,-114.3,LAND,LAND+2.4); cw=dict(forma='oggetto',modello='cancelloScala',ruota=0,angolo=a,box=b)
json.dump({'cancellata-arco':cw,'cancellata-arco-est':mirror(cw)},open('cancellata_out.json','w'))
