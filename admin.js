// لوحة المشرف الإداري — تعتمد على متغيرات umrah.js ($, esc, post, code, role, me, toast, phoneHref, STATUS_CLS, when, endOf, loadImg, askConfirm)
let admTab = 'today', admLabel = '', admData = null, cntCtx = null, pplData = null, schedData = [], schedAll = false, impRows = null, auditData = [];

const JSPDF = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const loadLib = (src, ok) => ok() ? Promise.resolve() : new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
const admFonts = () => Promise.all([document.fonts.load('700 30px Tajawal'), document.fonts.load('400 22px Tajawal')]).catch(() => {});
const admPost = (action, extra = {}) => post({ action, code, ...extra }).then(r => { if (!r.ok) throw new Error(r.error || ''); return r; });
const admRefresh = tab => `<button type="button" class="btn btn-sm btn-gold-outline mb-3" data-tab="${tab}"><i class="bi bi-arrow-clockwise ms-1"></i>تحديث</button>`;
const fmtMin = m => m == null ? '—' : m < 60 ? Math.round(m) + ' د' : Math.floor(m / 60) + ' س ' + Math.round(m % 60) + ' د';
const busName = b => b === 'بدون باص' ? b : 'باص ' + b;
const ADM_TABS = [['today', 'اليوم', 'bi-speedometer2'], ['att', 'الحضور', 'bi-bus-front'], ['count', 'العدّ', 'bi-123'], ['ppl', 'المعتمرون', 'bi-people'],
  ['sched', 'الجدول', 'bi-calendar-event'], ['rate', 'التقييمات', 'bi-star'], ['inq', 'الاستفسارات', 'bi-chat-dots'], ['lost', 'التائهون', 'bi-exclamation-triangle'], ['audit', 'السجل', 'bi-journal-text']];

