const sheetId = '1nHyRDkioIuAXdcHg8RdFSqwDWtvT71IFVftn5-uZUHI';
const opensheetUrl = `https://opensheet.elk.sh/${sheetId}/Sheet1`;

fetch(opensheetUrl)
  .then(response => {
    if (!response.ok) throw new Error('فشل جلب البيانات من الجدول');
    return response.json();
  })
  .then(data => {
    if (data && data.length > 0) {
      const todayData = data[0];

      if (todayData['quran-text'] && document.getElementById('quran-text')) {
        document.getElementById('quran-text').innerText = `"${todayData['quran-text']}"`;
      }
      if (todayData['quran-ref'] && document.getElementById('quran-ref')) {
        document.getElementById('quran-ref').innerText = todayData['quran-ref'];
      }
      if (todayData['quran-desc'] && document.getElementById('quran-desc')) {
        document.getElementById('quran-desc').innerText = todayData['quran-desc'];
      }

      if (todayData['hadith-text'] && document.getElementById('hadith-text')) {
        document.getElementById('hadith-text').innerText = `"${todayData['hadith-text']}"`;
      }
      if (todayData['hadith-ref'] && document.getElementById('hadith-ref')) {
        document.getElementById('hadith-ref').innerText = todayData['hadith-ref'];
      }
      if (todayData['hadith-desc'] && document.getElementById('hadith-desc')) {
        document.getElementById('hadith-desc').innerText = todayData['hadith-desc'];
      }
    }
  })
  .catch(error => {
    console.error('حدث خطأ أثناء تحميل البيانات:', error);
  });

function copyContent(type) {
  let text = '', ref = '', desc = '', title = '';

  if (type === 'quran') {
    title = 'إشراقة قرآنية';
    text = document.getElementById('quran-text')?.innerText || '';
    ref = document.getElementById('quran-ref')?.innerText || '';
    desc = document.getElementById('quran-desc')?.innerText || '';
  } else {
    title = 'إشراقة نبوية';
    text = document.getElementById('hadith-text')?.innerText || '';
    ref = document.getElementById('hadith-ref')?.innerText || '';
    desc = document.getElementById('hadith-desc')?.innerText || '';
  }

  const formattedMessage = `✨ إشراق - ${title}\n\n${text}\n📌 ${ref}\n\n💭 ${desc}\n\n🌐 موقع إشراق`;

  navigator.clipboard.writeText(formattedMessage).then(() => {
    alert(`تم نسخ (${title}) بنجاح!`);
  }).catch(err => console.error('فشل النسخ: ', err));
}

function shareWhatsapp(type) {
  let text = '', ref = '', desc = '', title = '';

  if (type === 'quran') {
    title = 'إشراقة قرآنية';
    text = document.getElementById('quran-text')?.innerText || '';
    ref = document.getElementById('quran-ref')?.innerText || '';
    desc = document.getElementById('quran-desc')?.innerText || '';
  } else {
    title = 'إشراقة نبوية';
    text = document.getElementById('hadith-text')?.innerText || '';
    ref = document.getElementById('hadith-ref')?.innerText || '';
    desc = document.getElementById('hadith-desc')?.innerText || '';
  }

  const formattedMessage = `✨ *إشراق - ${title}*\n\n${text}\n📌 _${ref}_\n\n💭 ${desc}\n\n🔗 ${window.location.href}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;
  window.open(whatsappUrl, '_blank');
}

let deferredPrompt;
const androidBtn = document.getElementById('btn-install-android');
const windowsBtn = document.getElementById('btn-install-windows');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('تم قبول تثبيت التطبيق');
      }
      deferredPrompt = null;
    });
  } else {
    alert('التطبيق مثبت بالفعل أو يمكنك التثبيت مباشرة من خيارات المتصفح (إضافة إلى الشاشة الرئيسية).');
  }
}

if (androidBtn) androidBtn.addEventListener('click', triggerPwaInstall);
if (windowsBtn) windowsBtn.addEventListener('click', triggerPwaInstall);

function showIosInstructions() {
  alert('لتثبيت إشراق على الآيفون:\n1. اضغط على زر المشاركة (أسفل الشاشة في متصفح Safari).\n2. اختر "إضافة إلى الشاشة الرئيسية (Add to Home Screen)".');
}
// تطبيق وضع القراءة الليلية المحفوظ فوراً عند تحميل أي صفحة في الموقع
document.addEventListener('DOMContentLoaded', () => {
    const isNightMode = localStorage.getItem('night_reading_mode') === 'true';
    const toggleSwitch = document.getElementById('nightModeToggle');
    
    if (isNightMode) {
        document.documentElement.setAttribute('data-night-mode', 'true');
        if (toggleSwitch) toggleSwitch.checked = true;
    } else {
        document.documentElement.removeAttribute('data-night-mode');
        if (toggleSwitch) toggleSwitch.checked = false;
    }
});

// دالة التفعيل وإيقاف الوضع الليلي (تُستدعى عند الضغط على الزر في الإعدادات)
function toggleNightReadingMode(checkbox) {
    if (checkbox.checked) {
        document.documentElement.setAttribute('data-night-mode', 'true');
        localStorage.setItem('night_reading_mode', 'true');
    } else {
        document.documentElement.removeAttribute('data-night-mode');
        localStorage.setItem('night_reading_mode', 'false');
    }
}