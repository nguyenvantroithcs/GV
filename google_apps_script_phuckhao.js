/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT: HỆ THỐNG TIẾP NHẬN PHẢN HỒI & PHÚC KHẢO ĐIỂM BÀI THI
 * Trường THCS Lê Quý Đôn - GVBM: Nguyễn Văn Trị
 * Tích hợp trang web tra cứu: https://nguyenvantroithcs.github.io/GV/xem_diem.html
 * Google Sheet ID: 1G0dCebNa3zmRJD4Di4CHem_Vx95nxi9KYuXQ7GgCLnw
 * =========================================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT TRÊN GOOGLE SHEETS:
 * 1. Mở file Google Sheet: https://docs.google.com/spreadsheets/d/1G0dCebNa3zmRJD4Di4CHem_Vx95nxi9KYuXQ7GgCLnw/edit
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script
 * 3. Xóa hết mã cũ trong file Code.gs, sao chép và dán toàn bộ nội dung file này vào.
 * 4. Bấm biểu tượng 💾 Lưu (Save).
 * 5. Chạy hàm "khoiTaoTieuDeSheet" 1 lần để tạo sẵn tiêu đề các cột chuẩn đẹp.
 * 6. Bấm "Triển khai" (Deploy) -> "Quản lý bản triển khai mới" (New deployment):
 *    - Chọn loại: "Ứng dụng web" (Web app)
 *    - Mô tả: Nhận phản hồi phúc khảo điểm thi
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me - địa chỉ email của Giáo viên)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG ĐỂ HỌC SINH GỬI ĐƯỢC
 * 7. Bấm "Triển khai" (Deploy) và Cấp quyền (Authorize access).
 * 8. Sao chép "URL ứng dụng web" (Web App URL) dạng:
 *    https://script.google.com/macros/s/AKfycb.../exec
 * 9. Dán URL này vào biến GAS_PHUCKHAO_URL trong file "xem_diem.html".
 */

const SHEET_NAME = "Y_Kien_Hoc_Sinh";
const SPREADSHEET_ID = "1G0dCebNa3zmRJD4Di4CHem_Vx95nxi9KYuXQ7GgCLnw";

/**
 * Lấy trang tính cần ghi dữ liệu (tự tạo sheet nếu chưa có)
 */
function getTargetSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    // Trường hợp chạy độc lập không gắn sheet
    ss = null;
  }
  if (!ss) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/**
 * Khởi tạo tiêu đề cột chuyên nghiệp cho Google Sheet
 * Bấm chọn hàm này và bấm ▶️ Chạy (Run) để tạo sẵn tiêu đề các cột
 */
function khoiTaoTieuDeSheet() {
  const sheet = getTargetSheet();
  
  const headers = [
    "STT",                          // Cột A
    "Thời gian gửi",                // Cột B
    "Năm Học",                      // Cột C
    "Lớp",                          // Cột D
    "Mã Học Sinh",                  // Cột E
    "Họ và Tên Học Sinh",          // Cột F
    "Ngày Sinh",                    // Cột G
    "Môn Học",                      // Cột H
    "Tên Bài Thi",                  // Cột I
    "Điểm Hiện Tại",                // Cột J
    "Nội Dung Ý Kiến / Thắc Mắc",  // Cột K
    "SĐT / Zalo Liên Hệ",           // Cột L
    "Trạng Thái Xử Lý",             // Cột M
    "Ghi Chú & Kết Quả Của GV",     // Cột N
    "Thời Gian Giáo Viên Xử Lý"     // Cột O
  ];

  // Nếu dòng 1 chưa có tiêu đề thì ghi vào
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Định dạng dòng tiêu đề
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1a73e8"); // Xanh Google chuẩn
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1); // Cố định dòng tiêu đề

  // Đặt độ rộng các cột cho thoáng đẹp, dễ nhìn
  sheet.setColumnWidth(1, 60);   // STT
  sheet.setColumnWidth(2, 150);  // Thời gian gửi
  sheet.setColumnWidth(3, 110);  // Năm học
  sheet.setColumnWidth(4, 80);   // Lớp
  sheet.setColumnWidth(5, 110);  // Mã HS
  sheet.setColumnWidth(6, 180);  // Họ tên
  sheet.setColumnWidth(7, 110);  // Ngày sinh
  sheet.setColumnWidth(8, 100);  // Môn học
  sheet.setColumnWidth(9, 160);  // Tên bài thi
  sheet.setColumnWidth(10, 160); // Điểm hiện tại
  sheet.setColumnWidth(11, 320); // Nội dung ý kiến
  sheet.setColumnWidth(12, 140); // Liên hệ
  sheet.setColumnWidth(13, 130); // Trạng thái xử lý
  sheet.setColumnWidth(14, 260); // Ghi chú của GV
  sheet.setColumnWidth(15, 150); // Thời gian xử lý

  Logger.log("Đã khởi tạo thành công tiêu đề Google Sheet Y_Kien_Hoc_Sinh!");
}

