// ===================== BẢNG GIÁ MIỆNG GIÓ GSC - TÍNH GIÁ XUẤT XƯỞNG =====================
// Đã đối chiếu với file Excel "01012025 - BẢNG GIÁ MIỆNG GIÓ XUẤT XƯỞNG GSC".
// Quy ước: aIn, bIn = kích thước miệng (KTM, mm). Kích thước cổ (CTC) = KTM - 50.

const chiPhiCoBan = {
    tienMatBangNhaXuong : 8000000,
    chiPhiNhanVien : 68800000,
    chiPhiThuongThang13 : 68800000,
    dienNuoc : 3500000,
    chiPhiKhac : 1000000,
    thietBiSanXuat : 700000000
};
const chiPhiTongHop = {
    tienDauTuMayMoc : chiPhiCoBan.thietBiSanXuat,
    soTienQuanLyVaVanHanhXuong1Thang : chiPhiCoBan.chiPhiNhanVien + chiPhiCoBan.dienNuoc + chiPhiCoBan.chiPhiKhac + chiPhiCoBan.tienMatBangNhaXuong,
    tongThuongThang13 : chiPhiCoBan.chiPhiThuongThang13,
    loiNhuanSanPham : 0.2,
    soThangHoiVonDauTuMayMoc : 60,
    heSoSale : 1.03 * 1.09,
    heSoHoiVon : 1,
    haoHutVatTu : 0.05,
    heSoCanChinh : 1.04      // chỉ nhân cho 2 lớp, lá sách, louver (theo sheet "Price - GSC")
};

const nguyenlieu = [
    { name : "NhômYNGHUA", gia : 80000, donVi : "Kg" },                    // 0
    { name : "Nhôm tấm 0.6*1000*2000", gia : 200000, donVi : "Tấm" },     // 1
    { name : "Nhôm tấm 1.0*1000*2000", gia : 335000, donVi : "Tấm" },     // 2
    { name : "Nhôm tấm 2.95*1000*2000", gia : 1564000, donVi : "Tấm" },   // 3
    { name : "Nhôm thanh 25x25x1.2x6000", gia : 145000, donVi : "Cây" },  // 4
    { name : "Nhôm phi8 x0.8x6000", gia : 5000, donVi : "m" },            // 5
    { name : "Lò Xo", gia : 1000, donVi : "Cái" },                        // 6
    { name : "Sơn", gia : 25000, donVi : "m2" },                          // 7
    { name : "Bát gài + 2.95mm", gia : 2737, donVi : "Cái" },             // 8
    { name : "Vít", gia : 2000, donVi : "S/P" },                          // 9
    { name : "Nhôm tấm 0.6", gia : 205000, donVi : "m2" }                 // 10 (dùng cho sọt trứng)
];

const thongSoNhom = [
    { name : "YH-MY01", heSo : 0.161, donVi : "Kg/m", use : "Lá Louver" },                 // 0
    { name : "YH-MY02", heSo : 0.188, donVi : "Kg/m", use : "Khung 2 lớp, Louver, sọt trứng" }, // 1
    { name : "YH-MY03", heSo : 0.237, donVi : "Kg/m", use : "Đỡ Louver / thanh đỡ Linear" },    // 2
    { name : "YH-MY04", heSo : 0.09,  donVi : "Kg/m", use : "Lá Linear" },                 // 3
    { name : "YH-MY05", heSo : 0.07,  donVi : "Kg/m", use : "Lá lá sách" },                // 4
    { name : "YH-MY06", heSo : 0.113, donVi : "Kg/m", use : "Lá 4 hướng" },                // 5
    { name : "YH-MY07", heSo : 0.26,  donVi : "Kg/m", use : "Khung 4 hướng" },             // 6
    { name : "YH-MY08", heSo : 0,     donVi : "Kg/m", use : "" },                          // 7 (Excel để trống)
    { name : "YH-MY09", heSo : 0.154, donVi : "Kg/m", use : "Khung 1 lớp, khung lá sách, khung Linear" }, // 8
    { name : "YH-1509C", heSo : 0.072, donVi : "Kg/m", use : "Lá 1 lớp, lá 2 lớp" },       // 9
    { name : "YH-GS-10", heSo : 0.181, donVi : "Kg/m", use : "Khung 1 lớp, lá sách" },     // 10
    { name : "YH-GS-11", heSo : 0.076, donVi : "Kg/m", use : "Khung lõi sọt trứng" },      // 11
    { name : "YH-GS-12", heSo : 0.154, donVi : "Kg/m", use : "Khung lõi (cổ) 2 lớp" },     // 12  (đã sửa 0.164 -> 0.154)
    { name : "GS03",     heSo : 0.076, donVi : "Kg/m", use : "Khung lõi (cổ) sọt trứng" }, // 13
    { name : "GS16", heSo : 0.247, donVi : "Kg/m", use : "Khung quanh Slot" },             // 14 (bổ sung từ sheet Slot R02)
    { name : "GS17", heSo : 0.221, donVi : "Kg/m", use : "Thanh ngăn Slot" },              // 15
    { name : "GS18", heSo : 0.064, donVi : "Kg/m", use : "Thanh khe Slot" }                // 16
];

