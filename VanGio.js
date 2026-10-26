// ====================================================================================
// BẢNG GIÁ VAN GIÓ XUẤT XƯỞNG GSC — Công thức tính giá khớp 100% với file Excel gốc
// Van: VCD, NRD, PRD, FD, MFD (tròn + vuông) và FD/MFD chuẩn EI60, EI120 (12 mã sản phẩm)
// Hỗ trợ chọn độ dày tôn: "0.6mm", "0.8mm", "1.0mm", "1.2mm", "1.4mm", "1.5mm" hoặc "spec"
//
// Cách dùng:
//   tínhGiá(aIn, bIn, maSanPham, soLuong, doDayKhung, doDayLa, tuyChon)
//   - aIn, bIn   : Van TRÒN -> aIn = Đường kính Ø (mm), bIn = Chiều dài L (mm, để 0 = mặc định)
//                  Van VUÔNG/EI -> aIn = Rộng W (mm, dòng 3), bIn = Cao H (mm, cột B)
//   - maSanPham  : Mã van (VD: "GSC - RVCD", "GSC - SVCD", "GSC - MFD/Ei60"...)
//   - soLuong    : Số lượng van (mặc định = 1)
//   - doDayKhung : (Tùy chọn) Độ dày tôn khung: "0.6mm".."1.5mm" (hoặc số 0.6..1.5),
//                  hoặc mảng 5 nhóm kích thước, hoặc "spec" (lấy theo bảng DB25:DG36),
//                  hoặc truyền luôn object tuyChon vào vị trí này.
//   - doDayLa    : (Tùy chọn) Độ dày tôn lá: "0.6mm".."1.5mm" (hoặc số 0.6..1.5), hoặc mảng 5 nhóm.
//                  (Lưu ý: Van chuẩn EI sản xuất theo hồ sơ kiểm định 1.2mm nên không đổi độ dày).
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
    tienDauTuMayMoc : chiPhiCoBan.thietBiSanXuat,
    soTienQuanLyVaVanHanhXuong1Thang :
        chiPhiCoBan.tienMatBangNhaXuong + 0 + chiPhiCoBan.chiPhiNhanVien + chiPhiCoBan.dienNuoc + chiPhiCoBan.chiPhiKhac,
    tongThuongThang13 : chiPhiCoBan.chiPhiThuongThang13,
    loiNhuanSanPham : 0.3,
    soThangHoiVonDauTuMayMoc : 60,
    heSoSale : 1.1 * 1.25 * 1.04 * 1.05 * 1.1,   // = 1.65165
    heSoPhuVanTronNho : 1.05                      // K32: van tròn Ø <= 200 nhân thêm 1.05
};

