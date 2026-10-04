// إعدادات Firebase المشتركة لتطبيق إشراق
// يُستخدم هذا الملف من login.html و index.html (وأي صفحة تحتاج معرفة حالة تسجيل الدخول لاحقاً)
const firebaseConfig = {
  apiKey: "AIzaSyD3RQ2jrXcJOUqmhUrGuBQ6R8kZ2sSLOr0",
  authDomain: "alishraq-fe305.firebaseapp.com",
  projectId: "alishraq-fe305",
  storageBucket: "alishraq-fe305.firebasestorage.app",
  messagingSenderId: "816905605188",
  appId: "1:816905605188:web:639252ce9ef899bd622c11",
  measurementId: "G-X6NV8MT549"
};

// نستخدم نسخة "compat" من Firebase (عبر وسم script عادي) بدل import الحديثة،
// لأن الموقع صفحات HTML ثابتة بدون أداة تجميع (bundler) مثل Webpack/Vite
firebase.initializeApp(firebaseConfig);

// دالة تسجيل الخروج المشتركة (تُستخدم من أي صفحة فيها زر تسجيل الخروج)
function logoutUser() {
  if (!confirm("هل تريد تسجيل الخروج؟")) return;
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert("حدث خطأ أثناء تسجيل الخروج: " + error.message);
  });
}
