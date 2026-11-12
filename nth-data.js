// Dữ liệu cho nth.html — so sánh nội công Nghịch Thủy Hàn Mobile (PvP).
// Nguồn:
//  - nth/congthuc-hel.txt: công thức sát thương PvP cấp 79 (bảng của Hel / Chiết Tự Vi An) — dùng cho build DPS và Tank.
//  - Bảng lợi ích của Aki (nth/loiichtrilieu.png, nth/loiichphongthu.png, bản 2.1) — dùng cho build Tố Vấn (trị liệu).
//  - Quy đổi nội tại lớn do người dùng cung cấp (12/11/2026).
// Mọi hệ số là ƯỚC LƯỢNG cộng đồng; sửa được trong "Cài đặt nâng cao" trên trang.

// 8 class. Thứ tự này cũng là thứ tự của dòng "Khắc Chế / Kháng <phái>" (id khac0…khac7, khang0…khang7).
//  type: kiểu sát thương ('ngoai' | 'noi'); role: build gợi ý khi chọn class.
const NTH_CLASSES=[
  {id:'toaiMong',  name:'Toái Mộng',  type:'ngoai', role:'dps'},
  {id:'longNgam',  name:'Long Ngâm',  type:'ngoai', role:'dps'},
  {id:'huyetHa',   name:'Huyết Hà',   type:'ngoai', role:'dps'},
  {id:'thietY',    name:'Thiết Y',    type:'ngoai', role:'tank'},
  {id:'thanTuong', name:'Thần Tương', type:'noi',   role:'dps'},
  {id:'huyenCo',   name:'Huyền Cơ',   type:'ngoai', role:'dps'},
  {id:'cuuLinh',   name:'Cửu Linh',   type:'noi',   role:'dps'},
  {id:'toVan',     name:'Tố Vấn',     type:'noi',   role:'healer'},
];
NTH_CLASSES.forEach(c=>c.icon='nth/image/'+c.id+'.webp');
const NTH_CLASS=Object.fromEntries(NTH_CLASSES.map(c=>[c.id,c]));
const NTH_SCHOOLS=NTH_CLASSES.map(c=>c.name);

// Nội tại lớn: 1 điểm thuộc tính cơ bản → chỉ số khác. "main" = Sức Mạnh (class ngoại công) / Khí Hải (class nội công).
// Giá trị dạng chữ là khóa trong cài đặt (vd. 'atkHuyetHa' = 1.4–1.9, mặc định 1.65).
// Class đang chơi luôn có nội tại lớn của mình; chọn thêm một nội tại lớn của class khác.
const NTH_PASSIVES={
  toaiMong:{thanPhap:{chiMang:0.6, doDonNgoai:0.33, doDonNoi:0.33}},
  huyetHa: {canCot:{cong:'atkHuyetHa'}},
  toVan:   {main:{khienKhi:2.5}},
  longNgam:{canCot:{phaPhong:2}},
  cuuLinh: {sucBen:{cong:'atkCuuLinh'}},
  thietY:  {sucBen:{hp:26.7}},
  thanTuong:{main:{chinhXac:0.83}},
  huyenCo: {},
};
// Quy đổi chung (bảng Hel): 1 Sức Mạnh/Khí Hải (thuộc tính chính) = 4.65 tấn công + 2 phá phòng;
// 1 Thân Pháp = 0.83 chính xác + 1.6 chí mạng. Căn Cốt, Sức Bền: phần thủ tính theo bảng Aki (xem akiDef).
const NTH_BASE_CONV={
  main:{cong:'convMainAtk', phaPhong:'convMainPP'},
  thanPhap:{chinhXac:'convThanCX', chiMang:'convThanCM'},
};

