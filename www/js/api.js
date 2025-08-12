// api.js
const API_URL = "https://api.open-meteo.com/v1/forecast";
const cities = [
    { name: "الدار البيضاء", lat: 33.5731, lon: -7.5898 },
    { name: "الرباط", lat: 34.0209, lon: -6.8416 },
    { name: "مراكش", lat: 31.6295, lon: -7.9811 },
    { name: "فاس", lat: 34.0331, lon: -5.0003 },
    { name: "طنجة", lat: 35.7595, lon: -5.83395 },
    { name: "أكادير", lat: 30.4278, lon: -9.5981 },
    { name: "وجدة", lat: 34.6814, lon: -1.9086 },
    { name: "العيون", lat: 27.1536, lon: -13.2033 },
    { name: "الصويرة", lat: 31.5085, lon: -9.7595 },
    { name: "تطوان", lat: 35.5785, lon: -5.3684 },
    { name: "الناظور", lat: 35.1714, lon: -2.933 },
    { name: "خريبكة", lat: 32.8806, lon: -6.9063 },
    { name: "سطات", lat: 32.5705, lon: -7.6092 },
    { name: "آسفي", lat: 32.2994, lon: -9.2372 },
    { name: "العرائش", lat: 35.1932, lon: -6.1557 },
    { name: "الجديدة", lat: 33.254, lon: -8.506 },
    { name: "القنيطرة", lat: 34.261, lon: -6.5802 },
    { name: "بركان", lat: 34.92, lon: -2.32 },
    { name: "تازة", lat: 34.21, lon: -4.01 },
    { name: "مكناس", lat: 33.895, lon: -5.5547 },
    { name: "آسني", lat: 31.2728, lon: -7.872 },
    { name: "تزنيت", lat: 29.696, lon: -9.732 },
    { name: "زاكورة", lat: 30.333, lon: -5.833 },
    { name: "السمارة", lat: 26.7384, lon: -11.6719 },
    { name: "بوجدور", lat: 26.1333, lon: -14.5 }
];

// عناصر الواجهة
const citySelect = document.getElementById("citySelect");
const loadingScreen = document.getElementById("loading-screen");
const mainContent = document.getElementById("main-content");
const currentLocation = document.getElementById("current-location");
const currentTemp = document.getElementById("current-temp");
const currentWeather = document.getElementById("current-weather");
const currentWind = document.getElementById("current-wind");
const currentHumidity = document.getElementById("current-humidity");
const currentPressure = document.getElementById("current-pressure");
const weatherIcon = document.querySelector(".weather-icon");
const currentTime = document.getElementById("current-time");


// تعبئة قائمة المدن واختيار افتراضي للدار البيضاء
cities.forEach(city => {
    const option = document.createElement("option");
    option.value = `${city.lat},${city.lon}`;
    option.textContent = city.name;
    if (city.name === "الدار البيضاء") option.selected = true;
    citySelect.appendChild(option);
});

