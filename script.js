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

let selectedCountries = [];

function highlightCountries(countryCodes, countryData) {
    console.log("Highlighting countries:", countryCodes);

    const mapSeries = mapChart.series[0];
    const mapPoints = mapSeries.points;

    mapPoints.forEach(point => {
        const countryCode = point['hc-key'];
        const country = countryData.find(country => country.country_id.toLowerCase() === countryCode);
        const value = country ? country.value : null;
        const color = getColorForValue(value);
        point.update({ color: color }, false);
    });

    mapChart.redraw();
}

function highlightSearchedCountries(countryCodes) {
    const mapSeries = mapChart.series[0];
    const mapPoints = mapSeries.points;

    mapPoints.forEach(point => {
        const countryCode = point['hc-key'].toLowerCase();
        const color = countryCodes.includes(countryCode) ? '#008080' : getColorForValue(null);
        point.update({ color: color }, false);
    });

    mapChart.redraw();

    zoomToCountry(countryCodes[0]);
}

function zoomToCountry(countryCode) {
    const mapSeries = mapChart.series[0];
    const point = mapSeries.points.find(p => p['hc-key'] === countryCode);
    if (!point) return;

    const bounds = point.graphic.getBBox();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const zoomX = mapChart.chartWidth / bounds.width;
    const zoomY = mapChart.chartHeight / bounds.height;
    const zoom = Math.min(zoomX, zoomY);

    mapChart.mapZoom(zoom, centerX, centerY);
  
}

function getColorForValue(value) {
    switch (value) {
        case 1:
            return '#808080';
        case 2:
            return '#FF9999';
        case 3:
            return '#FFA500';
        case 4:
            return '#FFFF00';
        case 5:
            return '#008000';
        default:
            return '#E0E0E0';
    }
}

$.getJSON("map.json", function (jsonData) {
    const selectElement = document.createElement('select');
    selectElement.id = 'countrySelect';
    selectElement.innerHTML = Object.keys(jsonData).map(category => `<option value="${category}">${category}</option>`).join('');

    selectElement.addEventListener('change', (event) => {
        const selectedCategory = event.target.value;
        const selectedCountriesData = jsonData[selectedCategory];

        if (selectedCountriesData && selectedCountriesData.length > 0) {
            selectedCountries = selectedCountriesData.map(country => country.country_id.toLowerCase());

            console.log("Selected countries:", selectedCountries);
            console.log("Selected category data:", selectedCountriesData);

            highlightCountries(selectedCountries, selectedCountriesData);
        } else {
            console.error('data is missing');
        }
    });


    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
        mapContainer.parentNode.insertBefore(selectElement, mapContainer);
    } else {
        console.error('Map container not found.');
    }

    selectElement.dispatchEvent(new Event('change'));
});

mapChart.series[0].points.forEach(function (point) {
    point.graphic.element.addEventListener('click', function (event) {
        event.stopPropagation();

        const selectedCountry = point['hc-key'];
        if (selectedCountries.includes(selectedCountry)) {
            console.log("Country clicked:", selectedCountry);
            showPopup(selectedCountry);
        }
    });
});

mapChart.series[0].points.forEach(function (point) {
    point.graphic.element.addEventListener('mouseover', function () {
        const selectedCountry = point['hc-key'];
        if (selectedCountries.includes(selectedCountry)) {
            console.log("Mouse over selected country:", selectedCountry);
            showPopup(selectedCountry);
        }
    });

    point.graphic.element.addEventListener('mouseout', function () {
        hidePopup();
    });
});


mapChart.series[0].points.forEach(function (point) {
    point.graphic.element.addEventListener('click', function (event) {
        event.stopPropagation();

        const selectedCountry = point['hc-key'];
        if (selectedCountries.includes(selectedCountry)) {
            console.log("Country clicked:", selectedCountry);
            showPopup(selectedCountry);
            populateMap([selectedCountry]);
            mapPopup(selectedCountry);
        }
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

document.getElementById('searchInput').addEventListener('input', function (event) {
    const searchText = event.target.value.trim().toLowerCase();
    const dropdownContainer = document.querySelector('.country-dropdown');

    if (searchText === '') {
        if (dropdownContainer) {
            dropdownContainer.style.display = 'block';
        }
    } else {
        if (dropdownContainer) {
            dropdownContainer.style.display = 'none';
        }

        const filteredCountries = Highcharts.maps['custom/world'].features.filter((feature) => {
            const countryName = feature.properties.name.toLowerCase();
            return countryName.includes(searchText);
        }).map((feature) => feature.properties['hc-key']);

        highlightSearchedCountries(filteredCountries);
    }
});

document.addEventListener('click', function (event) {
    const dropdownContainer = document.querySelector('.country-dropdown');
    if (dropdownContainer && !dropdownContainer.contains(event.target)) {
        dropdownContainer.style.display = 'none';
    }
});

document.getElementById('searchInput').addEventListener('click', function (event) {
    let dropdownContainer = document.querySelector('.country-dropdown');

    if (!dropdownContainer) {
        dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('country-dropdown');

        const dropdown = document.createElement('select');
        dropdown.id = 'countryDropdown';
        dropdown.size = 5;

        const allCountries = Highcharts.maps['custom/world'].features;

        allCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.properties['hc-key'];
            option.textContent = country.properties.name;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', function () {
            const selectedCountryCode = dropdown.value;
            // highlightCountries([selectedCountryCode]);
            highlightSearchedCountries([selectedCountryCode]);

        });

        dropdownContainer.appendChild(dropdown);
        event.target.parentNode.appendChild(dropdownContainer);
    } else {
        dropdownContainer.style.display = 'block';
    }

    event.stopPropagation();

    dropdownContainer.addEventListener('click', function (event) {
        event.stopPropagation();
    });
});

document.addEventListener('click', function (event) {
    const dropdownContainer = document.querySelector('.country-dropdown');
    if (dropdownContainer && !dropdownContainer.contains(event.target)) {
        dropdownContainer.parentNode.removeChild(dropdownContainer);
    }
});
