document.addEventListener("DOMContentLoaded", () => {
  const ayahsContainer = document.getElementById("ayahs-container");
  const surahTopTitle = document.getElementById("surah-top-title");
  const toggleLayoutBtn = document.getElementById("toggle-layout-btn");
  const fontIncreaseBtn = document.getElementById("font-increase-btn");
  const fontDecreaseBtn = document.getElementById("font-decrease-btn");

  const urlParams = new URLSearchParams(window.location.search);
  const surahNumber = urlParams.get("surah") || 1;

  let currentSurahName = "";
  let ayahsList = [];
  
  // حالة العرض وحجم الخط المحفوظ بالذاكرة المحلية
  let isMushafMode = localStorage.getItem("eshraq_mushaf_mode") === "true";
  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;

  updateToggleButtonText();

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
  }

  // الشكل الأول: القائمة العادية
  function renderStandardLayout() {
    if (!ayahsContainer) return;
    
    ayahsContainer.innerHTML = ayahsList.map((ayah, index) => {
      const text = getCleanAyahText(ayah, index);
      return `
        <div class="ayah-item mb-4 pb-3 border-bottom border-gold-subtle position-relative text-center">
          <p class="ayah-text mb-3" style="font-size: ${currentFontSize}rem !important; line-height: 2.2; font-family: 'Amiri', 'Traditional Arabic', serif;">
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
  }

  // الشكل الثاني: طريقة المصحف الشريف المتصل
  function renderMushafLayout() {
    if (!ayahsContainer) return;

    let fullMushafText = "";
    ayahsList.forEach((ayah, index) => {
      const text = getCleanAyahText(ayah, index);
      fullMushafText += `${text} <span class="text-gold" style="font-family: 'Amiri', 'Traditional Arabic', serif; font-size: ${currentFontSize}rem;">﴿${ayah.numberInSurah}﴾</span> `;
    });

    ayahsContainer.innerHTML = `
      <div class="mushaf-box p-4 rounded bg-dark bg-opacity-25 border border-gold-subtle" style="direction: rtl; text-align: justify;">
        <p class="mushaf-paragraph" style="font-family: 'Amiri', 'Traditional Arabic', serif; font-size: ${currentFontSize}rem; line-height: 2.7; color: #f8f9fa; letter-spacing: 0.3px;">
          ${fullMushafText}
        </p>
      </div>
    `;
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

  if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener("click", () => {
      if (currentFontSize < 2.6) {
        currentFontSize += 0.2;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderAyahs();
      }
    });
  }

  if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener("click", () => {
      if (currentFontSize > 1.2) {
        currentFontSize -= 0.2;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderAyahs();
      }
    });
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