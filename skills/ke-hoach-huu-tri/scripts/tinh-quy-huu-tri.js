#!/usr/bin/env node
/**
 * Tính quỹ hưu trí — bản CLI tái hiện đúng công thức của "tinh-quy-huu-tri.html" (v8).
 *
 * Cách dùng:
 *   node tinh-quy-huu-tri.js <file-du-lieu.json> [--json] [--set key=value ...]
 *
 *   --json            in kết quả dạng JSON (để agent đọc máy)
 *   --set k=v         ghi đè 1 trường trong "fields" trước khi tính, ví dụ:
 *                     --set retireAge=45
 *                     bhxh.*  ghi đè khối bhxh:   --set bhxh.auto=true --set bhxh.volYears=15
 *                     expenseMonthly hoặc living.monthly ghi đè chi phí sinh hoạt
 *
 * Định dạng file JSON: xem references/mo-hinh-tinh-toan.md
 */
const fs = require('fs');

function parseArgs(argv) {
  const out = { file: null, json: false, sets: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--set') {
      const [k, v] = (argv[++i] || '').split('=');
      if (k) out.sets[k] = v;
    } else if (!out.file) out.file = a;
  }
  return out;
}

const num = (x) => { const n = parseFloat(x); return isNaN(n) ? 0 : n; };
const fmt = (n) => (isFinite(n) ? Math.round(n).toLocaleString('vi-VN') + ' đ' : '–');
const pct = (n) => n.toFixed(1) + '%/năm';
const endOr = (v, dflt) => (v === '' || v === null || v === undefined ? dflt : num(v));

function monthlySavingsNeeded(gap, years, annualReturnPct) {
  if (gap <= 0) return 0;
  const n = years * 12;
  if (n <= 0) return gap;
  const i = annualReturnPct / 100 / 12;
  if (i === 0) return gap / n;
  return gap / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
}

// ---- BHXH tự nguyện (Luật BHXH 2024, số liệu 2025) — giống bhxh-tu-nguyen.js ----
const BHXH = {
  contributionRate: 0.22, floorIncome: 1500000, baseSalary: 2340000, ceilingMultiple: 20,
  stateSupportPct: 0.20, minYears: 15, retireAge: { nam: 62, nu: 60 }, maxRate: 0.75,
};
function bhxhPensionRate(sex, years) {
  if (years < BHXH.minYears) return 0;
  const rate = sex === 'nu' ? 0.45 + Math.max(years - 15, 0) * 0.02
    : (years < 20 ? 0.40 + (years - 15) * 0.01 : 0.45 + (years - 20) * 0.02);
  return Math.min(rate, BHXH.maxRate);
}
function bhxhEstimate(p) {
  const volIncome = Math.min(Math.max(p.volIncome, BHXH.floorIncome), BHXH.baseSalary * BHXH.ceilingMultiple);
  const support = BHXH.stateSupportPct * BHXH.contributionRate * BHXH.floorIncome;
  const monthly = p.volYears > 0 ? volIncome * BHXH.contributionRate - support : 0;
  const totalYears = p.paidYears + p.volYears;
  const avgIncome = totalYears > 0 ? (p.paidYears * p.paidAvg + p.volYears * volIncome) / totalYears : 0;
  const rate = bhxhPensionRate(p.sex, totalYears);
  return { monthly, totalYears, ratePct: rate * 100, avgIncome, pension: rate * avgIncome,
    pensionAge: BHXH.retireAge[p.sex] || 62, eligible: totalYears >= BHXH.minYears };
}

