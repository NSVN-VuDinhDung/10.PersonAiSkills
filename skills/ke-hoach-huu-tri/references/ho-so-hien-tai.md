# Hồ sơ kế hoạch hưu trí hiện tại

Cập nhật lần cuối: 2026-09-14 (khớp HTML v8), từ `du-lieu-quy-huu-tri.json` (schema v8). **Đây là dữ liệu người dùng
tự nhập**, không còn là giả định của agent, trừ các mục ghi rõ. Bản v2 gốc lưu ở `du-lieu-quy-huu-tri.v1-backup.json`.
Khi dữ liệu gốc thay đổi, chạy lại script và cập nhật file này.

> **Đọc trước khi dùng bất kỳ con số nào dưới đây.** Toàn bộ số tiền ghi theo **giá năm 2026**, và
> "còn 4 năm đến khi nghỉ hưu" chỉ đúng trong năm 2026. Nếu hôm nay đã sang năm khác, các con số này
> đã lỗi thời: bảo người dùng mở HTML, bấm "Dời mốc thời gian", nhập lại giá trị tài sản và nợ thực tế,
> xuất lại JSON, rồi chạy lại script trước khi kết luận. Nút dời mốc chỉ sửa tuổi, năm gốc và các mốc
> đếm ngược; số tiền giữ nguyên để người dùng tự quyết khoản nào cần tăng.

## 1. Thông số cá nhân

| Mục | Giá trị |
|---|---|
| Tuổi hiện tại | 36 |
| Tuổi dự định nghỉ hưu | 40 (còn 4 năm) |
| Tuổi thọ kỳ vọng | 80 (40 năm hưu) |
| Lạm phát giả định | 3%/năm |
| Chi phí sinh hoạt | **15 triệu/tháng**, giá hôm nay (khối `living`). Người dùng hạ từ 30 xuống 15 sau khi học phí con được tách riêng — nhiều khả năng 30 triệu cũ đã bao gồm nuôi con. Cần xác nhận. |
| Nợ hiện tại | 1,4 tỷ (trừ thẳng, không lãi) |
| Năm gốc | 2026 |

## 2. Tài sản

| Tài sản | Loại | Giá trị nay | Lãi trước hưu | Kế hoạch | Lãi sau hưu |
|---|---|---|---|---|---|
| Chứng khoán | tài chính | 500 triệu | 7% | giữ nguyên | 7% |
| Góp vốn BĐS | bất động sản | 700 triệu | 5% | giữ nguyên | 5% |
| Nhà ở | bất động sản | 5 tỷ | 0% | năm thứ 4 (tuổi 40) bán, dùng 3 tỷ việc khác, giữ lại 2 tỷ | 5% |

## 3. Tiết kiệm định kỳ (trước nghỉ hưu)

| Khoản | Số tiền/tháng | Lãi |
|---|---|---|
| Tiết kiệm từ lương | 10 triệu | 4% |
| Tiền thuê nhà | 3,5 triệu | 0% |

## 4. Thu nhập trong hưu trí (giá trị thực hôm nay)

| Nguồn | Số tiền/tháng | Từ tuổi | Đến |
|---|---|---|---|
| Thu nhập khác | 10 triệu | 40 | hết đời |
| Thuê nhà | 3,5 triệu | 40 | hết đời |
| Lương hưu BHXH (tự sinh) | 7,2 triệu | 62 | hết đời |

Dòng "Lương hưu 15 triệu" nhập tay đã được **xoá** ngày 2026-09-09 vì người dùng bật `bhxh.auto`,
giữ lại sẽ cộng lương hưu hai lần. HTML tự cảnh báo trường hợp này từ v4.

## 4b. Gia đình

| Mục | Thông tin |
|---|---|
| Con gái | sinh 2018, 8 tuổi năm 2026, 18 tuổi năm 2036 (người dùng 46) |
| Con 2 và Con 3 | dự kiến sinh 2027, 18 tuổi năm 2045 (người dùng 55) |
| Học phí mỗi con | 5 triệu/tháng giai đoạn 3–17 tuổi, 50 triệu/năm giai đoạn đại học (người dùng tự nhập, cao hơn kịch bản A mặc định) |
| Bố mẹ | độc lập tài chính, không cần quỹ phụng dưỡng |
| Vợ/chồng | vẫn chưa có thông tin về thu nhập và vai trò trong kế hoạch |

