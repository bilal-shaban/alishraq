/**
 * demo.js — وضع المحاكاة (Preview). بيانات وهمية بالكامل داخل المتصفح، للقراءة فقط:
 * لا اتصال بالخادم، لا كتابة، لا إشعارات حقيقية، ولا علاقة له ببيانات الإنتاج.
 */
(function () {
  function ERR(code, msg) { return new Api.ApiErr(code, msg); }
  var NOW = Date.now();
  function iso(minFromNow) { return new Date(NOW + minFromNow * 60000).toISOString(); }
  function day(offset) { return new Date(NOW + offset * 86400000).toISOString().substring(0, 10); }
  var CO = { id: 'COM_DEMO', slug: 'demo', name: 'الإشراق (محاكاة)', logo_url: '', brand_primary: '#0F3D2E', brand_accent: '#C9A24B', timezone: 'Asia/Riyadh', currency: 'SAR', language: 'ar', contact_phone: '+966500000000', contact_email: 'demo@example.invalid', plan: 'trial',
    settings: { timezone: 'Asia/Riyadh', currency: 'SAR' } };
  var names = ['أحمد الصالح', 'خالد المنصور', 'فاطمة العلي', 'عمر الحسن', 'مريم الخالد', 'يوسف الأمين', 'سارة النجار', 'إبراهيم السالم', 'نورة الراشد', 'عبدالله الفهد', 'ليلى الحمد', 'محمود الشامي'];
  var D = {};
  D.campaigns = [
    { Campaign_ID: 'CMP_D1', Campaign_Name: 'حملة رجب التجريبية', Start_Date: day(-2), End_Date: day(8), Departure_City: 'دمشق', Return_City: 'دمشق', Capacity: 40, Available_Spaces: 28, Price: 3200, Currency: 'SAR', Status: 'open', Supervisors: 'sup@example.invalid', Notes: '' },
    { Campaign_ID: 'CMP_D2', Campaign_Name: 'حملة شعبان التجريبية', Start_Date: day(40), End_Date: day(50), Departure_City: 'حلب', Return_City: 'حلب', Capacity: 30, Available_Spaces: 30, Price: 3000, Currency: 'SAR', Status: 'draft', Supervisors: '', Notes: '' }];
  D.pilgrims = names.map(function (n, i) { return { Pilgrim_ID: 'PLG_D' + (i + 1), Pilgrim_Code: 'DM-' + String(i + 1).padStart(4, '0'), Full_Name: n, Phone: '+96650000' + String(1000 + i), Email: '', Nationality: 'سوري', Emergency_Contact: '', Campaign_ID: 'CMP_D1', Booking_Status: i < 9 ? 'confirmed' : 'pending', Payment_Status: i < 5 ? 'paid' : (i < 9 ? 'partial' : 'unpaid'), Makkah_Hotel: i < 8 ? 'فندق الأمل' : '', Makkah_Room: i < 8 ? String(101 + (i >> 1)) : '', Makkah_Location: '', Makkah_Room_ID: i < 8 ? 'RM_D' + ((i >> 1) + 1) : '', Madinah_Hotel: '', Madinah_Room: '', Madinah_Location: '', Madinah_Room_ID: '', Notes: '' }; });
  D.bookings = D.pilgrims.map(function (p, i) { return { Booking_ID: 'BKG_D' + (i + 1), Booking_No: 'BK-' + (1000 + i), Pilgrim_ID: p.Pilgrim_ID, Campaign_ID: 'CMP_D1', Booking_Date: day(-30 + i), Status: p.Booking_Status, Total_Price: 3200, Currency: 'SAR', Notes: '' }; });
  D.payments = D.pilgrims.slice(0, 9).map(function (p, i) { return { Payment_ID: 'PAY_D' + (i + 1), Pilgrim_ID: p.Pilgrim_ID, Booking_ID: 'BKG_D' + (i + 1), Amount: i < 5 ? 3200 : 1500, Currency: 'SAR', Payment_Date: day(-20 + i), Payment_Method: ['cash', 'bank_transfer'][i % 2], Reference_Number: '', Status: 'recorded', Void_Reason: '', Recorded_By: 'demo@example.invalid', Notes: '' }; });
  D.expenses = [{ Expense_ID: 'EXP_D1', Campaign_ID: 'CMP_D1', Category: 'نقل', Amount: 4200, Currency: 'SAR', Expense_Date: day(-5), Description: 'حافلة (مثال)', Recorded_By: 'demo@example.invalid', Attachment_Reference: '', Status: 'recorded', Void_Reason: '' }, { Expense_ID: 'EXP_D2', Campaign_ID: 'CMP_D1', Category: 'إقامة', Amount: 9800, Currency: 'SAR', Expense_Date: day(-3), Description: 'حجز فندق (مثال)', Recorded_By: 'demo@example.invalid', Attachment_Reference: '', Status: 'recorded', Void_Reason: '' }];
  D.hotels = [{ Hotel_ID: 'HTL_D1', Hotel_Name: 'فندق الأمل', City: 'makkah', Address: 'مكة — حي تجريبي', Contact_Phone: '', Notes: '' }, { Hotel_ID: 'HTL_D2', Hotel_Name: 'فندق السكينة', City: 'madinah', Address: 'المدينة — حي تجريبي', Contact_Phone: '', Notes: '' }];
  D.rooms = [1, 2, 3, 4].map(function (n) { return { Room_ID: 'RM_D' + n, Hotel_ID: 'HTL_D1', Room_Number: String(100 + n), Capacity: 4, Occupied_Beds: n < 3 ? 2 + (n === 1 ? 2 : 0) : 0, Status: n === 1 ? 'full' : 'available' }; });
  D.vehicles = [{ Vehicle_ID: 'VEH_D1', Vehicle_Type: 'حافلة 45 مقعداً', Vehicle_Number: 'DEMO-123', Capacity: 45, Driver_Name: 'سائق تجريبي', Driver_Phone: '', Status: 'active' }];
  D.transport = [{ Transport_ID: 'TRP_D1', Campaign_ID: 'CMP_D1', Vehicle_ID: 'VEH_D1', Departure_Time: iso(180), Departure_Location: 'الفندق', Destination: 'الحرم', Meeting_Point: 'اللوبي', Passenger_IDs: D.pilgrims.slice(0, 8).map(function (p) { return p.Pilgrim_ID; }).join(','), Notes: '', Status: 'scheduled' }];
  function sch(id, t, cat, off, dur, loc, imp) { return { Schedule_ID: id, Campaign_ID: 'CMP_D1', Title: t, Category: cat, Date_Time: iso(off), End_Time: iso(off + dur), Location: loc, Notes: '', Status: 'active', Important: !!imp, Notify_Before_Min: 30 }; }
  D.schedule = [sch('SCH_D1', 'درس بعد الفجر (مثال)', 'lesson', -120, 45, 'قاعة الفندق'), sch('SCH_D2', 'طواف جماعي (مثال)', 'umrah', -10, 90, 'الحرم', true), sch('SCH_D3', 'لقاء المشرفين (مثال)', 'gathering', 120, 30, 'اللوبي'), sch('SCH_D4', 'زيارة تجريبية', 'visit', 1500, 120, 'موقع (مثال)'), sch('SCH_D5', 'تهجد (مثال)', 'tahajjud', 1700, 60, 'الحرم', true)];
  D.announcements = [{ Announcement_ID: 'ANN_D1', Campaign_ID: 'CMP_D1', Title: 'موعد الانطلاق (مثال)', Message: 'هذا إعلان تجريبي للمحاكاة فقط.', Priority: 'high', Audience: 'all', Start_Date: day(-1), End_Date: day(5), Status: 'published', Created_At: iso(-600) }, { Announcement_ID: 'ANN_D2', Campaign_ID: '', Title: 'مسودة إعلان', Message: 'نص مسودة تجريبي.', Priority: 'normal', Audience: 'all', Start_Date: '', End_Date: '', Status: 'draft', Created_At: iso(-60) }];
  D.inquiries = [{ Inquiry_ID: 'INQ_D1', Pilgrim_ID: 'PLG_D3', Name: names[2], Phone: '+966500001002', Message: 'متى موعد الحافلة غداً؟ (رسالة تجريبية)', Priority: 'normal', Status: 'new', Assigned_To: '', Response: '', Responded_By: '', Created_At: iso(-90) }, { Inquiry_ID: 'INQ_D2', Pilgrim_ID: 'PLG_D5', Name: names[4], Phone: '', Message: 'أحتاج مساعدة بالتسكين (تجريبي)', Priority: 'high', Status: 'in_progress', Assigned_To: 'sup@example.invalid', Response: 'جارٍ التنسيق', Responded_By: 'sup@example.invalid', Created_At: iso(-300) }];
  D.ratings = [{ Rating_ID: 'RTG_D1', Pilgrim_ID: 'PLG_D1', Campaign_ID: 'CMP_D1', Rating: 5, Comment: 'تجربة ممتازة (تجريبي)', Status: 'published', Created_At: iso(-1000) }, { Rating_ID: 'RTG_D2', Pilgrim_ID: 'PLG_D2', Campaign_ID: 'CMP_D1', Rating: 4, Comment: '', Status: 'published', Created_At: iso(-900) }];
  D.users = [{ User_ID: 'USR_D1', Email: 'admin@example.invalid', Display_Name: 'مدير تجريبي', Role: 'company_admin', Status: 'active', Phone: '', Last_Login_At: iso(-30), Created_At: iso(-5000) }, { User_ID: 'USR_D2', Email: 'sup@example.invalid', Display_Name: 'مشرف تجريبي', Role: 'supervisor', Status: 'active', Phone: '', Last_Login_At: '', Created_At: iso(-4000) }, { User_ID: 'USR_D3', Email: 'acc@example.invalid', Display_Name: 'محاسب تجريبي', Role: 'accountant', Status: 'invited', Phone: '', Last_Login_At: '', Created_At: iso(-3000) }];
  D.attendance = []; D.supervisor_reports = [];

  function state(s) { var a = new Date(s.Date_Time).getTime(), b = new Date(s.End_Time).getTime(), n = Date.now(); return s.Status === 'cancelled' ? 'cancelled' : (n < a ? 'upcoming' : (n <= b ? 'live' : 'ended')); }
  function withState(r) { return Object.assign({}, r, { live_state: state(r) }); }
  var SCHEMA = function () { return window.UMRAH_SCHEMA; };
  function perms() {
    var p = []; Object.keys(SCHEMA().entities).forEach(function (k) { ['read', 'write', 'delete'].forEach(function (a) { p.push(k + '.' + a); }); });
    return p.concat(['pilgrims.contact', 'pilgrims.finance', 'pilgrims.export', 'payments.export', 'expenses.export', 'reports.read', 'reports.financial', 'settings.read', 'settings.write', 'audit.read', 'users.manage', 'rooms.assign', 'announcements.publish', 'schedule.write_religious', 'ratings.moderate', 'transport.write']);
  }
  function list(key, p) {
    var rows = (D[key] || []).slice(), def = SCHEMA().entities[key];
    if (key === 'schedule') {
      rows = rows.map(withState);
      var w = p.when; if (w) rows = rows.filter(function (r) { return w === 'today' ? r.Date_Time.substring(0, 10) === day(0) : (w === 'past' ? r.live_state === 'ended' : r.live_state === w); });
      if (p.date) rows = rows.filter(function (r) { return r.Date_Time.substring(0, 10) === p.date; });
    }
    var f = p.filters || {}; Object.keys(f).forEach(function (k) { var v = f[k]; if (v === '' || v == null || typeof v === 'object' && !Array.isArray(v)) return; var vs = [].concat(v).map(String); rows = rows.filter(function (r) { return vs.indexOf(String(r[k])) !== -1; }); });
    var q = String(p.q || '').toLowerCase(); if (q) rows = rows.filter(function (r) { return JSON.stringify(r).toLowerCase().indexOf(q) !== -1; });
    if (p.sort) rows.sort(function (a, b) { var x = a[p.sort], y = b[p.sort]; var c = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x).localeCompare(String(y)); return p.dir === 'asc' ? c : -c; });
    var limit = Math.min(parseInt(p.limit, 10) || 15, 200), page = Math.max(parseInt(p.page, 10) || 1, 1), total = rows.length;
    var res = { items: rows.slice((page - 1) * limit, page * limit), total: total, page: page, limit: limit, pages: Math.max(Math.ceil(total / limit), 1) };
    if (key === 'ratings') { var pub = D.ratings.filter(function (r) { return r.Status === 'published'; }); res.extras = { average: pub.length ? Math.round(pub.reduce(function (s, r) { return s + r.Rating; }, 0) / pub.length * 10) / 10 : null, published_count: pub.length }; }
    return res;
  }
  function pilgrimOverview() {
    var s = D.schedule.map(withState), c = D.campaigns[0], p = D.pilgrims[0];
    return { profile: { Pilgrim_ID: p.Pilgrim_ID, Full_Name: p.Full_Name, Phone: p.Phone, Emergency_Phone: '' }, campaign: c, live_now: s.filter(function (x) { return x.live_state === 'live'; }), next_activity: s.filter(function (x) { return x.live_state === 'upcoming'; })[0] || null, announcements_count: 1, welcome: 'أهلاً بك — هذه بوابة محاكاة ببيانات وهمية.', can_edit_contact: false, company: { name: CO.name, phone: CO.contact_phone, email: CO.contact_email }, server_time: new Date().toISOString(), timezone: CO.timezone };
  }

  var Demo = {
    handle: async function (action, p) {
      var kind = Auth.previewKind();
      if (Api.isWrite(action) && !/\.(list|get)$/.test(action)) throw ERR('PREVIEW_READONLY', 'وضع المحاكاة للقراءة فقط — لا يُحفظ أي تغيير. سجّل الدخول لاستخدام المنصة فعلياً.');
      await new Promise(function (r) { setTimeout(r, 120); });
      var m;
      if (action === 'auth.me') {
        if (kind === 'platform') return { email: 'owner@example.invalid', display_name: 'مالك المنصة (محاكاة)', role: 'super_admin', role_label: 'مالك المنصة', is_super: true, permissions: [], pilgrim_id: '', server_time: new Date().toISOString(), app: { name: 'رفيق المعتمر', version: 'demo' } };
        if (kind === 'portal') return { email: 'pilgrim@example.invalid', display_name: D.pilgrims[0].Full_Name, role: 'pilgrim', role_label: 'معتمر', is_super: false, permissions: [], pilgrim_id: 'PLG_D1', company: CO, server_time: new Date().toISOString(), app: { name: 'رفيق المعتمر', version: 'demo' } };
        return { email: 'admin@example.invalid', display_name: 'مدير تجريبي', role: 'company_admin', role_label: 'مدير الشركة', is_super: false, permissions: perms(), pilgrim_id: '', company: CO, server_time: new Date().toISOString(), app: { name: 'رفيق المعتمر', version: 'demo' } };
      }
      if (action === 'meta.schema') return SCHEMA();
      if (action === 'notifications.list') return { items: [{ type: 'inquiries', count: 1, text: 'طلب مساعدة جديد (محاكاة)' }] };
      if (action === 'dashboard.company') {
        var s = D.schedule.map(withState);
        return { cards: { pilgrims: D.pilgrims.length, campaigns_open: 1, campaigns_total: 2, bookings_active: 12, bookings_pending: 3, inquiries_open: 2, rating_average: 4.5, rating_count: 2, revenue: { SAR: 23500 }, expenses: { SAR: 14000 } }, live: s.filter(function (x) { return x.live_state === 'live'; }), upcoming: s.filter(function (x) { return x.live_state === 'upcoming'; }).slice(0, 5), today: day(0), server_time: new Date().toISOString() };
      }
      if (action === 'reports.financial') return { note: 'بيانات محاكاة. الأرقام مبنية على الدفعات والمصاريف المسجَّلة يدوياً؛ لا يوجد تحصيل إلكتروني عبر المنصة.', by_currency: { SAR: { revenue: 23500, expenses: 14000, net: 9500, expected: 38400, outstanding: 14900, payments: 9 } }, by_method: [], by_campaign: [{ Campaign_ID: 'CMP_D1', Campaign_Name: D.campaigns[0].Campaign_Name, Currency: 'SAR', revenue: 23500, expenses: 14000, expected: 38400 }] };
      if (action === 'reports.operations') return { campaigns: D.campaigns.map(function (c) { return { Campaign_ID: c.Campaign_ID, Campaign_Name: c.Campaign_Name, Capacity: c.Capacity, booked: c.Capacity - c.Available_Spaces, Available_Spaces: c.Available_Spaces, Status: c.Status }; }), pilgrims: { total: 12, without_booking: 0, without_makkah_room: 4, without_madinah_room: 12 }, rooms: { capacity: 16, occupied: 8, free: 8 } };
      if (action === 'settings.get') return { profile: { company_name: CO.name, logo_url: '', brand_primary: CO.brand_primary, brand_accent: CO.brand_accent, contact_phone: CO.contact_phone, contact_email: CO.contact_email, timezone: CO.timezone, currency: 'SAR', language: 'ar' }, operational: { default_activity_minutes: 60, hide_ended_activities: false, pilgrim_can_edit_contact: false, portal_welcome: '', code_prefix: 'DM' }, telegram: { chat_ids: '', events: { 'inquiry.new': { label: 'طلب مساعدة جديد', enabled: true } }, bot_configured: false } };
      if (action === 'settings.rolePermissions.get') return { roles: [{ role: 'supervisor', label: 'مشرف', defaults: ['pilgrims.read'], ceiling: ['pilgrims.read', 'pilgrims.contact', 'schedule.read'], effective: ['pilgrims.read'], override: { add: [], remove: [] } }], perm_labels: { 'pilgrims.read': 'عرض المعتمرين', 'pilgrims.contact': 'عرض بيانات التواصل', 'schedule.read': 'عرض البرنامج' }, never_grantable: [] };
      if (action === 'audit.list') return { items: [{ Log_ID: 'L1', Timestamp: iso(-60), Actor_Email: 'admin@example.invalid', Actor_Role: 'company_admin', Action: 'create', Entity: 'pilgrims', Entity_ID: 'PLG_D1', Summary: 'إضافة معتمر (محاكاة)', Changes: '' }], total: 1, page: 1, limit: 25 };
      if (action === 'rooms.occupancy') return { items: D.rooms.map(function (r) { return { Room_ID: r.Room_ID, City: 'makkah', occupants: D.pilgrims.filter(function (x) { return x.Makkah_Room_ID === r.Room_ID; }).map(function (x) { return { Pilgrim_ID: x.Pilgrim_ID, Full_Name: x.Full_Name, Pilgrim_Code: x.Pilgrim_Code }; }) }; }) };
      if (action === 'transport.manifest') return { trip: D.transport[0], vehicle: D.vehicles[0], passengers: D.pilgrims.slice(0, 8) };
      if (action === 'export.entity') throw ERR('PREVIEW_READONLY', 'التصدير غير متاح في المحاكاة');
      if (action === 'platform.stats') return { companies: { total: 3, active: 2, suspended: 0, pending: 1, failed: 1 }, totals: { pilgrims: 40, campaigns: 3, users: 9 }, requests_new: 1, per_company: [], last_ops: [], last_errors: [{ Timestamp: iso(-200), Service: 'telegram', Operation: 'sendMessage', Details: 'مثال خطأ للمحاكاة' }], integrations: {}, generated_at: new Date().toISOString() };
      if (action === 'platform.status') return { app: { name: 'رفيق المعتمر', version: 'demo' }, checks: [{ name: 'الملف المركزي', ok: true, detail: 'سليم (محاكاة)' }, { name: 'Telegram', ok: false, detail: 'محاكاة: لا اتصال حقيقي' }], ok: false, time: new Date().toISOString() };
      if (action === 'companies.list') return { items: [{ Company_ID: 'COM_DEMO', Company_Name: CO.name, Slug: 'demo', Status: 'active', Init_Status: 'ready', Plan: 'trial', Init_Error: '' }, { Company_ID: 'COM_X', Company_Name: 'شركة قيد التهيئة (محاكاة)', Slug: 'sample', Status: 'pending', Init_Status: 'failed', Plan: 'trial', Init_Error: 'مثال على فشل تهيئة' }], total: 2 };
      if (action === 'platform.requests.list') return { items: [{ Request_ID: 'REQ_D1', Company_Name: 'شركة طلب تجريبي', Contact_Name: 'مسؤول تجريبي', Email: 'x@example.invalid', Country: 'تركيا', Status: 'new', Created_At: iso(-400) }], total: 1 };
      if (action === 'platform.logs') return { kind: 'Audit_Log', total: 0, page: 1, limit: 50, items: [] };
      if (action === 'platform.settings.get') return { values: { default_timezone: 'Asia/Riyadh', default_currency: 'SAR' }, allowed_keys: [] };
      if (action === 'me.overview') return pilgrimOverview();
      if (action === 'me.schedule') return { items: D.schedule.map(withState), server_time: new Date().toISOString(), timezone: CO.timezone };
      if (action === 'me.announcements') return { items: D.announcements.filter(function (a) { return a.Status === 'published'; }) };
      if (action === 'me.inquiries.list') return { items: [] };
      if (action === 'me.rating.get') return { eligible: false, reason: 'محاكاة', rated: false };
      if (m = /^([a-z_]+)\.list$/.exec(action)) { if (!D[m[1]]) throw ERR('NOT_FOUND', 'غير متاح في المحاكاة'); return list(m[1], p); }
      if (m = /^([a-z_]+)\.get$/.exec(action)) {
        var def = SCHEMA().entities[m[1]]; var it = def && (D[m[1]] || []).filter(function (r) { return r[def.id] === (p[def.id] || p.id); })[0];
        if (!it) throw ERR('NOT_FOUND', 'السجل غير موجود'); return { item: it };
      }
      throw ERR('NOT_FOUND', 'هذه العملية غير متاحة في المحاكاة');
    }
  };
  window.Demo = Demo;
})();
