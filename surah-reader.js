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

  let isMushafMode = localStorage.getItem("eshraq_mushaf_mode") === "true";
  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;
  let isUthmaniFont = localStorage.getItem("eshraq_font_family") === "uthmani";
  let isFocusMode = localStorage.getItem("eshraq_focus_mode") === "true";

  // دالة الخطوط: الخط العثماني (Amiri Quran) أو العادي (Amiri)
  function getFontFamilyCss() {
    return isUthmaniFont
      ? "'Amiri Quran', serif"
      : "'Amiri', serif";
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
      text = text.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ\s*/, "")
                 .replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "")
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

  // العرض العادي
  function renderStandardLayout() {
    if (!ayahsContainer) return;
    
    ayahsContainer.innerHTML = ayahsList.map((ayah, index) => {
      const text = getCleanAyahText(ayah, index);
      return `
        <div class="ayah-item mb-4 pb-3 border-bottom border-gold-subtle position-relative text-center" data-ayahnum="${ayah.numberInSurah}">
          <p class="ayah-text mb-3" style="font-size: ${currentFontSize}rem !important; line-height: 2.3; font-family: ${getFontFamilyCss()} !important; color: #f8f9fa;">
            ${text} <span class="badge rounded-pill border border-gold text-gold ms-2" style="border-color: #edcea0 !important; color: #edcea0; font-family: 'Tajawal', sans-serif; font-size: 1rem;">(${ayah.numberInSurah})</span>
          </p>
          <div class="d-flex justify-content-start gap-2">
            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 copy-btn" data-index="${index}"><i class="bi bi-copy"></i> نسخ</button>
            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 text-success share-btn" data-index="${index}"><i class="bi bi-whatsapp"></i> مشاركة</button>
            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 fav-btn" data-index="${index}"><i class="bi bi-star"></i> مفضلة</button>
          </div>
        </div>
      `;
    }).join("");

    bindEvents();
    setupScrollTracking();
    tryAutoScrollToSavedPosition();
  }

  // عرض شكل المصحف الشريف
  function renderMushafLayout() {
    if (!ayahsContainer) return;

    let fullMushafText = "";
    ayahsList.forEach((ayah, index) => {
      const text = getCleanAyahText(ayah, index);
      fullMushafText += `<span class="mushaf-ayah-unit" data-ayahnum="${ayah.numberInSurah}">${text} <span class="text-gold" style="font-family: ${getFontFamilyCss()} !important; font-size: ${currentFontSize}rem;">﴿${ayah.numberInSurah}﴾</span></span> `;
    });

    ayahsContainer.innerHTML = `
      <div class="mushaf-box p-3 rounded" style="direction: rtl; text-align: justify;">
        <p class="mushaf-paragraph" style="font-family: ${getFontFamilyCss()} !important; font-size: ${currentFontSize}rem; line-height: 2.8; color: #f8f9fa; letter-spacing: 0.3px;">
          ${fullMushafText}
        </p>
      </div>
    `;

    tryAutoScrollToSavedPosition();
  }

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
      if (target) target.scrollIntoView({ behavior: "auto", block: "center" });
      hasAutoScrolled = true;
    }, 150);
  }

  function bindEvents() {
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const text = getCleanAyahText(ayah, parseInt(index));
        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);
        navigator.clipboard.writeText(`"${text}" [سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]`).then(() => alert("تم نسخ الآية!"));
      });
    });

    document.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const text = getCleanAyahText(ayah, parseInt(index));
        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`"${text}" \n[سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]`)}`, '_blank');
      });
    });

    document.querySelectorAll(".fav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);
        toggleFavorite(ayah, currentSurahName);
      });
    });
  }

  function updateToggleButtonText() {
    if (toggleLayoutBtn) {
      toggleLayoutBtn.innerHTML = isMushafMode 
        ? `<i class="bi bi-list-task"></i> العرض العادي` 
        : `<i class="bi bi-book"></i> شكل المصحف`;
    }
  }

  // زر تغيير التخطيط (عادي / مصحف)
  if (toggleLayoutBtn) {
    toggleLayoutBtn.addEventListener("click", () => {
      isMushafMode = !isMushafMode;
      localStorage.setItem("eshraq_mushaf_mode", isMushafMode);
      updateToggleButtonText();
      renderAyahs();
    });
  }

  // زر تبديل الخط (الرسم العثماني / الخط العادي) - تم ربطه مباشرة ليعمل فوراً
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
      if (isFocusMode) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
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

  // نظام الصوت والتلاوة
  const audioEl = document.getElementById("surah-audio");
  const audioPlayBtn = document.getElementById("audio-play-btn");
  const audioProgressWrap = document.getElementById("audio-progress-wrap");
  const audioAyahIndicator = document.getElementById("audio-ayah-indicator");
  const audioStopBtn = document.getElementById("audio-stop-btn");

  let currentAudioAyahIndex = -1;
  let isAudioPlaying = false;

  function highlightAyah(numberInSurah) {
    document.querySelectorAll(".active-ayah").forEach(el => el.classList.remove("active-ayah"));
    if (numberInSurah === null) return;
    const target = document.querySelector(`[data-ayahnum="${numberInSurah}"]`);
    if (target) {
      target.classList.add("active-ayah");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function playAyahAtIndex(index) {
    if (!audioEl || index < 0 || index >= ayahsList.length) {
      stopAudioPlayback();
      return;
    }
    currentAudioAyahIndex = index;
    const ayah = ayahsList[index];
    audioEl.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    audioEl.play();
    highlightAyah(ayah.numberInSurah);
    if (audioAyahIndicator) audioAyahIndicator.textContent = `الآية ${ayah.numberInSurah} من ${ayahsList.length}`;
  }

  function stopAudioPlayback() {
    if (audioEl) { audioEl.pause(); audioEl.removeAttribute("src"); }
    isAudioPlaying = false;
    currentAudioAyahIndex = -1;
    highlightAyah(null);
    if (audioProgressWrap) audioProgressWrap.classList.add("d-none");
    if (audioPlayBtn) audioPlayBtn.innerHTML = `<i class="bi bi-play-fill me-1"></i> استماع لتلاوة السورة (الشيخ مشاري العفاسي)`;
  }

  if (audioPlayBtn && audioEl) {
    audioPlayBtn.addEventListener("click", () => {
      if (isAudioPlaying) { audioEl.pause(); return; }
      if (audioProgressWrap) audioProgressWrap.classList.remove("d-none");
      playAyahAtIndex(currentAudioAyahIndex >= 0 ? currentAudioAyahIndex : 0);
    });

    audioEl.addEventListener("play", () => {
      isAudioPlaying = true;
      audioPlayBtn.innerHTML = `<i class="bi bi-pause-fill me-1"></i> إيقاف مؤقت`;
    });

    audioEl.addEventListener("pause", () => {
      isAudioPlaying = false;
      if (currentAudioAyahIndex >= 0) audioPlayBtn.innerHTML = `<i class="bi bi-play-fill me-1"></i> متابعة التلاوة`;
    });

    audioEl.addEventListener("ended", () => playAyahAtIndex(currentAudioAyahIndex + 1));
    audioEl.addEventListener("error", () => { stopAudioPlayback(); alert("تعذر تحميل التلاوة."); });
  }

  if (audioStopBtn) audioStopBtn.addEventListener("click", stopAudioPlayback);

  fetchSurahData();
});

function saveReadingProgress(surahNum, surahName, ayahNum) {
  const cleanName = surahName.replace(/^(سُورَةُ|سورة)\s*/, "").trim();
  localStorage.setItem("eshraq_last_progress", JSON.stringify({
    surahNumber: parseInt(surahNum),
    surahName: cleanName,
    ayahNumber: parseInt(ayahNum),
    date: new Date().toLocaleDateString('ar-SY')
  }));
}

function toggleFavorite(ayah, surahName) {
  let favorites = JSON.parse(localStorage.getItem("eshraq_favorites")) || [];
  const existingIndex = favorites.findIndex(fav => fav.surahName === surahName && fav.ayahNum === ayah.numberInSurah);
  if (existingIndex > -1) {
    favorites.splice(existingIndex, 1);
    alert("تمت إزالة الآية من المفضلة.");
  } else {
    favorites.push({ surahName, ayahNum: ayah.numberInSurah, text: ayah.text });
    alert("تمت إضافة الآية للمفضلة ⭐");
  }
  localStorage.setItem("eshraq_favorites", JSON.stringify(favorites));
}