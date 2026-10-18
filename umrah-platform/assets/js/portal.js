/** portal.js — بوابة المعتمر: رحلتي، البرنامج، الإعلانات، طلب مساعدة، التقييم. المعتمر يرى بياناته فقط. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt;
  A.Pages.portal = async function (ctx) {
    var root = ctx.shell('portal', 'رحلتي', '');
    var tabs = [['home', 'رحلتي'], ['sched', 'البرنامج'], ['ann', 'الإعلانات'], ['help', 'المساعدة']];
    var cur = 'home', timer;
    root.innerHTML = '<div class="container-narrow mx-auto" style="max-width:760px"><ul class="nav nav-pills nav-fill rm-tabs mb-3" role="tablist">' + tabs.map(function (t) { return '<li class="nav-item"><button class="nav-link' + (t[0] === cur ? ' active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button></li>'; }).join('') + '</ul><div id="pt-body"></div></div>';
    var body = A.$('#pt-body'), O;
    root.addEventListener('click', function (ev) { var b = ev.target.closest('[data-tab]'); if (!b) return; cur = b.getAttribute('data-tab'); A.$$('[data-tab]', root).forEach(function (x) { x.classList.toggle('active', x === b); }); draw(); });
    function act(s) { return '<li><div class="flex-grow-1"><div class="fw-bold">' + esc(s.Title) + '</div><div class="small text-secondary">' + esc(A.enumLabel('schedule', 'Category', s.Category)) + (s.Location ? ' · ' + esc(s.Location) : '') + '</div>' + (s.Notes ? '<div class="small mt-1">' + esc(s.Notes) + '</div>' : '') + '</div><div class="text-end"><div class="num small">' + Fmt.time(s.Date_Time) + (s.End_Time ? '–' + Fmt.time(s.End_Time) : '') + '</div>' + A.liveBadge(s.live_state) + '</div></li>'; }

    async function home() {
      body.innerHTML = A.skeleton(3);
      try { O = await Api.call('me.overview', {}); } catch (e) { body.innerHTML = A.errBox(e); return; }
      var p = O.profile || {}, c = O.campaign;
      body.innerHTML = '<div class="rm-card mb-3"><div class="rm-rule"><i></i></div><h2 class="fs-4 mb-1">السلام عليكم ' + esc(p.Full_Name || '') + '</h2><p class="text-secondary mb-0">' + esc(O.welcome || ('أهلاً بك في ' + O.company.name)) + '</p></div>' +
        (c ? '<div class="rm-card mb-3"><div class="rm-card-head"><h2>حملتي</h2></div><dl class="rm-kv mb-0"><dt>الحملة</dt><dd>' + esc(c.Campaign_Name) + '</dd><dt>الفترة</dt><dd class="num">' + Fmt.date(c.Start_Date) + ' ← ' + Fmt.date(c.End_Date) + '</dd><dt>الانطلاق من</dt><dd>' + esc(c.Departure_City || '—') + '</dd></dl></div>' : '') +
        '<div class="rm-card mb-3"><div class="rm-card-head"><h2>جارٍ الآن</h2><span class="rm-live"></span></div>' + (O.live_now.length ? '<ul class="rm-list">' + O.live_now.map(act).join('') + '</ul>' : A.emptyBox('لا نشاط جارياً الآن', '')) + '</div>' +
        '<div class="rm-card mb-3"><div class="rm-card-head"><h2>الموعد القادم</h2></div>' + (O.next_activity ? '<ul class="rm-list">' + act(O.next_activity) + '</ul>' : A.emptyBox('لا مواعيد قادمة', '')) + '</div>' +
        '<div class="rm-card"><div class="rm-card-head"><h2>التواصل مع الشركة</h2></div><p class="mb-1">' + esc(O.company.name) + '</p>' + (O.company.phone ? '<p class="mb-1 num" dir="ltr" style="text-align:start"><a href="tel:' + esc(O.company.phone) + '">' + esc(O.company.phone) + '</a></p>' : '') + (O.company.email ? '<p class="mb-0 small" dir="ltr" style="text-align:start">' + esc(O.company.email) + '</p>' : '') + '</div>' +
        (O.can_edit_contact ? '<div class="rm-card mt-3"><div class="rm-card-head"><h2>بيانات التواصل الخاصة بي</h2></div><form id="ct"><div class="row g-2"><div class="col-sm-6"><label class="form-label" for="ct-p">هاتفي</label><input id="ct-p" class="form-control" dir="ltr" value="' + esc(p.Phone || '') + '"></div><div class="col-sm-6"><label class="form-label" for="ct-e">هاتف جهة طوارئ</label><input id="ct-e" class="form-control" dir="ltr" value="' + esc(p.Emergency_Phone || '') + '"></div></div><div id="ct-m" class="mt-2"></div><button class="btn btn-ghost mt-2" type="submit">حفظ</button></form></div>' : '');
      var f = A.$('#ct'); if (f) f.addEventListener('submit', async function (ev) { ev.preventDefault(); var m = A.$('#ct-m'); try { await Api.call('me.updateContact', { Phone: A.$('#ct-p').value, Emergency_Phone: A.$('#ct-e').value }); m.innerHTML = '<div class="alert alert-success py-2 mb-0">تم الحفظ</div>'; } catch (e) { m.innerHTML = '<div class="alert alert-danger py-2 mb-0">' + esc(Api.describe(e)) + '</div>'; } });
    }
    async function sched() {
      body.innerHTML = '<div class="d-flex gap-2 mb-3"><input type="date" id="sd" class="form-control" aria-label="اليوم"><button class="btn btn-ghost" id="sd-all">كل الأيام</button></div><div class="rm-card" id="sl">' + A.skeleton(3) + '</div>';
      async function load() {
        var box = A.$('#sl'); if (!box) return;
        try { var r = await Api.call('me.schedule', { date: A.$('#sd').value || undefined }); box.innerHTML = r.items.length ? '<ul class="rm-list">' + r.items.map(function (s) { return '<li class="flex-column align-items-stretch"><div class="small text-secondary num">' + Fmt.date(String(Fmt.toInput(s.Date_Time)).substring(0, 10)) + '</div><ul class="rm-list m-0">' + act(s) + '</ul></li>'; }).join('') + '</ul>' : A.emptyBox('لا مواعيد', 'لم تُضف أنشطة لهذا اليوم بعد.'); } catch (e) { box.innerHTML = A.errBox(e); }
      }
      load(); A.$('#sd').addEventListener('change', load); A.$('#sd-all').addEventListener('click', function () { A.$('#sd').value = ''; load(); });
      timer = setInterval(function () { if (!document.hidden && cur === 'sched') load(); }, 60000);
    }
    async function ann() {
      body.innerHTML = A.skeleton(3);
      try { var r = await Api.call('me.announcements', {}); body.innerHTML = r.items.length ? r.items.map(function (a) { return '<div class="rm-card mb-3"><div class="d-flex justify-content-between gap-2"><h3 class="fs-5">' + esc(a.Title) + '</h3>' + A.badge('announcements', 'Priority', a.Priority) + '</div><p class="mb-1" style="white-space:pre-line">' + esc(a.Message) + '</p><div class="small text-secondary num">' + Fmt.dateTime(a.Created_At) + '</div></div>'; }).join('') : '<div class="rm-card">' + A.emptyBox('لا إعلانات', 'ستظهر إعلانات حملتك هنا.') + '</div>'; } catch (e) { body.innerHTML = A.errBox(e); }
    }
    async function help() {
      body.innerHTML = '<div class="rm-card mb-3"><form id="hf"><label class="form-label" for="h-m">اكتب طلبك</label><textarea id="h-m" class="form-control" rows="4" maxlength="1000" required></textarea><div class="form-text">لا ترسل كلمات مرور أو أرقام بطاقات أو بيانات جواز هنا.</div><div id="h-e" class="mt-2"></div><button class="btn btn-gold mt-2" type="submit">إرسال</button></form></div><div id="hl">' + A.skeleton(2) + '</div><div id="rt"></div>';
      async function load() { var box = A.$('#hl'); try { var r = await Api.call('me.inquiries.list', {}); box.innerHTML = r.items.length ? r.items.map(function (i) { return '<div class="rm-card mb-2"><div class="d-flex justify-content-between"><span class="num small text-secondary">' + Fmt.dateTime(i.Created_At) + '</span>' + A.badge('inquiries', 'Status', i.Status) + '</div><p class="mb-1 mt-1">' + esc(i.Message) + '</p>' + (i.Response ? '<div class="p-2 rounded" style="background:var(--rm-surface-2);border-inline-start:3px solid var(--rm-gold)"><b>رد الشركة:</b> ' + esc(i.Response) + '</div>' : '') + '</div>'; }).join('') : ''; } catch (e) { box.innerHTML = A.errBox(e); } }
      load();
      A.$('#hf').addEventListener('submit', async function (ev) {
        ev.preventDefault(); var b = this.querySelector('button'), er = A.$('#h-e'); b.disabled = true; er.innerHTML = '';
        try { await Api.call('me.inquiries.create', { Message: A.$('#h-m').value }); A.$('#h-m').value = ''; A.toast('أُرسل طلبك', 'ok'); load(); } catch (e) { er.innerHTML = '<div class="alert alert-danger py-2 mb-0">' + esc(Api.describe(e)) + '</div>'; }
        b.disabled = false;
      });
      try {
        var s = await Api.call('me.rating.get', {}), rt = A.$('#rt');
        if (s.eligible) {
          rt.innerHTML = '<div class="rm-card"><h3 class="fs-5">قيّم حملتك</h3><form id="rf"><div class="d-flex gap-2 mb-2" role="radiogroup" aria-label="التقييم">' + [1, 2, 3, 4, 5].map(function (n) { return '<label class="btn btn-ghost px-3"><input type="radio" name="rate" value="' + n + '" class="visually-hidden"> ' + n + ' ★</label>'; }).join('') + '</div><textarea id="r-c" class="form-control mb-2" rows="2" maxlength="500" placeholder="تعليق (اختياري)"></textarea><div id="r-e"></div><button class="btn btn-gold" type="submit">إرسال التقييم</button></form></div>';
          A.$$('#rf label').forEach(function (l) { l.addEventListener('click', function () { setTimeout(function () { A.$$('#rf label').forEach(function (x) { x.classList.toggle('btn-gold', x.querySelector('input').checked); x.classList.toggle('btn-ghost', !x.querySelector('input').checked); }); }, 0); }); });
          A.$('#rf').addEventListener('submit', async function (ev) { ev.preventDefault(); var sel = A.$('#rf input:checked'); if (!sel) { A.$('#r-e').innerHTML = '<div class="alert alert-danger py-2">اختر عدد النجوم</div>'; return; } try { await Api.call('me.rating.create', { Rating: Number(sel.value), Comment: A.$('#r-c').value }); rt.innerHTML = '<div class="rm-card">شكراً لتقييمك.</div>'; } catch (e) { A.$('#r-e').innerHTML = '<div class="alert alert-danger py-2">' + esc(Api.describe(e)) + '</div>'; } });
        } else if (s.rated) rt.innerHTML = '<div class="rm-card">شكراً، سبق أن قيّمت حملتك.</div>';
      } catch (e) { /* التقييم اختياري */ }
    }
    function draw() { clearInterval(timer); ({ home: home, sched: sched, ann: ann, help: help })[cur](); }
    draw();
  };
})();
