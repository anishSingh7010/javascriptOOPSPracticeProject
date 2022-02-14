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

class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();
        //switching fields between running and cycling
        form.addEventListener('submit', this._newWorkout.bind(this));
        // hide form on submit and clear
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        // getting position
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
            // failure callback
            () => {
            alert(`Sorry, we couldn't get your location`);
        });         
    }

    _loadMap(location) {
        // success callback: getting latitude and longitude coordinates
        const {latitude} = location.coords;
        const {longitude} = location.coords;
        const coordinates = [latitude, longitude];

        // leaflet library function
        this.#map = L.map('map').setView(coordinates, 13);
        
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoiYW5pc2g3MDEwIiwiYSI6ImNremlzNzJrdTByZ3MybnFreXV2MXUyY3MifQ.-iyJkmvvh0zKyS6e0DjEAQ'
        }).addTo(this.#map);

        L.marker(coordinates).addTo(this.#map).bindPopup(
            L.popup({ 
                autoClose: false,
                maxWidth: 250,
                minWidth: 100
            })
            .setContent('You are here right now'))
            .openPopup();
        
        // on click inside the map
        this.#map.on('click', this._showForm.bind(this));
    }

    // showing the form whenever a click is registered on the map
    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
    }

    _toggleElevationField() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();
        const {lat, lng} = this.#mapEvent.latlng;
        L.marker([lat, lng]).addTo(this.#map).bindPopup(
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
        form.classList.add('hidden');
    }
}
    
const app = new App();