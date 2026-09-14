# Mô hình tính toán quỹ hưu trí (v8)

Tài liệu này mô tả chính xác logic của `tinh-quy-huu-tri.html` (v8, 2026-09-14) và được tái hiện
trong `scripts/tinh-quy-huu-tri.js`. Mọi thay đổi công thức phải cập nhật cả ba nơi.
File `tinh-quy-huu-tri (2).html` là bản v2 cũ, giữ lại để đối chiếu.

**Tương thích ngược đã kiểm chứng bằng Chrome headless:** bản hiện tại nạp được JSON của mọi phiên bản trước
(v2 ra đúng số cũ) vì chi phí sinh hoạt đọc theo thứ tự `living.monthly` → `fields.expenseMonthly`,
còn các khối `meta`, `reserves`, `children`, `recurringExpenses`, `bhxh` thiếu thì coi như rỗng.

## 1. Schema file JSON (`du-lieu-quy-huu-tri.json`)

```jsonc
{
  "meta": {                     // MỚI v6: mốc thời gian
    "lastUpdated": "2026-09-09",// tự ghi lại mỗi lần bấm "Tải file dữ liệu về máy"
    "version": 7
  },
  "living": {                   // MỚI v4: chi phí sinh hoạt, tách khỏi khối fields và khỏi card công thức
    "monthly": 30000000,        // VNĐ/tháng, giá hôm nay — dùng chung cho cả hai cách tính
    "note": "Sinh hoạt cơ bản, chưa gồm học phí con, BHXH, BHYT"
  },
  "assets": [{
    "name": "Chứng khoán",
    "type": "financial",        // "financial" | "realestate"
    "value": 500000000,         // VNĐ hôm nay (số nguyên)
    "preRate": "7",             // %/năm trước nghỉ hưu (financial: lợi nhuận; realestate: tốc độ tăng giá)
    "yearsToSplit": "0",        // sau bao nhiêu năm nữa trích/bán một phần; 0 = giữ đến lúc nghỉ hưu
    "spendElsewhere": 0,        // VNĐ dùng vào việc khác tại thời điểm đó (không đầu tư tiếp)
    "postRate": "7"             // %/năm kỳ vọng SAU nghỉ hưu cho phần giá trị này
  }],
  "incomes": [{                 // thu nhập trong hưu trí, GIÁ TRỊ THỰC hôm nay, không đổi
    "name": "Thuê nhà", "monthly": 3500000, "startAge": "40", "endAge": ""   // "" = hết đời
  }],
  "recurringSavings": [{        // tiết kiệm đều hàng tháng TRƯỚC nghỉ hưu, lãi kép tháng
    "name": "Tiết kiệm từ lương", "monthly": 10000000, "rate": "4"
  }],
  "recurringExpenses": [{       // MỚI v3: chi phí định kỳ ngoài sinh hoạt, giá hôm nay, theo giai đoạn tuổi
    "name": "BHYT hộ gia đình", "monthly": 300000, "startAge": "40", "endAge": ""
  }],
  "children": [{                // MỚI v3: mỗi con sinh ra 2 dòng chi phí tự động (xem 2.6)
    "name": "Con gái", "birthYear": "2018",
    "scenario": "A",            // A | B | C | custom — chỉ để điền sẵn, số thực nằm ở 2 trường dưới
    "schoolMonthly": 3000000,   // VNĐ/tháng, con 3–17 tuổi
    "uniYearly": 40000000       // VNĐ/năm, con 18–21 tuổi
  }],
  "reserves": [{                // MỚI v3: quỹ khoá, cộng vào tổng cần có ở cả 2 cách
    "name": "Y tế khẩn cấp", "amount": 1000000000,   // giá hôm nay
    "neededFromAge": "40",      // > retireAge thì được chiết khấu theo postReturn
    "inflate": true,            // nhân (1+π)^Y
    "tier": "A", "note": "..."
  }],
  "reviews": [{                 // MỚI v8: check-list tổng kết hàng năm
    "year": "2027",
    "extraAmount": 100000000,   // tài sản phát sinh thêm trong năm, ngoài mục Tài sản
    "locked": true,             // đã bấm "Chốt" chưa
    "lockedNetAssets": 4900000000,   // 3 trường locked* chỉ có khi locked = true,
    "lockedTarget": 5415588414,      // đông cứng tại lúc chốt, không đổi khi kế hoạch đổi
    "lockedMonthlySaving": 33797025,
    "lockedOn": "2027-12-28",
    "note": "thưởng cuối năm",
    "checks": { "assets": true, "bhxh": true, "costs": false, "saving": false, "exported": false }
  }],
  "bhxh": {                     // MỚI v3: BHXH tự nguyện
    "sex": "nam",               // nam (hưu 62) | nu (hưu 60)
    "paidYears": "14",          // năm đã đóng bắt buộc
    "paidAvg": 20000000,        // bình quân thu nhập đã đóng, giá hôm nay
    "volIncome": 20000000,      // THAM SỐ 1: mức thu nhập chọn đóng
    "volYears": "22",           // THAM SỐ 2: số năm đóng, tự cắt tại tuổi hưu BHXH
    "auto": false               // true: tự sinh dòng thu nhập "Lương hưu BHXH" + dòng chi "Đóng BHXH"
  },
  "fields": {                   // v4: KHÔNG còn expenseMonthly, đã chuyển sang khối "living"
    "currentDebt": 1400000000, "currentAge": "36", "retireAge": "40", "lifeExpectancy": "80",
    "inflation": "3",
    "baseYear": "2026"          // v3: năm gốc để tính tuổi con
  }
}
```

