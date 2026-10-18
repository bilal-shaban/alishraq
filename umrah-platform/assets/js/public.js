/** public.js — الصفحة الرئيسية، تسجيل الدخول، طلب إنشاء شركة. */
(function () {
  var A = window.App, esc = A.esc;
  var NAME = (window.UMRAH_CONFIG && UMRAH_CONFIG.APP_NAME) || 'رفيق المعتمر';
  var ARCH = '<svg viewBox="0 0 240 120" aria-hidden="true"><g fill="none" stroke="#c9a24b" stroke-width="1" opacity=".55"><path d="M0 110h240"/><path d="M20 110V70q0-18 18-18t18 18v40M92 110V60q0-26 28-26t28 26v50M164 110V70q0-18 18-18t18 18v40"/></g><g fill="#dcc283" opacity=".85"><circle cx="120" cy="18" r="3"/><path d="M118 4h4v6h-4z"/></g></svg>';
  function themeBtn() { return '<button class="rm-icon-btn" id="pub-theme" aria-label="تبديل المظهر" title="تبديل المظهر">' + A.icon('sun') + '</button>'; }
  function bindTheme() { var b = A.$('#pub-theme'); if (b) b.addEventListener('click', function () { A.applyTheme(A.theme() === 'dark' ? 'light' : 'dark'); }); }
  function alertBox(t, k) { return '<div class="alert alert-' + (k || 'danger') + ' py-2" role="alert">' + esc(t) + '</div>'; }
  function errText(e) { return e && (e.details && e.details.fields ? Object.keys(e.details.fields).map(function (k) { return e.details.fields[k]; }).join('، ') : '') || Api.describe(e); }

  /* ---------------- الرئيسية ---------------- */
  function renderIndex() {
    var root = document.getElementById('app-root');
    var features = [['المعتمرون والحجوزات', 'ملف لكل معتمر، حجوزات بسعة محسوبة، وتنبيه عند تجاوز السعة.'], ['دفعات ومصاريف', 'تسجيل يدوي بسجل لا يُحذف — يُلغى فقط. لا بيانات بطاقات ولا تحصيل إلكتروني.'], ['برنامج حي', 'مواعيد بتوقيت شركتك وحالة «جارٍ الآن» تُحسب في الخادم.'], ['غرف ونقل', 'توزيع على غرف مكة والمدينة، ورحلات بكشف ركاب وفحص تعارض.'], ['بوابة المعتمر', 'يرى المعتمر برنامجه وإعلانات حملته ويرسل طلب مساعدة ويقيّم.'], ['عزل وصلاحيات', 'كل شركة في ملف منفصل، وثمانية أدوار تُضبط صلاحياتها ضمن حدّ مقفل.']];
    var faq = [['هل بياناتنا منفصلة عن الشركات الأخرى؟', 'نعم. لكل شركة ملف Google Sheets خاص بها يُنشأ تلقائياً، ويُحدَّد من حساب المستخدم الموثّق على الخادم لا من المتصفح.'], ['هل تُخزَّن كلمات المرور؟', 'لا. المصادقة عبر Firebase Auth، ولا تُحفظ كلمات المرور في Sheets أو في المنصة.'], ['هل تحصّل المنصة المدفوعات؟', 'لا. الدفعات تسجيل يدوي لما استلمتموه خارج المنصة.'], ['ماذا يُرسل عبر تيليجرام؟', 'تنبيهات تشغيلية فقط. لا كلمات مرور ولا جوازات ولا تفاصيل دفع، وفشل الإرسال لا يمنع حفظ أي عملية.']];
    root.innerHTML =
      '<header class="rm-pub-top"><a class="rm-brand-row" href="index.html">' + A.MARK + '<b class="rm-display">' + esc(NAME) + '</b></a><nav class="d-flex align-items-center gap-2">' + themeBtn() + '<a class="btn btn-ghost" href="login.html">تسجيل الدخول</a><a class="btn btn-gold d-none d-sm-inline-flex" href="register-company.html">سجّل شركتك</a></nav></header>' +
      '<main id="rm-main"><section class="rm-hero rm-pattern"><div class="rm-hero-in"><div><div class="rm-rule" style="max-width:260px"><i></i></div><h1>إدارة حملة العمرة،<br><span style="color:var(--rm-gold-bright)">بهدوء ودقّة</span></h1><p class="lead">منصة عربية لشركات العمرة: معتمرون وحجوزات ودفعات وغرف ونقل وبرنامج يومي، وبوابة لكل معتمر — كل شركة في ملف بياناتها الخاص.</p><div class="d-flex flex-wrap gap-2 mt-4"><a class="btn btn-gold btn-lg" href="register-company.html">ابدأ بتسجيل شركتك</a><a class="btn btn-ghost btn-lg" href="login.html">لدي حساب</a></div><p class="small text-secondary mt-3 mb-0">لا خدمات مدفوعة ولا بطاقات. تعمل على Google Sheets وApps Script وFirebase Auth.</p></div><div class="rm-arch" aria-hidden="true"><div>' + ARCH + '</div></div></div></section>' +
      '<section class="rm-sec"><h2 class="rm-sec-h">ما تحتاجه الحملة</h2><div class="row g-3">' + features.map(function (f) { return '<div class="col-md-6 col-lg-4"><div class="rm-card h-100"><h3 class="fs-5">' + f[0] + '</h3><p class="text-secondary mb-0">' + f[1] + '</p></div></div>'; }).join('') + '</div></section>' +
      '<section class="rm-sec"><h2 class="rm-sec-h">أسئلة شائعة</h2><div class="accordion" id="faq">' + faq.map(function (q, i) { return '<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#fq' + i + '">' + q[0] + '</button></h3><div id="fq' + i + '" class="accordion-collapse collapse" data-bs-parent="#faq"><div class="accordion-body">' + q[1] + '</div></div></div>'; }).join('') + '</div></section>' +
      '<section class="rm-sec"><div class="rm-card text-center"><h2>جرّب النسخة التجريبية</h2><p class="text-secondary">بيانات وهمية للمحاكاة فقط — لا اتصال بالخادم، لا كتابة، ولا إشعارات حقيقية.</p><div class="d-flex flex-wrap gap-2 justify-content-center"><button class="btn btn-ghost" data-prev="company">لوحة شركة (محاكاة)</button><button class="btn btn-ghost" data-prev="portal">بوابة معتمر (محاكاة)</button><button class="btn btn-ghost" data-prev="platform">لوحة المنصة (محاكاة)</button></div></div></section></main>' +
      '<footer class="rm-pub-foot"><span>© ' + esc(NAME) + '</span><span class="text-secondary small">أدوات إدارة — لا تحصيل إلكتروني ولا تخزين بطاقات</span></footer>';
    bindTheme();
    root.addEventListener('click', function (ev) { var b = ev.target.closest('[data-prev]'); if (!b) return; Auth.startPreview(b.getAttribute('data-prev')); location.href = { company: 'company-dashboard.html', portal: 'portal.html', platform: 'platform-admin.html' }[b.getAttribute('data-prev')]; });
  };

  /* ---------------- الدخول ---------------- */
  function renderLogin() {
    var root = document.getElementById('app-root'), mode = 'in';
    var expired = A.qs('expired');
    root.innerHTML = '<div class="rm-auth"><div class="rm-auth-art rm-pattern"><div class="rm-arch"><div>' + ARCH + '</div></div></div><div class="rm-auth-form"><div class="rm-auth-card"><div class="d-flex justify-content-between align-items-center mb-4"><a class="rm-brand-row" href="index.html">' + A.MARK + '<b class="rm-display">' + esc(NAME) + '</b></a>' + themeBtn() + '</div><div id="lg-body"></div></div></div></div>';
    bindTheme();
    var body = A.$('#lg-body');
    function draw() {
      var t = { in: 'تسجيل الدخول', up: 'حساب جديد بدعوة', reset: 'استعادة كلمة المرور' }[mode];
      body.innerHTML = '<h1 class="mb-1">' + t + '</h1><p class="text-secondary">' + (mode === 'up' ? 'استخدم نفس البريد الذي دعتك به شركتك.' : (mode === 'reset' ? 'سنرسل رابط الاستعادة إلى بريدك.' : 'ادخل بحسابك. الحسابات تُنشأ بدعوة من الشركة.')) + '</p>' + (expired && mode === 'in' ? alertBox('انتهت جلستك، سجّل الدخول من جديد', 'warning') : '') +
        '<form id="lf" novalidate><div class="mb-3"><label class="form-label" for="l-e">البريد الإلكتروني</label><input id="l-e" type="email" dir="ltr" class="form-control" autocomplete="username" required></div>' +
        (mode !== 'reset' ? '<div class="mb-3"><label class="form-label" for="l-p">كلمة المرور</label><input id="l-p" type="password" dir="ltr" class="form-control" autocomplete="' + (mode === 'up' ? 'new-password' : 'current-password') + '" required minlength="6"></div>' : '') +
        (mode === 'in' ? '<div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="l-r"><label class="form-check-label" for="l-r">تذكّرني على هذا الجهاز</label></div>' : '') +
        '<div id="l-m"></div><button class="btn btn-gold w-100" type="submit">' + (mode === 'in' ? 'دخول' : (mode === 'up' ? 'إنشاء الحساب' : 'إرسال الرابط')) + '</button></form>' +
        '<div class="d-flex justify-content-between mt-3 small">' + (mode === 'in' ? '<a href="#" data-m="reset">نسيت كلمة المرور؟</a><a href="#" data-m="up">لدي دعوة من شركتي</a>' : '<a href="#" data-m="in">العودة لتسجيل الدخول</a>') + '</div>' +
        (mode === 'in' ? '<hr><div class="rm-sim"><div class="small fw-bold mb-1">محاكاة (ليست دخولاً حقيقياً)</div><div class="d-flex flex-wrap gap-2"><button class="btn btn-sm btn-ghost" data-prev="company">شركة</button><button class="btn btn-sm btn-ghost" data-prev="portal">معتمر</button><button class="btn btn-sm btn-ghost" data-prev="platform">المنصة</button></div><div class="small text-secondary mt-1">بيانات وهمية للعرض فقط، بلا كتابة ولا إشعارات.</div></div>' : '');
    }
    draw();
    body.addEventListener('click', function (ev) {
      var m = ev.target.closest('[data-m]'); if (m) { ev.preventDefault(); mode = m.getAttribute('data-m'); draw(); return; }
      var p = ev.target.closest('[data-prev]'); if (p) { Auth.startPreview(p.getAttribute('data-prev')); location.href = { company: 'company-dashboard.html', portal: 'portal.html', platform: 'platform-admin.html' }[p.getAttribute('data-prev')]; }
    });
    body.addEventListener('submit', async function (ev) {
      ev.preventDefault(); var out = A.$('#l-m'), btn = ev.target.querySelector('button[type=submit]'), email = A.$('#l-e').value.trim(), pw = A.$('#l-p') ? A.$('#l-p').value : '';
      if (!email) { out.innerHTML = alertBox('أدخل البريد الإلكتروني'); return; }
      btn.disabled = true; out.innerHTML = '';
      try {
        Auth.endPreview();
        if (mode === 'reset') { await Auth.resetPassword(email); out.innerHTML = alertBox('إن كان البريد مسجَّلاً فستصلك رسالة الاستعادة.', 'success'); }
        else if (mode === 'up') { await Auth.signUp(email, pw); out.innerHTML = alertBox('أُنشئ الحساب وأُرسل رابط التأكيد إلى بريدك. أكّده ثم سجّل الدخول.', 'success'); Auth.clear(); }
        else {
          await Auth.signIn(email, pw, A.$('#l-r').checked);
          var me = await Api.call('auth.me', {}); location.replace(A.homeFor(me));
        }
      } catch (e) {
        if (mode === 'in') Auth.clear();
        out.innerHTML = alertBox(e.code === 'AUTH_FAILED' || e.code === 'CONFIG_ERROR' || e.code === 'NETWORK' ? e.message : Api.describe(e));
      }
      btn.disabled = false;
    });
  };

  /* ---------------- طلب إنشاء شركة ---------------- */
  A.Pages.registerCompany = function () {
    var root = document.getElementById('app-root');
    root.innerHTML = '<div class="rm-auth"><div class="rm-auth-art rm-pattern"><div class="rm-arch"><div>' + ARCH + '</div></div></div><div class="rm-auth-form"><div class="rm-auth-card"><div class="d-flex justify-content-between align-items-center mb-4"><a class="rm-brand-row" href="index.html">' + A.MARK + '<b class="rm-display">' + esc(NAME) + '</b></a>' + themeBtn() + '</div>' +
      '<h1 class="mb-1">سجّل شركتك</h1><p class="text-secondary">يصلنا طلبك ونراجعه ثم نُنشئ ملف بيانات شركتك ونرسل دعوة للمدير.</p><form id="rf" novalidate><div class="row g-3">' +
      [['Company_Name', 'اسم الشركة', 'text'], ['Contact_Name', 'اسم المسؤول', 'text'], ['Email', 'البريد الإلكتروني', 'email'], ['Phone', 'الهاتف', 'tel'], ['Country', 'الدولة', 'text']].map(function (f) { return '<div class="col-12"><label class="form-label" for="f_' + f[0] + '">' + f[1] + '</label><input class="form-control" id="f_' + f[0] + '" name="' + f[0] + '" type="' + f[2] + '"' + (f[2] === 'email' || f[2] === 'tel' ? ' dir="ltr"' : '') + (f[0] === 'Company_Name' || f[0] === 'Contact_Name' || f[0] === 'Email' ? ' required' : '') + '><div class="invalid-feedback" data-err="' + f[0] + '"></div></div>'; }).join('') +
      '<div class="col-12"><label class="form-label" for="f_Message">ملاحظات</label><textarea class="form-control" id="f_Message" name="Message" rows="3" maxlength="800"></textarea></div><div style="position:absolute;inset-inline-start:-9999px" aria-hidden="true"><label>الموقع<input name="website" tabindex="-1" autocomplete="off"></label></div></div><div id="rf-m" class="mt-3"></div><button class="btn btn-gold w-100 mt-3" type="submit">إرسال الطلب</button></form><p class="small text-secondary mt-3 mb-0">هل لديك حساب؟ <a href="login.html">سجّل الدخول</a></p></div></div></div>';
    bindTheme();
    A.$('#rf').addEventListener('submit', async function (ev) {
      ev.preventDefault(); var f = ev.target, out = A.$('#rf-m'), btn = f.querySelector('button[type=submit]'); out.innerHTML = '';
      A.$$('.is-invalid', f).forEach(function (x) { x.classList.remove('is-invalid'); });
      var v = {}; ['Company_Name', 'Contact_Name', 'Email', 'Phone', 'Country', 'Message', 'website'].forEach(function (k) { v[k] = f.elements[k].value; });
      btn.disabled = true;
      try { var r = await Api.pub('public.companyRequest', v); f.reset(); out.innerHTML = alertBox('وصلنا طلبك. رقم المرجع: ' + (r.reference || ''), 'success'); }
      catch (e) {
        var fl = e.details && e.details.fields; if (fl) Object.keys(fl).forEach(function (k) { var i = f.elements[k], fb = A.$('[data-err="' + k + '"]', f); if (i) i.classList.add('is-invalid'); if (fb) { fb.textContent = fl[k]; fb.style.display = 'block'; } });
        out.innerHTML = alertBox(e.message || Api.describe(e));
      }
      btn.disabled = false;
    });
  };

  /* إذا كان المستخدم مسجَّلاً من قبل («تذكرني» أو جلسة مفتوحة) ندخله مباشرة بدل عرض شاشة الدخول */
  async function resumeSession() {
    try {
      if (!Auth.hasSession() || Auth.isPreview() || A.qs('expired')) return false;
      var me = await Api.call('auth.me', {});
      if (!me) return false;
      location.replace(A.homeFor(me));
      return true;
    } catch (e) { return false; }
  }
  function withResume(render) {
    return function () {
      if (!Auth.hasSession() || Auth.isPreview() || A.qs('expired')) { render(); return; }
      var root = document.getElementById('app-root');
      if (root) root.innerHTML = '<div class="d-flex justify-content-center align-items-center" style="min-height:60vh"><span class="text-secondary">جارٍ التحقق من تسجيل الدخول…</span></div>';
      resumeSession().then(function (done) { if (!done) render(); });
    };
  }
  A.Pages.index = withResume(renderIndex);
  A.Pages.login = withResume(renderLogin);
})();
