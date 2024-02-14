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
    const countryPopulation = countryData['population'];
    const countryArea = countryData['area'];
    const countryGDP = countryData['gdp'];

    const popup = document.getElementById('countryPopup');
    popup.innerHTML = `
        <h3>${countryName}</h3>
        <p>Population: ${countryPopulation}</p>
        <p>Area: ${countryArea}</p>
        <p>GDP: ${countryGDP}</p>
    `;
    popup.classList.add('slide-in');
    popup.style.display = 'block';

}

function hidePopup() {
    const popup = document.getElementById('countryPopup');
    popup.classList.remove('slide-in');
    popup.style.display = 'none';
}
