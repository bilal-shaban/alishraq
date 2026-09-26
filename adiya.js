document.addEventListener("DOMContentLoaded", () => {
  // ===== بيانات الأدعية =====
  const categories = [
    {
      id: "quran",
      title: "أدعية من القرآن",
      icon: "bi-book-fill",
      items: [
        { text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", count: 1, source: "سورة البقرة - 201" },
        { text: "رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا، رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ، وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا، أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", count: 1, source: "سورة البقرة - 286" },
        { text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ", count: 1, source: "سورة آل عمران - 8" },
        { text: "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنْتَ خَيْرُ الرَّاحِمِينَ", count: 1, source: "سورة المؤمنون - 109" },
        { text: "رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي", count: 1, source: "سورة طه - 25-26" },
        { text: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", count: 1, source: "سورة القصص - 24" },
        { text: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", count: 1, source: "سورة الفرقان - 74" },
        { text: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ", count: 1, source: "سورة المؤمنون - 118" },
        { text: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", count: 1, source: "دعاء يونس عليه السلام - سورة الأنبياء 87" },
        { text: "رَبِّ زِدْنِي عِلْمًا", count: 1, source: "سورة طه - 114" }
      ]
    },
    {
      id: "sunnah",
      title: "أدعية من السنة",
      icon: "bi-star-fill",
      items: [
        { text: "اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَىٰ وَالتُّقَىٰ وَالْعَفَافَ وَالْغِنَىٰ", count: 1 },
        { text: "اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي، وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، اللَّهُمَّ اغْفِرْ لِي جِدِّي وَهَزْلِي، وَخَطَئِي وَعَمْدِي، وَكُلُّ ذَٰلِكَ عِنْدِي، اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", count: 1 },
        { text: "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي", count: 1 },
        { text: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَٰهَ إِلَّا أَنْتَ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ", count: 1 }
      ]
    },
    {
      id: "ramadan",
      title: "أدعية رمضان",
      icon: "bi-moon-stars",
      items: [
        { text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", count: 3, source: "دعاء ليلة القدر" },
        { text: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ", count: 1, source: "دعاء عند الإفطار" },
        { text: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَىٰ رِزْقِكَ أَفْطَرْتُ", count: 1, source: "دعاء عند الإفطار" },
        { text: "اللَّهُمَّ بَلِّغْنَا رَمَضَانَ، وَأَعِنَّا عَلَىٰ صِيَامِهِ وَقِيَامِهِ، وَتَقَبَّلْهُ مِنَّا", count: 1 },
        { text: "اللَّهُمَّ اجْعَلْنَا مِمَّنْ صَامَهُ إِيمَانًا وَاحْتِسَابًا، فَغُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", count: 1 }
      ]
    },
    {
      id: "safar",
      title: "أدعية السفر",
      icon: "bi-airplane-fill",
      items: [
        { text: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ", count: 1, source: "دعاء ركوب وسيلة السفر" },
        { text: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ", count: 1 },
        { text: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ", count: 1, source: "دعاء العودة من السفر" }
      ]
    },
    {
      id: "jumua",
      title: "أدعية يوم الجمعة",
      icon: "bi-calendar-week-fill",
      items: [
        { text: "الْإِكْثَارُ مِنَ الصَّلَاةِ عَلَىٰ النَّبِيِّ ﷺ: اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ", count: 10, source: "أكثروا من الصلاة عليّ يوم الجمعة" },
        { text: "قراءة سورة الكهف يوم الجمعة", count: 1, source: "من قرأها أضاء له من النور ما بين الجمعتين" },
        { text: "تحرّي ساعة الإجابة آخر ساعة بعد العصر بالدعاء بما شاء المسلم من خير الدنيا والآخرة", count: 1 }
      ]
    },
    {
      id: "marid",
      title: "أدعية المريض",
      icon: "bi-heart-pulse-fill",
      items: [
        { text: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ", count: 7 },
        { text: "لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ", count: 1 },
        { text: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا", count: 3 },
        { text: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ", count: 3 }
      ]
    },
    {
      id: "hamm",
      title: "أدعية تفريج الهمّ والحزن",
      icon: "bi-emoji-smile-fill",
      items: [
        { text: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", count: 1, source: "دعاء ذي النون" },
        { text: "اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي", count: 1 },
        { text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", count: 1 },
        { text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", count: 7 }
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
    const raw = localStorage.getItem(`eshraq_adiya_counts_${catId}`);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved && saved.date === todayKey()) return saved.counts;
    return {};
  }

  function saveCounters(catId, counts) {
    localStorage.setItem(`eshraq_adiya_counts_${catId}`, JSON.stringify({ date: todayKey(), counts }));
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

    container.innerHTML = cat.items.map((item, index) => {
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
        navigator.clipboard.writeText(item.text).then(() => alert("تم نسخ الدعاء بنجاح!"));
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
      localStorage.removeItem(`eshraq_adiya_counts_${activeCategoryId}`);
      renderCategory();
    });
  }

  renderTabs();
  renderCategory();
});
