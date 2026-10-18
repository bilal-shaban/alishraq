/** platform.js — لوحة مالك المنصة: الشركات، الطلبات، الحالة، السجلات، الإعدادات. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt;
  var STATUS = { active: ['ok', 'فعّالة'], suspended: ['bad', 'معلّقة'], pending: ['warn', 'قيد التهيئة'] };
  var INIT = { ready: ['ok', 'جاهزة'], failed: ['bad', 'فشلت'], pending: ['warn', 'قيد التهيئة'] };
  function pill(m, v) { var x = m[v] || ['mute', v || '—']; return '<span class="rm-badge ' + x[0] + '">' + esc(x[1]) + '</span>'; }

  A.Pages.platformAdmin = async function (ctx) {
    var root = ctx.shell('platform', 'إدارة المنصة', 'الشركات والطلبات وسلامة الخدمات');
    var tabs = [['over', 'نظرة عامة'], ['companies', 'الشركات'], ['requests', 'طلبات الإنشاء'], ['logs', 'السجلات'], ['settings', 'إعدادات المنصة']];
    var cur = A.qs('tab') || 'over';
    root.innerHTML = '<ul class="nav nav-tabs mb-3">' + tabs.map(function (t) { return '<li class="nav-item"><button class="nav-link' + (t[0] === cur ? ' active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button></li>'; }).join('') + '</ul><div id="pl-body"></div>';
    var body = A.$('#pl-body');
    root.addEventListener('click', function (ev) { var b = ev.target.closest('[data-tab]'); if (!b) return; cur = b.getAttribute('data-tab'); A.$$('[data-tab]', root).forEach(function (x) { x.classList.toggle('active', x === b); }); draw(); });

    function money() { return ''; }
    async function over() {
      body.innerHTML = A.skeleton(4); var s, st;
      try { s = await Api.call('platform.stats', {}); st = await Api.call('platform.status', {}); } catch (e) { body.innerHTML = A.errBox(e); return; }
      var c = s.companies, t = s.totals;
      function stat(k, v, sub) { return '<div class="col-6 col-lg-3"><div class="rm-stat"><div class="k">' + k + '</div><div class="v num">' + Fmt.num(v) + '</div><div class="s">' + (sub || '') + '</div></div></div>'; }
      body.innerHTML = '<div class="row g-3 mb-4">' + stat('الشركات', c.total, Fmt.num(c.active) + ' فعّالة · ' + Fmt.num(c.suspended) + ' معلّقة') + stat('طلبات جديدة', s.requests_new, 'بانتظار القرار') + stat('المعتمرون', t.pilgrims, 'في كل الشركات') + stat('تهيئة فاشلة', c.failed, c.failed ? 'تحتاج إعادة محاولة' : 'لا شيء') + '</div>' +
        '<div class="row g-3"><div class="col-lg-6"><div class="rm-card h-100"><div class="rm-card-head"><h2>سلامة الخدمات</h2><span class="rm-badge ' + (st.ok ? 'ok' : 'warn') + '">' + (st.ok ? 'سليمة' : 'تحتاج انتباهاً') + '</span></div><ul class="rm-list">' +
        st.checks.map(function (k) { return '<li><span class="rm-badge ' + (k.ok ? 'ok' : 'bad') + '">' + (k.ok ? 'سليم' : 'خلل') + '</span><div class="flex-grow-1"><b>' + esc(k.name) + '</b><div class="small text-secondary">' + esc(k.detail) + '</div></div></li>'; }).join('') + '</ul><div class="mt-3 d-flex gap-2"><button class="btn btn-sm btn-ghost" id="pl-tg">اختبار تيليجرام</button><span class="small" id="pl-tgm"></span></div><p class="small text-secondary mt-2 mb-0">الإصدار ' + esc(st.app.version) + ' — الفحص هنا لا يتصل بالخدمات الخارجية؛ الاختبار العميق من محرر Apps Script (getSystemStatus).</p></div></div>' +
        '<div class="col-lg-6"><div class="rm-card h-100"><div class="rm-card-head"><h2>آخر الأخطاء</h2></div>' + (s.last_errors.length ? '<ul class="rm-list">' + s.last_errors.map(function (e) { return '<li><div class="flex-grow-1"><b>' + esc(e.Service) + ' · ' + esc(e.Operation) + '</b><div class="small text-secondary">' + esc(e.Details) + '</div></div><span class="num small">' + Fmt.dateTime(e.Timestamp) + '</span></li>'; }).join('') + '</ul>' : A.emptyBox('لا أخطاء مسجلة', '')) + '</div></div></div>';
      A.$('#pl-tg').addEventListener('click', async function () { var m = A.$('#pl-tgm'); try { var r = await Api.call('platform.testTelegram', {}); m.textContent = r.message || 'تم'; m.className = 'small text-success'; } catch (e) { m.textContent = Api.describe(e); m.className = 'small text-danger'; } });
    }

    function companyForm(row) {
      var edit = !!row;
      var f = [
        { name: 'Company_Name', type: 'string', label: 'اسم الشركة', required: true, max: 120 },
        { name: 'Slug', type: 'string', label: 'الرابط المختصر', required: true, hint: 'أحرف إنجليزية صغيرة وأرقام وشرطة' }
      ];
      if (!edit) f.push({ name: 'Admin_Name', type: 'string', label: 'اسم مدير الشركة', required: true }, { name: 'Admin_Email', type: 'email', label: 'بريد مدير الشركة', required: true });
      f.push({ name: 'Country', type: 'string', label: 'الدولة' }, { name: 'Contact_Phone', type: 'phone', label: 'هاتف التواصل' }, { name: 'Contact_Email', type: 'email', label: 'بريد التواصل' },
        { name: 'Timezone', type: 'string', label: 'المنطقة الزمنية', hint: 'مثل Asia/Riyadh' }, { name: 'Currency', type: 'string', label: 'العملة', hint: 'SAR' },
        { name: 'Plan', type: 'enum', label: 'الباقة', enumValues: ['trial', 'standard', 'pro'], enumLabels: { trial: 'تجريبية', standard: 'قياسية', pro: 'احترافية' } });
      return f;
    }
    async function companies() {
      body.innerHTML = '<div class="rm-card"><div class="rm-toolbar"><div class="search"><input type="search" class="form-control" id="cq" placeholder="ابحث بالاسم أو الرابط…"></div><div class="ms-auto"><button class="btn btn-gold" id="c-new">' + A.icon('plus', 'me-1') + ' شركة جديدة</button></div></div><div id="cl">' + A.skeleton(3) + '</div></div>';
      async function load() {
        var q = A.$('#cq').value, box = A.$('#cl');
        try {
          var r = await Api.call('companies.list', { q: q });
          box.innerHTML = r.items.length ? '<div class="rm-table-wrap"><table class="rm-table"><thead><tr><th>الشركة</th><th>الحالة</th><th>التهيئة</th><th>الباقة</th><th></th></tr></thead><tbody>' + r.items.map(function (c) {
            return '<tr><td data-l="الشركة"><b>' + esc(c.Company_Name) + '</b><div class="small text-secondary" dir="ltr" style="text-align:start">' + esc(c.Slug) + '</div></td><td data-l="الحالة">' + pill(STATUS, c.Status) + '</td><td data-l="التهيئة">' + pill(INIT, c.Init_Status) + (c.Init_Error ? '<div class="small text-danger">' + esc(String(c.Init_Error).slice(0, 80)) + '</div>' : '') + '</td><td data-l="الباقة">' + esc(c.Plan || '') + '</td><td class="text-end" data-id="' + esc(c.Company_ID) + '">' +
              '<button class="btn btn-sm btn-ghost" data-a="edit">تعديل</button> ' + (c.Init_Status !== 'ready' ? '<button class="btn btn-sm btn-gold" data-a="retry">إعادة التهيئة</button> ' : '<button class="btn btn-sm btn-ghost" data-a="repair">فحص/إصلاح الأوراق</button> ') +
              (c.Status === 'active' ? '<button class="btn btn-sm btn-danger-soft" data-a="suspend">تعليق</button>' : (c.Init_Status === 'ready' ? '<button class="btn btn-sm btn-ghost" data-a="activate">تفعيل</button>' : '')) + '</td></tr>';
          }).join('') + '</tbody></table></div>' : A.emptyBox('لا شركات', 'أنشئ أول شركة أو وافق على طلب.');
          box._items = r.items;
        } catch (e) { box.innerHTML = A.errBox(e); }
      }
      load();
      A.$('#cq').addEventListener('input', A.debounce(load, 300));
      A.$('#c-new').addEventListener('click', function () {
        A.Form.open({ entity: 'companies', mode: 'create', title: 'شركة جديدة', size: 'lg', fields: companyForm(null), values: { Timezone: 'Asia/Riyadh', Currency: 'SAR', Plan: 'trial' },
          onSubmit: async function (v) { var r = await Api.call('companies.create', Object.assign({ Request_ID: 'UI-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }, v)); A.toast(r.company && r.company.Init_Status === 'ready' ? 'أُنشئت الشركة وجُهّز ملفها' : 'أُنشئت الشركة لكن التهيئة لم تكتمل — أعد المحاولة', r.company && r.company.Init_Status === 'ready' ? 'ok' : 'warn'); load(); } });
      });
      body.onclick = async function (ev) {
        var b = ev.target.closest('[data-a]'); if (!b) return; var id = b.closest('[data-id]').getAttribute('data-id'), a = b.getAttribute('data-a');
        var row = (A.$('#cl')._items || []).filter(function (x) { return x.Company_ID === id; })[0];
        try {
          if (a === 'edit') return A.Form.open({ entity: 'companies', mode: 'edit', title: 'تعديل شركة', fields: companyForm(row), values: row, onSubmit: async function (v) { v.Company_ID = id; await Api.call('companies.update', v); A.toast('تم الحفظ', 'ok'); load(); } });
          if (a === 'retry') { b.disabled = true; await Api.call('companies.retryInit', { Company_ID: id }); A.toast('تمت المحاولة', 'ok'); }
          if (a === 'repair') { var r = await Api.call('companies.repairSheets', { Company_ID: id }); A.toast('اكتمل الفحص — لا تُحذف أي بيانات', 'ok'); }
          if (a === 'suspend') { if (!await A.confirm({ title: 'تعليق الشركة', text: 'لن يتمكن مستخدموها من الدخول إلى أن تُفعَّل من جديد.', danger: true, okLabel: 'تعليق' })) return; await Api.call('companies.setStatus', { Company_ID: id, Status: 'suspended' }); A.toast('عُلّقت الشركة', 'ok'); }
          if (a === 'activate') { await Api.call('companies.setStatus', { Company_ID: id, Status: 'active' }); A.toast('فُعّلت الشركة', 'ok'); }
          load();
        } catch (e) { A.toast(Api.describe(e), 'bad'); b.disabled = false; }
      };
    }

    async function requests() {
      body.innerHTML = '<div class="rm-card"><div id="rq">' + A.skeleton(3) + '</div></div>';
      async function load() {
        var box = A.$('#rq');
        try {
          var r = await Api.call('platform.requests.list', {});
          box.innerHTML = r.items.length ? '<div class="rm-table-wrap"><table class="rm-table"><thead><tr><th>الشركة</th><th>المسؤول</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead><tbody>' + r.items.map(function (x) {
            return '<tr><td data-l="الشركة"><b>' + esc(x.Company_Name) + '</b><div class="small text-secondary">' + esc(x.Country || '') + '</div></td><td data-l="المسؤول">' + esc(x.Contact_Name) + '<div class="small text-secondary" dir="ltr" style="text-align:start">' + esc(x.Email) + '</div></td><td data-l="التاريخ" class="num small">' + Fmt.dateTime(x.Created_At) + '</td><td data-l="الحالة">' + pill({ new: ['warn', 'جديد'], approved: ['ok', 'مقبول'], rejected: ['bad', 'مرفوض'] }, x.Status) + '</td><td class="text-end" data-id="' + esc(x.Request_ID) + '">' + (x.Status === 'new' ? '<button class="btn btn-sm btn-gold" data-a="approve">قبول</button> <button class="btn btn-sm btn-danger-soft" data-a="reject">رفض</button>' : '') + '</td></tr>';
          }).join('') + '</tbody></table></div>' : A.emptyBox('لا طلبات', 'ستظهر هنا طلبات الشركات من صفحة التسجيل.');
        } catch (e) { box.innerHTML = A.errBox(e); }
      }
      load();
      body.onclick = async function (ev) {
        var b = ev.target.closest('[data-a]'); if (!b) return; var id = b.closest('[data-id]').getAttribute('data-id'), a = b.getAttribute('data-a');
        if (a === 'reject') { if (!await A.confirm({ title: 'رفض الطلب', text: 'سيُغلق الطلب.', danger: true, okLabel: 'رفض' })) return; try { await Api.call('platform.requests.handle', { Request_ID: id, decision: 'reject' }); A.toast('رُفض الطلب', 'ok'); load(); } catch (e) { A.toast(Api.describe(e), 'bad'); } return; }
        A.Form.open({ entity: 'companies', mode: 'create', title: 'قبول الطلب وإنشاء الشركة', size: 'md', fields: [
          { name: 'Slug', type: 'string', label: 'الرابط المختصر', required: true, hint: 'أحرف إنجليزية صغيرة وأرقام وشرطة' },
          { name: 'Timezone', type: 'string', label: 'المنطقة الزمنية' }, { name: 'Currency', type: 'string', label: 'العملة' }], values: { Timezone: 'Asia/Riyadh', Currency: 'SAR' }, submitLabel: 'قبول وإنشاء',
          onSubmit: async function (v) { await Api.call('platform.requests.handle', { Request_ID: id, decision: 'approve', Slug: v.Slug, Timezone: v.Timezone, Currency: v.Currency }); A.toast('أُنشئت الشركة', 'ok'); load(); } });
      };
    }

    async function logs() {
      body.innerHTML = '<div class="rm-card"><div class="rm-toolbar"><select class="form-select w-auto" id="lk"><option value="audit">سجل التدقيق</option><option value="integration">سجل التكاملات</option></select></div><div id="lg">' + A.skeleton(3) + '</div></div>';
      async function load() {
        var box = A.$('#lg'), kind = A.$('#lk').value;
        try {
          var r = await Api.call('platform.logs', { kind: kind, limit: 50 });
          box.innerHTML = r.items.length ? '<div class="rm-table-wrap"><table class="rm-table"><thead><tr><th>الوقت</th><th>' + (kind === 'audit' ? 'المستخدم' : 'الخدمة') + '</th><th>العملية</th><th>التفاصيل</th></tr></thead><tbody>' + r.items.map(function (x) {
            return kind === 'audit' ? '<tr><td data-l="الوقت" class="num small">' + Fmt.dateTime(x.Timestamp) + '</td><td data-l="المستخدم" class="small" dir="ltr" style="text-align:start">' + esc(x.Actor_Email) + '</td><td data-l="العملية">' + esc(x.Action) + '</td><td data-l="التفاصيل" class="small">' + esc(x.Summary) + '</td></tr>'
              : '<tr><td data-l="الوقت" class="num small">' + Fmt.dateTime(x.Timestamp) + '</td><td data-l="الخدمة">' + esc(x.Service) + '</td><td data-l="العملية">' + esc(x.Operation) + ' <span class="rm-badge ' + (x.Status === 'failed' ? 'bad' : 'ok') + '">' + esc(x.Status) + '</span></td><td data-l="التفاصيل" class="small">' + esc(x.Details) + '</td></tr>';
          }).join('') + '</tbody></table></div>' : A.emptyBox('لا سجلات', '');
        } catch (e) { box.innerHTML = A.errBox(e); }
      }
      load(); A.$('#lk').addEventListener('change', load);
    }

    async function settings() {
      body.innerHTML = A.skeleton(2); var S;
      try { S = await Api.call('platform.settings.get', {}); } catch (e) { body.innerHTML = A.errBox(e); return; }
      var v = S.values || {};
      body.innerHTML = '<div class="rm-card"><form id="ps"><div class="row g-3"><div class="col-12"><label class="form-label" for="ps-tg">معرّفات محادثات إشعارات المنصة (تيليجرام)</label><input id="ps-tg" class="form-control" dir="ltr" value="' + esc(v.telegram_admin_chat_ids || '') + '"></div><div class="col-md-6"><label class="form-label" for="ps-tz">المنطقة الزمنية الافتراضية</label><input id="ps-tz" class="form-control" dir="ltr" value="' + esc(v.default_timezone || '') + '"></div><div class="col-md-6"><label class="form-label" for="ps-cur">العملة الافتراضية</label><input id="ps-cur" class="form-control" dir="ltr" value="' + esc(v.default_currency || '') + '"></div></div><div id="ps-m" class="mt-3"></div><button class="btn btn-gold mt-3" type="submit">حفظ</button></form><p class="small text-secondary mt-3 mb-0">توكن البوت ومفاتيح الخدمات تُضبط في Script Properties فقط ولا تظهر هنا.</p></div>';
      A.$('#ps').addEventListener('submit', async function (ev) {
        ev.preventDefault(); var m = A.$('#ps-m');
        try { await Api.call('platform.settings.set', { values: { telegram_admin_chat_ids: A.$('#ps-tg').value, default_timezone: A.$('#ps-tz').value, default_currency: A.$('#ps-cur').value } }); m.innerHTML = '<div class="alert alert-success py-2 mb-0">تم الحفظ</div>'; } catch (e) { m.innerHTML = '<div class="alert alert-danger py-2 mb-0">' + esc(Api.describe(e)) + '</div>'; }
      });
    }
    function draw() { body.onclick = null; ({ over: over, companies: companies, requests: requests, logs: logs, settings: settings })[cur](); }
    draw();
  };
})();
