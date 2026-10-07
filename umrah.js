// رابط تطبيق الويب (Apps Script) بعد النشر
const API = 'https://script.google.com/macros/s/AKfycbxBSrv8Rwlre9Vy3LQguKKwsOfpFSKYPpKd5HYlyoSJwijtF6cyGFm2nGnbva7bcceKLg/exec';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast = (t, ms = 3000) => { const e = $('toast'); e.textContent = t; e.classList.remove('d-none'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.add('d-none'), ms); };
const post = body => fetch(API, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json()); // text/plain: بلا CORS preflight

/* ---------- الجلسة (تُحفظ محليًا لتعمل البطاقة بدون إنترنت) ---------- */
const KEY = 'umrah_session';
localStorage.removeItem('umrah_me'); // مفتاح النسخة القديمة
const loadSession = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
let { code = '', pilgrim: me = null, banner = '', events: raw = [] } = loadSession();
if (!code) me = null;
let events = [];
const save = () => localStorage.setItem(KEY, JSON.stringify({ code, pilgrim: me, banner, events: raw }));

/* ---------- الجدول والعداد ---------- */
const DEFAULT_MIN = 60; // مدة النشاط (بالدقائق) إن لم يوجد عمود End_Time أو كان فارغًا
const ICONS = [['تهجد','bi-moon-stars'],['عمرة','bi-stars'],['مزار','bi-geo-alt'],['جدة','bi-water'],['تحرك','bi-bus-front'],['وجبة','bi-cup-hot']];
const icon = c => (ICONS.find(([k]) => (c || '').includes(k)) || [0, 'bi-calendar-event'])[1];
const when = s => new Date(String(s).trim().replace(' ', 'T') + ':00+03:00'); // توقيت السعودية
const fmt = d => d.toLocaleString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Riyadh' });

// وقت انتهاء النشاط: End_Time كامل، أو وقت فقط (يُؤخذ تاريخ البداية)، أو بداية + المدة الافتراضية
function endOf(e, t) {
  const x = String(e.End_Time || '').trim(), dflt = new Date(t.getTime() + DEFAULT_MIN * 60000);
  if (!x) return dflt;
  const timeOnly = /^\d{1,2}:\d{2}$/.test(x);
  let end = when(timeOnly ? String(e.Date_Time).trim().split(/[ T]/)[0] + ' ' + x.padStart(5, '0') : x);
  if (isNaN(end)) return dflt;
  if (timeOnly && end <= t) end = new Date(end.getTime() + 864e5); // ينتهي بعد منتصف الليل
  return end;
}
const prep = list => list.map(e => { const t = when(e.Date_Time); return { ...e, t, end: endOf(e, t) }; }).sort((a, b) => a.t - b.t);
const live = () => events.filter(e => e.end > Date.now()); // المنتهية تختفي تلقائيًا

let lastKey = '';
function renderEvents(force) {
  const now = Date.now(), list = live();
  const key = list.map(e => events.indexOf(e) + (e.t <= now ? 'n' : '')).join();
  if (!force && key === lastKey) return;
  lastKey = key;
  $('events').innerHTML = list.length ? list.map(e => `
    <div class="ev"><div class="ic"><i class="bi ${icon(e.Category)}"></i></div>
      <div class="flex-grow-1"><div class="fw-bold text-light">${esc(e.Title)}</div>
        <div>${e.t <= now ? '<span class="badge bg-success ms-2">جارٍ الآن</span>' : ''}<small class="gold">${esc(e.Category)}</small></div>
        <div><small><i class="bi bi-clock ms-1"></i>${fmt(e.t)}</small></div>
        ${e.Location ? `<div><small><i class="bi bi-pin-map ms-1"></i>${esc(e.Location)}</small></div>` : ''}
        ${e.Notes ? `<div class="note">${esc(e.Notes)}</div>` : ''}
        <div class="acts">
          <button type="button" class="btn btn-sm btn-success rounded-pill" data-act="wa" data-i="${events.indexOf(e)}"><i class="bi bi-whatsapp ms-1"></i>مشاركة</button>
          <button type="button" class="btn btn-sm btn-gold-outline rounded-pill" data-act="img" data-i="${events.indexOf(e)}"><i class="bi bi-image ms-1"></i>حفظ كصورة</button>
        </div></div></div>`).join('')
    : '<p class="desc-text">لا توجد أنشطة معلنة حاليًا.</p>';
}

