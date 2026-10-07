// لوحة المشرف الإداري — تعتمد على متغيرات umrah.js ($, esc, post, code, role, me, toast, phoneHref, STATUS_CLS)
let admTab = 'att', admLabel = '', admData = null;

const admPost = (action, extra = {}) => post({ action, code, ...extra }).then(r => { if (!r.ok) throw 0; return r; });
const admRefresh = tab => `<button type="button" class="btn btn-sm btn-gold-outline mb-3" data-tab="${tab}"><i class="bi bi-arrow-clockwise ms-1"></i>تحديث</button>`;

function adminRender() {
  const box = $('adm');
  if (!box.dataset.ready) {
    box.dataset.ready = 1;
    box.innerHTML = `<ul class="nav nav-pills nav-fill gap-1 mb-3" id="admTabs">${[
      ['att', 'الحضور', 'bi-bus-front'], ['rate', 'التقييمات', 'bi-star'], ['inq', 'الاستفسارات', 'bi-chat-dots'], ['lost', 'التائهون', 'bi-exclamation-triangle']
    ].map(([k, l, i]) => `<li class="nav-item"><button type="button" class="nav-link w-100" data-tab="${k}"><i class="bi ${i} d-block"></i><small>${l}</small></button></li>`).join('')}</ul><div id="admBody"></div>`;
    $('admTabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) admGo(b.dataset.tab); };
    $('admBody').onclick = admClick;
  }
  admGo(admTab);
}

async function admGo(tab) {
  admTab = tab;
  document.querySelectorAll('#admTabs [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('admBody').innerHTML = '<div class="text-center desc-text py-4">جارٍ التحميل...</div>';
  try { await ({ att: admAtt, rate: admRate, inq: admInq, lost: admLost })[tab](); }
  catch { $('admBody').innerHTML = `<div class="text-center py-3"><div class="text-danger mb-2">تعذّر التحميل</div>${admRefresh(tab)}</div>`; }
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
      const p = b.present.length, name = b.bus === 'بدون باص' ? b.bus : 'باص ' + b.bus;
      return `<details class="ev" style="display:block"><summary class="d-flex justify-content-between align-items-center" style="cursor:pointer">
        <b class="text-light">${esc(name)}</b><span class="badge ${p === b.total ? 'bg-success' : 'bg-warning text-dark'}">${p} / ${b.total}</span></summary>
        <div class="progress my-2" style="height:6px"><div class="progress-bar ${p === b.total ? 'bg-success' : 'bg-warning'}" style="width:${b.total ? p / b.total * 100 : 0}%"></div></div>
        ${b.missing.length ? `<div class="text-danger small fw-bold mb-1">لم يصعدوا (${b.missing.length})</div>${b.missing.map(m => `
          <div class="d-flex justify-content-between align-items-center small py-1 border-bottom border-secondary"><span>${esc(m.name)} <span class="text-secondary">${esc(m.no)}</span></span>
          ${m.phone ? `<a href="${phoneHref(m.phone)}" class="gold"><i class="bi bi-telephone-fill"></i></a>` : ''}</div>`).join('')}` : '<div class="text-success small">صعد الجميع ✔</div>'}
        ${p ? `<div class="small mt-2" style="color:#d3d3c7"><b>صعدوا (${p}):</b> ${b.present.map(m => esc(m.name)).join('، ')}</div>` : ''}</details>`;
    }).join('')}
    <div class="d-grid gap-2 mt-3">
      <button type="button" class="btn btn-gold-solid" data-act="csv-one"><i class="bi bi-download ms-1"></i>تصدير هذا النشاط (CSV)</button>
      <button type="button" class="btn btn-gold-outline" data-act="csv-all"><i class="bi bi-download ms-1"></i>تصدير كل الحضور (CSV)</button></div>`;
  $('admLabel').onchange = () => admAtt($('admLabel').value);
}
function admCsv(rows, name) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const lines = [['الوقت', 'رقم المعتمر', 'الاسم', 'النشاط/الباص', 'المسجِّل'], ...rows.map(r => [r.time, r.no, r.name, r.label, r.by])];
  const blob = new Blob(['\ufeff' + lines.map(l => l.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
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

/* ---------- الأزرار ---------- */
async function admClick(e) {
  const t = e.target.closest('[data-tab]'); if (t) return admGo(t.dataset.tab);
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, card = b.closest('[data-id]'), id = card?.dataset.id;
  b.disabled = true;
  try {
    if (act === 'csv-one') admCsv(admData.rows, 'attendance.csv');
    else if (act === 'csv-all') admCsv((await admPost('adm_att', { label: '*' })).rows, 'attendance-all.csv');
    else if (act === 'inq-reply' || act === 'inq-wip') {
      const reply = card.querySelector('textarea').value.trim();
      if (act === 'inq-reply' && !reply) { toast('اكتب الرد أولًا'); return; }
      await admPost('adm_inq_set', { id, reply: act === 'inq-reply' ? reply : '', status: 'قيد المعالجة' });
      toast(act === 'inq-reply' ? 'وصل الرد للمعتمر' : 'تم التحديث'); await admInq();
    } else if (act === 'lost-reply' || act === 'lost-close') {
      await admPost('adm_lost_reply', { id, reply: card.querySelector('input').value.trim(), close: act === 'lost-close' });
      toast(act === 'lost-reply' ? 'وصل الرد للمعتمر' : 'تم الإغلاق'); await admLost();
    }
  } catch { toast('تعذّر تنفيذ الطلب'); }
  finally { b.disabled = false; }
}

// إن كان المستخدم مشرفًا من جلسة محفوظة، فقد رُسمت الصفحة قبل تحميل هذا الملف
if (me && role === 'admin') adminRender();