// ------------------------------------------------------------------ Đơn giá vật tư (AB6:AC11 & U14:V19)
const nguyenlieu = [
    { name : "Tole tấm 1200 x 0.6mm", gia : 110000, donVi : "m" },   // 0.58mm -> 91.666,67 đ/m2
    { name : "Tole tấm 1200 x 0.8mm", gia : 140000, donVi : "m" },   // 0.75mm -> 116.666,67 đ/m2
    { name : "Tole tấm 1200 x 1.0mm", gia : 180000, donVi : "m" },   // 0.95mm -> 150.000,00 đ/m2
    { name : "Tole tấm 1200 x 1.2mm", gia : 220000, donVi : "m" },   // 1.15mm -> 183.333,33 đ/m2
    { name : "Tole tấm 1200 x 1.4mm", gia : 280000, donVi : "m" },   // 1.38mm -> 233.333,33 đ/m2
    { name : "Tole tấm 1200 x 1.5mm", gia : 310000, donVi : "m" },   // 1.38mm dày -> 258.333,33 đ/m2
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

const danhSachDoDayHopLe = ["0.6mm", "0.8mm", "1.0mm", "1.2mm", "1.4mm", "1.5mm"];

// Chuẩn hóa đầu vào độ dày tôn (VD: 0.8 -> "0.8mm", "1" -> "1.0mm", "1.2mm" -> "1.2mm")
function chuanHoaDoDay(val) {
    if (val === undefined || val === null || val === "") return null;
    if (typeof val === "number") {
        const s = val.toFixed(1) + "mm";
        if (!danhSachDoDayHopLe.includes(s)) {
            throw new RangeError("Độ dày tôn không hợp lệ: " + val + ". Hỗ trợ: " + danhSachDoDayHopLe.join(", "));
        }
        return s;
    }
    const str = String(val).trim().toLowerCase();
    if (!str) return null;
    const num = parseFloat(str.replace("mm", "").trim());
    if (Number.isNaN(num)) {
        throw new RangeError("Độ dày tôn không hợp lệ: " + val + ". Hỗ trợ: " + danhSachDoDayHopLe.join(", "));
    }
    const ketQua = num.toFixed(1) + "mm";
    if (!danhSachDoDayHopLe.includes(ketQua)) {
        throw new RangeError("Độ dày tôn không hợp lệ: " + val + ". Hỗ trợ: " + danhSachDoDayHopLe.join(", "));
    }
    return ketQua;
}

const giaNL = (ten) => {
    const item = nguyenlieu.find((n) => n.name === ten);
    if (!item) throw new Error("Không tìm thấy nguyên liệu: " + ten);
    return item.gia;
};
const giaTole = (doDay) => giaNL("Tole tấm 1200 x " + chuanHoaDoDay(doDay)) / 1.2; // đ/m2
const giaTyCotVanMet = giaNL("Ty tròn rỗng Ø12.7 - cốt van") / 6;                  // đ/m

// ------------------------------------------------------------------ Bảng nhóm kích thước & Độ dày
// 5 Nhóm kích thước: <=400 (0) | 400<a<=600 (1) | 600<a<=800 (2) | 800<a<=950 (3) | >950 (4)
const nhomKichThuoc = (a) => (a <= 400 ? 0 : a <= 600 ? 1 : a <= 800 ? 2 : a <= 950 ? 3 : 4);

// Độ dày đang lưu mặc định trên mặt sheet "Price GSC - Tron" (D30:H31 & F24:F25)
const cauHinhDoDayMacDinh = {
    doDayKhungTron : ["1.2mm", "1.2mm", "1.0mm", "1.0mm", "1.2mm"],
    doDayLaTron    : ["1.2mm", "1.2mm", "1.0mm", "1.0mm", "1.2mm"],
    doDayKhungTronGoTay : { 900 : "1.2mm", 950 : "1.2mm" }, // F24, F25 trên Price GSC - Tron gõ tay 1.2mm

    // Độ dày đang lưu mặc định trên mặt sheet "Price GSC" (E28:I30)
    doDayKhungVuong : ["0.8mm", "0.8mm", "1.0mm", "1.0mm", "1.2mm"],
    doDayLaVuong    : ["0.8mm", "0.8mm", "0.8mm", "1.0mm", "1.0mm"],
    chieuDaiVanVuong : [200, 200, 200, 200, 200],
    theoSpecGSC : false
};

// Bảng Quy Chuẩn Độ Dày GSC ẩn tại vùng DB25:DG36 của sheet "Price GSC"
const bangSpecDoDayVuongGSC = {
    "GSC - SVCD"     : { khung: ["0.8mm", "0.8mm", "1.0mm", "1.0mm", "1.2mm"], la: ["0.8mm", "0.8mm", "0.8mm", "1.0mm", "1.0mm"] },
    "GSC - NRD - S"  : { khung: ["0.8mm", "0.8mm", "1.0mm", "1.0mm", "1.2mm"], la: ["0.6mm", "0.6mm", "0.6mm", "0.6mm", "0.6mm"] },
    "GSC - PRD"      : { khung: ["0.8mm", "0.8mm", "1.0mm", "1.0mm", "1.2mm"], la: ["0.8mm", "0.8mm", "0.8mm", "0.8mm", "1.0mm"] },
    "GSC - FD"       : { khung: ["1.2mm", "1.2mm", "1.2mm", "1.2mm", "1.2mm"], la: ["1.2mm", "1.2mm", "1.2mm", "1.2mm", "1.2mm"] },
    "GSC - MFD&MFSD" : { khung: ["1.2mm", "1.2mm", "1.2mm", "1.2mm", "1.2mm"], la: ["1.2mm", "1.2mm", "1.2mm", "1.2mm", "1.2mm"] },
    "GSC - FD&MFD/Ei": { khung: ["1.2mm", "1.2mm", "1.2mm", "1.2mm", "1.2mm"], la: ["1.2mm", "1.2mm", "1.2mm", "1.2mm", "1.2mm"] }
};

// Hàm cho phép đổi cấu hình độ dày toàn cục (giống thao tác chọn Dropdown ở E29:I30 hoặc D30:H31 trên Excel)
function datDoDayToanCuc(cauHinhMoi = {}) {
    if (cauHinhMoi.doDayKhungVuong) {
        cauHinhDoDayMacDinh.doDayKhungVuong = Array.isArray(cauHinhMoi.doDayKhungVuong)
            ? cauHinhMoi.doDayKhungVuong.map(chuanHoaDoDay)
            : Array(5).fill(chuanHoaDoDay(cauHinhMoi.doDayKhungVuong));
    }
    if (cauHinhMoi.doDayLaVuong) {
        cauHinhDoDayMacDinh.doDayLaVuong = Array.isArray(cauHinhMoi.doDayLaVuong)
            ? cauHinhMoi.doDayLaVuong.map(chuanHoaDoDay)
            : Array(5).fill(chuanHoaDoDay(cauHinhMoi.doDayLaVuong));
    }
    if (cauHinhMoi.doDayKhungTron) {
        cauHinhDoDayMacDinh.doDayKhungTron = Array.isArray(cauHinhMoi.doDayKhungTron)
            ? cauHinhMoi.doDayKhungTron.map(chuanHoaDoDay)
            : Array(5).fill(chuanHoaDoDay(cauHinhMoi.doDayKhungTron));
    }
    if (cauHinhMoi.doDayLaTron) {
        cauHinhDoDayMacDinh.doDayLaTron = Array.isArray(cauHinhMoi.doDayLaTron)
            ? cauHinhMoi.doDayLaTron.map(chuanHoaDoDay)
            : Array(5).fill(chuanHoaDoDay(cauHinhMoi.doDayLaTron));
    }
    if (typeof cauHinhMoi.theoSpecGSC === "boolean") {
        cauHinhDoDayMacDinh.theoSpecGSC = cauHinhMoi.theoSpecGSC;
    }
    if (cauHinhMoi.boGoTay900_950 === true) {
        cauHinhDoDayMacDinh.doDayKhungTronGoTay = {};
    } else if (cauHinhMoi.boGoTay900_950 === false) {
        cauHinhDoDayMacDinh.doDayKhungTronGoTay = { 900 : "1.2mm", 950 : "1.2mm" };
    }
    return { ...cauHinhDoDayMacDinh };
}

const kichThuocVuong = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1500];