function tick() {
  if (!me) return;
  renderEvents();
  const n = events.find(e => e.t > Date.now());
  $('nextTitle').textContent = n ? n.Title : 'لا يوجد نشاط قادم';
  const s = n ? Math.floor((n.t - Date.now()) / 1000) : 0, p = x => String(x).padStart(2, '0');
  $('cdD').textContent = p(Math.floor(s / 86400)); $('cdH').textContent = p(Math.floor(s % 86400 / 3600));
  $('cdM').textContent = p(Math.floor(s % 3600 / 60)); $('cdS').textContent = p(s % 60);
}
setInterval(tick, 1000);

/* ---------- مشاركة النشاط وحفظه كصورة ---------- */
const shareText = e => `*${e.Title}*\n${e.Category ? e.Category + '\n' : ''}🕒 ${fmt(e.t)}\n${e.Location ? '📍 ' + e.Location + '\n' : ''}${e.Notes ? '📝 ' + e.Notes + '\n' : ''}\n— حملة الإشراق`;
const plain = s => (s && !/^https?:/i.test(s) ? s : ''); // الروابط لا تفيد داخل الصورة

$('events').onclick = e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const ev = events[+b.dataset.i]; if (!ev) return;
  if (b.dataset.act === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(shareText(ev)), '_blank', 'noopener');
  else saveEventImage(ev, b);
};
async function saveEventImage(ev, b) {
  b.disabled = true;
  try {
    const rows = [['الموعد', fmt(ev.t)]];
    if (plain(ev.Location)) rows.push(['الموقع', ev.Location]);
    if (ev.Notes) rows.push(['ملاحظات', ev.Notes]);
    await saveCanvas(await makeImage({ title: ev.Title, sub: ev.Category, rows }), 'ishraq-activity.png');
  } catch { toast('تعذّر حفظ الصورة'); } finally { b.disabled = false; }
}

/* ---------- توليد الصور (Canvas) ---------- */
const loadImg = src => new Promise(r => { if (!src) return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });

async function makeImage({ title, sub, rows = [], qr, qrNote }) {
  try { await Promise.all([document.fonts.load('700 40px Tajawal'), document.fonts.load('400 32px Tajawal')]); } catch {}
  const W = 1080, P = 80, MAXW = W - 2 * P, GOLD = '#edcea0', FF = 'Tajawal, sans-serif';
  const m = document.createElement('canvas').getContext('2d'); m.direction = 'rtl';
  const wrap = (txt, font) => { m.font = font; return String(txt ?? '').split('\n').flatMap(par => {
    const out = []; let cur = '';
    for (const w of par.split(/\s+/).filter(Boolean)) { const t = cur ? cur + ' ' + w : w; if (cur && m.measureText(t).width > MAXW) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur); return out; }); };

  const ops = []; let y = 70;
  const text = (t, size, weight, color, align, lh, gap = 0) => {
    const font = `${weight} ${size}px ${FF}`;
    for (const l of wrap(t, font)) { y += lh; ops.push({ t: l, font, color, align, y }); }
    y += gap;
  };
  const logo = await loadImg('./5b862b4281f64fd884b11984846f0e97.png');
  if (logo) { const h = 130, w = h * logo.width / logo.height; ops.push({ img: logo, x: (W - w) / 2, y, w, h }); y += h + 20; }
  text(title, 58, 700, GOLD, 'center', 76, 6);
  if (sub) text(sub, 34, 400, '#d3d3c7', 'center', 48, 10);
  ops.push({ line: y + 20 }); y += 50;
  for (const [k, v] of rows) { text(k, 28, 400, GOLD, 'right', 40); text(v, 38, 700, '#f8f9fa', 'right', 54, 22); }
  if (qr) {
    const s = qr.width * Math.max(1, Math.round(380 / qr.width)); // تكبير بمضاعف صحيح ليبقى الرمز حادًّا
    y += 30; ops.push({ qr, x: (W - s) / 2, y, s }); y += s + 30;
    if (qrNote) text(qrNote, 28, 400, '#d3d3c7', 'center', 40);
  }
  y += 20; text('حملة الإشراق', 28, 700, GOLD, 'center', 40);
  const H = y + 60;

  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#21211d'; x.fillRect(0, 0, W, H);
  x.strokeStyle = GOLD; x.lineWidth = 6; x.strokeRect(24, 24, W - 48, H - 48);
  x.direction = 'rtl'; x.textBaseline = 'alphabetic';
  for (const o of ops) {
    if (o.img) x.drawImage(o.img, o.x, o.y, o.w, o.h);
    else if (o.line) { x.fillStyle = 'rgba(237,206,160,.35)'; x.fillRect(P, o.line, MAXW, 3); }
    else if (o.qr) { x.fillStyle = '#fff'; x.fillRect(o.x - 20, o.y - 20, o.s + 40, o.s + 40); x.imageSmoothingEnabled = false; x.drawImage(o.qr, o.x, o.y, o.s, o.s); x.imageSmoothingEnabled = true; }
    else { x.font = o.font; x.fillStyle = o.color; x.textAlign = o.align; x.fillText(o.t, o.align === 'center' ? W / 2 : W - P, o.y); }
  }
  return c;
}

