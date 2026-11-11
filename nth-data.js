// Dữ liệu cho nth.html — so sánh nội công Nghịch Thủy Hàn Mobile (PvP, mùa 2.x)
// Nguồn: nth/tailieu.txt (công thức cộng đồng mùa 2.1.1), bảng lợi ích của Aki (nth/loiichtrilieu.png,
// nth/loiichphongthu.png — phiên bản 2.1, 11/08/2026). Mọi hệ số đều là ƯỚC LƯỢNG cộng đồng,
// người dùng sửa được trong mục "Cài đặt nâng cao" trên trang.

// Các phái — dùng cho dòng Khắc Chế / Kháng theo phái (ưu tiên thấp, mặc định ẩn).
const NTH_SCHOOLS=['Toái Mộng','Long Ngâm','Huyết Hà','Thiết Y','Thần Tương','Huyền Cơ','Cửu Linh','Tố Vấn','Triều Quang','Thương Lan','Hồng Âm'];

// Chỉ số trên màn hình nhân vật (tab PVP). key = tên trong code, label = chữ trong game.
// aliases = các cách viết (đã bỏ dấu, chữ thường) để đọc ảnh chụp bằng OCR.
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
];

// Ảnh mẫu nth/viduchiso.png — dùng làm giá trị khởi tạo cho lần đầu mở trang.
const NTH_SAMPLE_PANEL={
  hp:146870, sucManh:375, khiHai:130, canCot:271, thanPhap:261, sucBen:239,
  cong:8502, phaPhong:4832, nguyenTo:2597, xuyenKhang:401, chinhXac:1764, chiMang:2665, khacBoss:558, khacPhai:688,
  ngoaiThu:6247, noiThu:6187, doDonNgoai:1202, doDonNoi:1111, khangCMNgoai:1264, khangCMNoi:1272, khangNgTo:1409, khangPhai:5140,
};

// Các loại dòng nội công.
//  max   : giá trị tối đa một dòng theo bảng Aki (null = chưa rõ) — để chấm "độ đẹp" của dòng.
//  stat  : dòng cộng thẳng vào chỉ số → tính bằng CÔNG THỨC sát thương (có lợi ích giảm dần).
//  off   : khóa trọng số công (Aki) trong NTH_DEFAULT_SETTINGS.akiOff — dùng khi chưa có công thức.
//  def   : khóa trọng số thủ (Aki) trong NTH_DEFAULT_SETTINGS.akiDef.
//  mirror: chỉ số thủ "đối xứng" với một chỉ số công (Đỡ Đòn ↔ Chính Xác, Kháng phái ↔ Khắc phái).
//  low   : ưu tiên thấp, ẩn khỏi danh sách chọn cho tới khi bật "Hiện dòng theo phái".
const NTH_LINE_GROUPS=[
  {name:'Tấn công', lines:[
    {id:'tanCong',   name:'Tấn Công',            max:179, stat:{cong:1}},
    {id:'congLon',   name:'Tấn Công Tối Đa',       max:234, stat:{cong:0.5}},
    {id:'congNho',   name:'Tấn Công Tối Thiểu',       max:234, stat:{cong:0.5}},
    {id:'phaPhong',  name:'Phá Phòng',           max:262, stat:{phaPhong:1}},
    {id:'congNgTo',  name:'Công Nguyên Tố',      max:94,  stat:{nguyenTo:1}},
    {id:'tatCaNgTo', name:'Tất Cả Nguyên Tố',    max:94,  stat:{nguyenTo:1}},
    {id:'hoaCong',   name:'Hỏa Công',            max:88,  off:'ngToRieng'},
    {id:'ngToBDT',   name:'Ng.Tố-Bạch Đế Thành', max:88,  off:'ngToRieng'},
    {id:'ngToDVC',   name:'Ng.Tố-Dược Vương Cốc',max:88,  off:'ngToRieng'},
    {id:'ngToRieng', name:'Ng.Tố hệ/phe khác',   max:88,  off:'ngToRieng'},
    {id:'xuyenKhang',name:'Xuyên Kháng',         max:null,stat:{xuyenKhang:1}},
    {id:'chiMang',   name:'Chí Mạng',            max:91,  stat:{chiMang:1}},
    {id:'chinhXac',  name:'Chính Xác',           max:77,  off:'chinhXac'},
    {id:'phaKhien',  name:'Phá Khiên',           max:null,off:'phaKhien'},
    {id:'khacBoss',  name:'Khắc Chế Boss',       max:133, off:'khacBoss'},
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
    {id:'khangCMNgoai',name:'Kháng Chí Mạng Ngoại', max:null, stat:{khangCMNgoai:1}},
    {id:'khangCMNoi',  name:'Kháng Chí Mạng Nội',   max:null, stat:{khangCMNoi:1}},
    {id:'khienKhi',    name:'Khiên Khí',            max:163,  def:'khienKhi'},
    {id:'khienNgoai',  name:'Khiên Khí Ngoại Công', max:219,  def:'khienLoai', side:'ngoai'},
    {id:'khienNoi',    name:'Khiên Khí Nội Công',   max:219,  def:'khienLoai', side:'noi'},
    {id:'doDon',       name:'Đỡ Đòn',               max:null, mirror:'doDon'},
    {id:'doDonNgoai',  name:'Đỡ Đòn Ngoại Công',    max:null, mirror:'doDon', side:'ngoai'},
    {id:'doDonNoi',    name:'Đỡ Đòn Nội Công',      max:null, mirror:'doDon', side:'noi'},
  ]},
  {name:'Hiếm', lines:[
    {id:'linhVan', name:'<Linh Vận> Lv Đặc Tính', max:1, rare:true},
  ]},
  {name:'Theo phái (ưu tiên thấp)', low:true, lines:[
    ...NTH_SCHOOLS.map((s,i)=>({id:'khac'+i, name:'Khắc Chế '+s, max:133, off:'khacPhai', school:i})),
    ...NTH_SCHOOLS.map((s,i)=>({id:'khang'+i, name:'Kháng '+s, max:null, mirror:'khangPhai', school:i})),
  ]},
];

