document.addEventListener("DOMContentLoaded", () => {
  const surahsContainer = document.getElementById("surahs-container");
  const searchInput = document.getElementById("quran-search-input");

  let allSurahs = [];

  // جلب سور القرآن الكريم من API موثوق وسريع
  async function fetchSurahs() {
    try {
      const response = await fetch("https://api.alquran.cloud/v1/surah");
      const data = await response.json();
      
      if (data.code === 200) {
        allSurahs = data.data;
        displaySurahs(allSurahs);
      } else {
        surahsContainer.innerHTML = `<div class="text-center text-danger py-4">تعذر تحميل سور القرآن الكريم، يرجى المحاولة لاحقاً.</div>`;
      }
    } catch (error)  {
      console.error("Error fetching surahs:", error);
      surahsContainer.innerHTML = `<div class="text-center text-danger py-4">تحقق من اتصالك بالإنترنت.</div>`;
    }
  }

  // دالة عرض السور كبطاقات فخمة
function displaySurahs(surahs) {
    if (surahs.length === 0) {
      surahsContainer.innerHTML = `<div class="text-center text-light py-4 opacity-75">لا توجد نتائج مطابقة للبحث.</div>`;
      return;
    }

    surahsContainer.innerHTML = surahs.map(surah => {
      const revelationType = surah.revelationType === "Meccan" ? "مكية" : "مدنية";
      
      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card bg-dark border-gold h-100 p-3 shadow-sm position-relative overflow-hidden" style="border: 1px solid #edcea0;background-color: #21211D !important;  border-radius: 12px; transition: transform 0.2s;">
            
            <!-- استخدام Flexbox لتوزيع العناصر أقصى اليمين وأقصى اليسار -->
            <div class="d-flex justify-content-between align-items-center w-100">
              
              <!-- القسم الأيمن: أقصى اليمين تماماً -->
              <div class="text-end">
                <h4 class="gold fw-bold mb-1" style="color: #edcea0; font-family: 'Amiri', 'Traditional Arabic', serif; font-size: 1.5rem;">
                  ${surah.name}
                </h4>
                <span class="d-block text-light opacity-75 small">${surah.numberOfAyahs} آيات</span>
              </div>

              <!-- القسم الأيسر: أقصى اليسار تماماً -->
              <div class="text-start ps-2" style="border-right: 1px solid rgba(237, 206, 160, 0.2); padding-right: 12px;">
                <span class="badge mb-1" style="background-color: rgba(237, 206, 160,.15); color: #edcea0; font-size: 0.7rem;">
                  رقم ${surah.number} | ${revelationType}
                </span>
                <h6 class="text-light fw-bold mb-0 text-truncate" style="font-size: 0.95rem;">${surah.englishName}</h6>
                <p class="text-light opacity-50 small mb-0 text-truncate" style="font-size: 0.75rem;">${surah.englishNameTranslation}</p>
              </div>

            </div>
            
            <!-- زر الانتقال لقراءة السورة -->
            <div class="mt-3 pt-2 border-top border-gold-subtle text-center">
              <a href="surah-reader.html?surah=${surah.number}" class="btn btn-sm w-100 py-1" style="border: 1px solid #edcea0; color: #edcea0; background-color: rgba(237, 206, 160, 0.05);">
                <i class="bi bi-book-half me-1"></i> قراءة السورة
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }
// دالة ذكية لإزالة التشكيل والحروف الخاصة لتسهيل البحث المطابق
  function normalizeText(text) {
    return text
      .replace(/[\u064b-\u0652]/g, "") // إزالة التشكيل العربي
      .replace(/[أإآا]/g, "اتو")        // توحيد أشكال الألف (اختياري، أو إبقاؤها بسيطة)
      .toLowerCase()
      .trim();
  }

  // تفعيل البحث الفوري عن السور بدقة عالية ومتجاورة للتشكيل
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const rawTerm = e.target.value;
      const term = normalizeText(rawTerm);
      
      if (term === "") {
        displaySurahs(allSurahs);
        return;
      }

      const filtered = allSurahs.filter(surah => {
        const arabicName = normalizeText(surah.name);
        const englishName = surah.englishName.toLowerCase();
        const numberStr = surah.number.toString();

        return (
          arabicName.includes(term) ||
          englishName.includes(term) ||
          numberStr === term
        );
      });

      displaySurahs(filtered);
    });
  }

  // تشغيل الجلب عند تحميل الصفحة
  fetchSurahs();
});