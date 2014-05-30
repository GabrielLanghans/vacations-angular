'use strict';

/*
 *  factory
 */
vacationsApp.factory('Map', function () {
    var map;

    return {
        setMap:function (data) {
            map = data;
        },
        getMap:function () {
            return map;
        }
    };
});



/*
 *  controller
 */
vacationsApp.controller("HomeAuthCtrl", function($scope, loadData){
    console.log(loadData);

    $scope.dataList = loadData.userData;
    $scope.placeCategories = loadData.placeCatData;

})


vacationsApp.controller("authCtrl", function($scope, $rootScope, $location, fireFactory){

    $rootScope.user = [];

    var auth = new FirebaseSimpleLogin(fireFactory.firebaseRef(), function(error, user) {
        if (error) {
            $rootScope.user = error;

            // console.log("=======================");
            // console.log("Login error: ");
            // console.log($rootScope.user);
            // console.log("=======================");

        } else if (user) {            
            $rootScope.user = user;

            // console.log("=======================");
            // console.log("logou: ");
            // console.log($rootScope.user);
            // console.log("=======================");


            var userRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid);
            userRef.on('value', function(snapshot) {
                if(snapshot.val() == null){
                    // Talvez direcionar o usuário para uma view onde ele preencha um cadastro pra, aí sim, criar o usuário na base.

                    console.log('Vazio. Usuário não existe na base! Criar usuário na firebase!');

                    var userRef = fireFactory.firebaseRef("users/");

                    userRef.set($rootScope.user.uid, function(){
                        userRef.child($rootScope.user.uid).set({name: $rootScope.user.displayName, uid: $rootScope.user.uid, travels: "", lastTravel: ""}, function(){
                            console.log("USER Adicionado!!!")
                        });
                    });
                }
                else{
                    $rootScope.$apply(function() {
                        // console.log("usuario existente: ");
                        $location.path("/home");
                    });
                }
            });            

        } else {            
            $rootScope.user = [];

            // console.log("=======================");
            // console.log("usuário deslogado");
            // console.log("=======================");

            $rootScope.$apply(function() {
                $location.path('/');
            });
        }

        console.log($rootScope.user);
    });

    $scope.login = function(){
        auth.login("facebook");
    }
    $scope.logout = function(){
        auth.logout();
    }


})

vacationsApp.controller("MapCtrl", function($scope, $rootScope, vacationsData){
    //returar rootscope e usar apenas scope
    
    $scope.route = {type: "TRANSIT", origin: false, destination: false};

    $rootScope.travel = {$show: false, $edit: false, date: ""};

    var i;

    $scope.options = {
        zoom: 10,
        //centerLat: $scope.markers[$scope.markers.length-1].position.split(",")[0],
        centerLat: "51.5227504",
        //centerLong: $scope.markers[$scope.markers.length-1].position.split(",")[1],     
        centerLong: "-0.15506379999999353",     
        minZoom: 5,    
        rotateControl: false,
        streetViewControl: false        
    }

    if(($scope.dataList.lastTravel == undefined) || ($scope.dataList.lastTravel == "")){
        $rootScope.travel.$show = true;
    }

    $scope.cancelTravel = function(){        
        $rootScope.travel = vacationsData.cancelTravel();
    }

    $scope.newTravel = function(){        
        $rootScope.travel = vacationsData.newTravel();
    }

    $scope.submitNewTravel = function(ref) {   
        vacationsData.submitNewTravel($rootScope.user.uid, ref);        

        this.cancelTravel();        
    }

    $scope.editTravel = function(travel) {
        $rootScope.travel = vacationsData.editTravel(travel);
    }

    $scope.submitEditTravel = function(data) {   
        vacationsData.submitEditTravel($rootScope.user.uid, $scope.dataList.lastTravel, data);

        this.cancelTravel();        
    }
    $scope.deleteTravel = function() {
        var newLastTravel;
        for (i in $scope.dataList.travels){
            if($scope.dataList.travels[i].id != $scope.dataList.lastTravel){
                newLastTravel = $scope.dataList.travels[i].id;
                break;
            }
        }

        vacationsData.deleteTravel($rootScope.user.uid, $scope.dataList.lastTravel, newLastTravel);

        this.cancelTravel();        
    }
});


vacationsApp.controller("NavCtrl", function($scope){
    $scope.menu = ["Atrações", "Roteiro"];

    $scope.setPage = function(section) {
        $scope.selected = section;
    }

    $scope.isSelected = function(section) {
        return $scope.selected === section;
    }    
});