// Chỉ số nhân vật. "Cơ Bản/Công/Phòng Thủ" lấy từ màn hình Nhân Vật (tab PVP);
// "Chi tiết" lấy từ màn hình "Xem chi tiết". pct = nhập dạng %.
const NTH_PANEL=[
  {group:'Cơ Bản', fields:[
    {key:'hp',        label:'HP (tối đa)'},
    {key:'sucManh',   label:'Sức Mạnh'},
    {key:'khiHai',    label:'Khí Hải'},
    {key:'canCot',    label:'Căn Cốt'},
    {key:'thanPhap',  label:'Thân Pháp'},
    {key:'sucBen',    label:'Sức Bền'},
  ]},
  {group:'Công', fields:[
    {key:'cong',       label:'Ngoại/Nội Công'},
    {key:'phaPhong',   label:'Phá Phòng'},
    {key:'nguyenTo',   label:'Nguyên Tố'},
    {key:'xuyenKhang', label:'Xuyên Kháng'},
    {key:'chinhXac',   label:'Chính Xác'},
    {key:'chiMang',    label:'Chí Mạng'},
    {key:'khacBoss',   label:'Khắc Boss'},
    {key:'khacPhai',   label:'Khắc Phái'},
  ]},
  {group:'Phòng Thủ', fields:[
    {key:'ngoaiThu',     label:'Ngoại Thủ'},
    {key:'noiThu',       label:'Nội Thủ'},
    {key:'doDonNgoai',   label:'Đỡ Đòn Ngoại'},
    {key:'doDonNoi',     label:'Đỡ Đòn Nội'},
    {key:'khangCMNgoai', label:'Kháng Chí Mạng Ngoại'},
    {key:'khangCMNoi',   label:'Kháng Chí Mạng Nội'},
    {key:'khangNgTo',    label:'Kháng Ng.Tố'},
    {key:'khangPhai',    label:'Kháng Phái'},
  ]},
  {group:'Chi tiết', fields:[
    {key:'phaKhien',   label:'Phá Khiên'},
    {key:'khienKhi',   label:'Khiên Khí'},
    {key:'stcm',       label:'Sát Thương Chí Mạng %', pct:true},
    {key:'giamSTCM',   label:'Giảm ST Chí Mạng %',    pct:true},
    {key:'pKhacPhai',  label:'Khắc Phái %',           pct:true},
    {key:'pKhangPhai', label:'Kháng Lưu Phái %',      pct:true},
    {key:'giamST',     label:'Giảm Sát Thương %',     pct:true},
  ]},
];

// Ảnh mẫu nth/image/vi-du-chi-so-co-ban.png + vi-du-chi-so-chi-tiet.png (Huyền Cơ) — giá trị khởi tạo.
const NTH_SAMPLE_PANEL={
  hp:155717, sucManh:366, khiHai:80, canCot:248, thanPhap:213, sucBen:230,
  cong:10183, phaPhong:4299, nguyenTo:2795, xuyenKhang:401, chinhXac:1369, chiMang:2346, khacBoss:739, khacPhai:674,
  ngoaiThu:6427, noiThu:6367, doDonNgoai:1215, doDonNoi:1123, khangCMNgoai:905, khangCMNoi:1042, khangNgTo:1225, khangPhai:3911,
  phaKhien:902, khienKhi:2304, stcm:191.2, giamSTCM:0, pKhacPhai:15.8, pKhangPhai:19.4, giamST:3.6,
};

