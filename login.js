document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const errorBox = document.getElementById("auth-error-box");

  // إذا كان المستخدم مسجّل دخوله فعلاً، لا داعي لإبقائه بصفحة الدخول
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      window.location.replace("index.html");
    }
  });

  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
  }

  function hideError() {
    errorBox.style.display = "none";
  }

  // ترجمة أكواد أخطاء Firebase الشائعة لرسائل عربية مفهومة
  function translateAuthError(error) {
    const map = {
      "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة.",
      "auth/user-not-found": "لا يوجد حساب مسجّل بهذا البريد الإلكتروني.",
      "auth/wrong-password": "كلمة المرور غير صحيحة.",
      "auth/invalid-credential": "بيانات الدخول غير صحيحة، تحقق من البريد وكلمة المرور.",
      "auth/email-already-in-use": "هذا البريد الإلكتروني مسجّل بحساب موجود بالفعل.",
      "auth/weak-password": "كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل.",
      "auth/network-request-failed": "تعذر الاتصال بالإنترنت، تحقق من اتصالك."
    };
    return map[error.code] || "حدث خطأ غير متوقع: " + error.message;
  }

  function setLoading(form, isLoading) {
    const btn = form.querySelector("button[type=submit]");
    const btnText = btn.querySelector(".btn-text");
    const spinner = btn.querySelector(".auth-spinner");
    btn.disabled = isLoading;
    spinner.style.display = isLoading ? "inline-block" : "none";
    btnText.style.opacity = isLoading ? "0.6" : "1";
  }

  // ===== تسجيل الدخول =====
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    setLoading(loginForm, true);
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        setLoading(loginForm, false);
        showError(translateAuthError(error));
      });
  });

  // ===== إنشاء حساب جديد =====
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const passwordConfirm = document.getElementById("signup-password-confirm").value;

    if (password !== passwordConfirm) {
      showError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(signupForm, true);
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        setLoading(signupForm, false);
        showError(translateAuthError(error));
      });
  });
});

// ===== التبديل بين تبويب الدخول وإنشاء الحساب =====
function switchAuthTab(tab) {
  const loginTabBtn = document.getElementById("tab-login-btn");
  const signupTabBtn = document.getElementById("tab-signup-btn");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const errorBox = document.getElementById("auth-error-box");

  errorBox.style.display = "none";

  if (tab === "login") {
    loginTabBtn.classList.add("active");
    signupTabBtn.classList.remove("active");
    loginForm.classList.remove("d-none");
    signupForm.classList.add("d-none");
  } else {
    signupTabBtn.classList.add("active");
    loginTabBtn.classList.remove("active");
    signupForm.classList.remove("d-none");
    loginForm.classList.add("d-none");
  }
}