vacationsApp.controller("AttractionsCtrl", function($scope, $rootScope, vacationsData){

    var lat,
        lng,
        coords;

    $scope.dataPlace = {$show: false, $edit: false, $address: "", position: "", id: "", name: "", address: "", category:"", url: ""};

    $scope.cancel = function() {
        $scope.dataPlace = vacationsData.cancel();
    }

    $scope.delete = function(id) {
        vacationsData.delete($rootScope.user.uid, $scope.dataList.lastTravel, id);

        this.cancel();
    }

    $scope.edit = function(ref) {
        $scope.dataPlace = vacationsData.edit(ref);
        
    }

    $scope.submitEdit = function(ref) {
        if(ref.address != ref.$address){
            $rootScope.codeAddress(ref.address).then(function(responseGeo) {                
                lat = responseGeo.lat();
                lng = responseGeo.lng();
                coords = lat +","+ lng;

                vacationsData.submitEdit($rootScope.user.uid, $scope.dataList.lastTravel, ref, coords);
            });
        }
        else{
            coords = ref.position;
            vacationsData.submitEdit($rootScope.user.uid, $scope.dataList.lastTravel, ref, coords);            
        }

        this.cancel();
    }

    $scope.new = function() {
        $scope.dataPlace = vacationsData.new();        
    }

    $scope.submitNew = function(ref) {   
        $rootScope.codeAddress(ref.address).then(function(responseGeo) {
            lat = responseGeo.lat();
            lng = responseGeo.lng();
            coords = lat +","+ lng;

            vacationsData.submitNew($rootScope.user.uid, $scope.dataList.lastTravel, ref, coords);
        });

        this.cancel();
    }
});


/*
 *  directive
 */
