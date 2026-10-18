/**
 * config.js — إعدادات الواجهة العامة. لا أسرار هنا أبداً.
 * - API_URL: رابط Web App المنشور من Google Apps Script (ينتهي بـ /exec).
 * - FIREBASE.apiKey: «مفتاح الويب» لمشروع Firebase. هذا المفتاح عام بطبيعته (يُقيَّد من لوحة Google Cloud بالنطاق)،
 *   وليس سراً. الأسرار الحقيقية (BOT_TOKEN وغيره) في Script Properties على الخادم فقط.
 * للتطوير المحلي أنشئ config.local.js (مُستثنى من Git) لتجاوز القيم.
 */
window.UMRAH_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycby59EludkHs__0RnNiwAUt3bBJ0vEKh6c46RHbpJt6f9aHg-d80OydGrQNKjI6kLZzQbA/exec',
  FIREBASE: {
    apiKey: 'AIzaSyCiJyyWnhrxN4wJ2_5Ursnq7JuMjmcBjGE',
    authBase: 'https://identitytoolkit.googleapis.com/v1',
    tokenBase: 'https://securetoken.googleapis.com/v1'
  },
  APP_NAME: 'رفيق المعتمر',
  DEFAULT_LANG: 'ar',
  DEFAULT_COMPANY_SLUG: 'alishraq'
};
