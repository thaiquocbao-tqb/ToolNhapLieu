'use strict';
// Đối chiếu kết quả JS với giá trị đã tính sẵn trong file Excel (expected.json)
const exp = require('./expected.json');
const { tinhGiaOngGI, tinhGiaTieuAm, tinhGiaOngSUS, tinhGiaOngEI, phuKien: pk } = require('./index');
let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = Math.abs(got - want) < 1e-6 || Math.abs(got - want) < 1e-9 * Math.abs(want);
  ok ? pass++ : (fail++, console.log(`FAIL ${name}: JS=${got} Excel=${want}`));
};

exp.gi.forEach((r) => {
  const x = tinhGiaOngGI({ zinc: r.zinc, doDay: r.doDay });
  const n = `G.I ${r.zinc}-${r.doDay}`;
  eq(n + ' L', x.donGiaL, r.L); eq(n + ' M', x.giaOngThang, r.M); eq(n + ' N', x.giaPhuKien, r.N); eq(n + ' P', x.giaTheoTyLe, r.P);
});
exp.tieuAm.forEach((r) => {
  const [hang, doDay, tyTrong] = r.key.split('-');
  const x = tinhGiaTieuAm({ hang, doDay: +doDay, tyTrong: +tyTrong });
  eq(r.key + ' L', x.donGiaL, r.L); eq(r.key + ' M', x.giaOngThang, r.M); eq(r.key + ' N', x.giaPhuKien, r.N); eq(r.key + ' P', x.giaTheoTyLe, r.P);
});
exp.sus.forEach((r) => {
  const x = tinhGiaOngSUS({ doDay: r.doDay });
  const n = `SUS ${r.doDay}`;
  eq(n + ' L', x.donGiaL, r.L); eq(n + ' M', x.giaOngThang, r.M); eq(n + ' N', x.giaPhuKien, r.N); eq(n + ' P', x.giaTheoTyLe, r.P);
});
exp.ei.forEach((r) => {
  const x = tinhGiaOngEI({ loai: r.loai, doDay: r.doDay, zinc: 'Z80' });
  const n = `${r.loai} ${r.doDay}`;
  eq(n + ' D', x.giaOngThang, r.D); eq(n + ' E', x.giaPhuKien, r.E); eq(n + ' G', x.giaTheoTyLe, r.G);
});
// Diện tích phụ kiện (các dòng ví dụ trong DUCT CALCULATION)
eq('N10 ống thẳng', pk.ongThang({ B: 1000, C: 400, H: 300 }), exp.phuKien.N10);
eq('N12 co 90', pk.co90({ B: 700, C: 700 }), exp.phuKien.N12);
eq('N14 côn thu', pk.conThuVuongVuong({ D: 1600, E: 600, F: 1000, G: 400, H: 200 }), exp.phuKien.N14);
eq('N16 côn V-T', pk.conVuongTron({ B: 1000, C: 400, H: 500, J: 650 }), exp.phuKien.N16);
eq('N18 lượn', pk.luon({ B: 500, C: 200, H: 800, K: 400 }), exp.phuKien.N18);
eq('N20 box', pk.boxGio({ B: 1000, C: 400, K: 400 }), exp.phuKien.N20);
eq('N22 côn tiêu âm', pk.conThuTieuAm({ B: 1000, C: 1000, H: 1000, D: 600, E: 600 }), exp.phuKien.N22);
eq('N24 te', pk.te({ D: 200, E: 100, F: 100 }), exp.phuKien.N24);
eq('N26 tê rẽ', pk.teRe({ D: 200, E: 100, F: 100, G: 100, H: 250 }), exp.phuKien.N26);

console.log(`\n${pass} đúng, ${fail} sai`);
process.exit(fail ? 1 : 0);
