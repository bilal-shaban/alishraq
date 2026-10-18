/** campaigns.js — الحملات والحجوزات. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt, H = A.crudHelpers;

  A.Pages.campaigns = async function (ctx) {
    var st = ctx.schema.entities.campaigns.fields.filter(function (f) { return f.name === 'Status'; })[0];
    await A.crud(ctx, {
      entity: 'campaigns', nav: 'campaigns', title: 'الحملات', sub: 'إدارة الحملات والطاقة الاستيعابية والأسعار', newLabel: 'حملة جديدة',
      searchPlaceholder: 'ابحث باسم الحملة…', defaultSort: { sort: 'Start_Date', dir: 'desc' },
      filters: [{ key: 'Status', label: 'الحالة', options: st.enumValues.map(function (v) { return { v: v, l: st.enumLabels[v] }; }) }],
      columns: [
        { key: 'Campaign_Name', label: 'الحملة', sort: true, render: function (r) { return '<b>' + esc(r.Campaign_Name) + '</b><div class="small text-secondary">' + esc(r.Departure_City || '') + (r.Return_City ? ' ← ' + esc(r.Return_City) : '') + '</div>'; } },
        { key: 'Start_Date', label: 'الفترة', sort: true, render: function (r) { return '<span class="num">' + Fmt.date(r.Start_Date) + '</span> – <span class="num">' + Fmt.date(r.End_Date) + '</span>'; } },
        { key: 'Capacity', label: 'الأماكن', render: function (r) {
          var cap = Number(r.Capacity) || 0, used = cap - (Number(r.Available_Spaces) || 0), pct = cap ? Math.round(used / cap * 100) : 0;
          return '<div class="small num mb-1">' + Fmt.num(used) + ' / ' + Fmt.num(cap) + ' <span class="text-secondary">(متاح ' + Fmt.num(r.Available_Spaces) + ')</span></div><div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="نسبة الإشغال"><div class="progress-bar" style="width:' + pct + '%"></div></div>';
        } },
        { key: 'Price', label: 'السعر', sort: true, hide: 'md', render: function (r) { return Fmt.money(r.Price, r.Currency); } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('campaigns', 'Status', r.Status); } }
      ],
      fieldsFor: function (c, mode) {
        var f = A.Form.fieldsFor('campaigns', mode);
        return f.map(function (x) { if (x.name === 'Supervisors') return Object.assign({}, x, { hint: 'بريد المشرفين الفعّالين في الشركة، مفصولة بفواصل' }); return x; });
      },
      defaults: { Currency: ctx.me.company && ctx.me.company.currency || 'SAR', Status: 'draft' }
    });
  };

  A.Pages.bookings = async function (ctx) {
    var st = ctx.schema.entities.bookings.fields.filter(function (f) { return f.name === 'Status'; })[0];
    await A.crud(ctx, {
      entity: 'bookings', nav: 'bookings', title: 'الحجوزات', sub: 'ربط المعتمرين بالحملات ومتابعة الحالة', newLabel: 'حجز جديد',
      refs: ['pilgrims', 'campaigns'], searchPlaceholder: 'ابحث برقم الحجز…', defaultSort: { sort: 'Created_At', dir: 'desc' },
      filters: [{ key: 'Status', label: 'الحالة', options: st.enumValues.map(function (v) { return { v: v, l: st.enumLabels[v] }; }) }],
      columns: [
        { key: 'Booking_No', label: 'الرقم', sort: true, render: function (r) { return '<span class="num">' + esc(r.Booking_No) + '</span>'; } },
        { key: 'Pilgrim_ID', label: 'المعتمر', render: function (r) { return '<a href="pilgrim-profile.html?id=' + encodeURIComponent(r.Pilgrim_ID) + '">' + esc(A.Refs.label('pilgrims', r.Pilgrim_ID)) + '</a>'; } },
        { key: 'Campaign_ID', label: 'الحملة', hide: 'md', render: function (r) { return esc(A.Refs.label('campaigns', r.Campaign_ID)); } },
        { key: 'Booking_Date', label: 'التاريخ', sort: true, hide: 'md', render: function (r) { return Fmt.date(r.Booking_Date); } },
        { key: 'Total_Price', label: 'السعر', hide: 'sm', render: function (r) { return Fmt.money(r.Total_Price, r.Currency); } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('bookings', 'Status', r.Status); } }
      ],
      rowActions: function (r) {
        if (!ctx.can('bookings.write')) return '';
        var h = '';
        if (r.Status === 'pending') h += H.btn('confirm', 'تأكيد', 'btn-gold');
        if (r.Status === 'confirmed') h += H.btn('complete', 'إكمال');
        if (r.Status === 'pending' || r.Status === 'confirmed') h += H.btn('cancel', 'إلغاء', 'btn-danger-soft');
        return h;
      },
      canEdit: function (r) { return r.Status !== 'cancelled'; }, canDelete: function (r) { return r.Status === 'cancelled' || r.Status === 'pending'; },
      onCreateError: async function (e, p) {
        if (e.code === 'CAPACITY_FULL' && ctx.can('bookings.overbook')) {
          var c = await A.confirm({ title: 'الحملة مكتملة', text: e.message + '. تملك صلاحية تجاوز السعة كاستثناء. هل تريد المتابعة؟', okLabel: 'تجاوز السعة' });
          if (c) return Object.assign({}, p, { overbook: true });
        }
        return null;
      },
      onAction: async function (act, row, api) {
        var map = { confirm: 'confirmed', complete: 'completed', cancel: 'cancelled' };
        if (!map[act]) return;
        if (act === 'cancel') { var c = await A.confirm({ title: 'إلغاء الحجز', text: 'سيُحرَّر المقعد ولا يمكن إعادة تفعيل هذا الحجز لاحقاً.', danger: true, okLabel: 'إلغاء الحجز' }); if (!c) return; }
        try { await Api.call('bookings.update', { Booking_ID: row.Booking_ID, values: { Status: map[act] } }); A.toast('تم تحديث الحجز', 'ok'); api.reload(); } catch (e) { A.toast(Api.describe(e), 'bad'); }
      }
    });
  };
})();