async function saveCanvas(c, name) {
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], name, { type: 'image/png' });
  // آيفون: ورقة المشاركة فيها «حفظ الصورة»؛ غيره: تنزيل مباشر
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('تم حفظ الصورة');
}

/* ---------- نافذة التأكيد ---------- */
const askConfirm = (title, body, yes) => new Promise(res => {
  const el = $('cfm'); $('cfmT').textContent = title; $('cfmB').textContent = body; $('cfmY').textContent = yes;
  const m = bootstrap.Modal.getOrCreateInstance(el); let ok = false;
  $('cfmY').onclick = () => { ok = true; m.hide(); };
  el.addEventListener('hidden.bs.modal', () => res(ok), { once: true });
  m.show();
});

/* ---------- بطاقة المعتمر ---------- */
const qrURL = () => { try { const q = qrcode(0, 'M'); q.addData('UMRAH:' + me.PilgrimNo); q.make(); return q.createDataURL(10, 0); } catch { return null; } };

function renderMe() {
  fillWho();
  const t = $('ticket');
  if (!me) { t.innerHTML = ''; $('loginForm').classList.remove('d-none'); return; }
  $('loginForm').classList.add('d-none');
  const city = (h, r, l) => `<p><b>${h[0]}</b>${esc(h[1])} — غرفة ${esc(r)}</p>${l ? `<p class="small">${/^https?:/.test(l) ? `<a href="${esc(l)}" target="_blank" rel="noopener" class="text-dark fw-bold"><i class="bi bi-map ms-1"></i>افتح الموقع على الخريطة</a>` : esc(l)}</p>` : ''}`;
  t.innerHTML = `<div class="ticket mt-2">
    <div class="head d-flex justify-content-between align-items-center"><div><small>أهلًا بك</small><div class="h5 fw-bold mb-0">${esc(me.Name)}</div></div>
      <div class="text-center"><small>رقم المعتمر</small><div class="no">${esc(me.PilgrimNo)}</div></div></div>
    <div class="perf"></div>
    <div class="body">${city(['فندق مكة المكرمة', me.Makkah_Hotel], me.Makkah_Room, me.Makkah_Location)}${city(['فندق المدينة المنورة', me.Madinah_Hotel], me.Madinah_Room, me.Madinah_Location)}
      <div id="qrWrap" class="text-center my-3"><div id="qrBox" class="d-inline-block bg-white p-2 rounded"></div><small class="d-block mt-1" style="opacity:.75">رمز الحضور — اعرضه للمشرف عند صعود الباص</small></div>
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-danger fw-bold" id="lostBtn"><i class="bi bi-exclamation-triangle-fill ms-1"></i>أنا تائه</button>
        <button type="button" class="btn btn-dark" id="saveCard"><i class="bi bi-download ms-1"></i>حفظ البطاقة كصورة</button>
        <button type="button" class="btn btn-outline-dark" id="logout">تسجيل خروج</button>
      </div></div></div>`;
  const q = qrURL();
  if (q) $('qrBox').innerHTML = `<img src="${q}" width="180" height="180" alt="رمز الحضور" style="display:block">`; else $('qrWrap').remove();
  $('lostBtn').onclick = lost;
  $('saveCard').onclick = e => saveCardImage(e.currentTarget);
  $('logout').onclick = logout;
}

async function saveCardImage(btn) {
  btn.disabled = true;
  try {
    const hotel = (n, r, l) => `${n || '—'} — غرفة ${r || '—'}${plain(l) ? '\n' + l : ''}`;
    const rows = [
      ['فندق مكة المكرمة', hotel(me.Makkah_Hotel, me.Makkah_Room, me.Makkah_Location)],
      ['فندق المدينة المنورة', hotel(me.Madinah_Hotel, me.Madinah_Room, me.Madinah_Location)]
    ];
    const qr = await loadImg(qrURL());
    const c = await makeImage({ title: me.Name, sub: 'رقم المعتمر: ' + me.PilgrimNo, rows, qr, qrNote: 'رمز الحضور — اعرضه للمشرف عند صعود الباص' });
    await saveCanvas(c, `ishraq-card-${me.PilgrimNo}.png`);
  } catch { toast('تعذّر حفظ البطاقة'); } finally { btn.disabled = false; }
}

