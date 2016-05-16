
##Neighborhood Map Project: Brian Reising

This repository contains the Neighborhood Map project files for Udacity Front-end Developers course. 


### Build Tools

The files in the 'src' folder were prepared for the 'dist' folder using the task runner Gulp. See the included gulpfile where all the tasks are listed: includes minification/compression of all files (js, css, html) and saving them to their respective locations in the 'dist' folder. Reference to gulp installation and implementation can be found on the [Gulp Website here] (http://gulpjs.com/). Gulp requires prior installation of [npm](https://www.npmjs.com/) and then running `$ npm init` in your root project folder to create a `project.json` file. This file is required by the [Gulp plugins](http://gulpjs.com/plugins/). On the [Gulp Website](https://www.gulpjs.com/), you'll  find all the detailed info you need to install and use Gulp and all the plugins. To 'run' the site, clone the repository https://github.com/breising/portfolio.git. Inside the 'dist' folder you'll find the 'index.html' file to open in a browser.

### Code Organization and Functionality

####Knockout.js

Knockout is used to control the display/udating of all the view changes based on the 'separation of concerns' concept and according to MVVM pattern (knockout.js best practices).

####Organization
Data is limited to one hard coded object 'locationList' which contains a list of my favorite coffee shops close to my home in the burbs of Atlanta with some information about each location.

A constructor function 'Location' is used to create new Location object for display.

A 'view' object handles the inital map functionality.

The ViewModel constructor is used to control the view as per Knockout.js documentation.

FourSquare (third party api) api is accessed via jQuery .ajax to get some info on each 'Location' and this info is displayed in the maps infoWindow when the location or its marker is clicked.

####How to run the app
To run the app open the 'index.html' file in your browser.
To filter the list of locations, enter text into the 'Filter Locations' input box.
To get some info on a location, click on the location in the list or click on its marker on the map.




