
$(document).ready(function(){var view={};view.markers=[];view.map=null;view.infoWindo=null;var markerFlag=false;var locationList=[{name:'Caribou Coffee',address:'501 Medlock Bridge Rd',city:'Suwanee',state:'GA',distance:null,current:false,lat:34.00845306494651,lng:-84.19300499023431},{name:'San Franscisco Coffee Roasting Co',address:'676 N Highland Ave NE',city:'Atlanta',state:null,distance:null,current:false,lat:33.772911702767,lng:-84.352718412257},{name:'45 Cafe',address:'45 S Peachtree St',city:'Norcross',state:'GA',distance:null,current:false,lat:33.941786219080,lng:-84.21318948855},{name:'Starbucks',address:'9700 Medlock Bridge Rd',city:'Duluth',state:'GA',distance:null,current:false,lat:34.0171,lng:-84.19144},{name:'Octane Coffee',address:'1009 Marietta St. NW',city:'Atlanta',state:'GA',distance:null,current:false,lat:33.77932568445548,lng:-84.41016912460327}];var Location=function(data){var self=this;this.name=ko.observable(data.name);this.address=ko.observable(data.address);this.city=ko.observable(data.city);this.state=ko.observable(data.state);this.distance=ko.observable(data.distance);this.lat=ko.observable(data.lat);this.lng=ko.observable(data.lng);this.myMarker='';this.isSelected=ko.observable(false);this.bounceTO='';this.toggleBounce=function(){self.centerMap();if(self.myMarker.getAnimation()!==null){self.myMarker.setAnimation(null);}else{clearTimeout(self.bounceTO)
self.myMarker.setAnimation(google.maps.Animation.BOUNCE);self.bounceTO=setTimeout(function(){self.myMarker.setAnimation(null);},2000);}}
this.centerMap=function(pos){view.map.setCenter(pos);}
this.yelpInfoWindow=function(data){if(view.infoWindow.map===null){view.infoWindow=new google.maps.InfoWindow({map:view.map,pixelOffset:new google.maps.Size(0,-30)});}
var pos={lat:self.lat(),lng:self.lng()};if(data.businesses.length<1){view.infoWindow.setContent('There is no Yelp data on this location.');view.infoWindow.setPosition(pos);self.clearTimeOut();self.clearInfoWindow();self.toggleBounce();return null;}
var text=self.name()+'....Call us at '+data.businesses[0].display_phone+'   Yelp rating: '+data.businesses[0].rating+'   Yelp reviews: '+data.businesses[0].review_count;view.infoWindow.setPosition(pos);view.infoWindow.setContent(text);self.clearTimeOut();self.clearInfoWindow();self.toggleBounce();}
this.timeOut=[];this.clearInfoWindow=function(){self.timeOut.push(setTimeout(function(){view.infoWindow.close();},10000))}
this.clearTimeOut=function(){clearTimeout(self.timeOut[0]);self.timeOut.shift();}
this.yelpWait=function(object){var pos={lat:object.lat(),lng:object.lng()}
self.clearTimeOut();view.infoWindow.setPosition(pos);view.infoWindow.setContent('...Waiting for Yelp');self.yelpReview();}
this.yelpFail=function(){var text='Yelp did not respond to your request. Please try again.'
var pos={lat:self.lat(),lng:self.lng()};view.infoWindow.setPosition(pos);view.infoWindow.setContent(text);self.centerMap();}
this.yelpReview=function(){var auth={consumerKey:"I07GjG0REpz78zhGxTrDHA",consumerSecret:"p32OAV3c5K8WxgIXDNU7x6YV4lk",accessToken:"ElUHTwVrFJu6Ug1als3fKlyfHRzdJfW9",accessTokenSecret:"maQQjV8dyKNjerXgtSCSZXjbB4g",serviceProvider:{signatureMethod:"HMAC-SHA1"}}
var terms=self.name();var near='Atlanta';var accessor={consumerSecret:auth.consumerSecret,tokenSecret:auth.accessTokenSecret};parameters=[];parameters.push(['term',terms]);parameters.push(['location',near]);parameters.push(['callback','cb']);parameters.push(['oauth_consumer_key',auth.consumerKey]);parameters.push(['oauth_consumer_secret',auth.consumerSecret]);parameters.push(['oauth_token',auth.accessToken]);parameters.push(['oauth_signature_method','HMAC-SHA1']);var message={'action':'http://api.yelp.com/v2/search','method':'GET','parameters':parameters};OAuth.setTimestampAndNonce(message);OAuth.SignatureMethod.sign(message,accessor);var parameterMap=OAuth.getParameterMap(message.parameters);parameterMap.oauth_signature=OAuth.percentEncode(parameterMap.oauth_signature)
$.ajax({'url':message.action,'data':parameterMap,'cache':true,'dataType':'jsonp','jsonCallback':'cb',success:function(data,textStats,XMLHttpRequests){self.yelpInfoWindow(data);}}).fail(function(){self.yelpFail();});}}
view.youAreHere=function(pos){view.infoWindow.setPosition(pos);view.infoWindow.setContent('You are here.');view.map.setCenter(pos);}
view.initMap=function(){var pos={lat:34.0196,lng:-84.2025};view.map=new google.maps.Map(document.getElementById('map'),{scrollwheel:false,zoom:9,mapTypeControl:true,mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR,position:google.maps.ControlPosition.BOTTOM_CENTER},});view.infoWindow=new google.maps.InfoWindow({map:view.map,pixelOffset:new google.maps.Size(0,-30)});view.youAreHere(pos);view.map.setCenter(pos);}
var ViewModel=function(){var self=this;this.currLocList=ko.observableArray([]);this.tempList=ko.observableArray([]);for(var i=0;i<locationList.length;i++){self.currLocList().push(new Location(locationList[i]));}
this.mapMarker=function(object){var latlng={lat:object.lat(),lng:object.lng()};object.myMarker=new google.maps.Marker({position:latlng,map:view.map,title:object.name(),draggable:true,animation:google.maps.Animation.DROP,});google.maps.event.addListener(object.myMarker,'click',function(){self.currLoc().isSelected(false);object.isSelected(true);self.currLoc(object);object.yelpWait(object);object.toggleBounce();})
view.markers.push(self.myMarker);}
for(var i=0;i<self.currLocList().length;i++){self.mapMarker(self.currLocList()[i]);}
this.submitFilter=function(){self.hideMarkers();self.currLocList([]);self.tempList([]);view.infoWindow.close();self.currLoc();var input=$('.input-filter').val();if(input===''||input===undefined||input===null){for(var i=0;i<locationList.length;i++){self.currLocList().push(new Location(locationList[i]));}
self.currLocList(self.currLocList());self.resetMarkers();return null;}
for(var i in locationList){for(var y in locationList[i]){var bits=String(locationList[i][y]).split(' ');for(var z=0;z<bits.length;z++){if(String(bits[z]).toLowerCase()===String(input).toLowerCase()){if(markerFlag===false){self.changeFlag();}
self.currLocList.push(new Location(locationList[i]));}}}}
if(markerFlag===true){self.hideMarkers();markers=[];self.resetMarkers();}else{}}
this.changeFlag=function(){if(markerFlag===false){self.currLocList([]);markerFlag=true;}}
this.hideMarkers=function(){while(markers.length){markers.pop().setMap(null);}}
this.resetMarkers=function(){for(var i=0;i<self.currLocList().length;i++){self.currLocList()[i].mapMarker();}
markerFlag=false;}
this.currLoc=ko.observable(self.currLocList()[0]);this.showInfo=function(click){self.currLoc().isSelected(false);for(var i=0;i<self.currLocList().length;i++){self.currLocList()[i].isSelected(false);}
click.isSelected(true);self.currLoc(click);click.yelpWait(click);}}
view.initMap();ko.applyBindings(new ViewModel());view.xList=ko.observableArray([]);})