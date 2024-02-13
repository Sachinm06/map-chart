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

document.getElementById('searchInput').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    const selectedCountry = countrySelect.value;
    populateMap(selectedCountry ? [selectedCountry] : []);
});

document.getElementById('countrySelect').addEventListener('change', function () {
    const selectedCountry = this.value;
    populateMap(selectedCountry ? [selectedCountry] : []);
    if (selectedCountry) {
        showPopup(selectedCountry);
    }
});

mapChart.series[0].points.forEach(function (point) {
    point.graphic.element.addEventListener('click', function () {
        const selectedCountry = point['hc-key'];
        populateMap([selectedCountry]);
        showPopup(selectedCountry);
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
    const countryName = Highcharts.maps['custom/world'].features.find(feature => feature.properties['hc-key'] === countryCode).properties['name'];
    const popup = document.getElementById('countryPopup');
    popup.textContent = countryName;
    popup.style.display = 'block';
    const clickedPoint = mapChart.series[0].points.find(point => point['hc-key'] === countryCode);
    const coordinates = mapChart.pointer.toPixels({ x: clickedPoint.x, y: clickedPoint.y });
    popup.style.left = coordinates.x + 'px';
    popup.style.top = coordinates.y + 'px';
}

