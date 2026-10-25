const STORAGE_KEY = "kho-hang-products-v1";
const app = document.querySelector("#app");
let products = loadProducts();
let activePage = "report";
let parsedRows = [];
let reportRows = [];
let toastTimer;

const quoteProductTypes = [
  { category: "Miệng gió", subtypes: [{ name: "PRICE-GSC", products: [
    { code: "GSC-SDG", name: "Miệng gió 1 lớp" },
    { code: "GSC-DDG", name: "Miệng gió 2 lớp" },
    { code: "EG-VA", name: "Miệng gió sọt trứng" },
    { code: "GSC-SL", name: "Miệng gió lá sách" },
    { code: "GSC-WL-S", name: "Miệng gió Louver vuông - chắn mưa" },
    { code: "GSC-OBD", name: "OBD điều chỉnh gió (theo KTC)" },
  ] },
  { name: "4 Hướng R2", products: [{ code: "SCD-VA", name: "Miệng gió 4 hướng" }] },
  { name: "Linear R02", products: [{ code: "GSC-LBG", name: "Miệng gió Linear" }] },
  { name: "Slot R02", products: [{ code: "GSC-LSG", name: "Miệng gió khe Slot" }] }] },
  {
    category: "VanGio", label: "Van gió",
    subtypes: [
      { name: "Van tròn", shape: "tron", products: [] },
      { name: "Van vuông", shape: "vuong", products: [] },
      { name: "Van chống cháy EI", shape: "ei", products: [] },
    ],
  },
  {
    category: "Ống gió",
    subtypes: [...new Set((window.OngGioCalculator?.sanPham || []).map(product => product.maLoai))].map(name => ({
      name,
      products: (window.OngGioCalculator?.sanPham || [])
        .filter(product => product.maLoai === name)
        .map(product => ({ code: product.maSanPham, name: product.tenLoai, shape: "duct" })),
    })),
  },
];

const vanGioProducts = window.VanGioCalculator?.sanPham || [];
for (const subtype of quoteProductTypes.find(type => type.category === "VanGio").subtypes) {
  subtype.products = vanGioProducts
    .filter(product => product.hinhDang === subtype.shape)
    .map(product => ({ code: product.maSanPham, name: product.tenLoai, shape: subtype.shape }));
}

function loadProducts() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function toIsoDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : "";
}

function formatDate(value) {
  const isoDate = toIsoDate(value);
  if (!isoDate) return value || "—";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(`${isoDate}T00:00:00`));
}

function showToast(message, error = false) {
  const region = document.querySelector("#toast-region");
  region.innerHTML = `<div class="toast${error ? " error" : ""}"><i data-lucide="${error ? "circle-alert" : "circle-check"}"></i><span>${escapeHtml(message)}</span></div>`;
  refreshIcons();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { region.innerHTML = ""; }, 3600);
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function render() {
  activePage = document.querySelector(".nav-button[aria-current='page']")?.dataset.page || "report";
  const labels = { report: "Báo cáo", add: "Thêm sản phẩm", update: "Cập nhật sản phẩm" };
  document.querySelector("#breadcrumb").innerHTML = `Tổng quan&nbsp; / &nbsp;${labels[activePage]}`;
  document.querySelector("#today").textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  app.innerHTML = activePage === "report" ? reportPage() : uploadPage(activePage);
  refreshIcons();
  if (activePage === "report") bindReportEvents(); else bindUploadEvents();
}

