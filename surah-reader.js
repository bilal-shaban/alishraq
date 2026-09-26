document.addEventListener("DOMContentLoaded", () => {
  const ayahsContainer = document.getElementById("ayahs-container");
  const surahTopTitle = document.getElementById("surah-top-title");
  const toggleLayoutBtn = document.getElementById("toggle-layout-btn");
  const fontIncreaseBtn = document.getElementById("font-increase-btn");
  const fontDecreaseBtn = document.getElementById("font-decrease-btn");
  const fontSizeIndicator = document.getElementById("font-size-indicator");
  const toggleFontFamilyBtn = document.getElementById("toggle-font-family-btn");
  const focusModeBtn = document.getElementById("focus-mode-btn");

  const urlParams = new URLSearchParams(window.location.search);
  const surahNumber = urlParams.get("surah") || 1;

  let currentSurahName = "";
  let ayahsList = [];
  let hasAutoScrolled = false;

  // حالة العرض وحجم الخط ونوع الخط المحفوظة بالذاكرة المحلية
  let isMushafMode = localStorage.getItem("eshraq_mushaf_mode") === "true";
  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;
  let isUthmaniFont = localStorage.getItem("eshraq_font_family") === "uthmani";
  let isFocusMode = localStorage.getItem("eshraq_focus_mode") === "true";

  function getFontFamilyCss() {
    return isUthmaniFont
      ? "'Amiri Quran', 'Traditional Arabic', serif"
      : "'Amiri', 'Traditional Arabic', serif";
  }

  function updateFontIndicator() {
    if (fontSizeIndicator) {
      fontSizeIndicator.textContent = Math.round((currentFontSize / 1.6) * 100) + "%";
    }
  }

  function updateFontFamilyButtonText() {
    if (toggleFontFamilyBtn) {
      toggleFontFamilyBtn.innerHTML = isUthmaniFont
        ? `<i class="bi bi-fonts"></i> الخط العادي`
        : `<i class="bi bi-fonts"></i> الرسم العثماني`;
    }
  }

  function updateFocusModeButton() {
    if (focusModeBtn) {
      focusModeBtn.innerHTML = isFocusMode
        ? `<i class="bi bi-fullscreen-exit"></i>`
        : `<i class="bi bi-arrows-fullscreen"></i>`;
    }
    document.body.classList.toggle("focus-reading-mode", isFocusMode);
  }

  updateToggleButtonText();
  updateFontIndicator();
  updateFontFamilyButtonText();
  updateFocusModeButton();

  async function fetchSurahData() {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await response.json();
      
      if (data.code === 200) {
        const surah = data.data;
        currentSurahName = surah.name;
        ayahsList = surah.ayahs;
        
        if (surahTopTitle) {
          surahTopTitle.textContent = `${surah.name} (${surah.englishName})`;
        }
        
        renderAyahs();
        localStorage.setItem("eshraq_last_surah", JSON.stringify({ number: surahNumber, name: surah.name }));
        
        // حفظ موضع القراءة تلقائياً عند فتح السورة
        saveReadingProgress(surahNumber, surah.name, 1);

      } else {
        ayahsContainer.innerHTML = `<div class="text-center text-danger py-4">تعذر جلب الآيات.</div>`;
      }
    } catch (error) {
      console.error("Error fetching surah:", error);
      ayahsContainer.innerHTML = `<div class="text-center text-danger py-4">تحقق من اتصالك بالإنترنت.</div>`;
    }
  }

  function getCleanAyahText(ayah, index) {
    let text = ayah.text;
    if (surahNumber != 1 && surahNumber != 9 && index === 0) {
      text = text.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ\s*/, "")
                 .replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "")
                 .trim();
    }
    return text;
  }

  function renderAyahs() {
    if (isMushafMode) {
      renderMushafLayout();
    } else {
      renderStandardLayout();
    }
    if (currentAudioAyahIndex >= 0 && ayahsList[currentAudioAyahIndex]) {
      highlightAyah(ayahsList[currentAudioAyahIndex].numberInSurah);
    }
  }

  // الشكل الأول: القائمة العادية
  function renderStandardLayout() {
    if (!ayahsContainer) return;
    
    ayahsContainer.innerHTML = ayahsList.map((ayah, index) => {
      const text = getCleanAyahText(ayah, index);
      return `
        <div class="ayah-item mb-4 pb-3 border-bottom border-gold-subtle position-relative text-center" data-ayahnum="${ayah.numberInSurah}">
          <p class="ayah-text mb-3" style="font-size: ${currentFontSize}rem !important; line-height: 2.2; font-family: ${getFontFamilyCss()};">
            ${text} <span class="badge rounded-pill border border-gold text-gold ms-2" style="border-color: #edcea0 !important; color: #edcea0; font-family: 'Tajawal', sans-serif; font-size: 1rem;">(${ayah.numberInSurah})</span>
          </p>
          <div class="d-flex justify-content-start gap-2">
            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 copy-btn" data-index="${index}" title="نسخ الآية">
              <i class="bi bi-copy"></i> نسخ
            </button>
            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 text-success share-btn" data-index="${index}" title="مشاركة عبر واتساب">
              <i class="bi bi-whatsapp"></i> مشاركة
            </button>
            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 fav-btn" data-index="${index}" title="إضافة للمفضلة">
              <i class="bi bi-star"></i> مفضلة
            </button>
          </div>
        </div>
      `;
    }).join("");

    bindEvents();
    setupScrollTracking();
    tryAutoScrollToSavedPosition();
  }

  // الشكل الثاني: طريقة المصحف الشريف المتصل
  function renderMushafLayout() {
    if (!ayahsContainer) return;

    let fullMushafText = "";
    ayahsList.forEach((ayah, index) => {
      const text = getCleanAyahText(ayah, index);
      fullMushafText += `<span class="mushaf-ayah-unit" data-ayahnum="${ayah.numberInSurah}">${text} <span class="text-gold" style="font-family: ${getFontFamilyCss()}; font-size: ${currentFontSize}rem;">﴿${ayah.numberInSurah}﴾</span></span> `;
    });

    ayahsContainer.innerHTML = `
      <div class="mushaf-box p-4 rounded bg-dark bg-opacity-25 border border-gold-subtle" style="direction: rtl; text-align: justify;">
        <p class="mushaf-paragraph" style="font-family: ${getFontFamilyCss()}; font-size: ${currentFontSize}rem; line-height: 2.7; color: #f8f9fa; letter-spacing: 0.3px;">
          ${fullMushafText}
        </p>
      </div>
    `;

    tryAutoScrollToSavedPosition();
  }

  // ===== تتبع مكان القراءة والرجوع له تلقائياً =====
  let scrollSaveTimeout = null;
  function setupScrollTracking() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const ayahNum = entry.target.getAttribute("data-ayahnum");
          if (!ayahNum) return;
          clearTimeout(scrollSaveTimeout);
          scrollSaveTimeout = setTimeout(() => {
            localStorage.setItem(`eshraq_surah_scroll_${surahNumber}`, ayahNum);
            saveReadingProgress(surahNumber, currentSurahName, ayahNum);
          }, 600);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll(".ayah-item").forEach(el => observer.observe(el));
  }

  function tryAutoScrollToSavedPosition() {
    if (hasAutoScrolled) return;
    const savedAyah = localStorage.getItem(`eshraq_surah_scroll_${surahNumber}`);
    if (!savedAyah || savedAyah === "1") { hasAutoScrolled = true; return; }

    setTimeout(() => {
      const target = document.querySelector(`[data-ayahnum="${savedAyah}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "center" });
      }
      hasAutoScrolled = true;
    }, 150);
  }

 function bindEvents() {
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const text = getCleanAyahText(ayah, parseInt(index));
        
        // ⭐ تحديث موضع القراءة فوراً عند نسخ الآية
        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);

        const fullText = `"${text}" [سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]`;
        navigator.clipboard.writeText(fullText).then(() => alert("تم نسخ الآية بنجاح!"));
      });
    });

    document.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const text = getCleanAyahText(ayah, parseInt(index));
        
        // ⭐ تحديث موضع القراءة فوراً عند مشاركة الآية
        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);

        const fullText = `"${text}" \n[سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]\nمشاركة عبر تطبيق إشراق 🌙`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
      });
    });

    document.querySelectorAll(".fav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        
        // ⭐ تحديث موضع القراءة فوراً عند إضافة الآية للمفضلة
        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);

        toggleFavorite(ayah, currentSurahName, parseInt(index));
      });
    });
  }

  function updateToggleButtonText() {
    if (toggleLayoutBtn) {
      if (isMushafMode) {
        toggleLayoutBtn.innerHTML = `<i class="bi bi-list-task"></i> العرض العادي`;
      } else {
        toggleLayoutBtn.innerHTML = `<i class="bi bi-book"></i> شكل المصحف الشريف`;
      }
    }
  }

  if (toggleLayoutBtn) {
    toggleLayoutBtn.addEventListener("click", () => {
      isMushafMode = !isMushafMode;
      localStorage.setItem("eshraq_mushaf_mode", isMushafMode);
      updateToggleButtonText();
      renderAyahs();
    });
  }

  if (toggleFontFamilyBtn) {
    toggleFontFamilyBtn.addEventListener("click", () => {
      isUthmaniFont = !isUthmaniFont;
      localStorage.setItem("eshraq_font_family", isUthmaniFont ? "uthmani" : "amiri");
      updateFontFamilyButtonText();
      renderAyahs();
    });
  }

  if (focusModeBtn) {
    focusModeBtn.addEventListener("click", () => {
      isFocusMode = !isFocusMode;
      localStorage.setItem("eshraq_focus_mode", isFocusMode);
      updateFocusModeButton();
    });
  }

  if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener("click", () => {
      if (currentFontSize < 2.6) {
        currentFontSize += 0.2;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        updateFontIndicator();
        renderAyahs();
      }
    });
  }

  if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener("click", () => {
      if (currentFontSize > 1.2) {
        currentFontSize -= 0.2;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        updateFontIndicator();
        renderAyahs();
      }
    });
  }

  // ===== تشغيل تلاوة السورة مع اختيار القارئ =====
  const RECITERS = [
    { id: "ar.alafasy", name: "مشاري العفاسي", perAyah: true },
    { id: "ar.mahermuaiqly", name: "ماهر المعيقلي", perAyah: true },
    { id: "ar.abdurrahmaansudais", name: "عبدالرحمن السديس", perAyah: true },
    { id: "ar.yasseraldossari", name: "ياسر الدوسري", perAyah: false }
  ];

  const audioEl = document.getElementById("surah-audio");
  const audioPlayBtn = document.getElementById("audio-play-btn");
  const audioProgressWrap = document.getElementById("audio-progress-wrap");
  const audioAyahIndicator = document.getElementById("audio-ayah-indicator");
  const audioReciterLabel = document.getElementById("audio-reciter-label");
  const audioStopBtn = document.getElementById("audio-stop-btn");
  const reciterSelect = document.getElementById("reciter-select");

  let currentAudioAyahIndex = -1; // فهرس الآية الحالية جوا ayahsList (للقراء اللي فيهم تلاوة آية بآية فقط)
  let isAudioPlaying = false;
  let selectedReciterId = localStorage.getItem("eshraq_reciter") || "ar.alafasy";
  let triedFullSurahFallback = false; // لتفادي محاولات لا نهائية إذا فشل التشغيل بكل الطرق

  function getSelectedReciter() {
    return RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];
  }

  if (reciterSelect) {
    reciterSelect.innerHTML = RECITERS.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
    reciterSelect.value = selectedReciterId;
    if (audioReciterLabel) audioReciterLabel.textContent = getSelectedReciter().name;
    reciterSelect.addEventListener("change", () => {
      stopAudioPlayback();
      selectedReciterId = reciterSelect.value;
      localStorage.setItem("eshraq_reciter", selectedReciterId);
      if (audioReciterLabel) audioReciterLabel.textContent = getSelectedReciter().name;
    });
  }

  function highlightAyah(numberInSurah) {
    document.querySelectorAll(".active-ayah").forEach(el => el.classList.remove("active-ayah"));
    if (numberInSurah === null) return;
    const target = document.querySelector(`[data-ayahnum="${numberInSurah}"]`);
    if (target) {
      target.classList.add("active-ayah");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // تشغيل آية بآية (يتيح تمييز الآية الحالية) - يعمل فقط مع القراء الذين تتوفر لهم ملفات لكل آية
  function playAyahAtIndex(index) {
    if (!audioEl || index < 0 || index >= ayahsList.length) {
      stopAudioPlayback();
      return;
    }
    currentAudioAyahIndex = index;
    triedFullSurahFallback = false;
    const ayah = ayahsList[index];
    audioEl.src = `https://cdn.islamic.network/quran/audio/128/${selectedReciterId}/${ayah.number}.mp3`;
    audioEl.play();

    highlightAyah(ayah.numberInSurah);
    if (audioAyahIndicator) {
      audioAyahIndicator.textContent = `الآية ${ayah.numberInSurah} من ${ayahsList.length}`;
    }
  }

  // تشغيل ملف السورة كاملة دفعة واحدة - يُستخدم مع القراء الذين لا تتوفر لهم ملفات منفصلة لكل آية
  function playFullSurah() {
    if (!audioEl) return;
    currentAudioAyahIndex = -1;
    audioEl.src = `https://cdn.islamic.network/quran/audio-surah/128/${selectedReciterId}/${surahNumber}.mp3`;
    audioEl.play();
    highlightAyah(null);
    if (audioAyahIndicator) {
      audioAyahIndicator.textContent = `تشغيل السورة كاملة (بدون تمييز آية بآية لهذا القارئ)`;
    }
  }

  function stopAudioPlayback() {
    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute("src");
    }
    isAudioPlaying = false;
    currentAudioAyahIndex = -1;
    highlightAyah(null);
    if (audioProgressWrap) audioProgressWrap.classList.add("d-none");
    if (audioPlayBtn) audioPlayBtn.innerHTML = `<i class="bi bi-play-fill"></i> استماع للسورة`;
  }

  if (audioPlayBtn && audioEl) {
    audioPlayBtn.addEventListener("click", () => {
      if (isAudioPlaying) {
        audioEl.pause();
        return;
      }
      if (audioProgressWrap) audioProgressWrap.classList.remove("d-none");
      const reciter = getSelectedReciter();
      if (reciter.perAyah) {
        const startIndex = currentAudioAyahIndex >= 0 ? currentAudioAyahIndex : 0;
        playAyahAtIndex(startIndex);
      } else {
        playFullSurah();
      }
    });

    audioEl.addEventListener("play", () => {
      isAudioPlaying = true;
      audioPlayBtn.innerHTML = `<i class="bi bi-pause-fill"></i> إيقاف مؤقت`;
    });

    audioEl.addEventListener("pause", () => {
      isAudioPlaying = false;
      if (audioEl.src) {
        audioPlayBtn.innerHTML = `<i class="bi bi-play-fill"></i> متابعة الاستماع`;
      }
    });

    audioEl.addEventListener("ended", () => {
      const reciter = getSelectedReciter();
      if (reciter.perAyah) {
        playAyahAtIndex(currentAudioAyahIndex + 1);
      } else {
        stopAudioPlayback();
      }
    });

    audioEl.addEventListener("error", () => {
      if (!audioEl.src) return;
      const reciter = getSelectedReciter();
      // إذا فشل تحميل ملف آية بمفردها، جرّب تشغيل السورة كاملة كخطة بديلة قبل الاستسلام
      if (reciter.perAyah && !triedFullSurahFallback) {
        triedFullSurahFallback = true;
        playFullSurah();
        return;
      }
      stopAudioPlayback();
      alert("تعذر تحميل التلاوة الصوتية بصوت هذا القارئ حالياً، جرّب قارئاً آخر أو تحقق من الاتصال بالإنترنت.");
    });
  }

  if (audioStopBtn) {
    audioStopBtn.addEventListener("click", stopAudioPlayback);
  }

  fetchSurahData();
});

// حفظ موضع القراءة الحالي وتحديثه فوراً
function saveReadingProgress(surahNum, surahName, ayahNum) {
  const cleanName = surahName.replace(/^(سُورَةُ|سورة)\s*/, "").trim();
  const progress = {
    surahNumber: parseInt(surahNum),
    surahName: cleanName,
    ayahNumber: parseInt(ayahNum),
    date: new Date().toLocaleDateString('ar-SY')
  };
  localStorage.setItem("eshraq_last_progress", JSON.stringify(progress));
}

function toggleFavorite(ayah, surahName, index) {
  let favorites = JSON.parse(localStorage.getItem("eshraq_favorites")) || [];
  const existingIndex = favorites.findIndex(fav => fav.surahName === surahName && fav.ayahNum === ayah.numberInSurah);

  if (existingIndex > -1) {
    favorites.splice(existingIndex, 1);
    alert("تمت إزالة الآية من المفضلة.");
  } else {
    favorites.push({
      surahName: surahName,
      ayahNum: ayah.numberInSurah,
      text: ayah.text
    });
    alert("تمت إضافة الآية إلى المفضلة بنجاح! ⭐");
  }

  localStorage.setItem("eshraq_favorites", JSON.stringify(favorites));
}