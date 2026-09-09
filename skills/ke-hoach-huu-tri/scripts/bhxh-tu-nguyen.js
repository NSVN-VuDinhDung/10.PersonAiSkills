#!/usr/bin/env node
/**
 * Ước tính chi phí đóng BHXH tự nguyện và lương hưu nhận được.
 * Theo Luật BHXH 2024 (hiệu lực 01/07/2025). Các hằng số pháp lý ở đầu file,
 * cần kiểm tra lại khi luật/lương cơ sở thay đổi.
 *
 * Cách dùng:
 *   node bhxh-tu-nguyen.js --sex nam --paidYears 14 --paidAvg 20000000 \
 *        --volIncome 20000000 --volYears 22 [--json]
 *
 *   --sex        nam | nu  (tuổi hưu và công thức tỷ lệ khác nhau)
 *   --paidYears  số năm đã đóng BHXH bắt buộc tính đến nay
 *   --paidAvg    bình quân thu nhập đã đóng (VNĐ/tháng, giá hôm nay, gần đúng)
 *   --volIncome  mức thu nhập CHỌN để đóng tự nguyện (VNĐ/tháng) — tham số 1
 *   --volYears   số năm sẽ đóng tự nguyện — tham số 2
 *   --json       xuất JSON
 *
 * Mọi số đều theo giá trị thực hôm nay (BHXH có hệ số trượt giá nên xấp xỉ được).
 */
const RULES = {
  contributionRate: 0.22,          // tỷ lệ đóng BHXH tự nguyện trên thu nhập chọn
  floorIncome: 1500000,            // sàn = chuẩn nghèo nông thôn (kiểm tra lại hằng năm)
  baseSalary: 2340000,             // lương cơ sở
  ceilingMultiple: 20,             // trần = 20 × lương cơ sở
  stateSupportPct: 0.20,           // nhà nước hỗ trợ 20% × 22% × chuẩn nghèo cho đối tượng thường
  minYears: 15,                    // số năm tối thiểu để hưởng lương hưu
  retireAge: { nam: 62, nu: 60 },
  maxRate: 0.75,
};

function pensionRate(sex, years) {
  if (years < RULES.minYears) return 0;
  let rate;
  if (sex === 'nu') {
    rate = 0.45 + Math.max(years - 15, 0) * 0.02;
  } else {
    // nam: 15 năm = 40%, +1%/năm đến 20 năm = 45%, sau đó +2%/năm
    rate = years < 20 ? 0.40 + (years - 15) * 0.01 : 0.45 + (years - 20) * 0.02;
  }
  return Math.min(rate, RULES.maxRate);
}

function estimate(p) {
  const volIncome = Math.min(Math.max(p.volIncome, RULES.floorIncome), RULES.baseSalary * RULES.ceilingMultiple);
  const grossMonthly = volIncome * RULES.contributionRate;
  const support = RULES.stateSupportPct * RULES.contributionRate * RULES.floorIncome;
  const netMonthly = grossMonthly - support;
  const totalYears = p.paidYears + p.volYears;
  const avgIncome = totalYears > 0 ? (p.paidYears * p.paidAvg + p.volYears * volIncome) / totalYears : 0;
  const rate = pensionRate(p.sex, totalYears);
  return {
    inputs: { ...p, volIncomeClamped: volIncome },
    monthlyContribution: netMonthly,
    yearlyContribution: netMonthly * 12,
    totalContribution: netMonthly * 12 * p.volYears,
    totalYears,
    pensionRatePct: rate * 100,
    avgIncomeForPension: avgIncome,
    pensionMonthly: rate * avgIncome,
    pensionAge: RULES.retireAge[p.sex] || 62,
    eligible: totalYears >= RULES.minYears,
  };
}

function parse(argv) {
  const p = { sex: 'nam', paidYears: 0, paidAvg: 0, volIncome: RULES.floorIncome, volYears: 0, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') { p.json = true; continue; }
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[++i]; p[k] = k === 'sex' ? v : parseFloat(v); }
  }
  return p;
}

if (require.main === module) {
  const p = parse(process.argv.slice(2));
  const r = estimate(p);
  const f = (n) => Math.round(n).toLocaleString('vi-VN') + ' đ';
  if (p.json) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  console.log(`Đóng tự nguyện ${p.volYears} năm ở mức thu nhập ${f(r.inputs.volIncomeClamped)}/tháng`);
  console.log(`→ Chi ${f(r.monthlyContribution)}/tháng (đã trừ hỗ trợ nhà nước), tổng ${f(r.totalContribution)}`);
  console.log(`Tổng năm đóng: ${r.totalYears} · tỷ lệ hưởng ${r.pensionRatePct.toFixed(0)}% · bình quân thu nhập ${f(r.avgIncomeForPension)}`);
  console.log(`→ Lương hưu ước tính ${f(r.pensionMonthly)}/tháng từ ${r.pensionAge} tuổi (giá hôm nay)${r.eligible ? '' : ' — CHƯA ĐỦ 15 NĂM'}`);
}

module.exports = { estimate, pensionRate, RULES };