const sanPham = [
    { maLoai: "PRICE-GSC", tenLoai: "Miệng Gió 1 Lớp", maSanPham: "GSC-SDG", heSoSanPhamThang : 3900 },      // 0
    { maLoai: "PRICE-GSC", tenLoai: "Miệng Gió 2 Lớp", maSanPham: "GSC-DDG", heSoSanPhamThang : 3588 },      // 1
    { maLoai: "PRICE-GSC", tenLoai: "MIỆNG GIÓ SỌT TRỨNG", maSanPham: "EG-VA", heSoSanPhamThang : 3250 },    // 2
    { maLoai: "PRICE-GSC", tenLoai: "MIỆNG GIÓ Lá Sách", maSanPham: "GSC-SL", heSoSanPhamThang : 3900 },     // 3
    { maLoai: "PRICE-GSC", tenLoai: "MIỆNG GIÓ LOUVER VUÔNG - CHẮN MƯA", maSanPham: "GSC-WL-S", heSoSanPhamThang : 3900 }, // 4
    { maLoai: "PRICE-GSC", tenLoai: "OBD ĐIỀU CHỈNH GIÓ - CHỌN THEO KTC, CỐ ĐỊNH SIZE", maSanPham: "GSC-OBD" }, // 5
    { maLoai: "4 Hướng R2", tenLoai: "MIỆNG GIÓ 4 HƯỚNG", maSanPham: "SCD-VA", heSoSanPhamThang : 3250 },    // 6
    { maLoai: "Linear R02", tenLoai: "MIỆNG GIÓ LINEAR", maSanPham: "GSC-LBG", heSoSanPhamThang : 3900 },    // 7
    { maLoai: "Slot R02", tenLoai: "MIỆNG GIÓ KHE SLOT", maSanPham: "GSC-LSG", heSoSanPhamThang : 3900, soSlot : [2, 3, 4, 5] } // 8
];

// Sản phẩm có nhân thêm hệ số cân chỉnh 1.04 và ROUNDUP ở sheet "Price - GSC"
const sanPhamNhanCanChinh = ["GSC-DDG", "GSC-SL", "GSC-WL-S"];

const thuHoiVonTrenToanSanPhamTrongThang =
    chiPhiTongHop.soTienQuanLyVaVanHanhXuong1Thang +
    (chiPhiTongHop.tienDauTuMayMoc / chiPhiTongHop.soThangHoiVonDauTuMayMoc) +
    chiPhiTongHop.tongThuongThang13 / 12;

