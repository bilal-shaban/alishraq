/** admin.js — فريق العمل، الإعدادات، التقارير. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt, H = A.crudHelpers;

  function staffRoles(ctx) {
    var r = ctx.schema.roles || {};
    return Object.keys(r).filter(function (k) { return k !== 'pilgrim' && k !== 'super_admin'; }).map(function (k) { return { v: k, l: r[k] }; });
  }

  /* ---------------- فريق العمل ---------------- */
  A.Pages.supervisors = async function (ctx) {
    var roles = staffRoles(ctx), rl = ctx.schema.roles || {};
    var canM = ctx.can('users.manage');
    var api;
    function formFields(mode) {
      var f = [
        { name: 'Display_Name', type: 'string', label: 'الاسم', required: true, max: 100 },
        { name: 'Email', type: 'email', label: 'البريد الإلكتروني', required: true, readonly: mode === 'edit' },
        { name: 'Role', type: 'enum', label: 'الدور', required: true, enumValues: roles.map(function (x) { return x.v; }), enumLabels: rl },
        { name: 'Phone', type: 'phone', label: 'الهاتف' }
      ];
      if (mode === 'edit') f.push({ name: 'Status', type: 'enum', label: 'الحالة', enumValues: ['active', 'disabled'], enumLabels: { active: 'فعّال', disabled: 'موقوف' } });
      return f;
    }
    function invite(r) {
      var i = r && r.invite; if (!i) return;
      A.modal({ title: 'تمت الدعوة', size: 'md', body: '<p>أُنشئ المستخدم بحالة <b>مدعو</b>. يسجّل الدخول من صفحة لدي دعوة من شركتي بنفس البريد ثم يمكنه ضبط كلمة مروره عبر «نسيت كلمة المرور»' + (i.hint ? ' — ' + esc(i.hint) : '') + '.</p><p class="small text-secondary mb-0">لا تُخزَّن كلمات المرور في المنصة ولا تُرسل لأحد.</p>', footer: '<button class="btn btn-gold" data-bs-dismiss="modal">حسناً</button>' });
    }
    api = await A.crud(ctx, {
      entity: 'users', nav: 'supervisors', title: 'فريق العمل', sub: 'المشرفون والموظفون وصلاحياتهم', noCreate: true,
      headExtra: canM ? '<button class="btn btn-gold" id="rm-inv">' + A.icon('plus', 'me-1') + ' دعوة موظف</button>' : '',
      searchPlaceholder: 'ابحث بالاسم أو البريد…', defaultSort: { sort: 'Created_At', dir: 'desc' },
      extra: function () { return {}; },
      filters: [{ key: 'Role', label: 'الدور', options: roles.concat([{ v: 'pilgrim', l: rl.pilgrim || 'معتمر' }]).map(function (x) { return { v: x.v, l: x.l }; }) }, { key: 'Status', label: 'الحالة', options: [{ v: 'active', l: 'فعّال' }, { v: 'invited', l: 'مدعو' }, { v: 'disabled', l: 'موقوف' }] }],
      columns: [
        { key: 'Display_Name', label: 'المستخدم', sort: true, render: function (r) { return '<b>' + esc(r.Display_Name) + '</b><div class="small text-secondary" dir="ltr" style="text-align:start">' + esc(r.Email) + '</div>'; } },
        { key: 'Role', label: 'الدور', render: function (r) { return esc(rl[r.Role] || r.Role); } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('users', 'Status', r.Status); } },
        { key: 'Last_Login_At', label: 'آخر دخول', hide: 'md', render: function (r) { return r.Last_Login_At ? '<span class="num small">' + Fmt.dateTime(r.Last_Login_At) + '</span>' : '—'; } }
      ],
      rowActions: function (r) {
        if (!canM || r.Role === 'pilgrim') return '';
        var me = r.Email && ctx.me.email && r.Email.toLowerCase() === ctx.me.email.toLowerCase();
        return H.btn('uedit', 'تعديل') + (r.Status === 'invited' ? H.btn('resend', 'إعادة الدعوة') : '') + (me ? '' : H.btn('udel', 'حذف', 'btn-danger-soft'));
      },
      onAction: async function (act, row) {
        if (act === 'uedit') return A.Form.open({ entity: 'users', mode: 'edit', title: 'تعديل مستخدم', size: 'md', values: row, fields: formFields('edit'), onSubmit: async function (v) { await Api.call('users.update', { User_ID: row.User_ID, values: v }); A.toast('تم الحفظ', 'ok'); api.reload(); } });
        if (act === 'resend') { try { invite(await Api.call('users.resendInvite', { User_ID: row.User_ID })); } catch (e) { A.toast(Api.describe(e), 'bad'); } return; }
        if (act === 'udel') {
          if (!await A.confirm({ title: 'حذف مستخدم', text: 'سيُسحب وصول «' + row.Display_Name + '» نهائياً.', danger: true, okLabel: 'حذف' })) return;
          try { await Api.call('users.delete', { User_ID: row.User_ID }); A.toast('تم الحذف', 'ok'); api.reload(); } catch (e) { A.toast(Api.describe(e), 'bad'); }
        }
      }
    });
    var b = A.$('#rm-inv');
    if (b) b.addEventListener('click', function () {
      A.Form.open({ entity: 'users', mode: 'create', title: 'دعوة موظف', size: 'md', fields: formFields('create'), values: { Role: 'booking_agent' }, onSubmit: async function (v) { var r = await Api.call('users.create', v); api.reload(); setTimeout(function () { invite(r); }, 350); } });
    });
  };

  /* ---------------- الإعدادات ---------------- */
  A.Pages.settings = async function (ctx) {
    var root = ctx.shell('settings', 'الإعدادات', 'هوية الشركة، التشغيل، تيليجرام، الصلاحيات، سجل التدقيق');
    var tabs = [['profile', 'الهوية'], ['ops', 'التشغيل'], ['tg', 'تيليجرام'], ['perms', 'الصلاحيات']];
    if (ctx.can('audit.read')) tabs.push(['audit', 'سجل التدقيق']);
    var cur = A.qs('tab') || 'profile'; if (!tabs.some(function (t) { return t[0] === cur; })) cur = 'profile';
    var S;
    try { S = await Api.call('settings.get', {}); } catch (e) { root.innerHTML = A.errBox(e); return; }
    var canW = ctx.can('settings.write');
    root.innerHTML = '<ul class="nav nav-tabs mb-3" role="tablist">' + tabs.map(function (t) { return '<li class="nav-item"><button class="nav-link' + (t[0] === cur ? ' active' : '') + '" data-tab="' + t[0] + '" role="tab">' + t[1] + '</button></li>'; }).join('') + '</ul><div id="rm-tab"></div>';
    var body = A.$('#rm-tab');
    root.addEventListener('click', function (ev) { var b = ev.target.closest('[data-tab]'); if (!b) return; cur = b.getAttribute('data-tab'); A.$$('[data-tab]', root).forEach(function (x) { x.classList.toggle('active', x === b); }); draw(); });
    function field(id, label, val, o) { o = o || {}; return '<div class="' + (o.col || 'col-md-6') + '"><label class="form-label" for="' + id + '">' + label + '</label><input id="' + id + '" class="form-control' + (o.cls || '') + '" ' + (o.type ? 'type="' + o.type + '" ' : '') + (o.dir ? 'dir="' + o.dir + '" ' : '') + 'value="' + esc(val === undefined || val === null ? '' : val) + '"' + (canW ? '' : ' disabled') + (o.attr || '') + '>' + (o.hint ? '<div class="form-text">' + o.hint + '</div>' : '') + '</div>'; }
    function msg(id, ok, t) { var el = A.$(id); if (el) el.innerHTML = '<div class="alert alert-' + (ok ? 'success' : 'danger') + ' py-2 mb-0">' + esc(t) + '</div>'; }

    function drawProfile() {
      var p = S.profile;
      body.innerHTML = '<div class="rm-card"><form id="pf"><div class="row g-3">' +
        field('p-name', 'اسم الشركة', p.company_name) + field('p-logo', 'رابط الشعار (https)', p.logo_url, { dir: 'ltr' }) +
        field('p-c1', 'اللون الأساسي', (p.brand_primary || '#0F3D2E'), { type: 'color', cls: ' form-control-color w-100' }) + field('p-c2', 'اللون الثانوي', (p.brand_accent || '#C9A24B'), { type: 'color', cls: ' form-control-color w-100' }) +
        field('p-ph', 'هاتف التواصل', p.contact_phone, { dir: 'ltr' }) + field('p-em', 'بريد التواصل', p.contact_email, { dir: 'ltr', type: 'email' }) +
        field('p-tz', 'المنطقة الزمنية', p.timezone, { dir: 'ltr', hint: 'مثل Asia/Riyadh — تُحسب بها حالة «جارٍ الآن»' }) + field('p-cur', 'العملة الافتراضية', p.currency, { dir: 'ltr', hint: 'رمز من 3 أحرف مثل SAR' }) +
        '</div><div id="pf-msg" class="mt-3"></div>' + (canW ? '<button class="btn btn-gold mt-3" type="submit">حفظ</button>' : '') + '</form></div>';
      A.$('#pf').addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var v = { company_name: A.$('#p-name').value, logo_url: A.$('#p-logo').value, brand_primary: A.$('#p-c1').value, brand_accent: A.$('#p-c2').value, contact_phone: A.$('#p-ph').value, contact_email: A.$('#p-em').value, timezone: A.$('#p-tz').value, currency: A.$('#p-cur').value };
        try { await Api.call('settings.profile.set', { values: v }); Object.assign(S.profile, v); msg('#pf-msg', true, 'تم الحفظ. أعد تحميل الصفحة ليظهر الاسم والألوان الجديدة.'); } catch (e) { msg('#pf-msg', false, Api.describe(e)); }
      });
    }
    function drawOps() {
      var o = S.operational;
      body.innerHTML = '<div class="rm-card"><form id="of"><div class="row g-3">' +
        field('o-min', 'مدة النشاط الافتراضية (دقيقة)', o.default_activity_minutes, { type: 'number', hint: 'تُستخدم عند غياب وقت النهاية لحساب «جارٍ الآن»' }) + field('o-pre', 'بادئة رمز المعتمر', o.code_prefix, { dir: 'ltr' }) +
        '<div class="col-12"><label class="form-label" for="o-wel">رسالة الترحيب في بوابة المعتمر</label><textarea id="o-wel" class="form-control" rows="3" maxlength="500"' + (canW ? '' : ' disabled') + '>' + esc(o.portal_welcome || '') + '</textarea></div>' +
        '<div class="col-md-6"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="o-hide"' + (o.hide_ended_activities ? ' checked' : '') + (canW ? '' : ' disabled') + '><label class="form-check-label" for="o-hide">إخفاء الأنشطة المنتهية عن المعتمرين</label></div></div>' +
        '<div class="col-md-6"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="o-edit"' + (o.pilgrim_can_edit_contact ? ' checked' : '') + (canW ? '' : ' disabled') + '><label class="form-check-label" for="o-edit">السماح للمعتمر بتعديل هاتفه وجهة الطوارئ</label></div></div>' +
        '</div><div id="of-msg" class="mt-3"></div>' + (canW ? '<button class="btn btn-gold mt-3" type="submit">حفظ</button>' : '') + '</form></div>';
      A.$('#of').addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var v = { default_activity_minutes: Number(A.$('#o-min').value), code_prefix: A.$('#o-pre').value, portal_welcome: A.$('#o-wel').value, hide_ended_activities: A.$('#o-hide').checked, pilgrim_can_edit_contact: A.$('#o-edit').checked };
        try { await Api.call('settings.set', { values: v }); Object.assign(S.operational, v); msg('#of-msg', true, 'تم الحفظ'); } catch (e) { msg('#of-msg', false, (e.details && e.details.fields ? Object.keys(e.details.fields).map(function (k) { return e.details.fields[k]; }).join('، ') : '') || Api.describe(e)); }
      });
    }
    function drawTg() {
      var t = S.telegram, ev = t.events;
      body.innerHTML = '<div class="rm-card"><div class="alert ' + (t.bot_configured ? 'alert-success' : 'alert-warning') + ' py-2">' + (t.bot_configured ? 'بوت المنصة مضبوط على الخادم.' : 'لم يُضبط توكن بوت المنصة بعد (Script Property). الإشعارات لن تُرسل إلى أن يضبطه مدير المنصة.') + '</div>' +
        '<p class="small text-secondary">لا تُرسل المنصة كلمات مرور أو أسراراً أو بيانات جوازات أو تفاصيل دفع عبر تيليجرام. وفشل الإرسال لا يمنع حفظ أي عملية.</p>' +
        '<form id="tf"><label class="form-label" for="t-ids">معرّفات المحادثات / القنوات</label><input id="t-ids" class="form-control mb-1" dir="ltr" value="' + esc(t.chat_ids || '') + '" placeholder="-1001234567890,@my_channel"' + (canW ? '' : ' disabled') + '><div class="form-text mb-3">أضف البوت مشرفاً في المجموعة أو القناة ثم ضع معرّفها هنا (حتى 10، مفصولة بفواصل).</div>' +
        '<div class="fw-bold mb-2">الأحداث المرسلة</div><div class="row g-2">' + Object.keys(ev).map(function (k) { return '<div class="col-md-6"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" data-ev="' + esc(k) + '" id="ev-' + esc(k) + '"' + (ev[k].enabled ? ' checked' : '') + (canW ? '' : ' disabled') + '><label class="form-check-label" for="ev-' + esc(k) + '">' + esc(ev[k].label) + '</label></div></div>'; }).join('') + '</div>' +
        '<div id="tf-msg" class="mt-3"></div>' + (canW ? '<div class="d-flex gap-2 mt-3"><button class="btn btn-gold" type="submit">حفظ</button><button class="btn btn-ghost" type="button" id="t-test">إرسال رسالة اختبار</button></div>' : '') + '</form></div>';
      A.$('#tf').addEventListener('submit', async function (e) {
        e.preventDefault(); var evs = {}; A.$$('[data-ev]', body).forEach(function (c) { evs[c.getAttribute('data-ev')] = c.checked; });
        try { await Api.call('settings.set', { values: { telegram_chat_ids: A.$('#t-ids').value, telegram_events: evs } }); t.chat_ids = A.$('#t-ids').value; Object.keys(evs).forEach(function (k) { ev[k].enabled = evs[k]; }); msg('#tf-msg', true, 'تم الحفظ'); } catch (er) { msg('#tf-msg', false, (er.details && er.details.fields ? Object.keys(er.details.fields).map(function (k) { return er.details.fields[k]; }).join('، ') : '') || Api.describe(er)); }
      });
      var tb = A.$('#t-test'); if (tb) tb.addEventListener('click', async function () { tb.disabled = true; try { var r = await Api.call('telegram.test', {}); msg('#tf-msg', r.ok !== false, r.message || 'أُرسلت رسالة الاختبار'); } catch (er) { msg('#tf-msg', false, Api.describe(er)); } tb.disabled = false; });
    }
    async function drawPerms() {
      body.innerHTML = A.skeleton(3); var P;
      try { P = await Api.call('settings.rolePermissions.get', {}); } catch (e) { body.innerHTML = A.errBox(e); return; }
      body.innerHTML = '<div class="rm-card"><p class="text-secondary small">يحدد مدير الشركة ما يستطيع كل دور فعله ضمن حدّ أقصى مقفل من المنصة. الإخفاء في الواجهة ليس حماية — الخادم يتحقق من كل طلب.</p><div class="accordion" id="pm">' + P.roles.map(function (r, i) {
        return '<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button' + (i ? ' collapsed' : '') + '" data-bs-toggle="collapse" data-bs-target="#pm' + i + '">' + esc(r.label) + '<span class="badge text-bg-secondary ms-2 num">' + r.effective.length + '</span></button></h2><div id="pm' + i + '" class="accordion-collapse collapse' + (i ? '' : ' show') + '" data-bs-parent="#pm"><div class="accordion-body"><div class="row g-2">' +
          r.ceiling.map(function (p) { return '<div class="col-md-6"><div class="form-check"><input class="form-check-input" type="checkbox" data-role="' + esc(r.role) + '" value="' + esc(p) + '" id="pp-' + i + '-' + esc(p) + '"' + (r.effective.indexOf(p) !== -1 ? ' checked' : '') + (canW ? '' : ' disabled') + '><label class="form-check-label" for="pp-' + i + '-' + esc(p) + '">' + esc(P.perm_labels[p] || p) + (r.defaults.indexOf(p) === -1 ? ' <span class="rm-badge info">إضافة</span>' : '') + '</label></div></div>'; }).join('') +
          '</div><div class="mt-3 d-flex gap-2 align-items-center">' + (canW ? '<button class="btn btn-gold btn-sm" data-save="' + esc(r.role) + '">حفظ صلاحيات ' + esc(r.label) + '</button>' : '') + '<span class="small" data-pmsg="' + esc(r.role) + '"></span></div></div></div></div>';
      }).join('') + '</div></div>';
      body.addEventListener('click', async function (ev) {
        var b = ev.target.closest('[data-save]'); if (!b) return; var role = b.getAttribute('data-save');
        var perms = A.$$('[data-role="' + role + '"]:checked', body).map(function (c) { return c.value; });
        var m = A.$('[data-pmsg="' + role + '"]', body);
        try { await Api.call('settings.rolePermissions.set', { role: role, permissions: perms }); m.textContent = 'تم الحفظ'; m.className = 'small text-success'; } catch (e) { m.textContent = Api.describe(e); m.className = 'small text-danger'; }
      });
    }
    async function drawAudit() {
      body.innerHTML = '<div class="rm-card"><div id="au"></div></div>'; var page = 1, q = '';
      async function load() {
        var box = A.$('#au'); box.innerHTML = A.skeleton(3);
        try {
          var r = await Api.call('audit.list', { page: page, limit: 25, q: q });
          box.innerHTML = '<div class="rm-toolbar"><div class="search"><input type="search" class="form-control" placeholder="بحث في السجل…" value="' + esc(q) + '" id="au-q"></div></div>' +
            (r.items.length ? '<div class="rm-table-wrap"><table class="rm-table"><thead><tr><th>الوقت</th><th>المستخدم</th><th>العملية</th><th>التفاصيل</th></tr></thead><tbody>' + r.items.map(function (x) { return '<tr><td data-l="الوقت" class="num small">' + Fmt.dateTime(x.Timestamp) + '</td><td data-l="المستخدم" class="small" dir="ltr" style="text-align:start">' + esc(x.Actor_Email) + '</td><td data-l="العملية">' + esc(x.Action) + ' · ' + esc(x.Entity) + '</td><td data-l="التفاصيل" class="small">' + esc(x.Summary) + '</td></tr>'; }).join('') + '</tbody></table></div>' : A.emptyBox('لا سجلات', '')) +
            '<div class="d-flex justify-content-between align-items-center mt-3"><span class="small text-secondary">' + Fmt.num(r.total) + ' سجلاً</span><div class="d-flex gap-2"><button class="btn btn-sm btn-ghost" id="au-p"' + (page <= 1 ? ' disabled' : '') + '>السابق</button><button class="btn btn-sm btn-ghost" id="au-n"' + (page * 25 >= r.total ? ' disabled' : '') + '>التالي</button></div></div>';
          A.$('#au-q').addEventListener('change', function () { q = this.value; page = 1; load(); });
          A.$('#au-p').addEventListener('click', function () { page--; load(); }); A.$('#au-n').addEventListener('click', function () { page++; load(); });
        } catch (e) { box.innerHTML = A.errBox(e); }
      }
      load();
    }
    function draw() { ({ profile: drawProfile, ops: drawOps, tg: drawTg, perms: drawPerms, audit: drawAudit })[cur](); }
    draw();
  };

  /* ---------------- التقارير ---------------- */
  A.Pages.reports = async function (ctx) {
    var root = ctx.shell('reports', 'التقارير', 'الأرقام مبنية على ما يُسجَّل يدوياً في المنصة');
    var fin = ctx.can('reports.financial'), h = '';
    if (fin) h += '<div class="rm-card mb-3"><div class="rm-card-head"><h2>التقرير المالي</h2><div class="d-flex gap-2 flex-wrap"><input type="date" id="r-from" class="form-control form-control-sm w-auto" aria-label="من"><input type="date" id="r-to" class="form-control form-control-sm w-auto" aria-label="إلى"><button class="btn btn-sm btn-ghost" id="r-go">تطبيق</button></div></div><div id="r-fin">' + A.skeleton(2) + '</div></div>';
    h += '<div class="rm-card"><div class="rm-card-head"><h2>التشغيل</h2>' + (ctx.can('pilgrims.export') ? '<button class="btn btn-sm btn-ghost" id="r-exp">تصدير المعتمرين CSV</button>' : '') + '</div><div id="r-ops">' + A.skeleton(2) + '</div></div>';
    root.innerHTML = h;
    function money(n, c) { return '<span class="num">' + Fmt.num(n) + '</span> <small>' + esc(c) + '</small>'; }
    async function loadFin() {
      var box = A.$('#r-fin'); if (!box) return;
      try {
        var r = await Api.call('reports.financial', { from: A.$('#r-from').value || undefined, to: A.$('#r-to').value || undefined });
        var cs = Object.keys(r.by_currency);
        box.innerHTML = '<p class="small text-secondary">' + esc(r.note) + '</p>' + (cs.length ? '<div class="row g-3 mb-3">' + cs.map(function (c) { var s = r.by_currency[c]; return '<div class="col-lg-6"><div class="rm-stat"><div class="k">' + esc(c) + ' — الصافي</div><div class="v">' + money(s.net, c) + '</div><div class="s">دفعات ' + Fmt.num(s.revenue) + ' · مصاريف ' + Fmt.num(s.expenses) + ' · متوقع ' + Fmt.num(s.expected) + ' · متبقٍ ' + Fmt.num(s.outstanding) + '</div></div></div>'; }).join('') + '</div>' : A.emptyBox('لا بيانات مالية في هذه الفترة', '')) +
          (r.by_campaign.length ? '<div class="rm-table-wrap"><table class="rm-table"><thead><tr><th>الحملة</th><th>الدفعات</th><th>المصاريف</th><th>المتوقع</th></tr></thead><tbody>' + r.by_campaign.map(function (x) { return '<tr><td data-l="الحملة">' + esc(x.Campaign_Name) + '</td><td data-l="الدفعات">' + money(x.revenue, x.Currency) + '</td><td data-l="المصاريف">' + money(x.expenses, x.Currency) + '</td><td data-l="المتوقع">' + money(x.expected, x.Currency) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '');
      } catch (e) { box.innerHTML = A.errBox(e); }
    }
    if (fin) { loadFin(); A.$('#r-go').addEventListener('click', loadFin); }
    try {
      var o = await Api.call('reports.operations', {});
      var P = o.pilgrims || {}, st = '<div class="row g-3 mb-3">' +
        [['المعتمرون', P.total], ['بلا حجز', P.without_booking], ['بلا غرفة في مكة', P.without_makkah_room], ['بلا غرفة في المدينة', P.without_madinah_room]].map(function (x) { return '<div class="col-6 col-lg-3"><div class="rm-stat"><div class="k">' + x[0] + '</div><div class="v num">' + Fmt.num(x[1] || 0) + '</div></div></div>'; }).join('') + '</div>';
      if (o.rooms) st += '<p>الغرف: <b class="num">' + Fmt.num(o.rooms.occupied) + '</b> مشغولة من <b class="num">' + Fmt.num(o.rooms.capacity) + '</b> سريراً (' + Fmt.num(o.rooms.free) + ' شاغر).</p>';
      st += '<div class="rm-table-wrap"><table class="rm-table"><thead><tr><th>الحملة</th><th>السعة</th><th>المحجوز</th><th>المتاح</th><th>الحالة</th></tr></thead><tbody>' + (o.campaigns || []).map(function (c) { return '<tr><td data-l="الحملة">' + esc(c.Campaign_Name) + '</td><td data-l="السعة" class="num">' + Fmt.num(c.Capacity) + '</td><td data-l="المحجوز" class="num">' + Fmt.num(c.booked) + '</td><td data-l="المتاح" class="num">' + Fmt.num(c.Available_Spaces) + '</td><td data-l="الحالة">' + A.badge('campaigns', 'Status', c.Status) + '</td></tr>'; }).join('') + '</tbody></table></div>';
      A.$('#r-ops').innerHTML = st;
    } catch (e) { A.$('#r-ops').innerHTML = A.errBox(e); }
    var ex = A.$('#r-exp'); if (ex) ex.addEventListener('click', function () { A.exportCsv('pilgrims'); });
  };
})();
