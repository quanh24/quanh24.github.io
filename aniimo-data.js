// Dữ liệu game Aniimo cho aniimo.html
// Nguồn: https://aniidex.com (danh sách, dạng khác, tier list) — lấy ngày 27/09/2026

// Ngày cập nhật hiển thị ở đầu trang (YYYY-MM-DD). Sửa khi lấy lại dữ liệu.
const DATA_INFO={
  dex:'2026-09-27',  // danh sách Aniimo, hệ, chỉ số, dạng khác
  tier:'2026-09-25', // tier list Aniidex
};

// Map trứng (tab 4). file = đường dẫn ảnh tính từ aniimo.html, name = tên hiện trên trang.
// Thêm map mới: bỏ ảnh vào thư mục aniimomap/ rồi thêm một dòng ở đây.
const EGG_MAPS=[
  {file:'aniimomap/1.png', name:'Map 1'},
  {file:'aniimomap/2.png', name:'Map 2'},
  {file:'aniimomap/3.png', name:'Map 3'},
  {file:'aniimomap/4.png', name:'Map 4'},
  {file:'aniimomap/5.png', name:'Map 5'},
  {file:'aniimomap/6.png', name:'Map 6'},
  {file:'aniimomap/7.png', name:'Map 7'},
  {file:'aniimomap/8.jpg', name:'Map 8'},
  {file:'aniimomap/9.jpg', name:'Map 9'},
  {file:'aniimomap/10.jpg', name:'Map 10'},
  {file:'aniimomap/11.jpg', name:'Map 11'},
  {file:'aniimomap/12.jpg', name:'Map 12'},
  {file:'aniimomap/13.jpg', name:'Map 13'},
];

// Bảng khắc hệ. Hàng = hệ tấn công, cột = hệ phòng thủ, cùng thứ tự:
// Dark, Earth, Fire, Grass, Ice, Light, Lightning, Water, Wind
// + khắc (×1.6), - bị kháng (×0.625), 0 bình thường (×1)
const CHART=[
  "000+0++--", // Dark
  "--+-+00-0", // Earth
  "0--++-0-0", // Fire
  "0+--0-0+0", // Grass
  "0--0-0++0", // Ice
  "+0000--0+", // Light
  "0-00-0-++", // Lightning
  "0++---0-0", // Water
  "+00+00-0-", // Wind
];

