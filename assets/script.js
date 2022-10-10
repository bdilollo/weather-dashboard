var searchInputEl = $('#search-input');
var searchBtnEl = $('#search-btn');
var searchHistoryEl = $('#search-history');
var todayWeatherEl = $('#today-weather');
var fiveDayForecastEl = $('#five-day-forecast');
var clearHistoryBtn = $('#clear-history')
var storedHistory;


function generateSearchBtns() {
    storedHistory = JSON.parse(localStorage.getItem('storedHistoryArray'));
    if(!storedHistory) {
        storedHistory = [];
    } else {
        for(var i=0; i<storedHistory.length; i++) {
            renderSearchHistory(storedHistory[i]);
        }
    }
}

var userSearch;

function fetchData(event) {
    var clickedBtn = event.target;
    if($(clickedBtn).attr('data-name')) {
        userSearch = $(clickedBtn).attr('data-name');
    } else if(searchInputEl.val()) { 
    userSearch = searchInputEl.val().trim();
    searchInputEl.val('');
    } else {
        return;
    }
    var requestURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + userSearch + '&units=imperial&appid=c6a780b0ebe365a1307713c838e67424';
        $.ajax({
            url: requestURL,
            method: 'GET'
        }).then(function(response) {
            renderTodayWeather(response);
        })
}
function renderTodayWeather(data) {
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


function fetchForecast(data) {
    var requestURL = 'https://api.openweathermap.org/data/2.5/forecast?lat='+data.coord.lat+'&lon='+data.coord.lon+'&units=imperial&appid=c6a780b0ebe365a1307713c838e67424';
    console.log(requestURL);
    $.ajax({
        url: requestURL,
        method: 'GET'
    }).then(function(response) {
        renderForecast(response);
    })
}

function renderForecast(data) {
    fiveDayForecastEl.empty();
    fiveDayForecastEl.prepend($('<h4>').text('5-Day Forecast:'));
    for(var i=4; i<data.list.length; i=i+8) {
        var forecastCard = $('<div>');
        forecastCard.attr('class','card');
        var date = moment(data.list[i].dt_txt).format('M/DD/YYYY');
        forecastCard.append(date);
        var iconCode = 'http://openweathermap.org/img/w/'+data.list[i].weather[0].icon+'.png';
        var icon = $('<img>').attr('src',iconCode);
        forecastCard.append(icon);
        var weatherDataList = $('<ul>').attr('id','forecast-weather-list');
        var temp = $('<li>');
        temp.html('Temp: '+ data.list[i].main.temp_max+'\u00B0'+'F');
        var wind = $('<li>');
        wind.text('Wind: '+data.list[i].wind.speed+' MPH');
        var humidity = $('<li>');
        humidity.text('Humidity: '+data.list[i].main.humidity+'%');
        weatherDataList.append(temp, wind, humidity);
        forecastCard.append(weatherDataList);
        fiveDayForecastEl.append(forecastCard);
    }

    for(var i=0; i<storedHistory.length; i++) {
        if(storedHistory[i] === data.city.name) {
            return;
        }
    }        
        var recentSearchBtn = $('<button>');
        recentSearchBtn.addClass('btn btn-secondary btn-block recent-search');
        recentSearchBtn.attr('data-name', data.city.name)
        recentSearchBtn.text(data.city.name);
        searchHistoryEl.prepend(recentSearchBtn);
        storedHistory.push(data.city.name);
        localStorage.setItem('storedHistoryArray', JSON.stringify(storedHistory));
}

function renderSearchHistory(data) {
    console.log(data);
    if(data !== null){
        var recentSearchBtn = $('<button>');
        recentSearchBtn.addClass('btn btn-secondary btn-block recent-search');
        recentSearchBtn.attr('data-name', data)
        recentSearchBtn.text(data);
        searchHistoryEl.prepend(recentSearchBtn);
    }
}

generateSearchBtns();
searchBtnEl.on('click', fetchData);
searchHistoryEl.on('click', '.recent-search', function() {
    fetchData(event);
});
clearHistoryBtn.on('click', function() {
    localStorage.clear();
    searchHistoryEl.empty();
});