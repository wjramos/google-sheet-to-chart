// Load the Visualization API and the piechart package.
google.load('visualization', '1', {
    'packages': ['corechart', 'geochart']
});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawCharts);

function drawCharts() {
    var data = []; //Array of chart objects

    $.getJSON('data.json', function(json) {
        $(json.sections).each(function(section) {
            data[section] = new google.visualization.DataTable();
            var labels = $(this)[0]; //first row
            var label;

            //Create headers
            for (label in labels) {
                data[section].addColumn((label.match(/[a-z]/i) ? 'string' : 'number'), label.replace(/[*]/g, '')); //Strip out Asterisks, set to number if it does not contain letters
            }

            // Create & populate rows and cells
            $(json.sections[section]).each(function(row) {
                data[section].addRow();
                $(json.sections[section][row]).each(function(cell) {
                    var cells = json.sections[section][row];
                    var cellValue;
                    var cellIndex = [];

                    for (cellValue in cells) {
                        cellIndex.push((cells[cellValue].match(/[a-z]/i) ? cells[cellValue] : cells[cellValue].replace(/[^0-9.]/g, ''))); //Strip out all non-number, period characters, push values to array
                    }

                    $(cellIndex).each(function(cell) {
                        data[section].setCell(row, cell, cellIndex[cell]);
                    });
                });
            });
        });

        // Instantiate and draw our chart, passing in some options.
        var pieOptions = {
            width: 400,
            height: 240
        };

        var mapOptions = {
            region: 'US',
            resolution: 'provinces',
            colorAxis: {
                colors: ['#4a1486']
            }
        };
        // console.log(data);
        var chart = new google.visualization.PieChart(document.getElementById('chart'));
        var map = new google.visualization.GeoChart(document.getElementById('choropleth'));
        chart.draw(data[1], pieOptions);
        map.draw(data[1], mapOptions);
    });
}