// Excel ROUND (làm tròn nửa lên với số dương)
// (Excel xử lý số ở 15 chữ số có nghĩa, nên chuẩn hóa trước để tránh lệch kiểu 427499.99999999994)
const excelRound = (x) => Math.floor(Number(x.toPrecision(15)) + 0.5);
const lamTronNghin = (x) => excelRound(x / 1000) * 1000;
const bangGiaOBD = {
    // Kích thước cổ (CTC): hàng = o.rows, cột = o.cols. Bảng đối xứng, giá cố định lấy từ sheet "OBD R02"
    hang : [150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200],
    cot : [150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1650],
    gia : [
        [59000, 59000, 59000, 59000, 60000, 68000, 74000, 81000, 90000, 97000, 104000, 111000, 119000, 125000, 134000, 140000, 148000, 156000, 164000, 172000, 176000, 182000],
        [59000, 59000, 63000, 72000, 74000, 85000, 92000, 102000, 111000, 121000, 130000, 140000, 148000, 156000, 168000, 175000, 185000, 194000, 204000, 212000, 221000, 232000],
        [59000, 63000, 75000, 88000, 90000, 101000, 111000, 124000, 134000, 144000, 156000, 168000, 176000, 189000, 200000, 210000, 221000, 233000, 243000, 255000, 267000, 281000],
        [59000, 72000, 88000, 102000, 104000, 117000, 130000, 142000, 156000, 169000, 181000, 194000, 207000, 221000, 233000, 246000, 258000, 271000, 284000, 296000, 310000, 326000],
        [60000, 74000, 90000, 104000, 119000, 134000, 148000, 164000, 176000, 192000, 207000, 221000, 237000, 251000, 267000, 280000, 295000, 310000, 323000, 339000, 353000, 369000],
        [68000, 85000, 101000, 117000, 134000, 149000, 168000, 183000, 200000, 216000, 233000, 249000, 267000, 283000, 300000, 315000, 332000, 348000, 366000, 382000, 398000, 416000],
        [74000, 92000, 111000, 130000, 148000, 168000, 185000, 204000, 221000, 240000, 258000, 276000, 295000, 314000, 332000, 351000, 369000, 386000, 406000, 423000, 442000, 463000],
        [81000, 102000, 124000, 142000, 164000, 183000, 204000, 223000, 243000, 264000, 284000, 304000, 323000, 345000, 366000, 385000, 406000, 425000, 447000, 466000, 485000, 506000],
        [90000, 111000, 134000, 156000, 176000, 200000, 221000, 243000, 267000, 287000, 310000, 332000, 353000, 376000, 398000, 419000, 442000, 465000, 485000, 509000, 530000, 553000],
        [97000, 121000, 144000, 169000, 192000, 216000, 240000, 264000, 287000, 311000, 336000, 359000, 383000, 407000, 431000, 454000, 479000, 502000, 527000, 550000, 574000, 600000],
        [104000, 130000, 156000, 181000, 207000, 233000, 258000, 284000, 310000, 336000, 362000, 386000, 413000, 438000, 465000, 489000, 516000, 542000, 566000, 593000, 618000, 645000],
        [111000, 140000, 168000, 194000, 221000, 249000, 276000, 304000, 332000, 359000, 386000, 414000, 442000, 470000, 498000, 525000, 552000, 581000, 608000, 635000, 663000, 693000],
        [119000, 148000, 176000, 207000, 237000, 267000, 295000, 323000, 353000, 383000, 413000, 442000, 471000, 500000, 530000, 561000, 589000, 618000, 648000, 678000, 708000, 740000],
        [125000, 156000, 189000, 221000, 251000, 283000, 314000, 345000, 376000, 407000, 438000, 470000, 500000, 532000, 564000, 595000, 625000, 657000, 688000, 720000, 751000, 784000],
        [134000, 168000, 200000, 233000, 267000, 300000, 332000, 366000, 398000, 431000, 465000, 498000, 530000, 564000, 597000, 629000, 663000, 695000, 727000, 760000, 794000, 830000],
        [140000, 175000, 210000, 246000, 280000, 315000, 351000, 385000, 419000, 454000, 489000, 525000, 561000, 595000, 629000, 663000, 699000, 734000, 768000, 804000, 839000, 876000],
        [148000, 185000, 221000, 258000, 295000, 332000, 369000, 406000, 442000, 479000, 516000, 552000, 589000, 625000, 663000, 699000, 736000, 772000, 810000, 846000, 883000, 922000],
        [156000, 194000, 233000, 271000, 310000, 348000, 386000, 425000, 465000, 502000, 542000, 581000, 618000, 657000, 695000, 734000, 772000, 811000, 850000, 889000, 927000, 967000],
        [164000, 204000, 243000, 284000, 323000, 366000, 406000, 447000, 485000, 527000, 566000, 608000, 648000, 688000, 727000, 768000, 810000, 850000, 891000, 930000, 971000, 1014000],
        [172000, 212000, 255000, 296000, 339000, 382000, 423000, 466000, 509000, 550000, 593000, 635000, 678000, 720000, 760000, 804000, 846000, 889000, 930000, 972000, 1015000, 1060000],
        [176000, 221000, 267000, 310000, 353000, 398000, 442000, 485000, 530000, 574000, 618000, 663000, 708000, 751000, 794000, 839000, 883000, 927000, 971000, 1015000, 1059000, 1105000],
        [182000, 232000, 281000, 326000, 369000, 416000, 463000, 506000, 553000, 600000, 645000, 693000, 740000, 784000, 830000, 876000, 922000, 967000, 1014000, 1060000, 1105000, 1154000]
    ]
};

