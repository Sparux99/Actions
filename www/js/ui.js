function getWeatherIcon(weatherCode, isDay) {
    // خرائط أكواد الطقس إلى أسماء الأيقونات
    const iconMap = {
        0: 'clear_sky',
        1: 'mostly_clear',
        2: 'partly_cloudy',
        3: 'overcast',
        45: 'fog',
        48: 'freezing_fog',
        51: 'light_drizzle',
        61: 'light_rain',
        63: 'moderate_rain',
        65: 'heavy_rain',
        71: 'light_snow',
        80: 'light_showers',
        95: 'thunderstorm'
    };

    let iconName = iconMap[weatherCode] || "partly_cloudy";
    let timeFolder = isDay ? "day" : "night";

    // الأيقونات التي ليس لها نسخة للنهار وأخرى لليل
    const genericIcons = ["light_rain", "moderate_rain", "heavy_rain", "light_snow", "thunderstorm", "fog", "freezing_fog", "light_drizzle", "light_showers"];

    if (genericIcons.includes(iconName)) {
        return `assets/png/${iconName}.png`;
    } else {
        return `assets/png/${timeFolder}/${iconName}.png`;
    }
}

// دالة لطلب بيانات الطقس
let startY = 0;
document.addEventListener("touchstart", function (e) {
    if (window.scrollY === 0) startY = e.touches[0].clientY;
});
document.addEventListener("touchmove", function (e) {
    if (window.scrollY === 0 && e.touches[0].clientY - startY > 60) {
        // نفذ التحديث
        const coords = citySelect.value.split(",");
        if (coords.length === 2) fetchWeatherData(coords[0], coords[1]);
    }
});

document.getElementById("menuBtn").onclick = function () {
    document.getElementById("sidebar").classList.add("active");
};
document.getElementById("closeSidebar").onclick = function () {
    document.getElementById("sidebar").classList.remove("active");
};

// مثال: عرض بيانات API (تحتاج تعديل حسب مكان تخزين البيانات)
document.getElementById("showJsonBtn").onclick = function () {
    if (window.lastWeatherData) {
        showModal("بيانات API (JSON)", `<pre dir="ltr" style="text-align:left; font-size:12px;">${JSON.stringify(window.lastWeatherData, null, 2)}</pre>`);
    } else {
        showModal("تنبيه", "لا توجد بيانات متاحة بعد.");
    }
};

// مثال: تغيير اللون (تبديل بين لونين)
document.getElementById("themeBtn").onclick = function () {
    document.body.classList.toggle("dark-theme");
};

// التعامل مع النوافذ المنبثقة (Modals)
function showModal(title, htmlContent) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = htmlContent;
    document.getElementById("infoModal").style.display = "flex";
}

document.getElementById("closeModalBtn").onclick = function () {
    document.getElementById("infoModal").style.display = "none";
};

// قسم عن المطور
document.getElementById("aboutBtn").onclick = function () {
    showModal(
        "📝 عن المطور",
        `<b>تطبيق الطقس المطور 2026</b><br><br>
         <b>المطور:</b> sparux<br>
         <b>البريد الإلكتروني:</b> sparux@example.com <br><br>
         تم تطوير هذا التطبيق بحب ليقدم أدق تفاصيل الطقس للمملكة المغربية بواجهة عصرية وسلسة.`
    );
};

// قسم شروط الاستخدام
document.getElementById("termsBtn").onclick = function () {
    showModal(
        "⚖️ شروط الاستخدام وإخلاء المسؤولية",
        `١. <b>استخدام البيانات:</b> التطبيق يوفر بيانات طقس تقريبية تعتمد على مزودات بيانات خارجية (Open-Meteo). لا توجد ضمانات مطلقة بدقة البيانات.<br><br>
         ٢. <b>إخلاء المسؤولية التامة:</b> المطور 'sparux' يخلي مسؤوليته الكاملة عن أية أضرار، قرارات، إخفاقات، أو خسائر (مباشرة أو غير مباشرة) تنتج عن الاعتماد على توجيهات أو بيانات هذا التطبيق (مثل تأجيل الفعاليات أو السفر).<br><br>
         ٣. <b>حقوق الملكية والنشر:</b> تصميم التطبيق والكود المصدري محمي. لا يجوز استنساخ الواجهة دون إذن صريح.<br><br>
         <i>باستخدامك للتطبيق، أنت توافق بشكل كامل على هذه الشروط وتتحمل المسؤولية بمفردك.</i>`
    );
};

// نظام إشعارات الطقس الطارئ (التنبيهات)
function showAppNotification(title, message) {
    // 1. محاولة الإشعار عبر إضافة كوردوفا (إن وجدت)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.notification && window.cordova.plugins.notification.local) {
        window.cordova.plugins.notification.local.schedule({
            title: title,
            text: message,
            foreground: true
        });
    } else {
        // 2. البديل: إظهار إشعار Toast جميل داخل الواجهة نفسها
        const toast = document.getElementById("toastNotification");
        if (toast) {
            document.getElementById("toastMsg").innerHTML = `<strong>${title}</strong><br>${message}`;
            toast.classList.add("show");
            // إخفاء الإشعار بعد 7 ثواني
            setTimeout(() => {
                toast.classList.remove("show");
            }, 7000);
        }
    }
}