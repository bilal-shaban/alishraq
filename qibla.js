// إحداثيات الكعبة المشرفة (مكة المكرمة)
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// متغيرات عامة لحساب القبلة وحالة الاهتزاز
window.calculatedQiblaHeading = 0;
window.hasVibrated = false;

// دالة تحديث الحالة الذكية بنظام الفئات النظيف
function updateQiblaStatus(message, type = "normal") {
  const statusEl = document.getElementById("qibla-status");
  const statusBox = document.getElementById("qibla-status-box");
  
  if (statusEl && statusBox) {
    statusEl.textContent = message;
    statusBox.className = `qibla-status-box ${type} mb-3`;
  }
}

// دالة معالجة حركة واتجاه الهاتف الحقيقية
function handleOrientation(event) {
  let compass;

  // دعم أجهزة أيفون الحديثة (webkitCompassHeading) - هاي القيمة صحيحة مباشرة (شمال=0، تزيد مع عقارب الساعة)
  if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
    compass = event.webkitCompassHeading;
  } else if (event.alpha !== null && event.alpha !== undefined) {
    // على أندرويد alpha بتزيد بعكس عقارب الساعة، لازم نعكسها عشان تطابق اتجاه البوصلة الحقيقي
    compass = 360 - event.alpha;
  } else {
    compass = null;
  }

  if (compass === null || compass === undefined) {
    updateQiblaStatus("المستشعر المغناطيسي غير متوفر، يرجى تفعيل الموقع أو تدوير الهاتف.", "warning");
    return;
  }

  let qiblaHeading = window.calculatedQiblaHeading || 0;
  let diff = qiblaHeading - compass;

  // تحريك مؤشر البوصلة بسلاسة
  const pointer = document.getElementById("qibla-pointer");
  const dial = document.getElementById("compass-dial");
  
  if (pointer) {
    pointer.style.transform = `rotate(${diff}deg)`;
  }

  // تحديث القيم الرقمية بالشاشة (إن وجدت العناصر)
  const angleVal = document.getElementById("device-angle-val");
  const targetVal = document.getElementById("qibla-target-val");
  if (angleVal) angleVal.textContent = Math.round(compass) + "°";
  if (targetVal) targetVal.textContent = Math.round(qiblaHeading) + "°";

  // فحص التطابق التام ضمن هامش خطأ 3 درجات
  let normalizedDiff = Math.abs(diff % 360);
  if (normalizedDiff > 180) normalizedDiff = 360 - normalizedDiff;

  if (normalizedDiff <= 3) {
    if (dial) dial.classList.add('aligned-success');
    updateQiblaStatus("✨ ما شاء الله! أنت باتجاه القبلة تماماً، تقبل الله طاعتك.", "success");
    
    // اهتزازة خفيفة للتنبيه (إذا كانت مدعومة بالمتصفح)
    if (navigator.vibrate && !window.hasVibrated) {
      navigator.vibrate(60);
      window.hasVibrated = true;
    }
  } else {
    if (dial) dial.classList.remove('aligned-success');
    window.hasVibrated = false;
    updateQiblaStatus("أبعد هاتفك عن أي حديد أو مجالات مغناطيسية، وحافظ على أفقية الهاتف.");
  }
}

// زر تفعيل المستشعرات لأجهزة أيفون وبعض هواتف أندرويد الأمنية
function requestCompassPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          const btn = document.getElementById('btn-enable-compass');
          if (btn) btn.classList.add('d-none');
          updateQiblaStatus("تم تفعيل المستشعر بنجاح، حرّك هاتفك ببطء.", "normal");
        } else {
          updateQiblaStatus("تم رفض إذن مستشعر الاتجاه من قبل المستخدم.", "warning");
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('deviceorientation', handleOrientation, true);
    updateQiblaStatus("تم تفعيل المستشعر المباشر بنجاح.", "normal");
  }
}

// التهيئة الأولية والتحقق من دعم الأجهزة
function initQiblaCompass() {
  updateQiblaStatus("جاري جلب إحداثيات الموقع وحساب اتجاه الكعبة...");

  // جلب موقع المستخدم الجغرافي لحساب زاوية القبلة الحقيقية
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      let lat1 = position.coords.latitude;
      let lon1 = position.coords.longitude;
      
      let lat2 = KAABA_LAT;
      let lon2 = KAABA_LNG;

      // معادلة حساب زاوية القبلة بدقة رياضية عالمية
      let dLon = (lon2 - lon1) * Math.PI / 180;
      let y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
      let x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
      let brng = Math.atan2(y, x) * 180 / Math.PI;
      window.calculatedQiblaHeading = (brng + 360) % 360;

      updateQiblaStatus("تم تحديد موقعك بنجاح، يرجى تدوير الهاتف بحركة رقم 8 لضبط الدقة.");

    }, error => {
      window.calculatedQiblaHeading = 160; // قيمة افتراضية
      updateQiblaStatus("تعذر جلب الموقع تلقائياً، تم ضبط اتجاه افتراضي.", "warning");
    }, { timeout: 10000 });
  } else {
    window.calculatedQiblaHeading = 160; // قيمة افتراضية
    updateQiblaStatus("جهازك لا يدعم تحديد الموقع الجغرافي، تم ضبط اتجاه افتراضي.", "warning");
  }

  // فحص الحاجة لزر الصلاحيات (أجهزة iOS)
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    const btn = document.getElementById('btn-enable-compass');
    if (btn) btn.classList.remove('d-none');
    updateQiblaStatus("يرجى الضغط على زر 'تفعيل مستشعر الاتجاه' للسماح بقراءة البوصلة.", "warning");
  } else {
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}

// التشغيل التلقائي عند تحميل الصفحة (فقط إذا كنا فعلياً بصفحة القبلة)
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("qibla-status")) {
    initQiblaCompass();
  }
});