vacationsApp.directive('drawMap', function ($rootScope, $q, Map) {
    return {
        restrict: "A",       
        replace: true, 
        //passar o template para templateUrl
        template:   '<div>'+
                        '<div id="container-map"></div>'+
                        '<div id="directions-panel"></div>'+                        
                        '<div>'+                        
                            '<h3>Tipo de Rota</h3>'+                        
                            '<select id="mode" data-ng-model="route.type">'+
                                '<option value="DRIVING">Driving</option>'+
                                '<option value="WALKING">Walking</option>'+
                                '<option value="BICYCLING">Bicycling</option>'+
                                '<option value="TRANSIT">Transit</option>'+
                            '</select>'+
                        '</div>'+                        
                        '<div>'+                        
                            '<h3>Viagem</h3>'+                        
                            '<div data-ng-hide="travel.$show">'+
                                '<select data-ng-model="dataList.lastTravel" data-ng-options="travel.id as travel.date for (key, travel) in dataList.travels" data-ng-change="drawListPin()"></select>'+
                                '<button type="button" data-ng-click="newTravel()">Nova Viagem</button>'+                                
                                '<button type="button" data-ng-click="editTravel(dataList.travels[dataList.lastTravel].date)">Editar Viagem</button>'+                                
                            '</div>'+

                            '{{dataList.lastTravel}}'+
                            '<div data-ng-show="travel.$show">'+                                
                                '<form name="formTravel">'+
                                    '<div class="form-group" data-ng-class="{error: formTravel.date.$invalid && formTravel.date.$dirty}">'+
                                        '<label class="control-label">Data</label>'+
                                        '<input class="form-control" type="date" name="date" type="date" data-ng-model="travel.date" required>'+
                                    '</div>'+
                                    '<button class="btn btn-default" type="button" data-ng-show="travel.$show" data-ng-click="travel.$show = false">Cancelar</button>'+
                                    '<button class="btn btn-danger" type="button" data-ng-show="travel.$edit" data-ng-click="deleteTravel()">Remover</button>'+
                                    '<button class="btn btn-primary" data-ng-hide="travel.$edit" data-ng-disabled="formTravel.$invalid" type="button" data-ng-click="submitNewTravel({date:travel.date})">Salvar</button>'+
                                    '<button class="btn btn-primary" data-ng-show="travel.$edit" data-ng-disabled="formTravel.$invalid" type="button" data-ng-click="submitEditTravel({date:travel.date})">Editar</button>'+
                                '</form>'+
                            '</div>'+
                        '</div>'+
                        // '<button data-ng-click="calcRoute()">Calc Route</button>'+
                        // '<button data-ng-click="removeRoute()">Remove Route</button>'+
                    '</div>',


        
        
        link: function (scope, elem, attrs) {
            var marker,
                infowindow,
                geocoder,
                lat,
                lng,
                valGeocode,
                coords,
                pins = [],
                bgPositionX = 0,
                spritePinUrl = "../images/sprite_pin.png",
                spritePinUrlOrigin = "../images/sprite_pin_origin.png",
                spritePinUrlDestination = "../images/sprite_pin_destination.png",                
                i,
                j,
                cont = 0;

            var directionsDisplay;
            var directionsService = new google.maps.DirectionsService();    
            geocoder = new google.maps.Geocoder();        


            $rootScope.drawNewPin = function(pinData){
                var defer = $q.defer();                
                
                //cria a tooltip do pin
                infowindow = new google.maps.InfoWindow({
                    maxWidth: 500
                });
                
                lat = pinData.position.split(",")[0];
                lng = pinData.position.split(",")[1];

                marker = new google.maps.Marker({
                    position : new google.maps.LatLng(lat, lng),
                    map : $rootScope.map,
                    pinId : pinData.id,
                    pinName : pinData.name,
                    pinAddress : pinData.address,
                    pinUrl : pinData.url,
                    icon: {url : spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point(bgPositionX,0) },
                    zIndex: 100
                });

                google.maps.event.addListener(marker, 'mouseover', function() {
                    infowindow.close(); 
                    infowindow.setContent("<div id='"+ this.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ this.pinUrl +"' target='_blank'>"+ this.pinName +"</a></h3><p>"+ this.pinAddress +"<p></div>"); 
                    infowindow.open($rootScope.map, this); 
                });

                
                google.maps.event.addListener(marker, 'click', function() {
                    if(scope.route.origin == false){
                        scope.route.origin = this.position;
                        this.setIcon({url : spritePinUrlOrigin, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});    
                    }
                    else if(this.getIcon().url != "../images/sprite_pin.png"){
                        scope.route.origin = false;
                        scope.route.destination = false;
                        $rootScope.removeRoute();

                        for (var i = 0; i < pins.length; i++) {
                            pins[i].setIcon({url : spritePinUrl, size :pins[i].getIcon().size , origin:new google.maps.Point(pins[i].getIcon().origin.x,pins[i].getIcon().origin.y)});
                        }                            
                    }
                    else if(scope.route.destination == false){
                        scope.route.destination = this.position;
                        this.setIcon({url : spritePinUrlDestination, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});

                        $rootScope.calcRoute();
                    }
                    else if(this.getIcon().url != "../images/sprite_pin.png"){
                        scope.route.destination = false;
                        this.setIcon({url : spritePinUrl, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});    
                    }
                    else{
                        scope.route.origin = false;
                        scope.route.destination = false;
                        $rootScope.removeRoute();

                        for (var i = 0; i < pins.length; i++) {
                            pins[i].setIcon({url : spritePinUrl, size :pins[i].getIcon().size , origin:new google.maps.Point(pins[i].getIcon().origin.x,pins[i].getIcon().origin.y)});
                        }                            

                        scope.route.origin = this.position;
                        this.setIcon({url : spritePinUrlOrigin, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});    
                    }
                });

                pins.push(marker);

                bgPositionX += 40;

                marker.setMap($rootScope.map);           

                $rootScope.setCenter(pinData.position);
            }


            //fazer uma diretiva pra isso? Talvez um controller ou service!
            $rootScope.codeAddress = function(address) {
                var deferred = $q.defer();
                valGeocode = "";
              
                geocoder.geocode( { 'address': address}, function(results, status) {                   
                    if (status == google.maps.GeocoderStatus.OK) {
                        
                        valGeocode = results[0].geometry.location;
                    }
                    else {
                        alert('Geocode was not successful for the following reason: ' + status);
                    }

                    deferred.resolve(valGeocode);                    
                });

                return deferred.promise;                
            }

            scope.initializeMap = function(){
                var mapOptions = {
                    zoom: scope.options.zoom,
                    center: new google.maps.LatLng(scope.options.centerLat, scope.options.centerLong),
                    minZoom: scope.options.minZoom,
                    rotateControl: scope.options.rotateControl,
                    streetViewControl: scope.options.streetViewControl
                };
                
                directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});

                var iniMap = new google.maps.Map(document.getElementById('container-map'), mapOptions);
                Map.setMap(iniMap);
            };

            scope.getListPin = function(){
                var places = scope.dataList.travels[scope.dataList.lastTravel].places;

                //limpa os pins
                for (var i = 0; i < pins.length; i++) {
                    pins[i].setMap(null);
                }
                pins = [];
                bgPositionX = 0;

                //cria a tooltip do pin
                infowindow = new google.maps.InfoWindow({
                    maxWidth: 500
                });

                
                for (i in places){                    

                    lat = places[i].position.split(",")[0];
                    lng = places[i].position.split(",")[1];

                    marker = new google.maps.Marker({
                        position : new google.maps.LatLng(lat, lng),
                        map : $rootScope.map,
                        pinId : places[i].id,
                        pinName : places[i].name,
                        pinAddress : places[i].address,
                        pinUrl : places[i].url,
                        icon: {url : spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point(bgPositionX,0) },
                        zIndex: 100
                    });

                    google.maps.event.addListener(marker, 'mouseover', function() {
                        infowindow.close(); 
                        infowindow.setContent("<div id='"+ this.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ this.pinUrl +"' target='_blank'>"+ this.pinName +"</a></h3><p>"+ this.pinAddress +"<p></div>"); 
                        infowindow.open($rootScope.map, this); 
                    });

                    
                    google.maps.event.addListener(marker, 'click', function() {
                        if(scope.route.origin == false){
                            scope.route.origin = this.position;
                            this.setIcon({url : spritePinUrlOrigin, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});    
                        }
                        else if(this.getIcon().url != "../images/sprite_pin.png"){
                            scope.route.origin = false;
                            scope.route.destination = false;
                            $rootScope.removeRoute();

                            for (var i = 0; i < pins.length; i++) {
                                pins[i].setIcon({url : spritePinUrl, size :pins[i].getIcon().size , origin:new google.maps.Point(pins[i].getIcon().origin.x,pins[i].getIcon().origin.y)});
                            }                            
                        }
                        else if(scope.route.destination == false){
                            scope.route.destination = this.position;
                            this.setIcon({url : spritePinUrlDestination, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});

                            $rootScope.calcRoute();
                        }
                        else if(this.getIcon().url != "../images/sprite_pin.png"){
                            scope.route.destination = false;
                            this.setIcon({url : spritePinUrl, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});    
                        }
                        else{
                            scope.route.origin = false;
                            scope.route.destination = false;
                            $rootScope.removeRoute();

                            for (var i = 0; i < pins.length; i++) {
                                pins[i].setIcon({url : spritePinUrl, size :pins[i].getIcon().size , origin:new google.maps.Point(pins[i].getIcon().origin.x,pins[i].getIcon().origin.y)});
                            }                            

                            scope.route.origin = this.position;
                            this.setIcon({url : spritePinUrlOrigin, size :this.getIcon().size , origin:new google.maps.Point(this.getIcon().origin.x,this.getIcon().origin.y)});    
                        }
                    });

                    pins.push(marker);

                    bgPositionX += 40;

                    cont++;                 
                }
                return pins;
            };

            $rootScope.drawListPin = function(){                
                var arrayPins = scope.getListPin();                    

                for(i = 0; i < arrayPins.length; i++){
                    arrayPins[0].setMap($rootScope.map);
                }
            }            

            //fazer uma diretiva pra isso? Talvez um controller ou service!
            $rootScope.calcRoute = function(){                
                directionsDisplay.suppressMarkers = true;
                directionsDisplay.setMap($rootScope.map);
                directionsDisplay.setPanel(document.getElementById('directions-panel'));

                //que porra é essa?
                var haight = new google.maps.LatLng(51.5034412,-0.119678199999953);
                var oceanBeach = new google.maps.LatLng(51.4034412,-0.109678199999953);

                var selectedMode = document.getElementById('mode').value;
                var request = {
                    durationInTraffic: true,
                    origin: scope.route.origin,
                    destination: scope.route.destination,
                    // Note that Javascript allows us to access the constant
                    // using square brackets and a string value as its
                    // "property."
                    travelMode: google.maps.TravelMode[selectedMode]
                };

                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            }

            $rootScope.removeRoute = function(){
                directionsDisplay.setMap();
                directionsDisplay.setPanel();
            };

            $rootScope.setCenter = function(position){
                $rootScope.map.setCenter(new google.maps.LatLng(position.split(",")[0], position.split(",")[1]));
                $rootScope.map.setZoom(15);
            };           
                    
            if(scope.user){
                google.maps.event.addDomListener(window, 'load', scope.initializeMap());
                $rootScope.map = Map.getMap(); 
                
                $rootScope.drawListPin();
            }
            else{
                //console.log("else scope.user");
            }
            
        }
    }
});

