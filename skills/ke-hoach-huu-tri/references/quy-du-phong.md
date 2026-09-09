# Các quỹ để riêng và chi phí ngoài sinh hoạt sau nghỉ hưu

Trạng thái 2026-09-09: cơ chế đã có đủ trong HTML v7, JSON và script (`reserves`, `recurringExpenses`,
`children`, `bhxh` — schema ở `mo-hinh-tinh-toan.md` mục 1). Tài liệu này là **danh sách đề xuất**;
số liệu thực tế người dùng đang dùng nằm ở `ho-so-hien-tai.md`, không phải ở đây.

**Người dùng đã chốt gì (tính đến 2026-09-09):**

| Khoản | Đề xuất ban đầu | Người dùng chọn |
|---|---|---|
| #1 Y tế khẩn cấp | 1 tỷ, tăng theo lạm phát | **500 triệu, KHÔNG tăng theo lạm phát** |
| #2 Cầu nối sinh hoạt | 1 tỷ, tăng theo lạm phát | **500 triệu, KHÔNG tăng theo lạm phát** |
| #4a BHXH tự nguyện | 20 tr × 22 năm | **40 tr × 4 năm**, đã bật `auto` → lương hưu 7,2 tr |
| #4b BHYT | 300 nghìn/tháng | **200 nghìn/tháng** |
| #7 Con cái | kịch bản A (3 tr / 40 tr) | **5 tr/tháng và 50 tr/năm cho cả 3 con** |
| Khoản tự thêm | – | **Dự phòng chi khoản lớn 2 triệu/tháng** (gần với #6) |

**Chưa nhận:** #3 đệm thị trường, #5 chăm sóc dài hạn, #8 trải nghiệm, #9 hậu sự, #7b dự phòng cho con.

Có hai loại khoản, cần phân biệt khi mô hình hoá:

- **Quỹ khoá (vốn để riêng một lần):** cộng thẳng vào tổng cần có tại lúc nghỉ hưu. Ví dụ #1, #2, #3, #5.
- **Chi phí định kỳ theo giai đoạn:** trừ vào dòng tiền từng năm ở Cách 2, giống như thu nhập âm. Ví dụ #4a, #4b, #7.

## 1. Quỹ khoá đề xuất

Ưu tiên: **A** bắt buộc, **B** nên có, **C** tùy chọn. Số tiền theo giá hôm nay.

| # | Quỹ | Ưu tiên | Số tiền gợi ý | Mục đích và điều kiện rút | Cất giữ |
|---|---|---|---|---|---|
| 1 | Y tế khẩn cấp / bệnh hiểm nghèo | A | **1 tỷ** (người dùng đề xuất) | Chi trả điều trị khi mắc bệnh hiểm nghèo, tai nạn nặng. Chỉ rút khi có chẩn đoán. | Tiết kiệm kỳ hạn ngắn hoặc trái phiếu, rút được trong 1 tuần. Cân nhắc bảo hiểm bệnh hiểm nghèo để giảm số tiền phải khoá. |
| 2 | Cầu nối sinh hoạt khi mất thu nhập | A | **1 tỷ** (người dùng đề xuất) | Duy trì sinh hoạt khi "thu nhập khác" 10 tr và thuê nhà 3,5 tr ngừng, cho đến khi kiếm lại được hoặc đến tuổi lương hưu. Ở mức bù 20,3 tr/tháng, 1 tỷ đủ ~49 tháng. | Tiết kiệm kỳ hạn 6–12 tháng, chia nhiều sổ để rút từng phần. |
| 3 | Đệm thị trường (2–3 năm chi phí bằng tiền mặt) | A | **0,8–1,2 tỷ** (2–3 năm × 405 tr) | Tránh phải bán chứng khoán, BĐS lúc giá xuống trong những năm đầu nghỉ hưu. Rút khi danh mục giảm >15–20%, nạp lại khi phục hồi. | Tiền gửi, quỹ trái phiếu. Có thể gộp một phần với #2 nếu chấp nhận rủi ro hai sự kiện xảy ra cùng lúc. |
| 5 | Chăm sóc dài hạn tuổi già (70+) | B | **1–1,5 tỷ** | Người chăm sóc, viện dưỡng lão, bệnh mãn tính giai đoạn cuối. Khác #1 vì kéo dài nhiều năm. | 30 năm nữa mới cần, có thể để trong danh mục dài hạn, chuyển dần sang an toàn từ 60 tuổi. |
| 6 | Sửa chữa và thay thế lớn | B | **300–500 tr mỗi 10 năm**, hoặc khoá 500 tr | Sửa nhà, thay xe, thiết bị, phí pháp lý. Không nằm trong 30 tr/tháng. | Nạp dần từ lợi nhuận danh mục. |
| 8 | Trải nghiệm và học nghề mới | C | **200–500 tr** | Du lịch dài ngày, học nghề mới (cũng là cách tạo lại thu nhập cho #2). | Đầu tư dài hạn, chi dần. |
| 9 | Hậu sự và di sản | C | **100–200 tr** | Chi phí cuối đời, không để lại gánh nặng cho con. | Bảo hiểm nhân thọ nhỏ hoặc tiết kiệm. |

## 2. Chi phí định kỳ theo giai đoạn

### 4a. BHXH tự nguyện (đã chốt: 2 tham số)

Tham số người dùng chọn: **mức thu nhập đóng** (VNĐ/tháng) và **số năm đóng**. Script
`scripts/bhxh-tu-nguyen.js` tính chi phí hàng tháng và lương hưu ước tính. Mức đóng = 22% × thu nhập
chọn, trừ hỗ trợ nhà nước (~66 nghìn/tháng). Cần thêm dữ liệu nền: số năm đã đóng BHXH bắt buộc
và bình quân thu nhập đã đóng.

Ví dụ với giả định đã đóng 14 năm ở bình quân 20 tr/tháng (cần người dùng xác nhận), giới tính nam
(tuổi hưu 62, khớp với `startAge` lương hưu trong JSON; nếu nữ thì 60 và tỷ lệ hưởng cao hơn):

| Thu nhập đóng | Số năm | Chi/tháng | Tổng chi | Tổng năm đóng | Tỷ lệ hưởng | Lương hưu/tháng |
|---|---|---|---|---|---|---|
| 10 tr | 15 | 2,1 tr | 384 tr | 29 | 63% | 9,3 tr |
| 10 tr | 22 | 2,1 tr | 563 tr | 36 | 75% | 10,4 tr |
| 20 tr | 15 | 4,3 tr | 780 tr | 29 | 63% | 12,6 tr |
| **20 tr** | **22** | **4,3 tr** | **1,14 tỷ** | 36 | 75% | **15,0 tr** (khớp giả định hiện tại) |
| 30 tr | 15 | 6,5 tr | 1,18 tỷ | 29 | 63% | 15,9 tr |
| 30 tr | 22 | 6,5 tr | 1,72 tỷ | 36 | 75% | 19,6 tr |

Nhận xét: đóng nhiều năm ở mức thấp cho kết quả kém hơn đóng ít năm ở mức cao, vì bình quân thu nhập
bị kéo xuống. **Bảng trên dùng giả định cũ (đã đóng 14 năm @20 tr) và không còn khớp dữ liệu thật.**
Tham số thật của người dùng (đã đóng 11 năm @10 tr, đóng tiếp 40 tr × 4 năm → lương hưu 7,2 tr)
cùng bảng what-if cập nhật nằm ở `ho-so-hien-tai.md` mục 4c và 5b.

Hằng số pháp lý trong script (Luật BHXH 2024, lương cơ sở 2,34 tr, chuẩn nghèo nông thôn 1,5 tr)
cần kiểm tra lại mỗi năm.

### 4b. BHYT hộ gia đình (để riêng theo yêu cầu)

Ước tính theo mức 4,5% lương cơ sở: người thứ nhất ~105 nghìn/tháng, người thứ 2–4 giảm dần
(70%, 60%, 50%), từ người thứ 5 còn 40%. Cả nhà 5 người (2 vợ chồng + 3 con; con dưới 6 tuổi
được cấp thẻ miễn phí) khoảng **250–350 nghìn/tháng**, tức 3–4 tr/năm. Nhỏ, nhưng là điều kiện
để quỹ #1 không bị đội lên vì viện phí không bảo hiểm. Nên đưa vào chi phí định kỳ, không cần quỹ khoá.

### 7. Trách nhiệm gia đình (thông tin người dùng cung cấp 2026-09-09)

- Con gái sinh 2018 (8 tuổi năm 2026). Tròn 18 tuổi năm 2036, khi người dùng 46.
- Dự kiến sinh thêm 2 con năm 2027. Tròn 18 tuổi năm 2045, khi người dùng 55; xong đại học ~2049, người dùng 59.
- Bố mẹ độc lập tài chính, không cần quỹ phụng dưỡng.

**Toàn bộ chi phí nuôi và học của 3 con rơi trọn vào giai đoạn 40–61**, đúng giai đoạn eo hẹp nhất.
Đã đưa vào mô hình từ v3 và tách 3 giai đoạn từ v5 (xem `mo-hinh-tinh-toan.md` mục 2.7).
Người dùng sau đó hạ chi phí sinh hoạt từ 30 xuống 15 tr/tháng, nhiều khả năng vì 30 tr cũ đã gồm nuôi con —
vẫn cần xác nhận.

Đề xuất mô hình hoá theo **chi phí/tháng cho mỗi con theo giai đoạn**, thay vì một quỹ khoá:

| Kịch bản | Mầm non–phổ thông (tr/tháng/con) | Đại học (tr/năm/con, 4 năm) | Tổng 3 con (giá hôm nay) |
|---|---|---|---|
| A. Công lập, ĐH trong nước | 3 | 40 | ~1,9 tỷ |
| B. Tư thục khá, ĐH tốt trong nước | 10 | 100 | ~6 tỷ |
| C. Quốc tế, du học | 30 | 800 | ~24 tỷ |

Cách tính: con gái còn 10 năm phổ thông; hai con nhỏ tính 15 năm (từ 3 tuổi). Chưa gồm chi phí
ăn ở, y tế, sinh hoạt cơ bản của con (ước 3–5 tr/con/tháng, cần xác nhận có trong 30 tr chưa).

Khoản một lần liên quan: **sinh nở 2027**, 50–150 tr/con tùy bệnh viện, tổng 100–300 tr, xảy ra
trước mốc nghỉ hưu nên trừ vào tài sản tích lũy chứ không vào quỹ hưu.

Đề xuất thêm quỹ khoá **7b. Dự phòng cho con** (B, 300–500 tr): bệnh tật, học lại, tai nạn, để
không phải rút từ #1 vốn dành cho người dùng.

## 3. Tác động lên kế hoạch (số cũ, chỉ để tham khảo cách suy luận)

> Bảng dưới tính khi chi phí sinh hoạt còn là 30 tr/tháng và chưa có con cái trong mô hình.
> **Số hiện hành nằm ở `ho-so-hien-tai.md` mục 5** (thiếu 1,66 tỷ, cần tiết kiệm thêm 33,8 tr/tháng).
> Giữ lại đoạn này vì nó cho thấy độ nhạy của kế hoạch với quy mô quỹ khoá.

Baseline khi đó: tài sản 2,68 tỷ, quỹ cần 3,32 tỷ, thiếu 0,64 tỷ, tiết kiệm thêm 13 tr/tháng.

| Tổng quỹ khoá | Thiếu hụt | Tiết kiệm thêm/tháng (lãi 1,1%) |
|---|---|---|
| 2 tỷ (#1 + #2 ở mức 1 tỷ) | 2,64 tỷ | 54 tr |
| 3 tỷ (thêm #3) | 3,64 tỷ | 74 tr |
| 4 tỷ (thêm #5) | 4,64 tỷ | 94 tr |

Bài học rút ra vẫn đúng: **mỗi 1 tỷ quỹ khoá thêm vào đòi hỏi khoảng 20 triệu tiết kiệm mỗi tháng**
trong 4 năm còn lại. Đó là lý do người dùng hạ hai quỹ xuống 500 triệu.

Ba đòn bẩy cân bằng:

1. **Lùi tuổi nghỉ hưu** hoặc nghỉ hưu bán phần (giữ "thu nhập khác" cao hơn 10 tr).
   Số cập nhật: lùi sang 45 tuổi thì thiếu hụt còn 0,39 tỷ.
2. **Dùng bảo hiểm thay một phần quỹ khoá** (bệnh hiểm nghèo, nhân thọ có người thụ hưởng là con).
3. **Tách nhà ở khỏi danh mục** và làm rõ 3 tỷ "việc khác" khi bán nhà có phải là nguồn cho các quỹ này không.

## 4. Schema bản nháp ban đầu (LỖI THỜI — schema thực tế ở `mo-hinh-tinh-toan.md` mục 1)

```jsonc
"reserves": [{                     // quỹ khoá
  "name": "Y tế khẩn cấp",
  "amount": 1000000000,            // VNĐ, giá hôm nay
  "inflate": true,                 // nhân (1+π)^Y để ra giá trị tại lúc nghỉ hưu
  "neededFromAge": "40",           // 70 cho chăm sóc dài hạn → được chiết khấu
  "tier": "A",
  "note": "Chỉ rút khi có chẩn đoán bệnh hiểm nghèo"
}],
"recurringExpenses": [{            // chi phí định kỳ theo giai đoạn, ngoài expenseMonthly
  "name": "BHXH tự nguyện",
  "monthly": 4334000,              // giá hôm nay; với BHXH lấy từ bhxh-tu-nguyen.js
  "startAge": "40", "endAge": "61"
}, {
  "name": "Học phí con gái (2018)", "monthly": 3000000, "startAge": "40", "endAge": "45"
}, {
  "name": "Đại học con gái", "monthly": 3333333, "startAge": "46", "endAge": "49"
}],
"bhxh": {                          // tham số cho bhxh-tu-nguyen.js
  "sex": "nam", "paidYears": 14, "paidAvg": 20000000,
  "volIncome": 20000000, "volYears": 22
},
"children": [                      // để agent sinh recurringExpenses theo kịch bản
  { "name": "Con gái", "birthYear": 2018, "scenario": "A" },
  { "name": "Con 2", "birthYear": 2027, "scenario": "A" },
  { "name": "Con 3", "birthYear": 2027, "scenario": "A" }
]
```

Cách tính dự kiến ở Cách 2: mỗi năm hưu, `gap = max(expense + Σ recurringExpenses − Σ incomes, 0)`;
`corpus2 = Σ gap/(1+postReturn)^t + Σ reserves`. Cách 1 giữ nguyên làm trần. Lương hưu trong
`incomes` nên được sinh tự động từ `bhxh` thay vì nhập tay 15 tr, để hai tham số đóng và
lương hưu nhận luôn khớp nhau.
