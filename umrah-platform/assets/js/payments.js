/** payments.js — الدفعات (تسجيل يدوي) والمصاريف. لا تحصيل إلكتروني ولا بيانات بطاقات. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt, H = A.crudHelpers;
  var NOTE = '<div class="alert alert-info small mb-3" role="note">الدفعات هنا <b>تُسجَّل يدوياً</b> بعد استلامها خارج المنصة (نقداً أو حوالة أو غيرها). المنصة لا تحصّل أموالاً إلكترونياً ولا تحفظ بيانات بطاقات.</div>';

  async function submitPayment(v, bookingId, extra) {
    var p = { values: Object.assign({}, v, bookingId ? { Booking_ID: bookingId } : {}) };
    if (extra) Object.assign(p, extra);
    try { return await Api.call('payments.create', p); }
    catch (e) {
      if (e.code === 'DUPLICATE') {
        var c = await A.confirm({ title: 'دفعة مطابقة', text: e.message.split('.')[0] + '. هل هذه دفعة مختلفة فعلاً؟', okLabel: 'سجّلها رغم ذلك' });
        if (c) return await Api.call('payments.create', Object.assign({}, p, { confirm_duplicate: true }));
      }
      throw e;
    }
  }
  A.openPayment = function (ctx, bookingId, done) {
    var fields = A.Form.fieldsFor('payments', 'create').filter(function (f) { return f.name !== 'Booking_ID'; });
    return A.Form.open({ entity: 'payments', mode: 'create', title: 'تسجيل دفعة', fields: fields, size: 'md', values: { Payment_Date: Fmt.todayStr(), Payment_Method: 'cash' },
      onSubmit: async function (v) { await submitPayment(v, bookingId); A.toast('تم تسجيل الدفعة', 'ok'); if (done) done(); } });
  };

  A.Pages.payments = async function (ctx) {
    var pm = ctx.schema.entities.payments.fields.filter(function (f) { return f.name === 'Payment_Method'; })[0];
    await A.crud(ctx, {
      entity: 'payments', nav: 'payments', title: 'الدفعات', sub: 'سجل الدفعات المسجَّلة يدوياً', newLabel: 'تسجيل دفعة', top: NOTE,
      refs: ['pilgrims', 'bookings'], searchPlaceholder: 'ابحث برقم المرجع…', defaultSort: { sort: 'Payment_Date', dir: 'desc' },
      filters: [{ key: 'Payment_Method', label: 'الطريقة', options: pm.enumValues.map(function (v) { return { v: v, l: pm.enumLabels[v] }; }) }, { key: 'Status', label: 'الحالة', options: [{ v: 'recorded', l: 'مسجَّلة' }, { v: 'void', l: 'ملغاة' }] }],
      headExtra: ctx.can('payments.export') ? '<button class="btn btn-ghost" id="rm-export">تصدير CSV</button>' : '',
      defaults: { Payment_Date: Fmt.todayStr(), Payment_Method: 'cash' },
      columns: [
        { key: 'Payment_Date', label: 'التاريخ', sort: true, render: function (r) { return Fmt.date(r.Payment_Date); } },
        { key: 'Pilgrim_ID', label: 'المعتمر', render: function (r) { return '<a href="pilgrim-profile.html?id=' + encodeURIComponent(r.Pilgrim_ID) + '">' + esc(A.Refs.label('pilgrims', r.Pilgrim_ID)) + '</a>'; } },
        { key: 'Booking_ID', label: 'الحجز', hide: 'md', render: function (r) { return '<span class="num">' + esc(A.Refs.label('bookings', r.Booking_ID)) + '</span>'; } },
        { key: 'Amount', label: 'المبلغ', sort: true, render: function (r) { return '<b>' + Fmt.money(r.Amount, r.Currency) + '</b>'; } },
        { key: 'Payment_Method', label: 'الطريقة', hide: 'md', render: function (r) { return esc(A.enumLabel('payments', 'Payment_Method', r.Payment_Method)); } },
        { key: 'Reference_Number', label: 'المرجع', hide: 'md', render: function (r) { return '<span class="num">' + esc(r.Reference_Number || '—') + '</span>'; } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('payments', 'Status', r.Status) + (r.Void_Reason ? '<div class="small text-secondary">' + esc(r.Void_Reason) + '</div>' : ''); } }
      ],
      canEdit: function (r) { return r.Status === 'recorded'; },
      rowActions: function (r) { return ctx.can('payments.void') && r.Status === 'recorded' ? H.btn('void', 'إلغاء', 'btn-danger-soft') : ''; },
      onCreateError: async function (e, p) { if (e.code === 'DUPLICATE') { var c = await A.confirm({ title: 'دفعة مطابقة', text: e.message.split('.')[0] + '. هل هذه دفعة مختلفة فعلاً؟', okLabel: 'سجّلها رغم ذلك' }); if (c) return Object.assign({}, p, { confirm_duplicate: true }); } return null; },
      onAction: async function (act, row, api) {
        if (act !== 'void') return;
        var c = await A.confirm({ title: 'إلغاء الدفعة', text: 'تبقى الدفعة في السجل بحالة «ملغاة» ويُحدَّث رصيد الحجز.', danger: true, askReason: true, reasonLabel: 'سبب الإلغاء', okLabel: 'إلغاء الدفعة' });
        if (!c) return;
        try { await Api.call('payments.void', { Payment_ID: row.Payment_ID, reason: c.reason }); A.toast('أُلغيت الدفعة', 'ok'); api.reload(); } catch (e) { A.toast(Api.describe(e), 'bad'); }
      }
    });
    var exp = A.$('#rm-export'); if (exp) exp.addEventListener('click', function () { A.exportCsv('payments'); });
  };

  A.exportCsv = async function (entity) {
    try { var r = await Api.call('export.entity', { entity: entity }); var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.csv], { type: 'text/csv;charset=utf-8' })); a.download = r.filename; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); A.toast('تم تصدير ' + Fmt.num(r.count) + ' سجلاً', 'ok'); }
    catch (e) { A.toast(Api.describe(e), 'bad'); }
  };

  A.Pages.expenses = async function (ctx) {
    await A.crud(ctx, {
      entity: 'expenses', nav: 'expenses', title: 'المصاريف', sub: 'مصاريف الحملات (تسجيل يدوي)', newLabel: 'تسجيل مصروف', refs: ['campaigns'],
      searchPlaceholder: 'ابحث بالتصنيف أو الوصف…', defaultSort: { sort: 'Expense_Date', dir: 'desc' }, defaults: { Expense_Date: Fmt.todayStr(), Currency: ctx.me.company && ctx.me.company.currency || 'SAR' },
      filters: [{ key: 'Status', label: 'الحالة', options: [{ v: 'recorded', l: 'مسجَّل' }, { v: 'void', l: 'ملغى' }] }],
      headExtra: ctx.can('expenses.export') ? '<button class="btn btn-ghost" id="rm-export">تصدير CSV</button>' : '',
      columns: [
        { key: 'Expense_Date', label: 'التاريخ', sort: true, render: function (r) { return Fmt.date(r.Expense_Date); } },
        { key: 'Category', label: 'التصنيف', sort: true },
        { key: 'Description', label: 'الوصف', hide: 'md' },
        { key: 'Campaign_ID', label: 'الحملة', hide: 'md', render: function (r) { return r.Campaign_ID ? esc(A.Refs.label('campaigns', r.Campaign_ID)) : '—'; } },
        { key: 'Amount', label: 'المبلغ', sort: true, render: function (r) { return '<b>' + Fmt.money(r.Amount, r.Currency) + '</b>'; } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('expenses', 'Status', r.Status) + (r.Void_Reason ? '<div class="small text-secondary">' + esc(r.Void_Reason) + '</div>' : ''); } }
      ],
      canEdit: function (r) { return r.Status === 'recorded'; },
      rowActions: function (r) { return ctx.can('expenses.void') && r.Status === 'recorded' ? H.btn('void', 'إلغاء', 'btn-danger-soft') : ''; },
      onAction: async function (act, row, api) {
        if (act !== 'void') return;
        var c = await A.confirm({ title: 'إلغاء المصروف', text: 'يبقى في السجل بحالة «ملغى».', danger: true, askReason: true, reasonLabel: 'سبب الإلغاء', okLabel: 'إلغاء المصروف' });
        if (!c) return;
        try { await Api.call('expenses.void', { Expense_ID: row.Expense_ID, reason: c.reason }); A.toast('أُلغي المصروف', 'ok'); api.reload(); } catch (e) { A.toast(Api.describe(e), 'bad'); }
      }
    });
    var exp = A.$('#rm-export'); if (exp) exp.addEventListener('click', function () { A.exportCsv('expenses'); });
  };
})();
