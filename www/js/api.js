// api.js

const API_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

const cities = [
    { name: "تحديد موقعي (GPS)", lat: "gps", lon: "gps" },
    { name: "الدار البيضاء", lat: 33.5731, lon: -7.5898 },
    { name: "الرباط", lat: 34.0209, lon: -6.8416 },
    { name: "مراكش", lat: 31.6295, lon: -7.9811 },
    { name: "فاس", lat: 34.0331, lon: -5.0003 },
    { name: "طنجة", lat: 35.7595, lon: -5.83395 },
    { name: "أكادير", lat: 30.4278, lon: -9.5981 },
    { name: "وجدة", lat: 34.6814, lon: -1.9086 }
];

// عناصر الواجهة الطقس
const citySelect = document.getElementById("citySelect");
const locationBtn = document.getElementById("locationBtn");
const loadingScreen = document.getElementById("loading-screen");
const loadingText = document.getElementById("loading-text");
const mainContent = document.getElementById("main-content");
const currentLocation = document.getElementById("current-location");
const currentTemp = document.getElementById("current-temp");
const currentWeather = document.getElementById("current-weather");
const currentWind = document.getElementById("current-wind");
const currentHumidity = document.getElementById("current-humidity");
const currentUv = document.getElementById("current-uv");
const currentAqi = document.getElementById("current-aqi");
const mainWeatherIcon = document.getElementById("main-weather-icon");
const currentTime = document.getElementById("current-time");

// تعبئة المدن
cities.forEach(city => {
    const option = document.createElement("option");
    option.value = `${city.lat},${city.lon}`;
    option.textContent = city.name;
    if (city.name === "الدار البيضاء") option.selected = true; // تعيين الافتراضي
    citySelect.appendChild(option);
});