// Hệ số điều chỉnh thu hồi vốn của van vuông (các ô ẩn AJ/AK/AI... trong sheet). Hàng = H (iH), Cột = W (iW).
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
    [1.275, 1.25, 1.225, 1.2, 1.175, 1.15, 1.125, 1.1, 1.075, 1.05, 1.025, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]
];
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
        giaTyMet: giaTyCotVanMet / 1.2,   // sheet Price FD - Tron: ô V20 = H12/1.2
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
        maLoai: "FD.MFD.EI", hinhDang: "ei",
        tenLoai: "VAN CHỐNG CHÁY FD & MFD CHUẨN EI (chọn EI60 / EI120)", maSanPham: "GSC - FD&MFD/Ei",
        chonEI: "GSC - MFD/Ei60"
    }
];

const chuanHoaMa = (ma) => String(ma || "").trim();
const tim = (ma) => sanPham.find((s) => s.maSanPham === chuanHoaMa(ma));

// "Thu hồi vốn trên toàn sản phẩm trong tháng" = (vận hành xưởng + đầu tư máy/60 tháng + thưởng tháng 13/12)
const thuHoiVonTrenToanSanPhamTrongThang =
    chiPhiTongHop.soTienQuanLyVaVanHanhXuong1Thang +
    chiPhiTongHop.tienĐauTuMayMoc / chiPhiTongHop.soThangHoiVonDauTuMayMoc +
    chiPhiTongHop.tongThuongThang13 / 12;