// Danh sách Aniimo. Mỗi dòng:
// [số, tên, slug, giai đoạn, vai trò, hệ, hệ chiêu, [HP,ATK,P.DEF,M.DEF,BREAK,REGEN], [[tên dạng, hệ], ...]]
// slug là đường dẫn trên aniidex.com/aniimo/<slug>/. Chỉ ghi dạng khác khi hệ khác dạng gốc.
const DEX_RAW=[
  ["001","Emberpup","emberpup","Lumin","DPS",["fire"],["fire"],[67,90,60,57,40,68],[["Highland",["fire","earth"]]]],
  ["002","Flameruff","flameruff","Gamma","DPS",["fire"],["fire"],[85,111,72,63,45,80],[["Highland",["fire","earth"]]]],
  ["003","Scorchhowl","scorchhowl","Nova","DPS",["fire"],["fire"],[95,119,80,75,52,90],[["Highland",["fire","earth"]],["Thunderstorm",["lightning","fire"]]]],
  ["004","Inferlupa","inferlupa","Nova","Break",["dark","fire"],["dark","fire"],[95,89,70,80,108,99],[]],
  ["005","Celestis","celestis","Lumin","DPS",["dark"],["dark"],[81,106,58,58,46,80],[]],
  ["006","Stellarys","stellarys","Nova","DPS",["dark"],["dark"],[95,125,68,69,54,94],[["Rainstorm",["dark","water"]],["Prismana",["dark","ice"]]]],
  ["007","Chirpi","chirpi","Lumin","Support",["wind"],["wind"],[97,83,67,69,43,93],[["Beach",["water","wind"]],["Highland",["grass","wind"]]]],
  ["008","Tromber","tromber","Nova","Support",["wind"],["wind"],[113,119,79,81,51,88],[["Beach",["water","wind"]],["Highland",["grass","wind"]]]],
  ["009","Cornet","cornet","Nova","DPS",["wind"],["wind"],[96,121,74,70,54,94],[["Beach",["water","wind"]],["Prismana",["lightning","wind"]],["Highland",["grass","wind"]]]],
  ["010","Tubster","tubster","Nova","Break",["wind"],["wind"],[108,80,66,109,107,80],[["Beach",["water","wind"]],["Highland",["grass","wind"]]]],
  ["011","Iris","iris","Lumin","DPS",["grass"],["grass"],[69,101,53,53,50,71],[]],
  ["012","Irisal","irisal","Nova","DPS",["grass"],["grass"],[100,118,70,70,52,94],[]],
  ["013","Skippy","skippy","Lumin","Heal",["water"],["water"],[80,70,66,76,50,60],[["Snowfield",["ice","water"]]]],
  ["014","Pranky","pranky","Gamma","Heal",["water"],["water"],[109,85,66,98,50,74],[["Snowfield",["ice","water"]]]],
  ["015","Glacy","glacy","Nova","Heal",["ice","water"],["water"],[120,95,72,110,50,88],[["Prismana",["light","water"]]]],
  ["016","Leafy","leafy","Nova","Regen",["water","grass"],["grass"],[120,95,82,82,50,106],[]],
  ["017","Nimbi","nimbi","Lumin","Support",["wind"],["wind"],[80,84,69,82,43,93],[["Rainstorm",["lightning","wind"]],["Plateau",["ice","wind"]]]],
  ["018","Turbo","turbo","Nova","Support",["wind"],["wind"],[95,110,80,96,50,87],[["Rainstorm",["lightning","wind"]],["Prismana",["dark","wind"]],["Plateau",["ice","wind"]]]],
  ["019","Dreaple","dreaple","Nova","Support",["dark"],["dark"],[100,110,77,103,50,80],[]],
  ["020","Hummin","hummin","Lumin","Break",["grass"],["grass"],[94,68,71,94,80,60],[]],
  ["021","Hexxin","hexxin","Nova","Regen",["dark","grass"],["dark","grass"],[115,88,84,90,50,115],[]],
  ["022","Tuckin","tuckin","Nova","Break",["grass"],["grass","earth"],[106,80,83,110,100,71],[["Mountain",["grass","earth"]]]],
  ["023","Budclaw","budclaw","Lumin","Break",["grass","earth"],["earth","grass"],[76,64,93,65,84,72],[["Mudflat/Beach/Bay",["earth"]]]],
  ["024","Shrubclaw","shrubclaw","Nova","Break",["grass","earth"],["earth","grass"],[95,80,109,77,104,85],[["Mudflat/Beach/Bay",["earth"]]]],
  ["025","Geoclaw","geoclaw","Nova","Break",["ice"],["ice"],[93,80,113,79,103,82],[]],
  ["026","Sparki","sparki","Lumin","Regen",["fire"],["fire"],[69,100,60,67,41,98],[]],
  ["027","Flamerion","flamerion","Nova","Regen",["fire"],["fire"],[80,113,70,89,50,115],[]],
  ["028","Flutternym","flutternym","Lumin","Heal",["wind"],["wind","grass"],[94,81,68,68,41,85],[["Sea of Flowers",["grass","wind"]],["Nighttime",["dark","wind"]],["Mountain Woods",["earth","wind"]]]],
  ["029","Gracewing","gracewing","Nova","Heal",["wind"],["wind","grass"],[110,98,85,85,50,104],[["Sea of Flowers",["grass","wind"]],["Nighttime",["dark","wind"]],["Mountain Woods",["earth","wind"]]]],
  ["030","Somniwing","somniwing","","Regen",["grass","wind"],["grass"],[111,92,85,85,50,115],[]],
  ["031","Eko","eko","Lumin","Support",["wind"],["wind"],[70,108,70,57,42,80],[]],
  ["032","Eklue","eklue","Nova","Support",["wind"],["wind"],[100,120,83,67,49,91],[]],
  ["033","Budsquire","budsquire","Lumin","DPS",["grass"],["grass"],[82,107,59,59,43,78],[]],
  ["034","Thornblade","thornblade","Nova","DPS",["grass"],["grass"],[96,121,74,73,53,92],[["Thunderstorm",["lightning","grass"]],["Prismana",["water","grass"]]]],
  ["035","Melloblum","melloblum","Nova","Support",["grass"],["grass"],[95,113,70,70,91,78],[["Prismana",["light","grass"]]]],
  ["036","Pomegg","pomegg","Lumin","Break",["grass"],["grass"],[74,72,68,65,91,85],[["Snowfield",["ice","grass"]]]],
  ["037","Pomawk","pomawk","Nova","Break",["grass"],["grass"],[87,90,80,76,107,100],[["Snowfield",["ice","grass"]]]],
  ["038","Dewy","dewy","Lumin","Support",["dark"],["dark"],[71,94,58,55,69,94],[]],
  ["039","Fragrancier","fragrancier","Nova","Support",["dark"],["dark"],[84,111,68,65,81,110],[]],
  ["040","Wisptis","wisptis","Lumin","DPS",["dark"],["dark"],[77,112,60,54,43,77],[["Forest",["dark","grass"]],["Highland",["dark","fire"]]]],
  ["041","Ignitis","ignitis","Nova","DPS",["dark"],["dark"],[90,125,77,70,52,91],[["Forest",["dark","grass"]],["Prismana/Highland",["dark","fire"]]]],
  ["042","Bonesky","bonesky","Lumin","DPS",["ice"],["ice"],[71,88,56,57,38,67],[["Nighttime",["dark","ice"]]]],
  ["043","Fenrier","fenrier","Gamma","DPS",["ice"],["ice"],[86,105,68,68,45,81],[["Nighttime",["dark","ice"]]]],
  ["044","Glynsera","glynsera","Nova","DPS",["ice"],["ice"],[95,118,72,76,53,98],[["Prismana",["light","ice"]],["Nighttime",["dark","ice"]]]],
  ["045","Bolty","bolty","Lumin","Break",["lightning"],["lightning"],[85,85,60,60,87,73],[]],
  ["046","Blazen","blazen","Nova","Break",["lightning"],["lightning"],[100,100,70,70,104,86],[["Prismana",["dark","lightning"]]]],
  ["047","Squarrel","squarrel","Lumin","Break",["fire"],["fire"],[53,80,79,72,94,77],[]],
  ["048","Squashel","squashel","Nova","Break",["fire"],["fire"],[110,82,80,80,108,88],[]],
  ["049","Susuta","susuta","Lumin","Break",["water"],["water"],[81,61,53,80,72,64],[]],
  ["050","Popota","popota","Gamma","Break",["water"],["water"],[92,96,68,68,80,67],[]],
  ["051","Piopiota","piopiota","Nova","Support",["water"],["water"],[102,108,99,75,50,88],[["Nighttime",["dark","water"]]]],
  ["052","Panpanta","panpanta","Nova","Break",["water"],["water"],[104,85,70,106,100,80],[]],
  ["053","Shelly","shelly","Lumin","DPS",["water"],["water"],[75,90,56,56,39,66],[]],
  ["054","Sheldon","sheldon","Gamma","DPS",["water"],["water"],[90,109,68,68,44,79],[]],
  ["055","Sherro","sherro","Nova","DPS",["water"],["water"],[100,121,75,75,50,88],[["Thunderstorm",["water","lightning"]],["Prismana",["light","water"]]]],
  ["056","Baleetle","baleetle","Lumin","DPS",["earth"],["earth"],[76,98,68,68,42,85],[["Snowfield",["ice","earth"]]]],
  ["057","Waleetle","waleetle","Nova","DPS",["earth"],["earth"],[90,114,80,80,52,100],[["Snowfield",["ice","earth"]],["Prismana",["dark","earth"]]]],
  ["058","Bouldus","bouldus","Nova","Support",["earth"],["earth"],[91,114,101,54,52,104],[["Snowfield",["ice","earth"]]]],
  ["059","Fentuft","fentuft","Lumin","DPS",["lightning"],["lightning"],[85,106,60,60,41,77],[]],
  ["060","Fenmane","fenmane","Nova","DPS",["lightning"],["lightning"],[100,125,70,70,50,90],[["Prismana",["light","lightning"]]]],
  ["061","Helmut","helmut","Lumin","Break",["dark"],["dark"],[60,52,68,48,60,51],[["Snowfield",["dark","ice"]]]],
  ["062","Pawney","pawney","Nova","DPS",["dark"],["dark"],[90,125,84,70,55,81],[["Snowfield",["dark","ice"]]]],
  ["063","Rookey","rookey","Nova","Break",["dark"],["dark"],[100,90,100,70,105,75],[["Snowfield",["dark","ice"]]]],
  ["064","Jawling","jawling","Lumin","Break",["wind"],["wind"],[78,65,74,51,76,63],[]],
  ["065","Helmwhelp","helmwhelp","Gamma","Break",["wind"],["wind"],[94,78,88,61,92,76],[]],
  ["066","Helgon","helgon","Nova","Break",["wind"],["wind"],[104,87,98,68,102,84],[]],
  ["067","Infergon","infergon","Nova","DPS",["fire"],["fire"],[95,125,70,85,50,80],[["Prismana",["fire","wind"]]]],
  ["068","Cubbo","cubbo","Lumin","DPS",["earth"],["earth"],[92,100,70,61,42,70],[]],
  ["069","Grizbo","grizbo","Nova","DPS",["earth"],["earth"],[104,124,83,70,50,75],[["Prismana",["dark","earth"]]]],
  ["070","Pebbling","pebbling","Lumin","Break",["earth"],["earth"],[83,68,52,74,79,56],[]],
  ["071","Lavazar","lavazar","Gamma","Break",["fire","earth"],["fire"],[99,82,63,80,93,68],[]],
  ["072","Magmarex","magmarex","Nova","Break",["fire","earth"],["fire"],[110,91,70,89,104,75],[["Prismana",["dark","fire"]]]],
  ["073","Geodeback","geodeback","Gamma","Break",["earth"],["earth"],[99,81,80,54,102,70],[]],
  ["074","Minespine","minespine","Nova","Break",["earth"],["earth"],[110,90,97,60,105,78],[]],
  ["075","Cozite","cozite","Lumin","Support",["earth"],["earth"],[77,87,67,67,50,100],[]],
  ["076","Bailite","bailite","Nova","Support",["earth"],["earth"],[90,116,100,83,50,75],[]],
  ["077","Bulbly","bulbly","Lumin","Support",["lightning"],["lightning"],[83,68,63,63,37,90],[]],
  ["078","Veilfloat","veilfloat","Gamma","Support",["lightning"],["lightning"],[99,93,72,74,45,90],[]],
  ["079","Luminelle","luminelle","Nova","Support",["lightning"],["lightning"],[110,115,75,75,50,90],[["Rainstorm",["water","lightning"]],["Prismana",["light","lightning"]]]],
  ["080","Fahloo","fahloo","Lumin","Regen",["water"],["water"],[102,76,68,76,44,93],[]],
  ["081","Erlath","erlath","Nova","Regen",["water"],["water"],[120,90,80,90,50,110],[]],
  ["082","Besauce","besauce","Nova","Regen",["lightning"],["lightning"],[88,92,75,75,90,118],[]],
  ["084","Reefish","reefish","Lumin","Regen",["water","earth"],["earth"],[83,66,75,79,91,92],[["Rainstorm",["earth"]]]],
  ["085","Coraliz","coraliz","Nova","Regen",["water","earth"],["earth"],[98,78,88,93,107,108],[["Rainstorm",["earth"]]]],
  ["086","Cheekie","cheekie","Lumin","Break",["ice"],["ice"],[89,64,76,79,92,88],[]],
  ["087","Wavwal","wavwal","Nova","Break",["ice"],["ice"],[105,75,89,93,110,103],[]],
  ["088","Bubbeep","bubbeep","Lumin","",["water","grass"],["grass","water"],[104,85,78,75,43,82],[]],
  ["089","Glameep","glameep","Nova","",["water","grass"],["grass","water"],[122,100,92,89,50,97],[["Prismana",["dark","grass"]]]],
  ["090","Popapus","popapus","Lumin","",["water"],["water"],[90,102,58,65,45,90],[]],
  ["091","Gachapus","gachapus","Nova","",["water"],["water"],[106,121,68,77,51,106],[]],
  ["092","Malangel","malangel","Lumin","DPS",["ice"],["ice"],[100,105,80,80,50,100],[]],
  ["093","Malevsera","malevsera","Nova","DPS",["ice"],["ice"],[88,125,70,80,52,110],[]],
  ["10001","Irisalis","irisalis","","DPS",["grass"],["grass"],[90,130,78,78,56,108],[]],
  ["10002","Dazmand","dazmand","Nova","Support",["lightning"],["lightning"],[100,108,81,90,55,88],[]],
  ["10003","Fulmintis","fulmintis","Nova","DPS",["lightning"],["lightning"],[99,130,66,70,50,105],[["Prismana",["light","lightning"]]]],
  ["11001","Sparkelf","sparkelf","Nova","Support",["fire"],["fire"],[107,113,60,88,50,99],[]],
  // Lunara, Helion: tên tự đặt lại (Aniidex ghi Fennelun, Soleon); slug giữ nguyên để link và tier list khớp Aniidex
  ["99995","Lunara","fennelun","Nova","DPS",["light"],["light"],[100,116,72,72,64,90],[]],
  ["99997","Helion","soleon","Nova","DPS",["light"],["light"],[100,116,72,72,64,90],[]],
];