/* ---------- أنا تائه ---------- */
const getPos = () => new Promise(res => navigator.geolocation
  ? navigator.geolocation.getCurrentPosition(p => res(p.coords), () => res(null), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 })
  : res(null));

async function lost() {
  if (!await askConfirm('هل أنت تائه فعلًا؟', 'سيصل مشرفي الحملة اسمك ورقمك وفندقك وموقعك الحالي.', 'نعم، أنا تائه')) return;
  const btn = $('lostBtn'); btn.disabled = true; toast('جارٍ تحديد موقعك...', 12000);
  const c = await getPos();
  try {
    const r = await post({ action: 'lost', code, lat: c?.latitude, lng: c?.longitude, acc: c ? Math.round(c.accuracy) : undefined });
    if (!r.ok) throw 0;
    toast(c ? 'وصل موقعك للمشرفين، ابقَ في مكانك وسيصلون إليك' : 'وصل نداؤك للمشرفين لكن تعذّر تحديد موقعك. فعّل خدمة الموقع وأعد المحاولة', 9000);
  } catch { toast('تعذّر الإرسال، تحقق من الاتصال وحاول مرة أخرى', 6000); }
  finally { btn.disabled = false; }
}

/* ---------- الدخول والخروج ---------- */
function render() {
  renderMe();
  $('app').classList.toggle('d-none', !me);
  const b = $('banner');
  if (me && banner) { b.textContent = banner; b.classList.remove('d-none'); } else b.classList.add('d-none');
  events = me ? prep(raw) : [];
  renderEvents(true); tick();
}
async function enter(c) {
  const r = await post({ action: 'login', code: c });
  if (!r.ok) return false;
  code = c; me = r.pilgrim; banner = r.banner || ''; raw = r.events || [];
  save(); render(); return true;
}
function logout() {
  me = null; code = ''; banner = ''; raw = []; events = [];
  localStorage.removeItem(KEY); render(); window.scrollTo(0, 0);
}
$('loginForm').onsubmit = async e => {
  e.preventDefault(); $('loginMsg').textContent = '';
  const btn = e.target.querySelector('button'); btn.disabled = true;
  try {
    if (await enter($('code').value.trim())) $('code').value = '';
    else $('loginMsg').textContent = 'الرقم غير صحيح، تأكد منه أو تواصل مع الحملة.';
  } catch { $('loginMsg').textContent = 'تعذّر الاتصال، حاول مرة أخرى.'; }
  finally { btn.disabled = false; }
};

/* ---------- حقول الاسم والهاتف (تُملأ تلقائيًا بعد الدخول) ---------- */
function fillWho() {
  document.querySelectorAll('.who').forEach(w => {
    const n = w.querySelector('.wn')?.value, p = w.querySelector('.wp')?.value;
    w.innerHTML = `<div class="col-6"><input class="form-control u-in wn" placeholder="الاسم" required value="${esc(me?.Name || n || '')}"></div>
      <div class="col-6"><input class="form-control u-in wp" type="tel" placeholder="رقم الهاتف" required value="${esc(me?.Phone || p || '')}"></div>`;
  });
}
const who = f => ({ name: f.querySelector('.wn').value.trim(), phone: f.querySelector('.wp').value.trim() });

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
  if (await send(e.target, { action: 'rating', code, ...who(e.target), stars: rating, message: $('rateMsg').value }, 'شكرًا لتقييمك 🌙')) { rating = 0; $('starText').textContent = ''; $('stars').querySelectorAll('button').forEach(x => x.classList.remove('on')); }
};
$('askForm').onsubmit = e => { e.preventDefault(); send(e.target, { action: 'inquiry', code, ...who(e.target), message: $('askMsg').value }, 'وصلت رسالتك، سنرد عليك قريبًا'); };

/* ---------- البدء ---------- */
render();
// تحديث البيانات من الخادم؛ إن فشل الاتصال تبقى البطاقة المحفوظة تعمل، وإن رُفض الرقم يُسجَّل الخروج
if (me) enter(code).then(ok => { if (ok === false) logout(); }).catch(() => {});
