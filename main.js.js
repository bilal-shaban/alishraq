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