// Tier list theo vai trò (https://aniidex.com/tier-list/, cập nhật 25/09/2026).
// S = trong 15% so với con mạnh nhất vai trò, mỗi bậc sau kém thêm 15%. Con không có ở đây = chưa xếp hạng.
const TIER={
  // S
  "dreaple":"S", "gracewing":"S", "helgon":"S", "sherro":"S", "somniwing":"S", "fulmintis":"S", "sparkelf":"S", "soleon":"S", "minespine":"S",
  // A
  "scorchhowl":"A", "geoclaw":"A", "ignitis":"A", "panpanta":"A", "grizbo":"A", "turbo":"A", "eklue":"A", "flamerion":"A", "fennelun":"A", "glacy":"A", "bailite":"A",
  // B
  "squashel":"B", "fragrancier":"B", "glynsera":"B", "irisal":"B", "irisalis":"B", "helmwhelp":"B", "inferlupa":"B", "erlath":"B", "rookey":"B", "waleetle":"B", "jawling":"B", "infergon":"B", "besauce":"B", "cornet":"B", "sheldon":"B",
  // C
  "magmarex":"C", "popota":"C", "wisptis":"C", "tubster":"C", "thornblade":"C", "pawney":"C", "leafy":"C", "fenrier":"C", "hexxin":"C", "pomawk":"C", "baleetle":"C", "susuta":"C", "shelly":"C", "budsquire":"C",
  // D
  "stellarys":"D", "pomegg":"D", "tuckin":"D", "blazen":"D", "bonesky":"D", "lavazar":"D", "celestis":"D", "flameruff":"D", "luminelle":"D", "squarrel":"D", "iris":"D", "shrubclaw":"D", "tromber":"D", "emberpup":"D", "dazmand":"D", "pebbling":"D", "cubbo":"D", "bouldus":"D", "bolty":"D", "hummin":"D", "fenmane":"D", "geodeback":"D", "melloblum":"D", "fentuft":"D", "flutternym":"D", "budclaw":"D", "pranky":"D", "helmut":"D", "skippy":"D", "sparki":"D", "fahloo":"D", "bulbly":"D", "veilfloat":"D", "chirpi":"D", "nimbi":"D", "dewy":"D", "cozite":"D", "eko":"D", "piopiota":"D",
};

// Tier tự đánh giá cho các dạng khác (vùng, thời tiết, Prismana...). Dạng gốc luôn theo tier list Aniidex ở trên.
// Khoá = "slug|tên dạng", giống tên hiện trong ô tìm Aniimo (vd "Stellarys · Prismana" → 'stellarys|Prismana').
// Dạng khác không có ở đây sẽ dùng tier của dạng gốc. Dạng có ở đây luôn được đưa vào gợi ý kể cả khi tắt "Gồm dạng vùng/Prismana".
const TIER_CUSTOM={
  'stellarys|Prismana':'S',
};
