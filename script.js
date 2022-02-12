'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map;
let mapEvent;

navigator.geolocation.getCurrentPosition(location => {
    // success callback: getting latitude and longitude coordinates
    const {latitude} = location.coords;
    const {longitude} = location.coords;
    const coordinates = [latitude, longitude];

    // leaflet library function
    map = L.map('map').setView(coordinates, 13);
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYW5pc2g3MDEwIiwiYSI6ImNremlzNzJrdTByZ3MybnFreXV2MXUyY3MifQ.-iyJkmvvh0zKyS6e0DjEAQ'
    }).addTo(map);

    L.marker(coordinates).addTo(map).bindPopup(
        L.popup({ 
            autoClose: false,
            maxWidth: 250,
            minWidth: 100
        })
        .setContent('You are here right now'))
        .openPopup();

    // on click inside the map
    map.on('click', function(mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
    })
},
// failure callback
() => {
    alert(`Sorry, we couldn't get your location`);
});

// hide form on submit and clear
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const {lat, lng} = mapEvent.latlng;
    L.marker([lat, lng]).addTo(map).bindPopup(
        L.popup({
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
        maxWidth: 250,
        minWidth: 100
    }))
    .openPopup();
    // clearing fields and hiding form
    inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
    this.classList.add('hidden');
});

//switching fields between running and cycling
inputType.addEventListener('change', function(e) {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
})