vacationsApp.directive("mapAutocomplete", function($rootScope) {
    return {
        restrict: 'A',        
        link: function (scope, elem, attrs) {
            var field = (document.getElementById(attrs.id)),
                autocomplete = new google.maps.places.Autocomplete(field),
                address;

            //rever esse rootscope.map. Não da pra usar scope?
            autocomplete.bindTo('bounds', $rootScope.map);

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();

                if (!place.geometry) {
                    return;
                }

                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                $rootScope.$apply(function() {
                    scope.dataPlace.$address = place.name +", "+ address;
                    scope.dataPlace.name = place.name;
                });
            });
        }
    };
});


/*
 *  service
 */
//talvez separar em dois serviços os dados das atraçoes e os dados das "travels"
vacationsApp.service('vacationsData', function ($rootScope, fireFactory) {
    var storeData = [];

    this.cancel = function() {
        storeData = {$show: false, $edit: false, $address: "", position: "", id: "", name: "", address: "", category: "", url: ""};
        return storeData;
    },
    this.delete = function (user, travel, id) {
        var idRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places/"+ id);
        idRef.remove(function(){
            console.log("Deletado!!!");
            $rootScope.drawListPin();
        });
    },
    this.edit = function(data) {
        storeData = {$show: true, $edit: true, $address: data.address, position: data.position, id: data.id, name: data.name, address: data.address, category: data.category, url: data.url};
        return storeData;
    },
    this.submitEdit = function(user, travel, place, data) {
        var placeRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places/"+ place.id);      

        placeRef.update({position: data, name: place.name, address: place.address, category: place.category, url: place.url}, function(){
            console.log("Editado!!!");
            $rootScope.drawListPin();
        });
    },
    this.new = function() {
        storeData = {$show: true, $edit: false, $address: "", position: "", id: "", name: "", address: "", category: "", url: ""};
        return storeData;
    },
    this.submitNew = function(user, travel, data, coords) {
        var placeRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places");
        var newPushRef = placeRef.push();

        newPushRef.set({position: coords, id: newPushRef.name(), name: data.name, address: data.address, category: data.category, url: data.url}, function(){
            console.log("Adicionado!!!");
            $rootScope.drawNewPin({position: coords, id: newPushRef.name(), name: data.name, address: data.address, category: data.category, url: data.url});
        });
    },    
    this.cancelTravel = function() {
        storeData = {$show: false, $edit: false, date: ""};
        return storeData;
    },
    this.editTravel = function(data) {
        storeData = {$show: true, $edit: true, date: data};
        return storeData;
    },
    this.submitEditTravel = function(user, travel, data) {
        var lastTravelRef = fireFactory.firebaseRef("users/" + user);
        lastTravelRef.update({lastTravel: travel}, function(){
            console.log("Last Travel Editado!!!");
        });

        var travelRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel);
        travelRef.update({date: data.date}, function(){
            console.log("Travel Editado!!!");
        });
    },
    this.newTravel = function() {
        storeData = {$show: true, $edit: false, date: ""};
        return storeData;
    },
    this.submitNewTravel = function(user, data) {
        var travelRef = fireFactory.firebaseRef("users/" + user + "/travels/");
        var newPushRef = travelRef.push();

        newPushRef.set({id: newPushRef.name(), date: data.date, places: ""}, function(){
            console.log("Travel Adicionado!!!");
        });

        var lastTravelRef = fireFactory.firebaseRef("users/" + user);
        lastTravelRef.update({lastTravel: newPushRef.name()}, function(){
            console.log("Last Travel Adicionado!!!");
        });
    },
    this.deleteTravel = function (user, travel, data) {
        var idRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel);
        idRef.remove(function(){
            console.log("Travel Deletado!!!");
            $rootScope.drawListPin();
        });

        var lastTravelRef = fireFactory.firebaseRef("users/" + user);
        lastTravelRef.update({lastTravel: data}, function(){
            console.log("Last Travel Editado!!!");
        });
    }    
});


/*
 *  filter
 */
vacationsApp.filter("toArray", function(){
    return function(obj) {
        var result = [];
        angular.forEach(obj, function(val, key) {
            result.push(val);
        });
        return result;
    };
});