// Cách viết khác (ngoài tên chính) để đọc ảnh "Tăng Cường Thuộc Tính" bằng OCR.
const NTH_LINE_ALIASES={
  linhVan:['linh van','lv dac tinh','dac tinh'], // chữ "<Linh Vận>" có quầng sáng cam, OCR hay đọc sai → nhận theo "Lv Đặc Tính" khangTatCa:['khang tat ca nguyen to'], khangNgTo:['khang ng to'],
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

// Gợi ý cài đặt cho từng build (áp dụng khi bấm chọn build).
const NTH_ROLES={
  dps:   {name:'Sát thương (DPS)', offWeight:1,    defWeight:5/12},
  healer:{name:'Tố Vấn (trị liệu)', offWeight:1,   defWeight:5/12},
  tank:  {name:'Thiết Y / Tank',    offWeight:0.25, defWeight:1},
};

// Cài đặt mặc định. Sửa được trên trang, lưu trong trình duyệt.
const NTH_DEFAULT_SETTINGS={
  role:'dps',          // 'dps' | 'healer' | 'tank'
  offWeight:1,         // Tổng = Công × offWeight + Thủ × defWeight
  // --- Tố Vấn: bảng Aki (lợi ích trên mỗi điểm) ---
  noiTai:'none',       // 'none' | 'huyetHa' (Căn Cốt 0.99) | 'cuuLinh' (Sức Bền 0.99)
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
  myType:'ngoai',      // loại sát thương của tôi: 'ngoai' | 'noi'
  oppNoiRatio:0.5,     // tỉ lệ đối thủ đánh nội công (để tính giá trị Ngoại Thủ / Nội Thủ…)
  oppMode:'custom',    // 'custom' = chỉ số đối thủ đã nhập/chụp; 'mirror' = tạm coi đối thủ giống tôi
  defWeight:5/12,      // Tổng = Công + Thủ × hệ số này (Aki dùng 5/12)
  // Công thức (tailieu.txt)
  kDef:10743,          // R_phòng_thủ = F / (F + kDef)
  kElem:2016,          // R_nguyên_tố = E / (E + kElem)
  critA:1.1445, critB:80, critC:1602.5, // P_bạo = (A·C + B) / (C + Cc)
  critMult:1.5,        // bội số sát thương chí mạng
  skillK:1, skillB:0,  // hệ số kỹ năng K và sát thương cơ sở B
  linhVanPct:2,        // +1 Lv Đặc Tính ≈ bao nhiêu % sát thương
  // Trọng số Aki — lợi ích trên mỗi điểm. Đơn vị "công" được quy đổi ra % sát thương
  // bằng cách so với dòng Tấn Công (0.6/điểm) qua công thức; đơn vị "thủ" quy đổi qua dòng HP.
  akiOff:{
    tanCong:0.6, chinhXac:0.9, ngToRieng:0.26, phaKhien:0.3, khacBoss:0.3, khacPhai:0.3,
    sucManh:2.0, khiHai:2.8, canCot:0, thanPhap:1.8, sucBen:0,
    doDon:0.45,   // đối xứng Chính Xác (giảm chính xác của đối thủ) — ước lượng bằng 1/2
    khangPhai:0.3,// đối xứng Khắc phái
  },
  akiDef:{
    hp:147/2766, khienKhi:163/163, khienLoai:109.5/219,
    khiHai:76/29, canCot:154/29, sucBen:174.7/29, sucManh:0, thanPhap:0,
  },
  schoolShare:NTH_SCHOOLS.map(()=>1), // tỉ lệ gặp từng phái (chuẩn hóa khi tính)
  showSchool:false,
  opp:{...NTH_SAMPLE_PANEL}, // chỉ số đối thủ (cùng các ô như bảng của tôi); mặc định = số mẫu
};