function reportPage() {
  return `<section class="page-heading"><div><div class="eyebrow">Lập danh sách sản phẩm</div><h1>Tạo báo cáo</h1><p class="subtitle">Thêm từng sản phẩm vào danh sách, sau đó xuất toàn bộ sang Excel.</p></div><div class="date-chip"><i data-lucide="calendar-days"></i><span id="report-date"></span></div></section>
    <section class="panel report-entry-panel">
      <div class="table-header"><div><h2 class="section-title">Thông tin sản phẩm</h2><div class="section-meta">Chọn loại lớn, loại nhỏ, tên sản phẩm rồi điền các thông tin cần xuất</div></div></div>
      <form class="report-entry-form" id="report-entry-form">
        <div class="field"><label for="quote-category">Loại lớn</label><select id="quote-category" required>${quoteProductTypes.map(type => `<option value="${escapeHtml(type.category)}">${escapeHtml(type.label || type.category)}</option>`).join("")}</select></div>
        <div class="field"><label for="quote-subcategory">Loại nhỏ</label><select id="quote-subcategory" required></select></div>
        <div class="field"><label for="quote-product">Tên sản phẩm</label><select id="quote-product" required></select></div>
        <div class="field"><label for="quote-brand">Nhãn hiệu</label><input id="quote-brand" placeholder="Để trống nếu chưa có"></div>
        <div class="field"><label for="quote-size">Kích cỡ A × B (mm)</label><input id="quote-size" required placeholder="Ví dụ: 300 x 200"></div>
        <div class="field hidden" id="slot-count-field"><label for="quote-slot-count">Số khe (Slot)</label><select id="quote-slot-count"><option value="auto">Tự động theo bề rộng</option><option value="2">2 khe (slot)</option><option value="3">3 khe (slot)</option><option value="4">4 khe (slot)</option><option value="5">5 khe (slot)</option></select></div>
        <div class="field hidden" id="duct-length-field"><label for="quote-length">Chiều dài đoạn (mm)</label><input id="quote-length" type="number" min="1" step="any" placeholder="Ví dụ: 1000"></div>
        <div class="field hidden" id="duct-config-field"><label for="quote-duct-config">Quy cách vật liệu</label><select id="quote-duct-config"></select></div>
        <div class="field hidden" id="duct-price-type-field"><label for="quote-duct-price-type">Cách tính giá</label><select id="quote-duct-price-type"></select></div>
        <div class="field"><label for="quote-spec">Quy cách / mã hiệu</label><input id="quote-spec" placeholder="Để trống nếu chưa có"></div>
        <div class="field"><label for="quote-unit">Đơn vị</label><input id="quote-unit" placeholder="Ví dụ: cái"></div>
        <div class="field"><label for="quote-quantity">Số lượng</label><input id="quote-quantity" type="number" min="1" step="1" required value="1"></div>
        <div class="field"><label for="quote-price">Đơn giá tính tự động</label><input id="quote-price" type="number" readonly placeholder="Nhập kích cỡ để tính"></div>
        <div class="field"><label for="quote-material">Vật liệu</label><input id="quote-material" placeholder="Để trống nếu chưa có"></div>
        <div class="field"><label for="quote-note">Ghi chú</label><input id="quote-note" placeholder="Để trống nếu chưa có"></div>
        <button class="button button-primary" type="submit"><i data-lucide="plus"></i>Lưu dòng</button>
      </form>
    </section>
    <section class="panel report-lines-panel">
      <div class="report-lines-heading"><div><h2 class="section-title">Danh sách báo cáo</h2><div class="section-meta" id="report-line-count">${reportRows.length} dòng</div></div><button class="button button-primary" id="export-report" ${reportRows.length ? "" : "disabled"}><i data-lucide="download"></i>Xuất Excel</button></div>
      <div class="table-scroll"><table><thead><tr><th>STT</th><th>Diễn giải</th><th>Nhãn hiệu</th><th>Quy cách / mã hiệu</th><th>Đơn vị</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th><th>Vật liệu</th><th>Ghi chú</th></tr></thead><tbody id="report-lines">${reportLinesTable()}</tbody></table></div>
    </section>`;
}

function reportLinesTable() {
  if (!reportRows.length) return `<tr><td class="report-empty" colspan="10">Chưa có dòng sản phẩm. Nhập thông tin ở phía trên rồi nhấn “Lưu dòng”.</td></tr>`;
  return reportRows.map((row, index) => `<tr><td>${index + 1}</td><td class="product-name">${escapeHtml(row.name)}</td><td>${escapeHtml(row.brand)}</td><td>${escapeHtml(row.spec)}</td><td>${escapeHtml(row.unit)}</td><td>${escapeHtml(row.quantity)}</td><td>${row.unitPrice === "" ? "" : Number(row.unitPrice).toLocaleString("vi-VN")}</td><td>${row.amount === "" ? "" : Number(row.amount).toLocaleString("vi-VN")}</td><td>${escapeHtml(row.material)}</td><td>${escapeHtml(row.note)}</td></tr>`).join("");
}

