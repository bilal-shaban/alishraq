document.addEventListener("DOMContentLoaded", () => {
  // ===== بيانات الأوراد =====
  const categories = [
    {
      id: "nawawi",
      title: "ورد النووي",
      icon: "bi-journal-bookmark-fill",
      note: "مختارات من كتاب «الأذكار» للإمام النووي رحمه الله، وهو من أشهر ما جُمع من أدعية وأذكار النبي ﷺ.",
      items: [
        { text: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَنْ دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ", count: 1, source: "دعاء لطلب المغفرة للنفس والوالدين والمؤمنين" },
        { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, source: "سيد الاستغفار" },
        { text: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", count: 1, source: "عند لبس ثوب جديد" },
        { text: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", count: 1, source: "عند دخول المسجد" },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", count: 1, source: "عند الخروج من المسجد" },
        { text: "لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ", count: 1, source: "عند زيارة مريض" },
        { text: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، وَاشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا", count: 3, source: "دعاء للمريض" },
        { text: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ", count: 1, source: "دعاء للميت" },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ لِي وَلَهُمْ مِنْ خَيْرِكَ بِخَيْرِكَ الَّذِي لَا يَمْلِكُهُ غَيْرُكَ", count: 1 },
        { text: "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ", count: 1 }
      ]
    },
    {
      id: "bahr",
      title: "ورد البحر",
      icon: "bi-water",
      note: "حزب البحر لسيدي أبي الحسن الشاذلي رحمه الله (ت 656هـ). هذا مقتطف من فاتحته وأشهر مقاطعه المعروفة؛ يُنصح بالرجوع لمصدر موثوق للنص الكامل قبل الاعتماد عليه بتمامه.",
      items: [
        { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. بِسْمِ اللَّهِ مَجْرَاهَا وَمُرْسَاهَا إِنَّ رَبِّي لَغَفُورٌ رَحِيمٌ، وَمَا قَدَرُوا اللَّهَ حَقَّ قَدْرِهِ وَالْأَرْضُ جَمِيعًا قَبْضَتُهُ يَوْمَ الْقِيَامَةِ وَالسَّمَاوَاتُ مَطْوِيَّاتٌ بِيَمِينِهِ سُبْحَانَهُ وَتَعَالَىٰ عَمَّا يُشْرِكُونَ", count: 1 },
        { text: "اللَّهُمَّ يَا عَلِيُّ يَا عَظِيمُ، يَا حَلِيمُ يَا عَلِيمُ، أَنْتَ رَبِّي وَعِلْمُكَ حَسْبِي، فَنِعْمَ الرَّبُّ رَبِّي، وَنِعْمَ الْحَسْبُ حَسْبِي، تَنْصُرُ مَنْ تَشَاءُ وَأَنْتَ الْعَزِيزُ الرَّحِيمُ", count: 1 },
        { text: "نَسْأَلُكَ الْعِصْمَةَ فِي الْحَرَكَاتِ وَالسَّكَنَاتِ، وَالْكَلِمَاتِ وَالْإِرَادَاتِ، وَالْخَطَرَاتِ مِنَ الشُّكُوكِ وَالظُّنُونِ وَالْأَوْهَامِ الْمُغْطِيَةِ لِلْقُلُوبِ عَنْ مَعْرِفَةِ الْغُيُوبِ", count: 1 },
        { text: "وَسَخِّرْ لَنَا هَٰذَا الْبَحْرَ كَمَا سَخَّرْتَ الْبَحْرَ لِمُوسَىٰ، وَسَخَّرْتَ النَّارَ لِإِبْرَاهِيمَ، وَسَخَّرْتَ الْجِبَالَ وَالْحَدِيدَ لِدَاوُدَ، وَسَخَّرْتَ الرِّيحَ وَالشَّيَاطِينَ وَالْجِنَّ وَالْإِنْسَ لِسُلَيْمَانَ", count: 1 },
        { text: "وَسَخِّرْ لَنَا كُلَّ بَحْرٍ هُوَ لَكَ فِي الْأَرْضِ وَالسَّمَاءِ وَالْمُلْكِ وَالْمَلَكُوتِ، وَبَحْرَ الدُّنْيَا وَبَحْرَ الْآخِرَةِ، وَسَخِّرْ لَنَا كُلَّ شَيْءٍ يَا مَنْ بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ، كهيعص، كَافٍ لَنَا الْكَافِي، هَادٍ لَنَا الْهَادِي، عَاصِمٌ لَنَا مِنْ كُلِّ سُوءٍ", count: 1 }
      ]
    },
    {
      id: "nasr",
      title: "ورد النصر",
      icon: "bi-shield-check",
      note: "لا يوجد نص موحّد شهير باسم «حزب النصر» بنفس شهرة حزب البحر، لذلك جمعنا هنا آيات قرآنية وأدعية نبوية ثابتة في طلب النصر والتثبيت.",
      items: [
        { text: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", count: 3, source: "سورة البقرة - 250" },
        { text: "إِنْ تَنْصُرُوا اللَّهَ يَنْصُرْكُمْ وَيُثَبِّتْ أَقْدَامَكُمْ", count: 1, source: "سورة محمد - 7" },
        { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", count: 7, source: "سورة آل عمران - 173" },
        { text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ", count: 3, source: "سورة آل عمران - 8" },
        { text: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا", count: 3 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ فِي الْأَمْرِ، وَالْعَزِيمَةَ عَلَى الرُّشْدِ", count: 1 },
        { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ", count: 10 }
      ]
    }
  ];

  const container = document.getElementById("zikr-container");
  const tabsBar = document.getElementById("category-tabs");
  const progressNote = document.getElementById("progress-note");
  const fontIncreaseBtn = document.getElementById("font-increase-btn");
  const fontDecreaseBtn = document.getElementById("font-decrease-btn");
  const resetBtn = document.getElementById("reset-category-btn");

  let activeCategoryId = categories[0].id;
  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;

  function todayKey() {
    return new Date().toDateString();
  }

  function getCounters(catId) {
    const raw = localStorage.getItem(`eshraq_awrad_counts_${catId}`);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved && saved.date === todayKey()) return saved.counts;
    return {};
  }

  function saveCounters(catId, counts) {
    localStorage.setItem(`eshraq_awrad_counts_${catId}`, JSON.stringify({ date: todayKey(), counts }));
  }

  function renderTabs() {
    tabsBar.innerHTML = categories.map(cat => `
      <button class="btn btn-gold-outline btn-sm rounded-pill px-3 ${cat.id === activeCategoryId ? 'active-tab' : ''}" data-cat="${cat.id}">
        <i class="bi ${cat.icon} me-1"></i> ${cat.title}
      </button>
    `).join("");

    tabsBar.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategoryId = btn.getAttribute("data-cat");
        renderTabs();
        renderCategory();
      });
    });
  }

  function updateProgressNote(cat, counters) {
    const done = cat.items.filter((item, i) => (counters[i] ?? item.count) <= 0).length;
    progressNote.textContent = `${done} / ${cat.items.length} تم إنجازها`;
  }

  function renderCategory() {
    const cat = categories.find(c => c.id === activeCategoryId);
    if (!cat) return;
    const counters = getCounters(cat.id);

    let html = "";
    if (cat.note) {
      html += `<div class="supplication-box p-3 rounded-3 mb-3 zikr-source">${cat.note}</div>`;
    }

    html += cat.items.map((item, index) => {
      const remaining = counters[index] ?? item.count;
      const isDone = remaining <= 0;
      return `
        <div class="zikr-card ${isDone ? 'done' : ''}" data-index="${index}">
          <div class="d-flex align-items-start gap-3">
            <button class="zikr-count-btn" data-index="${index}" title="اضغط للعد">
              ${isDone ? '<i class="bi bi-check-lg"></i>' : remaining}
            </button>
            <div class="flex-grow-1">
              <p class="zikr-text mb-2" style="font-size: ${currentFontSize}rem;">${item.text}</p>
              ${item.source ? `<div class="zikr-source gold mb-2"><i class="bi bi-info-circle me-1"></i>${item.source}</div>` : ""}
              <div class="zikr-actions d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-light border-0 copy-btn" data-index="${index}" title="نسخ">
                  <i class="bi bi-copy"></i> نسخ
                </button>
                <button type="button" class="btn btn-sm btn-outline-light border-0 text-success share-btn" data-index="${index}" title="مشاركة عبر واتساب">
                  <i class="bi bi-whatsapp"></i> مشاركة
                </button>
                <button type="button" class="btn btn-sm btn-outline-light border-0 fav-btn" data-index="${index}" title="إضافة للمفضلة">
                  <i class="bi bi-star"></i> مفضلة
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = html;
    updateProgressNote(cat, counters);
    bindCardEvents(cat);
  }

  function bindCardEvents(cat) {
    container.querySelectorAll(".zikr-count-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        const counters = getCounters(cat.id);
        const current = counters[index] ?? cat.items[index].count;
        if (current > 0) {
          counters[index] = current - 1;
          saveCounters(cat.id, counters);
          if (navigator.vibrate) navigator.vibrate(30);
          renderCategory();
        }
      });
    });

    container.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const item = cat.items[index];
        navigator.clipboard.writeText(item.text).then(() => alert("تم النسخ بنجاح!"));
      });
    });

    container.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const item = cat.items[index];
        const fullText = `${item.text}\n[${cat.title} - تطبيق إشراق 🌙]`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
      });
    });

    container.querySelectorAll(".fav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const item = cat.items[index];
        addAzkarFavorite(cat.title, item.text);
      });
    });
  }

  if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener("click", () => {
      if (currentFontSize < 2.4) {
        currentFontSize += 0.1;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderCategory();
      }
    });
  }

  if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener("click", () => {
      if (currentFontSize > 1.1) {
        currentFontSize -= 0.1;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderCategory();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(`eshraq_awrad_counts_${activeCategoryId}`);
      renderCategory();
    });
  }

  renderTabs();
  renderCategory();
});