function calculate(state) {
  const f = state.fields || {};
  const currentAge = num(f.currentAge), retireAge = num(f.retireAge), lifeExpectancy = num(f.lifeExpectancy);
  const inflation = num(f.inflation) / 100;
  const currentDebt = num(f.currentDebt);
  // v4: chi phí sinh hoạt nằm ở khối "living"; vẫn đọc fields.expenseMonthly của file cũ
  const living = state.living || {};
  const expenseMonthly = num(living.monthly !== undefined && living.monthly !== null ? living.monthly : f.expenseMonthly);
  const baseYear = num(f.baseYear) || new Date().getFullYear();
  const yearsToRetire = Math.max(retireAge - currentAge, 0);
  const retirementYears = Math.max(lifeExpectancy - retireAge, 1);
  const inflFactor = Math.pow(1 + inflation, yearsToRetire);

  // ---- Tài sản ----
  const assets = state.assets || [];
  let weightedPreSum = 0, totalValueToday = 0;
  assets.forEach((a) => { weightedPreSum += num(a.value) * num(a.preRate); totalValueToday += num(a.value); });
  const avgRate = totalValueToday > 0 ? weightedPreSum / totalValueToday : 7;
  let totalGrown = 0, weightedPostSum = 0;
  const assetDetails = assets.map((a) => {
    const v = num(a.value), preRate = num(a.preRate), type = a.type || 'financial';
    const splitYears = Math.max(num(a.yearsToSplit), 0), spend = num(a.spendElsewhere);
    const postRate = a.postRate === undefined || a.postRate === null || a.postRate === '' ? preRate : num(a.postRate);
    const growYears = Math.min(splitYears, yearsToRetire), investYearsAfter = Math.max(yearsToRetire - splitYears, 0);
    const atSplitValue = v * Math.pow(1 + preRate / 100, growYears);
    const spendCapped = Math.min(spend, atSplitValue);
    const fv = (atSplitValue - spendCapped) * Math.pow(1 + (type === 'realestate' ? avgRate : preRate) / 100, investYearsAfter);
    totalGrown += fv; weightedPostSum += fv * postRate;
    return { name: a.name, type, valueToday: v, preRate, postRate, splitYears, atSplitValue, spendElsewhere: spendCapped, fvAtRetire: fv };
  });
  const postReturn = (totalGrown > 0 ? weightedPostSum / totalGrown : 3) / 100;
  const fvHoldings = totalGrown - currentDebt;

  // ---- Tiết kiệm định kỳ ----
  let fvMonthlySaving = 0;
  const recurringDetails = (state.recurringSavings || []).map((r) => {
    const monthly = num(r.monthly), rate = num(r.rate), iM = rate / 100 / 12, nM = yearsToRetire * 12;
    let fv = 0;
    if (monthly > 0 && nM > 0) fv = iM === 0 ? monthly * nM : monthly * ((Math.pow(1 + iM, nM) - 1) / iM) * (1 + iM);
    fvMonthlySaving += fv;
    return { name: r.name, monthly, rate, fvAtRetire: fv };
  });
  const fvAssets = fvHoldings + fvMonthlySaving;
  const expenseYearlyAtRetire = expenseMonthly * 12 * inflFactor;

  // ---- BHXH ----
  const b = state.bhxh || {};
  const bhxhSex = b.sex || 'nam';
  const bhxhPensionAge = BHXH.retireAge[bhxhSex] || 62;
  const bhxhVolYears = Math.max(Math.min(num(b.volYears), bhxhPensionAge - retireAge), 0);
  const bhxh = bhxhEstimate({ sex: bhxhSex, paidYears: num(b.paidYears), paidAvg: num(b.paidAvg), volIncome: num(b.volIncome), volYears: bhxhVolYears });
  const bhxhAuto = b.auto === true || b.auto === 'true';

  // ---- Thu nhập ----
  const incomeSources = (state.incomes || []).map((i) => ({
    name: i.name, monthly: num(i.monthly), startAge: num(i.startAge), endAge: endOr(i.endAge, lifeExpectancy), auto: false }));
  if (bhxhAuto && bhxh.eligible && bhxh.pension > 0)
    incomeSources.push({ name: 'Lương hưu BHXH (tự tính)', monthly: bhxh.pension, startAge: bhxhPensionAge, endAge: lifeExpectancy, auto: true });

  // ---- Chi phí định kỳ: nhập tay + tự sinh ----
  const extraExpenses = (state.recurringExpenses || []).map((e) => ({
    name: e.name, monthly: num(e.monthly), startAge: num(e.startAge), endAge: endOr(e.endAge, lifeExpectancy), auto: false }));
  if (bhxhAuto && bhxhVolYears > 0 && bhxh.monthly > 0)
    extraExpenses.push({ name: 'Đóng BHXH tự nguyện', monthly: bhxh.monthly, startAge: retireAge, endAge: retireAge + bhxhVolYears - 1, auto: true });
  // Số tiền của một dòng chi phí rơi vào cửa sổ tuổi [a,b] của người dùng (giá hôm nay)
  const amountInWindow = (e, a, b) => {
    const lo = Math.max(e.startAge, a), hi = Math.min(e.endAge, b);
    return hi >= lo ? e.monthly * 12 * (hi - lo + 1) : 0;
  };
  let childPast = 0, childPre = 0, childPost = 0;
  const childDetails = (state.children || []).map((c) => {
    const birth = num(c.birthYear) || baseYear, school = num(c.schoolMonthly), uni = num(c.uniYearly), name = c.name || 'Con';
    const userAgeAt = (k) => currentAge + (birth + k - baseYear);
    const rows = [
      { name: `Học phí ${name}`, monthly: school, startAge: userAgeAt(3), endAge: userAgeAt(17), auto: true },
      { name: `Đại học ${name}`, monthly: uni / 12, startAge: userAgeAt(18), endAge: userAgeAt(21), auto: true },
    ];
    rows.forEach((r) => extraExpenses.push(r));
    const past = rows.reduce((s, e) => s + amountInWindow(e, -9999, currentAge - 1), 0);
    const pre = rows.reduce((s, e) => s + amountInWindow(e, currentAge, retireAge - 1), 0);
    const post = rows.reduce((s, e) => s + amountInWindow(e, retireAge, lifeExpectancy), 0);
    childPast += past; childPre += pre; childPost += post;
    return { name, birthYear: birth, childAgeNow: baseYear - birth, scenario: c.scenario,
      schoolMonthly: school, uniYearly: uni,
      pastToday: past, preRetireToday: pre, afterRetireToday: post,
      remainingToday: pre + post, totalLifetimeToday: past + pre + post,
      userAgeRange: [userAgeAt(3), userAgeAt(21)] };
  });

  // ---- Quỹ để riêng ----
  let reserveTotal = 0;
  const reserveDetails = (state.reserves || []).map((r) => {
    const amount = num(r.amount), age = num(r.neededFromAge) || retireAge;
    const inflate = r.inflate === undefined || r.inflate === null ? true : (r.inflate === true || r.inflate === 'true' || r.inflate === 1 || r.inflate === '1');
    let v = amount * (inflate ? inflFactor : 1);
    const delay = Math.max(age - retireAge, 0);
    if (delay > 0) v = v / Math.pow(1 + postReturn, delay);
    reserveTotal += v;
    return { name: r.name, amountToday: amount, neededFromAge: age, inflate, tier: r.tier || 'A', note: r.note || '', valueAtRetire: v };
  });

  // ---- Cách 1 ----
  const corpus1Base = expenseYearlyAtRetire / 0.04, corpus1 = corpus1Base + reserveTotal;
  const gap1 = Math.max(corpus1 - fvAssets, 0), save1 = monthlySavingsNeeded(gap1, yearsToRetire, avgRate);

  // ---- Cách 2 ----
  const yearData = [];
  for (let t = 1; t <= retirementYears; t++) {
    const age = retireAge + t - 1;
    let incomeYear = 0, extraYear = 0;
    incomeSources.forEach((s) => { if (age >= s.startAge && age <= s.endAge) incomeYear += s.monthly * 12; });
    extraExpenses.forEach((e) => { if (age >= e.startAge && age <= e.endAge) extraYear += e.monthly * 12 * inflFactor; });
    yearData.push({ t, age, incomeYear, extraYear, gapYear: Math.max(expenseYearlyAtRetire + extraYear - incomeYear, 0) });
  }
  let corpus2Base = 0;
  yearData.forEach((y) => { corpus2Base += y.gapYear / Math.pow(1 + postReturn, y.t); });
  const phases = [];
  const key = (y) => Math.round(y.incomeYear) + '|' + Math.round(y.extraYear);
  let seg = yearData[0];
  const pushPhase = (s, endAge) => phases.push({ startAge: s.age, endAge, incomeMonthly: s.incomeYear / 12, extraMonthly: s.extraYear / 12, gapMonthly: s.gapYear / 12 });
  for (let i = 1; i < yearData.length; i++) {
    if (key(yearData[i]) !== key(seg)) { pushPhase(seg, yearData[i - 1].age); seg = yearData[i]; }
  }
  pushPhase(seg, yearData[yearData.length - 1].age);
  const corpus2 = corpus2Base + reserveTotal;
  const gap2 = Math.max(corpus2 - fvAssets, 0), save2 = monthlySavingsNeeded(gap2, yearsToRetire, avgRate);

  // ---- Lộ trình tích lũy theo từng năm ----
  const annuityFV = (monthly, ratePct, years) => {
    const i = ratePct / 100 / 12, n = years * 12;
    if (monthly <= 0 || n <= 0) return 0;
    return i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  };
  const assetsAtYear = (t) => assets.reduce((sum, a) => {
    const v = num(a.value), preRate = num(a.preRate), type = a.type || 'financial';
    const sp = Math.max(num(a.yearsToSplit), 0), spend = num(a.spendElsewhere);
    if (t < sp) return sum + v * Math.pow(1 + preRate / 100, t);
    const atSplit = v * Math.pow(1 + preRate / 100, sp);
    return sum + (atSplit - Math.min(spend, atSplit)) * Math.pow(1 + (type === 'realestate' ? avgRate : preRate) / 100, t - sp);
  }, 0) - currentDebt;
  const track = [];
  for (let t = 0; t <= Math.max(yearsToRetire, 0); t++) {
    let goal = assetsAtYear(t) + annuityFV(save2, avgRate, t);
    (state.recurringSavings || []).forEach((r) => { goal += annuityFV(num(r.monthly), num(r.rate), t); });
    const events = assets.filter((a) => {
      const sp = Math.max(num(a.yearsToSplit), 0);
      return num(a.spendElsewhere) > 0 && sp === t && sp <= yearsToRetire;
    }).map((a) => {
      const atSplit = num(a.value) * Math.pow(1 + num(a.preRate) / 100, t);
      return { name: a.name, amount: Math.min(num(a.spendElsewhere), atSplit) };
    });
    track.push({ yearsFromNow: t, calendarYear: baseYear + t, age: currentAge + t,
      isStart: t === 0, isRetireYear: t === yearsToRetire, targetNetAssets: goal, spendEvents: events });
  }
  const targetForYear = (y) => {
    const e = track.find((x) => x.calendarYear === y);
    return e ? e.targetNetAssets : null;
  };

  // ---- Tổng kết hàng năm (v8) ----
  const netAssetsNow = totalValueToday - currentDebt;
  const reviews = (state.reviews || []).map((r) => {
    const year = num(r.year) || baseYear;
    const extra = num(r.extraAmount);
    const locked = r.locked === true || r.locked === 'true';
    const net = locked && r.lockedNetAssets != null ? num(r.lockedNetAssets) : netAssetsNow + extra;
    const target = locked
      ? (r.lockedTarget == null ? null : num(r.lockedTarget))
      : targetForYear(year);
    const saving = locked && r.lockedMonthlySaving != null ? num(r.lockedMonthlySaving) : save2;
    const checks = r.checks || {};
    const doneCount = Object.keys(checks).filter((k) => checks[k]).length;
    return { year, extraAmount: extra, locked, lockedOn: r.lockedOn || '', note: r.note || '',
      netAssets: net, target, monthlySaving: saving,
      diff: target == null ? null : net - target,
      onTrack: target == null ? null : net >= target,
      checks, checksDone: doneCount, checksTotal: Object.keys(checks).length };
  });

  return {
    meta: Object.assign({ lastUpdated: null, version: 6 }, state.meta || {}),
    inputs: { currentAge, retireAge, lifeExpectancy, inflationPct: inflation * 100, currentDebt, expenseMonthly, baseYear, yearsToRetire, retirementYears },
    track,
    trackAssumedMonthlySaving: save2,
    reviews,
    netAssetsNow,
    warnings: (() => {
      const w = [];
      const dup = (state.incomes || []).filter((i) => /lương hưu|luong huu|hưu trí/i.test(i.name || ''));
      if (bhxhAuto && dup.length) w.push('Bật bhxh.auto nhưng incomes vẫn có dòng lương hưu: ' + dup.map((i) => i.name).join(', ') + ' — đang cộng hai lần.');
      if (!bhxhAuto && !dup.length) w.push('Tắt bhxh.auto và không có dòng lương hưu nào trong incomes — kế hoạch không có lương hưu.');
      if (childPre > 0) w.push('Chi cho con từ nay đến lúc nghỉ hưu (' + fmt(childPre) + ') KHÔNG bị trừ vào tài sản tích lũy — mô hình không mô phỏng chi tiêu trước nghỉ hưu.');
      const nowYear = new Date().getFullYear();
      if ((state.reviews || []).length === 0) w.push('Chưa có dòng tổng kết hàng năm nào — mở HTML, mục "Tổng kết hàng năm", thêm một dòng để bắt đầu theo dõi tiến độ.');
      if (baseYear && nowYear > baseYear) w.push('Dữ liệu nhập theo giá năm ' + baseYear + ' nhưng nay đã là ' + nowYear + ' (lệch ' + (nowYear - baseYear) + ' năm). Mở HTML và bấm "Dời mốc thời gian", rồi nhập lại giá trị tài sản thực tế trước khi tin con số.');
      return w;
    })(),
    assets: assetDetails,
    recurringSavings: recurringDetails,
    portfolio: { avgPreRatePct: avgRate, avgPostRatePct: postReturn * 100, totalGrown, fvHoldingsAfterDebt: fvHoldings, fvMonthlySaving, fvAssets },
    expense: { monthlyToday: expenseMonthly, note: living.note || '', monthlyAtRetire: expenseYearlyAtRetire / 12, yearlyAtRetire: expenseYearlyAtRetire },
    bhxh: { ...bhxh, auto: bhxhAuto, volYearsEffective: bhxhVolYears, sex: bhxhSex },
    incomes: incomeSources,
    extraExpenses,
    children: childDetails,
    childTotals: { pastToday: childPast, preRetireToday: childPre, afterRetireToday: childPost },
    reserves: reserveDetails,
    reserveTotalAtRetire: reserveTotal,
    method1_rule4pct: { corpusBase: corpus1Base, corpus: corpus1, fvAssets, gap: gap1, extraMonthlySaving: save1, sustainable: postReturn * 100 >= 4 },
    method2_cashflow: { corpusBase: corpus2Base, corpus: corpus2, fvAssets, gap: gap2, extraMonthlySaving: save2, phases },
  };
}

