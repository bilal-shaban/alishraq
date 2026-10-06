// ضع هنا رابط تطبيق الويب (Apps Script) بعد النشر
const API = 'https://script.google.com/macros/s/AKfycbxBSrv8Rwlre9Vy3LQguKKwsOfpFSKYPpKd5HYlyoSJwijtF6cyGFm2nGnbva7bcceKLg/exec';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast = t => { const e = $('toast'); e.textContent = t; e.classList.remove('d-none'); setTimeout(() => e.classList.add('d-none'), 3000); };
const post = body => fetch(API, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json()); // text/plain: بلا CORS preflight

let me = JSON.parse(localStorage.getItem('umrah_me') || 'null');
let events = [];

/* ---------- الجدول والعداد ---------- */
const ICONS = [['تهجد','bi-moon-stars'],['عمرة','bi-stars'],['مزار','bi-geo-alt'],['جدة','bi-water'],['تحرك','bi-bus-front'],['وجبة','bi-cup-hot']];
const icon = c => (ICONS.find(([k]) => (c || '').includes(k)) || [0, 'bi-calendar-event'])[1];
const when = s => new Date(String(s).trim().replace(' ', 'T') + ':00+03:00'); // توقيت السعودية

async function loadSchedule() {
  try {
    const d = await (await fetch(API + '?action=schedule')).json();
    if (d.banner) { $('banner').textContent = d.banner; $('banner').classList.remove('d-none'); }
    events = (d.events || []).map(e => ({ ...e, t: when(e.Date_Time) })).sort((a, b) => a.t - b.t);
    $('events').innerHTML = events.length ? events.map(e => `
      <div class="ev"><div class="ic"><i class="bi ${icon(e.Category)}"></i></div>
        <div class="flex-grow-1"><div class="fw-bold text-light">${esc(e.Title)}</div>
          <small class="gold">${esc(e.Category)}</small>
          <div><small><i class="bi bi-clock ms-1"></i>${e.t.toLocaleString('ar-SA', { weekday:'long', day:'numeric', month:'long', hour:'numeric', minute:'2-digit', timeZone:'Asia/Riyadh' })}</small></div>
          ${e.Location ? `<div><small><i class="bi bi-pin-map ms-1"></i>${esc(e.Location)}</small></div>` : ''}
          ${e.Notes ? `<div class="note">${esc(e.Notes)}</div>` : ''}</div></div>`).join('')
      : '<p class="desc-text">لا توجد أنشطة معلنة حاليًا.</p>';
  } catch { $('events').innerHTML = '<p class="text-danger">تعذّر تحميل البرنامج، تحقق من الاتصال.</p>'; }
  tick();
}
function tick() {
  const n = events.find(e => e.t > Date.now());
  $('nextTitle').textContent = n ? n.Title : 'لا يوجد نشاط قادم';
  let s = n ? Math.floor((n.t - Date.now()) / 1000) : 0;
  const p = x => String(x).padStart(2, '0');
  $('cdD').textContent = p(Math.floor(s / 86400)); $('cdH').textContent = p(Math.floor(s % 86400 / 3600));
  $('cdM').textContent = p(Math.floor(s % 3600 / 60)); $('cdS').textContent = p(s % 60);
}
setInterval(tick, 1000);