Quy ước: số tiền là number nguyên; tuổi, năm, tỷ lệ là chuỗi (HTML xuất ra như vậy, script chấp nhận cả hai).
Khi `bhxh.auto = true`, **không** để dòng "Lương hưu" nhập tay trong `incomes` (tính hai lần).

## 2. Các bước tính

Ký hiệu: `Y = retireAge − currentAge`, `R = lifeExpectancy − retireAge` (tối thiểu 1), `π = inflation`,
`F = (1+π)^Y` (hệ số lạm phát đến lúc nghỉ hưu).

### 2.1 Lợi nhuận bình quân trước nghỉ hưu (`avgRate`)
`avgRate = Σ(value × preRate) / Σ(value)` theo giá trị hôm nay của mọi tài sản (mặc định 7% nếu trống).
Dùng ở: tái đầu tư tiền bán bất động sản, và lãi suất trong `monthlySavingsNeeded`.

### 2.2 Giá trị từng tài sản tại lúc nghỉ hưu
`s = min(yearsToSplit, Y)`, `k = max(Y − yearsToSplit, 0)`:
- `atSplit = value × (1+preRate)^s`; `spend = min(spendElsewhere, atSplit)`; `reinvest = atSplit − spend`
- financial: `fv = reinvest × (1+preRate)^k`; realestate: `fv = reinvest × (1+avgRate)^k`

`totalGrown = Σ fv`; `fvHoldings = totalGrown − currentDebt`.

### 2.3 Lợi nhuận bình quân sau nghỉ hưu
`postReturn = Σ(fv × postRate) / Σ fv` (mặc định 3%). Là suất chiết khấu ở Cách 2 và cho quỹ để riêng cần muộn.

### 2.4 Tiết kiệm định kỳ
`i = rate/12`, `n = 12Y`: `fv = monthly × ((1+i)^n − 1)/i × (1+i)` (i = 0: `monthly × n`).
`fvAssets = fvHoldings + Σ fv_recurring` = **tổng tài sản dự kiến tại lúc nghỉ hưu (đã trừ nợ)**.

### 2.5 Chi phí sinh hoạt tại lúc nghỉ hưu
`E = living.monthly × 12 × F`, giữ nguyên danh nghĩa suốt R năm. Đây là khoản duy nhất không có
thời hạn, nên là khoản duy nhất vào Cách 1. Từ v4 nó nằm ở card riêng "Chi phí sinh hoạt", không
còn nằm trong card công thức Cách 1.

### 2.6 BHXH tự nguyện (mới v3)
Hằng số 2025: đóng 22% thu nhập chọn; sàn 1,5 tr; trần 20 × 2,34 tr; hỗ trợ nhà nước 20% × 22% × 1,5 tr = 66 nghìn/tháng;
tối thiểu 15 năm; tuổi hưu nam 62, nữ 60; trần 75%.
- `volYearsEff = clamp(volYears, 0, pensionAge − retireAge)`
- `monthlyContribution = volIncome × 22% − 66.000` (0 nếu volYearsEff = 0)
- `totalYears = paidYears + volYearsEff`; `avgIncome = (paidYears×paidAvg + volYearsEff×volIncome)/totalYears`
- Tỷ lệ: nam 15 năm 40%, +1%/năm đến 20 năm 45%, sau đó +2%/năm; nữ 15 năm 45%, +2%/năm; trần 75%.
- `pension = rate × avgIncome` (giá hôm nay)
- Nếu `auto`: thêm income `{pension, pensionAge → hết đời}` và expense `{monthlyContribution, retireAge → retireAge+volYearsEff−1}`.

