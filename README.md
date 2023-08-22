# koop-output-table

![Static Badge](https://img.shields.io/badge/koop--output--table-v1.0.0-blue)
Experimental output plugin for any Koop project to turn any dataset into a searchable HTML table. This output works best for testing, viewing, and searching data and should be used in combination with other geospatial output options. More information about Koop can be found on [their main page](https://koopjs.github.io/).

Implemented routes:

- [x] `/table`

## Installation
This output plugin is not yet deployed through npm. Clone this repository to your working folder and ensure it is registered (as shown below).

## Usage
This provider can be registered in a Koop app.

```javascript
const Koop = require("koop");
const ogcTableOutput = require("./koop-output-table");

Koop.register(ogcTableOutput);
```