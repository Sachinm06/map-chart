const mapChart = Highcharts.mapChart('mapContainer', {
    chart: {
        map: 'custom/world'
    },
    series: [{
        mapData: Highcharts.maps['custom/world'],
        name: 'All Countries'
    }],
    mapNavigation: {
        enabled: true,
        buttonOptions: {
            verticalAlign: 'bottom'
        }
    }
});



function highlightCountries(countryCodes) {
    const mapSeries = mapChart.series[0];
    const mapPoints = mapSeries.points;

    mapPoints.forEach(point => {
        const countryCode = point['hc-key'];
        if (countryCodes.includes(countryCode)) {
            point.update({ color: 'red' }, false);
        } else {
            point.update({ color: 'blue' }, false);
        }
    });

    mapChart.redraw();
}

$.getJSON("map.json", function (data) {
    const selectElement = document.createElement('select');
    selectElement.id = 'countrySelect';
    selectElement.innerHTML = Object.keys(data).map(category => `<option value="${category}">${category}</option>`).join('');

    selectElement.addEventListener('change', (event) => {
        const selectedCategory = event.target.value;
        const selectedCountries = data[selectedCategory].map(country => country.country_id);

        highlightCountries(selectedCountries);
    });

    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
        mapContainer.parentNode.insertBefore(selectElement, mapContainer);
    } else {
        console.error('Map container not found.');
    }
});

mapChart.series[0].points.forEach(function (point) {
    point.graphic.element.addEventListener('mouseover', function () {
        const selectedCountry = point['hc-key'];
        populateMap([selectedCountry]);
        showPopup(selectedCountry);
    });

    point.graphic.element.addEventListener('mouseout', function () {
        hidePopup();
    });
});

mapChart.series[0].points.forEach(function (point) {
    point.graphic.element.addEventListener('click', function () {
        const selectedCountry = point['hc-key'];
        populateMap([selectedCountry]);
        mapPopup(selectedCountry);
    });
});

function populateMap(selectedCountries) {
    const mapSeries = mapChart.series[0];
    const mapPoints = mapSeries.points;

    mapPoints.forEach(point => {
        point.update({ color: '#E0E0E0' }, false);
    });

    selectedCountries.forEach((code) => {
        const point = mapSeries.points.find(p => p['hc-key'] === code);
        if (point) {
            point.update({ color: '#008080' }, false);
        }
    });

    mapChart.redraw();
}

function showPopup(countryCode) {
    const countryData = Highcharts.maps['custom/world'].features.find(feature => feature.properties['hc-key'] === countryCode).properties;
    const countryName = countryData['name'];
    const countryPopulation = countryData['continent'];
    const countryArea = countryData['woe-id'];
    const countryGDP = countryData['iso-a2'];

    fetch('countries.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const countries = data.countries;
            if (!Array.isArray(countries)) {
                throw new Error('JSON data is not an array');
            }
            const matchingCountry = countries.find(country => country.country_id === countryGDP);
            const popup = document.getElementById('countryPopup');
            popup.innerHTML = `
                <div class="flag-container">
                    <img src="${matchingCountry.country_flag}" alt="${countryName} flag" class="flag-img">
                    <h3>${countryName}</h3>
                </div>
                <p>Continent: ${countryPopulation}</p>
                <p>Where On Earth IDentifier: ${countryArea}</p>
                <p class="countryID">Country code: ${countryGDP}</p>
            `;
            popup.classList.add('slide-in');
            popup.style.display = 'flex';
        })
        .catch(error => console.error('Error fetching or parsing JSON:', error));
}

function mapPopup(countryCode) {
    const countryData = Highcharts.maps['custom/world'].features.find(feature => feature.properties['hc-key'] === countryCode).properties;
    const countryName = countryData['name'];
    const countryPopulation = countryData['continent'];
    const countryArea = countryData['subregion'];
    const ISOcode2 = countryData['iso-a2'];
    const ISOcode3 = countryData['iso-a3'];
    const labelrank = countryData['labelrank'];
    const countryAbbrev = countryData['country-abbrev'];
    const countryiso = countryData['iso-a3'];
    const regionwb = countryData['region-wb'];
    const Xposition = countryData['hc-middle-x'];
    const Yposition = countryData['hc-middle-y'];
    const countryIdentifier = countryData['woe-id'];

    fetch('countries.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const countries = data.countries;
            if (!Array.isArray(countries)) {
                throw new Error('JSON data is not an array');
            }
            const matchingCountry = countries.find(country => country.country_id === ISOcode2);
            const popup = document.getElementById('mapPopup');
            popup.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    ${matchingCountry ? `<img src="${matchingCountry.country_flag}" alt="${countryName} flag" class="flag-img">` : ''}
                    <h3>${countryName}</h3>
                    <span id="mapPopupClose" style="cursor: pointer;">&#66338;</span>
                </div>
                <p>Continent: ${countryPopulation}</p>
                <p>ISO 2 letter country code: ${ISOcode2}</p>
                <p>ISO 3 letter country code: ${ISOcode3}</p>
                <p>Region: ${regionwb}</p>
                <p class="subregion">Subregion: ${countryArea}</p>
                <p>Abbreviated country name: ${countryAbbrev}</p>
                <p>Where On Earth IDentifier: ${countryIdentifier}</p>
                <p>label rank: ${labelrank}</p>
                <p>Data label X position: ${Xposition}</p>
                <p>Data label Y position: ${Yposition}</p>
            `;
            popup.classList.add('slide-in');
            popup.style.display = 'block';

            document.getElementById('mapPopupClose').addEventListener('click', function () {
                hideMapPopup();
            });
        })
        .catch(error => console.error('Error fetching or parsing JSON:', error));
}

function hidePopup() {
    const popup = document.getElementById('countryPopup');
    popup.classList.remove('slide-in');
    popup.style.display = 'none';
}

function hideMapPopup() {
    const popup = document.getElementById('mapPopup');
    popup.classList.remove('slide-in');
    popup.style.display = 'none';
}