/* ---------- بطاقة المعتمر ---------- */
function renderMe() {
  fillWho();
  if (!me) { $('ticket').innerHTML = ''; $('loginForm').classList.remove('d-none'); return; }
  $('loginForm').classList.add('d-none');
  const city = (h, r, l) => `<p><b>${h[0]}</b>${esc(h[1])} — غرفة ${esc(r)}</p>${l ? `<p class="small">${/^https?:/.test(l) ? `<a href="${esc(l)}" target="_blank" rel="noopener" class="text-dark fw-bold"><i class="bi bi-map ms-1"></i>افتح الموقع على الخريطة</a>` : esc(l)}</p>` : ''}`;
  $('ticket').innerHTML = `<div class="ticket mt-2">
    <div class="head d-flex justify-content-between align-items-center"><div><small>أهلًا بك</small><div class="h5 fw-bold mb-0">${esc(me.Name)}</div></div>
      <div class="text-center"><small>رقم المعتمر</small><div class="no">${esc(me.PilgrimNo)}</div></div></div>
    <div class="perf"></div>
    <div class="body">${city(['فندق مكة المكرمة', me.Makkah_Hotel], me.Makkah_Room, me.Makkah_Location)}${city(['فندق المدينة المنورة', me.Madinah_Hotel], me.Madinah_Room, me.Madinah_Location)}
      <button class="btn btn-sm btn-dark rounded-pill" id="logout">تسجيل خروج</button></div></div>`;
  $('logout').onclick = () => { me = null; localStorage.removeItem('umrah_me'); renderMe(); };
}
$('loginForm').onsubmit = async e => {
  e.preventDefault(); $('loginMsg').textContent = '';
  try {
    const r = await post({ action: 'login', code: $('code').value.trim() });
    if (!r.ok) { $('loginMsg').textContent = 'الرقم غير صحيح، تأكد منه أو تواصل مع الحملة.'; return; }
    me = r.pilgrim; localStorage.setItem('umrah_me', JSON.stringify(me)); renderMe();
  } catch { $('loginMsg').textContent = 'تعذّر الاتصال، حاول مرة أخرى.'; }
};

/* ---------- حقول الاسم والهاتف (تُملأ تلقائيًا بعد الدخول) ---------- */
function fillWho() {
  document.querySelectorAll('.who').forEach(w => {
    const n = w.querySelector('.wn')?.value, p = w.querySelector('.wp')?.value;
    w.innerHTML = `<div class="col-6"><input class="form-control u-in wn" placeholder="الاسم" required value="${esc(me?.Name || n || '')}"></div>
      <div class="col-6"><input class="form-control u-in wp" type="tel" placeholder="رقم الهاتف" required value="${esc(me?.Phone || p || '')}"></div>`;
  });
}
const who = f => ({ name: f.querySelector('.wn').value.trim(), phone: f.querySelector('.wp').value.trim(), pilgrimNo: me?.PilgrimNo || '' });

/* ---------- التقييم ---------- */
const PH = ['نأسف لذلك، وسنعمل على الأفضل', 'نتطلع لتحسين تجربتك', 'جيدة، ونطمح لما هو أفضل', 'رائعة، شكرًا لثقتك بنا', 'بارك الله فيك، أسعدتنا رحلتك'];
let rating = 0;
$('stars').innerHTML = [1,2,3,4,5].map(i => `<button type="button" data-i="${i}" aria-label="${i} نجوم"><i class="bi bi-star-fill"></i></button>`).join('');
$('stars').onclick = e => {
  const b = e.target.closest('button'); if (!b) return; rating = +b.dataset.i;
  $('stars').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.i <= rating));
  $('starText').textContent = PH[rating - 1];
};
const send = async (form, body, ok) => {
  const btn = form.querySelector('button:last-of-type'); btn.disabled = true;
  try { const r = await post(body); if (!r.ok) throw 0; toast(ok); form.reset(); fillWho(); return true; }
  catch { toast('تعذّر الإرسال، حاول مرة أخرى'); } finally { btn.disabled = false; }
};
$('rateForm').onsubmit = async e => {
  e.preventDefault(); if (!rating) return toast('اختر عدد النجوم أولًا');
  if (await send(e.target, { action: 'rating', ...who(e.target), stars: rating, message: $('rateMsg').value }, 'شكرًا لتقييمك 🌙')) { rating = 0; $('starText').textContent = ''; $('stars').querySelectorAll('button').forEach(x => x.classList.remove('on')); }
};
$('askForm').onsubmit = e => { e.preventDefault(); send(e.target, { action: 'inquiry', ...who(e.target), message: $('askMsg').value }, 'وصلت رسالتك، سنرد عليك قريبًا'); };

renderMe(); loadSchedule();