Nhãn `scenario` trong JSON vẫn ghi "A" nhưng số tiền đã sửa tay, nên nhãn không còn khớp — chỉ là gợi ý điền sẵn.

## 4c. BHXH tự nguyện (người dùng nhập, `auto` đang BẬT)

| Tham số | Giá trị |
|---|---|
| Giới tính | nam, tuổi hưu 62 |
| Đã đóng bắt buộc | 11 năm, bình quân 10 triệu/tháng |
| Mức chọn đóng tự nguyện | 40 triệu/tháng |
| Số năm đóng | 4 (tuổi 40–43) |
| → Chi phí đóng | 8,73 triệu/tháng trong 4 năm, tổng ~419 triệu |
| → Tổng năm đóng | 15 (vừa đủ ngưỡng tối thiểu), tỷ lệ hưởng 40% |
| → Bình quân thu nhập tính hưu | 18 triệu |
| → Lương hưu | **7,2 triệu/tháng** từ 62 tuổi |

## 4d. Quỹ để riêng và chi phí định kỳ

| Khoản | Giá trị |
|---|---|
| Y tế khẩn cấp / bệnh hiểm nghèo | 500 triệu (A), cần từ 40, **không** tăng theo lạm phát |
| Cầu nối sinh hoạt khi mất thu nhập | 500 triệu (A), cần từ 40, **không** tăng theo lạm phát |
| BHYT hộ gia đình | 200 nghìn/tháng, từ 40 đến hết đời |
| Dự phòng chi khoản lớn | 2 triệu/tháng, từ 40 đến hết đời (người dùng tự thêm) |

Người dùng đã giảm hai quỹ từ 1 tỷ xuống 500 triệu mỗi khoản và tắt tăng theo lạm phát, nên 500 triệu
hôm nay vẫn là 500 triệu ở tuổi 40 — sức mua thực tế giảm khoảng 11% sau 4 năm lạm phát 3%.
Chưa có quỹ đệm thị trường, chăm sóc tuổi già, sửa chữa lớn, dự phòng cho con (xem `quy-du-phong.md`).

## 5. Kết quả baseline (script và HTML v8 khớp từng đồng)

| Chỉ số | Giá trị |
|---|---|
| Tổng tài sản dự kiến tại 40 tuổi, đã trừ nợ | 2,68 tỷ |
| Lãi bình quân trước hưu / sau hưu | 1,1% / 5,4% |
| Chi phí sinh hoạt tại lúc nghỉ hưu | 16,9 triệu/tháng |
| Tổng chi tháng đầu nghỉ hưu (gồm BHXH và 3 con đi học) | 46,1 triệu/tháng |
| Quỹ để riêng quy về lúc nghỉ hưu | 1,00 tỷ |
| Cách 1: thiếu / tiết kiệm thêm | 3,39 tỷ / 69,0 triệu/tháng |
| Cách 2: quỹ bù dòng tiền + quỹ để riêng | 3,34 tỷ + 1,00 tỷ = 4,34 tỷ |
| **Cách 2: còn thiếu / cần tiết kiệm thêm** | **1,66 tỷ / 33,8 triệu/tháng** |

Giai đoạn Cách 2:

| Tuổi | Chi khác/tháng (đã lạm phát) | Thu nhập/tháng | Cần bù/tháng |
|---|---|---|---|
| 40–43 | 29,2 tr (BHXH 8,7 + 3 con đi học) | 13,5 tr | 32,6 tr |
| 44–45 | 19,4 tr | 13,5 tr | 22,7 tr |
| 46–49 | 18,4 tr (con gái đại học) | 13,5 tr | 21,8 tr |
| 50–54 | 13,7 tr | 13,5 tr | 17,1 tr |
| 55–58 | 11,9 tr (2 con đại học) | 13,5 tr | 15,2 tr |
| 59–61 | 2,5 tr | 13,5 tr | 5,9 tr |
| 62–79 | 2,5 tr | 20,7 tr | **0** (thu nhập đã đủ) |

