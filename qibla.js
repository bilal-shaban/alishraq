// إحداثيات الكعبة المشرفة (مكة المكرمة)
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

let qiblaAngle = 0;

document.addEventListener('DOMContentLoaded', () => {
  initQiblaCompass();
});

function initQiblaCompass() {
  const statusEl = document.getElementById('qibla-status');
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // حساب زاوية القبلة بناءً على موقع المستخدم
        qiblaAngle = calculateQibla(userLat, userLng);
        statusEl.innerText = "تم تحديد الموقع. يرجى تحريك الهاتف بشكل رقم 8 لمعايرة البوصلة.";
        
        setupSensors();
      },
      (error) => {
        statusEl.innerText = "تعذر تحديد الموقع. يرجى السماح للخدمة بالوصول لموقعك.";
      },
      { enableHighAccuracy: true }
    );
  } else {
    statusEl.innerText = "متصفحك لا يدعم تحديد الموقع.";
  }
}

// معادلة حساب اتجاه القبلة بدقة
function calculateQibla(lat, lng) {
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

function setupSensors() {
  const statusEl = document.getElementById('qibla-status');
  const btnEnable = document.getElementById('btn-enable-compass');

r  // للآيفون والأجهزة الحديثة التي تتطلب إذناً خاصاً للمستشعرات
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    btnEnable.classList.remove('d-none');
    statusEl.innerText = "اضغط على زر تفعيل المستشعر أدناه";
  } else if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
  } else if ('ondeviceorientation' in window) {
    window.addEventListener('deviceorientation', handleOrientation, true);
  } else {
    statusEl.innerText = "مستشعر الحركة غير متوفر على هذا الجهاز.";
  }
}

function requestCompassPermission() {
  DeviceOrientationEvent.requestPermission().then((response) => {
    if (response === 'granted') {
      document.getElementById('btn-enable-compass').classList.add('d-none');
      window.addEventListener('deviceorientation', handleOrientation, true);
      document.getElementById('qibla-status').innerText = "تم التفعيل بنجاح، وجّه هاتفك أفقياً.";
    } else {
      alert('تم رفض إذن الوصول للمستشعر.');
    }
  }).catch(console.error);
}

function handleOrientation(event) {
  const pointer = document.getElementById('qibla-pointer');
  const statusEl = document.getElementById('qibla-status');
  
  let heading = null;

  // فحص نوع الجهاز لجلب زاوية الشمال بدقة
  if (event.webkitCompassHeading !== undefined) {
    // لأجهزة آبل (iOS)
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    // لأجهزة أندرويد (Android) - يتم عكس الزاوية أحياناً بحسب المتصفح
    heading = 360 - event.alpha;
  }

  if (heading !== null && !isNaN(heading)) {
    // الزاوية النهائية لحركة السهم
    let rotation = qiblaAngle - heading;
    pointer.style.transform = `rotate(${rotation}deg)`;
    statusEl.innerText = `اتجاه القبلة (زاوية القبلة: ${Math.round(qiblaAngle)}°)`;
  }
}