// ROUND(x,-3) và ROUNDUP(x,-3) chuẩn 15 chữ số có nghĩa của Excel
const lamSach = (x) => Number(x.toPrecision(15));
const lamTronNghin = (x) => Math.sign(x) * Math.round(lamSach(Math.abs(x)) / 1000) * 1000;
const lamTronLenNghin = (x) => Math.sign(x) * Math.ceil(lamSach(Math.abs(x)) / 1000) * 1000;

// Giải quyết độ dày khung & lá cho từng nhóm kích thước
function layDoDayTheoNhom(giaTriTruyenVao, mangMacDinh, nhom) {
    if (giaTriTruyenVao === undefined || giaTriTruyenVao === null || giaTriTruyenVao === "") {
        return mangMacDinh[nhom];
    }
    if (Array.isArray(giaTriTruyenVao)) {
        return chuanHoaDoDay(giaTriTruyenVao[nhom]);
    }
    return chuanHoaDoDay(giaTriTruyenVao);
}

// ------------------------------------------------------------------ VAN TRÒN (sheet "Price xxx - Tron", cột K)
function giaVanTron(sp, duongKinh, chieuDai = Math.max(200, duongKinh), doDayKhungTuyChon = null, doDayLaTuyChon = null) {
    const L = chieuDai || Math.max(200, duongKinh);
    const nhom = nhomKichThuoc(duongKinh);

    // Nếu người dùng truyền doDayKhungTuyChon thì ưu tiên dùng; nếu không mới lấy theo sheet (gồm cả ô gõ tay 900, 950)
    const doDayKhung =
        doDayKhungTuyChon !== undefined && doDayKhungTuyChon !== null && doDayKhungTuyChon !== ""
            ? layDoDayTheoNhom(doDayKhungTuyChon, cauHinhDoDayMacDinh.doDayKhungTron, nhom)
            : cauHinhDoDayMacDinh.doDayKhungTronGoTay[duongKinh] || cauHinhDoDayMacDinh.doDayKhungTron[nhom];

    const doDayLa = layDoDayTheoNhom(doDayLaTuyChon, cauHinhDoDayMacDinh.doDayLaTron, nhom);

    const dienTichTon = (Math.PI * duongKinh * L) / 1e6;                   // F: diện tích tôn thân (m2)
    const dienTichLa = Math.PI * (duongKinh / 2 / 1000) ** 2;              // G: diện tích lá van (m2)

    const tienTole = dienTichTon * giaTole(doDayKhung);                    // L
    const tienTy = sp.giaTyMet * (duongKinh / 1000 + 0.1);                 // N
    // I: giá vốn vật tư (hao hụt lần 1)
    const giaVonVatTu =
        (tienTole + sp.cauChi + tienTy + sp.boLong + sp.loXo + sp.satLucVat + dienTichLa * giaTole(doDayLa)) *
        (1 + sp.haoHutVatTu);
    // Thu hồi vốn: (chi phí cố định / sản lượng) × hệ số theo nhóm
    const thuHoiVon = (thuHoiVonTrenToanSanPhamTrongThang / sp.heSoSanPhamThang) * sp.heSoHoiVon[nhom];
    const heSoPhu = duongKinh <= 200 ? chiPhiTongHop.heSoPhuVanTronNho : 1;

    // K: Excel nhân hao hụt lần 2 ở bước này: I*(1+J)
    return lamTronNghin(
        (giaVonVatTu * (1 + sp.haoHutVatTu) + thuHoiVon) *
        (1 + chiPhiTongHop.loiNhuanSanPham) *
        chiPhiTongHop.heSoSale *
        heSoPhu
    );
}