function printReport(r) {
  const L = (s) => console.log(s);
  if (r.warnings.length) { L('!!! CẢNH BÁO'); r.warnings.forEach((w) => L('  - ' + w)); L(''); }
  L('=== THÔNG SỐ ===');
  L(`Tuổi hiện tại ${r.inputs.currentAge} → nghỉ hưu ${r.inputs.retireAge} (còn ${r.inputs.yearsToRetire} năm) → tuổi thọ ${r.inputs.lifeExpectancy} (${r.inputs.retirementYears} năm hưu) · năm gốc ${r.inputs.baseYear}`);
  L(`Lạm phát ${r.inputs.inflationPct}%/năm · Nợ ${fmt(r.inputs.currentDebt)}`);
  L(`Chi phí sinh hoạt: ${fmt(r.expense.monthlyToday)}/tháng giá hôm nay → ${fmt(r.expense.monthlyAtRetire)}/tháng tại lúc nghỉ hưu${r.expense.note ? ' (' + r.expense.note + ')' : ''}`);
  L('\n=== TÀI SẢN (quy đổi tại lúc nghỉ hưu) ===');
  r.assets.forEach((a) => {
    let s = `- ${a.name} [${a.type}] ${fmt(a.valueToday)} @${a.preRate}% → ${fmt(a.fvAtRetire)}`;
    if (a.spendElsewhere > 0) s += `  (năm ${a.splitYears}: giá trị ${fmt(a.atSplitValue)}, dùng việc khác ${fmt(a.spendElsewhere)})`;
    L(s + `  · sau hưu @${a.postRate}%`);
  });
  L(`Tổng: ${fmt(r.portfolio.totalGrown)} · sau trừ nợ: ${fmt(r.portfolio.fvHoldingsAfterDebt)}`);
  L('\n=== TIẾT KIỆM ĐỊNH KỲ ===');
  r.recurringSavings.forEach((s) => L(`- ${s.name}: ${fmt(s.monthly)}/tháng @${s.rate}% → ${fmt(s.fvAtRetire)}`));
  L(`>>> TỔNG TÀI SẢN DỰ KIẾN TẠI LÚC NGHỈ HƯU (đã trừ nợ): ${fmt(r.portfolio.fvAssets)}`);
  L(`Lãi bình quân trước hưu ${pct(r.portfolio.avgPreRatePct)} · sau hưu ${pct(r.portfolio.avgPostRatePct)}`);
  L('\n=== BHXH TỰ NGUYỆN ' + (r.bhxh.auto ? '(ĐANG BẬT tự tính)' : '(tắt — dùng dòng lương hưu nhập tay)') + ' ===');
  L(`${r.bhxh.sex}, đóng ${r.bhxh.volYearsEffective} năm → ${fmt(r.bhxh.monthly)}/tháng · tổng ${r.bhxh.totalYears} năm · ${r.bhxh.ratePct.toFixed(0)}% · lương hưu ${r.bhxh.eligible ? fmt(r.bhxh.pension) : 'chưa đủ 15 năm'} từ ${r.bhxh.pensionAge}`);
  L('\n=== THU NHẬP HƯU ===');
  r.incomes.forEach((i) => L(`- ${i.name}: ${fmt(i.monthly)}/tháng, tuổi ${i.startAge}–${i.endAge}${i.auto ? ' (tự sinh)' : ''}`));
  L('\n=== CHI PHÍ ĐỊNH KỲ NGOÀI SINH HOẠT (giá hôm nay) ===');
  r.extraExpenses.filter((e) => e.monthly > 0).forEach((e) => L(`- ${e.name}: ${fmt(e.monthly)}/tháng, tuổi ${e.startAge}–${e.endAge}${e.auto ? ' (tự sinh)' : ''}`));
  if (r.children.length) {
    L('\n=== CON CÁI ===');
    r.children.forEach((c) => L(`- ${c.name} (sinh ${c.birthYear}, nay ${c.childAgeNow} tuổi): đã chi ${fmt(c.pastToday)} · từ nay đến nghỉ hưu ${fmt(c.preRetireToday)} · sau nghỉ hưu ${fmt(c.afterRetireToday)} (chỉ phần này vào quỹ)`));
    L(`Tổng: đã chi ${fmt(r.childTotals.pastToday)} · trước nghỉ hưu ${fmt(r.childTotals.preRetireToday)} · sau nghỉ hưu ${fmt(r.childTotals.afterRetireToday)}`);
  }
  L('\n=== QUỸ ĐỂ RIÊNG ===');
  r.reserves.forEach((x) => L(`- [${x.tier}] ${x.name}: ${fmt(x.amountToday)} → ${fmt(x.valueAtRetire)} tại nghỉ hưu (cần từ ${x.neededFromAge})`));
  L(`Tổng: ${fmt(r.reserveTotalAtRetire)}`);
  L('\n=== CÁCH 1 — QUY TẮC 4% ===');
  L(`Quỹ 4%: ${fmt(r.method1_rule4pct.corpusBase)} + quỹ để riêng = ${fmt(r.method1_rule4pct.corpus)} · Còn thiếu: ${fmt(r.method1_rule4pct.gap)} · Tiết kiệm thêm: ${fmt(r.method1_rule4pct.extraMonthlySaving)}/tháng`);
  L('\n=== CÁCH 2 — DÒNG TIỀN THEO GIAI ĐOẠN ===');
  r.method2_cashflow.phases.forEach((p) => L(`- Tuổi ${p.startAge}–${p.endAge} (${p.endAge - p.startAge + 1} năm): chi khác ${fmt(p.extraMonthly)} · thu nhập ${fmt(p.incomeMonthly)} → cần bù ${fmt(p.gapMonthly)}/tháng`));
  L(`Quỹ bù dòng tiền: ${fmt(r.method2_cashflow.corpusBase)} + quỹ để riêng = ${fmt(r.method2_cashflow.corpus)}`);
  L(`>>> Còn thiếu: ${fmt(r.method2_cashflow.gap)} · Cần tiết kiệm thêm: ${fmt(r.method2_cashflow.extraMonthlySaving)}/tháng`);
  L('\n=== LỘ TRÌNH TÍCH LŨY (tổng tài sản đã trừ nợ nên có vào cuối mỗi năm) ===');
  L(`Giả định tiết kiệm thêm ${fmt(r.trackAssumedMonthlySaving)}/tháng ngoài các khoản đang có.`);
  r.track.forEach((x) => {
    const when = x.isStart ? `Hiện tại (${x.calendarYear}) · bạn ${x.age} tuổi — ĐIỂM XUẤT PHÁT`
      : `Cuối ${x.calendarYear} · bạn ${x.age} tuổi${x.isRetireYear ? ' — NGHỈ HƯU' : ` · còn ${r.inputs.yearsToRetire - x.yearsFromNow} năm`}`;
    let line = `- ${when}: ${fmt(x.targetNetAssets)}`;
    x.spendEvents.forEach((e) => { line += `  [năm này bán/trích ${e.name}, chuyển ${fmt(e.amount)} sang việc khác nên mốc tụt xuống]`; });
    L(line);
  });
  if (r.reviews.length) {
    L('\n=== TỔNG KẾT HÀNG NĂM ===');
    r.reviews.forEach((x) => {
      let line = `- ${x.year}: thực tế ${fmt(x.netAssets)}`;
      if (x.target == null) line += ' · chưa có mục tiêu để so';
      else line += ` · mục tiêu ${fmt(x.target)} → ${x.onTrack ? 'ĐI TRƯỚC ' : 'CHẬM '}${fmt(Math.abs(x.diff))}`;
      line += ` · tiết kiệm thêm ${fmt(x.monthlySaving)}/tháng`;
      line += x.locked ? `  [đã chốt${x.lockedOn ? ' ' + x.lockedOn : ''}]` : '  [chưa chốt]';
      if (x.checksTotal) line += ` · checklist ${x.checksDone}/${x.checksTotal}`;
      if (x.note) line += ` · ${x.note}`;
      L(line);
    });
  }
  if (r.meta.lastUpdated) L(`\nDữ liệu lưu lần gần nhất: ${r.meta.lastUpdated} · năm gốc ${r.inputs.baseYear}`);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) { console.error('Cách dùng: node tinh-quy-huu-tri.js <file.json> [--json] [--set key=value]'); process.exit(1); }
  const state = JSON.parse(fs.readFileSync(args.file, 'utf8'));
  state.fields = Object.assign({}, state.fields);
  state.bhxh = Object.assign({}, state.bhxh);
  state.living = Object.assign({}, state.living);
  Object.keys(args.sets).forEach((k) => {
    if (k.startsWith('bhxh.')) state.bhxh[k.slice(5)] = args.sets[k];
    else if (k === 'expenseMonthly' || k === 'living.monthly') state.living.monthly = args.sets[k];
    else state.fields[k] = args.sets[k];
  });
  const result = calculate(state);
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else printReport(result);
}

module.exports = { calculate, monthlySavingsNeeded, bhxhEstimate };
