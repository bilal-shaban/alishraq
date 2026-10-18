/** schedule.js — البرنامج والمواعيد، مساحة الشيخ، الإعلانات. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt, H = A.crudHelpers;
  var RELIGIOUS = ['tahajjud', 'ihram', 'umrah', 'lesson', 'visit'];

  function scheduleCfg(ctx, religiousOnly) {
    var cat = ctx.schema.entities.schedule.fields.filter(function (f) { return f.name === 'Category'; })[0];
    var canAll = ctx.can('schedule.write'), canRel = ctx.can('schedule.write_religious');
    var catOpts = cat.enumValues.filter(function (v) { return religiousOnly ? RELIGIOUS.indexOf(v) !== -1 : true; });
    var allowed = cat.enumValues.filter(function (v) { return RELIGIOUS.indexOf(v) !== -1 ? canRel : canAll; });
    var timer;
    return {
      entity: 'schedule', nav: religiousOnly ? 'sheikh' : 'schedule', title: religiousOnly ? 'مساحة الشيخ' : 'البرنامج والمواعيد',
      sub: religiousOnly ? 'الدروس والتهجد والإحرام وأداء العمرة والزيارات' : 'كل أنشطة الحملات بتوقيت ' + ctx.tz, newLabel: 'موعد جديد', perm: 'schedule',
      refs: ['campaigns'], searchPlaceholder: 'ابحث بالعنوان أو المكان…', defaultSort: { sort: 'Date_Time', dir: 'asc' },
      defaults: { Category: allowed[0] || 'general', Status: 'active', Notify_Before_Min: 30 },
      extra: function () { return religiousOnly ? { filters: { Category: RELIGIOUS } } : {}; },
      filters: [
        { key: 'when', label: 'الوقت', direct: true, param: 'when', options: [{ v: 'today', l: 'اليوم' }, { v: 'live', l: 'جارٍ الآن' }, { v: 'upcoming', l: 'قادم' }, { v: 'past', l: 'منتهٍ' }] },
        { key: 'date', label: 'اليوم', type: 'date', direct: true, param: 'date' }
      ].concat(religiousOnly ? [] : [{ key: 'Category', label: 'التصنيف', options: catOpts.map(function (v) { return { v: v, l: cat.enumLabels[v] }; }) }]),
      columns: [
        { key: 'Date_Time', label: 'الوقت', sort: true, render: function (r) { return '<div class="num fw-bold">' + Fmt.time(r.Date_Time) + (r.End_Time ? ' – ' + Fmt.time(r.End_Time) : '') + '</div><div class="small text-secondary">' + Fmt.date(String(Fmt.toInput(r.Date_Time)).substring(0, 10)) + '</div>'; } },
        { key: 'Title', label: 'الموعد', sort: true, render: function (r) { return '<b>' + esc(r.Title) + '</b>' + (r.Important === true || r.Important === 'true' ? ' <span class="rm-badge warn" title="يُرسل تذكيراً عبر تيليجرام">مهم</span>' : '') + '<div class="small text-secondary">' + esc(A.enumLabel('schedule', 'Category', r.Category)) + '</div>'; } },
        { key: 'Location', label: 'المكان', hide: 'md' },
        { key: 'Campaign_ID', label: 'الحملة', hide: 'md', render: function (r) { return r.Campaign_ID ? esc(A.Refs.label('campaigns', r.Campaign_ID)) : '<span class="text-secondary">كل الحملات</span>'; } },
        { key: 'live_state', label: 'الحالة', render: function (r) { return A.liveBadge(r.live_state); } }
      ],
      canEdit: function (r) { return RELIGIOUS.indexOf(r.Category) !== -1 ? canRel : canAll; },
      canDelete: function (r) { return RELIGIOUS.indexOf(r.Category) !== -1 ? canRel : canAll; },
      fieldsFor: function (c, mode) {
        return A.Form.fieldsFor('schedule', mode).map(function (f) {
          if (f.name === 'Category') return Object.assign({}, f, { enumValues: allowed, enumLabels: cat.enumLabels });
          if (f.name === 'Important') return Object.assign({}, f, { hint: 'يرسل تذكيراً إلى تيليجرام قبل الموعد (إن كان مفعّلاً في الإعدادات)' });
          return f;
        });
      },
      onLoad: function () { clearInterval(timer); }
    };
  }

  A.Pages.schedule = async function (ctx) {
    var api = await A.crud(ctx, scheduleCfg(ctx, false));
    setInterval(function () { if (!document.hidden && !document.querySelector('.modal.show')) api.reload(); }, 60000);
  };
  A.Pages.sheikh = async function (ctx) {
    var cfg = scheduleCfg(ctx, true);
    cfg.headExtra = ctx.can('announcements.write') ? '<a class="btn btn-ghost" href="announcements.html">إعلاناتي</a>' : '';
    var api = await A.crud(ctx, cfg);
    setInterval(function () { if (!document.hidden && !document.querySelector('.modal.show')) api.reload(); }, 60000);
  };

  A.Pages.announcements = async function (ctx) {
    var canPub = ctx.can('announcements.publish');
    await A.crud(ctx, {
      entity: 'announcements', nav: 'announcements', title: 'الإعلانات', sub: canPub ? 'اكتب الإعلان ثم انشره للمعتمرين' : 'اكتب مسودة وأرسلها للموافقة', newLabel: 'إعلان جديد', refs: ['campaigns'],
      searchPlaceholder: 'ابحث في العنوان أو النص…', defaultSort: { sort: 'Created_At', dir: 'desc' }, defaults: { Priority: 'normal', Audience: 'all' },
      filters: [{ key: 'Status', label: 'الحالة', options: [{ v: 'draft', l: 'مسودة' }, { v: 'pending_approval', l: 'بانتظار الموافقة' }, { v: 'published', l: 'منشور' }, { v: 'paused', l: 'موقوف' }] }],
      columns: [
        { key: 'Title', label: 'الإعلان', sort: true, render: function (r) { return '<b>' + esc(r.Title) + '</b><div class="small text-secondary">' + esc((r.Message || '').slice(0, 90)) + (r.Message && r.Message.length > 90 ? '…' : '') + '</div>'; } },
        { key: 'Priority', label: 'الأولوية', hide: 'sm', render: function (r) { return A.badge('announcements', 'Priority', r.Priority); } },
        { key: 'Audience', label: 'الجمهور', hide: 'md', render: function (r) { return esc(A.enumLabel('announcements', 'Audience', r.Audience)); } },
        { key: 'Start_Date', label: 'الفترة', hide: 'md', render: function (r) { return (r.Start_Date ? Fmt.date(r.Start_Date) : '—') + ' ← ' + (r.End_Date ? Fmt.date(r.End_Date) : '—'); } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('announcements', 'Status', r.Status); } }
      ],
      fieldsFor: function (c, mode) { return A.Form.fieldsFor('announcements', mode).filter(function (f) { return f.name !== 'Status'; }); },
      canEdit: function (r) { return r.Status !== 'published' || canPub; }, canDelete: function (r) { return r.Status !== 'published'; },
      rowActions: function (r) {
        var h = '';
        if (r.Status === 'draft' || r.Status === 'paused') h += H.btn('submit', 'إرسال للموافقة');
        if (canPub && r.Status !== 'published') h += H.btn('publish', 'نشر', 'btn-gold');
        if (r.Status === 'published') h += H.btn('pause', 'إيقاف');
        return h;
      },
      onAction: async function (act, row, api) {
        var action = { submit: 'announcements.submit', publish: 'announcements.publish', pause: 'announcements.pause' }[act]; if (!action) return;
        try { await Api.call(action, { Announcement_ID: row.Announcement_ID }); A.toast(act === 'publish' ? 'تم النشر' : (act === 'pause' ? 'تم الإيقاف' : 'أُرسل للموافقة'), 'ok'); api.reload(); } catch (e) { A.toast(Api.describe(e), 'bad'); }
      }
    });
  };

  /* ---- الحضور: مسح بطاقات QR أو تسجيل يدوي ---- */
  A.Pages.attendance = async function (ctx) {
    var canWrite = ctx.can('attendance.write');
    var root = ctx.shell('attendance', 'الحضور', 'سجّل حضور المعتمرين في الأنشطة (كصعود الباص) بمسح بطاقاتهم أو يدوياً');
    var ST = [['present', 'حاضر'], ['late', 'متأخر'], ['absent', 'غائب'], ['excused', 'معذور']];
    var cur = '', sheet = null, stream = null, loopT = null, busy = false, last = { code: '', at: 0 }, detector = null, canvas = null;
    root.innerHTML = '<div class="rm-card mb-3"><label class="form-label" for="at-act">النشاط</label>' +
      '<div class="d-grid gap-2 mb-3"><select id="at-when" class="form-select" aria-label="الفترة"><option value="today">أنشطة اليوم</option><option value="upcoming">الأنشطة القادمة</option></select><select id="at-act" class="form-select"></select></div>' +
      '<div id="at-sum" class="d-flex flex-wrap gap-2 mb-3"></div>' +
      (canWrite ? '<div class="d-grid gap-2 d-sm-flex"><button type="button" id="at-scan" class="btn btn-gold">📷 مسح بطاقة بالكاميرا</button><button type="button" id="at-man" class="btn btn-ghost">إدخال الرمز يدوياً</button></div>' +
      '<div id="at-manual" class="mt-2" hidden><div class="input-group"><input id="at-code" class="form-control" dir="ltr" placeholder="رمز المعتمر مثل PLG-0001" autocomplete="off" autocapitalize="characters" aria-label="رمز المعتمر"><button type="button" id="at-go" class="btn btn-gold">تسجيل</button></div></div>' +
      '<div id="at-cam" class="mt-3" hidden><video id="at-video" playsinline muted style="width:100%;max-height:55vh;border-radius:12px;background:#000;object-fit:cover"></video>' +
      '<div class="d-flex justify-content-between align-items-center mt-2 gap-2"><small class="text-secondary">وجّه الكاميرا نحو رمز QR على بطاقة المعتمر</small><button type="button" id="at-stop" class="btn btn-sm btn-ghost">إيقاف الكاميرا</button></div></div>' : '<p class="text-secondary small mb-0">صلاحيتك للعرض فقط، ولا يمكنك تسجيل الحضور.</p>') +
      '<div id="at-res" class="mt-3" aria-live="polite"></div></div>' +
      '<div class="rm-card"><input id="at-q" class="form-control mb-2" placeholder="ابحث بالاسم أو الرمز…" aria-label="بحث"><div id="at-list"></div></div>';

    function fmtAct(s) { return Fmt.time(s.Date_Time) + ' — ' + s.Title + (s.Location ? ' (' + s.Location + ')' : ''); }
    function sumOf(items) {
      var n = { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 };
      items.forEach(function (i) { if (i.Status) n[i.Status]++; else n.unmarked++; });
      return n;
    }
    function drawSum() {
      var box = A.$('#at-sum'); if (!sheet) { box.innerHTML = ''; return; }
      var n = sumOf(sheet.items), tot = sheet.items.length;
      box.innerHTML = '<span class="rm-badge ok">حاضر ' + n.present + ' / ' + tot + '</span><span class="rm-badge warn">متأخر ' + n.late + '</span><span class="rm-badge">غائب ' + n.absent + '</span><span class="rm-badge">معذور ' + n.excused + '</span><span class="rm-badge">بلا تسجيل ' + n.unmarked + '</span>';
    }
    function drawList() {
      var box = A.$('#at-list'); if (!sheet) { box.innerHTML = ''; return; }
      var q = (A.$('#at-q').value || '').trim().toLowerCase();
      var items = sheet.items.filter(function (i) { return !q || String(i.Full_Name).toLowerCase().indexOf(q) !== -1 || String(i.Pilgrim_Code).toLowerCase().indexOf(q) !== -1; });
      if (!sheet.items.length) { box.innerHTML = A.emptyBox('لا معتمرين لهذا النشاط', 'تظهر هنا قائمة معتمري الحملة المرتبطة بالنشاط'); return; }
      box.innerHTML = items.map(function (i) {
        return '<div class="py-2 border-bottom" data-pid="' + esc(i.Pilgrim_ID) + '"><div class="d-flex justify-content-between gap-2"><b>' + esc(i.Full_Name) + '</b><span class="small text-secondary num" dir="ltr">' + esc(i.Pilgrim_Code) + '</span></div>' +
          (canWrite ? '<div class="btn-group btn-group-sm w-100 mt-1" role="group" aria-label="حالة الحضور">' + ST.map(function (s) { return '<button type="button" class="btn ' + (i.Status === s[0] ? 'btn-gold' : 'btn-ghost') + '" data-st="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</div>' :
          '<div class="small text-secondary mt-1">' + esc((ST.filter(function (s) { return s[0] === i.Status; })[0] || [0, 'لم يُسجَّل'])[1]) + '</div>') + '</div>';
      }).join('') || A.emptyBox('لا نتائج', '');
    }
    async function loadSheet() {
      sheet = null; drawSum(); drawList();
      if (!cur) return;
      A.$('#at-list').innerHTML = A.skeleton(3);
      try { sheet = await Api.call('attendance.sheet', { Schedule_ID: cur }); } catch (e) { A.$('#at-list').innerHTML = A.errBox(e, loadSheet); return; }
      drawSum(); drawList();
    }
    async function loadActs(when) {
      var sel = A.$('#at-act'); sel.innerHTML = '<option>جارٍ التحميل…</option>';
      try {
        var r = await Api.call('schedule.list', { when: when, limit: 100, sort: 'Date_Time', dir: 'asc' });
        var items = r.items || [];
        sel.innerHTML = items.length ? items.map(function (s) { return '<option value="' + esc(s.Schedule_ID) + '">' + esc(fmtAct(s)) + '</option>'; }).join('') : '<option value="">لا توجد أنشطة</option>';
        cur = items.length ? items[0].Schedule_ID : '';
      } catch (e) { sel.innerHTML = '<option value="">تعذر التحميل</option>'; cur = ''; }
      await loadSheet();
    }
    function showRes(kind, title, sub) {
      var box = A.$('#at-res'); if (!box) return;
      box.innerHTML = '<div class="alert alert-' + kind + ' py-2 mb-0"><div class="fw-bold fs-5">' + esc(title) + '</div>' + (sub ? '<div class="small">' + esc(sub) + '</div>' : '') + '</div>';
      try { if (navigator.vibrate) navigator.vibrate(kind === 'success' ? 70 : [60, 50, 60]); } catch (e) { /* تجاهل */ }
    }
    async function submit(raw) {
      raw = String(raw || '').trim(); if (!raw || !cur) { if (!cur) showRes('warning', 'اختر نشاطاً أولاً', ''); return; }
      if (busy) return; busy = true;
      try {
        var r = await Api.call('attendance.scan', { Schedule_ID: cur, code: raw });
        var who = r.pilgrim ? r.pilgrim.Full_Name : '', code = r.pilgrim ? r.pilgrim.Pilgrim_Code : '';
        if (r.result === 'ok') {
          showRes('success', '✅ ' + who, 'تم تسجيل الحضور · ' + code);
          if (sheet) { sheet.items.forEach(function (i) { if (r.pilgrim && i.Pilgrim_ID === r.pilgrim.Pilgrim_ID) i.Status = 'present'; }); drawSum(); drawList(); }
        } else if (r.result === 'already') showRes('warning', '⚠️ ' + who, 'سُجّل حضوره من قبل · ' + code);
        else if (r.result === 'not_in_roster') showRes('danger', '⛔ ليس ضمن قائمة هذا النشاط', 'المعتمر من حملة أخرى أو غير مؤكد الحجز');
        else showRes('danger', '⛔ رمز غير معروف', 'تأكد أن البطاقة تخص هذه الشركة');
      } catch (e) { showRes('danger', 'تعذر التسجيل', Api.describe ? Api.describe(e) : (e.message || '')); }
      busy = false;
    }
    function stopCam() {
      if (loopT) { clearInterval(loopT); loopT = null; }
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      var cam = A.$('#at-cam'); if (cam) cam.hidden = true;
      var v = A.$('#at-video'); if (v) v.srcObject = null;
    }
    async function startCam() {
      var res = A.$('#at-res'), hasBD = 'BarcodeDetector' in window, hasJs = typeof window.jsQR === 'function';
      if (!hasBD && !hasJs) { showRes('warning', 'متصفحك لا يدعم المسح بالكاميرا داخل الصفحة', 'استخدم Chrome على أندرويد، أو أدخل الرمز يدوياً'); A.$('#at-manual').hidden = false; return; }
      if (!cur) { showRes('warning', 'اختر نشاطاً أولاً', ''); return; }
      try {
        if (hasBD) { var fm = await BarcodeDetector.getSupportedFormats(); if (fm.indexOf('qr_code') === -1) hasBD = false; }
        if (hasBD) detector = new BarcodeDetector({ formats: ['qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch (e) { showRes('danger', 'تعذر تشغيل الكاميرا', 'اسمح للموقع باستخدام الكاميرا، أو أدخل الرمز يدوياً'); A.$('#at-manual').hidden = false; return; }
      var v = A.$('#at-video'); v.srcObject = stream; A.$('#at-cam').hidden = false;
      try { await v.play(); } catch (e) { /* تجاهل */ }
      if (res) res.innerHTML = '';
      loopT = setInterval(async function () {
        if (busy || !v.videoWidth) return;
        var code = '';
        try {
          if (detector) { var f = await detector.detect(v); if (f && f.length) code = f[0].rawValue || ''; }
          else {
            canvas = canvas || document.createElement('canvas'); canvas.width = v.videoWidth; canvas.height = v.videoHeight;
            var g = canvas.getContext('2d', { willReadFrequently: true }); g.drawImage(v, 0, 0);
            var d = g.getImageData(0, 0, canvas.width, canvas.height), j = window.jsQR(d.data, d.width, d.height); if (j && j.data) code = j.data;
          }
        } catch (e) { return; }
        if (!code) return;
        var now = Date.now(); if (code === last.code && now - last.at < 3000) return;
        last = { code: code, at: now }; submit(code);
      }, 350);
    }

    A.$('#at-when').addEventListener('change', function () { stopCam(); loadActs(this.value); });
    A.$('#at-act').addEventListener('change', function () { cur = this.value; last = { code: '', at: 0 }; var r = A.$('#at-res'); if (r) r.innerHTML = ''; loadSheet(); });
    A.$('#at-q').addEventListener('input', drawList);
    if (canWrite) {
      A.$('#at-scan').addEventListener('click', startCam);
      A.$('#at-stop').addEventListener('click', stopCam);
      A.$('#at-man').addEventListener('click', function () { var m = A.$('#at-manual'); m.hidden = !m.hidden; if (!m.hidden) A.$('#at-code').focus(); });
      function manual() { var i = A.$('#at-code'); var v = i.value; i.value = ''; submit(v); i.focus(); }
      A.$('#at-go').addEventListener('click', manual);
      A.$('#at-code').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); manual(); } });
      A.$('#at-list').addEventListener('click', async function (ev) {
        var b = ev.target.closest('[data-st]'); if (!b) return;
        var row = b.closest('[data-pid]'), pid = row.getAttribute('data-pid'), st = b.getAttribute('data-st');
        try { await Api.call('attendance.mark', { Schedule_ID: cur, records: [{ Pilgrim_ID: pid, Status: st }] }); sheet.items.forEach(function (i) { if (i.Pilgrim_ID === pid) i.Status = st; }); drawSum(); drawList(); }
        catch (e) { A.toast(Api.describe ? Api.describe(e) : 'تعذر الحفظ', 'danger'); }
      });
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stopCam(); });
    window.addEventListener('pagehide', stopCam);
    await loadActs('today');
    if (!cur) { A.$('#at-when').value = 'upcoming'; await loadActs('upcoming'); }
  };
})();