// ------------------------------------------------------------------ VAN VUÔNG (sheet "Price xxx - Vuong")
function giaVanVuong(sp, rong, cao, doDayKhungTuyChon = null, doDayLaTuyChon = null, theoSpecGSC = cauHinhDoDayMacDinh.theoSpecGSC, chieuDaiTuyChon = null) {
    const iW = kichThuocVuong.indexOf(rong);
    const iH = kichThuocVuong.indexOf(cao);
    if (iW < 0 || iH < 0) {
        throw new RangeError(
            "Kích thước " + rong + "x" + cao + " không có trong bảng giá van vuông. Hợp lệ: " + kichThuocVuong.join(", ")
        );
    }
    const canLon = Math.max(rong, cao);
    const nhom = nhomKichThuoc(canLon);                                    // nhóm theo cạnh lớn nhất

    // Chọn bảng độ dày mặc định (theo mặt sheet Price GSC!E29:I30 hoặc theo bảng Spec ẩn DB25:DG36)
    const specSP = bangSpecDoDayVuongGSC[sp.maSanPham];
    const mangKhungMacDinh = theoSpecGSC && specSP ? specSP.khung : cauHinhDoDayMacDinh.doDayKhungVuong;
    const mangLaMacDinh    = theoSpecGSC && specSP ? specSP.la    : cauHinhDoDayMacDinh.doDayLaVuong;

    const doDayKhung = layDoDayTheoNhom(doDayKhungTuyChon, mangKhungMacDinh, nhom);
    const doDayLa    = layDoDayTheoNhom(doDayLaTuyChon, mangLaMacDinh, nhom);
    const L          = chieuDaiTuyChon || cauHinhDoDayMacDinh.chieuDaiVanVuong[nhom] || 200;

    const tienKhung = (((rong + cao) * 2 * L) / 1e6) * giaTole(doDayKhung);
    const tienTy = ((canLon + 50) / 1000) * giaTyCotVanMet;
    const tienLa = ((rong * cao) / 1e6) * giaTole(doDayLa);
    const giaVonVatTu = tienKhung + tienTy + tienLa + giaNL("Bulong Ø13") + sp.phuKien;

    const donGiaThuHoi = thuHoiVonTrenToanSanPhamTrongThang / sp.heSoSanPhamThang;
    // nhóm <=400 không nhân tỉ lệ, các nhóm còn lại nhân (cạnh lớn / 400)
    const thuHoiVon = donGiaThuHoi * (sp.heSoThuLaiVon[nhom] - sp.bangHeSo[iH][iW]) * (nhom === 0 ? 1 : canLon / 400);

    return lamTronNghin(
        (giaVonVatTu * (1 + sp.haoHutVatTu) + thuHoiVon) *
        (1 + chiPhiTongHop.loiNhuanSanPham) *
        chiPhiTongHop.heSoSale
    );
}

// ------------------------------------------------------------------ VAN EI120 & EI60 (sheet "FD.MFD.EI120" / "FD.MFD.EI60")
function chuanHoaKichThuocMaTranEI(rong, cao, theoBangMaTranEI = true) {
    if (!theoBangMaTranEI) return { w: rong, h: cao };
    const w = rong === 1900 ? 1500 : rong;
    const h = cao === 750 ? 760 : cao === 1900 ? 1600 : cao;
    return { w, h };
}

function tinhVatTuGocEI(spEI120, w, h) {
    const tole = giaNL("Tole 1.2mm EI"), fa10 = giaNL("KHS.FA.10 (10mm)"), hf20 = giaNL("KHS.HF.M20 (20mm)");
    const chuVi = ((w + h + 40) * 2) / 1000;                               // chu vi cộng 40mm (m)
    const dienTich = (h * w) / 1e6;                                        // m2
    const L = spEI120.chieuDaiVan;

    const khungTole = chuVi * (300 / 1000) * tole;                         // Q36: Vật tư khung tole
    const khungChongChay = chuVi * ((L - 60) / 1000) * hf20 + chuVi * (L / 1000) * fa10 * 2; // Q38: Vật tư khung chống cháy
    const laTole = dienTich * tole;                                        // Q37: Vật tư lá tole
    const laChongChay = dienTich * hf20 + dienTich * fa10 * 2;             // Q39: Vật tư lá chống cháy
    const vatTuPhu = giaNL("Vật tư phụ EI");                               // Q40: Vật tư phụ cố định

    return khungTole + khungChongChay + laTole + laChongChay + vatTuPhu;
}

