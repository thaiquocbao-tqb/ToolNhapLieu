;(function (global) {
// ====== HÀM LÀM TRÒN GIỐNG EXCEL ======
function lamTron(x, soMu, fn){
    const dau = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    if (soMu < 0) {
        const f = Math.pow(10, -soMu);
        return dau * fn(Number((ax / f).toPrecision(12))) * f;
    }
    const f = Math.pow(10, soMu);
    return dau * fn(Number((ax * f).toPrecision(12))) / f;
}
function excelRound(x, soMu = 0){ return lamTron(x, soMu, Math.round); }
function excelRoundUp(x, soMu = 0){ return lamTron(x, soMu, Math.ceil); }
function tongHeSo(mangLanCanChinh){ return 1 + mangLanCanChinh.reduce((a, b) => a + b, 0); }

// ====== CHI PHÍ (sheet DATA) ======
const chiPhiCoBan = {
    sanLuongThang : 10000, nhanCongTrucTiep : 80000000, nhanCongQuanLy : 30000000,
    khauHaoMay : 200000000, soNamKhauHao : 5, thueXuong : 15000000, dienNuoc : 5000000,
    vat : 1.1, khoTon : 1.2
};
const chiPhiTongHop = {
    nhanCongM2 : excelRoundUp(chiPhiCoBan.nhanCongTrucTiep / chiPhiCoBan.sanLuongThang) + excelRoundUp(chiPhiCoBan.nhanCongQuanLy / chiPhiCoBan.sanLuongThang),
    khauHaoM2 : excelRoundUp(chiPhiCoBan.khauHaoMay / chiPhiCoBan.soNamKhauHao / 12 / chiPhiCoBan.sanLuongThang),
    dienNuocThueXuongM2 : excelRoundUp(chiPhiCoBan.thueXuong / chiPhiCoBan.sanLuongThang) + excelRoundUp(chiPhiCoBan.dienNuoc / chiPhiCoBan.sanLuongThang),
    heSoCanChinhGI : tongHeSo([0.05, 0.05]),
    heSoCanChinhEI : tongHeSo([0.05]),
    heSoCanChinhSUS : tongHeSo([0.05, 0.05]),
    heSoSale : 1.1,
    heSoGocEI : 1.05,
    heSoPhuKien : 1.25,
    heSoPhuKienTieuAm : 0.25,
    tyLeOngThang : 0.7,
    tyLePhuKien : 0.3,
    haoHutVatTuTieuAm : 1.1,
    vaiThuyTinh : 15000,
    nhanCongTieuAm : 90000,
    loiNhuanTieuAm : 40000,
    haoHutSUS : 1.15,
    loiNhuanSUS : 50000,
    duPhongSUS : 12000,
    dienNuocSUS : 4489
};

// ====== NGUYÊN LIỆU ======
const nguyenlieu = [
    { name : "Tôn Phương Nam Z80 0.48", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z80", doDay : 0.48, gia : 108000, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z80 0.58", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z80", doDay : 0.58, gia : 116000, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z80 0.58", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z80", doDay : 0.58, gia : 112200, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z80 0.75", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z80", doDay : 0.75, gia : 145900, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z80 0.75", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z80", doDay : 0.75, gia : 140900, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z80 0.95", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z80", doDay : 0.95, gia : 181200, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z80 0.95", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z80", doDay : 0.95, gia : 174800, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z80 1.15", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z80", doDay : 1.15, gia : 216900, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z80 1.15", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z80", doDay : 1.15, gia : 209000, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z80 1.5", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z80", doDay : 1.5, gia : 288800, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z120 0.58", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z120", doDay : 0.58, gia : 119100, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z120 0.58", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z120", doDay : 0.58, gia : 115400, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z120 0.75", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z120", doDay : 0.75, gia : 149900, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z120 0.75", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z120", doDay : 0.75, gia : 144900, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z120 0.95", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z120", doDay : 0.95, gia : 185700, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z120 0.95", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z120", doDay : 0.95, gia : 179400, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z120 1.15", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z120", doDay : 1.15, gia : 221100, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z120 1.15", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z120", doDay : 1.15, gia : 213300, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z180 0.58", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z180", doDay : 0.58, gia : 125300, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z180 0.58", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z180", doDay : 0.58, gia : 121700, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z180 0.75", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z180", doDay : 0.75, gia : 155200, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z180 0.75", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z180", doDay : 0.75, gia : 150300, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z180 0.95", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z180", doDay : 0.95, gia : 192100, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z180 0.95", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z180", doDay : 0.95, gia : 185900, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z180 1.15", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z180", doDay : 1.15, gia : 230900, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z180 1.15", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z180", doDay : 1.15, gia : 223300, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z180 1.38", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z180", doDay : 1.38, gia : 347000, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z275 0.58", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z275", doDay : 0.58, gia : 134000, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z275 0.58", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z275", doDay : 0.58, gia : 130500, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z275 0.75", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z275", doDay : 0.75, gia : 164000, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z275 0.75", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z275", doDay : 0.75, gia : 159300, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z275 0.95", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z275", doDay : 0.95, gia : 201300, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z275 0.95", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z275", doDay : 0.95, gia : 195300, donVi : "m (gồm VAT)" },
    { name : "Tôn Hoa Sen Z275 1.15", loai : "TON_MA_KEM", nhaCungCap : "HS", zinc : "Z275", doDay : 1.15, gia : 240800, donVi : "m (gồm VAT)" },
    { name : "Tôn Phương Nam Z275 1.15", loai : "TON_MA_KEM", nhaCungCap : "PN", zinc : "Z275", doDay : 1.15, gia : 233400, donVi : "m (gồm VAT)" },
    { name : "Tôn soi lỗ 0.38", loai : "TON_SOI_LO", doDay : 0.38, gia : 95200, donVi : "m (gồm VAT)" },
    { name : "Tôn soi lỗ 0.48", loai : "TON_SOI_LO", doDay : 0.48, gia : 120000, donVi : "m (gồm VAT)" },
    { name : "Inox 304/BA 0.5mm", loai : "INOX_304", doDay : 0.5, gia : 311000, donVi : "m" },
    { name : "Inox 304/BA 0.6mm", loai : "INOX_304", doDay : 0.6, gia : 370000, donVi : "m" },
    { name : "Inox 304/BA 0.8mm", loai : "INOX_304", doDay : 0.8, gia : 483000, donVi : "m" },
    { name : "Inox 304/BA 1.0mm", loai : "INOX_304", doDay : 1.0, gia : 600000, donVi : "m" },
    { name : "Inox 304/BA 1.2mm", loai : "INOX_304", doDay : 1.2, gia : 714000, donVi : "m" },
    { name : "Inox 304/BA 1.5mm", loai : "INOX_304", doDay : 1.5, gia : 886000, donVi : "m" },
    { name : "Inox 304/BA 2.0mm", loai : "INOX_304", doDay : 2.0, gia : 1180000, donVi : "m" }
];

// ====== THÔNG SỐ ======
const mauHaoHut = [
    { nhom : "W400",  W : 250,  H : 250, L : 1.18 },
    { nhom : "W1000", W : 500,  H : 500, L : 1.11 },
    { nhom : "W1600", W : 1400, H : 500, L : 1.11 },
    { nhom : "W2500", W : 2000, H : 500, L : 1.11 }
];
const thongSoGI = [
    { doDay : 0.58, quyCach : "≤ 400",           nhomHaoHut : "W400",  phuKien : 5000,     loiNhuan : 15000, duPhong : 28000, nep : "Nẹp C" },
    { doDay : 0.75, quyCach : "400 < W ≤ 1000",  nhomHaoHut : "W1000", phuKien : 2300 * 8, loiNhuan : 15000, duPhong : 20000, nep : "Nẹp C or TDC" },
    { doDay : 0.95, quyCach : "1000 < W ≤ 1600", nhomHaoHut : "W1600", phuKien : 2300 * 8, loiNhuan : 25000, duPhong : 22000, nep : "Nẹp TDC" },
    { doDay : 1.15, quyCach : "1600 < W ≤ 2500", nhomHaoHut : "W2500", phuKien : 2300 * 8, loiNhuan : 35000, duPhong : 24000, nep : "Nẹp TDC" },
    { doDay : 1.5,  quyCach : "1600 < W ≤ 2500", nhomHaoHut : "W2500", phuKien : 2300 * 8, loiNhuan : 35000, duPhong : 29000, nep : "Nẹp TDC", nhanCong : 60000, lamTronTyLe : -2, chiZ80 : true }
];
const thongSoTieuAm = [
    { hang : "KHAI_HOAN", doDay : 25, tyTrong : 60,  tonSoiLo : 0.48, rockwool : 50926,  phuKien : 30000, duPhong : 28000, name : "Rockwool 25mm, 60kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "KHAI_HOAN", doDay : 50, tyTrong : 60,  tonSoiLo : 0.48, rockwool : 97222,  phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 60kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "KHAI_HOAN", doDay : 50, tyTrong : 80,  tonSoiLo : 0.48, rockwool : 105000, phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 80kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "KHAI_HOAN", doDay : 50, tyTrong : 100, tonSoiLo : 0.48, rockwool : 134000, phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 100kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "REMAX",     doDay : 25, tyTrong : 60,  tonSoiLo : 0.38, rockwool : (315000 + 40000) / 8.64, phuKien : 30000, duPhong : 22000, name : "Rockwool 25mm, 60kg/m3, tôn soi lỗ 0.38mm" },
    { hang : "REMAX",     doDay : 50, tyTrong : 60,  tonSoiLo : 0.38, rockwool : 315000 / 4.32,           phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 60kg/m3, tôn soi lỗ 0.38mm" }
];
const giaGocEI = [
    { loai : "EI30-45", doDay : 0.75, gia : 370000 }, { loai : "EI30-45", doDay : 0.95, gia : 436000 }, { loai : "EI30-45", doDay : 1.15, gia : 507000 },
    { loai : "EI60",    doDay : 0.75, gia : 370000 }, { loai : "EI60",    doDay : 0.95, gia : 436000 }, { loai : "EI60",    doDay : 1.15, gia : 507000 },
    { loai : "EI120",   doDay : 0.75, gia : 788000 }, { loai : "EI120",   doDay : 0.95, gia : 875000 }, { loai : "EI120",   doDay : 1.15, gia : 968000 }
];
const thongSoSUS = [
    { doDay : 0.5, quyCach : "≤ 400",           nhanCong : 60000,  phuKien : 12000, khauHao : 20000, ghiChu : "kết nối kiểu nẹp C" },
    { doDay : 0.6, quyCach : "≤ 400",           nhanCong : 60000,  phuKien : 48000, khauHao : 25000, ghiChu : "kết nối kiểu nẹp C" },
    { doDay : 0.8, quyCach : "400 < W ≤ 1000",  nhanCong : 60000,  phuKien : 48000, khauHao : 30000, ghiChu : "kết nối kiểu nẹp C + TDC" },
    { doDay : 1.0, quyCach : "1000 < W ≤ 1600", nhanCong : 80000,  phuKien : 48000, khauHao : 35000, ghiChu : "kết nối kiểu TDC" },
    { doDay : 1.2, quyCach : "",                nhanCong : 100000, phuKien : 48000, khauHao : 40000, ghiChu : "kết nối kiểu TDC" },
    { doDay : 1.5, quyCach : "",                nhanCong : 100000, phuKien : 48000, khauHao : 45000, ghiChu : "kết nối kiểu TDC" },
    { doDay : 2.0, quyCach : "",                nhanCong : 100000, phuKien : 48000, khauHao : 50000, ghiChu : "kết nối kiểu TDC" }
];

// ====== SẢN PHẨM ======
const sanPham = [
    { maLoai: "DUCT G.I",   tenLoai: "Ống gió tôn mạ kẽm (G.I)",               maSanPham: "OG-GI",  heSoCanChinh : chiPhiTongHop.heSoCanChinhGI },
    { maLoai: "DUCT G.I",   tenLoai: "Ống gió tiêu âm Rockwool + tôn soi lỗ",  maSanPham: "OG-TA",  heSoCanChinh : chiPhiTongHop.heSoCanChinhGI },
    { maLoai: "DUCT E.I",   tenLoai: "Ống gió chống cháy EI (bọc tấm MgO)",    maSanPham: "OG-EI",  heSoCanChinh : chiPhiTongHop.heSoCanChinhEI },
    { maLoai: "DUCT S.U.S", tenLoai: "Ống gió Inox 304 bóng BA",               maSanPham: "OG-SUS", heSoCanChinh : chiPhiTongHop.heSoCanChinhSUS }
];

// ====== BỘ GIÁ TỪNG LOẠI ỐNG (tách riêng để dùng lại) ======
function boGiaGI(zinc, doDay, nhaCungCap){
    const ts = thongSoGI.find(t => t.doDay === doDay);
    if (!ts) throw new Error("Không hỗ trợ độ dày " + doDay);
    if (ts.chiZ80 && zinc !== "Z80") throw new Error("Tôn 1.5 chỉ có độ mạ Z80");
    if (ts.chiZ80 && nhaCungCap !== "HS") throw new Error("Tôn 1.5 Z80 chỉ có giá Hoa Sen");

    const tienTon = haoHutGapMi(ts.nhomHaoHut) * giaTonM2(zinc, doDay, nhaCungCap);
    const nhanCong = ts.nhanCong || chiPhiTongHop.nhanCongM2;

    const L = excelRoundUp(ts.loiNhuan + ts.duPhong + chiPhiTongHop.dienNuocThueXuongM2 + chiPhiTongHop.khauHaoM2 + ts.phuKien + nhanCong + tienTon, -3);
    const M = excelRound(L * chiPhiTongHop.heSoCanChinhGI * chiPhiTongHop.heSoSale, -3);
    const N = excelRoundUp(M * chiPhiTongHop.heSoPhuKien, -3);
    const P = excelRoundUp(M * chiPhiTongHop.tyLeOngThang + N * chiPhiTongHop.tyLePhuKien, ts.lamTronTyLe ?? -3);

    let R = null;
    if (zinc === "Z80" && doDay !== 1.5) R = Math.round(M * 0.95 * 0.98);
    if (zinc === "Z275") R = N * 0.95;

    return { L, M, N, P, R };
}

// Tiêu âm Rockwool: M = ống thẳng, N = phụ kiện (M x 1.25), P = tỷ lệ 70/30
function boGiaTieuAm(hang, doDay, tyTrong){
    const ts = thongSoTieuAm.find(t => t.hang === hang && t.doDay === doDay && t.tyTrong === tyTrong);
    if (!ts) throw new Error("Không có quy cách tiêu âm này");

    const tienVatTu = (giaTonSoiLoM2(ts.tonSoiLo) + ts.rockwool + chiPhiTongHop.vaiThuyTinh) * chiPhiTongHop.haoHutVatTuTieuAm;
    const chiPhiKhac = chiPhiTongHop.nhanCongTieuAm + ts.phuKien + chiPhiTongHop.khauHaoM2
        + chiPhiTongHop.dienNuocThueXuongM2 + chiPhiTongHop.loiNhuanTieuAm + ts.duPhong;

    const L = excelRoundUp(tienVatTu + chiPhiKhac, -3);
    const M = excelRound(L * sanPham[1].heSoCanChinh * chiPhiTongHop.heSoSale, -3);
    const N = excelRoundUp(M * chiPhiTongHop.heSoPhuKienTieuAm + M, -3);
    const P = excelRoundUp(M * chiPhiTongHop.tyLeOngThang + N * chiPhiTongHop.tyLePhuKien, -2);
    return { L, M, N, P };
}

// Ống chống cháy EI: D = ống thẳng, E = phụ kiện, G = tỷ lệ 70/30
function boGiaEI(loai, doDay, zinc = "Z80", nhaCungCap = "HS"){
    zinc = chuanHoaZinc(zinc);
    const goc = giaGocEI.find(g => g.loai === loai && g.doDay === doDay);
    if (!goc) throw new Error("Không có giá E.I cho quy cách này");

    let giaNen = goc.gia / chiPhiTongHop.heSoGocEI;
    if (zinc !== "Z80") {
        giaNen += boGiaGI(zinc, doDay, nhaCungCap).M - boGiaGI("Z80", doDay, nhaCungCap).M;
    }
    const D = excelRoundUp(giaNen * sanPham[2].heSoCanChinh * chiPhiTongHop.heSoSale * chiPhiTongHop.heSoSale, -3);
    const E = excelRoundUp(D * chiPhiTongHop.heSoPhuKien, -3);
    const G = excelRoundUp(D * chiPhiTongHop.tyLeOngThang + E * chiPhiTongHop.tyLePhuKien, -3);
    return { D, E, G };
}

// Inox 304: M = ống thẳng, N = phụ kiện (không làm tròn), P = tỷ lệ 70/30
function boGiaSUS(doDay){
    const ts = thongSoSUS.find(t => t.doDay === doDay);
    if (!ts) throw new Error("Không có inox 304 dày " + doDay);

    const tienInox = giaInoxM2(doDay) * chiPhiTongHop.haoHutSUS;
    const L = excelRoundUp(chiPhiTongHop.loiNhuanSUS + chiPhiTongHop.duPhongSUS + chiPhiTongHop.dienNuocSUS
        + ts.khauHao + ts.phuKien + ts.nhanCong + tienInox, -3);
    const M = excelRound(L * sanPham[3].heSoCanChinh * chiPhiTongHop.heSoSale, -3);
    const N = M * chiPhiTongHop.heSoPhuKien;
    const P = excelRoundUp(M * chiPhiTongHop.tyLeOngThang + N * chiPhiTongHop.tyLePhuKien, -2);
    return { L, M, N, P };
}

// loaiGia : "ongThang" (mặc định) | "phuKien" | "tyLe" (70% ống thẳng - 30% phụ kiện) | "thamKhao" (chỉ G.I)
// soLuong : diện tích (m2)
function tínhGiá(maSanPham, tuyChon, soLuong){
    const loaiGia = tuyChon.loaiGia || "ongThang";

    switch(maSanPham){
        case sanPham[0].maSanPham: {
            const bo = boGiaGI(tuyChon.zinc, tuyChon.doDay, tuyChon.nhaCungCap || "HS");
            if (loaiGia === "thamKhao") return bo.R * soLuong;
            return chonGia(loaiGia, bo.M, bo.N, bo.P) * soLuong;
        }
        case sanPham[1].maSanPham: {
            const bo = boGiaTieuAm(tuyChon.hang, tuyChon.doDay, tuyChon.tyTrong);
            return chonGia(loaiGia, bo.M, bo.N, bo.P) * soLuong;
        }
        case sanPham[2].maSanPham: {
            if (tuyChon.doDay === 0.58) return 0; // Không áp dụng
            const bo = boGiaEI(tuyChon.loai, tuyChon.doDay, tuyChon.zinc || "Z80", tuyChon.nhaCungCap || "HS");
            return chonGia(loaiGia, bo.D, bo.E, bo.G) * soLuong;
        }
        case sanPham[3].maSanPham: {
            const bo = boGiaSUS(tuyChon.doDay);
            return chonGia(loaiGia, bo.M, bo.N, bo.P) * soLuong;
        }
    }
}

// ====== HÀM PHỤ ======
function chonGia(loaiGia, ongThang, phuKien, tyLe){
    switch(loaiGia){
        case "ongThang": return ongThang;
        case "phuKien": return phuKien;
        case "tyLe": return tyLe;
    }
    throw new Error("loaiGia không hợp lệ: " + loaiGia);
}
function chuanHoaZinc(zinc){
    return { Z08 : "Z80", Z8 : "Z80", Z12 : "Z120", Z18 : "Z180" }[zinc] || zinc;
}
function giaTonM2(zinc, doDay, nhaCungCap){
    const t = nguyenlieu.find(n => n.loai === "TON_MA_KEM" && n.zinc === zinc && n.doDay === doDay && n.nhaCungCap === nhaCungCap);
    if (!t) throw new Error("Không có giá tôn " + zinc + " dày " + doDay + " của " + nhaCungCap);
    return t.gia / chiPhiCoBan.vat / chiPhiCoBan.khoTon;
}
function giaTonSoiLoM2(doDay){
    const t = nguyenlieu.find(n => n.loai === "TON_SOI_LO" && n.doDay === doDay);
    if (!t) throw new Error("Không có tôn soi lỗ dày " + doDay);
    return t.gia / chiPhiCoBan.vat / chiPhiCoBan.khoTon;
}
function giaInoxM2(doDay){
    const t = nguyenlieu.find(n => n.loai === "INOX_304" && n.doDay === doDay);
    if (!t) throw new Error("Không có inox 304 dày " + doDay);
    return t.gia / chiPhiCoBan.khoTon;
}
function haoHutGapMi(nhom){
    const m = mauHaoHut.find(x => x.nhom === nhom);
    const dtThanhPham = (m.W + m.H) * 2 / 1000 * m.L;
    const dtTonTho = 1.2 * ((m.W + m.H) * 2 / 1000 + 0.08);
    return dtTonTho / dtThanhPham + 0.05;
}

// ====== DIỆN TÍCH PHỤ KIỆN (sheet DUCT CALCULATION, cột N) ======
const pi = 3.14;
const haoHutPhuKien = { ongThang : 1, co : 1.2, conThu : 1.1, luon : 1.1, boxGio : 1.1, conThuTieuAm : 1.1, te : 1.2 };
const chiPhiLoMo = { boxGio : 40000, conThuTieuAm : 60000 };

const dienTichPhuKien = {
    ongThang : ({ B, C, H }) => 2 * (B + C) * (H + Math.ceil(H / 1120) * 80) / 1e6 * haoHutPhuKien.ongThang,
    ongThangDonGian : ({ B, C, H }) => 2 * (B + C) * H / 1e6,
    ongThangTieuAm : ({ B, C, H }) => 2 * (B + C) * H / 1e6 * 1.1,
    co90 : ({ B, C, r = B / 2 }) => {
        const cong = 0.5 * (pi * (B + r) ** 2 - pi * r ** 2) + (2 * pi * (r + B) / 4) * C + (2 * pi * r / 4) * C;
        return (cong / 1e6 + (B + C) * 2 * 80 / 1e6) * haoHutPhuKien.co;
    },
    conThuVuongVuong : ({ D, E, F, G, H }) => (((D + F) * Math.sqrt(H ** 2 + ((E - G) ** 2) / 4)
        + (E + G) * Math.sqrt(H ** 2 + ((D - F) ** 2) / 4)
        + (D + E + F + G) * 80) / 1e6) * haoHutPhuKien.conThu,
    conVuongTron : ({ B, C, H, J }) => {
        const t = (pi * J) / 4;
        return (((B + t) * Math.sqrt(H ** 2 + (C - t) ** 2 / 4)
            + (C + t) * Math.sqrt(H ** 2 + (B - t) ** 2 / 4)
            + (B + C) * 2 * 40) / 1e6) * haoHutPhuKien.conThu;
    },
    // Giống Excel (N18): phần gấp mí 80mm nằm BÊN TRONG căn bậc hai
    luon : ({ B, C, H, K }) => (2 * (B + C) * Math.sqrt(H ** 2 + K ** 2 + (B + C) * 2 * 80) / 1e6) * haoHutPhuKien.luon,
    boxGio : ({ B, C, K }) => ((B * C + 2 * C * K + 2 * B * K) / 1e6) * haoHutPhuKien.boxGio,
    conThuTieuAm : ({ B, C, H, D, E }) => ((2 * (B * C + C * H + B * H) - D * E) / 1e6) * haoHutPhuKien.conThuTieuAm,
    te : ({ D, E, F }) => {
        const nua = (a) => 0.5 * (pi * (1.5 * a) ** 2 - pi * (a / 2) ** 2) + (2 * pi * (1.5 * a) / 4) * E + (2 * pi * a / 8) * E;
        return ((nua(D) + nua(F)) / 1e6 - (2 * F * E) / 1e6) * 1.1;
    },
    teRe : ({ D, E, F, G, H }) => {
        const co = 0.5 * (pi * (1.5 * F) ** 2 - pi * (F / 2) ** 2) + (2 * pi * (1.5 * F) / 4) * G + (2 * pi * F / 8) * G;
        return (((2 * (D + E) * H) / 1e6 + co / 1e6 - (2 * F * G) / 1e6)
            + ((D + E) * 2 * 40 + (F + G) * 2 * 2 * 40) / 1e6) * haoHutPhuKien.te;
    }
};
const thanhTienPhuKien = (dienTich, donGiaM2) => excelRoundUp(dienTich * donGiaM2, -2);

// ====== ĐƠN GIÁ PHỤ KIỆN - KHỚP TỪNG Ô CỘT P (sheet DUCT CALCULATION) ======
// Mỗi ô P trong Excel nhân với MỘT Ô GIÁ CỐ ĐỊNH (không theo độ dày/loại tôn của dòng).
// Các hàm dưới tính lại đúng giá trị của từng ô giá đó từ dữ liệu hiện tại (Hoa Sen, Z80):
const nguonGiaExcel = {
    S12 : () => boGiaGI("Z80", 0.95, "HS").M * 0.78,                          // T12 x 0.78         = 224.640
    T10 : () => boGiaGI("Z80", 0.58, "HS").M,                                 // ống thẳng Z80 0.58 = 197.000
    U10 : () => boGiaGI("Z80", 0.58, "HS").N,                                 // phụ kiện Z80 0.58  = 247.000
    U13 : () => boGiaGI("Z80", 1.15, "HS").N,                                 // phụ kiện Z80 1.15  = 424.000
    W24 : () => excelRoundUp(boGiaSUS(0.8).M * 1.25, -2),                     // phụ kiện inox 0.8  = 1.010.000
    W14 : () => excelRoundUp(boGiaEI("EI60", 0.75, "Z80", "HS").D * 1.25, -3),// phụ kiện E.I 0.75  = 560.000
    U8  : () => boGiaTieuAm("KHAI_HOAN", 50, 60).N,                           // tiêu âm 50mm (N)   = 642.000
    V8  : () => boGiaTieuAm("KHAI_HOAN", 25, 60).N                            // tiêu âm 25mm (N)   = 549.000
};

// loại phụ kiện -> hàm diện tích + ô giá Excel dùng + ô P tương ứng
const quyTacPhuKienExcel = {
    ongThang           : { dienTich : "ongThangDonGian", gia : "S12", oExcel : "P8"  },
    ongThangTieuAm     : { dienTich : "ongThangTieuAm",  gia : "T10", oExcel : "P9"  },
    co90               : { dienTich : "co90",             gia : "W24", oExcel : "P12" },
    conThuVuongVuong   : { dienTich : "conThuVuongVuong", gia : "W14", oExcel : "P14" },
    conVuongTron       : { dienTich : "conVuongTron",     gia : "W14", oExcel : "P16" },
    conVuongTronTieuAm : { dienTich : "conVuongTron",     gia : "V8",  oExcel : "P17" },
    luon               : { dienTich : "luon",             gia : "U10", oExcel : "P18" },
    boxGio             : { dienTich : "boxGio",           gia : "U13", oExcel : "P20" },
    conThuTieuAm       : { dienTich : "conThuTieuAm",     gia : "U8",  oExcel : "P21" },
    te                 : { dienTich : "te",               gia : "U10", oExcel : "P24" },
    teRe               : { dienTich : "teRe",             gia : "U10", oExcel : "P26" }
};

// kichThuoc : tham số của hàm diện tích tương ứng (xem dienTichPhuKien)
// tuyChon.dienTich : (tuỳ chọn) ghi đè diện tích. Excel ô P21 nhân với diện tích box gió (N20) chứ không phải N22,
//                    muốn ra đúng 1.073.500 của Excel thì truyền dienTich = diện tích box gió.
// tuyChon.soLo : số lỗ mở của box gió (Excel mẫu = 1, cộng 40.000/lỗ)
function tinhPhuKienExcel(loai, kichThuoc, tuyChon = {}){
    const qt = quyTacPhuKienExcel[loai];
    if (!qt) throw new Error("Loại phụ kiện không hợp lệ: " + loai);

    const dienTich = tuyChon.dienTich ?? dienTichPhuKien[qt.dienTich](kichThuoc);
    const donGia = nguonGiaExcel[qt.gia]();
    const thanhTien = thanhTienPhuKien(dienTich, donGia);    // = ô P trong Excel
    const kq = { oExcel : qt.oExcel, dienTich, donGia, thanhTien };

    if (loai === "boxGio") {
        const soLo = tuyChon.soLo ?? 1;
        kq.thanhTienCongLoMo = excelRoundUp(thanhTien + chiPhiLoMo.boxGio * soLo, -3);  // Excel R20
        kq.thanhTienCongLoMoSau1_1 = kq.thanhTienCongLoMo * 1.1;                          // Excel S20
    }
    return kq;
}

if (typeof module !== "undefined") {
    module.exports = { tínhGiá, sanPham, dienTichPhuKien, thanhTienPhuKien, chiPhiLoMo, chiPhiTongHop,
        boGiaGI, boGiaTieuAm, boGiaEI, boGiaSUS, nguonGiaExcel, quyTacPhuKienExcel, tinhPhuKienExcel };
}
if (global) global.OngGioCalculator = { tínhGiá, sanPham, dienTichPhuKien, tinhPhuKienExcel };
})(typeof window !== "undefined" ? window : null);