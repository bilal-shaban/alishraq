/**
 * crud.js — صفحة CRUD عامة مبنية على مخطط الكيان (قائمة + بحث + ترتيب + ترقيم + نموذج + حذف بتأكيد).
 * الصلاحيات هنا لإخفاء الأزرار فقط؛ الحماية الفعلية على الخادم.
 */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt;

  function btn(act, label, cls) { return '<button class="btn btn-sm ' + (cls || 'btn-ghost') + '" data-act="' + act + '">' + label + '</button> '; }

  async function preloadRefs(ctx, keys) {
    for (var i = 0; i < keys.length; i++) { if (ctx.can(keys[i] + '.read')) { try { await A.Refs.load(keys[i]); } catch (e) { /* العمود يعرض المعرّف */ } } }
  }
  function refCell(key) { return function (r) { var id = r[this.key]; return id ? esc(A.Refs.label(key, id)) : '—'; }; }

  A.crud = async function (ctx, cfg) {
    var ent = ctx.schema.entities[cfg.entity], base = cfg.perm || cfg.entity;
    var canW = ctx.can(base + '.write') && !ent.readOnly, canD = ctx.can(base + '.delete') && !ent.noDelete && !ent.readOnly;
    var head = (canW && !cfg.noCreate) ? '<button class="btn btn-gold" id="rm-add">' + A.icon('plus', 'me-1') + ' ' + esc(cfg.newLabel || 'إضافة') + '</button>' : '';
    var root = ctx.shell(cfg.nav || cfg.entity, cfg.title, cfg.sub, (cfg.headExtra || '') + head);
    root.innerHTML = (cfg.top || '') + '<div class="rm-card"><div id="rm-tbl"></div></div>';
    await preloadRefs(ctx, cfg.refs || []);
    var cols = typeof cfg.columns === 'function' ? cfg.columns(ctx) : cfg.columns;
    var tbl;
    async function submitCreate(vals, extra) {
      var p = { values: vals }; if (extra) Object.assign(p, extra);
      try { return await Api.call(cfg.entity + '.create', p); }
      catch (e) {
        if (cfg.onCreateError) { var again = await cfg.onCreateError(e, p); if (again) return await Api.call(cfg.entity + '.create', again); }
        throw e;
      }
    }
    var api = {
      reload: function () { A.Refs.clear(); return preloadRefs(ctx, cfg.refs || []).then(function () { tbl.reload(); }); },
      openCreate: function (values) {
        return A.Form.open({
          entity: cfg.entity, mode: 'create', title: cfg.newLabel || 'إضافة', values: Object.assign({}, cfg.defaults || {}, values || {}), only: cfg.formFields, size: cfg.formSize,
          fields: cfg.fieldsFor ? cfg.fieldsFor(ctx, 'create') : undefined,
          onSubmit: async function (v) { await submitCreate(v); A.toast('تمت الإضافة', 'ok'); api.reload(); }
        });
      },
      openEdit: function (row) {
        return A.Form.open({
          entity: cfg.entity, mode: 'edit', title: 'تعديل ' + ent.singular, values: row, only: cfg.formFields, size: cfg.formSize,
          fields: cfg.fieldsFor ? cfg.fieldsFor(ctx, 'edit', row) : undefined,
          onSubmit: async function (v) { var p = { values: v }; p[ent.id] = row[ent.id]; await Api.call(cfg.entity + '.update', p); A.toast('تم الحفظ', 'ok'); api.reload(); }
        });
      }
    };
    tbl = A.Table.mount({
      el: A.$('#rm-tbl'), entity: cfg.entity, idField: ent.id, columns: cols, filters: cfg.filters, searchPlaceholder: cfg.searchPlaceholder, defaultSort: cfg.defaultSort, extra: cfg.extra,
      pageSize: cfg.pageSize, emptyTitle: cfg.emptyTitle, emptyHint: cfg.emptyHint, toolbar: cfg.toolbar, onLoad: cfg.onLoad,
      emptyAction: canW && !cfg.noCreate ? '<button class="btn btn-gold" data-act="__add">' + esc(cfg.newLabel || 'إضافة') + '</button>' : '',
      rowActions: function (r) {
        return (cfg.rowActions ? cfg.rowActions(r, ctx) : '') + (canW && !(cfg.canEdit && !cfg.canEdit(r)) ? btn('edit', 'تعديل') : '') + (canD && !(cfg.canDelete && !cfg.canDelete(r)) ? btn('del', 'حذف', 'btn-danger-soft') : '');
      },
      onAction: async function (act, row) {
        if (act === 'edit') return api.openEdit(row);
        if (act === 'del') {
          var c = await A.confirm({ title: 'حذف ' + ent.singular, text: 'سيُحذف هذا السجل نهائياً. هل أنت متأكد؟', danger: true, okLabel: 'حذف' });
          if (!c) return;
          try { var p = {}; p[ent.id] = row[ent.id]; await Api.call(cfg.entity + '.delete', p); A.toast('تم الحذف', 'ok'); api.reload(); }
          catch (e) { A.toast(Api.describe(e), 'bad'); }
          return;
        }
        if (cfg.onAction) cfg.onAction(act, row, api, ctx);
      }
    });
    root.addEventListener('click', function (ev) { if (ev.target.closest('[data-act="__add"]')) api.openCreate(); });
    var add = A.$('#rm-add'); if (add) add.addEventListener('click', function () { api.openCreate(); });
    return api;
  };
  A.crudHelpers = { refCell: refCell, preloadRefs: preloadRefs, btn: btn };
})();