function giaVanEI120(sp, rong, cao, theoBangMaTranEI = true) {
    const { w, h } = chuanHoaKichThuocMaTranEI(rong, cao, theoBangMaTranEI);
    const vatTu = tinhVatTuGocEI(sp, w, h);
    const heSo = (1 + sp.haoHutVatTu) * (1 + sp.chiPhiSanXuat) * (1 + sp.loiNhuan) * (1 + sp.canChinh);
    return lamTronLenNghin(vatTu * heSo);
}

function tínhGiáEITheoÔNhậpLiệu(rong, cao, maSanPham = "GSC - MFD/Ei120", soLuong = 1) {
    const spEI120 = sanPham[9];
    const vatTu = tinhVatTuGocEI(spEI120, rong, cao);
    const giaThanhPhamU36 = vatTu * (1 + spEI120.chiPhiSanXuat) * (1 + spEI120.haoHutVatTu); // U36
    const giaDuKienU37 = lamTronLenNghin(giaThanhPhamU36 * (1 + spEI120.loiNhuan));          // U37: ROUNDUP lần 1
    const giaEI120_U38 = lamTronLenNghin(giaDuKienU37 * (1 + spEI120.canChinh));             // U38: ROUNDUP lần 2
    const giaEI60_U39 = lamTronLenNghin(giaEI120_U38 * sanPham[10].heSoSoVoiEI120);          // U39: ROUNDUP(U38*0.75, -3)

    const ma = chuanHoaMa(maSanPham);
    const maThuc = ma === sanPham[11].maSanPham ? sanPham[11].chonEI : ma;
    if (maThuc === sanPham[9].maSanPham) return giaEI120_U38 * soLuong;
    if (maThuc === sanPham[10].maSanPham) return giaEI60_U39 * soLuong;
    throw new Error("Mã EI không hợp lệ: " + maSanPham);
}