// -------- Hệ số K theo kích thước (cột "Hệ số cân chỉnh" ở từng sheet R02) --------
// L = cạnh dài, N = cạnh ngắn (KTM, mm)
function heSoK(L, maSanPham, N) {
    switch (maSanPham) {
        case "GSC-SDG": {
            if (L <= 400) return 1;
            if (L <= 550) return 1.09;
            if (L <= 650) return 1.18;
            if (L <= 750) return 1.22;
            if (L <= 850) return 1.26;
            if (L <= 950) return 1.31;
            return 1.35;
        }
        case "GSC-DDG": {
            if (L <= 650) return 0.99;
            if (L <= 850) return 1.08;
            if (L <= 950) return 1.125;
            return 1.17;
        }
        case "EG-VA": {
            if (L <= 600) return 1.1;
            if (L <= 800) return 1.2;
            if (L <= 1000) return 1.3;
            return 1.4;
        }
        case "GSC-SL": {
            if (L <= 450) return 1.1;
            if (L <= 550) return 1.4;
            if (L <= 650) return 1.6;
            return 1.7;
        }
        case "GSC-WL-S": {
            if (L <= 600) return 1.023;
            if (L <= 700) return 1.11;
            if (L <= 800) return 1.192;
            if (L <= 900) return 1.276;
            if (L <= 950) return 1.318;
            return 1.318 * 1.05;      // L >= 1000 (louver lớn)
        }
        case "SCD-VA": {
            if (L <= 550) return 1;
            if (L <= 650) return 1.15;
            if (L <= 750) return 1.25;
            if (L <= 850) return 1.35;
            if (L <= 950) return 1.4;
            if (L <= 1050) return 1.5;
            return 1.6;
        }
        case "GSC-LBG": {
            const K_BAC = [1.1, 1.2, 1.3, 1.45, 1.6];
            const bacRong = (a) => (a <= 140 ? 0 : a <= 170 ? 1 : a <= 200 ? 2 : a <= 230 ? 3 : 4);
            const bacDai = (b) => (b <= 650 ? 0 : b <= 1200 ? 1 : b <= 1850 ? 2 : b <= 2150 ? 3 : 4);
            return K_BAC[Math.max(bacRong(N), bacDai(L))];
        }
        case "GSC-LSG":
            return 1.7;
    }
    throw new Error("heSoK: chưa hỗ trợ mã sản phẩm " + maSanPham);
}

// -------- OBD: tra bảng theo kích thước cổ (CTC) --------
function giaOBDTheoKTC(c1, c2) {
    const tra = (hangVal, cotVal) => {
        const i = bangGiaOBD.hang.indexOf(hangVal);
        const j = bangGiaOBD.cot.indexOf(cotVal);
        return (i >= 0 && j >= 0) ? bangGiaOBD.gia[i][j] : undefined;
    };
    const gia = tra(c1, c2) ?? tra(c2, c1);   // bảng đối xứng
    if (gia === undefined) throw new Error("OBD: không có giá cho kích thước cổ " + c1 + "x" + c2 + " (OBD chỉ có size cố định)");
    return gia;
}

