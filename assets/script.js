var searchInputEl = $('#search-input');
var searchBtnEl = $('#search-btn');
var searchHistoryEl = $('#search-history');
var todayWeatherEl = $('#today-weather');
var fiveDayForecastEl = $('#five-day-forecast');
var clearHistoryBtn = $('#clear-history')
var storedHistory;

// function to pull from local storage, assign to variable, and send that variable to be rendered on page
function generateSearchBtns() {
    storedHistory = JSON.parse(localStorage.getItem('storedHistoryArray'));
    // in the event local storage is empty, assign empty array to avoid error
    if(!storedHistory) {
        storedHistory = [];
        // render as many buttons as there are values in local storage
    } else {
        for(var i=0; i<storedHistory.length; i++) {
            renderSearchHistory(storedHistory[i]);
        }
    }
}

// function to generate search history buttons, add bootstrap classes, and recent-search class used for delegating click event
function renderSearchHistory(data) {
    if(data !== null){
        var recentSearchBtn = $('<button>');
        recentSearchBtn.addClass('btn btn-secondary btn-block recent-search');
        recentSearchBtn.attr('data-name', data)
        recentSearchBtn.text(data);
        searchHistoryEl.prepend(recentSearchBtn);
    }
}

var userSearch;
// function to fetch data from API
function fetchData(event) {
    // checking where function was called from, assigning variable userSearch accordingly
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

// function to generate the current day's weather and append to page
function renderTodayWeather(data) {
    todayWeatherEl.empty();
    var todayDate = moment().format('(M/DD/YYYY)');
    // icons all contained at API's address, but unique code is given in data array--this just pulls that code out and inserts it into the necessary URL to generate the icon for that day
    var iconCode = 'https://openweathermap.org/img/w/'+data.weather[0].icon+'.png';
    // img tag with iconCode as the src attribute
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

// function to fetch future forecast data
function fetchForecast(data) {
    var requestURL = 'https://api.openweathermap.org/data/2.5/forecast?lat='+data.coord.lat+'&lon='+data.coord.lon+'&units=imperial&appid=c6a780b0ebe365a1307713c838e67424';
    $.ajax({
        url: requestURL,
        method: 'GET'
        // send response to be rendered by next function
    }).then(function(response) {
        renderForecast(response);
    })
}

// function to generate cards containing five days of future forecast data
function renderForecast(data) {
    fiveDayForecastEl.empty();
    fiveDayForecastEl.prepend($('<h4>').text('5-Day Forecast:'));
    // data array from API contains data split up into 3-hour segments--setting i at 4 and incrementing by 8 picks out midday for each day, offering what I thought would be the most helpful/relevant data for each day
    for(var i=4; i<data.list.length; i=i+8) {
        var forecastCard = $('<div>');
        forecastCard.attr('class','card');
        // using Momentjs to dynamically generate date based on dt_txt value in array from API
        var date = moment(data.list[i].dt_txt).format('M/DD/YYYY');
        forecastCard.append(date);
        var iconCode = 'https://openweathermap.org/img/w/'+data.list[i].weather[0].icon+'.png';
        var icon = $('<img>').attr('src',iconCode);
        forecastCard.append(icon);
        // adding <ul> tag to append <li> tags to for the three required pieces of data
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
    // using a for loop to iterate through array drawn from local storage (at the beginning of code) and check whether current search is already present in search history
    for(var i=0; i<storedHistory.length; i++) {
        // if it matches any value already in the array, skip generating a new button for search history
        if(storedHistory[i] === data.city.name) {
            return;
        }
    }        
    // for values that were not already present in local storage, generate new search history button and attach it to the top of the list
        var recentSearchBtn = $('<button>');
        recentSearchBtn.addClass('btn btn-secondary btn-block recent-search');
        recentSearchBtn.attr('data-name', data.city.name)
        recentSearchBtn.text(data.city.name);
        searchHistoryEl.prepend(recentSearchBtn);
        storedHistory.push(data.city.name);
        localStorage.setItem('storedHistoryArray', JSON.stringify(storedHistory));
}

// calling function immediately so that local storage is displayed as search history buttons
generateSearchBtns();

// event listeners for the search button, search history buttons, and the clear search history button
searchBtnEl.on('click', fetchData);
searchHistoryEl.on('click', '.recent-search', function() {
    fetchData(event);
});
clearHistoryBtn.on('click', function() {
    localStorage.clear();
    searchHistoryEl.empty();
});