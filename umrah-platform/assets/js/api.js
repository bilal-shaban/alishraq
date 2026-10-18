/**
 * api.js — عميل واجهة Apps Script. كل الطلبات: POST نصي (text/plain) لتجنب preflight/CORS.
 * - يرفق رمز Firebase الحالي مع كل طلب (الخادم يتحقق منه؛ لا نرسل دوراً ولا Company_ID).
 * - الكتابات تحمل request_id ثابتاً عند إعادة المحاولة (منع التكرار).
 * - وضع المعاينة: لا تذهب أي طلبات إلى الخادم؛ تُجاب من Demo (قراءة فقط).
 */
(function () {
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }
  function ApiErr(code, message, details, status) { this.name = 'ApiErr'; this.code = code; this.message = message; this.details = details || null; this.status = status || 0; }
  ApiErr.prototype = Object.create(Error.prototype);

  var WRITE_RE = /\.(create|update|delete|publish|pause|submit|assign|unassign|void|import|invitePortal|mark|set|setPassengers|setStatus|retryInit|repairSheets|handle|resendInvite|updateContact|profile\.set|rolePermissions\.set)$/;

  var Api = {
    ApiErr: ApiErr,
    isWrite: function (action) { return WRITE_RE.test(action) && !/\.(list|get)$/.test(action); },

    call: async function (action, params, opts) {
      opts = opts || {};
      var cfg = window.UMRAH_CONFIG;
      if (window.Auth && Auth.isPreview() && !opts.public) return Demo.handle(action, params || {});
      if (!cfg.API_URL) throw new ApiErr('CONFIG_ERROR', 'لم يُضبط رابط الخادم (API_URL) في config.js. راجع docs/INSTALLATION.md');
      var write = opts.write !== undefined ? opts.write : Api.isWrite(action);
      var token = opts.public ? '' : await Auth.getToken();
      var body = JSON.stringify({ action: action, params: params || {}, token: token || undefined, request_id: write ? (opts.requestId || uuid()) : undefined });
      var attempt = 0, lastErr;
      while (attempt < (write ? 2 : 2)) {
        attempt++;
        try {
          var res = await fetch(cfg.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, redirect: 'follow' });
          var json;
          try { json = await res.json(); } catch (e) { throw new ApiErr('BAD_RESPONSE', 'استجابة غير مفهومة من الخادم (تأكد من رابط النشر وصلاحية الوصول)', null, res.status); }
          if (json && json.success) return json.data;
          var er = (json && json.error) || { code: 'UNKNOWN', message: 'خطأ غير معروف' };
          var e2 = new ApiErr(er.code, er.message, er.details, res.status);
          if ((er.code === 'UNAUTHENTICATED') && !opts.public) { Auth.onSessionExpired(); }
          throw e2;
        } catch (e) {
          if (e instanceof ApiErr) throw e;
          lastErr = new ApiErr('NETWORK', 'تعذر الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.');
          if (attempt >= 2) throw lastErr; // إعادة المحاولة مرة واحدة بنفس request_id (آمنة للكتابات)
          await new Promise(function (r) { setTimeout(r, 700); });
        }
      }
      throw lastErr;
    },

    pub: function (action, params) { return Api.call(action, params, { public: true, write: action === 'public.companyRequest' }); },

    /** رسالة خطأ مفهومة للمستخدم + أخطاء الحقول. */
    describe: function (e) {
      if (!e) return 'حدث خطأ';
      var msg = e.message || 'حدث خطأ';
      if (e.details && e.details.fields) {
        var parts = [];
        Object.keys(e.details.fields).forEach(function (k) { parts.push(e.details.fields[k]); });
        if (parts.length) msg += ' — ' + parts.join('، ');
      }
      return msg;
    }
  };
  window.Api = Api;
})();
