/**
 * i18n.js — بنية الترجمة. العربية هي اللغة الأصلية الكاملة؛ الإنجليزية/التركية/الأردية/الإندونيسية جاهزة
 * بنيوياً لعناصر الهيكل والدخول (أضف مفاتيح جديدة في القواميس أدناه). نصوص صفحات الإدارة عربية حالياً (انظر docs/KNOWN-LIMITATIONS).
 * الاستخدام: I18n.t('nav.dashboard')  — وعلى عناصر HTML: <span data-i18n="auth.login"></span>
 */
(function () {
  var DICT = {
    ar: {
      'app.name': 'رفيق المعتمر', 'nav.dashboard': 'لوحة التحكم', 'nav.pilgrims': 'المعتمرون', 'nav.bookings': 'الحجوزات', 'nav.campaigns': 'الحملات',
      'nav.payments': 'الدفعات', 'nav.expenses': 'المصاريف', 'nav.hotels': 'الفنادق', 'nav.rooms': 'الغرف', 'nav.transport': 'النقل', 'nav.schedule': 'البرنامج',
      'nav.announcements': 'الإعلانات', 'nav.inquiries': 'طلبات المساعدة', 'nav.ratings': 'التقييمات', 'nav.reports': 'التقارير', 'nav.team': 'فريق العمل',
      'nav.settings': 'الإعدادات', 'nav.sheikh': 'مساحة الشيخ', 'nav.portal': 'رحلتي', 'nav.platform': 'إدارة المنصة',
      'auth.login': 'تسجيل الدخول', 'auth.email': 'البريد الإلكتروني', 'auth.password': 'كلمة المرور', 'auth.logout': 'تسجيل الخروج', 'auth.forgot': 'نسيت كلمة المرور؟',
      'auth.create': 'إنشاء حساب', 'auth.have_invite': 'لدي دعوة من شركتي', 'common.save': 'حفظ', 'common.cancel': 'إلغاء', 'common.delete': 'حذف', 'common.edit': 'تعديل',
      'common.add': 'إضافة', 'common.search': 'بحث', 'common.loading': 'جارٍ التحميل…', 'common.retry': 'إعادة المحاولة', 'common.none': 'لا توجد بيانات', 'common.preview': 'وضع المعاينة'
    },
    en: {
      'app.name': 'Umrah Companion', 'nav.dashboard': 'Dashboard', 'nav.pilgrims': 'Pilgrims', 'nav.bookings': 'Bookings', 'nav.campaigns': 'Campaigns', 'nav.payments': 'Payments',
      'nav.expenses': 'Expenses', 'nav.hotels': 'Hotels', 'nav.rooms': 'Rooms', 'nav.transport': 'Transport', 'nav.schedule': 'Schedule', 'nav.announcements': 'Announcements',
      'nav.inquiries': 'Help requests', 'nav.ratings': 'Ratings', 'nav.reports': 'Reports', 'nav.team': 'Team', 'nav.settings': 'Settings', 'nav.sheikh': 'Sheikh workspace', 'nav.portal': 'My journey', 'nav.platform': 'Platform admin',
      'auth.login': 'Sign in', 'auth.email': 'Email', 'auth.password': 'Password', 'auth.logout': 'Sign out', 'auth.forgot': 'Forgot password?', 'auth.create': 'Create account', 'auth.have_invite': 'I have an invitation',
      'common.save': 'Save', 'common.cancel': 'Cancel', 'common.delete': 'Delete', 'common.edit': 'Edit', 'common.add': 'Add', 'common.search': 'Search', 'common.loading': 'Loading…', 'common.retry': 'Retry', 'common.none': 'No data', 'common.preview': 'Preview mode'
    },
    tr: { 'app.name': 'Umre Yoldaşı', 'nav.dashboard': 'Pano', 'nav.pilgrims': 'Hacılar', 'nav.schedule': 'Program', 'auth.login': 'Giriş yap', 'auth.email': 'E-posta', 'auth.password': 'Parola', 'common.save': 'Kaydet', 'common.cancel': 'İptal' },
    ur: { 'app.name': 'رفیقِ معتمر', 'nav.dashboard': 'ڈیش بورڈ', 'nav.pilgrims': 'معتمرین', 'nav.schedule': 'پروگرام', 'auth.login': 'لاگ اِن', 'auth.email': 'ای میل', 'auth.password': 'پاس ورڈ', 'common.save': 'محفوظ کریں', 'common.cancel': 'منسوخ' },
    id: { 'app.name': 'Sahabat Umrah', 'nav.dashboard': 'Dasbor', 'nav.pilgrims': 'Jemaah', 'nav.schedule': 'Jadwal', 'auth.login': 'Masuk', 'auth.email': 'Email', 'auth.password': 'Kata sandi', 'common.save': 'Simpan', 'common.cancel': 'Batal' }
  };
  var RTL = { ar: true, ur: true };
  function get() { try { return localStorage.getItem('rm_lang') || (window.UMRAH_CONFIG && UMRAH_CONFIG.DEFAULT_LANG) || 'ar'; } catch (e) { return 'ar'; } }
  var lang = get();
  if (!DICT[lang]) lang = 'ar';
  window.I18n = {
    lang: lang, dict: DICT, languages: { ar: 'العربية', en: 'English', tr: 'Türkçe', ur: 'اردو', id: 'Bahasa Indonesia' },
    t: function (k) { return (DICT[lang] && DICT[lang][k]) || DICT.ar[k] || k; },
    set: function (l) { if (!DICT[l]) return; try { localStorage.setItem('rm_lang', l); } catch (e) { /* تجاهل */ } location.reload(); },
    apply: function (root) {
      var r = root || document;
      r.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = I18n.t(el.getAttribute('data-i18n')); });
      r.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.setAttribute('placeholder', I18n.t(el.getAttribute('data-i18n-ph'))); });
    },
    init: function () {
      document.documentElement.lang = lang;
      document.documentElement.dir = RTL[lang] ? 'rtl' : 'ltr';
    }
  };
  I18n.init();
})();
