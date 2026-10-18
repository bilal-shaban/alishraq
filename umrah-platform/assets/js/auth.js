/**
 * auth.js — الدخول عبر Firebase Authentication (واجهة REST الرسمية، بلا مكتبات خارجية).
 * كلمات المرور تذهب إلى Google مباشرة ولا تمر بـ Apps Script ولا تُخزَّن في Sheets.
 * الجلسة: sessionStorage (تنتهي بإغلاق التبويب). «تذكرني» يحفظ refresh token فقط في localStorage.
 * هذه ليست قاعدة بيانات: لا تُخزَّن بيانات أعمال في المتصفح إطلاقاً.
 */
(function () {
  var SKEY = 'rm_auth', RKEY = 'rm_rt', PKEY = 'rm_preview';
  function cfg() { return window.UMRAH_CONFIG.FIREBASE; }
  function read(k, store) { try { return JSON.parse((store || sessionStorage).getItem(k) || 'null'); } catch (e) { return null; } }
  function write(k, v, store) { try { (store || sessionStorage).setItem(k, JSON.stringify(v)); } catch (e) { /* وضع خاص */ } }
  function del(k, store) { try { (store || sessionStorage).removeItem(k); } catch (e) { /* تجاهل */ } }

  function fbErr(code) {
    var map = {
      EMAIL_NOT_FOUND: 'لا يوجد حساب بهذا البريد', INVALID_PASSWORD: 'كلمة المرور غير صحيحة', INVALID_LOGIN_CREDENTIALS: 'البريد أو كلمة المرور غير صحيحة',
      USER_DISABLED: 'هذا الحساب معطّل', EMAIL_EXISTS: 'يوجد حساب بهذا البريد بالفعل. سجّل الدخول بدلاً من إنشاء حساب',
      WEAK_PASSWORD: 'كلمة المرور ضعيفة (6 أحرف على الأقل)', TOO_MANY_ATTEMPTS_TRY_LATER: 'محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة',
      INVALID_EMAIL: 'بريد إلكتروني غير صالح', OPERATION_NOT_ALLOWED: 'تسجيل البريد/كلمة المرور غير مفعّل في Firebase', MISSING_PASSWORD: 'أدخل كلمة المرور'
    };
    var key = String(code || '').split(' ')[0].split(':')[0];
    return map[key] || 'تعذر إكمال العملية (' + key + ')';
  }

  async function fb(path, payload, base) {
    var c = cfg();
    if (!c.apiKey) throw new Api.ApiErr('CONFIG_ERROR', 'لم يُضبط مفتاح Firebase في config.js. راجع docs/INSTALLATION.md');
    var res, json;
    try {
      res = await fetch((base || c.authBase) + '/' + path + (path.indexOf('?') === -1 ? '?' : '&') + 'key=' + encodeURIComponent(c.apiKey), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      json = await res.json();
    } catch (e) { throw new Api.ApiErr('NETWORK', 'تعذر الاتصال بخدمة الدخول. تحقق من الإنترنت'); }
    if (!res.ok) throw new Api.ApiErr('AUTH_FAILED', fbErr(json && json.error && json.error.message));
    return json;
  }

  function saveSession(j, remember) {
    var exp = Date.now() + (parseInt(j.expiresIn || j.expires_in, 10) || 3600) * 1000;
    var s = { idToken: j.idToken || j.id_token, refreshToken: j.refreshToken || j.refresh_token, exp: exp, email: j.email || (read(SKEY) || {}).email || '' };
    write(SKEY, s);
    if (remember === true) write(RKEY, s.refreshToken, localStorage);
    return s;
  }

  var Auth = {
    isPreview: function () { return !!read(PKEY); },
    previewKind: function () { return read(PKEY) || ''; },
    startPreview: function (kind) { write(PKEY, kind || 'company'); },
    endPreview: function () { del(PKEY); },

    signIn: async function (email, password, remember) {
      var j = await fb('accounts:signInWithPassword', { email: email, password: password, returnSecureToken: true });
      saveSession(j, remember);
      if (!remember) del(RKEY, localStorage);
      return true;
    },
    signUp: async function (email, password) {
      var j = await fb('accounts:signUp', { email: email, password: password, returnSecureToken: true });
      saveSession(j, false);
      await fb('accounts:sendOobCode', { requestType: 'VERIFY_EMAIL', idToken: j.idToken });
      return true;
    },
    resendVerification: async function () {
      var t = await Auth.getToken();
      await fb('accounts:sendOobCode', { requestType: 'VERIFY_EMAIL', idToken: t });
    },
    resetPassword: async function (email) { await fb('accounts:sendOobCode', { requestType: 'PASSWORD_RESET', email: email }); },

    refresh: async function () {
      var s = read(SKEY), rt = (s && s.refreshToken) || read(RKEY, localStorage);
      if (!rt) return null;
      var c = cfg();
      var res = await fetch(c.tokenBase + '/token?key=' + encodeURIComponent(c.apiKey), {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(rt)
      });
      if (!res.ok) { Auth.clear(); return null; }
      var j = await res.json();
      return saveSession(j, !!read(RKEY, localStorage));
    },

    getToken: async function () {
      var s = read(SKEY);
      if (s && s.exp - Date.now() > 120000) return s.idToken;
      var n = await Auth.refresh();
      if (!n) throw new Api.ApiErr('UNAUTHENTICATED', 'يلزم تسجيل الدخول');
      return n.idToken;
    },
    hasSession: function () { return !!(read(SKEY) || read(RKEY, localStorage)); },
    clear: function () { del(SKEY); del(RKEY, localStorage); },
    signOut: function () { Auth.clear(); Auth.endPreview(); location.href = 'login.html'; },
    onSessionExpired: function () { Auth.clear(); if (!/login\.html|index\.html|register-company\.html|\/$/.test(location.pathname)) location.href = 'login.html?expired=1'; }
  };
  window.Auth = Auth;
})();
