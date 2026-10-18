/** dashboard.js — لوحة الشركة: بطاقات المحراب، الجارية الآن، القادمة، الإشعارات. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt;
  function stat(k, v, s) { return '<div class="col-6 col-lg-3"><div class="rm-stat"><div class="k">' + esc(k) + '</div><div class="v num">' + v + '</div><div class="s">' + esc(s || '') + '</div></div></div>'; }
  function moneyMap(m) { var ks = Object.keys(m || {}); if (!ks.length) return '<span class="num">0</span>'; return ks.map(function (c) { return '<span class="num">' + Fmt.num(m[c]) + '</span><small>' + esc(c) + '</small>'; }).join(' '); }

  A.Pages.dashboard = async function (ctx) {
    var root = ctx.shell('dashboard', 'لوحة التحكم', 'نظرة سريعة على حملاتك اليوم');
    root.innerHTML = A.skeleton(4);
    var d;
    try { d = await Api.call('dashboard.company', {}); } catch (e) { root.innerHTML = A.errBox(e, true); root.addEventListener('click', function (ev) { if (ev.target.closest('[data-retry]')) location.reload(); }); return; }
    var c = d.cards || {}, h = '<div class="row g-3 mb-4">';
    if (c.pilgrims !== undefined) h += stat('المعتمرون', Fmt.num(c.pilgrims), 'مسجَّلون في الشركة');
    if (c.campaigns_open !== undefined) h += stat('حملات مفتوحة', Fmt.num(c.campaigns_open), 'من أصل ' + Fmt.num(c.campaigns_total));
    if (c.bookings_active !== undefined) h += stat('حجوزات نشطة', Fmt.num(c.bookings_active), Fmt.num(c.bookings_pending) + ' بانتظار التأكيد');
    if (c.inquiries_open !== undefined) h += stat('طلبات مساعدة مفتوحة', Fmt.num(c.inquiries_open), 'بانتظار المعالجة');
    if (c.revenue) h += stat('الدفعات المسجَّلة', moneyMap(c.revenue), 'تسجيل يدوي — ليس تحصيلاً إلكترونياً');
    if (c.expenses) h += stat('المصاريف المسجَّلة', moneyMap(c.expenses), '');
    if (c.rating_count) h += stat('متوسط التقييم', (c.rating_average === null ? '—' : Fmt.num(c.rating_average) + '<small>/ 5</small>'), Fmt.num(c.rating_count) + ' تقييماً');
    h += '</div>';

    var live = (d.live || []), up = (d.upcoming || []);
    function item(s) { return '<li><div class="flex-grow-1"><div class="fw-bold">' + esc(s.Title) + '</div><div class="small text-secondary">' + esc(A.enumLabel('schedule', 'Category', s.Category)) + (s.Location ? ' · ' + esc(s.Location) : '') + '</div></div><div class="text-end"><div class="num small">' + Fmt.time(s.Date_Time) + '</div>' + A.liveBadge(s.live_state) + '</div></li>'; }
    h += '<div class="row g-3"><div class="col-lg-6"><div class="rm-card h-100"><div class="rm-card-head"><h2>جارٍ الآن</h2><span class="rm-live"></span></div>' +
      (live.length ? '<ul class="rm-list">' + live.map(item).join('') + '</ul>' : A.emptyBox('لا نشاط جارياً الآن', 'ستظهر هنا المواعيد فور بدئها.')) + '</div></div>' +
      '<div class="col-lg-6"><div class="rm-card h-100"><div class="rm-card-head"><h2>المواعيد القادمة</h2>' + (ctx.can('schedule.read') ? '<a class="btn btn-sm btn-ghost" href="schedule.html">البرنامج كاملاً</a>' : '') + '</div>' +
      (up.length ? '<ul class="rm-list">' + up.map(item).join('') + '</ul>' : A.emptyBox('لا مواعيد قادمة', 'أضف أنشطة من صفحة البرنامج.')) + '</div></div></div>';
    h += '<p class="text-secondary small mt-4 mb-0">آخر تحديث: ' + Fmt.dateTime(d.server_time) + ' · المنطقة الزمنية: ' + esc(ctx.tz) + '</p>';
    root.innerHTML = h;
  };
})();
