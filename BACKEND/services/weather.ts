/**
 * Real-time Weather Service using Open-Meteo REST API
 * Free, real-time meteorological API with zero API keys required.
 */

export interface WeatherData {
    locationName: string;
    latitude: number;
    longitude: number;
    temperature: number; // in Celsius
    humidity: number; // in %
    weatherCode: number;
    conditionText: string;
    windSpeed: number; // in km/h
    summary: string;
    language: 'en' | 'hi' | 'kn';
}

const WMO_WEATHER_CODES: Record<number, { en: string; hi: string; kn: string }> = {
    0: { en: "Clear sky and sunny", hi: "आसमान साफ और धूप खिली है", kn: "ಸ್ವಚ್ಛ ಆಕಾಶ ಮತ್ತು ಬಿಸಿಲಿದೆ" },
    1: { en: "Mainly clear", hi: "मुख्य रूप से साफ मौसम", kn: "ಹೆಚ್ಚಾಗಿ ಸ್ಪಷ್ಟ ವಾತಾವರಣ" },
    2: { en: "Partly cloudy", hi: "आंशिक रूप से बादल छाए हुए", kn: "ಭಾಗಶಃ ಮೋಡ ಕವಿದ ವಾತಾವರಣ" },
    3: { en: "Overcast clouds", hi: "घने बादल छाए हुए हैं", kn: "ದಟ್ಟ ಮೋಡ ಕವಿದಿದೆ" },
    45: { en: "Foggy conditions", hi: "कोहरा छाया हुआ है", kn: "ಮಂಜು ಮುಸುಕಿದ ವಾತಾವರಣ" },
    48: { en: "Depositing rime fog", hi: "घना कोहरा", kn: "ದಟ್ಟ ಮಂಜು" },
    51: { en: "Light drizzle", hi: "हल्की बूंदाबांदी", kn: "ಲಘು ತುಂತುರು ಮಳೆ" },
    53: { en: "Moderate drizzle", hi: "मध्यम बूंदाबांदी", kn: "ಮಧ್ಯಮ ತುಂತುರು ಮಳೆ" },
    55: { en: "Dense drizzle", hi: "तेज बूंदाबांदी", kn: "ದಟ್ಟ ತುಂತುರು ಮಳೆ" },
    61: { en: "Slight rain", hi: "हल्की बारिश", kn: "ಲಘು ಮಳೆ" },
    63: { en: "Moderate rain", hi: "मध्यम बारिश", kn: "ಮಧ್ಯಮ ಮಳೆ" },
    65: { en: "Heavy rain", hi: "भारी बारिश", kn: "ಭಾರೀ ಮಳೆ" },
    80: { en: "Rain showers", hi: "बारिश की फुहारें", kn: "ಮಳೆಯ ಸಿಂಚನ" },
    81: { en: "Moderate rain showers", hi: "मध्यम बारिश की फुहारें", kn: "ಮಧ್ಯಮ ಮಳೆಯ ಸಿಂಚನ" },
    82: { en: "Violent rain showers", hi: "तेज मूसलाधार बारिश", kn: "ಭಾರೀ ಬಿರುಗಾಳಿ ಸಹಿತ ಮಳೆ" },
    95: { en: "Thunderstorm with rain", hi: "गरज के साथ बारिश", kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ" },
};

/**
 * Geocode location name into lat/long using Open-Meteo Geocoding
 */
export async function geocodeLocation(locationName: string): Promise<{ name: string; lat: number; lon: number } | null> {
    try {
        const cleanName = locationName.trim();
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.results || data.results.length === 0) return null;
        const top = data.results[0];
        return {
            name: `${top.name}${top.admin1 ? `, ${top.admin1}` : ""}`,
            lat: top.latitude,
            lon: top.longitude,
        };
    } catch {
        return null;
    }
}

/**
 * Fetches live weather for a village/city or defaults to Varanasi / Uttar Pradesh
 */
export async function getLiveWeather(
    locationQuery = "Varanasi",
    language: 'en' | 'hi' | 'kn' = 'en'
): Promise<WeatherData> {
    // 1. Geocode
    let geo = await geocodeLocation(locationQuery);
    if (!geo) {
        // Fallback to default rural hub Varanasi
        geo = { name: "Varanasi, Uttar Pradesh", lat: 25.3176, lon: 82.9739 };
    }

    // 2. Fetch real-time weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const res = await fetch(weatherUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
        throw new Error(`Weather service returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const temp = Math.round(Number(current.temperature_2m || 26));
    const humidity = Math.round(Number(current.relative_humidity_2m || 65));
    const code = Number(current.weather_code || 0);
    const wind = Math.round(Number(current.wind_speed_10m || 5));

    const condition = WMO_WEATHER_CODES[code] || {
        en: "Clear weather",
        hi: "साफ मौसम",
        kn: "ಉತ್ತಮ ವಾತಾವರಣ"
    };

    let summary = "";
    if (language === 'hi') {
        summary = `${geo.name} में आज का मौसम: ${condition.hi}, तापमान ${temp}°C है, आर्द्रता ${humidity}% और हवा की गति ${wind} किमी/घंटा है।`;
    } else if (language === 'kn') {
        summary = `${geo.name} ನಲ್ಲಿ ಇಂದಿನ ಹವಾಮಾನ: ${condition.kn}, ತಾಪಮಾನ ${temp}°C, ತೇವಾಂಶ ${humidity}% ಮತ್ತು ಗಾಳಿಯ ವೇಗ ${wind} ಕಿಮೀ/ಗಂಟೆ ಇದೆ.`;
    } else {
        summary = `Today's weather in ${geo.name}: ${condition.en} with a temperature of ${temp}°C, humidity at ${humidity}%, and wind speed of ${wind} km/h.`;
    }

    return {
        locationName: geo.name,
        latitude: geo.lat,
        longitude: geo.lon,
        temperature: temp,
        humidity,
        weatherCode: code,
        conditionText: condition[language] || condition.en,
        windSpeed: wind,
        summary,
        language,
    };
}