// Các loại dòng nội công.
//  max  : giá trị tối đa một dòng (bảng Aki / Hel; null = chưa rõ) — để chấm "độ đẹp" của dòng.
//  stat : dòng cộng vào chỉ số → tính bằng công thức Hel. Hệ số dạng chữ: khóa trong cài đặt,
//         riêng 'share' = tỉ lệ gặp phái đó (dòng theo phái).
//  basic: dòng thuộc tính cơ bản → quy đổi theo NTH_BASE_CONV + nội tại lớn.
//  low  : ưu tiên thấp, ẩn khỏi danh sách chọn cho tới khi bật "Hiện dòng theo phái".
const NTH_LINE_GROUPS=[
  {name:'Tấn công', lines:[
    {id:'tanCong',   name:'Tấn Công',            max:179, stat:{cong:1}},
    {id:'congLon',   name:'Tấn Công Tối Đa',     max:234, stat:{cong:0.5}},
    {id:'congNho',   name:'Tấn Công Tối Thiểu',  max:234, stat:{cong:0.5}},
    {id:'phaPhong',  name:'Phá Phòng',           max:262, stat:{phaPhong:1}},
    {id:'phaKhien',  name:'Phá Khiên',           max:139, stat:{phaKhien:1}},
    {id:'congNgTo',  name:'Công Nguyên Tố',      max:106, stat:{nguyenTo:1}},
    {id:'tatCaNgTo', name:'Tất Cả Nguyên Tố',    max:106, stat:{nguyenTo:1}},
    {id:'hoaCong',   name:'Hỏa Công',            max:88,  stat:{nguyenTo:'ngToRiengRatio'}},
    {id:'ngToBDT',   name:'Ng.Tố-Bạch Đế Thành', max:88,  stat:{nguyenTo:'ngToRiengRatio'}},
    {id:'ngToDVC',   name:'Ng.Tố-Dược Vương Cốc',max:88,  stat:{nguyenTo:'ngToRiengRatio'}},
    {id:'ngToRieng', name:'Ng.Tố hệ/phe khác',   max:88,  stat:{nguyenTo:'ngToRiengRatio'}},
    {id:'xuyenKhang',name:'Xuyên Kháng',         max:null,stat:{xuyenKhang:1}},
    {id:'chiMang',   name:'Chí Mạng',            max:91,  stat:{chiMang:1}},
    {id:'chinhXac',  name:'Chính Xác',           max:77,  stat:{chinhXac:1}},
    {id:'khacBoss',  name:'Khắc Chế Boss',       max:133, stat:{khacBoss:1}}, // không có tác dụng trong PvP
  ]},
  {name:'Thuộc tính cơ bản', lines:[
    {id:'nam',      name:'5 Thuộc Tính Cơ Bản', max:null, basic:['sucManh','khiHai','canCot','thanPhap','sucBen']},
    {id:'sucManh',  name:'Sức Mạnh',  max:29, basic:['sucManh']},
    {id:'khiHai',   name:'Khí Hải',   max:29, basic:['khiHai']},
    {id:'canCot',   name:'Căn Cốt',   max:29, basic:['canCot']},
    {id:'thanPhap', name:'Thân Pháp', max:29, basic:['thanPhap']},
    {id:'sucBen',   name:'Sức Bền',   max:29, basic:['sucBen']},
  ]},
  {name:'Phòng thủ', lines:[
    {id:'hp',          name:'Giới Hạn HP',          max:2766, stat:{hp:1}},
    {id:'phongThu',    name:'Phòng Thủ',            max:234,  stat:{ngoaiThu:1,noiThu:1}},
    {id:'ngoaiThu',    name:'Ngoại Thủ',            max:349,  stat:{ngoaiThu:1}},
    {id:'noiThu',      name:'Nội Thủ',              max:349,  stat:{noiThu:1}},
    {id:'khangNgTo',   name:'Kháng Nguyên Tố',      max:94,   stat:{khangNgTo:1}},
    {id:'khangTatCa',  name:'Kháng Tất Cả Ng.Tố',   max:94,   stat:{khangNgTo:1}},
    {id:'khangCM',     name:'Kháng Chí Mạng',       max:128,  stat:{khangCMNgoai:1,khangCMNoi:1}},
    {id:'khangCMNgoai',name:'Kháng Chí Mạng Ngoại', max:240,  stat:{khangCMNgoai:1}},
    {id:'khangCMNoi',  name:'Kháng Chí Mạng Nội',   max:240,  stat:{khangCMNoi:1}},
    {id:'khienKhi',    name:'Khiên Khí',            max:163,  stat:{khienKhi:1}},
    {id:'khienNgoai',  name:'Khiên Khí Ngoại Công', max:219,  stat:{khienNgoai:1}},
    {id:'khienNoi',    name:'Khiên Khí Nội Công',   max:219,  stat:{khienNoi:1}},
    {id:'doDon',       name:'Đỡ Đòn',               max:null, stat:{doDonNgoai:1,doDonNoi:1}},
    {id:'doDonNgoai',  name:'Đỡ Đòn Ngoại Công',    max:null, stat:{doDonNgoai:1}},
    {id:'doDonNoi',    name:'Đỡ Đòn Nội Công',      max:null, stat:{doDonNoi:1}},
  ]},
  {name:'Hiếm', lines:[
    {id:'linhVan', name:'<Linh Vận> Lv Đặc Tính', max:1, rare:true},
  ]},
  {name:'Theo phái (ưu tiên thấp)', low:true, lines:[
    ...NTH_SCHOOLS.map((s,i)=>({id:'khac'+i,  name:'Khắc Chế '+s, max:133, stat:{khacPhai:'share'}, school:i})),
    ...NTH_SCHOOLS.map((s,i)=>({id:'khang'+i, name:'Kháng '+s,    max:240, stat:{khangPhai:'share'}, school:i})),
  ]},
];