function adminRender() {
  const box = $('adm');
  if (!box.dataset.ready) {
    box.dataset.ready = 1;
    box.innerHTML = `<ul class="nav nav-pills flex-nowrap gap-1 mb-3" id="admTabs" style="overflow-x:auto;padding-bottom:.25rem">${ADM_TABS.map(([k, l, i]) =>
      `<li class="nav-item"><button type="button" class="nav-link text-center" style="min-width:4.2rem" data-tab="${k}"><i class="bi ${i} d-block"></i><small>${l}</small></button></li>`).join('')}</ul><div id="admBody"></div>`;
    $('admTabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) admGo(b.dataset.tab); };
    $('admBody').onclick = admClick;
    $('admBody').onchange = admChange;
    $('admBody').oninput = admInput;
  }
  admGo(admTab);
}
async function admGo(tab) {
  admTab = tab;
  document.querySelectorAll('#admTabs [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('admBody').innerHTML = '<div class="text-center desc-text py-4">جارٍ التحميل...</div>';
  try { await ({ today: admToday, att: admAtt, count: admCount, ppl: admPpl, sched: admSched, rate: admRate, inq: admInq, lost: admLost, audit: admAudit })[tab](); }
  catch (e) { $('admBody').innerHTML = `<div class="text-center py-3"><div class="text-danger mb-2">تعذّر التحميل</div>${admRefresh(tab)}</div>`; }
}

/* ---------- لوحة اليوم + زمن الاستجابة ---------- */
async function admToday() {
  const r = await admPost('adm_today'), q = r.resp, pct = r.total ? Math.round(r.present / r.total * 100) : 0;
  const kpi = (v, l, cls = '') => `<div class="col-6"><div class="u-box text-center py-3 h-100 ${cls}"><div class="display-6 fw-bold gold">${v}</div><small>${l}</small></div></div>`;
  $('admBody').innerHTML = `${admRefresh('today')}
    <div class="row g-2 mb-3">
      ${kpi(pct + '%', `نسبة الحضور (${r.present}/${r.total})${r.label ? '<br>' + esc(r.label) : ''}`)}
      ${kpi(r.lostOpen, 'نداءات تائهين مفتوحة', r.lostOpen ? 'border-danger' : '')}
      ${kpi(q.inq.open, 'استفسارات مفتوحة')}
      ${kpi(q.inq.oldest ? fmtMin(q.inq.oldest.wait) : '—', 'أقدم استفسار بلا ردّ')}</div>
    ${q.inq.oldest ? `<div class="ev" style="flex-direction:column"><b class="text-light">${esc(q.inq.oldest.name)}</b><small>${esc(q.inq.oldest.message)}</small></div>` : ''}
    <div class="gold fw-bold mb-2">زمن الاستجابة</div>
    <div class="ev" style="display:block">
      <div class="d-flex justify-content-between flex-wrap"><span class="text-light">«أنا تائه»</span><span>متوسط ${fmtMin(q.lost.avg)} · أطول ${fmtMin(q.lost.max)}</span></div>
      ${q.lost.waiting ? `<small class="text-danger">${q.lost.waiting} نداء ينتظر، أقدمها منذ ${fmtMin(q.lost.oldestWait)}</small>` : ''}
      <div class="d-flex justify-content-between flex-wrap mt-2"><span class="text-light">الاستفسارات</span><span>متوسط ${fmtMin(q.inq.avg)} · أطول ${fmtMin(q.inq.max)}</span></div>
      <small>تم الرد على ${q.inq.answered} من ${q.inq.total}</small></div>
    <button type="button" class="btn btn-gold-solid w-100 mt-3" data-act="report"><i class="bi bi-file-earmark-pdf ms-1"></i>تقرير ختامي للرحلة (PDF)</button>`;
}

/* ---------- الحضور حسب الباص ---------- */
async function admAtt(label) {
  const r = await admPost('adm_att', { label: label ?? admLabel });
  admLabel = r.label; admData = r;
  const tot = r.buses.reduce((a, b) => a + b.total, 0), on = r.buses.reduce((a, b) => a + b.present.length, 0);
  $('admBody').innerHTML = `
    <div class="d-flex gap-2 mb-3">
      <select id="admLabel" class="form-select u-in">${r.labels.length ? r.labels.map(l => `<option ${l === r.label ? 'selected' : ''}>${esc(l)}</option>`).join('') : '<option>لا يوجد حضور مسجّل بعد</option>'}</select>
      <button type="button" class="btn btn-gold-outline" data-tab="att" aria-label="تحديث"><i class="bi bi-arrow-clockwise"></i></button></div>
    <div class="text-center mb-3"><div class="display-6 gold fw-bold">${on} / ${tot}</div><small>إجمالي الصاعدين</small></div>
    ${r.buses.map(b => {
      const p = b.present.length;
      return `<details class="ev" style="display:block"><summary class="d-flex justify-content-between align-items-center" style="cursor:pointer">
        <b class="text-light">${esc(busName(b.bus))}</b><span class="badge ${p === b.total ? 'bg-success' : 'bg-warning text-dark'}">${p} / ${b.total}</span></summary>
        <div class="progress my-2" style="height:6px"><div class="progress-bar ${p === b.total ? 'bg-success' : 'bg-warning'}" style="width:${b.total ? p / b.total * 100 : 0}%"></div></div>
        ${b.missing.length ? `<div class="text-danger small fw-bold mb-1">لم يصعدوا (${b.missing.length})</div>${b.missing.map(m => `
          <div class="d-flex justify-content-between align-items-center small py-1 border-bottom border-secondary"><span>${esc(m.name)} <span class="text-secondary">${esc(m.no)}</span></span>
          ${m.phone ? `<a href="${phoneHref(m.phone)}" class="gold"><i class="bi bi-telephone-fill"></i></a>` : ''}</div>`).join('')}` : '<div class="text-success small">صعد الجميع ✔</div>'}
        ${p ? `<div class="small mt-2" style="color:#d3d3c7"><b>صعدوا (${p}):</b> ${b.present.map(m => esc(m.name)).join('، ')}</div>` : ''}</details>`;
    }).join('')}
    <div class="d-grid gap-2 mt-3">
      <button type="button" class="btn btn-gold-solid" data-act="csv-one"><i class="bi bi-download ms-1"></i>تصدير هذا النشاط (CSV)</button>
      <button type="button" class="btn btn-gold-outline" data-act="csv-all"><i class="bi bi-download ms-1"></i>تصدير كل الحضور (CSV)</button></div>`;
}
function admCsv(lines, name) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const blob = new Blob(['\ufeff' + lines.map(l => l.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const attLines = rows => [['الوقت', 'رقم المعتمر', 'الاسم', 'النشاط/الباص', 'المسجِّل'], ...rows.map(r => [r.time, r.no, r.name, r.label, r.by])];

/* ---------- عدّاد التعداد السريع ---------- */
const cntKey = () => 'adm_cnt:' + cntCtx.label + ':' + cntCtx.bus;
const cntVal = () => +localStorage.getItem(cntKey()) || 0;
function cntSet(n) { localStorage.setItem(cntKey(), Math.max(0, n)); cntPaint(); navigator.vibrate?.(25); }
function cntPaint() {
  const b = cntCtx.buses.find(x => x.bus === cntCtx.bus), exp = b ? b.total : 0, sc = b ? b.present.length : 0, n = cntVal();
  $('cntN').textContent = n;
  $('cntBar').style.width = (exp ? Math.min(100, n / exp * 100) : 0) + '%';
  $('cntBar').className = 'progress-bar ' + (n === exp ? 'bg-success' : n > exp ? 'bg-danger' : 'bg-warning');
  $('cntInfo').innerHTML = `المتوقع: <b>${exp}</b> · المسجَّلون بالمسح: <b>${sc}</b>${exp ? ` · الفرق: <b class="${n === exp ? 'text-success' : 'text-warning'}">${n - exp > 0 ? '+' : ''}${n - exp}</b>` : ''}`;
}
async function admCount() {
  const r = await admPost('adm_att', { label: '' });
  if (!r.buses.length) { $('admBody').innerHTML = '<p class="desc-text">لا يوجد معتمرون في الشيت.</p>'; return; }
  cntCtx = { label: r.label, buses: r.buses, bus: cntCtx && r.buses.some(b => b.bus === cntCtx.bus) ? cntCtx.bus : r.buses[0].bus };
  $('admBody').innerHTML = `
    <div class="small mb-2" style="color:#d3d3c7">آخر نشاط/باص مسجَّل بالمسح: <b class="gold">${esc(r.label || '—')}</b></div>
    <select id="cntSel" class="form-select u-in mb-3">${r.buses.map(b => `<option value="${esc(b.bus)}"${b.bus === cntCtx.bus ? ' selected' : ''}>${esc(busName(b.bus))}</option>`).join('')}</select>
    <div class="text-center my-3"><div id="cntN" class="gold fw-bold" style="font-size:5rem;line-height:1">0</div></div>
    <div class="progress mb-2" style="height:8px"><div id="cntBar" class="progress-bar bg-warning" style="width:0"></div></div>
    <div id="cntInfo" class="text-center small mb-3"></div>
    <div class="d-flex gap-2 mb-2"><button type="button" class="btn btn-success btn-lg flex-grow-1" style="font-size:1.8rem" data-act="c-plus">+1</button>
      <button type="button" class="btn btn-outline-danger btn-lg" style="font-size:1.8rem;min-width:32%" data-act="c-minus">−1</button></div>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="c-save">حفظ العدّ في السجل</button>
      <button type="button" class="btn btn-outline-light" data-act="c-reset">تصفير</button></div>`;
  cntPaint();
}

/* ---------- إدارة المعتمرين ---------- */
const PFIELDS = [['Code', 'الرقم السري للدخول'], ['PilgrimNo', 'رقم المعتمر'], ['Name', 'الاسم'], ['Phone', 'الهاتف'], ['Bus_No', 'رقم الباص'], ['Bus_Title', 'عنوان الباص'],
  ['Supervisor_Name', 'اسم المشرف'], ['Supervisor_Phone', 'هاتف المشرف'], ['Makkah_Hotel', 'فندق مكة'], ['Makkah_Room', 'غرفة مكة'], ['Madinah_Hotel', 'فندق المدينة'], ['Madinah_Room', 'غرفة المدينة']];
async function admPpl() {
  $('admBody').innerHTML = `
    <div class="d-flex gap-2 mb-2"><input id="pQ" class="form-control u-in" placeholder="بحث بالاسم أو الرقم أو الهاتف أو الباص" autocomplete="off">
      <button type="button" class="btn btn-gold-solid" data-act="p-add" aria-label="إضافة"><i class="bi bi-plus-lg"></i></button></div>
    <div class="d-flex gap-2 flex-wrap mb-3">
      <button type="button" class="btn btn-sm btn-gold-outline" data-act="p-import"><i class="bi bi-file-earmark-excel ms-1"></i>استيراد من Excel</button>
      <button type="button" class="btn btn-sm btn-gold-outline" data-act="p-print"><i class="bi bi-printer ms-1"></i>طباعة بطاقات QR</button></div>
    <div id="pBox"></div><small id="pCount" class="d-block mb-2" style="color:#d3d3c7"></small><div id="pList"></div>`;
  await pplLoad('');
}
async function pplLoad(q) {
  const r = await admPost('adm_p_list', { q }); pplData = r;
  $('pCount').textContent = `${r.total} معتمر${!q && r.items.length < r.total ? ' — يُعرض أول 30، استخدم البحث' : ''}`;
  $('pList').innerHTML = r.items.map((p, i) => `<div class="ev" style="display:block"><div class="d-flex justify-content-between align-items-center"><b class="text-light">${esc(p.Name)}</b>
    <button type="button" class="btn btn-sm btn-gold-outline py-0" data-act="p-edit" data-i="${i}" aria-label="تعديل"><i class="bi bi-pencil"></i></button></div>
    <small>رقم ${esc(p.PilgrimNo)}${p.Bus_No ? ' · باص ' + esc(p.Bus_No) : ''}${p.Makkah_Room ? ' · مكة غرفة ' + esc(p.Makkah_Room) : ''}${p.Madinah_Room ? ' · المدينة غرفة ' + esc(p.Madinah_Room) : ''}</small></div>`).join('') || '<p class="desc-text">لا نتائج.</p>';
}
function pForm(p) {
  const hs = pplData.headers;
  $('pBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0"><div class="gold fw-bold mb-2">${p ? 'تعديل معتمر' : 'إضافة معتمر'}</div><div class="row g-2">
    ${PFIELDS.filter(([k]) => hs.includes(k)).map(([k, l]) => `<div class="col-6"><label class="small">${l}</label><input class="form-control u-in form-control-sm" data-k="${k}" value="${esc(p ? p[k] : '')}" ${p && k === 'PilgrimNo' ? 'readonly' : ''}></div>`).join('')}</div>
    <div class="d-flex gap-2 mt-3"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="p-save" data-new="${p ? 0 : 1}">حفظ</button>
      <button type="button" class="btn btn-outline-light" data-act="p-cancel">إلغاء</button></div></div>`;
  $('pBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function pImportBox() {
  $('pBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0"><div class="gold fw-bold mb-2">استيراد من Excel</div>
    <p class="small" style="color:#d3d3c7">يجب أن تطابق عناوين الأعمدة عناوين ورقة Pilgrims (مثل Code و PilgrimNo و Name و Bus_No). من يطابق رقمه يُحدَّث، والجديد يُضاف.</p>
    <input type="file" id="pFile" accept=".xlsx,.xls,.csv" class="form-control u-in mb-2"><div id="pPrev" class="small mb-2"></div>
    <div class="d-flex gap-2"><button type="button" class="btn btn-sm btn-gold-outline" data-act="p-tpl">تنزيل قالب (CSV)</button><button type="button" class="btn btn-sm btn-outline-light" data-act="p-cancel">إغلاق</button></div></div>`;
}
async function pParse(file) {
  $('pPrev').textContent = 'جارٍ قراءة الملف...'; impRows = null;
  try {
    await loadLib(XLSX_URL, () => window.XLSX);
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
    impRows = rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim(), v]))).filter(r => Object.values(r).some(v => String(v).trim()));
    const keys = impRows[0] ? Object.keys(impRows[0]) : [], ok = keys.filter(k => pplData.headers.includes(k)), bad = keys.filter(k => !pplData.headers.includes(k));
    $('pPrev').innerHTML = !impRows.length ? '<span class="text-danger">الملف فارغ</span>' : !ok.includes('PilgrimNo') ? '<span class="text-danger">عمود PilgrimNo غير موجود في الملف</span>'
      : `قُرئ <b>${impRows.length}</b> صفًا · أعمدة معتمدة: ${ok.map(esc).join('، ')}${bad.length ? `<br><span class="text-warning">ستُتجاهل: ${bad.map(esc).join('، ')}</span>` : ''}
         <button type="button" class="btn btn-gold-solid w-100 mt-2" data-act="p-do-import">تأكيد الاستيراد</button>`;
  } catch { $('pPrev').innerHTML = '<span class="text-danger">تعذّرت قراءة الملف</span>'; }
}
async function pDoImport() {
  let add = 0, upd = 0; const errs = [];
  for (let i = 0; i < impRows.length; i += 100) {
    const r = await admPost('adm_p_import', { rows: impRows.slice(i, i + 100) });
    add += r.added; upd += r.updated; errs.push(...r.errors);
    $('pPrev').textContent = `جارٍ الاستيراد ${Math.min(i + 100, impRows.length)} / ${impRows.length}`;
  }
  impRows = null;
  $('pPrev').innerHTML = `<div class="text-success">تم: ${add} جديد، ${upd} محدَّث</div>${errs.length ? `<div class="text-warning mt-1">تنبيهات (${errs.length}):<br>${errs.slice(0, 15).map(esc).join('<br>')}</div>` : ''}`;
  pplLoad($('pQ').value.trim());
}
function pPrintBox() {
  $('pBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0"><div class="gold fw-bold mb-2">طباعة بطاقات QR (ملف PDF)</div>
    <select id="pBus" class="form-select u-in mb-2"><option value="*">كل المعتمرين</option>${pplData.buses.map(b => `<option value="${esc(b)}">${esc(busName(b))}</option>`).join('')}</select>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="p-do-print">إنشاء PDF</button><button type="button" class="btn btn-outline-light" data-act="p-cancel">إغلاق</button></div></div>`;
}

/* ---------- تعديل الجدول من الصفحة ---------- */
const isActive = e => String(e.Status).trim().toLowerCase() === 'active';
async function admSched() { schedData = (await admPost('adm_s_list')).items; paintSched(); }
function paintSched() {
  const now = Date.now();
  const list = schedData.filter(e => schedAll || (isActive(e) && endOf(e, when(e.Date_Time)) > now));
  $('admBody').innerHTML = `<div class="d-flex gap-2 mb-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="s-add"><i class="bi bi-plus-lg ms-1"></i>إضافة نشاط</button>${admRefresh('sched').replace('mb-3', '')}</div>
    <div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="sAll" ${schedAll ? 'checked' : ''}><label class="form-check-label small" for="sAll">إظهار المنتهي والملغي</label></div>
    <div id="sBox"></div>
    ${list.map(e => `<div class="ev" style="display:block" data-id="${esc(e.Event_ID)}">
      <div class="d-flex justify-content-between"><b class="text-light">${esc(e.Title)}</b><span class="badge ${isActive(e) ? 'bg-success' : 'bg-secondary'}">${isActive(e) ? 'فعّال' : 'ملغي'}</span></div>
      <small class="d-block">${esc(e.Category)} · ${esc(e.Date_Time)}${e.End_Time ? ' → ' + esc(e.End_Time) : ''}</small>
      <div class="d-flex flex-wrap gap-1 mt-2">
        ${[15, 30, 60].map(m => `<button type="button" class="btn btn-sm btn-gold-outline py-0" data-act="s-shift" data-min="${m}">+${m} د</button>`).join('')}
        <button type="button" class="btn btn-sm btn-outline-light py-0" data-act="s-shift" data-min="-15">−15 د</button>
        <button type="button" class="btn btn-sm btn-gold-solid py-0" data-act="s-edit">تعديل</button>
        <button type="button" class="btn btn-sm ${isActive(e) ? 'btn-outline-danger' : 'btn-outline-success'} py-0" data-act="s-toggle" data-on="${isActive(e) ? 0 : 1}">${isActive(e) ? 'إلغاء' : 'تفعيل'}</button></div></div>`).join('') || '<p class="desc-text">لا أنشطة.</p>'}`;
}
const toLocal = (s, base) => {
  s = String(s || '').trim();
  if (/^\d{1,2}:\d{2}$/.test(s) && base) return base.slice(0, 10) + 'T' + s.padStart(5, '0');
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}T${m[4].padStart(2, '0')}:${m[5]}` : '';
};
function sForm(e) {
  const st = e ? toLocal(e.Date_Time) : '', cats = [...new Set(schedData.map(x => x.Category).filter(Boolean))];
  $('sBox').innerHTML = `<div class="u-box mb-3" style="border-color:#edcea0" data-id="${esc(e?.Event_ID || '')}"><div class="gold fw-bold mb-2">${e ? 'تعديل نشاط' : 'إضافة نشاط'}</div>
    <input class="form-control u-in mb-2" data-k="Title" placeholder="عنوان النشاط" value="${esc(e?.Title)}">
    <input class="form-control u-in mb-2" data-k="Category" list="catList" placeholder="التصنيف (تهجد، مزار، تحرك…)" value="${esc(e?.Category)}"><datalist id="catList">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    <label class="small">الموعد</label><input type="datetime-local" class="form-control u-in mb-2" data-k="Date_Time" value="${st}">
    <label class="small">الانتهاء (اختياري)</label><input type="datetime-local" class="form-control u-in mb-2" data-k="End_Time" value="${e ? toLocal(e.End_Time, st) : ''}">
    <input class="form-control u-in mb-2" data-k="Location" placeholder="المكان" value="${esc(e?.Location)}">
    <textarea class="form-control u-in mb-2" data-k="Notes" rows="2" placeholder="ملاحظات">${esc(e?.Notes)}</textarea>
    <select class="form-select u-in mb-3" data-k="Status"><option value="Active"${!e || isActive(e) ? ' selected' : ''}>فعّال</option><option value="Inactive"${e && !isActive(e) ? ' selected' : ''}>ملغي</option></select>
    <div class="d-flex gap-2"><button type="button" class="btn btn-gold-solid flex-grow-1" data-act="s-save">حفظ</button><button type="button" class="btn btn-outline-light" data-act="s-cancel">إلغاء</button></div></div>`;
  $('sBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- التقييمات ---------- */
async function admRate() {
  const r = await admPost('adm_rate'), full = Math.round(r.avg), max = Math.max(1, ...r.dist);
  $('admBody').innerHTML = `${admRefresh('rate')}
    <div class="text-center mb-3"><div class="display-4 gold fw-bold">${r.avg.toFixed(1)}</div>
      <div class="text-warning fs-4">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</div><small>${r.count} تقييم</small></div>
    ${[5, 4, 3, 2, 1].map(n => `<div class="d-flex align-items-center gap-2 mb-1"><small style="width:1.6rem">${n}★</small>
      <div class="progress flex-grow-1" style="height:8px"><div class="progress-bar bg-warning" style="width:${r.dist[n - 1] / max * 100}%"></div></div><small style="width:2rem">${r.dist[n - 1]}</small></div>`).join('')}
    <div class="gold fw-bold mt-3 mb-2">آخر التقييمات</div>
    ${r.latest.map(x => `<div class="ev" style="flex-direction:column;gap:.2rem"><div class="d-flex justify-content-between"><b class="text-light">${esc(x.name)}</b><span class="text-warning">${'★'.repeat(x.stars)}</span></div>
      <small>${esc(x.time)}</small>${x.message ? `<div class="text-light">${esc(x.message)}</div>` : ''}</div>`).join('') || '<p class="desc-text">لا توجد تقييمات بعد.</p>'}`;
}

/* ---------- الاستفسارات وردّ الحملة ---------- */
async function admInq() {
  const r = await admPost('adm_inq');
  $('admBody').innerHTML = admRefresh('inq') + (r.items.map(x => `
    <div class="ev" style="display:block" data-id="${esc(x.id)}">
      <div class="d-flex justify-content-between mb-1"><b class="text-light">${esc(x.name)}</b><span class="badge ${STATUS_CLS[x.status] || 'bg-secondary'}">${esc(x.status)}</span></div>
      <small class="d-block">${esc(x.time)} · رقم ${esc(x.no)}${x.phone ? ` · <a href="${phoneHref(x.phone)}" class="gold">${esc(x.phone)}</a>` : ''}</small>
      <div class="text-light my-2">${esc(x.message)}</div>
      <textarea class="form-control u-in mb-2" rows="2" placeholder="ردّ الحملة (يظهر للمعتمر)">${esc(x.reply)}</textarea>
      <div class="d-flex gap-2"><button type="button" class="btn btn-sm btn-gold-solid flex-grow-1" data-act="inq-reply">إرسال الرد</button>
        <button type="button" class="btn btn-sm btn-gold-outline" data-act="inq-wip">قيد المعالجة</button></div></div>`).join('') || '<p class="desc-text">لا توجد استفسارات.</p>');
}

/* ---------- التائهون ---------- */
async function admLost() {
  const r = await admPost('adm_lost');
  $('admBody').innerHTML = admRefresh('lost') + (r.items.map(x => `
    <div class="ev" style="display:block;border-inline-start-color:#dc3545" data-id="${esc(x.id)}">
      <div class="d-flex justify-content-between mb-1"><b class="text-light">${esc(x.name)}</b><span class="badge ${x.status === 'open' ? 'bg-danger' : 'bg-warning text-dark'}">${x.status === 'open' ? 'جديد' : 'تم الرد'}</span></div>
      <small class="d-block">${esc(x.time)} · رقم ${esc(x.no)}</small>
      <div class="d-flex gap-2 my-2 align-items-center">
        ${x.phone ? `<a class="btn btn-sm btn-gold-outline" href="${phoneHref(x.phone)}"><i class="bi bi-telephone-fill ms-1"></i>اتصال</a>` : ''}
        ${x.lat !== '' && x.lng !== '' ? `<a class="btn btn-sm btn-gold-outline" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${encodeURIComponent(x.lat + ',' + x.lng)}"><i class="bi bi-geo-alt-fill ms-1"></i>الموقع</a>` : '<small class="text-warning">بدون موقع</small>'}</div>
      <input class="form-control u-in mb-2" value="${esc(x.reply || 'نحن في طريقنا إليك')}">
      <div class="d-flex gap-2"><button type="button" class="btn btn-sm btn-danger flex-grow-1" data-act="lost-reply">إرسال الرد للمعتمر</button>
        <button type="button" class="btn btn-sm btn-outline-light" data-act="lost-close">إغلاق</button></div></div>`).join('') || '<p class="desc-text">لا توجد نداءات مفتوحة.</p>');
}

/* ---------- سجلّ التدقيق ---------- */
async function admAudit() {
  auditData = (await admPost('adm_audit')).items;
  $('admBody').innerHTML = `<div class="d-flex gap-2 mb-3"><input id="aQ" class="form-control u-in" placeholder="بحث في السجل (اسم، إجراء، تفصيل)" autocomplete="off">${admRefresh('audit').replace('mb-3', '')}</div><div id="aList"></div>`;
  paintAudit('');
}
function paintAudit(q) {
  q = q.trim().toLowerCase();
  const l = auditData.filter(x => !q || [x.admin, x.action, x.details, x.time].some(v => String(v).toLowerCase().includes(q)));
  $('aList').innerHTML = l.map(x => `<div class="ev" style="flex-direction:column;gap:.2rem"><div class="d-flex justify-content-between"><b class="text-light">${esc(x.admin)}</b><span class="badge bg-secondary">${esc(x.action)}</span></div>
    <small>${esc(x.time)}</small><div class="text-light small">${esc(x.details)}</div></div>`).join('') || '<p class="desc-text">لا سجلات.</p>';
}

/* ---------- ملفات PDF (تُرسم على Canvas ليظهر العربي سليمًا) ---------- */
async function admPrintCards(list) {
  await loadLib(JSPDF, () => window.jspdf); await admFonts();
  const W = 794, H = 1123, S = 2, mx = 30, my = 30, cw = (W - 2 * mx) / 2, ch = (H - 2 * my) / 4, per = 8, FF = 'Tajawal, sans-serif';
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true }), pages = Math.ceil(list.length / per);
  for (let p = 0; p < pages; p++) {
    const c = document.createElement('canvas'); c.width = W * S; c.height = H * S;
    const x = c.getContext('2d'); x.scale(S, S); x.direction = 'rtl'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    const fit = (s, w) => { while (s.length > 1 && x.measureText(s).width > w) s = s.slice(0, -1); return s; };
    for (let i = 0; i < per; i++) {
      const it = list[p * per + i]; if (!it) break;
      const x0 = W - mx - (i % 2 + 1) * cw, y0 = my + Math.floor(i / 2) * ch;
      x.setLineDash([6, 4]); x.strokeStyle = '#999'; x.lineWidth = 1; x.strokeRect(x0 + 6, y0 + 6, cw - 12, ch - 12); x.setLineDash([]);
      const q = qrcode(0, 'M'); q.addData('UMRAH:' + it.PilgrimNo); q.make();
      const n = q.getModuleCount(), px = Math.max(2, Math.floor(150 / n)), sz = px * n, qx = x0 + 24, qy = y0 + (ch - sz) / 2 - 8;
      x.fillStyle = '#fff'; x.fillRect(qx - 6, qy - 6, sz + 12, sz + 12); x.fillStyle = '#000';
      for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(qx + k * px, qy + r * px, px, px);
      x.textAlign = 'center'; x.font = `400 11px ${FF}`; x.fillStyle = '#555'; x.fillText('امسح عند صعود الباص', qx + sz / 2, qy + sz + 18);
      const rx = x0 + cw - 24, tw = cw - sz - 80;
      x.textAlign = 'right'; x.fillStyle = '#8a6d2f'; x.font = `700 14px ${FF}`; x.fillText('حملة الإشراق', rx, y0 + 38);
      x.fillStyle = '#21211d'; x.font = `700 20px ${FF}`; x.fillText(fit(String(it.Name), tw), rx, y0 + 80);
      x.font = `400 16px ${FF}`; x.fillStyle = '#444'; x.fillText('رقم المعتمر: ' + it.PilgrimNo, rx, y0 + 115);
      if (it.Bus_No) x.fillText('باص: ' + it.Bus_No, rx, y0 + 145);
    }
    if (p) doc.addPage();
    doc.addImage(c.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, 210, 297);
    toast(`جارٍ إنشاء الملف ${p + 1} / ${pages}`, 2500); await new Promise(r => setTimeout(r));
  }
  doc.save('qr-cards.pdf');
}

async function admReportPdf() {
  const r = await admPost('adm_report');
  await loadLib(JSPDF, () => window.jspdf); await admFonts();
  const W = 794, H = 1123, S = 2, M = 50, FF = 'Tajawal, sans-serif', pages = [];
  let x, y;
  const page = () => {
    const c = document.createElement('canvas'); c.width = W * S; c.height = H * S;
    x = c.getContext('2d'); x.scale(S, S); x.direction = 'rtl'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#21211d'; x.fillRect(0, 0, W, 14); x.fillStyle = '#edcea0'; x.fillRect(0, 14, W, 4);
    pages.push({ c, x }); y = 50;
  };
  const need = h => { if (y + h > H - 60) page(); };
  const lines = (s, font, w) => { x.font = font; const out = []; let cur = ''; for (const wd of String(s).split(/\s+/).filter(Boolean)) { const t = cur ? cur + ' ' + wd : wd; if (cur && x.measureText(t).width > w) { out.push(cur); cur = wd; } else cur = t; } if (cur) out.push(cur); return out; };
  const text = (s, size, weight, color, align = 'right') => {
    const font = `${weight} ${size}px ${FF}`, lh = size * 1.7;
    for (const l of lines(s, font, W - 2 * M)) { need(lh); y += lh / 2; x.font = font; x.fillStyle = color; x.textAlign = align; x.fillText(l, align === 'center' ? W / 2 : W - M, y); y += lh / 2; }
  };
  const h2 = s => { need(60); y += 16; x.fillStyle = '#edcea0'; x.fillRect(W - M - 6, y - 2, 6, 28); x.font = `700 22px ${FF}`; x.fillStyle = '#21211d'; x.textAlign = 'right'; x.fillText(s, W - M - 18, y + 12); y += 38; };
  const kv = (k, v) => { need(30); y += 15; x.font = `400 18px ${FF}`; x.fillStyle = '#444'; x.textAlign = 'right'; x.fillText(k, W - M, y); x.font = `700 18px ${FF}`; x.fillStyle = '#21211d'; x.textAlign = 'left'; x.fillText(String(v), M, y); y += 15; };
  const bar = (label, val, max, color = '#edcea0', right = '') => {
    need(30); y += 15; x.font = `400 16px ${FF}`; x.fillStyle = '#21211d'; x.textAlign = 'right';
    let t = String(label); while (t.length > 1 && x.measureText(t).width > 300) t = t.slice(0, -1);
    x.fillText(t, W - M, y); const bw = 250, bx = M + 90;
    x.fillStyle = '#eee'; x.fillRect(bx, y - 6, bw, 12); x.fillStyle = color; x.fillRect(bx, y - 6, max ? bw * Math.min(1, val / max) : 0, 12);
    x.fillStyle = '#21211d'; x.textAlign = 'left'; x.fillText(right || String(val), M, y); y += 15;
  };
  const min = m => fmtMin(m);

  page();
  text('التقرير الختامي للرحلة', 34, 700, '#21211d', 'center'); text('حملة الإشراق', 20, 400, '#8a6d2f', 'center');
  text('تاريخ إعداد التقرير: ' + r.generated, 16, 400, '#666', 'center');

  h2('ملخّص عام');
  kv('عدد المعتمرين', r.pilgrims); kv('متوسط التقييم', r.ratings.count ? r.ratings.avg.toFixed(1) + ' / 5 (' + r.ratings.count + ' تقييم)' : '—');
  kv('استفسارات (مُجاب / الكل)', `${r.resp.inq.answered} / ${r.resp.inq.total}`); kv('نداءات «أنا تائه»', r.resp.lost.total);

  h2('الحضور حسب النشاط / الباص');
  if (r.labels.length) r.labels.forEach(l => bar(l.label, l.present, l.total, l.pct >= 90 ? '#2e9b5e' : '#edcea0', `${l.present} / ${l.total} (${l.pct}%)`)); else text('لا يوجد حضور مسجَّل.', 16, 400, '#666');

  h2('التقييمات');
  const mx = Math.max(1, ...r.ratings.dist);
  [5, 4, 3, 2, 1].forEach(n => bar(n + ' نجوم', r.ratings.dist[n - 1], mx, '#e0a526'));

  h2('زمن الاستجابة');
  kv('«أنا تائه» — متوسط / أطول', `${min(r.resp.lost.avg)} / ${min(r.resp.lost.max)}`);
  kv('الاستفسارات — متوسط / أطول', `${min(r.resp.inq.avg)} / ${min(r.resp.inq.max)}`);
  kv('استفسارات بلا ردّ حاليًا', r.resp.inq.open);

  h2('ملخّص الشكاوى حسب الموضوع (تصنيف تلقائي بالكلمات)');
  const cm = Math.max(1, ...r.complaints.map(c => c.n));
  if (r.complaints.length) r.complaints.forEach(c => bar(c.cat, c.n, cm, '#c0504d')); else text('لا شكاوى مصنَّفة.', 16, 400, '#666');

  h2('ملاحظات المعتمرين المنخفضة (3 نجوم فأقل)');
  if (r.low.length) r.low.forEach(m => text(`${'★'.repeat(m.stars)}  ${m.name}: ${m.message}`, 15, 400, '#333')); else text('لا توجد.', 16, 400, '#666');
  h2('أبرز الإشادات');
  if (r.high.length) r.high.forEach(m => text(`${'★'.repeat(m.stars)}  ${m.name}: ${m.message}`, 15, 400, '#333')); else text('لا توجد.', 16, 400, '#666');

  pages.forEach((p, i) => { p.x.font = `400 14px ${FF}`; p.x.fillStyle = '#888'; p.x.textAlign = 'center'; p.x.fillText(`صفحة ${i + 1} من ${pages.length}`, W / 2, H - 30); });
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pages.forEach((p, i) => { if (i) doc.addPage(); doc.addImage(p.c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297); });
  doc.save('trip-report.pdf');
}

/* ---------- الأحداث ---------- */
let admTimer = 0;
function admInput(e) {
  if (e.target.id === 'pQ') { clearTimeout(admTimer); admTimer = setTimeout(() => pplLoad(e.target.value.trim()).catch(() => {}), 350); }
  else if (e.target.id === 'aQ') paintAudit(e.target.value);
}
function admChange(e) {
  const t = e.target;
  if (t.id === 'admLabel') admAtt(t.value).catch(() => toast('تعذّر التحميل'));
  else if (t.id === 'cntSel') { cntCtx.bus = t.value; cntPaint(); }
  else if (t.id === 'sAll') { schedAll = t.checked; paintSched(); }
  else if (t.id === 'pFile' && t.files[0]) pParse(t.files[0]);
}
const collect = box => Object.fromEntries([...box.querySelectorAll('[data-k]')].map(i => [i.dataset.k, i.value.trim()]));

async function admClick(e) {
  const t = e.target.closest('[data-tab]'); if (t) return admGo(t.dataset.tab);
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, card = b.closest('[data-id]'), id = card?.dataset.id;
  // العدّاد سريع: بلا تعطيل للزر
  if (act === 'c-plus') return cntSet(cntVal() + 1);
  if (act === 'c-minus') return cntSet(cntVal() - 1);
  if (act === 'c-reset') { if (await askConfirm('تصفير العدّاد؟', 'سيعود العدّ إلى صفر لهذا الباص.', 'نعم، صفّر')) cntSet(0); return; }
  if (act === 'p-edit') return pForm(pplData.items[+b.dataset.i]);
  if (act === 'p-add') return pForm(null);
  if (act === 'p-import') return pImportBox();
  if (act === 'p-print') return pPrintBox();
  if (act === 'p-cancel') { $('pBox').innerHTML = ''; return; }
  if (act === 's-add') return sForm(null);
  if (act === 's-edit') return sForm(schedData.find(x => x.Event_ID === id));
  if (act === 's-cancel') { $('sBox').innerHTML = ''; return; }
  if (act === 'p-tpl') return admCsv([pplData.headers], 'pilgrims-template.csv');
  b.disabled = true;
  try {
    if (act === 'csv-one') admCsv(attLines(admData.rows), 'attendance.csv');
    else if (act === 'csv-all') admCsv(attLines((await admPost('adm_att', { label: '*' })).rows), 'attendance-all.csv');
    else if (act === 'report') { toast('جارٍ إعداد التقرير...', 4000); await admReportPdf(); }
    else if (act === 'c-save') {
      const bus = cntCtx.buses.find(x => x.bus === cntCtx.bus);
      await admPost('adm_count_save', { label: cntCtx.label, bus: cntCtx.bus, count: cntVal(), expected: bus.total, scanned: bus.present.length }); toast('تم حفظ العدّ');
    }
    else if (act === 'p-save') {
      await admPost('adm_p_save', { isNew: b.dataset.new === '1', data: collect($('pBox')) });
      toast('تم الحفظ'); $('pBox').innerHTML = ''; await pplLoad($('pQ').value.trim());
    }
    else if (act === 'p-do-import') await pDoImport();
    else if (act === 'p-do-print') {
      const bus = $('pBus').value, all = (await admPost('adm_p_list', { all: true })).items;
      const list = all.filter(p => bus === '*' || String(p.Bus_No).trim() === bus);
      if (!list.length) toast('لا معتمرين'); else await admPrintCards(list);
    }
    else if (act === 's-save') {
      const box = card, data = collect(box);
      await admPost('adm_s_save', { id: id || '', data }); toast(id ? 'تم التعديل — سيصل التنبيه للمعتمرين' : 'تمت الإضافة — سيصل التنبيه للمعتمرين'); await admSched();
    }
    else if (act === 's-shift') {
      const m = +b.dataset.min; await admPost('adm_s_shift', { id, min: m }); toast((m > 0 ? 'تم التأجيل ' : 'تم التقديم ') + Math.abs(m) + ' دقيقة'); await admSched();
    }
    else if (act === 's-toggle') {
      const on = b.dataset.on === '1';
      if (!on && !await askConfirm('إلغاء النشاط؟', 'سيختفي من برنامج المعتمرين.', 'نعم، إلغاء')) return;
      await admPost('adm_s_status', { id, active: on }); toast(on ? 'تم التفعيل' : 'تم الإلغاء'); await admSched();
    }
    else if (act === 'inq-reply' || act === 'inq-wip') {
      const reply = card.querySelector('textarea').value.trim();
      if (act === 'inq-reply' && !reply) { toast('اكتب الرد أولًا'); return; }
      await admPost('adm_inq_set', { id, reply: act === 'inq-reply' ? reply : '', status: 'قيد المعالجة' });
      toast(act === 'inq-reply' ? 'وصل الرد للمعتمر' : 'تم التحديث'); await admInq();
    }
    else if (act === 'lost-reply' || act === 'lost-close') {
      await admPost('adm_lost_reply', { id, reply: card.querySelector('input').value.trim(), close: act === 'lost-close' });
      toast(act === 'lost-reply' ? 'وصل الرد للمعتمر' : 'تم الإغلاق'); await admLost();
    }
  } catch (err) { toast(err && err.message ? err.message : 'تعذّر تنفيذ الطلب', 5000); }
  finally { b.disabled = false; }
}

// إن كان المستخدم مشرفًا من جلسة محفوظة، فقد رُسمت الصفحة قبل تحميل هذا الملف
if (me && role === 'admin') adminRender();