function productTable(rows) {
  if (!rows.length) return `<div class="empty-state"><div><div class="empty-icon"><i data-lucide="package-open"></i></div><div class="empty-title">Chưa có sản phẩm</div><p class="empty-copy">Nạp bảng Excel ở mục “Thêm sản phẩm” để bắt đầu quản lý kho.</p></div></div>`;
  return `<div class="table-scroll"><table><thead><tr><th>Mã sản phẩm</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Số lượng</th><th>Đơn giá</th><th>Cập nhật</th></tr></thead><tbody>${rows.map(product => `<tr><td>${escapeHtml(product.code)}</td><td class="product-name">${escapeHtml(product.name)}</td><td>${escapeHtml(product.category || "—")}</td><td><span class="stock-pill${Number(product.quantity) <= 5 ? " low" : ""}">${escapeHtml(Number(product.quantity || 0).toLocaleString("vi-VN"))}</span></td><td>${Number(product.price || 0).toLocaleString("vi-VN")}</td><td>${escapeHtml(formatDate(product.updatedAt))}</td></tr>`).join("")}</tbody></table></div>`;
}

function uploadPage(mode) {
  const isUpdate = mode === "update";
  const heading = isUpdate ? "Cập nhật sản phẩm" : "Thêm sản phẩm";
  const description = isUpdate ? "Nạp bảng Excel để cập nhật các sản phẩm đã có theo mã sản phẩm." : "Nạp bảng Excel để thêm danh sách sản phẩm mới vào kho.";
  const fields = ["Mã sản phẩm", "Tên sản phẩm", "Danh mục", "Số lượng", "Đơn giá"];
  return `<section class="page-heading"><div><div class="eyebrow">Nhập dữ liệu từ Excel</div><h1>${heading}</h1><p class="subtitle">${description}</p></div></section>
    <section class="panel page-card"><div class="upload-layout"><div><div class="dropzone" id="dropzone"><div class="upload-icon"><i data-lucide="sheet"></i></div><div class="drop-title">Kéo thả tệp Excel vào đây</div><p class="drop-copy">hoặc chọn tệp từ thiết bị của bạn</p><button class="button button-primary" id="choose-file"><i data-lucide="folder-open"></i>Chọn tệp Excel</button><input class="hidden" type="file" id="excel-file" accept=".xlsx,.xls,.csv"></div><div class="file-types">Hỗ trợ định dạng .xlsx, .xls, .csv</div></div>
      <aside class="guide"><h2>${isUpdate ? "Quy tắc cập nhật" : "Cột dữ liệu cần có"}</h2><p>${isUpdate ? "Các dòng có mã sản phẩm trùng với kho sẽ được cập nhật. Mã không tìm thấy sẽ được bỏ qua." : "Tệp cần có ít nhất mã sản phẩm và tên sản phẩm. Các cột còn lại có thể để trống."}</p><div class="guide-fields">${fields.map(field => `<span class="field-tag">${field}</span>`).join("")}</div><button class="button button-secondary" id="download-template"><i data-lucide="file-down"></i>Tải tệp mẫu</button></aside></div>
      <section id="upload-result" class="upload-result hidden" aria-live="polite"></section></section>`;
}

