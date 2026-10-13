async function getWeather() {
    let city = document.getElementById("city").value.trim();
    let result = document.getElementById("result");

    if (city === "") {
        result.innerHTML = "Please enter a city name!";
        return;
    }

    result.innerHTML = "Loading weather...";

    try {
        let response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!response.ok) {
            throw new Error("Unable to find city.");
        }

        let data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("Invalid city name!");
        }

        let place = data.results[0];
        let latitude = place.latitude;
        let longitude = place.longitude;

        let weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`
        );

        if (!weatherResponse.ok) {
            throw new Error("Weather API request failed!");
        }

        let weatherData = await weatherResponse.json();
        let weather = weatherData.current;

        result.innerHTML = `
            <h2>${place.name}, ${place.country}</h2>
            <h3>🌡️ Temperature: ${weather.temperature_2m} °C</h3>
            <h3>💧 Humidity: ${weather.relative_humidity_2m}%</h3>
            <h3>🌍 Condition: ${getCondition(weather.weather_code)}</h3>
        `;

    } catch (error) {
        result.innerHTML = error.message;
    }
}

function getCondition(code) {
    if (code === 0) return "Clear Sky";
    if ([1, 2, 3].includes(code)) return "Partly Cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";

    return "Unknown Condition";
}