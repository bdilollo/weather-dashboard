var searchInputEl = $('#search-input');
var searchBtnEl = $('#search-btn');
var searchHistoryEl = $('#search-history');
var todayWeatherEl = $('#today-weather');
var fiveDayForecastEl = $('#five-day-forecast');


// event listener for search button
    // triggers fetch request from weather API
    // prints relevant info + icon to todayWeatherEl
        // City, today's date, weather icon, temp, humidity, wind speed
    // generates cards in fiveDayForecastEl to display five-day forecast
        // dates, weather icon, temp, wind speed, humidity
    // saves search in search history as button to fetch same info

function fetchData() {
    var userSearch = searchInputEl.val().trim();
    searchInputEl.val('');
    console.log(userSearch);
    var requestURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + userSearch + '&units=imperial&appid=c6a780b0ebe365a1307713c838e67424';
        $.ajax({
            url: requestURL,
            method: 'GET'
        }).then(function(response) {
            console.log(requestURL);
            // console.log(response);
            renderTodayWeather(response);
        })
}
function renderTodayWeather(data) {
    // console.log(data);
    todayWeatherEl.empty();
    var todayDate = moment().format('(M/DD/YYYY)');
    var iconCode = 'http://openweathermap.org/img/w/'+data.weather[0].icon+'.png';
    var weatherIcon = $('<img>').attr('src', iconCode);
    var cityName = $('<h3>').text(data.name+' '+todayDate);
    todayWeatherEl.append(cityName, weatherIcon);
    
    var weatherDataList = $('<ul>').attr('id','today-weather-list');
    var currentTemp = $('<li>');
    currentTemp.html('Temp: '+ data.main.temp+'\u00B0'+'F');
    var currentWind = $('<li>');
    currentWind.text('Wind: '+data.wind.speed+' MPH');
    var currentHumidity = $('<li>');
    currentHumidity.text('Humidity: '+data.main.humidity+'%');
    weatherDataList.append(currentTemp, currentWind, currentHumidity);
    todayWeatherEl.append(weatherDataList);
    fetchForecast(data);
}

var lat;
var lon;
function fetchForecast(data) {
    console.log(data);
    lat = data.coord.lat;
    lon = data.coord.lon;
    var requestURL = 'https://api.openweathermap.org/data/2.5/forecast/?lat='+lat+'&lon='+lon+'&units=imperial&appid=c6a780b0ebe365a1307713c838e67424';
    console.log(requestURL);
    $.ajax({
        url: requestURL,
        method: 'GET'
    }).then(function(response) {
        renderForecast(response);
    })
}

function renderForecast(data) {
    console.log(data);
    fiveDayForecastEl.prepend($('<h4>').text('5-Day Forecast:'));
    for(var i=0; i<data.list.length; i=i+8) {
        var forecastCard = $('<div>');
        forecastCard.attr('class','card');
        var date = moment(data.list[i].dt_txt).format('M/DD/YYYY');
        forecastCard.append(date);
        var iconCode = 'http://openweathermap.org/img/w/'+data.list[i].weather[0].icon+'.png';
        var icon = $('<img>').attr('src',iconCode);
        forecastCard.append(icon);
        var weatherDataList = $('<ul>').attr('id','forecast-weather-list');
        var temp = $('<li>');
        temp.html('Temp: '+ data.list[i].main.temp+'\u00B0'+'F');
        var wind = $('<li>');
        wind.text('Wind: '+data.list[i].wind.speed+' MPH');
        var humidity = $('<li>');
        humidity.text('Humidity: '+data.list[i].main.humidity+'%');
        weatherDataList.append(temp, wind, humidity);
        forecastCard.append(weatherDataList);
        fiveDayForecastEl.append(forecastCard);

    }
}




searchBtnEl.on('click', fetchData);