### 2.7 Con cái (v3, chia 3 giai đoạn từ v5)
Tuổi của người dùng khi con `k` tuổi: `userAgeAt(k) = currentAge + (birthYear + k − baseYear)`.
Mỗi con sinh 2 dòng chi phí (giá hôm nay): `schoolMonthly` cho tuổi người dùng `[userAgeAt(3), userAgeAt(17)]`,
`uniYearly/12` cho `[userAgeAt(18), userAgeAt(21)]`.

**Không có phép trừ riêng cho phần quá khứ.** Việc loại phần đã chi diễn ra tự động vì Cách 2 chỉ duyệt
các năm `a = retireAge .. lifeExpectancy`; mọi dòng chi phí ở tuổi `< retireAge` không bao giờ được cộng.
Từ v5, mỗi dòng được chẻ thành ba giai đoạn để hiển thị (`amountInWindow(e, a, b)` = `monthly × 12 ×`
số tuổi nằm trong `[max(startAge,a), min(endAge,b)]`):

| Giai đoạn | Cửa sổ tuổi | Vào quỹ? |
|---|---|---|
| Đã chi xong | `(−∞, currentAge − 1]` | không, đã tiêu rồi |
| Từ nay đến khi nghỉ hưu | `[currentAge, retireAge − 1]` | **không** — xem cảnh báo dưới |
| Sau khi nghỉ hưu | `[retireAge, lifeExpectancy]` | có, đây là phần duy nhất |

Ví dụ con sinh 2018, `baseYear` 2026, `currentAge` 36, `retireAge` 40: học phí trải từ tuổi bạn 31 đến 45,
trong đó 5 năm đã chi (tuổi bạn 31–35), 4 năm sắp chi trước khi nghỉ hưu (36–39), 6 năm sau nghỉ hưu (40–45).
Chỉ 6 năm cuối vào quỹ.

**Cảnh báo giai đoạn giữa:** khoản chi cho con từ nay đến lúc nghỉ hưu không bị trừ vào `fvAssets`, vì mô hình
không mô phỏng chi tiêu trước nghỉ hưu (giới hạn 5). Nếu tiền đó lấy từ khoản đang tiết kiệm thì
`recurringSavings` phải được giảm tương ứng, nếu không tổng tài sản tại lúc nghỉ hưu bị tính cao hơn thực tế.
HTML và script đều tự nêu cảnh báo này kèm số tiền.

### 2.8 Chi phí định kỳ (mới v3)
`extraExpenses` = nhập tay + tự sinh (BHXH, con cái). Trong năm hưu tuổi `a`:
`extraYear(a) = Σ monthly × 12 × F` của các dòng có `startAge ≤ a ≤ endAge`. Nhân `F` để cùng đơn vị với `E`.

### 2.9 Quỹ để riêng (mới v3)
`v = amount × (inflate ? F : 1)`; nếu `neededFromAge > retireAge`: `v /= (1+postReturn)^(neededFromAge − retireAge)`.
`reserveTotal = Σ v`. Cộng vào **cả hai** cách.

### 2.10 Cách 1 — Quy tắc 4%
`corpus1 = E/0,04 + reserveTotal`; `gap1 = max(corpus1 − fvAssets, 0)`; `save1 = monthlySavingsNeeded(gap1, Y, avgRate)`.
Chi phí định kỳ và con cái **không** vào Cách 1 (có thời hạn, không phù hợp quy tắc rút vĩnh viễn).

### 2.11 Cách 2 — Dòng tiền theo giai đoạn
Với `t = 1..R`, `a = retireAge + t − 1`:
- `incomeYear(a) = Σ monthly × 12` của các nguồn đang hoạt động (giá thực, không nhân F)
- `gap(a) = max(E + extraYear(a) − incomeYear(a), 0)`
- `corpus2 = Σ gap(a)/(1+postReturn)^t + reserveTotal`; `gap2 = max(corpus2 − fvAssets, 0)`; `save2` như trên.
- Giai đoạn hiển thị: gom các năm liền kề có cùng (incomeYear, extraYear).

### 2.12 `monthlySavingsNeeded(gap, years, rate)`
`gap / [((1+i)^n − 1)/i × (1+i)]`, `i = rate/12`, `n = 12·years`.

### 2.13 Lộ trình tích lũy theo năm (mới v6)
Trả lời câu hỏi "cuối năm sau tôi phải có bao nhiêu". Với mỗi `t = 1..Y`:

