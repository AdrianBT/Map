'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


class Workout{
    date = new Date();
    id = (new Date() + "").slice(-10);


    constructor(coords, distance, duration) {
        this.coords = coords; // [lng, lat]
        this.distance = distance; //km
        this.duration = duration; //min
    }
}

class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        // this.type = 'running'
        this.calcPace();
    }

    calcPace() {
        //min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    
    }
}


class Cycling extends Workout {
    type = 'cycling'
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        // this.type = 'cycling'
        this.calcSpeed();
    }

    calcSpeed() {
        // km/h
        this.speed = this.duration / (this.distance / 60);
        return this.speed;
    
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APPLICATION 

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    #mapEvent;
    #map;
    #workouts = [];

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this), 
            function () {
                alert('could not get your position')
            }
        );
    }

    _loadMap(position) {
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        
        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
         }).addTo(this.#map);



        this.#map.on('click', this._showForm.bind(this))

     }
    
   

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }

    _newWorkout(e)  {

        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp >0)
        
        e.preventDefault();

        // Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        // If workout cycling, create running object 
        if (type === 'running') {
            const cadence = +inputCadence.value;
            // Check if data is valid 
            if (
                // !Number.isFinite(distance) ||
                // !Number.isFinite(duration) ||
                // !Number.isFinite(cadence)
                !validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)
            )
             return alert('inputs have to be positive number!');

             workout = new Running([lat, lng], distance, duration, cadence);
        }
        // If workout cycling, create cycling object 
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            if (
              
                !validInputs(distance, duration, elevation) || !allPositive(distance, duration)
            )
             return alert('inputs have to be positive number!');

             workout = new Cycling ([lat, lng], distance, duration, elevation);
            
        }
        
        // Add new object to workout array
        this.#workouts.push(workout);
        console.log(workout);


        // Render workout on map as marker 
        this.renderWorkoutMarker(workout);

        //Render workout on list 
        this._renderWorkout(workout)

        //Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    }

    renderWorkoutMarker(workout) {
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
            L.popup({maxWidth: 250,
                     minWidth: 100,
                     autoClose: false,
                     closeOnClick: false,
                     className: `${workout.type}-popup`,
                    })
                )
        .setPopupContent('Workout')                
        .openPopup();
    }

    _renderWorkout(workout) {
        const html = `<li class="workout workout--${workout.name}" data-id="${workout.id}">
        <h2 class="workout__title">Running on April 14</h2>
        <div class="workout__details">
          <span class="workout__icon">
          ${workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️' } </span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`
    }
}

const app = new App();