// Cách viết khác (ngoài tên chính) để đọc ảnh "Tăng Cường Thuộc Tính" bằng OCR.
const NTH_LINE_ALIASES={
  // chữ "<Linh Vận>" có quầng sáng cam, OCR hay đọc sai → nhận theo "Lv Đặc Tính"
  linhVan:['linh van','lv dac tinh','dac tinh'],
  khangTatCa:['khang tat ca nguyen to'], khangNgTo:['khang ng to'],
  doDonNgoai:['do don ngoai'], doDonNoi:['do don noi'], khienNgoai:['khien khi ngoai'], khienNoi:['khien khi noi'],
  tanCong:['tan cong'], canCot:['can cot'],
  congLon:['tan cong toi da','cong kich toi da','cong kich lon'], congNho:['tan cong toi thieu','cong kich toi thieu','cong kich nho'],
};

const NTH_LINES={};
NTH_LINE_GROUPS.forEach((g,gi)=>g.lines.forEach((l,li)=>{l.group=g.name; l.low=!!g.low; l.order=gi*100+li; NTH_LINES[l.id]=l;}));

// Build Tố Vấn (trị liệu) — chấm thẳng theo bảng Aki (đây vốn là bảng cho trị liệu PvP).
// Mỗi loại dòng → [khóa trị liệu trong akiHeal, khóa phòng ngự trong akiHealDef]. Thuộc tính cơ bản tính riêng.
const NTH_HEAL_MAP={
  tanCong:['tanCong'], congLon:['congLonNho'], congNho:['congLonNho'], phaPhong:['phaPhong'],
  congNgTo:['congNgTo'], tatCaNgTo:['congNgTo'], hoaCong:['ngToRieng'], ngToBDT:['ngToRieng'], ngToDVC:['ngToRieng'], ngToRieng:['ngToRieng'],
  xuyenKhang:['xuyenKhang'], chiMang:['chiMang'], chinhXac:['chinhXac'], phaKhien:['phaKhien'], khacBoss:['khacBoss'],
  hp:[null,'hp'], phongThu:[null,'phongThu'], ngoaiThu:[null,'thuLoai'], noiThu:[null,'thuLoai'],
  khangNgTo:[null,'khangNgTo'], khangTatCa:[null,'khangNgTo'], khangCM:[null,'khangCM'], khangCMNgoai:[null,'khangCMLoai'], khangCMNoi:[null,'khangCMLoai'],
  khienKhi:[null,'khienKhi'], khienNgoai:[null,'khienLoai'], khienNoi:[null,'khienLoai'],
  doDon:[null,'doDon'], doDonNgoai:[null,'doDonLoai'], doDonNoi:[null,'doDonLoai'],
};
NTH_SCHOOLS.forEach((s,i)=>{NTH_HEAL_MAP['khac'+i]=['khacPhai']; NTH_HEAL_MAP['khang'+i]=[null,'khangPhai'];});

// Gợi ý trọng số cho từng build (áp dụng khi chọn build / class).
const NTH_ROLES={
  dps:   {name:'Sát thương (DPS)', offWeight:1,    defWeight:5/12},
  healer:{name:'Tố Vấn (trị liệu)', offWeight:1,   defWeight:5/12},
  tank:  {name:'Thiết Y / Tank',    offWeight:0.25, defWeight:1},
};

