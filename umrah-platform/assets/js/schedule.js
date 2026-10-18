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
})();
