;(function (global) {
// ====== HÀM LÀM TRÒN GIỐNG EXCEL ======
// soMu âm = làm tròn hàng nghìn (-3), hàng trăm (-2)... giống ROUND / ROUNDUP của Excel
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
    sanLuongThang : 10000,          // m2 / tháng
    nhanCongTrucTiep : 80000000,
    nhanCongQuanLy : 30000000,
    khauHaoMay : 200000000,
    soNamKhauHao : 5,
    thueXuong : 15000000,
    dienNuoc : 5000000,
    vat : 1.1,                      // chia để bỏ VAT
    khoTon : 1.2                    // khổ tôn 1.2m (đổi giá/m -> giá/m2)
};
const chiPhiTongHop = {
    // chi phí tính trên 1 m2 thành phẩm (làm tròn lên đơn vị đồng)
    nhanCongM2 : excelRoundUp(chiPhiCoBan.nhanCongTrucTiep / chiPhiCoBan.sanLuongThang) + excelRoundUp(chiPhiCoBan.nhanCongQuanLy / chiPhiCoBan.sanLuongThang),
    khauHaoM2 : excelRoundUp(chiPhiCoBan.khauHaoMay / chiPhiCoBan.soNamKhauHao / 12 / chiPhiCoBan.sanLuongThang),
    dienNuocThueXuongM2 : excelRoundUp(chiPhiCoBan.thueXuong / chiPhiCoBan.sanLuongThang) + excelRoundUp(chiPhiCoBan.dienNuoc / chiPhiCoBan.sanLuongThang),

    // hệ số cân chỉnh = 1 + tổng các lần điều chỉnh (DATA!S20:S22)
    heSoCanChinhGI : tongHeSo([0.05, 0.05]),
    heSoCanChinhEI : tongHeSo([0.05]),
    heSoCanChinhSUS : tongHeSo([0.05, 0.05]),
    heSoSale : 1.1,
    heSoGocEI : 1.05,               // giá gốc E.I chia 1.05 trước khi nhân lại hệ số cân chỉnh

    heSoPhuKien : 1.25,             // giá ống phụ kiện = ống thẳng x 1.25
    heSoPhuKienTieuAm : 0.25,       // tiêu âm: phụ kiện = ống thẳng + 25%
    tyLeOngThang : 0.7,             // giá theo tỷ lệ 70% ống thẳng - 30% phụ kiện
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
// Tôn mạ kẽm / tôn soi lỗ: giá GỒM VAT, đ/m dài. Inox 304: đ/m2 (chia khổ 1.2)
// nhaCungCap : HS = Hoa Sen, PN = Phương Nam
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
// Mẫu quy cách ống đại diện dùng tính hệ số hao hụt gấp mí (DATA!Q43:Q47)
const mauHaoHut = [
    { nhom : "W400",  W : 250,  H : 250, L : 1.18 },   // ≤ 400
    { nhom : "W1000", W : 500,  H : 500, L : 1.11 },   // 400 < W ≤ 1000
    { nhom : "W1600", W : 1400, H : 500, L : 1.11 },   // 1000 < W ≤ 1600
    { nhom : "W2500", W : 2000, H : 500, L : 1.11 }    // 1600 < W ≤ 2500
];

// Ống G.I - thông số theo độ dày tôn (giống nhau cho Z80 / Z120 / Z180 / Z275)
const thongSoGI = [
    { doDay : 0.58, quyCach : "≤ 400",           nhomHaoHut : "W400",  phuKien : 5000,     loiNhuan : 15000, duPhong : 28000, nep : "Nẹp C" },
    { doDay : 0.75, quyCach : "400 < W ≤ 1000",  nhomHaoHut : "W1000", phuKien : 2300 * 8, loiNhuan : 15000, duPhong : 20000, nep : "Nẹp C or TDC" },
    { doDay : 0.95, quyCach : "1000 < W ≤ 1600", nhomHaoHut : "W1600", phuKien : 2300 * 8, loiNhuan : 25000, duPhong : 22000, nep : "Nẹp TDC" },
    { doDay : 1.15, quyCach : "1600 < W ≤ 2500", nhomHaoHut : "W2500", phuKien : 2300 * 8, loiNhuan : 35000, duPhong : 24000, nep : "Nẹp TDC" },
    // chỉ có Z80, chỉ có giá Hoa Sen, nhân công 60.000, cột "tỉ lệ" làm tròn hàng trăm
    { doDay : 1.5,  quyCach : "1600 < W ≤ 2500", nhomHaoHut : "W2500", phuKien : 2300 * 8, loiNhuan : 35000, duPhong : 29000, nep : "Nẹp TDC", nhanCong : 60000, lamTronTyLe : -2, chiZ80 : true }
];

// Tiêu âm Rockwool - giá rockwool (cột D) và thông số theo quy cách
const thongSoTieuAm = [
    { hang : "KHAI_HOAN", doDay : 25, tyTrong : 60,  tonSoiLo : 0.48, rockwool : 50926,  phuKien : 30000, duPhong : 28000, name : "Rockwool 25mm, 60kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "KHAI_HOAN", doDay : 50, tyTrong : 60,  tonSoiLo : 0.48, rockwool : 97222,  phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 60kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "KHAI_HOAN", doDay : 50, tyTrong : 80,  tonSoiLo : 0.48, rockwool : 105000, phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 80kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "KHAI_HOAN", doDay : 50, tyTrong : 100, tonSoiLo : 0.48, rockwool : 134000, phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 100kg/m3, tôn soi lỗ 0.48mm" },
    { hang : "REMAX",     doDay : 25, tyTrong : 60,  tonSoiLo : 0.38, rockwool : (315000 + 40000) / 8.64, phuKien : 30000, duPhong : 22000, name : "Rockwool 25mm, 60kg/m3, tôn soi lỗ 0.38mm" },
    { hang : "REMAX",     doDay : 50, tyTrong : 60,  tonSoiLo : 0.38, rockwool : 315000 / 4.32,           phuKien : 40000, duPhong : 28000, name : "Rockwool 50mm, 60kg/m3, tôn soi lỗ 0.38mm" }
];

// Ống E.I chống cháy - giá gốc Z80 (cột AL). Tôn 0.58 "Không áp dụng"
const giaGocEI = [
    { loai : "EI30-45", doDay : 0.75, gia : 370000 }, { loai : "EI30-45", doDay : 0.95, gia : 436000 }, { loai : "EI30-45", doDay : 1.15, gia : 507000 },
    { loai : "EI60",    doDay : 0.75, gia : 370000 }, { loai : "EI60",    doDay : 0.95, gia : 436000 }, { loai : "EI60",    doDay : 1.15, gia : 507000 },
    { loai : "EI120",   doDay : 0.75, gia : 788000 }, { loai : "EI120",   doDay : 0.95, gia : 875000 }, { loai : "EI120",   doDay : 1.15, gia : 968000 }
];

// Ống Inox 304 - nhân công (F), phụ kiện + vật tư (G), khấu hao máy (H) theo độ dày
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
    {
        maLoai: "DUCT G.I",
        tenLoai: "Ống gió tôn mạ kẽm (G.I)",
        maSanPham: "OG-GI",
        heSoCanChinh : chiPhiTongHop.heSoCanChinhGI,
        // tuyChon : { zinc : "Z80|Z120|Z180|Z275", doDay : 0.58|0.75|0.95|1.15|1.5, nhaCungCap : "HS|PN" }
    },
    {
        maLoai: "DUCT G.I",
        tenLoai: "Ống gió tiêu âm Rockwool + tôn soi lỗ",
        maSanPham: "OG-TA",
        heSoCanChinh : chiPhiTongHop.heSoCanChinhGI,
        // tuyChon : { hang : "KHAI_HOAN|REMAX", doDay : 25|50, tyTrong : 60|80|100 }
    },
    {
        maLoai: "DUCT E.I",
        tenLoai: "Ống gió chống cháy EI (bọc tấm MgO)",
        maSanPham: "OG-EI",
        heSoCanChinh : chiPhiTongHop.heSoCanChinhEI,
        // tuyChon : { loai : "EI30-45|EI60|EI120", doDay : 0.58|0.75|0.95|1.15, zinc : "Z80|Z120|Z180|Z275", nhaCungCap : "HS|PN" }
    },
    {
        maLoai: "DUCT S.U.S",
        tenLoai: "Ống gió Inox 304 bóng BA",
        maSanPham: "OG-SUS",
        heSoCanChinh : chiPhiTongHop.heSoCanChinhSUS,
        // tuyChon : { doDay : 0.5|0.6|0.8|1.0|1.2|1.5|2.0 }
    }
];

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
            const ts = thongSoTieuAm.find(t => t.hang === tuyChon.hang && t.doDay === tuyChon.doDay && t.tyTrong === tuyChon.tyTrong);
            if (!ts) throw new Error("Không có quy cách tiêu âm này");

            // 1. Vật tư: tôn soi lỗ + rockwool + vải thủy tinh (x1.1 hao hụt)
            const tienVatTu = (giaTonSoiLoM2(ts.tonSoiLo) + ts.rockwool + chiPhiTongHop.vaiThuyTinh) * chiPhiTongHop.haoHutVatTuTieuAm;

            // 2. Chi phí khác: nhân công + phụ kiện + khấu hao + điện nước thuê xưởng + lợi nhuận + dự phòng
            const chiPhiKhac = chiPhiTongHop.nhanCongTieuAm + ts.phuKien + chiPhiTongHop.khauHaoM2
                + chiPhiTongHop.dienNuocThueXuongM2 + chiPhiTongHop.loiNhuanTieuAm + ts.duPhong;

            const L = excelRoundUp(tienVatTu + chiPhiKhac, -3);
            const M = excelRound(L * sanPham[1].heSoCanChinh * chiPhiTongHop.heSoSale, -3);
            const N = excelRoundUp(M * chiPhiTongHop.heSoPhuKienTieuAm + M, -3);
            const P = excelRoundUp(M * chiPhiTongHop.tyLeOngThang + N * chiPhiTongHop.tyLePhuKien, -2);

            return chonGia(loaiGia, M, N, P) * soLuong;

        }
        case sanPham[2].maSanPham: {
            const zinc = chuanHoaZinc(tuyChon.zinc || "Z80");
            const nhaCungCap = tuyChon.nhaCungCap || "HS";
            if (tuyChon.doDay === 0.58) return 0; // Không áp dụng

            const goc = giaGocEI.find(g => g.loai === tuyChon.loai && g.doDay === tuyChon.doDay);
            if (!goc) throw new Error("Không có giá E.I cho quy cách này");

            // 1. Giá nền Z80, đổi độ mạ = cộng chênh lệch giá ống thẳng G.I
            let giaNen = goc.gia / chiPhiTongHop.heSoGocEI;
            if (zinc !== "Z80") {
                giaNen += boGiaGI(zinc, tuyChon.doDay, nhaCungCap).M - boGiaGI("Z80", tuyChon.doDay, nhaCungCap).M;
            }

            // 2. Nhân hệ số cân chỉnh E.I, 2 lần hệ số sale
            const D = excelRoundUp(giaNen * sanPham[2].heSoCanChinh * chiPhiTongHop.heSoSale * chiPhiTongHop.heSoSale, -3);
            const E = excelRoundUp(D * chiPhiTongHop.heSoPhuKien, -3);
            const G = excelRoundUp(D * chiPhiTongHop.tyLeOngThang + E * chiPhiTongHop.tyLePhuKien, -3);

            return chonGia(loaiGia, D, E, G) * soLuong;

        }
        case sanPham[3].maSanPham: {
            const ts = thongSoSUS.find(t => t.doDay === tuyChon.doDay);
            if (!ts) throw new Error("Không có inox 304 dày " + tuyChon.doDay);

            const tienInox = giaInoxM2(tuyChon.doDay) * chiPhiTongHop.haoHutSUS;

            const L = excelRoundUp(chiPhiTongHop.loiNhuanSUS + chiPhiTongHop.duPhongSUS + chiPhiTongHop.dienNuocSUS
                + ts.khauHao + ts.phuKien + ts.nhanCong + tienInox, -3);
            const M = excelRound(L * sanPham[3].heSoCanChinh * chiPhiTongHop.heSoSale, -3);
            const N = M * chiPhiTongHop.heSoPhuKien;   // inox: không làm tròn
            const P = excelRoundUp(M * chiPhiTongHop.tyLeOngThang + N * chiPhiTongHop.tyLePhuKien, -2);

            return chonGia(loaiGia, M, N, P) * soLuong;

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

// Đơn giá tôn trước VAT (đ/m2)
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

// Hệ số hao hụt gấp mí (DATA!Q43:Q47)
function haoHutGapMi(nhom){
    const m = mauHaoHut.find(x => x.nhom === nhom);
    const dtThanhPham = (m.W + m.H) * 2 / 1000 * m.L;
    const dtTonTho = 1.2 * ((m.W + m.H) * 2 / 1000 + 0.08);
    return dtTonTho / dtThanhPham + 0.05;
}

// Bộ giá ống G.I: L (data), M (ống thẳng), N (phụ kiện), P (tỷ lệ 70/30), R (tham khảo)
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

    // Cột R tham khảo: Z80 = M x 0.95 x 0.98 ; Z275 = N x 0.95
    let R = null;
    if (zinc === "Z80" && doDay !== 1.5) R = Math.round(M * 0.95 * 0.98);
    if (zinc === "Z275") R = N * 0.95;

    return { L, M, N, P, R };
}

