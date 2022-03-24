// https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: { lat: 55.75399400, lng: 37.62209300 }, // Moscow
    });

    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();

    document.getElementById("findme").addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                document.getElementById("coords").innerHTML = JSON.stringify(latlng);

                geocoder
                    .geocode({ location: latlng })
                    .then((response) => {
                        if (response.results[0]) {
                            map.setZoom(11);

                            const marker = new google.maps.Marker({
                                position: latlng,
                                map: map,
                            });

                            infowindow.setContent(response.results[0].formatted_address);

                            infowindow.open(map, marker);

                            document.getElementById("address").innerHTML = response.results[0].formatted_address;

                        } else {
                            alert("No results found :(");
                        }
                    })
                    .catch((e) => alert("Geocoder failed: " + e));

            });
        } else {
            alert("Browser does not support HTML5 geolocation :(");
        }
    });
}

// const key = 'AIzaSyDCkf8oXjXMFHXCgTa-u54tVRIRCzqR5LQ';

// axios
//     .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&location_type=ROOFTOP&result_type=street_address&key=${key}`)
//     .then(res => {
//         console.log('axios: ', res.data.response);

//         document.getElementById('location').innerHTML = JSON.stringify(res.data);
//     })