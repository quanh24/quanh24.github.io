// Bộ tính cho nth.html — hàm thuần, không đụng DOM (chạy thử được bằng node).
// Cần nth-data.js nạp trước.
//
// Ý tưởng: "bảng chỉ số trước / sau" giống nshmac.com.
//  - Dòng cộng thẳng vào chỉ số có công thức (Công, Phá Phòng, Nguyên Tố, Xuyên Kháng, Chí Mạng,
//    Phòng Thủ, Kháng Ng.Tố, Kháng Chí Mạng, HP) → tính lại sát thương kỳ vọng / máu hiệu dụng.
//  - Dòng chưa có công thức → trọng số Aki, quy đổi ra % bằng cách so với dòng Tấn Công (công)
//    và dòng HP (thủ) tính theo công thức trên chính bảng chỉ số của người dùng.

const NTH_CALC=(()=>{
  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0;};
  const clamp01=x=>Math.max(0,Math.min(1,x));

  // Tỉ lệ chí mạng từ chí mạng còn lại C (tailieu.txt mục 5).
  function critChance(C,s){
    if(C<=-s.critB/s.critA) return 0;
    return clamp01((s.critA*C+s.critB)/(C+s.critC));
  }

  // Sát thương kỳ vọng của att đánh def bằng loại 'ngoai' | 'noi'.
  function expectedDamage(att,def,type,s,detail){
    const K=n(s.skillK), B=n(s.skillB);
    const F=Math.max(0,n(type==='noi'?def.noiThu:def.ngoaiThu)-n(att.phaPhong));
    const rDef=F/(F+n(s.kDef));
    const dCong=(B+K*n(att.cong))*(1-rDef);
    const E=Math.max(0,n(def.khangNgTo)-n(att.xuyenKhang));
    const rElem=E/(E+n(s.kElem));
    const dElem=K*n(att.nguyenTo)*(1-rElem);
    const C=n(att.chiMang)-n(type==='noi'?def.khangCMNoi:def.khangCMNgoai);
    const pCrit=critChance(C,s);
    const critF=1+pCrit*(n(s.critMult)-1);
    const total=(dCong+dElem)*critF;
    if(detail) Object.assign(detail,{rDef,rElem,pCrit,dCong,dElem,critF,total});
    return total;
  }

  function opponent(base,s){
    return s.oppMode==='custom'?{...base,...s.opp}:base;
  }
  // Sát thương tôi gây ra cho đối thủ.
  const offense=(p,opp,s)=>expectedDamage(p,opp,s.myType,s);
  // Máu hiệu dụng của tôi trước đối thủ (trộn đối thủ ngoại/nội công).
  function ehp(p,opp,s){
    const r=clamp01(n(s.oppNoiRatio));
    const taken=(1-r)*expectedDamage(opp,p,'ngoai',s)+r*expectedDamage(opp,p,'noi',s);
    return taken>0?n(p.hp)/taken:0;
  }

  // Cộng (sign=1) hoặc trừ (sign=-1) phần "stat" của các dòng vào bảng chỉ số.
  function applyStats(panel,lines,sign){
    const p={...panel};
    for(const ln of lines||[]){
      const t=NTH_LINES[ln.id]; if(!t||!t.stat) continue;
      for(const k in t.stat) p[k]=n(p[k])+sign*t.stat[k]*n(ln.v);
    }
    return p;
  }

  function schoolShare(s,i){
    const arr=s.schoolShare||[]; const sum=arr.reduce((a,b)=>a+Math.max(0,n(b)),0);
    return sum>0?Math.max(0,n(arr[i]))/sum:0;
  }

  // Phần lợi ích tính bằng trọng số Aki của MỘT dòng → {off, def} dạng tỉ lệ (0.01 = 1%).
  function akiPart(ln,s,offCal,defCal){
    const t=NTH_LINES[ln.id], v=n(ln.v); let off=0, def=0;
    if(!t) return {off,def};
    const r=clamp01(n(s.oppNoiRatio));
    const side=t.side==='ngoai'?1-r:t.side==='noi'?r:1;
    if(t.off){
      let w=n(s.akiOff[t.off]); if(t.school!=null) w*=schoolShare(s,t.school);
      off+=w*v*offCal;
    }
    if(t.basic) for(const a of t.basic){off+=n(s.akiOff[a])*v*offCal; def+=n(s.akiDef[a])*v*defCal;}
    if(t.def) def+=n(s.akiDef[t.def])*v*defCal;
    if(t.mirror){ // giảm sát thương nhận vào ≈ giá trị công tương ứng của đối thủ
      let w=n(s.akiOff[t.mirror])*side; if(t.school!=null) w*=schoolShare(s,t.school);
      def+=w*v*offCal;
    }
    if(t.rare) off+=n(s.linhVanPct)/100*v;
    return {off,def};
  }

  // Hệ số quy đổi: 1 đơn vị Aki = bao nhiêu (tỉ lệ) sát thương / máu hiệu dụng, tại bảng chỉ số base.
  function calibrate(base,opp,s){
    const o0=offense(base,opp,s), e0=ehp(base,opp,s);
    if(!(o0>0)||!(e0>0)) return null;
    const dCong=100, dHp=1000;
    const offPerCong=(offense({...base,cong:n(base.cong)+dCong},opp,s)/o0-1)/dCong;
    const defPerHp=(ehp({...base,hp:n(base.hp)+dHp},opp,s)/e0-1)/dHp;
    return {o0,e0,
      offCal:n(s.akiOff.tanCong)>0?offPerCong/n(s.akiOff.tanCong):0,
      defCal:n(s.akiDef.hp)>0?defPerHp/n(s.akiDef.hp):0};
  }

  // Đánh giá một viên trên bảng chỉ số base (đã tháo viên đang đeo).
  function evaluateStone(base,lines,s,cal,opp){
    lines=(lines||[]).filter(l=>l&&l.id&&n(l.v)!==0);
    const p=applyStats(base,lines,1);
    let off=offense(p,opp,s)/cal.o0-1, def=ehp(p,opp,s)/cal.e0-1;
    const per=lines.map(ln=>{
      const t=NTH_LINES[ln.id]; let o=0,d=0;
      if(t&&t.stat){
        const q=applyStats(base,[ln],1);
        o+=offense(q,opp,s)/cal.o0-1; d+=ehp(q,opp,s)/cal.e0-1;
      }
      const a=akiPart(ln,s,cal.offCal,cal.defCal);
      o+=a.off; d+=a.def; off+=a.off; def+=a.def;
      const total=n(s.offWeight??1)*o+n(s.defWeight)*d;
      return {id:ln.id,v:n(ln.v),off:o,def:d,total,quality:t&&t.max?n(ln.v)/t.max:null};
    });
    return {off,def,total:n(s.offWeight??1)*off+n(s.defWeight)*def,per};
  }

  // Tố Vấn: điểm theo bảng Aki. off = điểm trị liệu, def = điểm phòng ngự (đơn vị "điểm", không phải %).
  function healerStone(lines,s){
    lines=(lines||[]).filter(l=>l&&l.id&&n(l.v)!==0);
    const H=s.akiHeal, D=s.akiHealDef;
    const healOf=a=>a==='canCot'?(s.noiTai==='huyetHa'?n(H.canCot):0):a==='sucBen'?(s.noiTai==='cuuLinh'?n(H.sucBen):0):n(H[a]);
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

  // So sánh 2 viên mới A, B với viên đang đeo sẽ bị thay ra (oldLines; [] = không thay viên nào).
  // Chỉ số trên màn hình đã gồm viên cũ → trừ nó ra làm mốc, rồi chấm cả 3 trên cùng mốc.
  function compare(panel,stoneA,stoneB,oldLines,s){
    if(s.role==='healer')
      return {healer:true,A:healerStone(stoneA,s),B:healerStone(stoneB,s),old:healerStone(oldLines,s)};
    const base=applyStats(panel,(oldLines||[]).filter(l=>l&&l.id),-1);
    const opp=opponent(base,s);
    const cal=calibrate(base,opp,s);
    if(!cal) return null;
    const detail={}; expectedDamage(base,opp,s.myType,s,detail);
    return {base,cal,detail,
      A:evaluateStone(base,stoneA,s,cal,opp),B:evaluateStone(base,stoneB,s,cal,opp),
      old:evaluateStone(base,oldLines,s,cal,opp)};
  }

  // ---- Đọc chữ OCR của màn hình chỉ số → {key: số} ----
  const norm=t=>t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[đĐ]/g,'d').toLowerCase();
  // Thứ tự quan trọng: nhãn dài/cụ thể đứng trước.
  const LABELS=[
    ['khangCM',     /khang\s*chi\s*m[ao]ng(?:\s*(ngoai|noi))?/],
    ['doDon',       /[dbđ]o\s*[dbđ]on(?:\s*(ngoai|noi))?/],
    ['khangNgTo',   /khang\s*ng(?:uyen)?[\s.,]*to/],
    ['khangPhai',   /khang\s*phai/],
    ['khacBoss',    /kh[ao]c\s*boss/],
    ['khacPhai',    /kh[ao]c\s*phai/],
    ['ngoaiThu',    /ngoai\s*thu/],
    ['noiThu',      /noi\s*thu/],
    ['cong',        /(?:ngoai|noi)\s*cong/],
    ['phaPhong',    /pha\s*phong/],
    ['xuyenKhang',  /xuyen\s*khang/],
    ['nguyenTo',    /nguyen\s*to/],
    ['chinhXac',    /chinh\s*xac/],
    ['chiMang',     /chi\s*m[ao]ng/],
    ['sucManh',     /suc\s*m[ao]nh/],
    ['khiHai',      /khi\s*hai/],
    ['canCot',      /can\s*cot/],
    ['thanPhap',    /than\s*phap/],
    ['sucBen',      /suc\s*ben/],
    ['hp',          /\bhp\b/],
  ];
  const ANY=new RegExp(LABELS.map(([,r])=>'('+r.source.replace(/\((?!\?)/g,'(?:')+')').join('|'),'g');
  function parsePanelText(text){
    let t=norm(text||'')
      .replace(/(\d)[\s]*[il|!](?=[\d\s/]|$)/g,'$11').replace(/(^|[\s/])[il|!](?=\d)/g,'$11')
      .replace(/(\d)[.,](?=\d{3}\b)/g,'$1');
    const hits=[]; let m;
    ANY.lastIndex=0;
    while((m=ANY.exec(t))){
      const gi=m.slice(1).findIndex(x=>x!==undefined);
      hits.push({key:LABELS[gi][0],re:LABELS[gi][1],start:m.index,end:m.index+m[0].length,txt:m[0]});
    }
    const out={}, cnt={khangCM:0,doDon:0};
    hits.forEach((h,i)=>{
      const seg=t.slice(h.end,i+1<hits.length?hits[i+1].start:t.length);
      const num=seg.match(/(\d[\d]*)\s*(?:\/\s*(\d+))?/);
      if(!num) return;
      const val=Number(num[2]||num[1]);
      let key=h.key;
      if(key==='khangCM'||key==='doDon'){
        const suf=(h.txt.match(/(ngoai|noi)$/)||[])[1];
        const side=suf||(cnt[key]++===0?'ngoai':'noi');
        key=key==='khangCM'?(side==='noi'?'khangCMNoi':'khangCMNgoai'):(side==='noi'?'doDonNoi':'doDonNgoai');
      }
      if(out[key]==null){
        out[key]=val;
        // Nhãn "Ngoại Công" / "Nội Công" cho biết kiểu sát thương của nhân vật trong ảnh.
        if(key==='cong') Object.defineProperty(out,'_type',{value:h.txt.startsWith('noi')?'noi':'ngoai',enumerable:false});
      }
    });
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

  return {critChance,expectedDamage,applyStats,akiPart,calibrate,evaluateStone,compare,parsePanelText,
    matchLine,parseLinesText,parseStoneName,sumLines,enhanceTable};
})();

if(typeof module!=='undefined') module.exports=NTH_CALC;