`target(t) = assetsAtYear(t) + Σ annuityFV(recurringSavings) + annuityFV(save2, avgRate, t)`

trong đó `assetsAtYear(t)` dùng lại logic 2.2 nhưng chân trời `t`, **có sửa một lỗi biên**:
nếu `t < yearsToSplit` thì tài sản chưa bị bán nên **không trừ** `spendElsewhere`
(công thức 2.2 gốc trừ vô điều kiện — chỉ đúng khi `yearsToSplit ≤ Y`, đúng với dữ liệu hiện tại).

Bảng chạy từ `t = 0` (điểm xuất phát, `target(0)` = tài sản ròng hôm nay) đến `t = Y`.
Tại `t = Y`, `target(Y) = corpus2` đúng bằng tổng cần có, nên lộ trình luôn hạ cánh đúng đích.
Mốc **có thể tụt xuống** ở năm bán tài sản (tiền chuyển sang việc khác rời khỏi kế hoạch);
HTML và script đều chú thích rõ năm đó. Con số này là **tổng tài sản đang nắm giữ đã trừ nợ**,
kể cả nhà đất chưa bán, nên so trực tiếp được với thực tế.

### 2.14 Mốc thời gian và dời mốc (v6, sửa cách làm ở v7)
`meta.lastUpdated` ghi ngày xuất file. HTML so `fields.baseYear` với năm trên máy;
lệch > 0 thì cảnh báo và hiện nút "Dời mốc thời gian N năm".

**Nguyên tắc do người dùng chốt (2026-09-09): nút chỉ sửa những thứ phụ thuộc SỐ NĂM,
tuyệt đối không nhân lạm phát vào bất kỳ số tiền nào.** Bản v6 từng nhân `(1+π)^N` vào mọi
khoản "giá hôm nay" — đã bỏ ở v7 vì làm người dùng mất kiểm soát số liệu của chính mình.

| Trường | Bản chất | Nút dời mốc N năm |
|---|---|---|
| `fields.currentAge` | tuổi tại năm gốc | **+N** (kéo theo `Y = retireAge − currentAge` ngắn lại) |
| `fields.baseYear` | năm gốc | **= năm hiện tại** |
| `assets[].yearsToSplit` | đếm ngược "còn mấy năm nữa mới bán" | **max(s − N, 0)**; nếu về 0 thì nhắc kiểm tra xem đã bán chưa |
| Mọi số tiền | không phụ thuộc số năm | **giữ nguyên**, người dùng tự sửa khoản nào đã đổi |
| `startAge`, `endAge`, `neededFromAge`, `retireAge`, `lifeExpectancy` | mốc tuổi tuyệt đối | giữ nguyên |
| `children[].birthYear` | năm sinh tuyệt đối | giữ nguyên |
| `bhxh.volYears` | số năm sẽ đóng, tính từ lúc nghỉ hưu | giữ nguyên |
| `bhxh.paidYears` | số năm đã đóng, tăng nếu vẫn đi làm | giữ nguyên, hộp xác nhận nhắc kiểm tra |
| `assets[].value`, `fields.currentDebt` | giá trị thực tế | giữ nguyên, người dùng **phải** nhập lại |

Quan hệ `userAgeAt(k) = currentAge + (birthYear + k − baseYear)` tự nhất quán vì `currentAge`
và `baseYear` cùng dịch N.

Hộp xác nhận liệt kê từng thay đổi cụ thể (kể cả tên tài sản và mốc bán mới) trước khi áp dụng.
Ví dụ đã kiểm chứng: năm gốc 2024, tuổi 34, nhà bán sau 4 năm → bấm dời 2 năm → tuổi 36, năm gốc 2026,
nhà bán sau 2 năm, mọi số tiền y nguyên, "cần tiết kiệm thêm" đổi từ 19,4 tr lên 32,9 tr/tháng
chỉ vì thời gian còn lại ngắn đi.

## 3. Giới hạn của mô hình (nêu khi ảnh hưởng kết luận)

1. **avgRate bị kéo thấp bởi tài sản không sinh lời.** Nhà ở 5 tỷ @0% chiếm ~80% giá trị nên avgRate ≈ 1,1%;
   tiền bán nhà chỉ tái đầu tư ở 1,1% và "cần tiết kiệm thêm mỗi tháng" bị tính với lãi 1,1%. Khắc phục: tách nhà ở
   khỏi danh mục, hoặc thêm trường lãi tái đầu tư riêng cho tiền bán BĐS.
