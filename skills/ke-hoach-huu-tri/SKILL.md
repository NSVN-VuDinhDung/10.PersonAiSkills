---
name: ke-hoach-huu-tri
description: Lập và rà soát kế hoạch tài chính nghỉ hưu sớm (FIRE) cho người dùng. Dùng khi người dùng hỏi về quỹ hưu trí, nghỉ hưu ở tuổi X, cần tiết kiệm bao nhiêu, kịch bản what-if (đổi tuổi nghỉ hưu, chi phí, lãi suất, bán nhà...), hoặc muốn cập nhật/diễn giải file du-lieu-quy-huu-tri.json và công cụ tinh-quy-huu-tri.html.
---

# Kế hoạch hưu trí (ke-hoach-huu-tri)

Skill này gói toàn bộ ngữ cảnh để bất kỳ agent nào cũng có thể tiếp tục công việc
lên kế hoạch nghỉ hưu của người dùng mà không cần đọc lại file HTML.

## Tài nguyên trong skill

| File | Dùng khi |
|---|---|
| `references/ho-so-hien-tai.md` | **Đọc đầu tiên.** Hồ sơ tài chính hiện tại, kết quả baseline, các giả định và câu hỏi còn mở. |
| `references/mo-hinh-tinh-toan.md` | Cần hiểu công thức, ý nghĩa từng trường JSON, điểm mạnh/yếu của mô hình. |
| `references/quy-du-phong.md` | Danh sách đề xuất quỹ để riêng (y tế, cầu nối thu nhập, đệm thị trường...), BHXH/BHYT, chi phí con cái, và khoản nào đã/chưa vào JSON. |
| `scripts/bhxh-tu-nguyen.js` | Ước tính chi phí đóng BHXH tự nguyện và lương hưu theo 2 tham số: mức thu nhập đóng và số năm đóng. |
| `scripts/tinh-quy-huu-tri.js` | Cần tính lại số hoặc chạy kịch bản what-if. Tái hiện đúng 100% logic của HTML v7 (đã đối chiếu bằng Chrome headless). |

Nguồn dữ liệu gốc (sự thật duy nhất): `du-lieu-quy-huu-tri.json` ở thư mục gốc dự án (schema v7).
Công cụ giao diện: `tinh-quy-huu-tri.html` (v7, mở bằng trình duyệt kể cả điện thoại, nhập tay, xuất/nhập JSON).
`tinh-quy-huu-tri (2).html` là bản v2 cũ, chỉ để đối chiếu. `du-lieu-quy-huu-tri.v1-backup.json` là dữ liệu v2 gốc.

Quy tắc đồng bộ: mọi thay đổi công thức phải làm ở cả ba nơi (HTML, script, `mo-hinh-tinh-toan.md`),
rồi kiểm chứng bằng cách nhúng JSON vào bản sao HTML, chạy Chrome headless `--dump-dom` và so với script `--json`.

## Quy trình làm việc

0. **Kiểm tra mốc thời gian TRƯỚC TIÊN**: so `meta.lastUpdated` và `fields.baseYear` trong JSON với ngày hôm nay.
   Nếu lệch từ 1 năm trở lên, mọi con số đều sai (số năm còn lại và mặt bằng giá đã đổi). Việc cần làm:
   bảo người dùng mở HTML, bấm "Dời mốc thời gian", rồi nhập lại giá trị tài sản và nợ thực tế.
   Nút đó chỉ sửa tuổi, năm gốc và các mốc đếm ngược — **không** đụng vào số tiền (nguyên tắc người dùng đã chốt).
   Script tự nêu cảnh báo này trong mảng `warnings`. Đừng đưa ra con số nào trước khi xử lý xong.
1. **Nạp ngữ cảnh**: đọc `references/ho-so-hien-tai.md`. Nếu người dùng nói dữ liệu đã đổi,
   đọc lại file JSON gốc và chạy script để lấy số mới; sau đó cập nhật hồ sơ.
