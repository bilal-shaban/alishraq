/** ops.js — الفنادق، الغرف وتوزيع المعتمرين، النقل والمركبات. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt, H = A.crudHelpers;

  A.Pages.hotels = async function (ctx) {
    await A.crud(ctx, {
      entity: 'hotels', nav: 'hotels', title: 'الفنادق', sub: 'فنادق مكة والمدينة', newLabel: 'فندق جديد', searchPlaceholder: 'ابحث بالاسم أو العنوان…', defaultSort: { sort: 'Hotel_Name', dir: 'asc' },
      filters: [{ key: 'City', label: 'المدينة', options: [{ v: 'makkah', l: 'مكة المكرمة' }, { v: 'madinah', l: 'المدينة المنورة' }, { v: 'other', l: 'أخرى' }] }],
      columns: [
        { key: 'Hotel_Name', label: 'الفندق', sort: true, render: function (r) { return '<b>' + esc(r.Hotel_Name) + '</b>'; } },
        { key: 'City', label: 'المدينة', render: function (r) { return esc(A.enumLabel('hotels', 'City', r.City)); } },
        { key: 'Address', label: 'العنوان', hide: 'md' },
        { key: 'Contact_Phone', label: 'الهاتف', hide: 'md', render: function (r) { return r.Contact_Phone ? '<span class="num">' + esc(r.Contact_Phone) + '</span>' : '—'; } }
      ]
    });
  };

  A.Pages.rooms = async function (ctx) {
    var canAssign = ctx.can('rooms.assign');
    await A.crud(ctx, {
      entity: 'rooms', nav: 'rooms', title: 'الغرف والتوزيع', sub: 'سعة الغرف وتوزيع المعتمرين عليها', newLabel: 'غرفة جديدة', refs: ['hotels'], searchPlaceholder: 'ابحث برقم الغرفة…', defaultSort: { sort: 'Room_Number', dir: 'asc' },
      filters: [{ key: 'Status', label: 'الحالة', options: [{ v: 'available', l: 'متاحة' }, { v: 'full', l: 'مكتملة' }, { v: 'maintenance', l: 'صيانة' }] }],
      columns: [
        { key: 'Hotel_ID', label: 'الفندق', render: function (r) { return esc(A.Refs.label('hotels', r.Hotel_ID)); } },
        { key: 'Room_Number', label: 'الغرفة', sort: true, render: function (r) { return '<b class="num">' + esc(r.Room_Number) + '</b>'; } },
        { key: 'Occupied_Beds', label: 'الإشغال', render: function (r) { return '<span class="num">' + Fmt.num(r.Occupied_Beds) + ' / ' + Fmt.num(r.Capacity) + '</span>'; } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('rooms', 'Status', r.Status); } }
      ],
      rowActions: function (r) { return (canAssign && r.Status === 'available' ? H.btn('assign', 'إسناد معتمر', 'btn-gold') : '') + (ctx.can('pilgrims.read') ? H.btn('guests', 'النزلاء') : ''); },
      onAction: async function (act, row, api) {
        if (act === 'assign') {
          var pil = await A.Refs.load('pilgrims');
          var m = A.modal({ title: 'إسناد معتمر إلى غرفة ' + row.Room_Number, size: 'md', body: '<label class="form-label" for="as-p">المعتمر</label><select id="as-p" class="form-select"><option value="">— اختر —</option>' + pil.map(function (o) { return '<option value="' + esc(o.v) + '">' + esc(o.l) + '</option>'; }).join('') + '</select><div id="as-err" class="mt-3"></div>', footer: '<button class="btn btn-ghost" data-bs-dismiss="modal">إلغاء</button><button class="btn btn-gold" id="as-ok">إسناد</button>' });
          A.$('#as-ok', m.el).addEventListener('click', async function () {
            var v = A.$('#as-p', m.el).value; if (!v) return;
            try { await Api.call('rooms.assign', { Pilgrim_ID: v, Room_ID: row.Room_ID }); A.toast('تم الإسناد', 'ok'); m.close(); api.reload(); } catch (e) { A.$('#as-err', m.el).innerHTML = '<div class="alert alert-danger mb-0">' + esc(Api.describe(e)) + '</div>'; }
          });
        }
        if (act === 'guests') {
          try {
            var occ = await Api.call('rooms.occupancy', {}); var me = occ.items.filter(function (x) { return x.Room_ID === row.Room_ID; })[0] || { occupants: [] };
            var list = (me.occupants || []).map(function (o) { return '<li><span class="flex-grow-1">' + esc(o.Full_Name) + ' <span class="num text-secondary">(' + esc(o.Pilgrim_Code) + ')</span></span>' + (canAssign ? '<button class="btn btn-sm btn-danger-soft" data-un="' + esc(o.Pilgrim_ID) + '">إخراج</button>' : '') + '</li>'; }).join('');
            var m2 = A.modal({ title: 'نزلاء الغرفة ' + row.Room_Number, size: 'md', body: list ? '<ul class="rm-list">' + list + '</ul>' : A.emptyBox('الغرفة فارغة', ''), footer: '<button class="btn btn-ghost" data-bs-dismiss="modal">إغلاق</button>' });
            m2.el.addEventListener('click', async function (ev) {
              var b = ev.target.closest('[data-un]'); if (!b) return;
              var city = (A.Refs.label('hotels', row.Hotel_ID) && me.City) || me.City;
              try { await Api.call('rooms.unassign', { Pilgrim_ID: b.getAttribute('data-un'), city: me.City }); A.toast('تم الإخراج', 'ok'); m2.close(); api.reload(); } catch (e) { A.toast(Api.describe(e), 'bad'); }
            });
          } catch (e) { A.toast(Api.describe(e), 'bad'); }
        }
      }
    });
  };

  A.Pages.transport = async function (ctx) {
    var tab = A.qs('tab') === 'vehicles' ? 'vehicles' : 'trips';
    var tabs = '<ul class="nav nav-tabs mb-3"><li class="nav-item"><a class="nav-link ' + (tab === 'trips' ? 'active' : '') + '" href="transport.html">الرحلات</a></li>' + (ctx.can('vehicles.read') ? '<li class="nav-item"><a class="nav-link ' + (tab === 'vehicles' ? 'active' : '') + '" href="transport.html?tab=vehicles">المركبات والسائقون</a></li>' : '') + '</ul>';
    if (tab === 'vehicles') {
      await A.crud(ctx, {
        entity: 'vehicles', nav: 'transport', title: 'النقل', sub: 'المركبات والسائقون', newLabel: 'مركبة جديدة', top: tabs, searchPlaceholder: 'ابحث بنوع المركبة أو اللوحة أو السائق…', defaultSort: { sort: 'Vehicle_Number', dir: 'asc' },
        columns: [
          { key: 'Vehicle_Type', label: 'المركبة', sort: true, render: function (r) { return '<b>' + esc(r.Vehicle_Type) + '</b> <span class="num text-secondary">' + esc(r.Vehicle_Number) + '</span>'; } },
          { key: 'Capacity', label: 'المقاعد', render: function (r) { return '<span class="num">' + Fmt.num(r.Capacity) + '</span>'; } },
          { key: 'Driver_Name', label: 'السائق', hide: 'md', render: function (r) { return esc(r.Driver_Name || '—') + (r.Driver_Phone ? ' <span class="num text-secondary">' + esc(r.Driver_Phone) + '</span>' : ''); } },
          { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('vehicles', 'Status', r.Status); } }
        ]
      });
      return;
    }
    await A.crud(ctx, {
      entity: 'transport', nav: 'transport', title: 'النقل', sub: 'رحلات الحملات وقوائم الركاب', newLabel: 'رحلة جديدة', top: tabs, refs: ['vehicles', 'campaigns', 'pilgrims'],
      searchPlaceholder: 'ابحث بالوجهة أو نقطة التجمع…', defaultSort: { sort: 'Departure_Time', dir: 'asc' },
      filters: [{ key: 'Status', label: 'الحالة', options: [{ v: 'scheduled', l: 'مجدولة' }, { v: 'in_progress', l: 'جارية' }, { v: 'completed', l: 'منتهية' }, { v: 'cancelled', l: 'ملغاة' }] }],
      columns: [
        { key: 'Departure_Time', label: 'الانطلاق', sort: true, render: function (r) { return '<span class="num">' + Fmt.dateTime(r.Departure_Time) + '</span>'; } },
        { key: 'Vehicle_ID', label: 'المركبة', hide: 'md', render: function (r) { return esc(A.Refs.label('vehicles', r.Vehicle_ID)); } },
        { key: 'Destination', label: 'المسار', render: function (r) { return esc(r.Departure_Location) + ' ← <b>' + esc(r.Destination) + '</b>'; } },
        { key: 'Passenger_IDs', label: 'الركاب', render: function (r) { return '<span class="num">' + Fmt.num((r.Passenger_IDs || '').split(',').filter(Boolean).length) + '</span>'; } },
        { key: 'Status', label: 'الحالة', render: function (r) { return A.badge('transport', 'Status', r.Status); } }
      ],
      rowActions: function (r) { return (ctx.can('transport.write') && r.Status !== 'completed' && r.Status !== 'cancelled' ? H.btn('pax', 'الركاب') : '') + H.btn('manifest', 'الكشف'); },
      onAction: async function (act, row, api) {
        if (act === 'pax') {
          var pil = await A.Refs.load('pilgrims'); var cur = (row.Passenger_IDs || '').split(',').filter(Boolean);
          var m = A.modal({ title: 'ركاب الرحلة', size: 'md', static: true, body: '<input class="form-control mb-2" id="px-q" placeholder="ابحث…"><div style="max-height:320px;overflow:auto" id="px-list">' + pil.map(function (o) { return '<label class="d-flex gap-2 py-1 px-1 align-items-center" data-n="' + esc(o.l) + '"><input type="checkbox" class="form-check-input mt-0" value="' + esc(o.v) + '"' + (cur.indexOf(o.v) !== -1 ? ' checked' : '') + '><span>' + esc(o.l) + '</span></label>'; }).join('') + '</div><div id="px-err" class="mt-2"></div>', footer: '<button class="btn btn-ghost" data-bs-dismiss="modal">إلغاء</button><button class="btn btn-gold" id="px-ok">حفظ الركاب</button>' });
          A.$('#px-q', m.el).addEventListener('input', function () { var q = this.value.trim(); A.$$('#px-list label', m.el).forEach(function (l) { l.style.display = !q || l.getAttribute('data-n').indexOf(q) !== -1 ? '' : 'none'; }); });
          A.$('#px-ok', m.el).addEventListener('click', async function () {
            var ids = A.$$('#px-list input:checked', m.el).map(function (x) { return x.value; });
            try { await Api.call('transport.setPassengers', { Transport_ID: row.Transport_ID, Pilgrim_IDs: ids }); A.toast('تم حفظ الركاب', 'ok'); m.close(); api.reload(); } catch (e) { A.$('#px-err', m.el).innerHTML = '<div class="alert alert-danger mb-0">' + esc(Api.describe(e)) + '</div>'; }
          });
        }
        if (act === 'manifest') {
          try {
            var r = await Api.call('transport.manifest', { Transport_ID: row.Transport_ID });
            var v = r.vehicle || {};
            A.modal({ title: 'كشف الرحلة', size: 'md', body: '<dl class="rm-kv mb-3"><dt>الانطلاق</dt><dd class="num">' + Fmt.dateTime(r.trip.Departure_Time) + '</dd><dt>المسار</dt><dd>' + esc(r.trip.Departure_Location) + ' ← ' + esc(r.trip.Destination) + '</dd><dt>المركبة</dt><dd>' + esc(v.Vehicle_Type || '') + ' <span class="num">' + esc(v.Vehicle_Number || '') + '</span></dd><dt>السائق</dt><dd>' + esc(v.Driver_Name || '—') + (v.Driver_Phone ? ' <span class="num">' + esc(v.Driver_Phone) + '</span>' : '') + '</dd></dl>' +
              (r.passengers.length ? '<ol class="mb-0">' + r.passengers.map(function (p) { return '<li>' + esc(p.Full_Name || p.Pilgrim_Code || p.Pilgrim_ID) + (p.Phone ? ' <span class="num text-secondary">' + esc(p.Phone) + '</span>' : '') + '</li>'; }).join('') + '</ol>' : '<p class="text-secondary mb-0">لا ركاب بعد.</p>'), footer: '<button class="btn btn-ghost" onclick="window.print()">طباعة</button><button class="btn btn-gold" data-bs-dismiss="modal">إغلاق</button>' });
          } catch (e) { A.toast(Api.describe(e), 'bad'); }
        }
      }
    });
  };
})();
