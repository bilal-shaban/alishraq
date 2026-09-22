// إحداثيات الكعبة المشرفة (مكة المكرمة)
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

let userLat = 0;
let userLng = 0;
let qiblaAngle = 0;

document.addEventListener('DOMContentLoaded', () => {
  getUserLocationForQibla();
});

function getUserLocationForQibla() {
  const statusEl = document.getElementById('qibla-status');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
        qiblaAngle = calculateQibla(userLat, userLng);
        statusEl.innerText = "حرك هاتفك ببطء لضبط اتجاه القبلة";
        setupCompassSensors();
      },
      (error) => {
        statusEl.innerText = "تعذر تحديد الموقع الجغرافي. يجدر تفعيل GPS.";
      }
    );
  } else {
    statusEl.innerText = "متصفحك لا يدعم تحديد الموقع الجغرافي.";
  }
}

// معادلة حساب اتجاه القبلة بالنسبة للشمال الجغرافي
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

function setupCompassSensors() {
  const pointer = document.getElementById('qibla-pointer');
  const statusEl = document.getElementById('qibla-status');
  const btnEnable = document.getElementById('btn-enable-compass');

  // التحقق من صلاحيات الأجهزة الحديثة (مثل آيفون iOS 13+)
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    btnEnable.classList.remove('d-none');
    statusEl.innerText = "اضغط على الزر أدناه لتفعيل مستشعر الحركة";
  } else {
    startListeningCompass(pointer, statusEl);
  }
}

function requestCompassPermission() {
  DeviceOrientationEvent.requestPermission().then((response) => {
    if (response === 'granted') {
      document.getElementById('btn-enable-compass').classList.add('d-none');
      startListeningCompass(document.getElementById('qibla-pointer'), document.getElementById('qibla-status'));
    } else {
      alert('تم رفض إذن الوصول لمستشعر الحركة.');
    }
  }).catch(console.error);
}

function startListeningCompass(pointer, statusEl) {
  window.addEventListener('deviceorientation', (event) => {
    let heading = event.alpha; // اتجاه الشمال بالنسبة للجهاز

    // دعم أجهزة أندرويد عبر absolute / webkitCompassHeading
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading;
    }

    if (heading !== null && !isNaN(heading)) {
      // حساب الزاوية المطلوبة لتوجيه سهم الكعبة نحو القبلة بدقة
      let finalRotation = qiblaAngle - heading;
      pointer.style.transform = `rotate(${finalRotation}deg)`;
      statusEl.innerText = `اتجاه القبلة محسوب بدقة (زاوية: ${Math.round(qiblaAngle)}°)`;
    } else {
      statusEl.innerText = "جهازك لا يدعم بوصلة المستشعر المباشر.";
    }
  }, true);
}