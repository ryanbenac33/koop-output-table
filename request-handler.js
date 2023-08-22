/*
  //Author: Ryan Benac
  //USACE MVR ECG
  //Last Updated: 8/10/2023
*/

const winnow = require('@koopjs/winnow')
const _ = require('lodash')
const flatten = require('flat')

/**
 * Handle a request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function requestHandler (req, res) {
  this.model.pull(req, (error, geojson) => {
    if (error) {
      return res.status(error.code || 500).json({ error })
    }

    // send data to winnow; filter the data according to query
    const options = _.cloneDeep(req.query)
    options.toEsri = false
    const filteredGeojson = winnow.query(geojson, options)

    // Extract geojson properties, flatten any nested properties, work with flattened data
    const records = filteredGeojson.features.map(function (feature) {
      return flatten(feature.properties)
    })

    //https://stackoverflow.com/questions/51188542/how-to-build-a-dynamic-html-table-from-json-data-using-node-js
    const row = html => `<tr>\n${html}</tr>\n`,
      heading = object => row(Object.keys(object).reduce((html, heading) => (html + `<th>${heading}</th>`), '')),
      datarow = object => row(Object.values(object).reduce((html, value) => (html + `<td>${value}</td>`), ''));
                               
    function htmlTable(dataList) {
      var header = `${heading(dataList[0])}`
      // define header to exclude from search script
      header = header.replace(`<tr`, `<tr class=header`)
      return `<table id="myTable"><tbody>${header}${dataList.reduce((html, object) => (html + datarow(object)), '')}</tbody></table>`
    }

    // specify table borders (using W3 documentation)
    const head = '<head><script src = "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script></head>'

    // css specification
    const css = `<style> table, th, td {
    border: 1px solid black; 
    border-collapse: collapse;
    } 

    #myInput {
      background-image: url('https://img.icons8.com/search'); 
      background-position: 8px 10px; 
      background-repeat: no-repeat;
      background-size: 25px;
      width: 100%;
      font-size: 16px; 
      padding: 12px 20px 12px 40px;
      border: 1px solid #ddd;
      margin-bottom: 12px;
    }

    #myTable {
      border-collapse: collapse;
      width: 100%; 
      border: 1px solid #ddd; 
      font-size: 18px; 
    }

    #myTable th, #myTable td {
      text-align: left; 
      padding: 12px; 
    } 
    
    #myTable tr {
      border-bottom: 1px solid #ddd;
    } 
    
    #myTable tr.header, #myTable tr:hover {
      background-color: #f1f1f1;
    } </style>`

    // input html
    const search = '<input id="myInput" type="text" onkeyup="myFunction()" placeholder="Search for any value in table...">'

    // script html
    const script = `<script>
    function myFunction() {
        var input, filter, table, tr, td, i, ii;
        input = document.getElementById("myInput");
        filter = input.value.toUpperCase();
        table = document.getElementById("myTable");
        tr = table.querySelectorAll("tbody tr:not(.header)");
        for (i = 0; i < tr.length; i++) {
            var tds = tr[i].getElementsByTagName("td");
            var found = false;
            for (ii = 0; ii < tds.length && !found; ii++) {
                if (tds[ii].textContent.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
            tr[i].style.display = found?"":"none";
        }
    }
    </script>`
    

    //create table from JSON
    const tabled = htmlTable(records)

    // append css
    const styled = '<html>' + head + '<body><h2>Koop-Output-Table</h2>' + css + search + '<br><br>' + tabled + script + '</body>' + '</html>'

    // send it for output
    res.status(200).send(styled)
  })
}

module.exports = requestHandler