// دالة جلب بيانات الطقس
async function fetchWeatherData(LAT, LON) {
    loadingScreen.style.display = "flex";
    mainContent.style.display = "none";
    try {
        const url = `${API_URL}?latitude=${LAT}&longitude=${LON}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,pressure_msl,cloud_cover,precipitation,precipitation_probability,rain,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,rain_sum,precipitation_probability_min,sunrise,sunset,weather_code&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        window.lastWeatherData = data; // لتسهيل عرض البيانات من القائمة الجانبية
        updateCurrentWeather(data);
        updateDailyForecast(data);
        mainContent.style.display = "block";
    } catch (error) {
        alert("تعذر جلب بيانات الطقس. حاول لاحقًا.");
    } finally {
        loadingScreen.style.display = "none";
    }
}

// دالة تحويل كود الطقس إلى نص
function weatherCodeToText(code) {
    const map = {
        0: "صحو",
        1: "غائم جزئيًا",
        2: "غائم",
        3: "غائم كليًا",
        45: "ضباب",
        48: "ضباب متجمد",
        51: "رذاذ خفيف",
        61: "أمطار خفيفة",
        63: "أمطار متوسطة",
        65: "أمطار غزيرة",
        71: "ثلوج خفيفة",
        80: "زخات خفيفة",
        95: "عاصفة رعدية"
    };
    return map[code] || "غير معروف";
}

// دالة تحديث بيانات الطقس الحالي
function updateCurrentWeather(data) {
    const current = data.current;
    const daily = data.daily;
    currentLocation.textContent = citySelect.options[citySelect.selectedIndex].text;
    currentTemp.textContent = `${current.temperature_2m}°C`;
    currentWeather.textContent = weatherCodeToText(current.weather_code);
    currentWind.textContent = `${current.wind_speed_10m} Km/h`;
    currentHumidity.textContent = `${current.relative_humidity_2m}%`;
    currentPressure.textContent = `${current.pressure_msl} hPa`;
    currentTime.textContent = formatDate(current.time);

    // أيقونة الطقس
    weatherIcon.src = getWeatherIcon(current.weather_code, current.is_day);

    // شروق وغروب الشمس (اليوم الأول فقط)
    if (daily && daily.sunrise && daily.sunset) {
        document.getElementById("sunrise").textContent = formatTime(daily.sunrise[0]);
        document.getElementById("sunset").textContent = formatTime(daily.sunset[0]);
    } else {
        sunriseElem.textContent = "";
        sunsetElem.textContent = "";
    }

    setDynamicBackground(current.weather_code, current.is_day);
}

function setDynamicBackground(weatherCode, isDay) {
    const body = document.body;
    let gradient = "";
    switch (weatherCode) {
        case 0: // clear
            gradient = isDay
                ? "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)"
                : "linear-gradient(135deg, #232526 0%, #414345 100%)";
            break;
        case 2: // partly cloudy
        case 3: // overcast
            gradient = "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)";
            break;
        case 61: // rain
        case 63:
        case 65:
            gradient = "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)";
            break;
        case 71: // snow
            gradient = "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)";
            break;
        case 95: // thunderstorm
            gradient = "linear-gradient(135deg, #434343 0%, #000000 100%)";
            break;
        default:
            gradient = "linear-gradient(135deg, #6dd5fa 0%, #2980b9 100%)";
    }
    body.style.background = gradient;
}

// دالة تنسيق الوقت (من ISO إلى hh:mm)
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ar-MA", { hour: "2-digit", minute: "2-digit" });
}

// دالة تحديث توقعات الأيام القادمة
function updateDailyForecast(data) {
    const daily = data.daily;
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";
    if (!daily || !daily.time) return;
    for (let i = 1; i < daily.time.length; i++) { // يبدأ من 1 وليس 0
        const card = document.createElement("div");
        card.className = "forecast-card";
        /* ${getWeatherIcon(daily.weather_code[i], 1)} */
        card.innerHTML = `
            <div class="date">${formatDate(daily.time[i])}</div>
            <div> 
                <img class="img" src="assets/png/day/clear_sky.png" alt="icon" class="weather-icon-animated">
                <div>
                    <div class="temp-max">↑ ${daily.temperature_2m_max[i]}°</div>
                    <div class="temp-min">↓ ${daily.temperature_2m_min[i]}°</div>
                </div>
                </div>
            <div class="sun-times">
                <img src="assets/png/aviable/sunrise.png" width="20" height="20" alt="شروق">  ${formatTime(daily.sunrise[i])}
                <img src="assets/png/aviable/sunset.png" width="20" height="20" alt="غروب">  ${formatTime(daily.sunset[i])}
            </div>
            <div>💨 الرياح: ${daily.wind_speed_10m_max[i]} Km/h</div>
            <div>💧 الرطوبة: ${daily.precipitation_probability_min[i]} %</div>
        `;
        forecastContainer.appendChild(card);
    }
}

// دالة تنسيق التاريخ
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("ar-MA", { weekday: "short", day: "numeric", month: "short" });
}

// عند تغيير المدينة
citySelect.addEventListener("change", () => {
    const coords = citySelect.value.split(",");
    if (coords.length === 2) {
        fetchWeatherData(coords[0], coords[1]);
    }
});

// تحميل بيانات المدينة الافتراضية عند بدء التشغيل
window.addEventListener("DOMContentLoaded", () => {
    if (citySelect.value) {
        const coords = citySelect.value.split(",");
        if (coords.length === 2) {
            fetchWeatherData(coords[0], coords[1]);
        }
    }
});
