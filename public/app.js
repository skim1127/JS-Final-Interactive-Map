var myMap = {
    // map elements
    coordinates: [],
    businesses: [],
    map: {},
    markers: {},

    loadMap(coordinates) {
        //setting map center and zoom 
        this.map = L.map('myMap', {
            center: [coordinates[0],coordinates[1]],
            zoom: 10
        });

        //add map tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: '15',
        }).addTo(this.map)
        
        //add marker w/popup
        var marker = L.marker([coordinates[0],coordinates[1]]).addTo(this.map)
        marker.addTo(this.map).bindPopup('<p1><b>My Location</b></p1>').openPopup();
    },

    // add business markers
    addMarkers() {
        for (var x = 0; x < this.businesses.length; x++) {
            this.markers = L.marker([
                this.businesses[x].lat,
                this.businesses[x].lon,
            ])
            .bindPopup(`<p1>${this.businesses[x].name}</p1>`)
            .addTo(this.map)
        }
    }
}

// get user's coordinates
async function getCoords() {

    //wait until promise is fulfilled
    pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    })

    //return user coordinates
    return [pos.coords.latitude, pos.coords.longitude]
}

// Foursquare
async function getFoursquare(business){
    var options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: 'fsq3m7wVWIKNh0pmVjakwIrB5SqNRXDKhjPP834HqEPbtEY='
        }
    }
    // max 5 results
    let limit = 5
    
    // get default coords
    let lat = myMap.coordinates[0]
    let lon = myMap.coordinates[1]

    // search businesses
    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options)
    let data = await response.text()
    let parsedData = JSON.parse(data)
    let businesses = parsedData.results
    
    // return array
    // console.log(businesses)
    return businesses
}

// organize data from foursquare
function organizeData(data) {
    let organizedData = data.map((element) => {
        let location = {
            name: element.name,
            lat: element.geocodes.main.latitude,
            lon: element.geocodes.main.longitude
        };
        // console.log(location)
        return location
    })
    return organizedData
}

// get user input value
var businessType = document.querySelector('#dropdown')
var submit = document.querySelector('#submit-btn')

// SUBMIT BUTTON
// get business type
submit.addEventListener('click', async (event) => {
    event.preventDefault()

    let business = businessType.value
    // search up businesses on foursquare
    let data = await getFoursquare(business)

    // process data
    myMap.businesses = organizeData(data)

    // add markers to the map
    myMap.addMarkers()
})


// on Load
window.onload = async () => {
    const coords = await getCoords()
    myMap.coordinates = coords
    myMap.loadMap(coords)
}