## 5a. Chi phí nuôi con — ba giai đoạn (làm rõ 2026-09-09)

Câu hỏi của người dùng: con sinh 2018 thì phần từ 2018 đến nay đã trừ chưa? **Đã trừ, tự động**,
vì Cách 2 chỉ duyệt các năm từ tuổi 40 trở đi. Nhưng bản v4 hiển thị dòng "tổng học phí 1,1 tỷ"
gộp cả quá khứ nên gây hiểu nhầm; từ v5 đã tách làm ba.

| Con | Đã chi xong | Từ nay đến khi nghỉ hưu | Sau nghỉ hưu (vào quỹ) |
|---|---|---|---|
| Con gái (2018, nay 8 tuổi) | 300 triệu (tuổi bạn 31–35) | 240 triệu (tuổi bạn 36–39) | 560 triệu (tuổi bạn 40–49) |
| Con 2 (2027) | 0 | 0 | 1,10 tỷ |
| Con 3 (2027) | 0 | 0 | 1,10 tỷ |
| **Tổng** | **300 triệu** | **240 triệu** | **2,76 tỷ** |

**Khoảng trống chưa xử lý:** 240 triệu ở giữa không bị trừ vào tài sản tích lũy, vì mô hình không
mô phỏng chi tiêu trước nghỉ hưu. Nếu tiền này lấy từ khoản đang tiết kiệm 13,5 triệu/tháng thì
tổng tài sản tại lúc nghỉ hưu đang bị tính cao hơn thực tế khoảng 240–250 triệu. HTML tự cảnh báo.

## 5a2. Lộ trình tích lũy — mục tiêu từng năm

Nếu tiết kiệm thêm đúng 33,8 triệu/tháng, tổng tài sản đang nắm giữ (đã trừ nợ, kể cả nhà chưa bán)
phải đạt các mốc sau vào cuối mỗi năm. Đây là câu trả lời cho "sang năm tôi phải có bao nhiêu".

| Cuối năm | Tuổi | Mục tiêu tài sản |
|---|---|---|
| 2026 | 36 — điểm xuất phát | 4,80 tỷ |
| 2027 | 37 | 5,42 tỷ |
| 2028 | 38 | 6,04 tỷ |
| 2029 | 39 | 6,68 tỷ |
| 2030 | 40 — nghỉ hưu | 4,34 tỷ |

Mốc 2030 tụt xuống vì năm đó bán nhà và chuyển 3 tỷ sang việc khác, rời khỏi kế hoạch hưu trí.

## 5a3. Tổng kết hàng năm — chưa có dòng nào

Khối `reviews` đang rỗng. Cuối mỗi năm người dùng thêm một dòng trong mục "Tổng kết hàng năm" của HTML,
xem mình đi trước hay chậm so với bảng lộ trình ở mục 5a2, rồi bấm Chốt để đông cứng lại.
Mốc đầu tiên nên chốt là **cuối 2026, mục tiêu 4,80 tỷ** (điểm xuất phát).

## 5b. What-if đã chạy trên dữ liệu hiện tại (2026-09-09)

**Đổi số năm đóng BHXH tự nguyện** (mức đóng 40 triệu/tháng, giữ nguyên mọi thứ khác):

| Số năm đóng | Tổng năm | Tỷ lệ | Lương hưu | Thiếu hụt Cách 2 | Tiết kiệm thêm |
|---|---|---|---|---|---|
| 4 (hiện tại) | 15 | 40% | 7,2 tr | 1,66 tỷ | 33,8 tr/tháng |
| 9 | 20 | 45% | 10,6 tr | 2,07 tỷ | 42,1 tr/tháng |
| 14 | 25 | 55% | 14,7 tr | 2,38 tỷ | 48,6 tr/tháng |
| 22 | 33 | 71% | 21,3 tr | 2,75 tỷ | 55,9 tr/tháng |

