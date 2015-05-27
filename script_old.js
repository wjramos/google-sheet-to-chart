var chartParams = {
    "dom": "choropleth",
    "id": "choropleth",
    "bodyattrs": "ng-app ng-controller='rChartsCtrl'",
    "width": 800,
    "height": 400,
    "scope": "usa",
    "legend": true,
    "responsive": true,
    "dataType": "json",
    "dataUrl": "data.json",
    "data": {},
    "fills": {
        "A": "#fcfbfd",
        "B": "#efedf5",
        "C": "#dadaeb",
        "D": "#bcbddc",
        "E": "#9e9ac8",
        "F": "#807dba",
        "G": "#6a51a3",
        "H": "#4a1486",
        "defaultFill": "#fff"
    },
    "geographyConfig": {
      "borderWidth": 0,
      //   borderColor: "#FFFFFF",
      //   popupOnHover: true,
      //   popupTemplate: function(geography, data) {
      //     return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
      //   },
      //   fillOpacity: 0.75,
      //   highlightOnHover: true,
      //   highlightFillColor: '#FC8D59',
      //   highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
      //   highlightBorderWidth: 2,
      //   highlightFillOpacity: 0.85
    }
}
chartParams.element = document.getElementById('choropleth')
    // $('choropleth').datamaps(chartParams);

//responsive
$(window).on('resize', function() {
    map.resize();
});

var mapchart_1 = new Datamap(chartParams);



// draw a bubble map if specified
if (chartParams.bubbles) {
    var bubbles = chartParams.bubbles
    mapchart_1.bubbles(bubbles)
}

if (chartParams.labels) {
    mapchart_1.labels()
}

if (chartParams.legend) {
    mapchart_1.legend()
}

setProjection = function(element, options) {
    var projection, path;

    projection = d3.geo.albersUsa()
        .scale(element.offsetWidth)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);

    path = d3.geo.path()
        .projection(projection);

    return {
        path: path,
        projection: projection
    };
}