// -------- Giá 1 sản phẩm theo sheet R02 (chưa nhân hệ số cân chỉnh 1.04) --------
function giaR02(aIn, bIn, maSanPham, soSlot) {
    const Nh = Math.min(aIn, bIn);
    const L = Math.max(aIn, bIn);
    const ac = aIn - 50;
    const bc = bIn - 50;
    const Lc = Math.max(ac, bc);
    const Nc = Math.min(ac, bc);

    const gNhom = nguyenlieu[0].gia;
    const hao = 1 + chiPhiTongHop.haoHutVatTu;
    const tienVit = nguyenlieu[9].gia;
    const tienSon = (aIn * bIn / 1e6) * 2 * nguyenlieu[7].gia;   // 2 mặt
    const idx = sanPham.findIndex(s => s.maSanPham === maSanPham);
    const thuHoiVon = idx >= 0 && sanPham[idx].heSoSanPhamThang
        ? thuHoiVonTrenToanSanPhamTrongThang / sanPham[idx].heSoSanPhamThang : 0;

    // Giá bán = giá vốn × (1 + lợi nhuận) × K × hệ số sale, làm tròn nghìn
    const banGia = (giaVon) =>
        lamTronNghin(giaVon * (1 + chiPhiTongHop.loiNhuanSanPham) * heSoK(L, maSanPham, Nh) * chiPhiTongHop.heSoSale);

    switch (maSanPham) {
        case "GSC-SDG": {   // 1 lớp
            const soLa = excelRound((Nh - 50) / 20);
            const kgNhom = soLa * (L / 1000) * thongSoNhom[9].heSo               // lá YH-1509C
                         + ((aIn + bIn) * 2 / 1000) * thongSoNhom[8].heSo;       // khung YH-MY09
            return banGia(kgNhom * hao * gNhom + tienVit + tienSon + thuHoiVon);
        }
        case "GSC-DDG": {   // 2 lớp
            const soLa = excelRound((Nh - 50) / 20);
            const kgLa = soLa * (L / 1000) * thongSoNhom[9].heSo * 2;            // lá YH-1509C x2 lớp
            const kgKhungCo = ((ac + bc) * 2 / 1000) * thongSoNhom[12].heSo;     // khung cổ YH-GS-12
            const kgKhungMat = ((aIn + bIn) * 2 / 1000) * thongSoNhom[1].heSo;   // khung mặt YH-MY02
            const kgNhom = kgLa + kgKhungCo + kgKhungMat;
            return banGia(kgNhom * hao * gNhom + tienVit + tienSon + thuHoiVon);
        }
        case "EG-VA": {     // sọt trứng
            const soLa = 2 * excelRound((Nc - 60) / 15);
            const dienTichTam = (soLa * (15 * Lc)) / 1e6;
            const tienTam = dienTichTam * (1.1 + chiPhiTongHop.haoHutVatTu) * nguyenlieu[10].gia; // tấm 0.6
            const kgThanh = ((aIn + bIn) * 2 / 1000) * thongSoNhom[1].heSo       // khung mặt YH-MY02
                          + ((ac + bc) * 2 / 1000) * thongSoNhom[13].heSo;       // khung cổ GS03
            return banGia(tienTam + kgThanh * hao * gNhom + tienSon + nguyenlieu[8].gia + thuHoiVon);
        }
        case "GSC-SL": {    // lá sách
            const soLa = excelRound((Nh - 50) / 20);
            const kgNhom = soLa * (L / 1000) * thongSoNhom[4].heSo               // lá YH-MY05
                         + ((aIn + bIn) * 2 / 1000) * thongSoNhom[8].heSo;       // khung YH-MY09
            return banGia(kgNhom * hao * gNhom + tienVit + tienSon + thuHoiVon);
        }
        case "GSC-WL-S": {  // louver vuông - chắn mưa
            const soLa = Math.round(((Nh - 60) / 34) * 1e11) / 1e11;            // số lá không làm tròn
            const kgNhom = soLa * (L / 1000) * thongSoNhom[0].heSo               // lá YH-MY01
                         + ((aIn + bIn) * 2 / 1000) * thongSoNhom[1].heSo;       // khung YH-MY02
            return banGia(kgNhom * hao * gNhom + tienVit + tienSon + thuHoiVon);
        }
        case "SCD-VA": {    // 4 hướng
            const soLa = excelRound((L / 2 - 78) / 37.5 - 1);
            const kgNhom = soLa * ((aIn + bIn) / 1000) * thongSoNhom[5].heSo     // lá YH-MY06
                         + ((aIn + bIn) / 1000 * 2) * thongSoNhom[6].heSo;       // khung YH-MY07
            const phuKien = ((aIn + bIn) / 1000) * nguyenlieu[5].gia             // nhôm phi 8
                          + nguyenlieu[6].gia * 2                                // 2 lò xo
                          + 1000 * 4;                                            // 4 bát chốt
            return banGia(kgNhom * hao * gNhom + phuKien + tienSon + thuHoiVon);
        }
        case "GSC-LBG": {   // linear (không sơn)
            const kgKhung = ((aIn + bIn) * 2 / 1000) * thongSoNhom[8].heSo;      // YH-MY09
            const kgLa = (Nc / 15) * (Lc / 1000) * thongSoNhom[3].heSo;          // YH-MY04
            const kgThanh = Math.floor(L / 500) * thongSoNhom[2].heSo;           // YH-MY03
            return banGia((kgKhung + kgLa + kgThanh) * hao * gNhom + tienVit + thuHoiVon);
        }
        case "GSC-LSG": {   // slot (không nhân hệ số sale, sơn tính riêng và làm tròn riêng)
            // Số khe tự chọn theo bề rộng aIn (cột của sheet Slot R02): 100-150→2, 160-200→3, 210-250→4, ≥260→5
            const s = soSlot || (aIn <= 150 ? 2 : aIn <= 200 ? 3 : aIn <= 250 ? 4 : 5);
            const kgKhung = ((aIn + bIn) * 2 / 1000) * thongSoNhom[14].heSo;       // GS16
            const kgThanhNgan = (s - 1) * (Lc / 1000) * thongSoNhom[15].heSo;      // GS17
            const kgThanhKhe = (s * 2) * (Lc / 1000) * thongSoNhom[16].heSo;       // GS18
            const kgNhom = kgKhung + kgThanhNgan + kgThanhKhe;
            const giaVon = kgNhom * hao * gNhom + tienVit + thuHoiVon;
            const giaChuaSon = lamTronNghin(giaVon * (1 + chiPhiTongHop.loiNhuanSanPham) * heSoK(L, maSanPham));
            return giaChuaSon + lamTronNghin(tienSon);
        }
        case "GSC-OBD":     // OBD: tra bảng theo KTC = KTM - 50
            return giaOBDTheoKTC(ac, bc);
    }
    throw new Error("Mã sản phẩm không hợp lệ: " + maSanPham);
}

