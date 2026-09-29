document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("favorites-container");
  const tabsBar = document.getElementById("source-tabs");
  const countNote = document.getElementById("favorites-count-note");

  // تصنيف بسيط حسب عنوان الفئة المخزّن مع كل مفضلة، لمعرفة مصدرها (أذكار/أوراد/أدعية)
  const AZKAR_TITLES = ["أذكار الصباح", "أذكار المساء", "أذكار بعد الصلاة", "أذكار النوم", "أذكار الاستيقاظ", "أذكار متفرقة"];
  const AWRAD_TITLES = ["ورد النووي", "ورد البحر", "ورد النصر"];

  function getSourceType(category) {
    if (AZKAR_TITLES.includes(category)) return "azkar";
    if (AWRAD_TITLES.includes(category)) return "awrad";
    return "adiya";
  }

  const SOURCE_LABELS = {
    azkar: { label: "الأذكار", icon: "bi-moon-stars-fill" },
    awrad: { label: "الأوراد", icon: "bi-book-half" },
    adiya: { label: "الأدعية", icon: "bi-hands-praying" }
  };

  let activeFilter = "all";

  function getFavorites() {
    return JSON.parse(localStorage.getItem("eshraq_azkar_favorites")) || [];
  }

  function saveFavorites(list) {
    localStorage.setItem("eshraq_azkar_favorites", JSON.stringify(list));
  }

  function renderTabs() {
    const favorites = getFavorites();
    const counts = { all: favorites.length, azkar: 0, awrad: 0, adiya: 0 };
    favorites.forEach(f => counts[getSourceType(f.category)]++);

    const tabs = [
      { id: "all", label: "الكل", icon: "bi-collection-fill" },
      { id: "azkar", label: SOURCE_LABELS.azkar.label, icon: SOURCE_LABELS.azkar.icon },
      { id: "awrad", label: SOURCE_LABELS.awrad.label, icon: SOURCE_LABELS.awrad.icon },
      { id: "adiya", label: SOURCE_LABELS.adiya.label, icon: SOURCE_LABELS.adiya.icon }
    ];

    tabsBar.innerHTML = tabs.map(t => `
      <button class="btn btn-gold-outline btn-sm rounded-pill px-3 ${t.id === activeFilter ? 'active-tab' : ''}" data-filter="${t.id}">
        <i class="bi ${t.icon} me-1"></i> ${t.label} (${counts[t.id]})
      </button>
    `).join("");

    tabsBar.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.getAttribute("data-filter");
        renderTabs();
        renderFavorites();
      });
    });
  }

  function renderFavorites() {
    const favorites = getFavorites();
    const filtered = activeFilter === "all"
      ? favorites
      : favorites.filter(f => getSourceType(f.category) === activeFilter);

    countNote.textContent = `${filtered.length} عنصر بالمفضلة`;

    if (filtered.length === 0) {
      container.innerHTML = `<p class="text-center text-light opacity-50 mt-4">لا عناصر مفضّلة هنا بعد. اضغط زر "مفضلة" بأي ذكر أو دعاء أو ورد لإضافته هنا.</p>`;
      return;
    }

    container.innerHTML = filtered.map((fav, index) => {
      const sourceInfo = SOURCE_LABELS[getSourceType(fav.category)];
      return `
        <div class="zikr-card">
          <div class="d-flex align-items-start gap-3">
            <div class="flex-grow-1">
              <span class="badge rounded-pill mb-2" style="background: rgba(237,206,160,0.15); color:#edcea0;">
                <i class="bi ${sourceInfo.icon} me-1"></i> ${fav.category}
              </span>
              <p class="zikr-text mb-2">${fav.text}</p>
              <div class="zikr-actions d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-sm btn-outline-light border-0 copy-btn" data-text="${encodeURIComponent(fav.text)}" title="نسخ">
                  <i class="bi bi-copy"></i> نسخ
                </button>
                <button type="button" class="btn btn-sm btn-outline-light border-0 text-success share-btn" data-text="${encodeURIComponent(fav.text)}" title="مشاركة عبر واتساب">
                  <i class="bi bi-whatsapp"></i> مشاركة
                </button>
                <button type="button" class="btn btn-sm btn-outline-light border-0 text-danger remove-btn" data-text="${encodeURIComponent(fav.text)}" title="إزالة من المفضلة">
                  <i class="bi bi-trash"></i> إزالة
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute("data-text"));
        navigator.clipboard.writeText(text).then(() => alert("تم النسخ بنجاح!"));
      });
    });

    container.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute("data-text"));
        const fullText = `${text}\n[من مفضلتي - تطبيق إشراق 🌙]`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
      });
    });

    container.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute("data-text"));
        let favorites = getFavorites();
        favorites = favorites.filter(f => f.text !== text);
        saveFavorites(favorites);
        renderTabs();
        renderFavorites();
      });
    });
  }

  renderTabs();
  renderFavorites();
});