// ====== DIỆN TÍCH PHỤ KIỆN (sheet DUCT CALCULATION, cột N) ======
// Kích thước nhập mm, kết quả m2 (đã gồm gấp mí / hao hụt). Thành tiền = excelRoundUp(dienTich * donGiaM2, -2)
const pi = 3.14;
const haoHutPhuKien = { ongThang : 1, co : 1.2, conThu : 1.1, luon : 1.1, boxGio : 1.1, conThuTieuAm : 1.1, te : 1.2 };
const chiPhiLoMo = { boxGio : 40000, conThuTieuAm : 60000 }; // mỗi lỗ mở cộng thêm

const dienTichPhuKien = {
    // Ống thẳng B x C, dài H (gấp mí 80mm mỗi đoạn 1120mm)
    ongThang : ({ B, C, H }) => 2 * (B + C) * (H + Math.ceil(H / 1120) * 80) / 1e6 * haoHutPhuKien.ongThang,
    ongThangDonGian : ({ B, C, H }) => 2 * (B + C) * H / 1e6,
    ongThangTieuAm : ({ B, C, H }) => 2 * (B + C) * H / 1e6 * 1.1,

    // Co 90: B x C, bán kính trong r (mặc định B/2)
    co90 : ({ B, C, r = B / 2 }) => {
        const cong = 0.5 * (pi * (B + r) ** 2 - pi * r ** 2) + (2 * pi * (r + B) / 4) * C + (2 * pi * r / 4) * C;
        return (cong / 1e6 + (B + C) * 2 * 80 / 1e6) * haoHutPhuKien.co;
    },
    // Côn thu vuông-vuông & chân rẽ vuông-vuông: đầu lớn D x E, đầu nhỏ F x G, cao H
    conThuVuongVuong : ({ D, E, F, G, H }) => (((D + F) * Math.sqrt(H ** 2 + ((E - G) ** 2) / 4)
        + (E + G) * Math.sqrt(H ** 2 + ((D - F) ** 2) / 4)
        + (D + E + F + G) * 80) / 1e6) * haoHutPhuKien.conThu,
    // Côn vuông-tròn & chân rẽ vuông-tròn: B x C, cao H, đường kính tròn J
    conVuongTron : ({ B, C, H, J }) => {
        const t = (pi * J) / 4;
        return (((B + t) * Math.sqrt(H ** 2 + (C - t) ** 2 / 4)
            + (C + t) * Math.sqrt(H ** 2 + (B - t) ** 2 / 4)
            + (B + C) * 2 * 40) / 1e6) * haoHutPhuKien.conThu;
    },
    // Lượn đứng/ngang (Z): B x C, cao H, lệch K
    luon : ({ B, C, H, K }) => (2 * (B + C) * Math.sqrt(H ** 2 + K ** 2 + (B + C) * 2 * 80) / 1e6) * haoHutPhuKien.luon,
    // Box gió vuông và côn: B x C, cao K
    boxGio : ({ B, C, K }) => ((B * C + 2 * C * K + 2 * B * K) / 1e6) * haoHutPhuKien.boxGio,
    // Côn thu tiêu âm (hình hộp): B x C x H, lỗ D x E
    conThuTieuAm : ({ B, C, H, D, E }) => ((2 * (B * C + C * H + B * H) - D * E) / 1e6) * haoHutPhuKien.conThuTieuAm,
    // Te ống gió (chạc 3): a1 = D, b = E, a2 = F (file Excel dùng hệ số 1.1 cố định)
    te : ({ D, E, F }) => {
        const nua = (a) => 0.5 * (pi * (1.5 * a) ** 2 - pi * (a / 2) ** 2) + (2 * pi * (1.5 * a) / 4) * E + (2 * pi * a / 8) * E;
        return ((nua(D) + nua(F)) / 1e6 - (2 * F * E) / 1e6) * 1.1;
    },
    // Tê rẽ nhánh R (Y): đầu lớn D x E, co 90 F x G, cao H
    teRe : ({ D, E, F, G, H }) => {
        const co = 0.5 * (pi * (1.5 * F) ** 2 - pi * (F / 2) ** 2) + (2 * pi * (1.5 * F) / 4) * G + (2 * pi * F / 8) * G;
        return (((2 * (D + E) * H) / 1e6 + co / 1e6 - (2 * F * G) / 1e6)
            + ((D + E) * 2 * 40 + (F + G) * 2 * 2 * 40) / 1e6) * haoHutPhuKien.te;
    }
};
const thanhTienPhuKien = (dienTich, donGiaM2) => excelRoundUp(dienTich * donGiaM2, -2);

// Dùng trong Node (test). Trên trình duyệt / dán thẳng vào file khác thì bỏ qua đoạn này.
if (typeof module !== "undefined") {
    module.exports = { tínhGiá, sanPham, dienTichPhuKien, thanhTienPhuKien, chiPhiLoMo, chiPhiTongHop, boGiaGI };
}
if (global) global.OngGioCalculator = { tínhGiá, sanPham, dienTichPhuKien };
})(typeof window !== "undefined" ? window : null);