function bindReportEvents() {
  const today = new Date();
  document.querySelector("#report-date").textContent = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(today);
  const category = document.querySelector("#quote-category");
  const subcategory = document.querySelector("#quote-subcategory");
  const productSelect = document.querySelector("#quote-product");
  const sizeInput = document.querySelector("#quote-size");
  const lengthInput = document.querySelector("#quote-length");
  const priceInput = document.querySelector("#quote-price");
  const quantityLabel = document.querySelector('label[for="quote-quantity"]');
  const unitInput = document.querySelector("#quote-unit");
  const ductConfigField = document.querySelector("#duct-config-field");
  const ductLengthField = document.querySelector("#duct-length-field");
  const ductConfigSelect = document.querySelector("#quote-duct-config");
  const ductPriceTypeField = document.querySelector("#duct-price-type-field");
  const ductPriceTypeSelect = document.querySelector("#quote-duct-price-type");
  const slotCountField = document.querySelector("#slot-count-field");
  const slotCountSelect = document.querySelector("#quote-slot-count");
  const updateSubcategoryOptions = () => {
    const selectedType = quoteProductTypes.find(type => type.category === category.value);
    subcategory.innerHTML = selectedType.subtypes.map(item => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join("");
    updateProductOptions();
  };
  const updateProductOptions = () => {
    const selectedType = quoteProductTypes.find(type => type.category === category.value) || quoteProductTypes[0];
    const selectedSubtype = selectedType?.subtypes.find(item => item.name === subcategory.value) || selectedType?.subtypes[0];
    if (!selectedSubtype) return;
    productSelect.innerHTML = selectedSubtype.products.map(product => `<option value="${escapeHtml(product.code)}">${escapeHtml(product.name)}</option>`).join("");
    updateDuctOptions();
    updateSlotOptions();
    updateCalculatedPrice();
  };
  const updateSlotOptions = () => {
    const isSlot = category.value === "Miệng gió" && productSelect.value === "GSC-LSG";
    slotCountField.classList.toggle("hidden", !isSlot);
    if (category.value === "Miệng gió" && !unitInput.value) {
      unitInput.value = "cái";
    }
  };
  const updateDuctOptions = () => {
    const isDuct = category.value === "Ống gió";
    ductConfigField.classList.toggle("hidden", !isDuct);
    ductPriceTypeField.classList.toggle("hidden", !isDuct);
    ductLengthField.classList.toggle("hidden", !isDuct);
    sizeInput.closest(".field").classList.remove("hidden");
    sizeInput.required = true;
    lengthInput.required = isDuct;
    quantityLabel.textContent = "Số lượng";
    const quantityInput = document.querySelector("#quote-quantity");
    quantityInput.min = "1";
    quantityInput.step = "1";
    if (isDuct) unitInput.value = "cái";
    else if (unitInput.value === "cái") unitInput.value = "";

    if (!isDuct) return;
    const configs = getDuctConfigs(productSelect.value);
    ductConfigSelect.innerHTML = configs.map((config, index) => `<option value="${index}">${escapeHtml(config.label)}</option>`).join("");
    const priceTypes = productSelect.value === "OG-GI"
      ? [["ongThang", "Ống thẳng"], ["phuKien", "Phụ kiện"], ["tyLe", "Tỷ lệ 70/30"], ["thamKhao", "Tham khảo"]]
      : [["ongThang", "Ống thẳng"], ["phuKien", "Phụ kiện"], ["tyLe", "Tỷ lệ 70/30"]];
    ductPriceTypeSelect.innerHTML = priceTypes.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  };
  const updateCalculatedPrice = () => {
    const selectedType = quoteProductTypes.find(type => type.category === category.value) || quoteProductTypes[0];
    const selectedSubtype = selectedType?.subtypes.find(item => item.name === subcategory.value) || selectedType?.subtypes[0];
    const product = selectedSubtype?.products.find(item => item.code === productSelect.value) || selectedSubtype?.products[0];
    if (!product) return;
    const sizeLabel = document.querySelector('label[for="quote-size"]');
    const isDuct = category.value === "Ống gió";
    const isMiengGio = category.value === "Miệng gió";
    const isSlot = isMiengGio && product.code === "GSC-LSG";
    const isOBD = isMiengGio && product.code === "GSC-OBD";
    const isLinear = isMiengGio && product.code === "GSC-LBG";

    if (isDuct) {
      document.querySelector('label[for="quote-size"]').textContent = "Kích cỡ W × H (mm)";
      sizeInput.placeholder = "Ví dụ: 400 x 300";
      const config = getDuctConfigs(product.code)[Number(ductConfigSelect.value) || 0];
      const options = config ? { ...config.values, loaiGia: ductPriceTypeSelect.value } : null;
      const dimensions = parseDimensions(sizeInput.value);
      const length = Number(lengthInput.value);
      const area = dimensions && length > 0 ? calculateDuctSurfaceArea(dimensions.a, dimensions.b, length) : null;
      const price = options && area ? calculateProductUnitPrice(category.value, product, dimensions.a, dimensions.b, options, area) : null;
      priceInput.placeholder = "Giá cho 1 đoạn ống";
      priceInput.value = price == null ? "" : String(price);
      return;
    }
    const roundValve = category.value === "VanGio" && product.shape === "tron";
    if (roundValve) {
      sizeLabel.textContent = "Kích cỡ Ø (mm)";
      sizeInput.placeholder = "Ví dụ: Ø300 hoặc 300 x 250";
      priceInput.placeholder = "Nhập kích cỡ để tính";
    } else if (isOBD) {
      sizeLabel.textContent = "Kích cỡ miệng KTM (mm)";
      sizeInput.placeholder = "Ví dụ: 350 x 350 (cổ 300x300)";
      priceInput.placeholder = "Nhập KTM (cổ chuẩn 150-1200) để tính";
    } else if (isLinear) {
      sizeLabel.textContent = "Kích cỡ W × L (mm)";
      sizeInput.placeholder = "Ví dụ: 150 x 1000";
      priceInput.placeholder = "Nhập kích cỡ để tính";
    } else if (isSlot) {
      sizeLabel.textContent = "Rộng W × Dài L (mm)";
      sizeInput.placeholder = "Ví dụ: 150 x 1000";
      priceInput.placeholder = "Nhập kích cỡ để tính";
    } else {
      sizeLabel.textContent = "Kích cỡ A × B (mm)";
      sizeInput.placeholder = "Ví dụ: 300 x 200";
      priceInput.placeholder = "Nhập kích cỡ để tính";
    }
    const dimensions = parseDimensions(sizeInput.value, roundValve ? "tron" : "vuong");
    if (!dimensions) { priceInput.value = ""; return; }
    const options = isSlot ? { soSlot: slotCountSelect.value } : null;
    const price = calculateProductUnitPrice(category.value, product, dimensions.a, dimensions.b, options);
    if (price == null) {
      priceInput.value = "";
      if (isOBD) {
        priceInput.placeholder = `Cỡ cổ (${dimensions.a - 50}x${dimensions.b - 50}) không có trong bảng OBD`;
      }
    } else {
      priceInput.value = String(price);
    }
  };
  updateSubcategoryOptions();
  category.addEventListener("change", updateSubcategoryOptions);
  subcategory.addEventListener("change", updateProductOptions);
  ductConfigSelect.addEventListener("change", updateCalculatedPrice);
  ductPriceTypeSelect.addEventListener("change", updateCalculatedPrice);
  slotCountSelect.addEventListener("change", updateCalculatedPrice);
  sizeInput.addEventListener("input", updateCalculatedPrice);
  lengthInput.addEventListener("input", updateCalculatedPrice);
  productSelect.addEventListener("change", updateCalculatedPrice);
  document.querySelector("#report-entry-form").addEventListener("submit", event => {
    event.preventDefault();
    const type = quoteProductTypes.find(item => item.category === category.value);
    const subtype = type.subtypes.find(item => item.name === subcategory.value);
    const product = subtype.products.find(item => item.code === productSelect.value);
    const isDuct = category.value === "Ống gió";
    const isMiengGio = category.value === "Miệng gió";
    const isSlot = isMiengGio && product.code === "GSC-LSG";
    const isOBD = isMiengGio && product.code === "GSC-OBD";
    const roundValve = category.value === "VanGio" && product.shape === "tron";
    const dimensions = parseDimensions(sizeInput.value, roundValve ? "tron" : "vuong");
    if (!dimensions) return showToast(roundValve ? "Nhập đường kính van, ví dụ Ø300, hoặc đường kính × chiều dài." : "Kích cỡ phải có dạng A x B, ví dụ 400 x 300.", true);
    const ductLength = isDuct ? Number(lengthInput.value) : 0;
    if (isDuct && !(ductLength > 0)) return showToast("Nhập chiều dài đoạn ống bằng mm, ví dụ 1000.", true);
    const quantity = Number(document.querySelector("#quote-quantity").value) || "";
    const ductConfig = isDuct ? getDuctConfigs(product.code)[Number(ductConfigSelect.value) || 0] : null;
    const soSlotVal = isSlot ? slotCountSelect.value : null;
    const ductOptions = isDuct
      ? (ductConfig ? { ...ductConfig.values, loaiGia: ductPriceTypeSelect.value } : null)
      : (isSlot ? { soSlot: soSlotVal } : null);
    const ductArea = isDuct ? calculateDuctSurfaceArea(dimensions.a, dimensions.b, ductLength) : null;
    const unitPrice = calculateProductUnitPrice(category.value, product, dimensions.a, dimensions.b, ductOptions, ductArea);
    if (unitPrice == null) {
      if (isOBD) return showToast(`Kích thước cổ (${dimensions.a - 50} x ${dimensions.b - 50} mm) không có trong bảng giá chuẩn OBD.`, true);
      return showToast(`Chưa tính được giá cho ${product.code}. Kiểm tra kích cỡ hoặc công thức sản phẩm.`, true);
    }
    let sizeText = "";
    if (isDuct) {
      sizeText = `${dimensions.a} x ${dimensions.b} x ${ductLength} mm (${ductArea.toFixed(3)} m²/đoạn)`;
    } else if (roundValve && dimensions.b === 0) {
      sizeText = `Ø${dimensions.a} mm`;
    } else if (isOBD) {
      sizeText = `KTM ${dimensions.a} x ${dimensions.b} mm (KTC ${dimensions.a - 50} x ${dimensions.b - 50} mm)`;
    } else {
      sizeText = `${dimensions.a} x ${dimensions.b} mm`;
    }
    const slotText = isSlot && soSlotVal && soSlotVal !== "auto" ? `${soSlotVal} slot` : "";
    reportRows.push({
      category: type.category,
      subtype: subtype.name,
      code: product.code,
      name: product.name,
      brand: document.querySelector("#quote-brand").value.trim(),
      spec: [sizeText, slotText, ductConfig?.label, isDuct ? ductPriceTypeSelect.selectedOptions[0]?.textContent : "", document.querySelector("#quote-spec").value.trim(), product.code].filter(Boolean).join(" / "),
      unit: document.querySelector("#quote-unit").value.trim(),
      quantity,
      unitPrice,
      amount: quantity === "" ? "" : unitPrice * quantity,
      material: document.querySelector("#quote-material").value.trim(),
      note: document.querySelector("#quote-note").value.trim(),
    });
    document.querySelector("#report-lines").innerHTML = reportLinesTable();
    document.querySelector("#report-line-count").textContent = `${reportRows.length} dòng`;
    document.querySelector("#export-report").disabled = false;
    ["#quote-brand", "#quote-size", "#quote-length", "#quote-spec", "#quote-unit", "#quote-price", "#quote-material", "#quote-note"].forEach(selector => { document.querySelector(selector).value = ""; });
    document.querySelector("#quote-quantity").value = "1";
    if (isDuct) unitInput.value = "cái";
    document.querySelector("#quote-spec").focus();
  });
  document.querySelector("#export-report").addEventListener("click", exportReport);
}

function parseDimensions(value, shape = "vuong") {
  if (shape === "tron") {
    const roundMatch = String(value || "").trim().match(/^(?:Ø|ø)?\s*(\d+(?:[.,]\d+)?)\s*(?:mm)?(?:\s*(?:x|×|\*)\s*(\d+(?:[.,]\d+)?)\s*(?:mm)?)?$/i);
    if (!roundMatch) return null;
    const a = Number(roundMatch[1].replace(",", "."));
    const b = roundMatch[2] ? Number(roundMatch[2].replace(",", ".")) : 0;
    return a > 0 && (b === 0 || b > 0) ? { a, b } : null;
  }
  const match = String(value || "").trim().match(/^(\d+(?:[.,]\d+)?)\s*(?:x|×|\*)\s*(\d+(?:[.,]\d+)?)(?:\s*mm)?$/i);
  if (!match) return null;
  const a = Number(match[1].replace(",", "."));
  const b = Number(match[2].replace(",", "."));
  return a > 0 && b > 0 ? { a, b } : null;
}

function getDuctConfigs(code) {
  const configs = [];
  const add = (values, label) => configs.push({ values, label });
  if (code === "OG-GI") {
    for (const zinc of ["Z80", "Z120", "Z180", "Z275"]) {
      for (const doDay of [0.58, 0.75, 0.95, 1.15, 1.5]) {
        for (const nhaCungCap of ["HS", "PN"]) {
          if (doDay === 1.5 && (zinc !== "Z80" || nhaCungCap !== "HS")) continue;
          add({ zinc, doDay, nhaCungCap }, `${zinc} · ${doDay} mm · ${nhaCungCap === "HS" ? "Hoa Sen" : "Phương Nam"}`);
        }
      }
    }
  } else if (code === "OG-TA") {
    for (const [hang, doDay, tyTrong] of [
      ["KHAI_HOAN", 25, 60], ["KHAI_HOAN", 50, 60], ["KHAI_HOAN", 50, 80],
      ["KHAI_HOAN", 50, 100], ["REMAX", 25, 60], ["REMAX", 50, 60],
    ]) add({ hang, doDay, tyTrong }, `${hang === "KHAI_HOAN" ? "Khai Hoàn" : "REMAX"} · Rockwool ${doDay} mm · ${tyTrong} kg/m³`);
  } else if (code === "OG-EI") {
    for (const loai of ["EI30-45", "EI60", "EI120"]) {
      for (const doDay of [0.75, 0.95, 1.15]) {
        for (const zinc of ["Z80", "Z120", "Z180", "Z275"]) {
          for (const nhaCungCap of ["HS", "PN"]) {
            add({ loai, doDay, zinc, nhaCungCap }, `${loai} · ${zinc} ${doDay} mm · ${nhaCungCap === "HS" ? "Hoa Sen" : "Phương Nam"}`);
          }
        }
      }
    }
  } else if (code === "OG-SUS") {
    for (const doDay of [0.5, 0.6, 0.8, 1, 1.2, 1.5, 2]) add({ doDay }, `Inox 304/BA · ${doDay.toFixed(1)} mm`);
  }
  return configs;
}

function calculateDuctSurfaceArea(width, height, length) {
  const area = window.OngGioCalculator?.dienTichPhuKien?.ongThang;
  if (typeof area !== "function") return null;
  try {
    const result = area({ B: width, C: height, H: length });
    return Number.isFinite(result) && result > 0 ? result : null;
  } catch (error) {
    console.error("Lỗi tính diện tích ống gió:", error);
    return null;
  }
}

function calculateProductUnitPrice(category, product, a, b, options = null, area = null) {
  if (category === "Ống gió") {
    if (typeof window.OngGioCalculator?.tínhGiá !== "function" || !options || !(area > 0)) return null;
    if (product.code === "OG-GI" && options.loaiGia === "thamKhao" && options.doDay === 1.5) return null;
    try {
      const price = window.OngGioCalculator.tínhGiá(product.code, options, area);
      return Number.isFinite(price) && price >= 0 ? price : null;
    } catch (error) {
      console.error(`Lỗi tính giá ${product.code}:`, error);
      return null;
    }
  }
  if (category === "VanGio") {
    if (typeof window.VanGioCalculator?.tínhGiá !== "function") return null;
    try {
      const total = window.VanGioCalculator.tínhGiá(a, b, product.code, 1);
      return Number.isFinite(total) && total > 0 ? total : null;
    } catch (error) {
      console.error(`Lỗi tính giá ${product.code}:`, error);
      return null;
    }
  }
  const code = product.code;
  const calcFn = window.tínhGiá || (typeof tínhGiá === "function" ? tínhGiá : null);
  if (typeof calcFn !== "function") return null;

  try {
    const soSlot = (code === "GSC-LSG" && options?.soSlot && options.soSlot !== "auto")
      ? Number(options.soSlot)
      : undefined;
    const total = calcFn(a, b, code, 1, soSlot);
    return Number.isFinite(total) && total > 0 ? total : null;
  } catch (error) {
    console.warn(`Lỗi tính giá ${code}:`, error.message);
    return null;
  }
}

function normalizeHeader(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function convertRows(rawRows) {
  if (!rawRows.length) return [];
  const headers = Object.keys(rawRows[0]);
  const findColumn = aliases => headers.find(header => aliases.includes(normalizeHeader(header)));
  const columns = {
    code: findColumn(["masanpham", "mahang", "sku", "productcode", "code", "itemcode"]),
    name: findColumn(["tensanpham", "tenhang", "productname", "name", "product"]),
    category: findColumn(["danhmuc", "loai", "category", "type"]),
    quantity: findColumn(["soluong", "tonkho", "quantity", "stock", "inventory"]),
    price: findColumn(["dongia", "gia", "price", "unitprice"])
  };
  if (!columns.code || !columns.name) throw new Error("Tệp phải có cột Mã sản phẩm (hoặc SKU) và Tên sản phẩm.");
  return rawRows.map(row => ({
    code: String(row[columns.code] ?? "").trim(),
    name: String(row[columns.name] ?? "").trim(),
    category: columns.category ? String(row[columns.category] ?? "").trim() : "",
    quantity: columns.quantity ? parseNumber(row[columns.quantity]) : 0,
    price: columns.price ? parseNumber(row[columns.price]) : 0
  })).filter(row => row.code && row.name);
}

function parseNumber(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").trim().replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  return Number(cleaned) || 0;
}

function bindUploadEvents() {
  const fileInput = document.querySelector("#excel-file");
  const dropzone = document.querySelector("#dropzone");
  document.querySelector("#choose-file").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => { if (fileInput.files[0]) readWorkbook(fileInput.files[0]); });
  document.querySelector("#download-template").addEventListener("click", downloadTemplate);
  dropzone.addEventListener("dragover", event => { event.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", event => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    const file = event.dataTransfer.files[0];
    if (file) readWorkbook(file);
  });
}

function readWorkbook(file) {
  if (!window.XLSX) return showToast("Không tải được bộ đọc Excel. Hãy kiểm tra kết nối mạng rồi thử lại.", true);
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const workbook = XLSX.read(event.target.result, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      parsedRows = convertRows(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
      if (!parsedRows.length) throw new Error("Không tìm thấy dòng sản phẩm hợp lệ trong tệp.");
      showPreview(file.name);
    } catch (error) { showToast(error.message || "Không thể đọc tệp Excel.", true); }
  };
  reader.onerror = () => showToast("Không đọc được tệp đã chọn.", true);
  reader.readAsArrayBuffer(file);
}

function showPreview(fileName) {
  const isUpdate = activePage === "update";
  const matched = isUpdate ? parsedRows.filter(row => products.some(product => product.code.toLocaleLowerCase() === row.code.toLocaleLowerCase())).length : parsedRows.length;
  const result = document.querySelector("#upload-result");
  result.classList.remove("hidden");
  result.innerHTML = `<div class="result-bar"><div><h2 class="section-title">Kiểm tra dữ liệu</h2><div class="result-message">${escapeHtml(fileName)} · ${parsedRows.length} dòng hợp lệ${isUpdate ? ` · ${matched} mã trùng trong kho` : ""}</div></div><button class="button button-primary" id="confirm-import"><i data-lucide="${isUpdate ? "refresh-cw" : "package-plus"}"></i>${isUpdate ? "Cập nhật kho" : "Thêm vào kho"}</button></div>${productTable(parsedRows.map(row => ({ ...row, updatedAt: "Chờ nhập" })))}`;
  refreshIcons();
  document.querySelector("#confirm-import").addEventListener("click", commitImport);
}

function commitImport() {
  const isUpdate = activePage === "update";
  const now = new Date().toISOString().slice(0, 10);
  let changed = 0;
  let skipped = 0;
  if (isUpdate) {
    const byCode = new Map(products.map((product, index) => [product.code.toLocaleLowerCase(), index]));
    for (const row of parsedRows) {
      const index = byCode.get(row.code.toLocaleLowerCase());
      if (index === undefined) { skipped++; continue; }
      products[index] = { ...products[index], ...Object.fromEntries(Object.entries(row).filter(([, value]) => value !== "")), updatedAt: now };
      changed++;
    }
  } else {
    const known = new Set(products.map(product => product.code.toLocaleLowerCase()));
    for (const row of parsedRows) {
      const key = row.code.toLocaleLowerCase();
      if (known.has(key)) { skipped++; continue; }
      products.push({ ...row, updatedAt: now });
      known.add(key);
      changed++;
    }
  }
  saveProducts();
  parsedRows = [];
  showToast(`${isUpdate ? "Đã cập nhật" : "Đã thêm"} ${changed} sản phẩm${skipped ? `, bỏ qua ${skipped} dòng` : ""}.`);
  render();
}

function downloadTemplate() {
  if (!window.XLSX) return showToast("Không tải được bộ tạo Excel. Hãy kiểm tra kết nối mạng.", true);
  const rows = [{ "Mã sản phẩm": "SP001", "Tên sản phẩm": "Sản phẩm mẫu", "Danh mục": "Văn phòng phẩm", "Số lượng": 20, "Đơn giá": 15000 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "SanPham");
  XLSX.writeFile(workbook, "mau-san-pham.xlsx");
}

function exportReport() {
  if (!window.XLSX) return showToast("Không tải được bộ tạo Excel. Hãy kiểm tra kết nối mạng.", true);
  if (!reportRows.length) return showToast("Hãy thêm ít nhất một dòng trước khi xuất Excel.", true);
  const rows = [
    ["STT", "DIỄN GIẢI", "NHÃN HIỆU", "QUY CÁCH / MÃ HIỆU", "ĐƠN VỊ", "SỐ LƯỢNG", "GIÁ", "", "VẬT LIỆU", "GHI CHÚ"],
    ["", "", "", "", "", "", "ĐƠN GIÁ", "THÀNH TIỀN", "", ""],
    ...reportRows.map((row, index) => [
      index + 1, row.name || "", row.brand || "", row.spec || "", row.unit || "",
      row.quantity === "" ? "" : row.quantity,
      row.unitPrice === "" ? "" : row.unitPrice,
      row.amount === "" ? "" : row.amount,
      row.material || "", row.note || "",
    ]),
  ];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!merges"] = [
    ...["A1", "B1", "C1", "D1", "E1", "F1", "I1", "J1"].map(cell => {
      const start = XLSX.utils.decode_cell(cell);
      return { s: start, e: { r: 1, c: start.c } };
    }),
    { s: { r: 0, c: 6 }, e: { r: 0, c: 7 } },
  ];
  worksheet["!cols"] = [
    { wch: 7 }, { wch: 32 }, { wch: 18 }, { wch: 24 }, { wch: 12 },
    { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoSanPham");
  XLSX.writeFile(workbook, `bao-cao-san-pham-${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast(`Đã xuất báo cáo Excel gồm ${reportRows.length} dòng.`);
}

document.querySelectorAll(".nav-button").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".nav-button").forEach(item => item.removeAttribute("aria-current"));
  button.setAttribute("aria-current", "page");
  parsedRows = [];
  render();
}));
render();
