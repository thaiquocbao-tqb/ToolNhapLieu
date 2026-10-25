// ====================================================================================
// BẢNG GIÁ VAN GIÓ XUẤT XƯỞNG GSC — công thức tính giá từ file Excel
// Van: VCD, NRD, PRD, FD, MFD (tròn + vuông) và FD/MFD chuẩn EI60, EI120 (12 mã sản phẩm)
//
// Cách dùng:  tínhGiá(aIn, bIn, maSanPham, soLuong)
//   - Van TRÒN  (…-R)  : aIn = đường kính Ø (mm); bIn = chiều dài van (mm, bỏ trống = theo bảng của sheet)
//   - Van VUÔNG / EI   : aIn = chiều rộng W (mm, header cột); bIn = chiều cao H (mm, cột B của sheet)
//   Ví dụ: tínhGiá(300, 0, "GSC - RVCD", 1)        // van VCD tròn Ø300
//          tínhGiá(400, 500, "GSC - SVCD", 2)       // 2 van VCD vuông 400x500
// Giá trả về là giá xuất xưởng (VNĐ) × số lượng.
// ====================================================================================

;(function (global) {

// ------------------------------------------------------------------ Sheet "CP San Xuat"
const chiPhiCoBan = {
    tienMatBangNhaXuong : 8000000,
    chiPhiNhanVien : 65218750,        // 15tr trưởng xưởng + 5 NV vận hành (26 ngày + 15h OT x1.5) + 7tr quản lý kho
    chiPhiThuongThang13 : 65218750,
    dienNuoc : 3500000,
    chiPhiKhac : 1000000,
    thietBiSanXuat : 797270000 * 1.1  // tổng thiết bị 797.270.000 × 1.1 = 876.997.000
};
const chiPhiTongHop = {
    tienĐauTuMayMoc : chiPhiCoBan.thietBiSanXuat,
    soTienQuanLyVaVanHanhXuong1Thang : chiPhiCoBan.tienMatBangNhaXuong + 0 + chiPhiCoBan.chiPhiNhanVien + chiPhiCoBan.dienNuoc + chiPhiCoBan.chiPhiKhac,
    tongThuongThang13 : chiPhiCoBan.chiPhiThuongThang13,
    loiNhuanSanPham : 0.3,
    soThangHoiVonDauTuMayMoc : 60,
    heSoSale : 1.1 * 1.25 * 1.04 * 1.05 * 1.1,   // = 1.65165
    heSoPhuVanTronNho : 1.05                      // K32: van tròn Ø <= 200 nhân thêm
};

// ------------------------------------------------------------------ Đơn giá vật tư
const nguyenlieu = [
    { name : "Tole tấm 1200 x 0.6mm", gia : 110000, donVi : "m" },   // /1.2 ra đơn giá m2
    { name : "Tole tấm 1200 x 0.8mm", gia : 140000, donVi : "m" },
    { name : "Tole tấm 1200 x 1.0mm", gia : 180000, donVi : "m" },
    { name : "Tole tấm 1200 x 1.2mm", gia : 220000, donVi : "m" },
    { name : "Tole tấm 1200 x 1.4mm", gia : 280000, donVi : "m" },
    { name : "Tole tấm 1200 x 1.5mm", gia : 310000, donVi : "m" },
    { name : "Ty tròn rỗng Ø12.7 - cốt van", gia : 55000, donVi : "cây 6m" },
    { name : "Bulong Ø13", gia : 1200, donVi : "bộ" },
    { name : "Sắt hình lục vát", gia : 5000, donVi : "bộ" },
    { name : "Lò xo", gia : 5000, donVi : "bộ" },
    { name : "Cầu chì", gia : 45000, donVi : "bộ" },
    { name : "Đối trọng", gia : 70000, donVi : "bộ" },
    // --- Sheet "CP San Xuat FD" (van EI)
    { name : "Tole 1.2mm EI", gia : 431000, donVi : "m2" },
    { name : "KHS.FA.10 (10mm)", gia : 675000 / 2.4, donVi : "m2" },
    { name : "KHS.HF.M20 (20mm)", gia : 630000 / 2.4, donVi : "m2" },
    { name : "Vật tư phụ EI", gia : 20000 + 40000 + 20000 + 70000 + 20000 + 100000 + 180000 / 10 + 350000 / 10, donVi : "bộ" }
];
const giaNL = (ten) => nguyenlieu.find((n) => n.name === ten).gia;
const giaTole = (doDay) => giaNL("Tole tấm 1200 x " + doDay) / 1.2;          // đ/m2
const giaTyCotVanMet = giaNL("Ty tròn rỗng Ø12.7 - cốt van") / 6;            // đ/m

// ------------------------------------------------------------------ Bảng nhóm kích thước
// Nhóm: <=400 | 400<a<=600 | 600<a<=800 | 800<a<=950 | >950
const nhomKichThuoc = (a) => (a <= 400 ? 0 : a <= 600 ? 1 : a <= 800 ? 2 : a <= 950 ? 3 : 4);

// Van TRÒN (sheet "Price GSC - Tron")
const doDayKhungTron = ["1.2mm", "1.2mm", "1.0mm", "1.0mm", "1.2mm"];
const doDayLaTron    = ["1.2mm", "1.2mm", "1.0mm", "1.0mm", "1.2mm"];
const doDayKhungTronGoTay = { 900 : "1.2mm", 950 : "1.2mm" };   // sheet gõ tay 1.2mm cho Ø900, Ø950

// Van VUÔNG (sheet "Price GSC": E28:I30)
const kichThuocVuong = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1500];
const doDayKhungVuong = ["0.8mm", "0.8mm", "1.0mm", "1.0mm", "1.2mm"];
const doDayLaVuong    = ["0.8mm", "0.8mm", "0.8mm", "1.0mm", "1.0mm"];
const chieuDaiVanVuong = 200;

// Hệ số điều chỉnh thu hồi vốn của van vuông (các ô AJ/AK/AI... trong sheet). Hàng = H, cột = W theo kichThuocVuong.
const bangHeSoThuHoiVuong = [
    [0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.55, 0.55, 0.55, 0.55, 0.75, 0.75, 0.75, 0.75, 1.2, 1.2, 1.2, 1.275, 1.275, 1.275],
    [0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.5, 0.7, 0.7, 0.7, 0.7, 1.175, 1.175, 1.175, 1.25, 1.25, 1.25],
    [0.35, 0.3, 0.25, 0.25, 0.25, 0.25, 0.25, 0.45, 0.45, 0.45, 0.45, 0.65, 0.65, 0.65, 0.65, 1.15, 1.15, 1.15, 1.225, 1.225, 1.225],
    [0.35, 0.3, 0.25, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 0.6, 0.6, 0.6, 0.6, 1.125, 1.125, 1.125, 1.2, 1.2, 1.2],
    [0.35, 0.3, 0.25, 0.2, 0.15, 0.15, 0.15, 0.35, 0.35, 0.35, 0.35, 0.55, 0.55, 0.55, 0.55, 1.1, 1.1, 1.1, 1.175, 1.175, 1.175],
    [0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.1, 0.3, 0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.5, 1.075, 1.075, 1.075, 1.15, 1.15, 1.15],
    [0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0.25, 0.25, 0.25, 0.25, 0.45, 0.45, 0.45, 0.45, 1.05, 1.05, 1.05, 1.125, 1.125, 1.125],
    [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 1.025, 1.025, 1.025, 1.1, 1.1, 1.1],
    [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.15, 0.15, 0.35, 0.35, 0.35, 0.35, 1, 1, 1, 1.075, 1.075, 1.075],
    [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.1, 0.3, 0.3, 0.3, 0.3, 0.9, 0.9, 0.9, 1.05, 1.05, 1.05],
    [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0.25, 0.25, 0.25, 0.25, 0.8, 0.8, 0.8, 1.025, 1.025, 1.025],
    [0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.2, 0.2, 0.2, 0.7, 0.7, 0.7, 1, 1, 1],
    [0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.15, 0.15, 0.6, 0.6, 0.6, 0.9, 0.9, 0.9],
    [0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.1, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8],
    [0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0.4, 0.4, 0.4, 0.7, 0.7, 0.7],
    [1.2, 1.175, 1.15, 1.125, 1.1, 1.075, 1.05, 1.025, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3, 0.3, 0.6, 0.6, 0.6],
    [1.2, 1.175, 1.15, 1.125, 1.1, 1.075, 1.05, 1.025, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.2, 0.5, 0.5, 0.5],
    [1.2, 1.175, 1.15, 1.125, 1.1, 1.075, 1.05, 1.025, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.4, 0.4, 0.4],
    [1.275, 1.25, 1.225, 1.2, 1.175, 1.15, 1.125, 1.1, 1.075, 1.05, 1.025, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3, 0.3],
    [1.275, 1.25, 1.225, 1.2, 1.175, 1.15, 1.125, 1.1, 1.075, 1.05, 1.025, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.2],
    [1.275, 1.25, 1.225, 1.2, 1.175, 1.15, 1.125, 1.1, 1.075, 1.05, 1.025, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
];
// FD vuông: 6 ô trong sheet trỏ vào ô trống AV27 nên Excel coi = 0 (P20:P22, S23:S25)
const bangHeSoThuHoiFD = bangHeSoThuHoiVuong.map((h) => h.slice());
[[15, 11], [16, 11], [17, 11], [18, 14], [19, 14], [20, 14]].forEach(([h, w]) => { bangHeSoThuHoiFD[h][w] = 0; });

// ------------------------------------------------------------------ Danh sách sản phẩm
const sanPham = [
    // ---------- VAN TRÒN  (Price GSC - Tron)
    {
        maLoai: "PRICE-GSC-TRON", hinhDang: "tron",
        tenLoai: "VAN ĐIỀU CHỈNH LƯU LƯỢNG VCD TRÒN TAY GẠT", maSanPham: "GSC - RVCD",
        cauChi: 0, boLong: giaNL("Bulong Ø13"), loXo: 0, satLucVat: 0,
        giaTyMet: giaTyCotVanMet, haoHutVatTu: 0.1,
        heSoSanPhamThang: 120 * 26, heSoHoiVon: [1, 2, 3, 3.5, 4],
        heSoCanChinh: 1.1
    },
    {
        maLoai: "PRICE-GSC-TRON", hinhDang: "tron",
        tenLoai: "VAN GIÓ 1 CHIỀU NRD TRÒN", maSanPham: "GSC - NRD-R",
        cauChi: 0, boLong: 0, loXo: 0, satLucVat: 0,
        giaTyMet: giaTyCotVanMet, haoHutVatTu: 0.1,
        heSoSanPhamThang: 110 * 26, heSoHoiVon: [1, 2, 3, 3.3, 3.7],
        heSoCanChinh: 1.1
    },
    {
        maLoai: "PRICE-GSC-TRON", hinhDang: "tron",
        tenLoai: "VAN FD TRÒN - SỬ DỤNG CẦU CHÌ ( KHÔNG ĐẠT EI )", maSanPham: "GSC - FD - R",
        cauChi: giaNL("Cầu chì"), boLong: giaNL("Bulong Ø13"), loXo: giaNL("Lò xo"), satLucVat: 0,
        giaTyMet: giaTyCotVanMet / 1.2,   // sheet FD tròn: V20 = H12/1.2
        haoHutVatTu: 0.1,
        heSoSanPhamThang: 75 * 26, heSoHoiVon: [1, 1.8, 2.5, 2.8, 3.2],
        heSoCanChinh: 1.1
    },
    {
        maLoai: "PRICE-GSC-TRON", hinhDang: "tron",
        tenLoai: "VAN MFD/MFSD TRÒN - ( KHÔNG ĐẠT EI , CHƯA GỒM ĐỘNG CƠ )", maSanPham: "GSC - MFD&MFSD - R",
        cauChi: 0, boLong: giaNL("Bulong Ø13"), loXo: giaNL("Lò xo"), satLucVat: giaNL("Sắt hình lục vát"),
        giaTyMet: giaTyCotVanMet, haoHutVatTu: 0.1,
        heSoSanPhamThang: 75 * 26, heSoHoiVon: [1, 1.8, 2.5, 2.8, 3.2],
        heSoCanChinh: 1.1
    },
    // ---------- VAN VUÔNG  (Price GSC)
    {
        maLoai: "PRICE-GSC", hinhDang: "vuong",
        tenLoai: "VAN ĐIỀU CHỈNH LƯU LƯỢNG VCD VUÔNG", maSanPham: "GSC - SVCD",
        phuKien: 0, haoHutVatTu: 0.15,
        heSoSanPhamThang: 70 * 26, heSoThuLaiVon: [1.1, 1.5, 1.8, 2.3, 2.5],
        bangHeSo: bangHeSoThuHoiVuong
    },
    {
        maLoai: "PRICE-GSC", hinhDang: "vuong",
        tenLoai: "VAN GIÓ 1 CHIỀU NRD VUÔNG", maSanPham: "GSC - NRD - S",
        phuKien: 0, haoHutVatTu: 0.1,
        heSoSanPhamThang: 80 * 26, heSoThuLaiVon: [1, 1.5, 2, 2.5, 2.8],
        bangHeSo: bangHeSoThuHoiVuong
    },
    {
        maLoai: "PRICE-GSC", hinhDang: "vuong",
        tenLoai: "VAN XẢ ÁP PRD VUÔNG", maSanPham: "GSC - PRD",
        phuKien: giaNL("Đối trọng"), haoHutVatTu: 0.1,
        heSoSanPhamThang: 80 * 26, heSoThuLaiVon: [1, 1.5, 2, 2.5, 2.8],
        bangHeSo: bangHeSoThuHoiVuong
    },
    {
        maLoai: "PRICE-GSC", hinhDang: "vuong",
        tenLoai: "VAN FD VUÔNG - SỬ DỤNG CẦU CHÌ ( KHÔNG ĐẠT EI )", maSanPham: "GSC - FD",
        phuKien: giaNL("Lò xo") + giaNL("Cầu chì"), haoHutVatTu: 0.1,
        heSoSanPhamThang: 50 * 26, heSoThuLaiVon: [1, 1.55, 1.7, 2.2, 2.5],
        bangHeSo: bangHeSoThuHoiFD
    },
    {
        maLoai: "PRICE-GSC", hinhDang: "vuong",
        tenLoai: "VAN MFD/MFSD VUÔNG - ( KHÔNG ĐẠT EI , CHƯA GỒM ĐỘNG CƠ )", maSanPham: "GSC - MFD&MFSD",
        phuKien: giaNL("Sắt hình lục vát"), haoHutVatTu: 0.1,
        heSoSanPhamThang: 100 * 26, heSoThuLaiVon: [2.1, 2.1, 2.1, 2.5, 2.8],
        bangHeSo: bangHeSoThuHoiVuong
    },
    // ---------- VAN CHỐNG CHÁY CHUẨN EI (FD.MFD.EI120 / EI60) — chưa gồm động cơ
    {
        maLoai: "FD.MFD.EI", hinhDang: "ei",
        tenLoai: "VAN CHỐNG CHÁY FIRE DAMPER CHUẨN EI120", maSanPham: "GSC - MFD/Ei120",
        chieuDaiVan: 200, haoHutVatTu: 0.2, chiPhiSanXuat: 1, loiNhuan: 0.3, canChinh: -0.15 - 0.17
    },
    {
        maLoai: "FD.MFD.EI", hinhDang: "ei",
        tenLoai: "VAN CHỐNG CHÁY FIRE DAMPER CHUẨN EI60", maSanPham: "GSC - MFD/Ei60",
        heSoSoVoiEI120: 0.75      // EI60 = ROUNDUP(EI120 × 0.75, -3)
    },
    {
        // Trong Excel đây chỉ là ô chọn: lấy giá từ sheet FD.MFD.EI, sheet này lại chọn EI60 hoặc EI120 theo ô C2
        maLoai: "FD.MFD.EI", hinhDang: "ei",
        tenLoai: "VAN CHỐNG CHÁY FD & MFD CHUẨN EI (chọn EI60 / EI120)", maSanPham: "GSC - FD&MFD/Ei",
        chonEI: "GSC - MFD/Ei60"      // = ô FD.MFD.EI!C2 (đang chọn Ei60). Đổi thành "GSC - MFD/Ei120" nếu cần
    }
];
const tim = (ma) => sanPham.find((s) => s.maSanPham === ma);

// "Thu hồi vốn trên toàn sản phẩm trong tháng" = (vận hành xưởng + đầu tư máy/60 tháng + thưởng tháng 13/12)
const thuHoiVonTrenToanSanPhamTrongThang = (chiPhiTongHop.soTienQuanLyVaVanHanhXuong1Thang + (chiPhiTongHop.tienĐauTuMayMoc / chiPhiTongHop.soThangHoiVonDauTuMayMoc) + chiPhiTongHop.tongThuongThang13 / 12);

// ROUND(x,-3) và ROUNDUP(x,-3) kiểu Excel (Excel chỉ giữ 15 chữ số có nghĩa)
const lamSach = (x) => Number(x.toPrecision(15));
const lamTronNghin = (x) => Math.sign(x) * Math.round(lamSach(Math.abs(x)) / 1000) * 1000;
const lamTronLenNghin = (x) => Math.sign(x) * Math.ceil(lamSach(Math.abs(x)) / 1000) * 1000;

// ------------------------------------------------------------------ VAN TRÒN (sheet "Price xxx - Tron", cột K)
function giaVanTron(sp, duongKinh, chieuDai) {
    const nhom = nhomKichThuoc(duongKinh);
    const doDayKhung = doDayKhungTronGoTay[duongKinh] || doDayKhungTron[nhom];
    const doDayLa = doDayLaTron[nhom];

    const dienTichTon = (Math.PI * duongKinh * chieuDai) / 1e6;          // F: diện tích tôn thân (m2)
    const dienTichLa = Math.PI * (duongKinh / 2 / 1000) ** 2;            // G: diện tích lá van (m2)

    const tienTole = dienTichTon * giaTole(doDayKhung);                 // L
    const tienTy = sp.giaTyMet * (duongKinh / 1000 + 0.1);               // N
    const phuKien = sp.cauChi + sp.boLong + sp.loXo + sp.satLucVat;      // M, O, R, S
    // I: giá vốn vật tư (hao hụt lần 1)
    const giaVonVatTu = (tienTole + sp.cauChi + tienTy + sp.boLong + sp.loXo + sp.satLucVat + dienTichLa * giaTole(doDayLa)) * (1 + sp.haoHutVatTu);
    // thu hồi vốn: (chi phí cố định / sản lượng) × hệ số theo nhóm
    const thuHoiVon = (thuHoiVonTrenToanSanPhamTrongThang / sp.heSoSanPhamThang) * sp.heSoHoiVon[nhom];
    const heSoPhu = duongKinh <= 200 ? chiPhiTongHop.heSoPhuVanTronNho : 1;

    // K: Excel nhân hao hụt lần 2 ở bước này: I*(1+J)
    return lamTronNghin((giaVonVatTu * (1 + sp.haoHutVatTu) + thuHoiVon) * (1 + chiPhiTongHop.loiNhuanSanPham) * chiPhiTongHop.heSoSale * heSoPhu);
}

// ------------------------------------------------------------------ VAN VUÔNG (sheet "Price xxx - Vuong")
function giaVanVuong(sp, rong, cao) {
    const iW = kichThuocVuong.indexOf(rong);
    const iH = kichThuocVuong.indexOf(cao);
    if (iW < 0 || iH < 0) throw new RangeError("Kích thước " + rong + "x" + cao + " không có trong bảng giá van vuông. Hợp lệ: " + kichThuocVuong.join(", "));
    const canLon = Math.max(rong, cao);
    const nhom = nhomKichThuoc(canLon);                                  // nhóm theo cạnh lớn nhất

    const tienKhung = ((rong + cao) * 2 * chieuDaiVanVuong) / 1e6 * giaTole(doDayKhungVuong[nhom]);
    const tienTy = ((canLon + 50) / 1000) * giaTyCotVanMet;
    const tienLa = ((rong * cao) / 1e6) * giaTole(doDayLaVuong[nhom]);
    const giaVonVatTu = tienKhung + tienTy + tienLa + giaNL("Bulong Ø13") + sp.phuKien;

    const donGiaThuHoi = thuHoiVonTrenToanSanPhamTrongThang / sp.heSoSanPhamThang;
    // nhóm <=400 không nhân tỉ lệ, các nhóm còn lại nhân (cạnh lớn / 400)
    const thuHoiVon = donGiaThuHoi * (sp.heSoThuLaiVon[nhom] - sp.bangHeSo[iH][iW]) * (nhom === 0 ? 1 : canLon / 400);

    return lamTronNghin(((giaVonVatTu * (1 + sp.haoHutVatTu) + thuHoiVon) * (1 + chiPhiTongHop.loiNhuanSanPham)) * chiPhiTongHop.heSoSale);
}

// ------------------------------------------------------------------ VAN EI120 (sheet "FD.MFD.EI120")
function giaVanEI120(sp, rong, cao) {
    const tole = giaNL("Tole 1.2mm EI"), fa10 = giaNL("KHS.FA.10 (10mm)"), hf20 = giaNL("KHS.HF.M20 (20mm)");
    const chuVi = ((rong + cao + 40) * 2) / 1000;                        // chu vi cộng 40mm (m)
    const dienTich = (cao * rong) / 1e6;                                 // m2
    const L = sp.chieuDaiVan;

    const khungTole = chuVi * (300 / 1000) * tole;                       // Vật tư khung tole
    const khungChongChay = chuVi * ((L - 60) / 1000) * hf20 + chuVi * (L / 1000) * fa10 * 2; // Vật tư khung chống cháy
    const laTole = dienTich * tole;                                      // Vật tư lá tole
    const laChongChay = dienTich * hf20 + dienTich * fa10 * 2;           // Vật tư lá chống cháy
    const vatTuPhu = giaNL("Vật tư phụ EI");

    const vatTu = khungTole + khungChongChay + laTole + laChongChay + vatTuPhu;
    // × (1+hao hụt 20%) × (1+chi phí SX 100%) × (1+lợi nhuận 30%) × (1+cân chỉnh -32%)
    const heSo = (1 + sp.haoHutVatTu) * (1 + sp.chiPhiSanXuat) * (1 + sp.loiNhuan) * (1 + sp.canChinh);
    return lamTronLenNghin(vatTu * heSo);
}

// ------------------------------------------------------------------ HÀM CHÍNH
function tínhGiá(aIn, bIn, maSanPham, soLuong = 1) {
    switch (maSanPham) {
        case sanPham[0].maSanPham:      // GSC - RVCD
        case sanPham[1].maSanPham:      // GSC - NRD-R
        case sanPham[2].maSanPham:      // GSC - FD - R
        case sanPham[3].maSanPham: {    // GSC - MFD&MFSD - R
            const sp = tim(maSanPham);
            const chieuDai = bIn || Math.max(200, aIn);                  // bảng sheet: Ø<=200 → L=200, còn lại L=Ø
            const giaSheet = giaVanTron(sp, aIn, chieuDai);
            // Price GSC - Tron: ROUNDUP(giá sheet × hệ số cân chỉnh 1.1, -3)
            const gia = lamTronLenNghin(giaSheet * sp.heSoCanChinh);
            return gia * soLuong;
        }
        case sanPham[4].maSanPham:      // GSC - SVCD
        case sanPham[5].maSanPham:      // GSC - NRD - S
        case sanPham[6].maSanPham:      // GSC - PRD
        case sanPham[7].maSanPham:      // GSC - FD
        case sanPham[8].maSanPham: {    // GSC - MFD&MFSD
            // Price GSC lấy nguyên giá ở sheet từng loại, không nhân thêm hệ số cân chỉnh
            const gia = giaVanVuong(tim(maSanPham), aIn, bIn);
            return gia * soLuong;
        }
        case sanPham[9].maSanPham: {    // GSC - MFD/Ei120
            const gia = giaVanEI120(tim(maSanPham), aIn, bIn);
            return gia * soLuong;
        }
        case sanPham[10].maSanPham: {   // GSC - MFD/Ei60 = ROUNDUP(EI120 × 0.75, -3)
            const gia = lamTronLenNghin(giaVanEI120(sanPham[9], aIn, bIn) * sanPham[10].heSoSoVoiEI120);
            return gia * soLuong;
        }
        case sanPham[11].maSanPham: {   // GSC - FD&MFD/Ei → theo ô chọn của sheet FD.MFD.EI
            return tínhGiá(aIn, bIn, sanPham[11].chonEI, soLuong);
        }
        default:
            throw new Error("Mã sản phẩm không hợp lệ: " + maSanPham + ". Hợp lệ: " + sanPham.map((s) => s.maSanPham).join(" | "));
    }
}

if (typeof module !== "undefined") module.exports = { tínhGiá, sanPham, giaVanTron, tim };
if (global) global.VanGioCalculator = { tínhGiá, sanPham, giaVanTron, tim };
})(typeof window !== "undefined" ? window : null);