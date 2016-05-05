$(document).ready(function() {

    var view = {}; //object containing view controls not controlled through knockout
    view.markers = []; //array to hold all the markers in case a reference is needed.
    view.map = null; //an object to contain the map object
    view.infoWindo = null; //an object to contain the infoWindow object

    var markerFlag = false; // if you submit a filter, and the filter finds a match, you must delete the currently
    //displayed list and paint a new one.
    //This flag is set to true when a match is found while looping through all the search arrays and then is set
    //to false (default) again when the search is completed.

    var locationList = [{ // hard coded list of location data used the create the initial 'new Locations' for the list view. The filter
        //will always filter only this whole list. When a the filter field is empty, the original list will display.
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
        this.bounceTO = ''; // store the setTimeout for the bounce animation in this var so that we can access this
        // specific setTimeout event to cancel it(or not cancel it). Otherwise, the setTimeout used for the infoWindow
        // intereferes with the function of the other and vice versa.

        this.toggleBounce = function() {
            self.centerMap();

            if (self.myMarker.getAnimation() !== null) {
                self.myMarker.setAnimation(null);
            } else {
                clearTimeout(self.bounceTO)
                self.myMarker.setAnimation(google.maps.Animation.BOUNCE);
                self.bounceTO = setTimeout(function() {
                    self.myMarker.setAnimation(null);
                }, 2000); // each marker will bounce for two seconds when it's location is clicked.
            }
        }

        this.centerMap = function(pos) {
            view.map.setCenter(pos);
        }

        this.yelpInfoWindow = function(data) { //
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

            if (data.businesses.length < 1) { // this object is returned from the Yelp server...see self.yelpReview()

                view.infoWindow.setContent('There is no Yelp data on this location.');
                view.infoWindow.setPosition(pos);

                self.clearTimeOut();
                self.clearInfoWindow();
                self.toggleBounce();

                return null; // if there are no locations found on Yelp then just exit the function now else...
            }
            var text = self.name() + '....Call us at ' + data.businesses[0].display_phone + '   Yelp rating: ' + data.businesses[0].rating + '   Yelp reviews: ' + data.businesses[0].review_count;
            // above is the text that shows in the infoWindow.
            view.infoWindow.setPosition(pos);
            view.infoWindow.setContent(text);

            self.clearTimeOut();
            self.clearInfoWindow();
            self.toggleBounce();
        }

        this.timeOut = []; // this array is used to store the infoWindow (clears the infoWindow after 10sec)
        //setTimeouts created by clicking on a location or it's marker. You must clear each timeout when you call
        // a new one or else they muck things up.

        this.clearInfoWindow = function() {
            self.timeOut.push(
                setTimeout(function() {
                    view.infoWindow.close();
                }, 10000)
            )
        }

        this.clearTimeOut = function() {
            clearTimeout(self.timeOut[0]); //clears the oldest timeout in the array
            self.timeOut.shift(); // now delete the oldest TO from the array
        }

        this.yelpWait = function(object) { //shows a message to user indicating that we are waiting for Yelp to respond.
            // this one called when you click on a location from the list. The parameters are diff for each.
            var pos = {
                lat: object.lat(),
                lng: object.lng()
            }
            self.clearTimeOut();
            //self.centerMap(pos);
            view.infoWindow.setPosition(pos);
            view.infoWindow.setContent('...Waiting for Yelp');
            //console.log(marker.position.lat());

            self.yelpReview();
        }

        this.yelpFail = function() {
            var text = 'Yelp did not respond to your request. Please try again.'
            var pos = {
                lat: self.lat(),
                lng: self.lng()
            };
            view.infoWindow.setPosition(pos);
            view.infoWindow.setContent(text);
            self.centerMap();
        }

        this.yelpReview = function() {
            var auth = { // authentication for the Yelp api..
                consumerKey: "I07GjG0REpz78zhGxTrDHA",
                consumerSecret: "p32OAV3c5K8WxgIXDNU7x6YV4lk",
                accessToken: "ElUHTwVrFJu6Ug1als3fKlyfHRzdJfW9",
                // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
                // You wouldn't actually want to expose your access token secret like this in a real application.
                accessTokenSecret: "maQQjV8dyKNjerXgtSCSZXjbB4g",
                serviceProvider: {
                    signatureMethod: "HMAC-SHA1"
                }
            }
            var terms = self.name();
            var near = 'Atlanta';
            var accessor = {
                consumerSecret: auth.consumerSecret,
                tokenSecret: auth.accessTokenSecret
            };
            parameters = [];
            parameters.push(['term', terms]);
            parameters.push(['location', near]);
            parameters.push(['callback', 'cb']);
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
            var message = {
                'action': 'http://api.yelp.com/v2/search',
                'method': 'GET',
                'parameters': parameters
            };
            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);
            var parameterMap = OAuth.getParameterMap(message.parameters);
            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

            //IGNORE var queryFsUrl = 'https://api.foursquare.com/v2/venues/search?client_id=1ZG2MGU33AXFYJPBZ2JNP1FXHDPBATKXVKKBFCFMKB1ABMNN&client_secret=0B43AA2S0DNA1UZTGGXOY2LXDK3ZFOMZGCSYOVXXWQDHWMTF&v=20130815&ll=' + lat + ',' + lng + '&query=45coffee';
            //IGNORE var queryYELPurl = 'https://api.yelp.com/v2/search?term=food&ll=' + self.lat() + ',' + self.lng();

            $.ajax({
                'url': message.action,
                'data': parameterMap,
                'cache': true,
                'dataType': 'jsonp',
                'jsonCallback': 'cb',
                success: function(data, textStats, XMLHttpRequests) {
                    self.yelpInfoWindow(data);
                }
            }).fail(function() {
                self.yelpFail(); // error handling function
            });

        }
    }

    view.youAreHere = function(pos) {
        view.infoWindow.setPosition(pos);
        view.infoWindow.setContent('You are here.');
        view.map.setCenter(pos);
    }

    view.initMap = function() {
        var pos = {
            lat: 34.0196,
            lng: -84.2025
        };

        view.map = new google.maps.Map(document.getElementById('map'), {
            /*center: {
                lat: pos.lat,
                lng: pos.lng
            },*/
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

        /*//below uses geolocation to determine users location rather than hardcoding it

        if (navigator.geolocation) { // find the users current location
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log(pos);
                view.youAreHere(pos);

            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }

        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
        } */
    }

    var ViewModel = function() {
        var self = this;

        this.currLocList = ko.observableArray([]);

        this.tempList = ko.observableArray([]); // don't know why this is !! ko does not refresh the view when you push onto the ko array inside of a for loop

        for (var i = 0; i < locationList.length; i++) { // create the ko.observable list of 'new Locations' from the
            // locationList
            self.currLocList().push(new Location(locationList[i]));

        }

        this.mapMarker = function(object) { // create a map marker for this location
            var latlng = {
                lat: object.lat(),
                lng: object.lng()
            };

            object.myMarker = new google.maps.Marker({
                position: latlng,
                map: view.map,
                title: object.name(),
                draggable: true,
                animation: google.maps.Animation.DROP,
            });

            google.maps.event.addListener(object.myMarker, 'click', function() { // create an event listener for each marker
                self.currLoc().isSelected(false); // unselect the current selected
                object.isSelected(true); // select the new selected
                self.currLoc(object); // set new current location
                object.yelpWait(object); // start the YelpInfo window process
                object.toggleBounce(); // make the marker animation bounce.
            })

            view.markers.push(self.myMarker); // push the marker objects to an array in case we want to access them later.
            // currently not using this array.
        }

        for (var i = 0; i < self.currLocList().length; i++) { //create mapmarkers for each new Location in currLocList
            self.mapMarker(self.currLocList()[i]);
        }

        this.submitFilter = function() {
            self.hideMarkers(); // these will be replaced/reset if there is not a match with the filter
            self.currLocList([]); //delete the current list
            self.tempList([]); // delete the temp list
            view.infoWindow.close();
            self.currLoc(); // delete the current location

            var input = $('.input-filter').val();

            if (input === '' || input === undefined || input === null) { // if there is no new input...
                for (var i = 0; i < locationList.length; i++) {
                    self.currLocList().push(new Location(locationList[i])); // then re-create the original list
                }
                self.currLocList(self.currLocList()); // this should refresh automatically but
                //apparently the '.push()' does not register a change in value
                self.resetMarkers();
                return null;
            }
            for (var i in locationList) { //loop through the list of 'Location' objects
                for (var y in locationList[i]) { //loop through the property KEYS of one opbject
                    var bits = String(locationList[i][y]).split(' '); //break the VALUES into separate words stored in a single array (bits)

                    for (var z = 0; z < bits.length; z++) { //loop through the bits to find word that match the input value
                        if (String(bits[z]).toLowerCase() === String(input).toLowerCase()) { // convert everything to strings and lowercase
                            //currLocList = [];
                            if (markerFlag === false) { // default value is false
                                self.changeFlag(); // then if there IS a match, delete the currLocList ONLY on the FIRST run of the loop
                            }
                            self.currLocList.push(new Location(locationList[i])); // so, if there is a match...then create a new Location for
                            //ONLY that object and push it to currLocList to create the new filtered list...repeat.
                        }
                    }
                }
            }
            if (markerFlag === true) { // then you must reset all the markers using the new list bc the old list and markers were deleted.
                self.hideMarkers();
                markers = [];
                self.resetMarkers();
            } else { // no matches were found so don't reset the markers
            }
        }

        this.changeFlag = function() {
            if (markerFlag === false) {
                self.currLocList([]);
                markerFlag = true;
            }
        }

        this.hideMarkers = function() {
            while (markers.length) {
                markers.pop().setMap(null);
            }
        }

        this.resetMarkers = function() {
            for (var i = 0; i < self.currLocList().length; i++) {
                self.currLocList()[i].mapMarker();
            }
            markerFlag = false; // Now reset the flag bc you are finished with the refresh.
        }

        this.currLoc = ko.observable(self.currLocList()[0]); // store the selected / 'current' location here

        this.showInfo = function(click) { // called when user clicks on a LIST item (not a marker)
            self.currLoc().isSelected(false); // unselect the previously selected

            for (var i = 0; i < self.currLocList().length; i++) {
                self.currLocList()[i].isSelected(false);
            }
            click.isSelected(true); // select the new selected
            self.currLoc(click); // set the new currLoc
            click.yelpWait(click); // set the infoWindow in motion.
        }
    }
    view.initMap();
    ko.applyBindings(new ViewModel());

    view.xList = ko.observableArray([]);
})