/** notifications.js — طلبات المساعدة والتقييمات (التفاعل مع المعتمرين). */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt, H = A.crudHelpers;

  A.Pages.inquiries = async function (ctx) {
    var st = ctx.schema.entities.inquiries.fields.filter(function (f) { return f.name === 'Status'; })[0];
    await A.crud(ctx, {
      entity: 'inquiries', nav: 'inquiries', title: 'طلبات المساعدة', sub: 'ما يرسله المعتمرون من بوابتهم', noCreate: true,
      searchPlaceholder: 'ابحث في الاسم أو الرسالة…', defaultSort: { sort: 'Created_At', dir: 'desc' },
      filters: [{ key: 'Status', label: 'الحالة', options: st.enumValues.map(function (v) { return { v: v, l: st.enumLabels[v] }; }) }],
      columns: function () {
        var c = [
          { key: 'Created_At', label: 'الوقت', sort: true, render: function (r) { return '<span class="num small">' + Fmt.dateTime(r.Created_At) + '</span>'; } },
          { key: 'Name', label: 'المعتمر', render: function (r) { return esc(r.Name) + (r.Phone ? '<div class="small text-secondary num">' + esc(r.Phone) + '</div>' : ''); } },
          { key: 'Message', label: 'الرسالة', render: function (r) { return esc((r.Message || '').slice(0, 110)) + (r.Message && r.Message.length > 110 ? '…' : '') + (r.Response ? '<div class="small mt-1" style="color:var(--rm-gold-bright)">ردّ: ' + esc(r.Response.slice(0, 80)) + '</div>' : ''); } },
          { key: 'Priority', label: 'الأولوية', hide: 'md', render: function (r) { return A.badge('inquiries', 'Priority', r.Priority); } },
          { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('inquiries', 'Status', r.Status); } }];
        return c;
      },
      canDelete: function () { return false; },
      fieldsFor: function (c, mode, row) {
        var f = A.Form.fieldsFor('inquiries', 'edit', ['Priority', 'Status', 'Assigned_To', 'Response']);
        f = f.map(function (x) { return x.name === 'Assigned_To' ? Object.assign({}, x, { hint: 'بريد موظف فعّال. يمكنك إسنادها لنفسك: ' + ctx.me.email }) : x; });
        return [{ name: 'Message', type: 'text', label: 'رسالة المعتمر', readonly: true }].concat(f);
      }
    });
  };

  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<span style="color:' + (i <= n ? 'var(--rm-gold-bright)' : 'var(--rm-line)') + '">★</span>'; return '<span aria-label="' + n + ' من 5" title="' + n + ' من 5">' + s + '</span>'; }

  A.Pages.ratings = async function (ctx) {
    var holder;
    await A.crud(ctx, {
      entity: 'ratings', nav: 'ratings', title: 'التقييمات', sub: 'آراء المعتمرين بعد انتهاء الحملات', refs: ['campaigns'], noCreate: true,
      searchPlaceholder: 'ابحث في التعليقات…', defaultSort: { sort: 'Created_At', dir: 'desc' }, top: '<div class="row g-3 mb-3" id="rm-rate-sum"></div>',
      filters: [{ key: 'Status', label: 'الحالة', options: [{ v: 'published', l: 'منشور' }, { v: 'hidden', l: 'مخفي' }] }],
      columns: [
        { key: 'Created_At', label: 'التاريخ', sort: true, render: function (r) { return '<span class="num small">' + Fmt.dateTime(r.Created_At) + '</span>'; } },
        { key: 'Campaign_ID', label: 'الحملة', hide: 'md', render: function (r) { return esc(A.Refs.label('campaigns', r.Campaign_ID)); } },
        { key: 'Rating', label: 'التقييم', sort: true, render: function (r) { return stars(Number(r.Rating)); } },
        { key: 'Comment', label: 'التعليق', render: function (r) { return esc(r.Comment || '—'); } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('ratings', 'Status', r.Status); } }
      ],
      rowActions: function (r) { return ctx.can('ratings.moderate') ? H.btn(r.Status === 'published' ? 'hide' : 'show', r.Status === 'published' ? 'إخفاء' : 'إظهار') : ''; },
      onLoad: function (res) { var e = res.extras || {}; var el = A.$('#rm-rate-sum'); if (el) el.innerHTML = '<div class="col-sm-6 col-lg-3"><div class="rm-stat"><div class="k">متوسط التقييم المنشور</div><div class="v num">' + (e.average === null || e.average === undefined ? '—' : Fmt.num(e.average) + '<small>/ 5</small>') + '</div></div></div><div class="col-sm-6 col-lg-3"><div class="rm-stat"><div class="k">عدد التقييمات المنشورة</div><div class="v num">' + Fmt.num(e.published_count || 0) + '</div></div></div>'; },
      onAction: async function (act, row, api) {
        try { await Api.call('ratings.update', { Rating_ID: row.Rating_ID, values: { Status: act === 'hide' ? 'hidden' : 'published' } }); A.toast('تم التحديث', 'ok'); api.reload(); } catch (e) { A.toast(Api.describe(e), 'bad'); }
      }
    });
  };
})();