// ------------------------------------------------------------------ HÀM CHÍNH
function tínhGiá(aIn, bIn, maSanPham, soLuong = 1, doDayKhung = null, doDayLa = null, tuyChon = {}) {
    // Cho phép truyền object tuyChon ở vị trí tham số thứ 5 (doDayKhung)
    let opts = tuyChon || {};
    let dkInput = doDayKhung;
    let dlInput = doDayLa;

    if (dkInput && typeof dkInput === "object" && !Array.isArray(dkInput)) {
        opts = dkInput;
        dkInput = null;
        dlInput = null;
    }

    const {
        theoBangMaTranEI = true,      // true = khớp 100% ma trận Excel (gồm cả hàng B18=760, B33=1600, AF3=1500)
        theoONhapLieuEI = false,      // true = khớp với ô tính nhanh U38/U39 ở cuối sheet FD.MFD.EI
        chuaNhanCanChinhTron = false, // true = lấy giá cột K của 4 sheet ẩn van tròn (chưa nhân 1.1)
        daoChieuRongCao = false,      // true = truyền (Cao_HàngB, Rộng_CộtD) thay vì (Rộng_CộtD, Cao_HàngB)
        theoSpecGSC = cauHinhDoDayMacDinh.theoSpecGSC, // true = lấy độ dày theo bảng Spec ẩn DB25:DG36
        doDayTon = null,              // nếu truyền doDayTon trong tuyChon, áp dụng cho cả khung và lá
        chieuDaiVan = null            // cho phép đổi chiều dài thân van vuông L (mm)
    } = opts;

    // Nếu truyền chuỗi "spec" vào tham số doDayKhung -> bật chế độ lấy theo bảng Spec GSC (DB25:DG36)
    const dungSpecGSC =
        theoSpecGSC ||
        (typeof dkInput === "string" && dkInput.trim().toLowerCase() === "spec");

    const dkThuc =
        typeof dkInput === "string" && dkInput.trim().toLowerCase() === "spec"
            ? null
            : dkInput !== null && dkInput !== undefined
            ? dkInput
            : opts.doDayKhung !== undefined
            ? opts.doDayKhung
            : doDayTon;

    const dlThuc =
        dlInput !== null && dlInput !== undefined
            ? dlInput
            : opts.doDayLa !== undefined
            ? opts.doDayLa
            : doDayTon;

    const ma = chuanHoaMa(maSanPham);
    const rong = daoChieuRongCao ? bIn : aIn;
    const cao  = daoChieuRongCao ? aIn : bIn;

    switch (ma) {
        case sanPham[0].maSanPham:      // GSC - RVCD
        case sanPham[1].maSanPham:      // GSC - NRD-R
        case sanPham[2].maSanPham:      // GSC - FD - R
        case sanPham[3].maSanPham: {    // GSC - MFD&MFSD - R
            const sp = tim(ma);
            const chieuDai = bIn || Math.max(200, aIn);                  // bảng sheet: Ø<=200 → L=200, còn lại L=Ø
            const giaSheet = giaVanTron(sp, aIn, chieuDai, dkThuc, dlThuc);
            if (chuaNhanCanChinhTron) return giaSheet * soLuong;
            // Price GSC - Tron: ROUNDUP(giá sheet × hệ số cân chỉnh 1.1, -3)
            const gia = lamTronLenNghin(giaSheet * sp.heSoCanChinh);
            return gia * soLuong;
        }
        case sanPham[4].maSanPham:      // GSC - SVCD
        case sanPham[5].maSanPham:      // GSC - NRD - S
        case sanPham[6].maSanPham:      // GSC - PRD
        case sanPham[7].maSanPham:      // GSC - FD
        case sanPham[8].maSanPham: {    // GSC - MFD&MFSD
            const gia = giaVanVuong(tim(ma), rong, cao, dkThuc, dlThuc, dungSpecGSC, chieuDaiVan);
            return gia * soLuong;
        }
        case sanPham[9].maSanPham: {    // GSC - MFD/Ei120
            if (theoONhapLieuEI) return tínhGiáEITheoÔNhậpLiệu(rong, cao, ma, soLuong);
            const gia = giaVanEI120(tim(ma), rong, cao, theoBangMaTranEI);
            return gia * soLuong;
        }
        case sanPham[10].maSanPham: {   // GSC - MFD/Ei60 = ROUNDUP(EI120 × 0.75, -3)
            if (theoONhapLieuEI) return tínhGiáEITheoÔNhậpLiệu(rong, cao, ma, soLuong);
            const gia = lamTronLenNghin(giaVanEI120(sanPham[9], rong, cao, theoBangMaTranEI) * sanPham[10].heSoSoVoiEI120);
            return gia * soLuong;
        }
        case sanPham[11].maSanPham: {   // GSC - FD&MFD/Ei → theo ô chọn của sheet FD.MFD.EI
            return tínhGiá(aIn, bIn, sanPham[11].chonEI, soLuong, doDayKhung, doDayLa, tuyChon);
        }
        default:
            throw new Error(
                "Mã sản phẩm không hợp lệ: " + maSanPham + ". Hợp lệ: " + sanPham.map((s) => s.maSanPham).join(" | ")
            );
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        tínhGiá,
        tínhGiáEITheoÔNhậpLiệu,
        datDoDayToanCuc,
        chuanHoaDoDay,
        bangSpecDoDayVuongGSC,
        danhSachDoDayHopLe,
        sanPham,
        giaVanTron,
        giaVanVuong,
        giaVanEI120,
        tim
    };
}
if (global) {
    global.VanGioCalculator = {
        tínhGiá,
        tínhGiáEITheoÔNhậpLiệu,
        datDoDayToanCuc,
        chuanHoaDoDay,
        bangSpecDoDayVuongGSC,
        danhSachDoDayHopLe,
        sanPham,
        giaVanTron,
        giaVanVuong,
        giaVanEI120,
        tim
    };
}
})(typeof window !== "undefined" ? window : null);