import json, math, numpy as np, cv2
D='/tmp/claude-0/-home-claude/436a9eb2-c5ea-5361-a879-62b3b13837b8/scratchpad/'
img=cv2.imread(D+'campus/campus-agea-2020.png')
H,W=img.shape[:2]
PB=dict(west=12.505,south=41.898,east=12.519,north=41.906)
px=lambda lon,lat:((lon-PB['west'])/(PB['east']-PB['west'])*W,(PB['north']-lat)/(PB['north']-PB['south'])*H)
inv=lambda x,y:(PB['west']+x/W*(PB['east']-PB['west']),PB['north']-y/H*(PB['north']-PB['south']))
bld={f['code']:f for f in json.load(open(D+'campus/campus-buildings.json'))['features']}
courts=json.load(open(D+'campus/courtyards.json'))['courtyards']
focus=['CU014','CU006','CU016','CU018','CU019','CU034','CU035','CU036']
gray=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
res={}
vis=img.copy()
for code in focus:
    f=bld[code]; ring=np.array([px(*p) for p in f['rings'][0]],np.int32)
    m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[ring],255)
    # già scavati
    ex=np.zeros((H,W),np.uint8)
    for r in courts.get(code,[]): cv2.fillPoly(ex,[np.array([px(*p) for p in r],np.int32)],255)
    inside=cv2.erode(m,np.ones((3,3),np.uint8))
    dark=((gray<95)&(inside>0)).astype(np.uint8)*255
    dark=cv2.morphologyEx(dark,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    dark=cv2.morphologyEx(dark,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    n,lab,stats,cent=cv2.connectedComponentsWithStats(dark)
    print(code,'footprint px area',int(m.sum()/255),'existing rings',len(courts.get(code,[])))
    cv2.polylines(vis,[ring],True,(0,255,255),1)
    for r in courts.get(code,[]): cv2.polylines(vis,[np.array([px(*p) for p in r],np.int32)],True,(0,255,0),1)
    for i in range(1,n):
        a=stats[i,cv2.CC_STAT_AREA]
        if a<60: continue
        comp=(lab==i).astype(np.uint8)*255
        cov=(cv2.bitwise_and(comp,ex)>0).sum()/max(1,(comp>0).sum())
        cnts,_=cv2.findContours(comp,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
        rect=cv2.minAreaRect(max(cnts,key=cv2.contourArea)); box=cv2.boxPoints(rect)
        fill=(comp>0).sum()/max(1,rect[1][0]*rect[1][1])
        print('  comp',i,'area',a,'covered_by_existing',round(cov,2),'rect',[round(v,1) for v in rect[0]],[round(v,1) for v in rect[1]],'angle',round(rect[2],1),'fill',round(fill,2))
        col=(0,0,255) if cov<0.5 else (255,0,0)
        cv2.polylines(vis,[box.astype(np.int32)],True,col,1)
        res.setdefault(code,[]).append(dict(i=i,area=int(a),cov=float(cov),fill=float(fill),box=[list(inv(*p)) for p in box]))
# ritaglio ingrandito attorno a Chimica
x0,y0=px(12.5133,41.9024); x1,y1=px(12.5148,41.9013)
crop=vis[int(y0):int(y1),int(x0):int(x1)]
crop=cv2.resize(crop,None,fx=4,fy=4,interpolation=cv2.INTER_NEAREST)
cv2.imwrite(D+'shots/detect_crop.png',crop)
json.dump(res,open(D+'work/detect.json','w'))
print(crop.shape)
