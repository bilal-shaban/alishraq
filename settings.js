// 1. تفعيل / إلغاء تنبيهات أوقات الصلاة (مرتبط بـ onchange في الهاوس)
async function togglePrayerNotifications(checkbox) {
    if (checkbox.checked) {
        if (!("Notification" in window)) {
            alert("متصفحك لا يدعم إشعارات سطح المكتب.");
            checkbox.checked = false;
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                localStorage.setItem('prayer_notifications_enabled', 'true');
                new Notification("تطبيق إشراق", {
                    body: "تم تفعيل تنبيهات أوقات الصلاة بنجاح 🌙",
                    icon: "./5b862b4281f64fd884b11984846f0e97.png"
                });
            } else {
                alert("يجب السماح بالإشعارات من إعدادات المتصفح.");
                checkbox.checked = false;
                localStorage.setItem('prayer_notifications_enabled', 'false');
            }
        } catch (error) {
            console.error("خطأ في إذن الإشعارات:", error);
            checkbox.checked = false;
            localStorage.setItem('prayer_notifications_enabled', 'false');
        }
    } else {
        localStorage.setItem('prayer_notifications_enabled', 'false');
    }
}

// 2. تفعيل / إلغاء وضع القراءة الليلية (مرتبط بـ onchange في الهاوس)
function toggleNightReadingMode(checkbox) {
    if (checkbox.checked) {
        document.documentElement.setAttribute('data-night-mode', 'true');
        localStorage.setItem('night_reading_mode', 'true');
    } else {
        document.documentElement.removeAttribute('data-night-mode');
        localStorage.setItem('night_reading_mode', 'false');
    }
}

// 3. زر مشاركة التطبيق / صدقة جارية (مرتبط بـ onclick="shareApp()")
async function shareApp() {
    const shareData = {
        title: 'تطبيق إشراق الإسلامي',
        text: 'تطبيق إشراق رفيقك اليومي للقرآن، الأذكار، وأوقات الصلاة.',
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            throw new Error("المشاركة غير متوفرة");
        }
    } catch (err) {
        // الطريقة البديلة المضمونة لنسخ الرابط
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("تم نسخ رابط التطبيق إلى الحافظة بنجاح! 🌙");
                return;
            } catch (clipErr) {
                console.error("فشل النسخ", clipErr);
            }
        }
        prompt("انسخ الرابط يدوياً:", window.location.href);
    }
}

// 4. مسح بيانات التطبيق والتخزين (مرتبط بـ onclick="clearAppStorage()")
function clearAppStorage() {
    if (confirm("هل أنت متأكد من مسح جميع بيانات التطبيق والإعدادات؟")) {
        localStorage.clear();
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        alert("تم مسح البيانات بنجاح، سيتم إعادة تحميل الصفحة.");
        window.location.reload();
    }
}

// 5. تهيئة الحالة عند فتح الصفحة (ضبط صحة الـ Checkboxes)
document.addEventListener('DOMContentLoaded', () => {
    // ضبط حالة زر الإشعارات بناءً على الصلاحية الفعلية
    const notifToggle = document.getElementById('prayerNotificationsToggle');
    if (notifToggle) {
        if ("Notification" in window && Notification.permission === "granted") {
            notifToggle.checked = true;
            localStorage.setItem('prayer_notifications_enabled', 'true');
        } else {
            notifToggle.checked = false;
            localStorage.setItem('prayer_notifications_enabled', 'false');
        }
    }

    // ضبط حالة زر الوضع الليلي بناءً على المحفوظ
    const nightToggle = document.getElementById('nightModeToggle');
    if (nightToggle) {
        const isNightMode = localStorage.getItem('night_reading_mode') === 'true';
        nightToggle.checked = isNightMode;
        if (isNightMode) {
            document.documentElement.setAttribute('data-night-mode', 'true');
        }
    }
});

// 6. تثبيت التطبيق (PWA Install Prompt)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installCard = document.getElementById('installCard');
    if (installCard) {
        installCard.style.display = 'block'; // إظهار بطاقة التثبيت عند توفر الحدث
    }
});

// ربط زر التثبيت الموجود في الـ HTML برمجياً
document.addEventListener('DOMContentLoaded', () => {
    const installAppBtn = document.getElementById('installAppBtn');
    const installCard = document.getElementById('installCard');

    // للاختبار والتأكد ألا تختفي البطاقة نهائياً إذا لم يطلق المتصفح الحدث تلقائياً
    if (installCard) {
        installCard.style.display = 'block';
    }

    if (installAppBtn) {
        installAppBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`نتيجة التثبيت: ${outcome}`);
                deferredPrompt = null;
                if (installCard) installCard.style.display = 'none';
            } else {
                alert("لتثبيت التطبيق على هاتفك:\n- أندرويد (متصفح كروم): اضغط على نقاط القائمة الثلاث في المتصفح ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'.\n- آيفون (متصفح سفاري): اضغط زر المشاركة ثم اختر 'إضافة إلى الشاشة الرئيسية'.");
            }
        });
    }
});