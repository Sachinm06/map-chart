const countrySelect = document.getElementById('countrySelect');
Highcharts.maps['custom/world'].features.forEach((feature) => {
    const countryName = feature.properties['name'];
    const countryCode = feature.properties['hc-key'];
    const option = document.createElement('option');
    option.value = countryCode;
    option.textContent = countryName;
    countrySelect.appendChild(option);
});

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
    }
});


document.getElementById('countrySelect').addEventListener('change', function () {
    const selectedCountry = this.value;
    populateMap(selectedCountry ? [selectedCountry] : []);
    if (selectedCountry) {
        showPopup(selectedCountry);
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


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function populateMap(selectedCountries) {
    const mapSeries = mapChart.series[0];
    const mapPoints = mapSeries.points;

    mapPoints.forEach(point => {
        point.update({ color: '#E0E0E0' }, false);
    });

    selectedCountries.forEach((code) => {
        const point = mapSeries.points.find(p => p['hc-key'] === code);
        if (point) {
            point.update({ color: getRandomColor() }, false);
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

    const popup = document.getElementById('countryPopup');
    popup.innerHTML = `
        <h3>${countryName}</h3>
        <p>Continent: ${countryPopulation}</p>
        <p>Where On Earth IDentifier: ${countryArea}</p>
        <p class="countryID">Country code: ${countryGDP}</p>
    `;
    popup.classList.add('slide-in');
    popup.style.display = 'block';

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




    const popup = document.getElementById('mapPopup');
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
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