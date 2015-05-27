/*************************************

    Gather, parse, save resources

    *****************************/

var currentDate = new Date();
var localJson = 'data.json';
var localTimeout = 12; /* Hours */
var lastAccessed = 20; /* Minutes */


$.getJSON(localJson, function(localData) {
    var localUpdated = new Date(localData.updated);
    if (currentDate - localUpdated < localTimeout * (1000 * 60 * 60)) /* hours to ms */ { //Data is younger than defined timout hours (ms) - don't update
        data = localData;
        data.updated = currentDate;
        // console.log('using local data - newer than ' + localTimout + 'hrs');
    } else {

        // ID of the Google Spreadsheet
        var spreadsheetID = "15MpLQD3yfhAx6aUbEOBcoO4VQ5GvwcZtIC9LyQG3rDA";

        //Sheet of Spreadsheet
        var sheetID = 1;

        //Construct the JSON url
        var url = "https://spreadsheets.google.com/feeds/cells/" + spreadsheetID + "/" + sheetID + "/public/values?alt=json";

        // Make sure it is public or set to Anyone with link can view
        $.ajax({
            url: url,
            dataType: "jsonp",
            success: function(data) {
                var updated = new Date(data.updated);
                console.log(updated - localUpdated);
                if (updated - localUpdated > lastAccessed * (1000 * 60)) /* minutes to ms */ { //Exceeded threshold for time since last access - update, otherwise serve local copy

                    //Setup table arrays
                    var rows = [];
                    var sections = [];

                    //Set Up Structure
                    /*
                    Structure

                    section - All Sections
                    sections[#] - Individual Section (Array)
                    sections[#][#] - Individual Row (Object)
                    sections[#][#][#] - Cell (Object)
                    */

                    // data.feed.entry is an array of objects that represent each cell
                    cells = data.feed.entry;
                    rowCount = data.feed.gs$rowCount.$t;
                    colCount = data.feed.gs$colCount.$t;

                    //Cells to rows based on Row attribute
                    for (var r = 0; r <= rowCount; r++) {
                        rows[r] = $.grep(cells, function(e) {
                            return e.gs$cell.row == r;
                        });
                    }

                    //Section parsing - assign groups of rows to sections delimited by empty rows or rows with only one cell
                    var section = 0;
                    var tmp = [];
                    $(rows).each(function() {
                        if ($(this).length > 0) { //ignore if only one cell

                            tmp.push($(this));

                        } else {
                            //Batch add temporary array of rows to section, reset for next iteration (all only if it contains value)
                            if (tmp.length > 0) {
                                sections[section] = tmp;
                                section++;
                                tmp = [];
                            }
                        }
                        sections[section] = tmp; //add final section
                    });

                    // Clean up
                    //If a row within a section contains fewer number of cells from the rest, treat it as invalid and strip it out
                    $(sections).each(function(section) { //Each Section
                        $(this).each(function(row) { //Each Row
                            if (row < (sections[section].length - 1)) { // Row has a following row
                                if ($(this).length < sections[section][row + 1].length) { //compare lengths
                                    sections[section].splice(row, 1);
                                }
                            } else { //Row is the last row - compare with row before
                                if ($(this).length < sections[section][row - 1].length) { //compare lengths
                                    sections[section].splice(row, 1);
                                }
                            }
                        });
                    });



                    // Map to data set

                    data = {
                        updated: updated,
                        sections: []
                    };
                    sectionLabels = [];

                    $(sections).each(function(section) {

                        //Gather labels as array
                        var labels = [];
                        $(sections[section][0]).each(function(cell) {
                            //Create array of labels for JSON keys/object property labels
                            labels.push($.trim(sections[section][0][cell]['content']['$t']).replace(/\*/g, '/')); //trim trailing and leading white space from cell values and strip asterisks
                        });

                        var rows = [];
                        //Each row to JSON object, append to array of objects
                        $(sections[section]).each(function(row) {
                            if (row > 0) {
                                var rowData = {};

                                //each cell - map to label
                                $(sections[section][row]).each(function(cell) {
                                    rowData[labels[cell]] = $.trim(sections[section][row][cell]['content']['$t']).replace(/\*/g, ''); //trim trailing and leading white space from cell values and strip asterisks
                                });
                                rows.push(rowData);
                            }
                        });
                        //Add rows to sections within JSON
                        data.sections[section] = rows;
                    });
                    console.log('using remote data');

                } else { //Local is the same as server or recently accessed, use local copy, update timestamp of local
                    data = localData;
                    data.updated = currentDate;
                    console.log('using local data - no new remote data');
                }
                // Update local JSON
                $.ajax({
                    type: "POST",
                    dataType: 'json',
                    async: false,
                    url: localJson,
                    data: {
                        data: JSON.stringify(data)
                    }
                });
            }
        });
    }
});