/**
 * Xử lý yêu cầu POST khi học sinh bấm "Gửi Ý Kiến Đến Giáo Viên" từ trang xem_diem.html
 */
function doPost(e) {
  try {
    const sheet = getTargetSheet();

    // Lấy dữ liệu gửi lên (hỗ trợ cả x-www-form-urlencoded và application/json)
    let data = {};
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback query string parse
        data = parseQueryString(e.postData.contents);
      }
    }

    const lastRow = Math.max(sheet.getLastRow(), 1);
    const stt = lastRow; // Dòng 1 là header nên row 2 sẽ có STT = 1
    const thoiGianGui = data.timestamp || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    const namHoc = data.nam_hoc || "2026 - 2027";
    const lop = data.lop || "";
    const maHs = data.ma_hs || "";
    const hoTen = data.ho_ten || "";
    const dob = data.dob || "";
    const monHoc = data.mon_hoc || "Tin học 8";
    const tenBaiThi = data.ten_bai_thi || "Kiểm tra Giữa kỳ I";
    const diemHienTai = data.diem_hien_tai || "";
    const yKien = data.y_kien || "";
    const lienHe = data.lien_he || "";
    const trangThai = "Chờ xem xét";
    const ghiChuGV = "";
    const thoiGianXuLy = "";

    const newRow = [
      stt,
      thoiGianGui,
      namHoc,
      lop,
      "'" + maHs, // Thêm nháy đơn để bảo toàn mã số dài không bị làm tròn
      hoTen,
      dob,
      monHoc,
      tenBaiThi,
      diemHienTai,
      yKien,
      "'" + lienHe,
      trangThai,
      ghiChuGV,
      thoiGianXuLy
    ];

    sheet.appendRow(newRow);

    const currentRow = sheet.getLastRow();

    // Định dạng dòng vừa thêm
    sheet.getRange(currentRow, 1).setHorizontalAlignment("center"); // STT
    sheet.getRange(currentRow, 2).setHorizontalAlignment("center"); // Thời gian
    sheet.getRange(currentRow, 3).setHorizontalAlignment("center"); // Năm học
    sheet.getRange(currentRow, 4).setHorizontalAlignment("center"); // Lớp
    sheet.getRange(currentRow, 5).setHorizontalAlignment("center"); // Mã HS
    sheet.getRange(currentRow, 7).setHorizontalAlignment("center"); // Ngày sinh
    sheet.getRange(currentRow, 12).setHorizontalAlignment("center"); // SĐT
    sheet.getRange(currentRow, 13).setHorizontalAlignment("center"); // Trạng thái

    // Tô màu cảnh báo nhẹ cho trạng thái "Chờ xem xét"
    sheet.getRange(currentRow, 13).setBackground("#fef3c7").setFontColor("#b45309").setFontWeight("bold");
    // Bật tự động xuống dòng cho cột ý kiến và ghi chú
    sheet.getRange(currentRow, 11).setWrap(true);
    sheet.getRange(currentRow, 14).setWrap(true);
    sheet.getRange(currentRow, 13).setWrap(true);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã lưu ý kiến học sinh thành công!",
      stt: stt
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý yêu cầu GET: Kiểm tra kết nối Web App hoặc lấy danh sách ý kiến
 */
function doGet(e) {
  const sheet = getTargetSheet();
  const lastRow = sheet.getLastRow();

  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Hệ thống Web App Google Sheets nhận phúc khảo đang hoạt động bình thường!",
    sheet_name: SHEET_NAME,
    total_submissions: Math.max(0, lastRow - 1),
    timestamp: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss")
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper tách chuỗi URL Encoded nếu có
 */
function parseQueryString(queryString) {
  const params = {};
  if (!queryString) return params;
  const pairs = queryString.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    const key = decodeURIComponent(pair[0]);
    const val = decodeURIComponent((pair[1] || '').replace(/\+/g, ' '));
    params[key] = val;
  }
  return params;
}