// -------- Hàm chính: giá bán xuất xưởng --------
// aIn, bIn: kích thước miệng KTM (mm); với Slot thì aIn = bề rộng, bIn = chiều dài; soSlot: chỉ dùng cho GSC-LSG (bỏ trống = tự chọn theo bề rộng)
function tínhGiá(aIn, bIn, maSanPham, soLuong = 1, soSlot) {
    if (![aIn, bIn].every(v => Number.isFinite(v) && v > 0)) throw new Error("Kích thước không hợp lệ");
    if (!Number.isFinite(soLuong) || soLuong < 0) throw new Error("Số lượng không hợp lệ");

    let gia = giaR02(aIn, bIn, maSanPham, soSlot);
    if (sanPhamNhanCanChinh.includes(maSanPham)) {
        // "Price - GSC": ROUNDUP(giá R02 × 1.04, -3)
        gia = Math.ceil(gia * chiPhiTongHop.heSoCanChinh / 1000 - 1e-9) * 1000;
    }
    return gia * soLuong;
}
const tinhGia = tínhGiá;   // bí danh không dấu

if (typeof module !== "undefined") {
    module.exports = { tínhGiá, tinhGia, giaR02, giaOBDTheoKTC, heSoK, chiPhiTongHop, thongSoNhom, nguyenlieu, sanPham };
}