2. **Tính toán**: luôn dùng script, không tự nhẩm bằng tay.
   ```bash
   # Báo cáo đọc được
   node .claude/skills/ke-hoach-huu-tri/scripts/tinh-quy-huu-tri.js du-lieu-quy-huu-tri.json
   # Dạng JSON cho agent
   node .claude/skills/ke-hoach-huu-tri/scripts/tinh-quy-huu-tri.js du-lieu-quy-huu-tri.json --json
   # What-if: ghi đè trường trong "fields" mà không sửa file gốc
   node .claude/skills/ke-hoach-huu-tri/scripts/tinh-quy-huu-tri.js du-lieu-quy-huu-tri.json --set retireAge=45 --set expenseMonthly=25000000
   # Bật tự tính lương hưu từ BHXH (nhớ bỏ dòng Lương hưu nhập tay trong bản sao JSON)
   node .claude/skills/ke-hoach-huu-tri/scripts/tinh-quy-huu-tri.js du-lieu-quy-huu-tri.json --set bhxh.auto=true --set bhxh.volYears=15
   # Chi phí sinh hoạt (nằm ở khối living, --set vẫn nhận tên cũ expenseMonthly)
   node .claude/skills/ke-hoach-huu-tri/scripts/tinh-quy-huu-tri.js du-lieu-quy-huu-tri.json --set expenseMonthly=25000000
   ```
   Script in mảng `warnings` ở đầu báo cáo (lệch năm, trùng lương hưu, chi phí con trước nghỉ hưu) — luôn đọc và nhắc người dùng.
   Cuối báo cáo có **lộ trình tích lũy theo năm**: dùng nó để trả lời "cuối năm sau tôi phải có bao nhiêu".
   Kịch bản đổi tài sản / thu nhập / tiết kiệm: sao chép JSON sang scratchpad, sửa, rồi chạy script trên bản sao.
   ```bash
   # BHXH tự nguyện: chi phí/tháng và lương hưu ước tính
   node .claude/skills/ke-hoach-huu-tri/scripts/bhxh-tu-nguyen.js --sex nam --paidYears 14 --paidAvg 20000000 --volIncome 20000000 --volYears 22
   ```
3. **Diễn giải**: trình bày cả hai cách tính, nhưng dùng **Cách 2 (dòng tiền theo giai đoạn)**
   làm con số kế hoạch chính; Cách 1 (quy tắc 4%) là mức trần thận trọng.
4. **Sửa dữ liệu**: chỉ sửa `du-lieu-quy-huu-tri.json` khi người dùng yêu cầu rõ. Giữ đúng schema
   (xem mô hình tính toán) để file HTML vẫn nhập lại được. Số tiền là số nguyên VNĐ, các trường
   tỷ lệ/tuổi là chuỗi số như HTML xuất ra.
5. **Khi mô hình không đủ**: mô hình HTML có vài giới hạn đã liệt kê trong mô hình tính toán
   (lãi bình quân bị kéo thấp bởi bất động sản 0%, thu nhập hưu không điều chỉnh lạm phát, nợ không tính lãi...).
   Nêu rõ giới hạn khi nó ảnh hưởng đến kết luận, và đề xuất tính bổ sung ngoài script nếu cần.

## Nguyên tắc trình bày

- Tiền viết dạng `1.234.567.890 đ` hoặc rút gọn `1,23 tỷ`, `655 triệu`. Tuổi và năm viết rõ.
- Luôn nói rõ giả định đang dùng (lãi suất, lạm phát, tuổi thọ) khi đưa ra một con số.
- Đây là công cụ minh hoạ, không phải tư vấn tài chính; không đưa khuyến nghị mua bán sản phẩm cụ thể.
- Trả lời bằng tiếng Việt, ngắn gọn, ưu tiên bảng khi so sánh kịch bản.

## Việc đang mở

Xem mục "Câu hỏi còn mở" trong `references/ho-so-hien-tai.md`. Người dùng dự định trao đổi sâu
thêm để hoàn thiện cả skill lẫn kế hoạch; khi có quyết định mới, cập nhật hồ sơ và (nếu cần)
mô hình tính toán trong skill này.