// دوال جلب البيانات
async function fetchAllData(LAT, LON, cityName) {
    loadingScreen.style.display = "flex";
    mainContent.style.display = "none";
    try {
        // 1. الطقس الشامل
        const weatherUrl = `${API_URL}?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
        
        // 2. جودة الهواء
        const airUrl = `${AIR_API_URL}?latitude=${LAT}&longitude=${LON}&current=european_aqi&timezone=auto`;

        const [weatherRes, airRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(airUrl).catch(() => null) // لتفادي الانهيار إذا فشل جودة الهواء
        ]);

        const weatherData = await weatherRes.json();
        let airData = null;
        if (airRes && airRes.ok) airData = await airRes.json();

        window.lastWeatherData = weatherData;

        // تحديث الواجهة
        const displayCity = cityName || citySelect.options[citySelect.selectedIndex].text;
        updateCurrentWeather(weatherData, airData, displayCity);
        updateHourlyForecast(weatherData);
        updateDailyForecast(weatherData);

        mainContent.style.display = "block";
    } catch (error) {
        alert("تأكد من اتصالك بالإنترنت وحاول مجدداً.");
    } finally {
        loadingScreen.style.display = "none";
    }
}

function updateCurrentWeather(data, airData, cityName) {
    const current = data.current;
    const daily = data.daily;
    
    currentLocation.textContent = cityName;
    currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
    currentWeather.textContent = weatherCodeToText(current.weather_code);
    currentWind.textContent = `${Math.round(current.wind_speed_10m)}`;
    currentHumidity.textContent = `${Math.round(current.relative_humidity_2m)}`;
    
    // UV + AQI
    currentUv.textContent = (daily && daily.uv_index_max) ? Math.round(daily.uv_index_max[0]) : "--";
    currentAqi.textContent = (airData && airData.current && airData.current.european_aqi) ? airData.current.european_aqi : "--";
    
    // الوقت الحالي والشروق/الغروب
    currentTime.textContent = formatDateFull(new Date());
    document.getElementById("last-update").textContent = "آخر تحديث: " + formatTime(new Date().toISOString());

    if (daily && daily.sunrise && daily.sunset) {
        document.getElementById("sunrise").textContent = formatTime(daily.sunrise[0]);
        document.getElementById("sunset").textContent = formatTime(daily.sunset[0]);
    } else {
        document.getElementById("sunrise").textContent = "--:--";
        document.getElementById("sunset").textContent = "--:--";
    }

    // الأيقونة والخلفية
    const iconPath = typeof getWeatherIcon === "function" ? getWeatherIcon(current.weather_code, current.is_day) : 'assets/png/cloudy.png';
    mainWeatherIcon.src = iconPath;

    setDynamicBackground(current.weather_code, current.is_day);
}

function updateHourlyForecast(data) {
    const hourly = data.hourly;
    const container = document.getElementById("hourly-container");
    container.innerHTML = "";
    if (!hourly || !hourly.time) return;

    // العثور على المؤشر (index) الأقرب للوقت الحالي
    const now = new Date().getTime();
    let startIndex = 0;
    for (let i = 0; i < hourly.time.length; i++) {
        const timeObj = new Date(hourly.time[i]).getTime();
        if (timeObj >= now - (60 * 60 * 1000)) { // جلب من بداية الساعة الحالية
            startIndex = i;
            break;
        }
    }

    // عرض الـ 24 ساعة القادمة
    for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
        const div = document.createElement("div");
        div.className = "hourly-card";
        const iconPath = typeof getWeatherIcon === "function" ? getWeatherIcon(hourly.weather_code[i], hourly.is_day[i]) : 'assets/png/cloudy.png';
        const isNow = (i === startIndex) ? "الآن" : formatTime(hourly.time[i]);
        const pop = hourly.precipitation_probability[i] > 10 ? `💧 ${hourly.precipitation_probability[i]}%` : "";

        div.innerHTML = `
            <div class="h-time">${isNow}</div>
            <img class="h-icon" src="${iconPath}">
            <div class="h-temp">${Math.round(hourly.temperature_2m[i])}°</div>
            <div class="h-pop">${pop}</div>
        `;
        container.appendChild(div);
    }
}

function updateDailyForecast(data) {
    const daily = data.daily;
    const container = document.getElementById("forecast");
    container.innerHTML = "";
    if (!daily || !daily.time) return;

    // تجاوز اليوم الأول (لأنه معروض فوق)
    for (let i = 1; i < daily.time.length; i++) {
        const div = document.createElement("div");
        div.className = "daily-row";
        const iconPath = typeof getWeatherIcon === "function" ? getWeatherIcon(daily.weather_code[i], 1) : 'assets/png/cloudy.png';
        
        div.innerHTML = `
            <div class="d-day">${getDayName(daily.time[i])}</div>
            <img class="d-icon" src="${iconPath}">
            <div class="d-temps">
                <span class="d-max">${Math.round(daily.temperature_2m_max[i])}°</span>
                <span class="d-min">${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
        `;
        container.appendChild(div);
    }
}

// دالة جلب الموقع عبر GPS
function fetchUsingGPS() {
    if (navigator.geolocation) {
        loadingScreen.style.display = "flex";
        loadingText.textContent = "جاري تحديد موقعك الجغرافي...";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                citySelect.value = "gps,gps"; 
                loadingText.textContent = "جاري جلب البيانات...";
                fetchAllData(lat, lon, "موقعي الدقيق 📍");
            },
            (error) => {
                alert("لم نتمكن من الوصول لموقعك. سيتم استخدام دار البيضاء كافتراضي.");
                // Fallback to default
                citySelect.value = "33.5731,-7.5898";
                fetchAllData(33.5731, -7.5898, "الدار البيضاء");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("جهازك لا يدعم تحديد الموقع!");
    }
}

// زر الموقع الدقيق
locationBtn.addEventListener("click", fetchUsingGPS);

// عند تغيير المدينة من القائمة
citySelect.addEventListener("change", () => {
    const val = citySelect.value;
    if (val === "gps,gps") {
        fetchUsingGPS();
    } else {
        const coords = val.split(",");
        if (coords.length === 2) fetchAllData(coords[0], coords[1]);
    }
});

// عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
    // محاولة جلب الموقع مباشرة (الاعتماد على إذن المستخدم)
    // لتجربة أكثر أماناً، سنبدأ بالمدينة الافتراضية، ويمكن للمستخدم النقر على 📍
    const val = citySelect.value;
    if (val && val !== "gps,gps") {
        const coords = val.split(",");
        fetchAllData(coords[0], coords[1]);
    } else {
        fetchUsingGPS();
    }
});

// دوال مساعدة
function weatherCodeToText(code) {
    const map = {
        0: "صحو", 1: "غالبًا صافي", 2: "غائم جزئياً", 3: "غائم كلياً",
        45: "ضباب", 48: "ضباب متجمد", 51: "رذاذ", 61: "أمطار خفيفة",
        63: "أمطار متوسطة", 65: "أمطار غزيرة", 71: "ثلوج", 80: "زخات أمطار", 95: "عاصفة رعدية"
    };
    return map[code] || "غير معروف";
}

function setDynamicBackground(weatherCode, isDay) {
    const body = document.body;
    let gradient = "";
    
    // الكود 0 و 1 للصافي والغالب صافي
    if (weatherCode <= 1) {
        gradient = isDay
            ? "linear-gradient(135deg, #1fc2f1 0%, #2980b9 100%)" // سماء زرقاء مشرقة
            : "linear-gradient(135deg, #141e30 0%, #243b55 100%)"; // ليل مظلم
    } else if (weatherCode === 2 || weatherCode === 3 || weatherCode === 45) {
        gradient = isDay 
            ? "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)" // غيوم
            : "linear-gradient(135deg, #2c3e50 0%, #000000 100%)";
    } else if (weatherCode >= 61 && weatherCode <= 65 || weatherCode === 80) {
        gradient = "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)"; // مطر
    } else if (weatherCode === 71) {
        gradient = "linear-gradient(135deg, #8baaaa 0%, #ae8b9c 100%)"; // ثلج
    } else if (weatherCode === 95) {
        gradient = "linear-gradient(135deg, #283048 0%, #859398 100%)"; // عاصفة
    } else {
        gradient = "linear-gradient(135deg, #5A82B0 0%, #2980b9 100%)";
    }
    body.style.background = gradient;
}

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ar-MA", { hour: "2-digit", minute: "2-digit" });
}

function formatDateFull(date) {
    return date.toLocaleDateString("ar-MA", { weekday: "long", day: "numeric", month: "long" });
}

function getDayName(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("ar-MA", { weekday: "long" });
}