2. **Lẫn đơn vị thực/danh nghĩa.** Chi phí (sinh hoạt + định kỳ) được nhân F rồi giữ nguyên; thu nhập hưu giữ giá trị
   thực; chiết khấu bằng `postReturn` danh nghĩa. Ngầm coi `postReturn` là lãi thực → **lạc quan** với 40 năm hưu.
3. **Nợ không tính lãi, không lịch trả.**
4. **Không có thuế, phí giao dịch, biến động thị trường.**
5. **Chi tiêu trước nghỉ hưu không được mô phỏng**: học phí con, sinh nở 2027, trả nợ trước 40 tuổi chỉ ảnh hưởng
   gián tiếp qua `recurringSavings` mà người dùng tự điều chỉnh.
6. **Cách 1 bỏ qua thu nhập hưu và chi phí có thời hạn**, chỉ dùng làm trần.
7. **Hằng số BHXH** là số 2025, phải kiểm tra lại hằng năm; lương hưu thực tế còn phụ thuộc hệ số trượt giá.
8. **Đóng thêm BHXH luôn làm thiếu hụt tăng trong mô hình này.** Tiền đóng rơi vào giai đoạn eo hẹp và
   được nhân lạm phát `F`, còn lương hưu chỉ đến từ tuổi 62, giữ giá trị thực, rồi bị chiết khấu ~5,4%/năm
   và cắt ở tuổi thọ 80. Đây là hệ quả của giới hạn 2 (lẫn thực/danh nghĩa), không phải kết luận tài chính:
   ngoài đời lương hưu được điều chỉnh theo trượt giá và trả đến hết đời, nên đừng khuyên người dùng
   bỏ BHXH chỉ vì con số này.

### 2.15 Tổng kết hàng năm (mới v8)
Mỗi dòng `reviews[]` là một lần rà cuối năm, có hai trạng thái.

| Trạng thái | Tài sản ròng | Mục tiêu | Mức tiết kiệm |
|---|---|---|---|
| **Chưa chốt** | `Σ assets[].value − currentDebt + extraAmount`, tính lại mỗi lần dữ liệu đổi | `targetForYear(year)` lấy từ bảng lộ trình hiện tại | `save2` hiện tại |
| **Đã chốt** | `lockedNetAssets` | `lockedTarget` | `lockedMonthlySaving` |

Bấm **Chốt** chép ba giá trị đang tính vào ba trường `locked*` kèm `lockedOn`, rồi khoá ô năm và ô
phát sinh thêm. Bấm **Tính lại** đặt `locked = false` để quay về tính sống. Ô ghi chú và các ô tick
luôn sửa được ở cả hai trạng thái.

**Vì sao đông cứng cả mục tiêu** (người dùng chốt 2026-09-14): nếu về sau đổi tuổi nghỉ hưu hay chi phí,
toàn bộ lộ trình tính lại và mục tiêu của các năm cũ sẽ khác đi, làm lịch sử so sánh bị méo.
Hệ quả cần lưu ý: dòng đã chốt có thể lệch với bảng Lộ trình hiện hành — đó là chủ ý, không phải lỗi.

`targetForYear(y)`: tìm `y` trong mảng `track` (từ `baseYear` đến `baseYear + Y`).
Ngoài phạm vi thì trả `null` và hiển thị "chưa có mục tiêu để so".

Năm mục trong check-list, khoá trong `checks`:
`assets` (cập nhật giá trị tài sản và nợ), `bhxh` (cập nhật số năm đã đóng),
`costs` (rà chi phí sinh hoạt và học phí), `saving` (kiểm tra mức tiết kiệm hàng tháng),
`exported` (đã tải file về máy lưu lại).

## 4. Cảnh báo tự động trong HTML và script

- Bật `bhxh.auto` mà `incomes` vẫn còn dòng tên chứa "lương hưu"/"hưu trí" → cảnh báo cộng hai lần.
- Tắt `bhxh.auto` và không có dòng lương hưu nào → cảnh báo kế hoạch không có lương hưu.
- Có chi phí nuôi con rơi vào khoảng từ nay đến lúc nghỉ hưu → cảnh báo khoản đó không bị trừ vào tài sản.
- `baseYear` nhỏ hơn năm hiện tại → cảnh báo dữ liệu cũ, phải dời mốc trước khi tin con số.
- `reviews` rỗng → nhắc người dùng thêm dòng tổng kết đầu tiên để bắt đầu theo dõi tiến độ.
Script cũng trả về mảng `warnings` tương ứng khi chạy `--json`, và in ở đầu báo cáo.
