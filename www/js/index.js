document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

    // عرض شروط الاستخدام
    function showTermsOfUse(termsText) {
        navigator.notification.confirm(
            termsText,
            function (buttonIndex) {
                if (buttonIndex === 1) { // موافق
                    localStorage.setItem('TermsAccepted', 'yes');
                    startApp(true); // بدء التطبيق مع إشعار ترحيب
                } else {
                    navigator.app.exitApp();
                }
            },
            "شروط الإستخدام",
            ["موافق", "إلغاء"]
        );
    }

    // بدء التطبيق
    function startApp(showWelcomeNotification = false) {
        if (navigator.splashscreen) {
            navigator.splashscreen.hide();
        }

        if (showWelcomeNotification) {
            cordova.plugins.notification.local.schedule({
                id: 100,
                title: "أهلا بك",
                text: "شكراً لقبولك شروط الاستخدام ✅",
                foreground: true
            });
        }

        // جدولة إشعار يومي الساعة 10 صباحاً
        scheduleDailyNotification();
    }

    const terms = `
** حقوق الطبع و النشر برمجيات Amine 2025© **

**الإصدار 1.0**

**ترخيص مجاني غير تجاري**:
   يتم تقديم هذا البرنامج (التطبيق) لك بموجب هذا الترخيص المجاني وغير التجاري وفقًا للشروط التالية:

1. **الاستخدام غير التجاري**:
   - هذا التطبيق مُقدم للاستخدام الشخصي وغير التجاري فقط. لا يُسمح باستخدامه لأغراض تجارية أو ربحية.

2. **عدم جمع البيانات**:
   - لا يقوم هذا التطبيق بجمع أي بيانات شخصية أو عامة من المستخدمين. يتم احترام خصوصية المستخدمين بالكامل.

3. **حقوق الاستخدام والتطوير**:
   - يُسمح لكل مطور باستخدام هذا الإصدار 2.2.0 كأساس لتطوير نسخ أكثر تطورًا وتحسينات. يجب أن يتم توضيح التعديلات والإصدارات الجديدة بإذن من المطور الأصلي. يُطلب من المطورين تقديم الشكر والاعتراف بالإصدار الأصلي عند نشر النسخ المحسنة.

4. **التوزيع**:
   - يُسمح بنسخ وتوزيع هذا التطبيق في شكله الأصلي أو بعد التعديلات وفقًا للشروط المذكورة أعلاه. يجب أن يتضمن أي توزيع إشعار حقوق الطبع والنشر وإشعار الترخيص.

5. **إخلاء المسؤولية**:
   - يتم تقديم هذا التطبيق "كما هو" دون أي ضمانات صريحة أو ضمنية. لا يتحمل المطور الأصلي أي مسؤولية عن أي أضرار ناتجة عن استخدام التطبيق.

**للاستفسارات، يرجى الاتصال بـ: sparux19@gmail.com **
`;

    // التحقق من الموافقة على الشروط
    function checkTermsAcceptance() {
        const termsAccepted = localStorage.getItem('TermsAccepted');
        if (termsAccepted === 'yes') {
            startApp(false); // المستخدم وافق سابقاً
        } else {
            showTermsOfUse(terms);
        }
    }

    // إشعار يومي
    function scheduleDailyNotification() {
        cordova.plugins.notification.local.schedule({
            id: 200,
            title: "Weather 2025",
            text: "اطلع على طقس اليوم! ✅",
            trigger: { every: { hour: 10, minute: 0 } },
            foreground: true,
            sound: null
        });
    }

    // عند الضغط على الإشعار
    cordova.plugins.notification.local.on('click', function (notification) {
        alert('تم النقر على الإشعار: ' + notification.title);
    });

    checkTermsAcceptance();
}
