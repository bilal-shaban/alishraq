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