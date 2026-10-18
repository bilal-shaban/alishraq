/** pilgrims.js — المعتمرون: القائمة، الاستيراد، وملف المعتمر. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt, H = A.crudHelpers;

  function parseCsv(text) {
    var rows = [], row = [], f = '', q = false;
    text = String(text).replace(/^﻿/, '');
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { row.push(f); f = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.some(function (x) { return x !== ''; })) rows.push(row); row = []; }
      else f += ch;
    }
    row.push(f); if (row.some(function (x) { return x !== ''; })) rows.push(row);
    return rows.filter(function (r) { return !(r[0] || '').trim().startsWith('#'); });
  }

  function importDialog(ctx, done) {
    var m = A.modal({
      title: 'استيراد معتمرين من ملف CSV', size: 'lg', static: true,
      body: '<p class="text-secondary">الصف الأول أسماء الأعمدة: <span class="num">Full_Name, Phone, Email, Nationality, Emergency_Contact</span>. الحد الأقصى 200 صف. تُتخطى الأرقام المكررة. ابدأ بـ«فحص» لرؤية النتيجة دون حفظ.</p><input type="file" class="form-control mb-3" accept=".csv,text/csv" id="imp-file"><div id="imp-out"></div>',
      footer: '<button class="btn btn-ghost" data-bs-dismiss="modal">إغلاق</button><button class="btn btn-ghost" id="imp-dry" disabled>فحص</button><button class="btn btn-gold" id="imp-go" disabled>استيراد</button>'
    });
    var data = null, out = A.$('#imp-out', m.el);
    A.$('#imp-file', m.el).addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      if (f.size > 400000) { out.innerHTML = '<div class="alert alert-danger">الملف كبير جداً</div>'; return; }
      var r = new FileReader();
      r.onload = function () {
        var rows = parseCsv(r.result); if (rows.length < 2) { out.innerHTML = '<div class="alert alert-danger">الملف لا يحوي صفوفاً</div>'; return; }
        var hd = rows[0].map(function (x) { return x.trim(); });
        data = rows.slice(1).map(function (r2) { var o = {}; hd.forEach(function (k, i) { if (r2[i] !== undefined && r2[i] !== '') o[k] = r2[i]; }); return o; });
        out.innerHTML = '<div class="alert alert-info">تمت قراءة ' + Fmt.num(data.length) + ' صفاً.</div>';
        A.$('#imp-dry', m.el).disabled = false; A.$('#imp-go', m.el).disabled = false;
      };
      r.readAsText(f, 'utf-8');
    });
    async function run(dry) {
      try {
        var res = await Api.call('pilgrims.import', { rows: data, dry_run: dry });
        var h = dry ? '<div class="alert alert-success">الفحص: ' + Fmt.num(res.valid) + ' صالح، ' + Fmt.num(res.skipped.length) + ' سيُتخطى، ' + Fmt.num(res.errors.length) + ' به أخطاء.</div>' : '<div class="alert alert-success">تم استيراد ' + Fmt.num(res.created) + ' معتمراً.</div>';
        var det = (res.skipped || []).map(function (s) { return '<li>صف ' + (s.index + 2) + ': ' + esc(s.reason) + '</li>'; }).concat((res.errors || []).map(function (s) { return '<li>صف ' + (s.index + 2) + ': ' + esc(Object.values(s.fields || {}).join('، ') || s.message) + '</li>'; }));
        out.innerHTML = h + (det.length ? '<ul class="small text-secondary">' + det.join('') + '</ul>' : '');
        if (!dry) { done(); A.$('#imp-go', m.el).disabled = true; A.$('#imp-dry', m.el).disabled = true; }
      } catch (e) { out.innerHTML = '<div class="alert alert-danger">' + esc(Api.describe(e)) + '</div>'; }
    }
    A.$('#imp-dry', m.el).addEventListener('click', function () { run(true); });
    A.$('#imp-go', m.el).addEventListener('click', function () { run(false); });
  }

  A.Pages.pilgrims = async function (ctx) {
    var canContact = ctx.can('pilgrims.contact'), canFin = ctx.can('pilgrims.finance');
    var bookStatus = ctx.schema.entities.pilgrims.fields.filter(function (f) { return f.name === 'Booking_Status'; })[0];
    var api = await A.crud(ctx, {
      entity: 'pilgrims', nav: 'pilgrims', title: 'المعتمرون', sub: 'سجلات المعتمرين وحالة الحجز والتسديد', newLabel: 'معتمر جديد',
      refs: ['campaigns'], searchPlaceholder: 'ابحث بالاسم أو الرمز أو الهاتف…', defaultSort: { sort: 'Created_At', dir: 'desc' },
      headExtra: (ctx.can('pilgrims.import') ? '<button class="btn btn-ghost" id="rm-import">استيراد CSV</button>' : '') + (ctx.can('pilgrims.export') ? '<button class="btn btn-ghost" id="rm-export">تصدير CSV</button>' : ''),
      filters: [{ key: 'Booking_Status', label: 'الحجز', options: bookStatus.enumValues.map(function (v) { return { v: v, l: bookStatus.enumLabels[v] }; }) }],
      columns: function () {
        var cols = [
          { key: 'Pilgrim_Code', label: 'الرمز', sort: true, render: function (r) { return '<span class="num">' + esc(r.Pilgrim_Code) + '</span>'; } },
          { key: 'Full_Name', label: 'الاسم', sort: true, render: function (r) { return '<a href="pilgrim-profile.html?id=' + encodeURIComponent(r.Pilgrim_ID) + '">' + esc(r.Full_Name) + '</a>'; } }];
        if (canContact) cols.push({ key: 'Phone', label: 'الهاتف', hide: 'md', render: function (r) { return r.Phone ? '<span class="num">' + esc(r.Phone) + '</span>' : '—'; } });
        cols.push({ key: 'Campaign_ID', label: 'الحملة', hide: 'md', render: function (r) { return r.Campaign_ID ? esc(A.Refs.label('campaigns', r.Campaign_ID)) : '—'; } });
        cols.push({ key: 'Booking_Status', label: 'الحجز', render: function (r) { return A.badge('pilgrims', 'Booking_Status', r.Booking_Status); } });
        if (canFin) cols.push({ key: 'Payment_Status', label: 'التسديد', render: function (r) { return A.badge('pilgrims', 'Payment_Status', r.Payment_Status); } });
        return cols;
      },
      rowActions: function (r) { return '<a class="btn btn-sm btn-ghost" href="pilgrim-profile.html?id=' + encodeURIComponent(r.Pilgrim_ID) + '">الملف</a> '; },
      onCreateError: async function (e, p) {
        if (e.code === 'DUPLICATE' && /هاتف/.test(e.message)) {
          var c = await A.confirm({ title: 'رقم هاتف مكرر', text: e.message.split('.')[0] + '. هل تريد الإضافة رغم ذلك (مثلاً أفراد عائلة بنفس الرقم)؟', okLabel: 'أضف رغم التكرار' });
          if (c) return Object.assign({}, p, { allow_duplicate: true });
        }
        return null;
      }
    });
    var imp = A.$('#rm-import'); if (imp) imp.addEventListener('click', function () { importDialog(ctx, function () { api.reload(); }); });
    var exp = A.$('#rm-export'); if (exp) exp.addEventListener('click', async function () {
      try { var r = await Api.call('export.entity', { entity: 'pilgrims' }); var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.csv], { type: 'text/csv;charset=utf-8' })); a.download = r.filename; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); A.toast('تم تصدير ' + Fmt.num(r.count) + ' سجلاً (بلا بيانات الجواز)', 'ok'); }
      catch (e) { A.toast(Api.describe(e), 'bad'); }
    });
  };

  /* ---------------- ملف المعتمر ---------------- */
  A.Pages.pilgrimProfile = async function (ctx) {
    var id = A.qs('id');
    var root = ctx.shell('pilgrims', 'ملف المعتمر', '', '<a class="btn btn-ghost" href="pilgrims.html">رجوع للقائمة</a>');
    if (!id) { root.innerHTML = A.emptyBox('لم يُحدَّد معتمر', 'افتح الملف من قائمة المعتمرين.', '<a class="btn btn-gold" href="pilgrims.html">قائمة المعتمرين</a>'); return; }
    root.innerHTML = A.skeleton(6);
    var P, bookings = [], payments = [];
    async function load() {
      P = (await Api.call('pilgrims.get', { Pilgrim_ID: id })).item;
      bookings = ctx.can('bookings.read') ? (await Api.call('bookings.list', { filters: { Pilgrim_ID: id }, limit: 50 })).items : [];
      payments = ctx.can('payments.read') ? (await Api.call('payments.list', { filters: { Pilgrim_ID: id }, limit: 100 })).items : [];
      if (ctx.can('campaigns.read')) await A.Refs.load('campaigns');
      draw();
    }
    function kv(k, v) { return '<dt>' + esc(k) + '</dt><dd>' + v + '</dd>'; }
    function draw() {
      A.$('#rm-title').textContent = P.Full_Name;
      var actions = '';
      if (ctx.can('pilgrims.write')) actions += '<button class="btn btn-ghost" data-pa="edit">تعديل البيانات</button>';
      if (ctx.can('bookings.write')) actions += '<button class="btn btn-gold" data-pa="book">حجز جديد</button>';
      if (ctx.can('users.manage') && P.Email) actions += '<button class="btn btn-ghost" data-pa="invite">دعوة إلى بوابة المعتمر</button>';
      ctx.setActions('<a class="btn btn-ghost" href="pilgrims.html">رجوع للقائمة</a>' + actions);
      var info = '<dl class="rm-kv">' + kv('الرمز', '<span class="num">' + esc(P.Pilgrim_Code) + '</span>') + kv('الجنسية', esc(P.Nationality || '—'));
      if ('Phone' in P) info += kv('الهاتف', P.Phone ? '<span class="num">' + esc(P.Phone) + '</span>' : '—') + kv('البريد', esc(P.Email || '—')) + kv('جهة الطوارئ', esc(P.Emergency_Contact || '—')) + kv('ملاحظات', esc(P.Notes || '—'));
      if ('Passport_Number' in P) info += kv('رقم الجواز', '<span class="num">' + esc(P.Passport_Number || '—') + '</span>') + kv('انتهاء الجواز', Fmt.date(P.Passport_Expiry));
      info += '</dl>';
      var status = '<dl class="rm-kv">' + kv('حالة الحجز', A.badge('pilgrims', 'Booking_Status', P.Booking_Status)) + ('Payment_Status' in P ? kv('حالة التسديد', A.badge('pilgrims', 'Payment_Status', P.Payment_Status)) : '') + kv('الحملة', P.Campaign_ID ? esc(A.Refs.label('campaigns', P.Campaign_ID)) : '—') + '</dl>';
      var stay = '<dl class="rm-kv">' + kv('فندق مكة', esc(P.Makkah_Hotel || '—') + (P.Makkah_Room ? ' · غرفة <span class="num">' + esc(P.Makkah_Room) + '</span>' : '')) + kv('فندق المدينة', esc(P.Madinah_Hotel || '—') + (P.Madinah_Room ? ' · غرفة <span class="num">' + esc(P.Madinah_Room) + '</span>' : '')) + '</dl>';
      var bk = bookings.length ? '<div class="rm-table-wrap"><table class="rm-table stack"><thead><tr><th>رقم الحجز</th><th>الحملة</th><th>التاريخ</th><th>الحالة</th><th>السعر</th><th></th></tr></thead><tbody>' + bookings.map(function (b) {
        return '<tr><td data-label="رقم الحجز"><span class="num">' + esc(b.Booking_No) + '</span></td><td data-label="الحملة">' + esc(A.Refs.label('campaigns', b.Campaign_ID)) + '</td><td data-label="التاريخ">' + Fmt.date(b.Booking_Date) + '</td><td data-label="الحالة">' + A.badge('bookings', 'Status', b.Status) + '</td><td data-label="السعر">' + Fmt.money(b.Total_Price, b.Currency) + '</td><td class="acts">' + (ctx.can('payments.write') && b.Status !== 'cancelled' ? '<button class="btn btn-sm btn-ghost" data-pa="pay" data-bk="' + esc(b.Booking_ID) + '">تسجيل دفعة</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>' : A.emptyBox('لا حجوزات', ctx.can('bookings.write') ? 'أنشئ حجزاً لربط المعتمر بحملة.' : '');
      var pay = payments.length ? '<div class="rm-table-wrap"><table class="rm-table stack"><thead><tr><th>التاريخ</th><th>المبلغ</th><th>الطريقة</th><th>المرجع</th><th>الحالة</th></tr></thead><tbody>' + payments.map(function (p) {
        return '<tr><td data-label="التاريخ">' + Fmt.date(p.Payment_Date) + '</td><td data-label="المبلغ">' + Fmt.money(p.Amount, p.Currency) + '</td><td data-label="الطريقة">' + esc(A.enumLabel('payments', 'Payment_Method', p.Payment_Method)) + '</td><td data-label="المرجع"><span class="num">' + esc(p.Reference_Number || '—') + '</span></td><td data-label="الحالة">' + A.badge('payments', 'Status', p.Status) + '</td></tr>';
      }).join('') + '</tbody></table></div>' : A.emptyBox('لا دفعات مسجَّلة', '');
      A.$('#rm-page').innerHTML = '<div class="row g-3"><div class="col-lg-6"><div class="rm-card framed h-100"><div class="rm-card-head"><h2>البيانات</h2></div><div class="rm-card-body">' + info + '</div></div></div>' +
        '<div class="col-lg-6"><div class="rm-card framed mb-3"><div class="rm-card-head"><h2>الحجز والتسديد</h2></div><div class="rm-card-body">' + status + '</div></div><div class="rm-card framed"><div class="rm-card-head"><h2>الإقامة</h2>' + (ctx.can('rooms.assign') ? '<a class="btn btn-sm btn-ghost" href="rooms.html">توزيع الغرف</a>' : '') + '</div><div class="rm-card-body">' + stay + '</div></div></div>' +
        (ctx.can('bookings.read') ? '<div class="col-12"><div class="rm-card"><div class="rm-card-head"><h2>الحجوزات</h2></div>' + bk + '</div></div>' : '') +
        (ctx.can('payments.read') ? '<div class="col-12"><div class="rm-card"><div class="rm-card-head"><h2>الدفعات</h2></div>' + pay + '</div></div>' : '') + '</div>';
    }
    document.getElementById('app-root').addEventListener('click', async function (ev) {
      var t = ev.target.closest('[data-pa]'); if (!t) return; var act = t.getAttribute('data-pa');
      if (act === 'edit') A.Form.open({ entity: 'pilgrims', mode: 'edit', title: 'تعديل بيانات المعتمر', values: P, onSubmit: async function (v) { await Api.call('pilgrims.update', { Pilgrim_ID: id, values: v }); A.toast('تم الحفظ', 'ok'); load(); } });
      if (act === 'book') A.Form.open({ entity: 'bookings', mode: 'create', title: 'حجز جديد', values: { Pilgrim_ID: id }, fields: A.Form.fieldsFor('bookings', 'create').filter(function (f) { return f.name !== 'Pilgrim_ID'; }),
        onSubmit: async function (v) { v.Pilgrim_ID = id; await Api.call('bookings.create', { values: v }); A.toast('تم الحجز', 'ok'); A.Refs.clear(); load(); } });
      if (act === 'pay') A.openPayment(ctx, t.getAttribute('data-bk'), load);
      if (act === 'invite') { try { var r = await Api.call('pilgrims.invitePortal', { Pilgrim_ID: id }); A.modal({ title: 'دعوة المعتمر', body: '<p>' + (r.existing ? 'لدى المعتمر حساب بوابة بالفعل.' : 'تم تجهيز حساب البوابة.') + '</p><p class="text-secondary mb-0">' + esc(r.invite.message) + '</p>', footer: '<button class="btn btn-gold" data-bs-dismiss="modal">حسناً</button>' }); } catch (e) { A.toast(Api.describe(e), 'bad'); } }
    });
    try { await load(); } catch (e) { root.innerHTML = A.errBox(e); }
  };
})();