Đóng càng nhiều, thiếu hụt càng tăng — **là hệ quả của giới hạn mô hình số 2 và số 8**
(tiền đóng bị nhân lạm phát và rơi vào giai đoạn eo hẹp, lương hưu giữ giá trị thực rồi bị chiết khấu
5,4%/năm và cắt ở tuổi 80). Ngoài đời lương hưu được điều chỉnh trượt giá và trả đến hết đời,
nên **không được khuyên người dùng bỏ BHXH dựa trên con số này**. Cần sửa mô hình trước khi kết luận.

**Lùi tuổi nghỉ hưu** (giữ nguyên mọi thứ khác):

| Tuổi nghỉ hưu | Tài sản tại lúc nghỉ hưu | Thiếu hụt Cách 2 | Tiết kiệm thêm |
|---|---|---|---|
| 40 (hiện tại) | 2,68 tỷ | 1,66 tỷ | 33,8 tr/tháng |
| 42 | 3,21 tỷ | 1,19 tỷ | 15,9 tr/tháng |
| 45 | 4,09 tỷ | 0,39 tỷ | 3,5 tr/tháng |
| 48 | 5,07 tỷ | 0 | 0 |

## 6. Câu hỏi còn mở (để trao đổi tiếp với người dùng)

Người dùng mở `tinh-quy-huu-tri.html` để rà soát và nói cần chỉnh gì tiếp.

**Ưu tiên cao — ảnh hưởng trực tiếp con số:**

1. Mô hình đang lạc quan vì thu nhập hưu không tăng theo lạm phát còn chiết khấu lại là lãi danh nghĩa.
   Nên chuyển sang tính bằng **giá trị thực** hết (lãi thực = postReturn − lạm phát)? Đây là sửa lớn nhất còn lại,
   và cũng là thứ làm méo kết quả BHXH ở mục 5b.
2. Chi phí sinh hoạt vừa hạ từ 30 xuống 15 triệu/tháng — 15 triệu này cho mấy người, đã gồm ăn ở của 3 con chưa?
   Nếu 30 triệu cũ đã gồm nuôi con thì hạ xuống 15 là đúng; nếu không thì đang bị hụt.
3. Nhà ở 5 tỷ để tăng giá 0% kéo lãi bình quân danh mục xuống 1,1%, làm "cần tiết kiệm thêm" bị thổi lên.
   Có nên tách nhà ở khỏi danh mục tính lãi bình quân không?
4. 3 tỷ "dùng việc khác" khi bán nhà ở tuổi 40 là gì? Nếu để trả nợ 1,4 tỷ thì đang bị trừ hai lần.
5. 240 triệu học phí con gái giai đoạn tuổi 36–39 chưa được trừ vào tài sản tích lũy (mục 5a).
   Có muốn giảm "Tiết kiệm định kỳ" tương ứng, hay thêm cơ chế mô phỏng chi tiêu trước nghỉ hưu?
6. Thiếu hụt 1,66 tỷ tương đương tiết kiệm thêm 33,8 triệu/tháng trong 4 năm. Lùi nghỉ hưu sang 45 tuổi
   giảm còn 3,5 triệu/tháng. Muốn đi hướng nào?

**Cần thông tin:**

7. Nợ 1,4 tỷ: lãi suất, kỳ hạn, đang trả bao nhiêu mỗi tháng, có nằm trong chi phí sinh hoạt không?
8. "Thu nhập khác" 10 triệu/tháng từ 40 đến hết đời là nguồn gì, có bền vững 40 năm không?
9. Thuê nhà 3,5 triệu: nếu bán nhà ở năm 40 tuổi thì khoản này còn không?
10. Vợ/chồng có thu nhập riêng không, kế hoạch này tính cho cá nhân hay cả hộ?
11. Chi phí sinh nở 2027 (50–150 triệu/con) chưa có trong mô hình vì rơi trước tuổi 40.
12. Có bổ sung các quỹ để riêng còn lại không (đệm thị trường, chăm sóc tuổi già, dự phòng cho con)?
13. Hai quỹ 500 triệu đang tắt "tăng theo lạm phát" — có chủ ý không? Sức mua giảm ~11% sau 4 năm.
