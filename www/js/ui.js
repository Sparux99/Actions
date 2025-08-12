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

    let iconName = iconMap[weatherCode] || "cloudy";
    let timeFolder = isDay ? "day" : "night";
    // إذا كان الأيقونة عامة وليست خاصة بالنهار أو الليل
    if (["rain", "snow", "thunderstorm", "fog", "cloudy", "pcloudy"].includes(iconName)) {
        return `assets/png/${iconName}.png`;
    } else {
        return `assets/png/${timeFolder}/${iconName}.png`;
    }
}

// دالة لطلب بيانات الطقس
let startY = 0;
document.addEventListener("touchstart", function(e) {
    if (window.scrollY === 0) startY = e.touches[0].clientY;
});
document.addEventListener("touchmove", function(e) {
    if (window.scrollY === 0 && e.touches[0].clientY - startY > 60) {
        // نفذ التحديث
        const coords = citySelect.value.split(",");
        if (coords.length === 2) fetchWeatherData(coords[0], coords[1]);
    }
});

document.getElementById("menuBtn").onclick = function() {
    document.getElementById("sidebar").classList.add("active");
};
document.getElementById("closeSidebar").onclick = function() {
    document.getElementById("sidebar").classList.remove("active");
};

// مثال: عرض بيانات API (تحتاج تعديل حسب مكان تخزين البيانات)
document.getElementById("showJsonBtn").onclick = function() {
    if (window.lastWeatherData) {
        alert(JSON.stringify(window.lastWeatherData, null, 2));
    } else {
        alert("لا توجد بيانات بعد.");
    }
};

// مثال: تغيير اللون (تبديل بين لونين)
document.getElementById("themeBtn").onclick = function() {
    document.body.classList.toggle("dark-theme");
};

// مثال: عن المطور
document.getElementById("aboutBtn").onclick = function() {
    alert("تم تطوير التطبيق بواسطة ...");
};

// مثال: شروط الاستخدام
document.getElementById("termsBtn").onclick = function() {
    alert("شروط الاستخدام: ...");
};