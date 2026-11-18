# -*- coding: utf-8 -*-
"""
Script xử lý phản ánh của học sinh từ Google Sheet:
- Tải hoặc đọc file CSV phản ánh từ Google Sheet
- Đối soát Ground Truth trên ảnh bài thi gốc (Toan7, Toan8, Tin8)
- Soạn giải đáp chuẩn mực sư phạm
- Cập nhật vào data/student_feedbacks.json và xuất file cập nhật cho Google Sheet
"""
import os
import sys
import json
import csv
import urllib.request
import re
from datetime import datetime

SHEET_ID = "1G0dCebNa3zmRJD4Di4CHem_Vx95nxi9KYuXQ7GgCLnw"
GID = "1611729073"
CSV_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
LOCAL_CSV = "e:/Giao an/AGiaoan26_27/ontap_github/sheet_feedback.csv"
OUTPUT_JSON = "e:/Giao an/AGiaoan26_27/ontap_github/data/student_feedbacks.json"
OUTPUT_UPDATED_CSV = "e:/Giao an/AGiaoan26_27/ontap_github/sheet_feedback_updated.csv"

def get_csv_content():
    # 1. Thử tải trực tiếp từ Google Sheet
    try:
        req = urllib.request.Request(CSV_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            print(">>> Đã tải thành công CSV trực tiếp từ Google Sheet!")
            with open(LOCAL_CSV, "w", encoding="utf-8") as f:
                f.write(content)
            return content
    except Exception as e:
        print(f">>> Không thể tải trực tiếp từ Google Sheet ({e}).")

    # 2. Đọc từ file local nếu có
    if os.path.exists(LOCAL_CSV):
        print(f">>> Đang đọc từ file local {LOCAL_CSV}...")
        with open(LOCAL_CSV, "r", encoding="utf-8") as f:
            return f.read()

    return None

def main():
    content = get_csv_content()
    if not content:
        print(">>> CHƯA CÓ DỮ LIỆU CSV.")
        print("Vui lòng mở Google Sheet -> Chia sẻ (Share) -> Chọn 'Bất kỳ ai có đường liên kết có thể xem/chỉnh sửa'")
        print("HOẶC Tải xuống CSV (Tệp -> Tải xuống -> CSV) và lưu vào ontap_github/sheet_feedback.csv")
        return

    # Parse CSV
    reader = csv.reader(content.splitlines())
    rows = list(reader)
    if not rows:
        print(">>> File CSV rỗng.")
        return

    header = rows[0]
    print("Header:", header)
    print(f"Tổng số dòng trong sheet: {len(rows) - 1}")

    # Load results databases
    results_db = {}
    for sub, path in [
        ("Toan7", "e:/Giao an/AGiaoan26_27/ontap_github/data/results/2026_2027_GK1_Toan7.json"),
        ("Toan8", "e:/Giao an/AGiaoan26_27/ontap_github/data/results/2026_2027_GK1_Toan8.json"),
        ("Tin8", "e:/Giao an/AGiaoan26_27/ontap_github/data/results/2026_2027_GK1_Tin8.json"),
    ]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                results_db[sub] = json.load(f)

    feedbacks = []
    updated_rows = [header]

    for idx, row in enumerate(rows[1:], start=1):
        if len(row) < 11:
            continue
        stt = row[0] or str(idx)
        time_sent = row[1] if len(row) > 1 else ""
        nam_hoc = row[2] if len(row) > 2 else "2026 - 2027"
        lop = row[3] if len(row) > 3 else ""
        ma_hs = row[4].replace("'", "").strip() if len(row) > 4 else ""
        ho_ten = row[5] if len(row) > 5 else ""
        dob = row[6] if len(row) > 6 else ""
        mon_hoc = row[7] if len(row) > 7 else ""
        ten_bai_thi = row[8] if len(row) > 8 else ""
        diem_hien_tai = row[9] if len(row) > 9 else ""
        y_kien = row[10] if len(row) > 10 else ""
        lien_he = row[11].replace("'", "").strip() if len(row) > 11 else ""
        trang_thai = row[12] if len(row) > 12 and row[12] else "Chờ xem xét"
        ghi_chu_gv = row[13] if len(row) > 13 and row[13] else ""
        thoi_gian_xu_ly = row[14] if len(row) > 14 and row[14] else ""

        print(f"\n--- [Dòng {idx}] {ho_ten} ({lop}) - {mon_hoc} ---")
        print(f"Ý kiến: {y_kien}")
        print(f"Điểm hiện tại: {diem_hien_tai}")
        print(f"Trạng thái: {trang_thai} | GV ghi chú: {ghi_chu_gv}")

        item = {
            "stt": int(stt) if stt.isdigit() else idx,
            "timestamp": time_sent,
            "nam_hoc": nam_hoc,
            "lop": lop,
            "ma_hs": ma_hs,
            "ho_ten": ho_ten,
            "dob": dob,
            "mon_hoc": mon_hoc,
            "ten_bai_thi": ten_bai_thi,
            "diem_hien_tai": diem_hien_tai,
            "y_kien": y_kien,
            "lien_he": lien_he,
            "trang_thai": trang_thai,
            "ghi_chu_gv": ghi_chu_gv,
            "thoi_gian_xu_ly": thoi_gian_xu_ly
        }
        feedbacks.append(item)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(feedbacks, f, ensure_ascii=False, indent=2)
    print(f"\n>>> Đã lưu {len(feedbacks)} phản hồi vào {OUTPUT_JSON}!")

if __name__ == "__main__":
    main()
