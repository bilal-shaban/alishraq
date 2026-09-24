 // التحقق من حالة التفعيل عند فتح الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        const toggleSwitch = document.getElementById('prayerNotificationsToggle');
        if (toggleSwitch) {
            toggleSwitch.checked = localStorage.getItem('prayer_notifications_enabled') === 'true';
        }
    });

    // دالة تفعيل أو إلغاء تفعيل تنبيهات الصلاة
    function togglePrayerNotifications(checkbox) {
        if (checkbox.checked) {
            if (!("Notification" in window)) {
                alert("متصفحك لا يدعم إشعارات سطح المكتب.");
                checkbox.checked = false;
                return;
            }

            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    localStorage.setItem('prayer_notifications_enabled', 'true');
                    // إرسال إشعار تجريبي فوري لتأكيد التفعيل
                    new Notification("تطبيق إشراق", {
                        body: "تم تفعيل تنبيهات أوقات الصلاة بنجاح 🌙",
                        icon: "./5b862b4281f64fd884b11984846f0e97.png"
                    });
                } else {
                    alert("يجب السماح بالإشعارات من إعدادات المتصفح لعمل الميزة.");
                    checkbox.checked = false;
                    localStorage.setItem('prayer_notifications_enabled', 'false');
                }
            });
        } else {
            localStorage.setItem('prayer_notifications_enabled', 'false');
        }
    }
  

   // تطبيق وضع القراءة الليلية المحفوظ عند تحميل أي صفحة
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

// دالة التفعيل والإيقاف
function toggleNightReadingMode(checkbox) {
    if (checkbox.checked) {
        document.documentElement.setAttribute('data-night-mode', 'true');
        localStorage.setItem('night_reading_mode', 'true');
    } else {
        document.documentElement.removeAttribute('data-night-mode');
        localStorage.setItem('night_reading_mode', 'false');
    }
}
// دالة مسح الذاكرة المؤقتة وتفريغ بيانات الـ PWA والـ LocalStorage
function clearAppStorage() {
    if (confirm("هل أنت متأكد من مسح جميع بيانات التطبيق والإعدادات المحفوظة؟ سيتم إعادة تشغيل التطبيق.")) {
        // 1. مسح الـ LocalStorage بالكامل
        localStorage.clear();

        // 2. محاولة حذف جميع الـ Cache Storages الخاصة بالـ PWA لضمان تحديث الملفات
        if ('caches' in window) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }

        // 3. إلغاء تسجيل الـ Service Worker إن وجد لتجنب بقاء أي كاش قديم
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                }
            });
        }

        // تنبيه خفيف وإعادة تحميل الصفحة
        alert("تم مسح التخزين المؤقت بنجاح. سيتم الآن إعادة تحميل التطبيق.");
        window.location.reload();
    }
}
function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: 'تطبيق إشراق الإسلامي',
            text: 'تطبيق إشراق رفيقك اليومي للقرآن، الأذكار، وأوقات الصلاة بدون إعلانات.',
            url: window.location.href
        }).catch(console.error);
    } else {
        // طريقة احتياطية لو المتصفح ما بيعمح المشاركة المباشرة
        navigator.clipboard.writeText(window.location.href);
        alert("تم نسخ رابط التطبيق إلى الحافظة!");
    }
}
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installCard = document.getElementById('installCard');
    if (installCard) installCard.style.display = 'block';
});

document.getElementById('installAppBtn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        document.getElementById('installCard').style.display = 'none';
    }
});