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

class Workout {
    // defining unique properties which do not depend on the user data
    date = new Date();
    id = Date.now().toString().slice(-10);

    constructor (distance, duration, coords) {
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
    }

    getDescription() {
        this.description = `${this.type[0].toString().toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = 'running';

    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence;
        this.pace = this._calcPace();
        this.getDescription();
    }

    _calcPace() {
        return this.duration / this.distance;
    }
}

class Cycling extends Workout {
    type = 'cycling';

    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.elevationGain = elevationGain;
        this.speed = this._calcSpeed();
        this.getDescription();
    }

    _calcSpeed() {
        return this.distance / (this.duration / 60);
    }
}

class App {
    // private variables
    #map;
    #mapEvent;
    #workouts = [];

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
        let workout;
        const distance = inputDistance.value;
        const duration = inputDuration.value;
        const workoutType = inputType.value;
        const cadence = inputCadence.value;
        const elevation = inputElevation.value;


        // checking if inputs are integers
        const checkIfNumber = (...inputs) => inputs.every(input => isFinite(input));

        // checking if inputs are positive integers
        const checkIfPositive = (...inputs) => inputs.every(input => input > 0);

        // running workout
        if (workoutType === 'running') {
            if (checkIfNumber(distance, duration, cadence) &&
            checkIfPositive(distance, duration, cadence)) {
                workout = new Running(distance, duration, [lat, lng], cadence);
            } else {
                return alert('Enter a valid input, please');
            }
        }

        // running workout
        if (workoutType === 'cycling') {
            if (checkIfNumber(distance, duration, elevation) &&
            checkIfPositive(distance, duration)) {
                workout = new Cycling(distance, duration, [lat, lng], elevation);
            }
            else {
                return alert('Enter a valid input, please');
            }
        }

        // adding workout and rendering it
        this.#workouts.push(workout);
        this._renderWorkout(workout);
        this._renderWorkoutList(workout);
        this._hideForm();
    }

    _hideForm() {
        // clearing fields and hiding form
        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
        form.classList.add('hidden');
    }

    _renderWorkout(workout) {
        L.marker(workout.coords).addTo(this.#map).bindPopup(
            L.popup({
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
                maxWidth: 250,
                minWidth: 100
            }))
            .setPopupContent(`${workout.description}`)
            .openPopup();
    }

    _renderWorkoutList(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id='${workout.id}'>
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;

        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(2)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `;
        } else {
            html += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(2)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
            </li>
            `
        }
        // adding final html to the workouts container
        containerWorkouts.insertAdjacentHTML('beforeend', html);
    }
}
    
const app = new App();