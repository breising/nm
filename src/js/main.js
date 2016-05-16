function readyGo() {
    $(document).ready(function() {

        var view = {}; //object containing view controls not controlled through knockout
        view.markers = []; //array to hold all the map markers
        view.map = null; //an object to contain the map object
        view.infoWindo = null; //an object to contain the infoWindow object
        view.initMap = undefined;

        var noResults = [{ // an alternate 'list' to give user an error when no content is found in the filter
            name: 'No matches found'
        }];

        var locationList = [{ // hard coded list of location data used the create the initial 'new Locations' for the list view. The filter
            //will always filter ONLY this WHOLE list. When a the filter field is empty, the original list will display.
            name: 'Caribou Coffee',
            address: '501 Medlock Bridge Rd',
            city: 'Suwanee',
            state: 'GA',
            distance: null,
            current: false,
            lat: 34.00845306494651,
            lng: -84.19300499023431

        }, {
            name: 'San Franscisco Coffee Roasting Co',
            address: '676 N Highland Ave NE',
            city: 'Atlanta',
            state: null,
            distance: null,
            current: false,
            lat: 33.772911702767,
            lng: -84.352718412257
        }, {
            name: '45 Cafe',
            address: '45 S Peachtree St',
            city: 'Norcross',
            state: 'GA',
            distance: null,
            current: false,
            lat: 33.941786219080,
            lng: -84.21318948855
        }, {
            name: 'Starbucks',
            address: '9700 Medlock Bridge Rd',
            city: 'Duluth',
            state: 'GA',
            distance: null,
            current: false,
            lat: 34.0171,
            lng: -84.19144
        }, {
            name: 'Octane Coffee',
            address: '1009 Marietta St. NW',
            city: 'Atlanta',
            state: 'GA',
            distance: null,
            current: false,
            lat: 33.77932568445548,
            lng: -84.41016912460327
        }];

        var Location = function(data) { // constructor for the inital location list objects... each object from the
            //locationList is used to create a 'new Location'
            var self = this;

            this.name = ko.observable(data.name);
            this.address = ko.observable(data.address);
            this.city = ko.observable(data.city);
            this.state = ko.observable(data.state);
            this.distance = ko.observable(data.distance);
            this.lat = ko.observable(data.lat);
            this.lng = ko.observable(data.lng);
            this.myMarker = '';
            this.isSelected = ko.observable(false); // the class 'selected' is applied when the location is selected.
            // see 'bindings' in index.html
            this.bounceTO = []; // store the setTimeout for the bounce animation in this var so that we can access this
            // specific setTimeout event to cancel it(or not cancel it). Otherwise, the setTimeout used for the infoWindow
            // intereferes with the function of the other and vice versa.

            this.toggleBounce = function() { // animate bounce the marker for this location
                self.centerMap();

                if (self.myMarker.getAnimation() !== null) {
                    self.myMarker.setAnimation(null);
                } else {
                    self.clearBounceTimeOut();
                    self.myMarker.setAnimation(google.maps.Animation.BOUNCE);
                    self.bounceTO.push(setTimeout(function() {
                        self.myMarker.setAnimation(null);
                    }, 1000)); // each marker will bounce for x seconds when it's location is clicked.
                }
            };

            this.centerMap = function(pos) { // center the map on this location
                view.map.setCenter(pos);
            };

            this.infoWindow = function(data) { //create an info window for this location
                //console.log(view.infoWindow);
                if (view.infoWindow.map === null) { // if the infoWindow is not showing then this is null
                    //and we need to recreate the infoWindow
                    view.infoWindow = new google.maps.InfoWindow({
                        map: view.map,
                        pixelOffset: new google.maps.Size(0, -30)
                    });
                }

                var pos = {
                    lat: self.lat(),
                    lng: self.lng()
                };

                if (data.response.venues.length < 1) { // this object is returned from the foursquare server...see self.getFsInfo()

                    view.infoWindow.setContent('There is no FourSquare data on this location.');
                    view.infoWindow.setPosition(pos);

                    self.clearTimeOut(); // remove all timeouts before creating a new one.
                    self.clearInfoWindow(); // remove the existing info window if there is one.
                    self.toggleBounce(); // animate the mapmarker

                    return null; // if there are no locations found on Yelp then just exit the function now else...
                }
                var text1 = data.response.venues[0].contact.formattedPhone;
                var text2 = data.response.venues[0].url;

                if (text1 === '' || text1 === undefined || text1 === null) { // error handling if not data received
                    text1 = 'Sorry, FourSquare cannot find a phone number';
                }
                if (text2 === '' || text2 === undefined || text2 === null) {
                    text2 = 'Sorry, FourSquare cannot find a url';
                }

                var text = self.name() + '....FourSquare says: call them at ' + text1 + '....or  FourSquare says: find them on the web at: ' + text2;
                // above is the text that shows in the infoWindow.
                view.infoWindow.setPosition(pos);
                view.infoWindow.setContent(text);

                self.clearTimeOut();
                self.clearInfoWindow();
                self.toggleBounce();
            };

            this.timeOut = []; // this array is used to store the infoWindow (clears the infoWindow after 10sec)
            //setTimeouts created by clicking on a location or it's marker. You must clear each timeout when you call
            // a new one or else they muck things up.

            this.clearInfoWindow = function() { // clear every info window x sec after it first appears
                self.timeOut.push( // push the timeout to an array so that we have access to it to clear it.
                    setTimeout(function() {
                        view.infoWindow.close();
                    }, 15000)
                );
            };

            this.clearTimeOut = function() { // delete all the timeouts before creating a new one.
                for (var i = 0; i < self.timeOut.length; i++) {
                    clearTimeout(self.timeOut[i]);
                }
            };

            this.clearBounceTimeOut = function() { // delete all the timeouts before creating a new one.
                for (var i = 0; i < self.bounceTO.length; i++) {
                    clearTimeout(self.bounceTO[i]);
                }
            };

            this.fsWait = function(object) { //shows a message to user indicating that we are waiting for foursquare to respond.
                var pos = {
                    lat: object.lat(),
                    lng: object.lng()
                };
                self.clearTimeOut();
                view.infoWindow.setPosition(pos);
                view.infoWindow.setContent('...Waiting for fourSquare');
                self.getFsInfo();
            };

            this.fsFail = function() { // error function for the ajax request to foursquare
                var text = 'FourSquare did not respond to your request. Please try again.';
                var pos = {
                    lat: self.lat(),
                    lng: self.lng()
                };
                view.infoWindow.setPosition(pos);
                view.infoWindow.setContent(text);
                self.centerMap();
            };

            this.getFsInfo = function() { // fetch the data requested from foursquare via ajax
                self.queryFsUrl = ko.observable('https://api.foursquare.com/v2/venues/search?client_id=1ZG2MGU33AXFYJPBZ2JNP1FXHDPBATKXVKKBFCFMKB1ABMNN&client_secret=0B43AA2S0DNA1UZTGGXOY2LXDK3ZFOMZGCSYOVXXWQDHWMTF&v=20130815&ll=' + self.lat() + ',' + self.lng() + '&query=' + self.name());
                $.ajax({
                    url: self.queryFsUrl(),
                    dataType: 'json'
                }).done(function(data) {
                    self.infoWindow(data);
                }).fail(function() {
                    self.fsFail(); // ajax error handling function
                });
            };
        };

        view.bounds = new google.maps.LatLngBounds();

        view.mapMarker = function(object) { // create a map marker for this location
            if (object.lat() === '' || object.lat() === null || object.lat() === undefined) { // if there is no object locatio then return
                return null;
            }

            var latlng = {
                lat: object.lat(),
                lng: object.lng()
            };
            object.myMarker = new google.maps.Marker({
                position: latlng,
                map: view.map,
                title: object.name(),
                draggable: true,
            });

            view.bounds.extend(object.myMarker.position);
            view.markers.push(object.myMarker); // push the marker objects to an array in case we want to access them later to delete them.
        };

        view.removeMarkers = function() { // remove all markers after refreshing the location list.
            for (var i = 0; i < view.markers.length; i++) {
                view.markers[i].setMap(null);
            }
        };

        view.youAreHere = function(pos) { // on inital page load, show author's hard coded location
            view.infoWindow.setPosition(pos);
            view.infoWindow.setContent('You are here.');
            view.map.setCenter(pos);
        };

        view.initMap = function() {
            var pos = {
                lat: 34.0196,
                lng: -84.2025
            };

            view.map = new google.maps.Map(document.getElementsByClassName('map')[0], {
                scrollwheel: false,
                zoom: 9,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.BOTTOM_CENTER
                },
            });

            view.infoWindow = new google.maps.InfoWindow({
                map: view.map,
                pixelOffset: new google.maps.Size(0, -30)
            });

            view.youAreHere(pos);
            view.map.setCenter(pos);

        };

        var ViewModel = function() {
            var self = this;

            this.currLocList = ko.observableArray([]); // this is the main location list displayed

            this.query = ko.observable(''); // this var stores the input from the filter

            this.addListen = function(object) { // add event listener to the object.marker
                if (view.map !== null) {
                    var map = view.map;
                    map.fitBounds(view.bounds);
                }

                if (object.myMarker === '' || object.myMarker === null || object.myMarker === undefined) {
                    return null;
                }
                google.maps.event.addListener(object.myMarker, 'click', function() { // create an event listener for each marker
                    self.currLoc().isSelected(false); // unselect the current selected
                    object.isSelected(true); // select the new selected
                    self.currLoc(object); // set new current location
                    object.fsWait(object); // start the Infowindow process
                    object.toggleBounce(); // make the marker animation bounce.
                });
            };

            this.search = ko.computed(function() {
                view.removeMarkers();
                self.currLocList([]);

                if (self.query() === '') { // if the search box is empty, then reset the whole list and return.
                    view.removeMarkers();
                    for (var i in locationList) {
                        self.currLocList.push(new Location(locationList[i])); // reset the list
                    }
                } else {
                    for (var z in locationList) { // if there is match, create a new list of only the matched locations
                        if (locationList[z].name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
                            self.currLocList.push(new Location(locationList[z]));
                        }
                    }
                    if (self.currLocList().length < 1) { // if there are no matches, but there are chars in the input box, then show message "there are no matches"
                        self.currLocList.push(new Location(noResults[0]));
                    }
                }
                // else
                view.removeMarkers();
                for (var j = 0; j < self.currLocList().length; j++) { //create mapmarkers for each new Location in currLocList
                    view.mapMarker(self.currLocList()[j]); // add mapmarkers to all locations currently in the list
                    self.addListen(self.currLocList()[j]); // add event listeners click to all map markers

                }
            });

            this.currLoc = ko.observable(self.currLocList()[0]); // store the selected / 'current' location here
            this.currLoc().isSelected(true); // 'isSelected' is a ko binding to change the background color of the current location...see html

            this.showInfo = function(click) { // called when user clicks on a LIST item (not a marker)
                self.currLoc().isSelected(false); // css 'unhighlight' the selected
                self.currLoc(click); // set new currLocation
                self.currLoc().isSelected(true); // hightlight the selected location
                self.currLoc().fsWait(click); // set the infoWindow in motion.
            };
            //ViewModel.query.subscribe(ViewModel.search);
            setTimeout(function() { // create a delay here due to other code not completed before makers are trying to be created.
                view.removeMarkers();
                for (var i = 0; i < self.currLocList().length; i++) { //create mapmarkers for each new Location in currLocList
                    view.mapMarker(self.currLocList()[i]); // add mapmarkers to all locations currently in the list
                    self.addListen(self.currLocList()[i]); // add event listeners click to all map markers
                }
            }, 0);
        };
        ko.applyBindings(new ViewModel());
        view.initMap();
    });
}