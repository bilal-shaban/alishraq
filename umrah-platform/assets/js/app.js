/**
 * app.js — نواة الواجهة: أدوات، أيقونات، رسائل، نوافذ، نماذج مولَّدة من المخطط، جداول بحث/ترتيب/ترقيم،
 * هيكل التطبيق (شريط جانبي/علوي)، والإقلاع. كل نص قادم من الخادم يمرّ عبر esc() قبل إدراجه.
 */
(function () {
  'use strict';
  var Pages = window.Pages = window.Pages || {};

  /* ---------------- أدوات ---------------- */
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function qs(name) { return new URLSearchParams(location.search).get(name); }

  var ICONS = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    scan: 'M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16',
    users: 'M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20c0-3.3 3.6-5 8-5s8 1.7 8 5',
    ticket: 'M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4V8zM14 6v12',
    flag: 'M5 21V4m0 0h11l-2 4 2 4H5',
    coins: 'M12 6c4 0 7-1 7-2.5S16 1 12 1 5 2 5 3.5 8 6 12 6zM5 3.5v4C5 9 8 10 12 10s7-1 7-2.5v-4M5 8v4c0 1.5 3 2.5 7 2.5M12 14.5v4c-4 0-7-1-7-2.5v-4',
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    bed: 'M3 18V7M3 14h18v4M21 14v-3a3 3 0 00-3-3h-7v6M7 11h.01',
    bus: 'M5 17V6a2 2 0 012-2h10a2 2 0 012 2v11M5 12h14M7 20v-3M17 20v-3M8.5 15h.01M15.5 15h.01',
    cal: 'M5 5h14a1 1 0 011 1v14H4V6a1 1 0 011-1zM4 10h16M8 3v4M16 3v4',
    mosque: 'M12 2c1.5 2 1.5 3 0 4-1.5-1-1.5-2 0-4zM6 21V13a6 6 0 0112 0v8M3 21h18M9 21v-4a3 3 0 016 0v4',
    mega: 'M4 10v4l10 4V6L4 10zM14 8c3 0 5 1.5 5 4s-2 4-5 4M7 14l1 6',
    help: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z',
    team: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 19c0-2.8 2.7-4.5 6-4.5M16 12a2.5 2.5 0 100-5M21 19c0-2.4-2-4-5-4',
    cog: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 00-2.2-1.3L14 3h-4l-.4 2.5a7 7 0 00-2.2 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 002.2 1.3L10 21h4l.4-2.5a7 7 0 002.2-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z',
    bell: 'M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 004 0',
    menu: 'M4 6h16M4 12h16M4 18h16',
    search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
    sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
    moon: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
    out: 'M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 8l-4 4 4 4M6 12h10',
    plus: 'M12 5v14M5 12h14',
    globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
    building: 'M4 21V5l8-2v18M12 9l8 2v10M8 8h.01M8 12h.01M8 16h.01M16 14h.01M16 18h.01'
  };
  function icon(name, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICONS[name] || ICONS.help) + '"/></svg>'; }

  var MARK = '<img class="rm-mark" src="assets/images/logo.png" alt="" width="44" height="44">';

  /* ---------------- تنسيق ---------------- */
  var S = { me: null, schema: null, tz: 'Asia/Riyadh', currency: 'SAR' };
  var Fmt = {
    date: function (s) {
      if (!s) return '—';
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s)); if (!m) return esc(s);
      try { return new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))); } catch (e) { return esc(s); }
    },
    time: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso); if (isNaN(d)) return esc(iso);
      try { return new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: S.tz }).format(d); } catch (e) { return esc(iso); }
    },
    dateTime: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso); if (isNaN(d)) return esc(iso);
      try { return new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: S.tz }).format(d); } catch (e) { return esc(iso); }
    },
    money: function (n, cur) {
      if (n === '' || n === null || n === undefined) return '—';
      return new Intl.NumberFormat('ar-u-nu-latn', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n)) + ' ' + esc(cur || S.currency);
    },
    num: function (n) { return new Intl.NumberFormat('ar-u-nu-latn').format(Number(n) || 0); },
    /** ISO بإزاحة → قيمة حقل datetime-local بتوقيت الشركة */
    toInput: function (iso) {
      if (!iso) return '';
      var d = new Date(iso); if (isNaN(d)) return '';
      var p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: S.tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
      return p.year + '-' + p.month + '-' + p.day + 'T' + p.hour + ':' + p.minute;
    },
    todayStr: function () { var p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: S.tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); return p.year + '-' + p.month + '-' + p.day; }
  };

  var BADGE = {
    ok: ['confirmed', 'paid', 'active', 'published', 'completed', 'present', 'open', 'ready', 'available', 'recorded', 'live', 'approved'],
    warn: ['pending', 'partial', 'invited', 'draft', 'pending_approval', 'waiting', 'late', 'in_progress', 'unpaid', 'maintenance', 'high', 'sheet_created', 'upcoming', 'new'],
    bad: ['cancelled', 'void', 'absent', 'failed', 'disabled', 'suspended', 'urgent', 'rejected'],
    info: ['overpaid', 'full', 'excused', 'scheduled', 'normal'],
    mute: ['none', 'closed', 'ended', 'paused', 'inactive', 'hidden', 'low']
  };
  function badgeClass(v) { for (var k in BADGE) { if (BADGE[k].indexOf(v) !== -1) return k; } return ''; }
  function enumLabel(entity, field, value) {
    var d = S.schema && S.schema.entities && S.schema.entities[entity];
    var f = d && d.fields.filter(function (x) { return x.name === field; })[0];
    return (f && f.enumLabels && f.enumLabels[value]) || value;
  }
  function badge(entity, field, value) {
    if (value === '' || value === undefined || value === null) return '<span class="text-secondary">—</span>';
    return '<span class="rm-badge ' + badgeClass(value) + '">' + esc(enumLabel(entity, field, value)) + '</span>';
  }
  var LIVE = { live: ['ok', 'جارٍ الآن'], upcoming: ['warn', 'قادم'], ended: ['mute', 'منتهٍ'], cancelled: ['bad', 'ملغى'] };
  function liveBadge(st) { var x = LIVE[st] || ['', st]; return '<span class="rm-badge ' + x[0] + '">' + (st === 'live' ? '<span class="rm-live"></span>' : '') + esc(x[1]) + '</span>'; }

  /* ---------------- رسائل ونوافذ ---------------- */
  function toast(msg, kind) {
    var host = $('#rm-toasts');
    if (!host) { host = document.createElement('div'); host.id = 'rm-toasts'; host.className = 'toast-container position-fixed bottom-0 start-0 p-3'; host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    var el = document.createElement('div');
    el.className = 'toast rm-toast ' + (kind || ''); el.setAttribute('role', kind === 'bad' ? 'alert' : 'status');
    el.innerHTML = '<div class="d-flex"><div class="toast-body">' + esc(msg) + '</div><button type="button" class="btn-close m-2 ms-auto" data-bs-dismiss="toast" aria-label="إغلاق"></button></div>';
    host.appendChild(el);
    var t = new bootstrap.Toast(el, { delay: kind === 'bad' ? 7000 : 3800 });
    el.addEventListener('hidden.bs.toast', function () { el.remove(); });
    t.show();
  }

  function modal(opts) {
    var el = document.createElement('div');
    el.className = 'modal fade'; el.tabIndex = -1; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered ' + (opts.size ? 'modal-' + opts.size : '') + '"><div class="modal-content">' +
      '<div class="modal-header"><h2 class="modal-title fs-5">' + esc(opts.title || '') + '</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button></div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' + (opts.footer === false ? '' : '<div class="modal-footer">' + (opts.footer || '') + '</div>') + '</div></div>';
    document.body.appendChild(el);
    var m = new bootstrap.Modal(el, { backdrop: opts.static ? 'static' : true });
    el.addEventListener('hidden.bs.modal', function () { m.dispose(); el.remove(); if (opts.onClose) opts.onClose(); });
    m.show();
    return { el: el, close: function () { m.hide(); }, modal: m };
  }

  function confirmBox(o) {
    return new Promise(function (resolve) {
      var done = false;
      var m = modal({
        title: o.title || 'تأكيد', size: 'sm',
        body: '<p class="mb-0">' + esc(o.text || '') + '</p>' + (o.askReason ? '<div class="mt-3"><label class="form-label">' + esc(o.reasonLabel || 'السبب') + '</label><input class="form-control" id="rm-reason" maxlength="200" autocomplete="off"><div class="invalid-feedback">أدخل السبب (3 أحرف على الأقل)</div></div>' : ''),
        footer: '<button class="btn btn-ghost" data-bs-dismiss="modal">إلغاء</button><button class="btn ' + (o.danger ? 'btn-danger-soft' : 'btn-gold') + '" id="rm-confirm-ok">' + esc(o.okLabel || 'تأكيد') + '</button>',
        onClose: function () { if (!done) resolve(null); }
      });
      $('#rm-confirm-ok', m.el).addEventListener('click', function () {
        var reason = null;
        if (o.askReason) { var inp = $('#rm-reason', m.el); reason = inp.value.trim(); if (reason.length < 3) { inp.classList.add('is-invalid'); inp.focus(); return; } }
        done = true; resolve(o.askReason ? { reason: reason } : {}); m.close();
      });
    });
  }

  function errBox(e, retry) {
    return '<div class="alert alert-danger d-flex flex-wrap gap-2 align-items-center justify-content-between" role="alert"><span>' + esc(Api.describe(e)) + '</span>' + (retry ? '<button class="btn btn-sm btn-ghost" data-retry>إعادة المحاولة</button>' : '') + '</div>';
  }
  function emptyBox(title, hint, actionHtml) {
    return '<div class="rm-empty"><svg class="rm-empty-mark" viewBox="0 0 44 50" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M22 3c9 8 16 14 16 26v19H6V29C6 17 13 11 22 3z"/><path d="M22 18l2.2 4.6 5 .8-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.8z"/></svg><h3>' + esc(title) + '</h3><p class="mb-3">' + esc(hint || '') + '</p>' + (actionHtml || '') + '</div>';
  }
  function skeleton(rows) { var h = ''; for (var i = 0; i < (rows || 5); i++) h += '<div class="rm-skel mb-3" style="height:2.2rem"></div>'; return '<div class="p-3">' + h + '</div>'; }
  function can(p) { return !!(S.me && (S.me.permissions || []).indexOf(p) !== -1); }
  function anyCan(list) { return list.some(can); }

  /* ---------------- مراجع (قوائم الاختيار) ---------------- */
  var REF_LABEL = {
    pilgrims: function (r) { return r.Full_Name + (r.Pilgrim_Code ? ' (' + r.Pilgrim_Code + ')' : ''); },
    campaigns: function (r) { return r.Campaign_Name; },
    hotels: function (r) { return r.Hotel_Name; },
    vehicles: function (r) { return r.Vehicle_Type + ' — ' + r.Vehicle_Number; },
    bookings: function (r) { return r.Booking_No; },
    schedule: function (r) { return r.Title; },
    rooms: function (r) { return 'غرفة ' + r.Room_Number; }
  };
  var refCache = {};
  var Refs = {
    load: async function (key) {
      if (refCache[key]) return refCache[key];
      var res = await Api.call(key + '.list', { limit: 500, sort: 'Created_At', dir: 'desc' });
      var fn = REF_LABEL[key] || function (r) { return r[Object.keys(r)[0]]; };
      refCache[key] = (res.items || []).map(function (r) { return { v: r[S.schema.entities[key].id], l: fn(r), row: r }; });
      return refCache[key];
    },
    clear: function () { refCache = {}; },
    label: function (key, id) { var l = (refCache[key] || []).filter(function (x) { return x.v === id; })[0]; return l ? l.l : id; }
  };

  /* ---------------- النماذج ---------------- */
  var Form = {
    /** يبني حقولاً من تعريفات المخطط (أو تعريفات مخصصة بنفس الشكل). */
    fieldsFor: function (entity, mode, only) {
      var d = S.schema.entities[entity];
      return d.fields.filter(function (f) {
        if (f.sys || f.ro) return false;
        if (mode === 'edit' && f.createOnly) return false;
        if (only && only.indexOf(f.name) === -1) return false;
        return true;
      });
    },
    inputHtml: function (f, val, refs) {
      var id = 'f_' + f.name, v = (val === undefined || val === null) ? '' : val;
      var req = f.required ? ' required' : '';
      var dis = f.readonly ? ' disabled' : '';
      switch (f.type) {
        case 'text': return '<textarea class="form-control" id="' + id + '" name="' + f.name + '" rows="3" maxlength="' + (f.max || 2000) + '"' + req + dis + '>' + esc(v) + '</textarea>';
        case 'enum':
          var opts = (f.enumValues || []).map(function (x) { return '<option value="' + esc(x) + '"' + (String(v) === x ? ' selected' : '') + '>' + esc((f.enumLabels || {})[x] || x) + '</option>'; }).join('');
          return '<select class="form-select" id="' + id + '" name="' + f.name + '"' + req + dis + '>' + (f.required && !f.def ? '<option value="">— اختر —</option>' : '') + opts + '</select>';
        case 'ref':
          var list = (refs && refs[f.ref]) || [];
          return '<select class="form-select" id="' + id + '" name="' + f.name + '"' + req + dis + '><option value="">— اختر —</option>' + list.map(function (o) { return '<option value="' + esc(o.v) + '"' + (v === o.v ? ' selected' : '') + '>' + esc(o.l) + '</option>'; }).join('') + '</select>';
        case 'bool': return '<div class="form-check form-switch pt-1"><input class="form-check-input" type="checkbox" role="switch" id="' + id + '" name="' + f.name + '"' + ((v === true || v === 'true') ? ' checked' : '') + dis + '></div>';
        case 'int': case 'number': case 'money':
          return '<input class="form-control num" type="number" inputmode="decimal" id="' + id + '" name="' + f.name + '" value="' + esc(v) + '"' + (f.min !== undefined ? ' min="' + f.min + '"' : '') + (f.max !== undefined ? ' max="' + f.max + '"' : '') + (f.type === 'money' ? ' step="0.01"' : (f.type === 'int' ? ' step="1"' : ' step="any"')) + req + dis + '>';
        case 'date': return '<input class="form-control" type="date" id="' + id + '" name="' + f.name + '" value="' + esc(String(v).substring(0, 10)) + '"' + req + dis + '>';
        case 'datetime': return '<input class="form-control" type="datetime-local" id="' + id + '" name="' + f.name + '" value="' + esc(Fmt.toInput(v)) + '"' + req + dis + '>';
        case 'email': return '<input class="form-control" type="email" dir="ltr" id="' + id + '" name="' + f.name + '" value="' + esc(v) + '" maxlength="254" autocomplete="off"' + req + dis + '>';
        case 'phone': return '<input class="form-control" type="tel" dir="ltr" id="' + id + '" name="' + f.name + '" value="' + esc(v) + '" placeholder="+966500000000" autocomplete="off"' + req + dis + '>';
        default: return '<input class="form-control" type="text" id="' + id + '" name="' + f.name + '" value="' + esc(v) + '" maxlength="' + (f.max || 200) + '" autocomplete="off"' + req + dis + '>';
      }
    },
    bodyHtml: function (fields, values, refs) {
      return '<form id="rm-form" novalidate><div class="row g-3">' + fields.map(function (f) {
        var wide = (f.type === 'text' || f.wide);
        return '<div class="' + (wide ? 'col-12' : 'col-md-6') + '"><label class="form-label" for="f_' + f.name + '">' + esc(f.label) + (f.required ? ' <span class="text-danger">*</span>' : '') + '</label>' + Form.inputHtml(f, values ? values[f.name] : undefined, refs) +
          (f.hint ? '<div class="form-text">' + esc(f.hint) + '</div>' : '') + '<div class="invalid-feedback" data-err="' + f.name + '"></div></div>';
      }).join('') + '</div><div id="rm-form-err" class="mt-3"></div></form>';
    },
    collect: function (form, fields, original, mode) {
      var out = {};
      fields.forEach(function (f) {
        if (f.readonly) return;
        var el = form.elements[f.name]; if (!el) return;
        var v;
        if (f.type === 'bool') v = el.checked;
        else v = el.value;
        if (f.type === 'datetime' && v) v = v;           // الخادم يفسّر الوقت المحلي بتوقيت الشركة
        if (mode === 'edit') {
          var o = original ? original[f.name] : undefined;
          var oc = f.type === 'bool' ? !!(o === true || o === 'true') : (f.type === 'datetime' ? Fmt.toInput(o) : String(o === undefined || o === null ? '' : o));
          var vc = f.type === 'bool' ? v : String(v);
          if (oc === vc) return;
        } else if (v === '' || v === undefined) return;
        out[f.name] = v;
      });
      return out;
    },
    showErrors: function (m, e) {
      $$('.is-invalid', m.el).forEach(function (x) { x.classList.remove('is-invalid'); });
      var general = e && e.message || 'تعذر الحفظ';
      var fields = e && e.details && e.details.fields;
      if (fields) {
        Object.keys(fields).forEach(function (k) {
          var inp = m.el.querySelector('[name="' + k + '"]'); var fb = m.el.querySelector('[data-err="' + k + '"]');
          if (inp) inp.classList.add('is-invalid');
          if (fb) { fb.textContent = fields[k]; fb.style.display = 'block'; }
        });
      }
      $('#rm-form-err', m.el).innerHTML = '<div class="alert alert-danger mb-0" role="alert">' + esc(general) + '</div>';
    },
    /** يفتح نافذة نموذج. onSubmit(values, original) يعيد Promise؛ عند النجاح تُغلق النافذة. */
    open: async function (o) {
      var fields = o.fields || Form.fieldsFor(o.entity, o.mode || 'create', o.only);
      var refs = {};
      var need = {};
      fields.forEach(function (f) { if (f.type === 'ref' && f.ref) need[f.ref] = 1; });
      try { for (var k in need) refs[k] = await Refs.load(k); } catch (e) { toast(Api.describe(e), 'bad'); return null; }
      var m = modal({
        title: o.title, size: o.size || 'lg', static: true, body: Form.bodyHtml(fields, o.values || {}, refs),
        footer: '<button class="btn btn-ghost" data-bs-dismiss="modal">إلغاء</button><button class="btn btn-gold" id="rm-form-ok">' + esc(o.submitLabel || 'حفظ') + '</button>'
      });
      var form = $('#rm-form', m.el);
      form.addEventListener('submit', function (ev) { ev.preventDefault(); $('#rm-form-ok', m.el).click(); });
      $('#rm-form-ok', m.el).addEventListener('click', async function () {
        var btn = this;
        var vals = Form.collect(form, fields, o.values, o.mode || 'create');
        if (o.mode === 'edit' && !Object.keys(vals).length && !(o.extraValues)) { toast('لا توجد تغييرات للحفظ'); m.close(); return; }
        if (o.beforeSubmit) vals = o.beforeSubmit(vals) || vals;
        btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> جارٍ الحفظ';
        try { await o.onSubmit(vals, o.values); m.close(); }
        catch (e) { Form.showErrors(m, e); btn.disabled = false; btn.textContent = o.submitLabel || 'حفظ'; }
      });
      setTimeout(function () { var f = form.querySelector('input:not([disabled]),select,textarea'); if (f) f.focus(); }, 300);
      return m;
    }
  };

  /* ---------------- الجداول ---------------- */
  var Table = {
    mount: function (o) {
      var st = { q: '', page: 1, sort: (o.defaultSort && o.defaultSort.sort) || '', dir: (o.defaultSort && o.defaultSort.dir) || 'desc', filters: {}, direct: {}, rows: [], total: 0, pages: 1, loading: false, limit: o.pageSize || 15 };
      var root = o.el;
      var uid = 'tb' + Math.random().toString(36).slice(2, 7);
      root.innerHTML =
        '<div class="rm-toolbar"><div class="search"><span aria-hidden="true">' + icon('search') + '</span><input type="search" class="form-control" placeholder="' + esc(o.searchPlaceholder || 'بحث…') + '" aria-label="بحث" data-q></div>' +
        (o.filters || []).map(function (f) {
          if (f.type === 'date') return '<input type="date" class="form-control w-auto" data-flt="' + f.key + '" aria-label="' + esc(f.label) + '" title="' + esc(f.label) + '">';
          return '<select class="form-select w-auto" data-flt="' + f.key + '" aria-label="' + esc(f.label) + '"><option value="">' + esc(f.label) + ': الكل</option>' + f.options.map(function (x) { return '<option value="' + esc(x.v) + '">' + esc(x.l) + '</option>'; }).join('') + '</select>';
        }).join('') +
        '<div class="ms-auto d-flex gap-2 flex-wrap" data-tools>' + (o.toolbar || '') + '</div></div>' +
        '<div class="rm-table-wrap" data-body></div><div class="rm-pager" data-pager hidden></div>';
      var body = $('[data-body]', root), pager = $('[data-pager]', root);

      function colHtml(c, r) {
        var v = c.render ? c.render(r) : esc(r[c.key] === undefined || r[c.key] === null || r[c.key] === '' ? '—' : r[c.key]);
        return v;
      }
      function draw() {
        if (!st.rows.length) {
          body.innerHTML = emptyBox(st.q || Object.keys(st.filters).length || Object.keys(st.direct).length ? 'لا نتائج مطابقة' : (o.emptyTitle || 'لا توجد سجلات بعد'),
            st.q ? 'جرّب كلمات بحث أخرى أو أزل عوامل التصفية.' : (o.emptyHint || ''), o.emptyAction || '');
          pager.hidden = true; return;
        }
        var head = '<tr>' + o.columns.map(function (c) {
          var sortable = c.sort ? ' sortable" data-sort="' + c.key + '" aria-sort="' + (st.sort === c.key ? (st.dir === 'asc' ? 'ascending' : 'descending') : 'none') : '';
          return '<th class="' + (c.hide ? 'rm-hide-' + c.hide : '') + sortable + '">' + esc(c.label) + (c.sort && st.sort === c.key ? (st.dir === 'asc' ? ' ▲' : ' ▼') : '') + '</th>';
        }).join('') + (o.rowActions ? '<th></th>' : '') + '</tr>';
        var rows = st.rows.map(function (r) {
          return '<tr data-id="' + esc(r[o.idField]) + '">' + o.columns.map(function (c) { return '<td data-label="' + esc(c.label) + '" class="' + (c.hide ? 'rm-hide-' + c.hide : '') + ' ' + (c.cls || '') + '">' + colHtml(c, r) + '</td>'; }).join('') +
            (o.rowActions ? '<td class="acts">' + o.rowActions(r) + '</td>' : '') + '</tr>';
        }).join('');
        body.innerHTML = '<table class="rm-table stack"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table>';
        pager.hidden = false;
        var from = (st.page - 1) * st.limit + 1, to = Math.min(st.page * st.limit, st.total);
        pager.innerHTML = '<span>' + Fmt.num(from) + '–' + Fmt.num(to) + ' من ' + Fmt.num(st.total) + '</span><div class="d-flex gap-1"><button class="btn btn-sm btn-ghost" data-pg="prev" ' + (st.page <= 1 ? 'disabled' : '') + '>السابق</button><span class="px-2 align-self-center">' + Fmt.num(st.page) + ' / ' + Fmt.num(st.pages) + '</span><button class="btn btn-sm btn-ghost" data-pg="next" ' + (st.page >= st.pages ? 'disabled' : '') + '>التالي</button></div>';
      }
      async function load() {
        st.loading = true; body.innerHTML = skeleton(5); pager.hidden = true;
        try {
          var p = Object.assign({ q: st.q, page: st.page, limit: st.limit, sort: st.sort || undefined, dir: st.dir, filters: st.filters }, st.direct, o.extra ? o.extra() : {});
          var res = await Api.call(o.action || (o.entity + '.list'), p);
          st.rows = res.items || []; st.total = res.total || 0; st.pages = res.pages || 1;
          if (o.onLoad) o.onLoad(res);
          draw();
        } catch (e) { body.innerHTML = errBox(e, true); }
        st.loading = false;
      }
      root.addEventListener('input', debounce(function (ev) { if (ev.target.matches('[data-q]')) { st.q = ev.target.value.trim(); st.page = 1; load(); } }, 320));
      root.addEventListener('change', function (ev) {
        var k = ev.target.getAttribute && ev.target.getAttribute('data-flt'); if (!k) return;
        var def = o.filters.filter(function (f) { return f.key === k; })[0]; var v = ev.target.value;
        var bag = def.direct ? st.direct : st.filters;
        if (v) bag[def.param || k] = v; else delete bag[def.param || k];
        st.page = 1; load();
      });
      root.addEventListener('click', function (ev) {
        var t = ev.target.closest('[data-sort],[data-pg],[data-retry],[data-act]'); if (!t || !root.contains(t)) return;
        if (t.hasAttribute('data-sort')) { var k = t.getAttribute('data-sort'); if (st.sort === k) st.dir = st.dir === 'asc' ? 'desc' : 'asc'; else { st.sort = k; st.dir = 'asc'; } st.page = 1; load(); }
        else if (t.hasAttribute('data-pg')) { st.page += t.getAttribute('data-pg') === 'next' ? 1 : -1; load(); }
        else if (t.hasAttribute('data-retry')) load();
        else if (t.hasAttribute('data-act') && o.onAction) {
          var tr = t.closest('tr'); var id = tr && tr.getAttribute('data-id');
          var row = st.rows.filter(function (r) { return r[o.idField] === id; })[0];
          o.onAction(t.getAttribute('data-act'), row, t);
        }
      });
      load();
      return { reload: load, rows: function () { return st.rows; }, state: st };
    }
  };

  /* ---------------- هيكل التطبيق ---------------- */
  var NAV = [
    { g: 'الإدارة', items: [
      { id: 'dashboard', href: 'company-dashboard.html', label: 'nav.dashboard', icon: 'home' },
      { id: 'pilgrims', href: 'pilgrims.html', label: 'nav.pilgrims', icon: 'users', perm: 'pilgrims.read' },
      { id: 'bookings', href: 'bookings.html', label: 'nav.bookings', icon: 'ticket', perm: 'bookings.read' },
      { id: 'campaigns', href: 'campaigns.html', label: 'nav.campaigns', icon: 'flag', perm: 'campaigns.read' }] },
    { g: 'المالية', items: [
      { id: 'payments', href: 'payments.html', label: 'nav.payments', icon: 'coins', perm: 'payments.read' },
      { id: 'expenses', href: 'expenses.html', label: 'nav.expenses', icon: 'receipt', perm: 'expenses.read' },
      { id: 'reports', href: 'reports.html', label: 'nav.reports', icon: 'chart', perm: 'reports.read' }] },
    { g: 'التشغيل', items: [
      { id: 'hotels', href: 'hotels.html', label: 'nav.hotels', icon: 'building', perm: 'hotels.read' },
      { id: 'rooms', href: 'rooms.html', label: 'nav.rooms', icon: 'bed', perm: 'rooms.read' },
      { id: 'transport', href: 'transport.html', label: 'nav.transport', icon: 'bus', perm: 'transport.read' },
      { id: 'schedule', href: 'schedule.html', label: 'nav.schedule', icon: 'cal', perm: 'schedule.read' },
      { id: 'attendance', href: 'attendance.html', label: 'الحضور', icon: 'scan', perm: 'attendance.read' },
      { id: 'sheikh', href: 'sheikh.html', label: 'nav.sheikh', icon: 'mosque', perm: 'schedule.write_religious' }] },
    { g: 'التواصل', items: [
      { id: 'announcements', href: 'announcements.html', label: 'nav.announcements', icon: 'mega', perm: 'announcements.read' },
      { id: 'inquiries', href: 'inquiries.html', label: 'nav.inquiries', icon: 'help', perm: 'inquiries.read', badge: 'inquiries' },
      { id: 'ratings', href: 'ratings.html', label: 'nav.ratings', icon: 'star', perm: 'ratings.read' }] },
    { g: 'الحساب', items: [
      { id: 'supervisors', href: 'supervisors.html', label: 'nav.team', icon: 'team', perm: 'users.read' },
      { id: 'settings', href: 'settings.html', label: 'nav.settings', icon: 'cog', perm: 'settings.read' }] }
  ];

  function homeFor(me) { return me.is_super ? 'platform-admin.html' : (me.role === 'pilgrim' ? 'portal.html' : 'company-dashboard.html'); }

  function theme() { try { return localStorage.getItem('rm_theme') || 'dark'; } catch (e) { return 'dark'; } }
  function applyTheme(t) { document.documentElement.setAttribute('data-bs-theme', t); try { localStorage.setItem('rm_theme', t); } catch (e) { /* تجاهل */ } }

  function previewBanner() {
    if (!Auth.isPreview()) return '';
    return '<div class="rm-preview-banner" role="note">وضع المعاينة — بيانات تجريبية وهمية. لا تُحفظ أي تغييرات ولا تُرسل أي إشعارات. <a href="login.html" data-exit-preview>الخروج من المعاينة</a></div>';
  }

  function navHtml(active) {
    var out = '';
    NAV.forEach(function (g) {
      var items = g.items.filter(function (i) { return !i.perm || can(i.perm); });
      if (!items.length) return;
      out += '<div class="rm-nav-group">' + esc(g.g) + '</div>' + items.map(function (i) {
        return '<a href="' + i.href + '" class="' + (i.id === active ? 'active' : '') + '"' + (i.id === active ? ' aria-current="page"' : '') + '>' + icon(i.icon) + '<span>' + esc(I18n.t(i.label)) + '</span>' + (i.badge ? '<span class="count" data-badge="' + i.badge + '" hidden></span>' : '') + '</a>';
      }).join('');
    });
    return out;
  }

  var Shell = {
    render: function (activeId, title, sub, actions) {
      var me = S.me, co = me.company || {};
      var layout = me.role === 'pilgrim' ? 'bare' : 'full';
      var initials = (me.display_name || me.email || '?').trim().charAt(0).toUpperCase();
      var langOpts = Object.keys(I18n.languages).map(function (k) { return '<li><button class="dropdown-item' + (k === I18n.lang ? ' active' : '') + '" data-lang="' + k + '">' + esc(I18n.languages[k]) + '</button></li>'; }).join('');
      var topRight =
        '<button class="rm-icon-btn" data-theme-toggle title="تبديل المظهر" aria-label="تبديل المظهر">' + icon(theme() === 'dark' ? 'sun' : 'moon') + '</button>' +
        '<div class="dropdown"><button class="rm-icon-btn" data-bs-toggle="dropdown" aria-label="اللغة" title="اللغة">' + icon('globe') + '</button><ul class="dropdown-menu">' + langOpts + '</ul></div>' +
        (layout === 'full' && !me.is_super ? '<div class="dropdown"><button class="rm-icon-btn" data-bs-toggle="dropdown" aria-label="الإشعارات" data-bell>' + icon('bell') + '<span class="dot" data-bell-count hidden></span></button><div class="dropdown-menu dropdown-menu-end p-0" style="min-width:300px" data-bell-list><div class="p-3 text-secondary">لا إشعارات</div></div></div>' : '') +
        '<div class="dropdown"><button class="rm-user" data-bs-toggle="dropdown" aria-label="حسابي"><span class="rm-avatar">' + esc(initials) + '</span><span class="name d-none d-sm-inline">' + esc(me.display_name || me.email) + '</span></button><ul class="dropdown-menu dropdown-menu-end"><li><span class="dropdown-item-text small text-secondary">' + esc(me.email) + '<br>' + esc(me.role_label) + '</span></li><li><hr class="dropdown-divider"></li><li><button class="dropdown-item" data-logout>' + esc(I18n.t('auth.logout')) + '</button></li></ul></div>';
      var brandName = me.is_super ? I18n.t('app.name') : (co.name || I18n.t('app.name'));
      var logo = co.logo_url ? '<img src="' + esc(co.logo_url) + '" alt="" width="42" height="48" style="object-fit:contain" referrerpolicy="no-referrer">' : MARK;
      var side = layout === 'full' ? '<aside class="rm-side" id="rm-side" aria-label="القائمة الرئيسية"><div class="rm-brand"><div class="rm-brand-row">' + logo + '<div><b>' + esc(brandName) + '</b><small>' + esc(me.is_super ? 'إدارة المنصة' : I18n.t('app.name')) + '</small></div></div></div><nav class="rm-nav">' +
        (me.is_super ? '<a class="active" href="platform-admin.html" aria-current="page">' + icon('shield') + '<span>' + esc(I18n.t('nav.platform')) + '</span></a>' : navHtml(activeId)) + '</nav><div class="rm-side-foot">' + esc(I18n.t('app.name')) + ' · v' + esc(me.app ? me.app.version : '') + '</div></aside>' : '';
      document.getElementById('app-root').innerHTML = previewBanner() +
        '<a class="visually-hidden-focusable" href="#rm-main">تخطَّ إلى المحتوى</a><div class="' + (layout === 'full' ? 'rm-app' : '') + '">' + side +
        '<div class="rm-main"><header class="rm-top">' + (layout === 'full' ? '<button class="rm-icon-btn d-lg-none" data-nav-toggle aria-label="القائمة" aria-controls="rm-side">' + icon('menu') + '</button>' : '<span class="rm-brand-row me-2">' + logo + '<b class="rm-display">' + esc(brandName) + '</b></span>') +
        '<div class="grow"></div>' + topRight + '</header><main class="rm-content" id="rm-main" tabindex="-1"><div class="rm-page-head"><div><h1 id="rm-title">' + esc(title || '') + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div><div class="d-flex gap-2 flex-wrap" id="rm-actions">' + (actions || '') + '</div></div><div id="rm-page"></div></main></div></div>';
      Shell.bind();
      return document.getElementById('rm-page');
    },
    bind: function () {
      var root = document.getElementById('app-root');
      root.addEventListener('click', function (ev) {
        var t = ev.target;
        if (t.closest('[data-nav-toggle]')) { document.body.classList.toggle('nav-open'); return; }
        if (document.body.classList.contains('nav-open') && !t.closest('#rm-side')) document.body.classList.remove('nav-open');
        if (t.closest('[data-logout]')) { Api.call('auth.logout', {}).catch(function () { }).then(function () { Auth.signOut(); }); return; }
        if (t.closest('[data-exit-preview]')) { ev.preventDefault(); Auth.endPreview(); location.href = 'index.html'; return; }
        var th = t.closest('[data-theme-toggle]'); if (th) { applyTheme(theme() === 'dark' ? 'light' : 'dark'); th.innerHTML = icon(theme() === 'dark' ? 'sun' : 'moon'); return; }
        var lg = t.closest('[data-lang]'); if (lg) { I18n.set(lg.getAttribute('data-lang')); }
      });
    },
    loadBell: async function () {
      if (!can('inquiries.read') && !can('announcements.publish') && !can('schedule.read') && !can('campaigns.read')) return;
      try {
        var n = await Api.call('notifications.list', {});
        var items = n.items || [], total = items.reduce(function (a, x) { return a + (x.count || 0); }, 0);
        var dot = $('[data-bell-count]'), list = $('[data-bell-list]');
        if (dot) { dot.hidden = !total; dot.textContent = total > 9 ? '9+' : total; }
        if (list) list.innerHTML = items.length ? items.map(function (x) { return '<div class="px-3 py-2 border-bottom" style="border-color:var(--rm-line-soft)!important">' + esc(x.text) + '</div>'; }).join('') : '<div class="p-3 text-secondary">لا إشعارات جديدة</div>';
        var inq = items.filter(function (x) { return x.type === 'inquiries'; })[0];
        var b = $('[data-badge="inquiries"]'); if (b) { b.hidden = !inq; if (inq) b.textContent = inq.count; }
      } catch (e) { /* الإشعارات اختيارية */ }
    }
  };

  /* ---------------- الإقلاع ---------------- */
  function fatal(msg, allowLogout) {
    var root = document.getElementById('app-root');
    root.innerHTML = '<div class="d-grid place-items-center" style="min-height:100vh;display:grid;place-items:center;padding:1.5rem"><div class="rm-card p-4" style="max-width:480px">' + '<h1 class="fs-4 mb-3">تعذر فتح الصفحة</h1><div class="alert alert-danger" role="alert">' + esc(msg) + '</div><div class="d-flex gap-2"><a class="btn btn-gold" href="login.html">العودة لتسجيل الدخول</a>' + (allowLogout ? '<button class="btn btn-ghost" data-logout-fatal>تسجيل الخروج</button>' : '') + '</div></div></div>';
    var b = $('[data-logout-fatal]'); if (b) b.addEventListener('click', function () { Auth.signOut(); });
  }

  async function boot() {
    var body = document.body, page = body.getAttribute('data-page'), access = body.getAttribute('data-access') || 'staff';
    applyTheme(theme());
    I18n.apply();
    if (access === 'public') { if (Pages[page]) Pages[page](); return; }
    var root = document.getElementById('app-root');
    root.innerHTML = '<div style="min-height:100vh;display:grid;place-items:center" class="rm-pattern"><div class="text-center"><div class="rm-skel mx-auto mb-3" style="width:180px;height:14px"></div><div class="text-secondary">جارٍ التحميل…</div></div></div>';
    if (!Auth.isPreview() && !Auth.hasSession()) { location.replace('login.html'); return; }
    try {
      S.me = await Api.call('auth.me', {});
    } catch (e) {
      if (e.code === 'UNAUTHENTICATED') { Auth.clear(); location.replace('login.html?expired=1'); return; }
      fatal(Api.describe(e), true); return;
    }
    var me = S.me;
    var okAccess = (access === 'super' && me.is_super) || (access === 'staff' && !me.is_super && me.role !== 'pilgrim') || (access === 'pilgrim' && me.role === 'pilgrim');
    if (!okAccess) { location.replace(homeFor(me)); return; }
    if (me.company && me.company.settings) { S.tz = me.company.settings.timezone || S.tz; S.currency = me.company.settings.currency || S.currency; }
    if (me.company && me.company.brand_primary) { /* هوية الشركة: لون التمييز فقط مع الحفاظ على التباين */ }
    try { S.schema = Auth.isPreview() ? { entities: window.UMRAH_SCHEMA.entities, enums: window.UMRAH_SCHEMA.enums } : await Api.call('meta.schema', {}); }
    catch (e) { S.schema = window.UMRAH_SCHEMA; }
    if (!S.schema || !S.schema.entities) S.schema = window.UMRAH_SCHEMA;
    var ctx = {
      me: me, schema: S.schema, can: can, anyCan: anyCan, fmt: Fmt, esc: esc, tz: S.tz,
      shell: function (id, title, sub, actions) { ctx.root = Shell.render(id, title, sub, actions); if (!me.is_super && me.role !== 'pilgrim') Shell.loadBell(); return ctx.root; },
      setActions: function (html) { var a = $('#rm-actions'); if (a) a.innerHTML = html; }
    };
    window.RM = ctx;
    if (Pages[page]) {
      try { await Pages[page](ctx); }
      catch (e) { var r = $('#rm-page') || document.getElementById('app-root'); r.innerHTML = errBox(e instanceof Error && !e.code ? new Error('حدث خطأ غير متوقع في عرض الصفحة') : e); if (window.console) console.error(e); }
    } else {
      ctx.shell('', 'صفحة غير متوفرة', ''); $('#rm-page').innerHTML = emptyBox('هذه الصفحة غير متوفرة', 'تحقق من الرابط أو عد إلى لوحة التحكم.');
    }
  }

  window.App = {
    esc: esc, $: $, $$: $$, qs: qs, debounce: debounce, icon: icon, MARK: MARK, S: S, Fmt: Fmt, badge: badge, badgeClass: badgeClass, liveBadge: liveBadge, enumLabel: enumLabel,
    toast: toast, modal: modal, confirm: confirmBox, errBox: errBox, emptyBox: emptyBox, skeleton: skeleton, Form: Form, Table: Table, Refs: Refs,
    can: can, homeFor: homeFor, applyTheme: applyTheme, theme: theme, boot: boot, Shell: Shell, previewBanner: previewBanner, Pages: Pages
  };
  document.addEventListener('DOMContentLoaded', boot);
})();
