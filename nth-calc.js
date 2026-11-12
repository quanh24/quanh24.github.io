// Bộ tính cho nth.html — hàm thuần, không đụng DOM (chạy thử được bằng node).
// Cần nth-data.js nạp trước.
//
// DPS / Tank: công thức PvP của Hel (nth/congthuc-hel.txt). Theo kiểu "bảng chỉ số trước / sau":
// cộng các dòng nội công vào bảng chỉ số rồi tính lại sát thương kỳ vọng (công) và máu hiệu dụng (thủ).
// Tố Vấn: chấm điểm theo bảng Aki.

const NTH_CALC=(()=>{
  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0;};
  const clamp01=x=>Math.max(0,Math.min(1,x));
  const sv=(s,f)=>typeof f==='string'?n(s[f]):n(f); // hệ số: số, hoặc khóa trong cài đặt

  // Tỉ lệ chí mạng (0–1) với chí mạng còn lại C.
  function critChance(C,s){
    const min=n(s.critMin)/100;
    const p=C+n(s.critC)<=0?min:Math.max((n(s.critA)*C+n(s.critB))/(C+n(s.critC))/100,min);
    return clamp01(p+n(s.critThem)/100);
  }
  // Tỉ lệ chính xác (không bị đỡ đòn) với chính xác còn lại X.
  function hitChance(X,s){
    return X+n(s.hitC)<=0?0:clamp01(n(s.hitBase)+n(s.hitA)*X/(X+n(s.hitC)));
  }
  // Khiên khí còn lại sau phá khiên.
  function shieldLeft(KK,PK){
    if(KK<=0||PK>=KK) return 0;
    return PK*3>=KK?0.5*(KK-PK):KK-2*PK;
  }

  // Sát thương kỳ vọng của att đánh def bằng loại 'ngoai' | 'noi' (công thức Hel, tương đối).
  function expectedDamage(att,def,type,s,detail){
    const noi=type==='noi';
    const F=Math.max(n(noi?def.noiThu:def.ngoaiThu)-n(att.phaPhong),0);
    const rDef=F/(F+n(s.kDef));
    const KK=n(def.khienKhi)+n(noi?def.khienNoi:def.khienNgoai);
    const shield=shieldLeft(KK,n(att.phaKhien));
    const E=Math.max(n(def.khangNgTo)-n(att.xuyenKhang),0);
    const rElem=E/(E+n(s.kElem));
    const atkEff=Math.max(n(att.cong)-shield+n(att.khacPhai)-n(def.khangPhai),0);
    const dCong=(n(s.k1)+n(s.k2)*atkEff)*(1-rDef);
    const dElem=n(s.k2)*n(att.nguyenTo)*(1-rElem);
    const mult=Math.max(0,1+(n(att.pKhacPhai)-n(def.pKhangPhai))/100)*Math.max(0,1-n(def.giamST)/100);
    const D=(dCong+dElem)*mult;
    const hit=hitChance(n(att.chinhXac)-n(noi?def.doDonNoi:def.doDonNgoai),s);
    const pCrit=critChance(n(att.chiMang)-n(noi?def.khangCMNoi:def.khangCMNgoai),s);
    const critBonus=Math.max(n(att.stcm)/100-1-n(def.giamSTCM)/100,0);
    const total=D*hit*(1+critBonus*pCrit)+n(s.blockDmg)*D*(1-hit);
    if(detail) Object.assign(detail,{rDef,rElem,pCrit,hit,shield,atkEff,critBonus,dCong,dElem,mult,D,total});
    return total;
  }

  function opponent(base,s){
    return s.oppMode==='custom'?{...base,...s.opp}:base;
  }
  // Sát thương tôi gây ra cho đối thủ.
  const offense=(p,opp,s)=>expectedDamage(p,opp,s.myType,s);
  // Máu hiệu dụng của tôi trước đối thủ (trộn đối thủ ngoại/nội công theo oppNoiRatio).
  function ehp(p,opp,s){
    const r=clamp01(n(s.oppNoiRatio));
    const taken=(1-r)*expectedDamage(opp,p,'ngoai',s)+r*expectedDamage(opp,p,'noi',s);
    return taken>0?n(p.hp)/taken:0;
  }

  // Tỉ lệ gặp phái i: đã biết class đối thủ → 100% phái đó; chưa biết → theo bảng tỉ lệ.
  function schoolShare(s,i){
    if(s.oppMode==='custom'&&s.oppCls){
      const c=NTH_CLASSES[i]; return c&&c.id===s.oppCls?1:0;
    }
    const arr=s.schoolShare||[]; const sum=arr.reduce((a,b)=>a+Math.max(0,n(b)),0);
    return sum>0?Math.max(0,n(arr[i]))/sum:0;
  }

  // Nội tại lớn đang có: của class mình + nội tại lớn chọn thêm.
  function passives(s){
    return [...new Set([s.cls,s.bigPassive].filter(Boolean))].map(id=>NTH_PASSIVES[id]).filter(Boolean);
  }
  // Thuộc tính chính: Sức Mạnh (ngoại công) / Khí Hải (nội công).
  const mainAttr=s=>s.myType==='noi'?'khiHai':'sucManh';
  // 1 điểm thuộc tính cơ bản → {chỉ số: lượng}.
  function convertBasic(attr,s){
    const out={}, add=(k,v)=>{out[k]=(out[k]||0)+v;};
    const isMain=attr===mainAttr(s);
    const base=isMain?NTH_BASE_CONV.main:NTH_BASE_CONV[attr];
    if(base) for(const k in base) add(k,sv(s,base[k]));
    for(const p of passives(s)){
      const c=isMain&&p.main?p.main:p[attr];
      if(c) for(const k in c) add(k,sv(s,c[k]));
    }
    return out;
  }

  // Cộng (sign=1) hoặc trừ (sign=-1) các dòng vào bảng chỉ số.
  function applyStats(panel,lines,sign,s){
    const p={...panel};
    const add=(k,v)=>{p[k]=n(p[k])+sign*v;};
    for(const ln of lines||[]){
      const t=NTH_LINES[ln.id], v=n(ln.v); if(!t||!v) continue;
      if(t.stat) for(const k in t.stat){
        const f=t.stat[k]==='share'?schoolShare(s,t.school):sv(s,t.stat[k]);
        add(k,f*v);
      }
      if(t.basic) for(const a of t.basic){
        add(a,v);
        const c=convertBasic(a,s); for(const k in c) add(k,c[k]*v);
      }
    }
    return p;
  }

  // Phần chưa có công thức → {off, def} dạng tỉ lệ (0.01 = 1%).
  // Căn Cốt / Sức Bền: phần thủ theo bảng Aki (quy đổi qua HP). Linh Vận: % sát thương ước lượng.
  function akiPart(ln,s,defCal){
    const t=NTH_LINES[ln.id], v=n(ln.v); let off=0, def=0;
    if(!t) return {off,def};
    if(t.basic) for(const a of t.basic) def+=n(s.akiDef[a])*v*defCal;
    if(t.rare) off+=n(s.linhVanPct)/100*v;
    return {off,def};
  }

  // Mốc: sát thương / máu hiệu dụng tại bảng chỉ số base; defCal: 1 đơn vị thủ Aki = bao nhiêu (tỉ lệ) máu hiệu dụng.
  function calibrate(base,opp,s){
    const o0=offense(base,opp,s), e0=ehp(base,opp,s);
    if(!(o0>0)||!(e0>0)) return null;
    const dHp=1000;
    const defPerHp=(ehp({...base,hp:n(base.hp)+dHp},opp,s)/e0-1)/dHp;
    return {o0,e0,defCal:n(s.akiDef.hp)>0?defPerHp/n(s.akiDef.hp):0};
  }

  // Đánh giá một viên trên bảng chỉ số base (đã tháo viên đang đeo).
  function evaluateStone(base,lines,s,cal,opp){
    lines=(lines||[]).filter(l=>l&&l.id&&n(l.v)!==0);
    const p=applyStats(base,lines,1,s);
    let off=offense(p,opp,s)/cal.o0-1, def=ehp(p,opp,s)/cal.e0-1;
    const W=n(s.offWeight??1), Wd=n(s.defWeight);
    const per=lines.map(ln=>{
      const t=NTH_LINES[ln.id];
      const q=applyStats(base,[ln],1,s);
      let o=offense(q,opp,s)/cal.o0-1, d=ehp(q,opp,s)/cal.e0-1;
      const a=akiPart(ln,s,cal.defCal);
      o+=a.off; d+=a.def; off+=a.off; def+=a.def;
      return {id:ln.id,v:n(ln.v),off:o,def:d,total:W*o+Wd*d,quality:t&&t.max?n(ln.v)/t.max:null};
    });
    return {off,def,total:W*off+Wd*def,per};
  }

  // Tố Vấn: điểm theo bảng Aki. off = điểm trị liệu, def = điểm phòng ngự (đơn vị "điểm", không phải %).
  // Căn Cốt / Sức Bền có điểm trị liệu khi có nội tại lớn Huyết Hà / Cửu Linh.
  function healerStone(lines,s){
    lines=(lines||[]).filter(l=>l&&l.id&&n(l.v)!==0);
    const H=s.akiHeal, D=s.akiHealDef, has=id=>s.cls===id||s.bigPassive===id;
    const healOf=a=>a==='canCot'?(has('huyetHa')?n(H.canCot):0):a==='sucBen'?(has('cuuLinh')?n(H.sucBen):0):n(H[a]);
    let off=0, def=0;
    const per=lines.map(ln=>{
      const t=NTH_LINES[ln.id], v=n(ln.v); let o=0, d=0;
      if(t){
        const [hk,dk]=NTH_HEAL_MAP[ln.id]||[];
        const share=t.school!=null?schoolShare(s,t.school):1;
        if(hk) o+=n(H[hk])*v*share;
        if(dk) d+=n(D[dk])*v*share;
        if(t.basic) for(const a of t.basic){o+=healOf(a)*v; d+=n(D[a])*v;}
        if(t.rare) o+=n(s.linhVanHeal)*v;
      }
      off+=o; def+=d;
      return {id:ln.id,v,off:o,def:d,total:n(s.offWeight)*o+n(s.defWeight)*d,quality:t&&t.max?v/t.max:null};
    });
    return {off,def,total:n(s.offWeight)*off+n(s.defWeight)*def,per};
  }

  // So sánh 2 viên A, B với viên đang đeo sẽ bị thay ra (oldLines).
  // Chỉ số trên màn hình đã gồm viên cũ → trừ nó ra làm mốc, rồi chấm trên cùng mốc.
  function compare(panel,stoneA,stoneB,oldLines,s){
    if(s.role==='healer')
      return {healer:true,A:healerStone(stoneA,s),B:healerStone(stoneB,s),old:healerStone(oldLines,s)};
    const base=applyStats(panel,(oldLines||[]).filter(l=>l&&l.id),-1,s);
    const opp=opponent(base,s);
    const cal=calibrate(base,opp,s);
    if(!cal) return null;
    const detail={}; expectedDamage(base,opp,s.myType,s,detail);
    return {base,cal,detail,
      A:evaluateStone(base,stoneA,s,cal,opp),B:evaluateStone(base,stoneB,s,cal,opp),
      old:evaluateStone(base,oldLines,s,cal,opp)};
  }

  // ---- Đọc chữ OCR của màn hình chỉ số → {key: số} ----
  // Hai màn hình: "Nhân Vật" (tab PVP, có Ngoại/Nội Thủ riêng) và "Xem chi tiết" (Phá Khiên, Khiên Khí, % ...).
  const norm=t=>t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[đĐ]/g,'d').toLowerCase();
  // Thứ tự quan trọng: nhãn dài/cụ thể đứng trước. Khóa bắt đầu bằng '_' là nhãn bỏ qua (chỉ để ngắt đoạn).
  const LABELS=[
    ['stcm',        /sat\s*thuong\s*chi\s*m[ao]ng/],
    ['giamSTCM',    /giam\s*(?:st|sat\s*thuong)\s*chi\s*m[ao]ng/],
    ['giamST',      /giam\s*sat\s*thuong/],
    ['khangCM',     /khang\s*chi\s*m[ao]ng(?:\s*(ngoai|noi))?/],
    ['doDon',       /[dbđ]o\s*[dbđ]on(?:\s*(ngoai|noi))?/],
    ['doDonChung',  /\b[dbđ]o\b(?=\s*\d)/],                  // "Đỡ 1169" (màn hình chi tiết)
    ['khangNgTo',   /khang\s*ng(?:uyen)?[\s.,]*to/],
    ['khangPhai',   /khang\s*(?:luu\s*)?phai/],
    ['_khangQV',    /khang\s*quai\s*vat/],
    ['khacBoss',    /kh[ao]c\s*(?:boss|che\s*quai\s*vat)/],
    ['khacPhai',    /kh[ao]c\s*phai/],
    ['ngoaiThu',    /ngoai\s*thu/],
    ['noiThu',      /noi\s*thu/],
    ['phongThu',    /phong\s*thu/],
    ['cong',        /(?:ngoai|noi)\s*cong/],
    ['tanCong',     /tan\s*cong/],
    ['phaPhong',    /pha\s*phong/],
    ['phaKhien',    /pha\s*khien/],
    ['khienKhi',    /khien\s*khi/],
    ['xuyenKhang',  /xuyen\s*khang(?:\s*nguyen\s*to)?/],
    ['nguyenTo',    /nguyen\s*to/],
    ['chinhXac',    /chinh\s*xac/],
    ['chiMang',     /chi\s*m[ao]ng/],
    ['_khongChe',   /(?:tang\s*cuong|khang)\s*khong\s*che|toc\s*do\s*di\s*chuyen|khinh\s*cong|may\s*man/],
    ['sucManh',     /suc\s*m[ao]nh/],
    ['khiHai',      /khi\s*hai/],
    ['canCot',      /c[ao]n\s*cot/],
    ['thanPhap',    /than\s*phap/],
    ['sucBen',      /suc\s*ben/],
    ['hp',          /\bhp\b/],
  ];
  const ANY=new RegExp(LABELS.map(([,r])=>'('+r.source.replace(/\((?!\?)/g,'(?:')+')').join('|'),'g');
  // Kết quả: {key: số}, kèm thuộc tính ẩn _type ('ngoai'|'noi'), _screen ('basic'|'detail'),
  // _weak (các ô ở màn hình chi tiết là trung bình ngoại/nội — không ghi đè số đọc từ màn hình Nhân Vật).
  function parsePanelText(text){
    let t=norm(text||'')
      .replace(/(\d)[\s]*[il|!](?=[\d\s/]|$)/g,'$11').replace(/(^|[\s/])[il|!](?=\d)/g,'$11')
      .replace(/(\d)[.,](?=\d{3}\b)/g,'$1');
    const isDetail=/pha\s*khien|khien\s*khi|sat\s*thuong\s*chi\s*m[ao]ng|khang\s*luu\s*phai/.test(t);
    const hits=[]; let m;
    ANY.lastIndex=0;
    while((m=ANY.exec(t))){
      const gi=m.slice(1).findIndex(x=>x!==undefined);
      hits.push({key:LABELS[gi][0],start:m.index,end:m.index+m[0].length,txt:m[0]});
    }
    const out={}, weak=new Set(), cnt={khangCM:0,doDon:0};
    const set=(k,v,isWeak)=>{if(out[k]==null){out[k]=v; if(isWeak) weak.add(k);}};
    hits.forEach((h,i)=>{
      if(h.key[0]==='_') return;
      const seg=t.slice(h.end,i+1<hits.length?hits[i+1].start:t.length);
      if(['stcm','giamSTCM','giamST'].includes(h.key)){
        const pm=seg.match(/^[^\d\n]{0,8}(\d+(?:[.,]\d+)?)\s*%?/); if(pm) set(h.key,Number(pm[1].replace(',','.')));
        return;
      }
      if(h.key==='khacPhai'||h.key==='khangPhai'){ // "674" hoặc "674/15.8%"
        const pm=seg.match(/^[^\d\n]{0,8}(\d+)\s*(?:\/\s*(\d+(?:[.,]\d+)?)\s*%?)?/); if(!pm) return;
        set(h.key,Number(pm[1]));
        if(pm[2]!=null) set(h.key==='khacPhai'?'pKhacPhai':'pKhangPhai',Number(pm[2].replace(',','.')));
        return;
      }
      if(h.key==='tanCong'){ // "8978-11388" → trung bình
        const pm=seg.match(/^[^\d\n]{0,8}(\d+)\s*[-–—~]\s*(\d+)/)||seg.match(/^[^\d\n]{0,8}(\d+)/); if(!pm) return;
        set('cong',pm[2]?Math.round((Number(pm[1])+Number(pm[2]))/2):Number(pm[1]));
        return;
      }
      // Số phải nằm cùng dòng, ngay sau nhãn (tránh tiêu đề cột "Phòng Thủ" lấy nhầm số ở dòng dưới).
      const num=seg.match(/^[^\d\n]{0,8}(\d+)\s*(?:\/\s*(\d+))?/);
      if(!num) return;
      const val=Number(h.key==='hp'&&num[2]?num[2]:num[1]); // HP "hiện tại/tối đa" → lấy tối đa
      if(h.key==='phongThu'){ if(isDetail){set('ngoaiThu',val,true);set('noiThu',val,true);} return; }
      if(h.key==='doDonChung'){ set('doDonNgoai',val,true); set('doDonNoi',val,true); return; }
      if(h.key==='khangCM'||h.key==='doDon'){
        const suf=(h.txt.match(/(ngoai|noi)$/)||[])[1];
        if(isDetail&&!suf&&h.key==='khangCM'){ set('khangCMNgoai',val,true); set('khangCMNoi',val,true); return; }
        const side=suf||(cnt[h.key]++===0?'ngoai':'noi');
        set(h.key==='khangCM'?(side==='noi'?'khangCMNoi':'khangCMNgoai'):(side==='noi'?'doDonNoi':'doDonNgoai'),val);
        return;
      }
      if(out[h.key]==null&&h.key==='cong') Object.defineProperty(out,'_type',{value:h.txt.startsWith('noi')?'noi':'ngoai',enumerable:false});
      set(h.key,val);
    });
    Object.defineProperty(out,'_screen',{value:isDetail?'detail':'basic',enumerable:false});
    Object.defineProperty(out,'_weak',{value:weak,enumerable:false});
    return out;
  }

  // ---- Đọc chữ OCR của danh sách "Tên dòng +số" (bảng Tăng Cường Thuộc Tính / một viên) ----
  const key=s=>norm(s).replace(/[<>‹›«»()]/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
  let LINE_KEYS=null;
  function lineKeys(){
    if(LINE_KEYS) return LINE_KEYS;
    LINE_KEYS=[];
    for(const id in NTH_LINES){
      LINE_KEYS.push([key(NTH_LINES[id].name),id]);
      (NTH_LINE_ALIASES[id]||[]).forEach(a=>LINE_KEYS.push([key(a),id]));
    }
    LINE_KEYS.sort((a,b)=>b[0].length-a[0].length);
    return LINE_KEYS;
  }
  // Tìm loại dòng theo tên (đã bỏ dấu). Khớp cụm dài nhất nằm trong tên.
  function matchLine(name){
    let k=' '+key(name).replace(/\bb([oơ]) d/g,'d$1 d')+' ';
    for(const [lk,id] of lineKeys()) if(k.includes(' '+lk+' ')) return id;
    return null;
  }
  function parseLinesText(text){
    const t=norm(text||'').replace(/\r/g,'')
      .replace(/\+\s*[il|!](?![a-z0-9])/g,'+1')     // "+ l" / "+ |" → "+1" (số 1 lẻ hay bị đọc nhầm)
      .replace(/(\+\s*\d[\d.,]*)/g,'$1\n');
    const lines=[], unknown=[]; let m;
    const re=/([^\n+]*?)\+\s*(\d[\d.,]*)/g;
    while((m=re.exec(t))){
      const name=m[1].trim(), v=Number(m[2].replace(/[.,]/g,''));
      if(!name||!v) continue;
      const id=matchLine(name);
      if(id) lines.push({id,v}); else unknown.push(name.replace(/\s+/g,' ').slice(-40));
    }
    // Dòng Linh Vận có thấy chữ "Đặc Tính" nhưng mất số → mặc định +1.
    // Chỉ xét phần dưới tiêu đề "Tăng Cường Thuộc Tính" (phần mô tả hiệu ứng phía trên có thể có chữ "đặc tính").
    const hd=t.search(/tang\s*cuong\s*thuoc\s*tinh/);
    const body=hd>=0?t.slice(hd+10):t;
    if(!lines.some(l=>l.id==='linhVan')&&/\blv\.?\s*dac\s*tinh\b/.test(body))
      lines.push({id:'linhVan',v:1});
    return {lines,unknown};
  }

  // Cộng dồn danh sách dòng theo loại: {id: tổng}.
  function sumLines(lines){
    const o={};
    for(const l of lines||[]) if(l&&l.id&&n(l.v)) o[l.id]=(o[l.id]||0)+n(l.v);
    return o;
  }
  // Bảng Tăng Cường Thuộc Tính: hiện tại (tổng các viên đang đeo) và sau khi thay viên cũ bằng A / B.
  function enhanceTable(current,stoneA,stoneB,oldLines){
    const cur=sumLines(current), a=sumLines(stoneA), b=sumLines(stoneB), old=sumLines(oldLines);
    const ids=[...new Set([...Object.keys(cur),...Object.keys(a),...Object.keys(b)])]
      .sort((x,y)=>(NTH_LINES[x]?.order??1e9)-(NTH_LINES[y]?.order??1e9));
    return ids.map(id=>{
      const c=cur[id]||0, base=c-(old[id]||0);
      return {id,cur:c,A:base+(a[id]||0),B:base+(b[id]||0)};
    });
  }
  // Tên viên trong ảnh chụp chi tiết. Hai kiểu đã gặp:
  //   "Côn Ngô Đoạn Ngọc (+25)  Trang bị"  — tên kèm cấp cường hóa
  //   "Nhật Nguyệt Lưỡng Nghi" / "Lv. 25  Điểm 3109" / "Đã trang bị"
  // Cách làm: xét các dòng phía trên tiêu đề "Tăng Cường Thuộc Tính", bỏ dòng giao diện (Lv, Điểm,
  // Trang bị…) và dòng là thuộc tính, lấy dòng đầu tiên trông giống tên (≥2 chữ, gần như toàn chữ cái).
  //   "Đoạn Kim Qua (+25) 🔒  Trang bị B" / dòng mô tả "Trăng soi bóng giáo vàng, gió dữ bẻ cành đồng."
  const UI_WORDS=/\b(lv|diem|trang bi|da trang|chua trang|cach nhan|tang cuong|thuoc tinh|cap|level|dac tinh|hieu ung|ky nang|noi cong)\b/;
  function cleanName(s){
    s=s.replace(/\s*[(\[{]?\s*[+＋]?\s*\d.*$/,'')      // tên không có số: cắt từ "+25" / "(+25)" / "(25)" / "425" trở đi
       .replace(/\s+(?:đã\s+)?trang(?:\s*b\S*)?\s*$/i,''); // cắt chữ "Trang bị" (hoặc "Trang" lẻ) dính cuối dòng
    let w=s.split(/\s+/).filter(Boolean);
    const junk=t=>!/\p{L}{2,}/u.test(t);                // ký tự lẻ do biểu tượng
    while(w.length&&junk(w[0])) w.shift();
    while(w.length&&junk(w[w.length-1])) w.pop();
    return w.join(' ').replace(/^[^\p{L}]+|[^\p{L}]+$/gu,'');
  }
  function parseStoneName(text){
    const lines=(text||'').split(/\n/).map(s=>s.trim()).filter(Boolean);
    let end=lines.findIndex(l=>/tang\s*cuong\s*thuoc/.test(norm(l)));
    if(end<0) end=lines.findIndex(l=>/\+\s*\d/.test(l)&&matchLine(l.replace(/\+.*$/,'')));
    if(end<0) end=lines.length;
    for(const raw of lines.slice(0,end)){
      const s=cleanName(raw), k=norm(s);
      if(UI_WORDS.test(k)||matchLine(s)) continue;
      if(/[,.;:!?%]/.test(s)||s.split(/\s+/).length>6) continue; // dòng mô tả / câu văn, không phải tên
      const letters=(s.match(/\p{L}/gu)||[]).length, chars=s.replace(/\s/g,'').length;
      if(s.split(/\s+/).length>=2&&letters>=4&&letters/chars>=0.85&&s.length<=40) return s;
    }
    return '';
  }

  // ---- Nhận diện icon class (cạnh tên nhân vật) bằng so khớp mẫu ----
  // win: {data:RGBA, w, h} — vùng ảnh chụp đã thu nhỏ sao cho icon ≈ t×t px.
  // tmpls: [{id, data:RGBA t×t, t}] — icon class đã thu nhỏ về t×t (có kênh alpha).
  // Điểm = độ lệch màu trên phần hình của icon − 0.3 × độ khác biệt giữa icon và nền xung quanh. Càng nhỏ càng khớp.
  function iconScores(win,tmpls){
    const out=[];
    for(const tp of tmpls){
      const t=tp.t, on=[], off=[]; let mr=0,mg=0,mb=0;
      for(let y=0;y<t;y++) for(let x=0;x<t;x++){
        const i=(y*t+x)*4, a=tp.data[i+3]/255;
        if(a>0.6){mr+=tp.data[i];mg+=tp.data[i+1];mb+=tp.data[i+2]; if((x+y)%2===0) on.push([x,y,tp.data[i],tp.data[i+1],tp.data[i+2]]);}
        else if(a<0.05&&(x+y)%3===0) off.push([x,y]);
      }
      if(!on.length) continue;
      const nOn=on.length*2; mr/=nOn; mg/=nOn; mb/=nOn;
      let best={id:tp.id,score:Infinity,x:0,y:0};
      for(let oy=0;oy+t<=win.h;oy++) for(let ox=0;ox+t<=win.w;ox++){
        let dOn=0;
        for(const [x,y,r,g,b] of on){
          const i=((oy+y)*win.w+ox+x)*4;
          dOn+=Math.abs(win.data[i]-r)+Math.abs(win.data[i+1]-g)+Math.abs(win.data[i+2]-b);
        }
        dOn/=on.length*765;
        if(dOn-0.3>=best.score) continue;
        let dOff=0;
        for(const [x,y] of off){
          const i=((oy+y)*win.w+ox+x)*4;
          dOff+=Math.abs(win.data[i]-mr)+Math.abs(win.data[i+1]-mg)+Math.abs(win.data[i+2]-mb);
        }
        dOff/=Math.max(1,off.length)*765;
        const sc=dOn-0.3*dOff;
        if(sc<best.score) best={id:tp.id,score:sc,x:ox,y:oy};
      }
      out.push(best);
    }
    return out.sort((a,b)=>a.score-b.score);
  }

  return {critChance,hitChance,shieldLeft,expectedDamage,convertBasic,applyStats,akiPart,calibrate,evaluateStone,compare,parsePanelText,iconScores,
    matchLine,parseLinesText,parseStoneName,sumLines,enhanceTable};
})();

if(typeof module!=='undefined') module.exports=NTH_CALC;
