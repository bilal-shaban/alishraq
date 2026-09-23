const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
let qiblaAngle = 0;

document.addEventListener('DOMContentLoaded', () => {
  initRealCompass();
});

function initRealCompass() {
  const statusEl = document.getElementById('qibla-status');
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        qiblaAngle = calculateQiblaBearing(userLat, userLng);
        
        startDeviceCompass();
      },
      (error) => {
        statusEl.innerText = "يرجى السماح بتحديد الموقع لحساب اتجاه القبلة.";
      },
      { enableHighAccuracy: true }
    );
  }
}

function calculateQiblaBearing(lat, lng) {
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lng * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const lambda2 = (KAABA_LNG * Math.PI) / 180;

  const y = Math.sin(lambda2 - lambda1);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lambda2 - lambda1);
  let theta = Math.atan2(y, x);
  let bearing = (theta * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function startDeviceCompass() {
  const statusEl = document.getElementById('qibla-status');
  const pointer = document.function ? null : document.getElementById('qibla-pointer');

  // طلب الصلاحية للأجهزة الذكية الحديثة (iOS)
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    statusEl.innerHTML = `<button onclick="requestIOSPermission()" class="btn btn-sm btn-gold-solid">اضغط هنا لتفعيل حركة البوصلة</button>`;
  } else {
    // الاستماع لحركة الجهاز للأنظمة الأخرى
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}

function requestIOSPermission() {
  DeviceOrientationEvent.requestPermission().then(response => {
    if (response === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation, true);
      document.getElementById('qibla-status').innerText = "تم تفعيل البوصلة بنجاح، حرّك هاتفك.";
    }
  });
}

function handleOrientation(event) {
  const pointer = document.getElementById('qibla-pointer');
  const statusEl = document.getElementById('qibla-status');
  
  let heading = event.alpha; 
  if (event.webkitCompassHeading !== undefined) {
    heading = event.webkitCompassHeading; // خاص بالآيفون
  }

  if (heading !== null && !isNaN(heading)) {
    // تعديل اتجاه الدوران بعكس الإشارة (-) لضبط الجهة الصحيحة تماماً
    let rotation = heading - qiblaAngle; 
    
    if (pointer) pointer.style.transform = `rotate(${rotation}deg)`;
    statusEl.innerText = `التوجيه نشط (القبلة على زاوية: ${Math.round(qiblaAngle)}°)`;
  }
}
// إذا صار الاتجاه صحيح تماماً
if (Math.abs(currentHeading - qiblaHeading) < 3) {
  if (navigator.vibrate) navigator.vibrate(50); // اهتزازة خفيفة قصيرة
  document.querySelector('.compass-dial').classList.add('aligned-success');
} else {
  document.querySelector('.compass-dial').classList.remove('aligned-success');
}



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
  let compass = event.alpha; // اتجاه الشمال للأندرويد
  
  // دعم أجهزة أيفون الحديثة (webkitCompassHeading)
  if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
    compass = event.webkitCompassHeading;
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

  // تحديث القيم الرقمية بالشاشة
  document.getElementById("device-angle-val").textContent = Math.round(compass) + "°";
  document.getElementById("qibla-target-val").textContent = Math.round(qiblaHeading) + "°";

  // فحص التطابق التام ضمن هامش خطأ 3 درجات (مع ميزة الاهتزاز والتفاعل البصري)
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
    if (dial) dial.classList.dial = dial.classList.remove('aligned-success'); // تصحيح إزالة الكلاس
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
          document.getElementById('btn-enable-compass').classList.add('d-none');
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
      
      // إحداثيات الكعبة المشرفة (مكة المكرمة)
      let lat2 = 21.4225;
      let lon2 = 39.8262;

      // معادلة حساب زاوية القبلة بدقة رياضية عالمية
      let dLon = (lon2 - lon1) * Math.PI / 180;
      let y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
      let x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
      let brng = Math.atan2(y, x) * 180 / Math.PI;
      window.calculatedQiblaHeading = (brng + 360) % 360;

      updateQiblaStatus("تم تحديد موقعك بنجاح، يرجى تدوير الهاتف بحركة رقم 8 لضبط الدقة.");

    }, error => {
      // القيمة الافتراضية في حال رفض تحديد الموقع (مثلاً زاوية دمشق/مكة العامة)
      window.calculatedQiblaHeading = 160; 
      updateQiblaStatus("تعذر جلب الموقع تلقائياً، تم ضبط اتجاه افتراضي.", "warning");
    }, { timeout: 10000 });
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

// التشغيل التلقائي عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  initQiblaCompass();
});