// Cài đặt mặc định. Sửa được trên trang, lưu trong trình duyệt.
const NTH_DEFAULT_SETTINGS={
  cls:'huyenCo',       // class đang chơi
  bigPassive:'',       // nội tại lớn chọn thêm từ class khác ('' = không)
  oppCls:'',           // class đối thủ ('' = chưa rõ)
  role:'dps',          // 'dps' | 'healer' | 'tank'
  offWeight:1,         // Tổng = Công × offWeight + Thủ × defWeight
  defWeight:5/12,
  myType:'ngoai',      // loại sát thương của tôi: 'ngoai' | 'noi'
  oppNoiRatio:0.5,     // khi chưa rõ đối thủ: tỉ lệ đối thủ đánh nội công
  oppType:'mix',       // đối thủ cụ thể đánh: 'ngoai' | 'noi' | 'mix'
  oppMode:'custom',    // 'custom' = chỉ số đối thủ đã nhập/chụp; 'mirror' = tạm coi đối thủ giống tôi

  // --- Công thức Hel (PvP cấp 79) ---
  kDef:10552,          // giảm miễn phòng thủ = F / (F + kDef)
  kElem:1965,          // giảm miễn kháng nguyên tố = E / (E + kElem)
  k1:1981, k2:1,       // hệ số kỹ năng: [k1 + k2 × tấn công] (Thần Cửu; ước lượng k1 = 928 + 81 × (cấp − 15))
  hitBase:0.95, hitA:1.43, hitC:5950, // tỉ lệ chính xác = 0.95 + 1.43·X/(X+5950)
  blockDmg:0.5,        // đòn bị đỡ gây 50% sát thương, không chí mạng
  critA:115, critB:-1230, critC:1548, // tỉ lệ chí mạng = (115·C − 1230)/(C + 1548) / 100
  critMin:5,           // tỉ lệ chí mạng tối thiểu (%)
  critThem:0,          // tỉ lệ chí mạng cộng thêm (%) từ nội tại / hiệu ứng
  // Quy đổi thuộc tính cơ bản & nội tại lớn
  convMainAtk:4.65, convMainPP:2, convThanCX:0.83, convThanCM:1.6,
  atkHuyetHa:1.65,     // Huyết Hà: 1 Căn Cốt = 1.4–1.9 tấn công
  atkCuuLinh:1.65,     // Cửu Linh: 1 Sức Bền = 1.4–1.9 tấn công
  ngToRiengRatio:0.37, // dòng nguyên tố theo hệ/phe (Hỏa Công, Bạch Đế Thành…) ≈ 0.37 dòng Tất Cả Nguyên Tố (Aki 0.26/0.7)
  linhVanPct:2,        // +1 Lv Đặc Tính ≈ bao nhiêu % sát thương
  // Phần thủ của Căn Cốt / Sức Bền (bảng Aki, quy đổi qua HP)
  akiDef:{hp:147/2766, canCot:154/29, sucBen:174.7/29},

  // --- Tố Vấn: bảng Aki (lợi ích trên mỗi điểm) ---
  linhVanHeal:50,      // +1 Lv Đặc Tính ≈ bao nhiêu điểm trị liệu (ước lượng)
  akiHeal:{
    khiHai:2.8, tanCong:0.6, canCot:0.99, sucBen:0.99, phaPhong:0.3, congLonNho:0.3, chinhXac:0.9,
    congNgTo:0.7, chiMang:0.66, thanPhap:1.8, khacBoss:0.3, khacPhai:0.3, ngToRieng:0.26,
    sucManh:0, xuyenKhang:0.3, phaKhien:0,
  },
  akiHealDef:{
    khiHai:76/29, phongThu:167/234, sucBen:174.7/29, canCot:154/29, khienKhi:1, hp:147/2766,
    khangNgTo:134/94, thuLoai:124/349, khangCM:118.8/128, khangCMLoai:118.8/128/2, khienLoai:109.5/219,
    sucManh:0, thanPhap:0, doDon:0.1, doDonLoai:0.05, khangPhai:0.05, // Aki khuyên bỏ — để nhỏ, sửa được
  },

  schoolShare:NTH_SCHOOLS.map(()=>1), // tỉ lệ gặp từng phái khi chưa rõ class đối thủ
  showSchool:false,
  opp:{...NTH_SAMPLE_PANEL}, // chỉ số đối thủ; mặc định = số mẫu
};
