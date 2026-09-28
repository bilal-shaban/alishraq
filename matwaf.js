// بيانات الحالة والوضع (عمرة أو حج)
    let ritualMode = localStorage.getItem("mutawwif_mode") || "umrah"; // "umrah" أو "hajj"
    let currentStage = parseInt(localStorage.getItem("mutawwif_stage")) || 1;
    let currentLap = parseInt(localStorage.getItem("mutawwif_lap")) || 1;
    let currentFontSize = parseInt(localStorage.getItem("mutawwif_fontsize")) || 18;

    const umrahStages = [
      { id: 1, name: "الإحرام" },
      { id: 2, name: "الطواف" },
      { id: 3, name: "الركعتان" },
      { id: 4, name: "السعي" },
      { id: 5, name: "الختام" }
    ];

    const tawafSupplications = [
      "«أول رؤية للكعبة: اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام..»",
      "سبحان الله والحمد لله ولا إله إلا الله والله أكبر، ولا حول ولا قوة إلا بالله العلي العظيم، والصلاة والسلام على رسول الله صلى الله عليه وسلم، اللهم إيمانـاً بك، وتصديقاً بكتابك، ووفاء بعهدك، واتباعاً لسنة نبيك وحبيبك محمد صلى الله عليه وسلم، اللهم إني أسألك العفو والعافية والمعافاة الدائمة في الدين والدنيا والآخرة، والفوز بالجنة والنجاة من النار، اللهم إنا نسألك إيماناً لا يزول ويقيناً لا ينفذ ومرافقة نبيك في الجنة، اللهم اجعل حجاً مبروراً وذنباً مغفوراً وسعياً مشكوراً، اللهم اجعل حبك أحب الأشياء إليَّ واجعل خشيتك أخوف الأشياء عندي واقطع عني حاجات الدنيا بالشوق إلى لقائك، واذا أقررت أعين أهل الدنيا من دنياهم فأقرر عيني من عبادتك , اللهم اغفر لي ولوالدي ولمشايخي وإخواني ولمن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم إن هذا البيت بيتك، والحرم حرمك، والأمن أمنك، والعبد عبدك، وأنا عبدك وابن عبدك، وهذا مقام العائد بك من النار، اللهم فحرم لحومنا وبشرتنا على النار، اللهم إن بيتك عظيم، وجهك كريم، وأنت أرحم الراحمين فأعذني من النار ومن الشيطان الرجيم، وحرّم لحمي ودمني على النار، وآمني من أهواء يوم القيامة، واكفني مؤونة الدنيا والآخرة، اللهم حبّب إلينا الإيمان وزيّنه في قلوبنا وكره إلينا الكفر والفسوق والعصيان واجعلنا من الراشدين، اللهم ارزقنا حبك وحب من يححب وحب من ينفعنا حبّه عندك، اللهم ما رزقتني مما أحب فاجعلـه قوة لي فيما تححب، اللهم وما زويت عني مما أحب فاجعلـه فراغاً لي فيما تحب، اللهم اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين",

      "اللهم إني أعوذ بك من الشك والشرك والشقاق والنفاق وسوء الأخلاق وسوء المنظر والمنقلب في المال والأهل والولد، اللهم إني أسألك رضاك والجنة وأعوذ بك من سخطك والنار، اللهم إني أعوذ بك من فتنة القبر، وأعوذ بك من فتنة المحيا والممات، وأعوذ بك من الكفر والفقر، وأعوذ بك من الخزي في الدنيا والآخرة، اللهم إني أعوذ بك من غلبة الدين وغلبة العدو وشماتة الأعداء، اللهم قني عذابك يوم تبعث عبادك، اللهم اكفني شر الفتن وادفع عني البلايا والمحن ما ظهر منها وما بطن، اللهم إني أعوذ بك من علم لا ينفع ومن قلب لا يخخشع ومن نفس لا تشبع ومن عمل لا يرفع ومن دعاء لا يسمع . اللهم اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم اجعلـها عمرة مبروراً، وسعياً مشكوراً، وذنباً مغفوراً، وعملاً صالحاً مبروراً، وتجارة لن تبور، يا عالم مافي الصدور، أخرجني من الظلمات إلى النور، اللهم إني أسألك موجبات رحمتك، وعزائم مغفرتك، والسلامة من كل إثم والغنيمة من كل بر والفوز بالجنة، والنجاة من النار، لا تدع لي ذنباً إلا غفرته، ولا همّ إلا فرّجته ولا ديناً إلا قضيته ولا حاجة إلا قضيتها . رب قنعني بما رزقتني وبارك لي فيما أعطيتني، اللهم اغفر لي خطيئتي وجهلي وإسرافي في أمري وما أنت أعلم به مني، اللهم اغفر لي خطئي وعمدي وهزلي وجدي وكل ذلك عندي، اللهم اغفر لي ما قدّمت وما أخّرت وما أسررت وما أعلنتُ، أنت المقدم وأنت المؤخر وأنت على كل شيء قدير . اللهم اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم أظلني تحت ظلّ عرشك يوم لا ظل إلا ظلك ولا باقٍ إلا وجهك واسقني من حوض نبيك سيدنا محمد صلّى الله عليه وسلم شربة هنيئة مريئة لا أظمأ بعدها أبداً، اللهم إني أسألك من خير ما سألك نبيك محمد صلّى الله عليه وسلم، اللهم إني أسألك الجنة ونعيمها وما يقربني إليها من قولٍ أو فعلٍ أو عمل، اللهم اهدني بالهدى ووفقني للتقوى واغفر لي في الآخرة والأولى . اللهم افتح مسامع قلبي لذكرك وارزقني طاعتك وطاعة رسولك وعملاً بكتابك، اللهم توفنا مسلمين وألحقنا بالصالحين واغفر لنا ذنوبنا يوم الدين . ربِّ اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم إن لك حقوقاً كثيرة فيما بيني وبينك وحقوقاً كثيرة فيما بيني وبين خلقك؛ اللهم ما كان لك منها فاغفره لي وما كان لخلقك فتحمله عني، وأغنني بحلالك عن حرامك وبطاعتك عن معصيتك وبفضلك عمن سواك يا واسع المغفرة. اللهم إن بيتك عظيم ووجهك كريم، وأنت يا الله حليم كريم تححب العفو فاعف عني يا كريم، اللهم هذا حالنا لا يخفى عليك وهذا ذلنا ظاهر بين يدين فعاملنا بالإحسان إذ الفضل منك وإليك . اللهم عافني في قدرتك وأدخلني في رحمتك واقض أجلي في طاعتك واختم لي بخير عمل واجعل ثوابه الجنة . اللهم كما حسَّنتَ خَلقي فحسُّن خُلُقي. ربِّ اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين .",

      "اللهم إني أسألك إيماناً كاملاً ويقيناً صادقاً ورزقاً واسعاً وقلباً خاشعاً ولساناً ذاكراً وحلالاً طيباً وتوبةً نصوحاً وتويةً قبل الموت وراحة عند الموت ومغفرة ورحمة بعد الموت والعفو عند الحساب والفوز بالجنة والنجاة من النار برحمتك يا عزيز ويا غفار، رب زدني علماً ومعرفة واشرح صدري لذكرك ومحبتك وأسكن قلبي خشيتك وارزقني حبك وحُبّ من يححب وحب عمل صالح يقربني إلى حبك . رب توفني مسلماً وألحقني بالصالحين واغفر لي خطيئتي يوم الدين ولا تخزني يوم يبعثون ربِّ اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين"
    ];

    const saySupplications = [
      "«إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ...»",
      "«لا إله إلا الله وحده لا شريك له، له الملك وله الحمد...»",
      "«اللهم استعملني بسنة نبيك، وتوفني على ملته...»",
      "«رب اغفر وارحم وتجاوز عما تعلم، إنك أنت الأعز الأكرم»",
      "«اللهم إني أسألك موجبات رحمتك وعزائم مغفرتك...»",
      "«اللهم لا تدع لنا ذنباً إلا غفرته، ولا همّاً إلا فرجته...»",
      "«رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ العَلِيمُ»"
    ];

    function saveProgress() {
      localStorage.setItem("mutawwif_mode", ritualMode);
      localStorage.setItem("mutawwif_stage", currentStage);
      localStorage.setItem("mutawwif_lap", currentLap);
      localStorage.setItem("mutawwif_fontsize", currentFontSize);
    }

    function switchRitualMode(mode) {
      ritualMode = mode;
      currentStage = 1;
      currentLap = 1;
      document.getElementById("btn-mode-umrah").classList.toggle("active", mode === "umrah");
      document.getElementById("btn-mode-hajj").classList.toggle("active", mode === "hajj");
      saveProgress();
      renderMutawwifStage();
    }

    function adjustFontSize(delta) {
      currentFontSize = Math.min(Math.max(currentFontSize + delta * 2, 14), 26);
      saveProgress();
      renderMutawwifStage();
    }

    function renderMutawwifStage() {
      const container = document.getElementById("mutawwif-stage-content");
      const stepsContainer = document.getElementById("steps-container");
      const prevBtn = document.getElementById("btn-prev-stage");
      const counterText = document.getElementById("stage-counter-text");
     
      if (!container || !stepsContainer) return;

      // إذا كان المستخدم قد اختر وضع الحج، سنعرض واجهة التطوير
      if (ritualMode === "hajj") {
        stepsContainer.innerHTML = `
          <div class="step-indicator text-center ">
            
            
          </div>
        `;
        if (counterText) counterText.textContent = "";
        if (prevBtn) prevBtn.classList.add("d-none");

        container.innerHTML = `
          <div class="text-center py-">
            <div class="mb-3">
              <i class="bi bi-tools gold fs-1"></i>
            </div>
            <h4 class="gold fw-bold mb-3">مناسك الحج </h4>
            <p class="text-light opacity-85 px-3 mb-4" style="font-size: ${currentFontSize}px;">
           نعمل حالياً على تطوير هذا القسم بعناية ليقدم لك دليلاً متكاملاً لمناسك الحج.
            </p>
            <div class="p-3 rounded-3 bg-dark-subtle border border-gold-subtle text-center">
              <p class="text-warning fw-bold mb-0"><i class="bi bi-clock-history me-1"></i> ترقبونا قريباً في التحديث القادم!</p>
            </div>
          </div>
        `;
        return;
      }

      // عرض مراحل العمرة الاعتيادية (5 مراحل)
      let stages = umrahStages;
      let stepsHtml = "";
      stages.forEach((st, idx) => {
        let statusClass = st.id === currentStage ? "active" : st.id < currentStage ? "completed" : "";
        stepsHtml += `
          <div class="step-indicator text-center ${statusClass}">
            <span class="badge-num">${st.id}</span>
            <small class="d-block mt-1" style="font-size: 0.75rem;">${st.name}</small>
          </div>
        `;
        if (idx < stages.length - 1) {
          stepsHtml += `<div class="step-line"></div>`;
        }
      });
      stepsContainer.innerHTML = stepsHtml;

      if (counterText) counterText.textContent = `المرحلة ${currentStage} من 5`;
      if (prevBtn) prevBtn.classList.toggle("d-none", currentStage === 1);

      let html = "";

      if (currentStage === 1) {
        html = `
          <div class="text-center py-3">
            <h4 class="gold fw-bold mb-3"><i class="bi bi-person-heart me-1"></i> الإحرام والنية من الميقات</h4>
            <p class="text-light opacity-85 px-3 mb-3" style="font-size: ${currentFontSize}px;">تُنوي الإحرام بالعمرة قائلًا:</p>
            <div class="supplication-box p-3 rounded-3 mb-3 text-center">
              <p class="text-gold fw-bold mb-0" style="font-size: ${currentFontSize + 4}px;">«لَبِّيكَ اللَّهُمَّ عُمْرَةً»</p>
            </div>
            <button onclick="nextStage()" class="btn btn-gold-solid rounded-pill px-5 py-2 fw-bold shadow">أتممت الإحرام <i class="bi bi-chevron-left ms-1"></i></button>
          </div>
        `;
      } else if (currentStage === 2) {
        let percent = (currentLap / 7) * 100;
        html = `
          <div class="text-center">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-dark border border-gold text-gold">طواف العمرة</span>
              <span class="text-light font-monospace">الشوط ${currentLap} / 7</span>
            </div>
            <div class="display-4 fw-bold gold mb-1 font-monospace">${currentLap}</div>
            <div class="progress bg-secondary bg-opacity-25 mx-auto mb-3" style="height: 6px; width: 80%;">
              <div class="progress-bar bg-gold" style="width: ${percent}%;"></div>
            </div>
            <div class="supplication-box p-3 rounded-3 mb-3 text-center">
              <p class=" p-3 text-light lh-lg mb-0 " style="height: 350px; font-size: ${currentFontSize}px;">${tawafSupplications[currentLap]}</p>
            </div>
            <div class="mb-3">
              <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#extraAdiyaModal"><i class="bi bi-book me-1"></i> أدعية إضافية (الملتزم/الحجر)</button>
            </div>
            <div class="d-flex gap-2 justify-content-center">
              <button onclick="prevLap()" class="btn btn-outline-light px-3 py-2 rounded-pill flex-fill">الشوط السابق</button>
              <button onclick="nextStage()" class="btn btn-gold-solid px-4 py-2 rounded-pill flex-fill fw-bold">أتممت الشوط <i class="bi bi-chevron-left ms-1"></i></button>
            </div>
          </div>
        `;
      } else if (currentStage === 3) {
        html = `
          <div class="text-center py-3">
            <h4 class="gold fw-bold mb-3"><i class="bi bi-award me-1"></i> ركعتا سنة الطواف وزمزم</h4>
            <p class="text-light opacity-85 px-2 mb-3" style="font-size: ${currentFontSize}px;">صلِ ركعتين خلف مقام إبراهيم واشرب من زمزم.</p>
            <button onclick="nextStage()" class="btn btn-gold-solid rounded-pill px-5 py-2 fw-bold shadow">التالي إلى السعي <i class="bi bi-chevron-left ms-1"></i></button>
          </div>
        `;
      } else if (currentStage === 4) {
        let percent = (currentLap / 7) * 100;
        html = `
          <div class="text-center">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-dark border border-gold text-gold">سعي العمرة</span>
              <span class="text-light font-monospace small">الشوط ${currentLap}/7</span>
            </div>
            <div class="display-4 fw-bold gold mb-1 font-monospace">${currentLap}</div>
            <div class="progress bg-secondary bg-opacity-25 mx-auto mb-3" style="height: 6px; width: 80%;">
              <div class="progress-bar bg-gold" style="width: ${percent}%;"></div>
            </div>
            <div class="supplication-box p-3 rounded-3 mb-3 text-center">
              <p class="text-light lh-lg mb-0" style="font-size: ${currentFontSize}px;">${saySupplications[currentLap - 1]}</p>
            </div>
            <div class="d-flex gap-2 justify-content-center">
              <button onclick="prevLap()" class="btn btn-outline-light px-3 py-2 rounded-pill flex-fill">الشوط السابق</button>
              <button onclick="nextStage()" class="btn btn-gold-solid px-4 py-2 rounded-pill flex-fill fw-bold">أتممت الشوط <i class="bi bi-chevron-left ms-1"></i></button>
            </div>
          </div>
        `;
      } else if (currentStage === 5) {
        html = `
          <div class="text-center py-3">
            <h4 class="gold fw-bold mb-3"><i class="bi bi-scissors me-1"></i> ختام العمرة</h4>
            <p class="text-light opacity-85 px-2 mb-3" style="font-size: ${currentFontSize}px;">لقد أتممت طوافَك وسعيَك ولله الحمد! قم بالحلق أو التقصير.</p>
            <div class="p-3 rounded mb-3 bg-success bg-opacity-10 border border-success text-center">
              <p class="text-success fw-bold mb-0">تقبل الله عمرتك!</p>
            </div>
            <div class="d-grid gap-2 mb-3">
              <a href="https://api.whatsapp.com/send?text=الحمد%20لله%20الذي%20بنعمته%20تتم%20الصالحات،%20لقد%20أتممت%20عمرتي%20اليوم%20بفضل%20الله.%20تقبل%20الله%20منا%20ومنكم." target="_blank" class="btn btn-success rounded-pill fw-bold">
                <i class="bi bi-whatsapp me-1"></i> مشاركة إتمام العمرة عبر واتساب
              </a>
            </div>
            <button onclick="confirmReset()" class="btn btn-outline-light rounded-pill px-4 py-2 btn-sm">
              <i class="bi bi-arrow-counterclockwise me-1"></i> البدء من جديد
            </button>
          </div>
        `;
      }

      container.innerHTML = html;
    }

    function nextStage() {
      if (ritualMode === "hajj") return;
      if (currentStage === 2 || currentStage === 4) {
        if (currentLap < 7) {
          currentLap++;
          if (navigator.vibrate) navigator.vibrate(30);
          saveProgress();
          renderMutawwifStage();
          return;
        } else {
          currentLap = 1;
        }
      }
     
      if (currentStage < 5) {
        currentStage++;
        currentLap = 1;
        if (navigator.vibrate) navigator.vibrate(50);
        if (currentStage === 5) saveToHistory();
        saveProgress();
        renderMutawwifStage();
      }
    }

    function prevStage() {
      if (ritualMode === "hajj") return;
      if (currentStage === 2 && currentLap > 1) {
        currentLap--;
        saveProgress();
        renderMutawwifStage();
        return;
      }
      if (currentStage === 4 && currentLap > 1) {
        currentLap--;
        saveProgress();
        renderMutawwifStage();
        return;
      }
     
      if (currentStage > 1) {
        currentStage--;
        if (currentStage === 2 || currentStage === 4) {
          currentLap = 7;
        }
        saveProgress();
        renderMutawwifStage();
      }
    }

    function prevLap() {
      if (currentLap > 1) {
        currentLap--;
        if (navigator.vibrate) navigator.vibrate(20);
        saveProgress();
        renderMutawwifStage();
      }
    }

    function confirmReset() {
      if (confirm("هل أنت متأكد من رغبتك في إعادة ضبط التقدم والبدء من جديد؟")) {
        currentStage = 1;
        currentLap = 1;
        saveProgress();
        renderMutawwifStage();
      }
    }

    function saveToHistory() {
      let history = JSON.parse(localStorage.getItem("mutawwif_history")) || [];
      let now = new Date().toLocaleString("ar-SA");
      history.unshift({ type: "عمرة", date: now });
      localStorage.setItem("mutawwif_history", JSON.stringify(history));
      loadHistory();
    }

    function loadHistory() {
      const list = document.getElementById("history-list");
      if (!list) return;
      let history = JSON.parse(localStorage.getItem("mutawwif_history")) || [];
      if (history.length === 0) {
        list.innerHTML = `<li class="text-muted">لا توجد إنجازات مسجلة بعد.</li>`;
        return;
      }
      let html = "";
      history.forEach(item => {
        html += `<li class="py-1 border-bottom border-secondary d-flex justify-content-between"><span><i class="bi bi-check-circle-fill text-gold me-1"></i> إتمام ${item.type}</span><span class="font-monospace text-muted small">${item.date}</span></li>`;
      });
      list.innerHTML = html;
    }

    function clearHistory() {
      if (confirm("هل تريد مسح سجل الإنجازات بالكامل؟")) {
        localStorage.removeItem("mutawwif_history");
        loadHistory();
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      renderMutawwifStage();
      loadHistory();
    });