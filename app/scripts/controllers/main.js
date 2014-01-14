'use strict';

vacationsApp.factory('User', function ($rootScope) {
    var userResponse = [];

    return {
        setUser:function (data) {
            userResponse = data;
            //console.log(data);
        },
        getUser:function () {
            return userResponse;
        }
    };
});

vacationsApp.controller("authCtrl", function($scope, $rootScope, $location, fireFactory, User){
    //$rootScope.status = {log: false, name: "", username: ""};

    $rootScope.user = User.getUser(); 

    console.log($rootScope);   

    //$rootScope.user = userService;

    /*$scope.home = function() {
        console.log(1);
        $location.path("/home");        
        console.log(2);
    }*/

    var auth = new FirebaseSimpleLogin(fireFactory.firebaseRef(), function(error, user) {
        if (error) {
            User.setUser(error);
            $rootScope.user = error;

            console.log("=======================");
            console.log("error: ");
            console.log($rootScope.user);
            console.log("=======================");

        } else if (user) {            
            //$rootScope.status = {log: true, name: user.name, username: user.username};
            User.setUser(user);
            $rootScope.user = user;

            console.log("=======================");
            console.log("logou: ");
            console.log($rootScope.user);
            console.log($scope.user);
            console.log("=======================");


            var userRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid);
            userRef.on('value', function(snapshot) {
                if(snapshot.val() == null){
                    console.log('Vazio. Usuário não existe na base! Criar usuário na firebase!');
                    //console.log(snapshot.val());

                    //var placeRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/-Z1hOuUqwertyuiopasa/places");
                    var userRef = fireFactory.firebaseRef("users/");
                    //var newPushRef = userRef.push();

                    userRef.set($rootScope.user.uid, function(){
                        userRef.child($rootScope.user.uid).set({name: $rootScope.user.displayName, uid: $rootScope.user.uid, travels: "", lastTravel: ""}, function(){
                            console.log("USER Adicionado!!!")
                        });
                    });

                    


                }
                else{
                    $rootScope.$apply(function() {
                        // console.log("usuario existente: ");
                        // console.log(snapshot.val());
                        $location.path("/home");
                    });
                }
            });            

            //$location.search('user',$rootScope.user.uid).path('/home');

        } else {            
            User.setUser("");
            $rootScope.user = [];

            console.log("=======================");
            console.log("usuário deslogado");
            console.log("=======================");

            $location.path('/');
        }
        $scope.$apply();
    });

    $scope.login = function(){
        auth.login("facebook");
    }
    $scope.logout = function(){
        auth.logout();
    }
})

vacationsApp.controller("MapCtrl", function($q, $timeout, $scope, $rootScope, $routeParams, User, fireFactory, vacationsData){


    /*for (i in $scope.dataList.travels){
        console.log($scope.dataList.travels[i]);        
        $scope.travel.push($scope.dataList.travels[i]);
    }    
    console.log($scope.travel[0].places);
    */

    $rootScope.user = User.getUser();
    $scope.user = User.getUser();


    /*if(($scope.dataList.lastTravel == undefined) || ($scope.dataList.lastTravel == "")){
        alert("oi");
        for (i in $scope.dataList.travels){
            $scope.dataList.lastTravel = $scope.dataList.travels[i].id;
            break;
        }
        console.log($scope.dataList.lastTravel);
    }*/
    
    


    //$scope."/travels/-Z1hOuUqwertyuiopasa/places";

    //$scope.markers = [];
    $scope.route = {type: "TRANSIT", origin: false, destination: false};

    $rootScope.travel = {$show: false, $edit: false, date: ""};
    //$scope.dataList = [];

    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    // console.log($rootScope.user);
    // console.log($scope.user);
    // console.log($scope);
    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");




    var i;

    // console.log($scope.dataList);
    // console.log($scope.dataList["-A1hOuUqwertyuiopasa"]);

    /*for(i=0; i<$scope.dataList.length; i++){
        console.log($scope.dataList[i]);
        $scope.markers.push($scope.dataList[i]);            
        //console.log($scope.dataList[i]);
    }*/

    // for (i in $scope.dataList){
    //     console.log($scope.dataList[i]);
    //     $scope.markers.push($scope.dataList[i]);            
    //     //console.log($scope.dataList[i]);
    // }

    // console.log($scope);
    // console.log($rootScope);
    // console.log($scope.dataList);


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

    console.log($scope.dataList.lastTravel);
    if(($scope.dataList.lastTravel == undefined) || ($scope.dataList.lastTravel == "")){
        //alert('($scope.dataList.lastTravel == undefined) || ($scope.dataList.lastTravel == "")')
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
    



    /*$scope.submitNewTravel = function(ref) {   
        var lastTravelRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid);
        lastTravelRef.update({lastTravel: ref.date}, function(){
            console.log("Last Travel Adicionado!!!")
        });

        var travelRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/");
        var newPushRef = travelRef.push();

        newPushRef.set({id: newPushRef.name(), date: ref.date, places: ""}, function(){
            console.log("Travel Adicionado!!!")
        });

        $rootScope.travel.$show = false;
    }*/

});


vacationsApp.directive('drawMap', function ($rootScope, $q, vacationsData) {
    return {
        restrict: "A",       
        replace: true, 
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
                        //'{{dataList.lastTravel}}'+
                        /*'<select data-ng-model="dataList.lastTravel">'+
                            //'<option value="">Selecione</option>'+
                            '<option data-ng-repeat="place in dataList.travels" value="{{place.id}}">{{place.id}}</option>'+

                            // '<option value="-Z1hOuUqwertyuiopasa">26</option>'+
                            // '<option value="-Z2hOuUqwertyuiopasa">05</option>'+
                        '</select>'+
                        */
                        '<div>'+                        
                            '<h3>Viagem</h3>'+                        
                            '<div data-ng-hide="travel.$show">'+
                                '<select data-ng-model="dataList.lastTravel" data-ng-options="travel.id as travel.date for (key, travel) in dataList.travels" data-ng-change="drawPin()"></select>'+
                                '<button type="button" data-ng-click="newTravel()">Nova Viagem</button>'+                                
                                //'{{dataList.travels[dataList.lastTravel].date}}'+                                
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
            var map,
                marker,
                infowindow,
                geocoder,
                lat,
                lng,
                latLng = [],
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

            

            scope.codeAddress = function(address) {
                var deferred = $q.defer();
                latLng = [];
              //   var getMessages = function() {
              //   var deferred = $q.defer();

              //   $timeout(function() {
              //     deferred.resolve(['Hello', 'world!']);
              //   }, 2000);

              //   return deferred.promise;
              // };

              // return {
              //   getMessages: getMessages
              // };

                geocoder.geocode( { 'address': address}, function(results, status) {                   
                    //latLng.length = 0;
                    console.log(latLng);
                    if (status == google.maps.GeocoderStatus.OK) {
                        //console.log(results[0].geometry.location.b);
                        /*map.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location
                        });*/

                        // latLng.push(results[0].geometry.location.b);
                        // latLng.push(results[0].geometry.location.d);
                        latLng.push(results[0].geometry.location);
                      
                        console.log(latLng);

                    }
                    else {
                        alert('Geocode was not successful for the following reason: ' + status);
                        //latLng = status;
                    }

                    deferred.resolve(latLng);                    
                });

                latLng.length = 0;
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
                map = new google.maps.Map(document.getElementById('container-map'), mapOptions);
            };

            scope.getPin = function(){
                var defer = $q.defer();

                //limpa os pins
                for (var i = 0; i < pins.length; i++) {
                    pins[i].setMap(null);
                }
                pins = [];
                bgPositionX = 0;

                //cria a tooltip do pin
                infowindow = new google.maps.InfoWindow({
                    maxWidth: 500
                    // position : new google.maps.LatLng(this.position.jb,this.position.kb),
                    // pixelOffset : new google.maps.Size(0,-34),
                    // maxWidth: 50
                });
                
                var arr = [];
                var deferr = $q.defer();

                for (j in scope.dataList.travels[scope.dataList.lastTravel].places){                    
                    arr.length = 0;

                    if((scope.dataList.travels[scope.dataList.lastTravel].places[j].position == "") || (scope.dataList.travels[scope.dataList.lastTravel].places[j].position == undefined)){
                        arr.push(this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[j].address));
                    }
                    else{
                        deferr.resolve(scope.dataList.travels[scope.dataList.lastTravel].places[j].position);
                        arr.push(deferr.promise);   
                    }
                }

                $q.all(arr).then(function(response) {                    
                    // var billingAccounts = data[0];
                    // var shippingAccounts = data[1];

                    cont = 0;
                    for (i in scope.dataList.travels[scope.dataList.lastTravel].places){                    
                        /*if((scope.dataList.travels[scope.dataList.lastTravel].places[i].position != "") && (scope.dataList.travels[scope.dataList.lastTravel].places[i].position != undefined)){
                            lat = scope.dataList.travels[scope.dataList.lastTravel].places[i].position.split(",")[0];
                            lng = scope.dataList.travels[scope.dataList.lastTravel].places[i].position.split(",")[1];
                        }
                        else if((scope.dataList.travels[scope.dataList.lastTravel].places[i].address != "") && (scope.dataList.travels[scope.dataList.lastTravel].places[i].address != undefined)){
                            //alert(this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[i].address));
                            // lat = this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[i].address).b;
                            // lng = this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[i].address).d;

                            //console.log(this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[i].address));
                            // console.log(scope.dataList.travels[scope.dataList.lastTravel].places[i].address);
                            // console.log(lat);
                            // console.log(this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[i].address));
                            this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[i].address).then(function(response){
                                console.log(response);
                                lat = response[0];
                                lng = response[1];
                            });
                            // console.log(lat);
                        }*/

                        /*lat = "";
                        lng = "";

                        console.log(cont);
                        console.log(response[0][cont].b);                        
                        lat = response[0];
                        lng = response[1];*/

                        console.log(scope.dataList.travels[scope.dataList.lastTravel].places[i].position);

                        if((scope.dataList.travels[scope.dataList.lastTravel].places[i].position == "") || (scope.dataList.travels[scope.dataList.lastTravel].places[i].position == undefined)){
                            /*console.log("position vazio");                        
                            arr.push(this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[j].address));
                            */
                            // cria position no banco
                            
                            // this.codeAddress(scope.dataList.travels[scope.dataList.lastTravel].places[j].address).then(function(teste){
                            //     console.log(teste);
                            // });

                            console.log("position vazio");
                            console.log(response[0][0].b);
                            console.log(response[0][0].d);
                            //console.log("response[0][cont].b: "+response[0][cont].b);

                            coords = response[0][0].b +","+ response[0][0].d; 
                            //vacationsData.submitPosition($rootScope.user.uid, scope.dataList.lastTravel, scope.dataList.travels[scope.dataList.lastTravel].places[i].id, coords);
                            vacationsData.submitPosition($rootScope.user.uid, scope.dataList.lastTravel, scope.dataList.travels[scope.dataList.lastTravel].places[i].id, coords);

                            lat = response[0][0].b;
                            lng = response[0][0].d;
                            // lat = response[0][0].split(",")[0];
                            // lng = response[0][0].split(",")[1];
                            console.log("lat: "+lat);
                            console.log("lng: "+lng);
                        }
                        else{
                            lat = scope.dataList.travels[scope.dataList.lastTravel].places[i].position.split(",")[0];
                            lng = scope.dataList.travels[scope.dataList.lastTravel].places[i].position.split(",")[1];
                        }

                        marker = new google.maps.Marker({
                            position : new google.maps.LatLng(lat, lng),
                            map : map,
                            pinId : scope.dataList.travels[scope.dataList.lastTravel].places[i].id,
                            pinName : scope.dataList.travels[scope.dataList.lastTravel].places[i].name,
                            pinAddress : scope.dataList.travels[scope.dataList.lastTravel].places[i].address,
                            pinUrl : scope.dataList.travels[scope.dataList.lastTravel].places[i].url,
                            icon: {url : spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point(bgPositionX,0) },
                            zIndex: 100
                        });

                        google.maps.event.addListener(marker, 'mouseover', function() {
                            infowindow.close(); 
                            infowindow.setContent("<div id='"+ this.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ this.pinUrl +"' target='_blank'>"+ this.pinName +"</a></h3><p>"+ this.pinAddress +"<p></div>"); 
                            infowindow.open(map, this); 
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

                        defer.resolve(pins);
                        console.log("end for");
                    }

                });
                
                return defer.promise;
            };

            $rootScope.drawPin = function(){                

                scope.getPin().then(function(response){
                    var arrayPins = response[0];                    
                    console.log(response[0]);

                    for(i = 0; i < arrayPins.length; i++){
                        console.log(arrayPins[i]);
                        arrayPins[0].setMap(map);
                    }
                });

                
            }

            

            $rootScope.calcRoute = function(){                
                console.log(directionsDisplay);
                directionsDisplay.suppressMarkers = true;
                directionsDisplay.setMap(map);
                directionsDisplay.setPanel(document.getElementById('directions-panel'));

                console.log(scope.route.type);

                
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
                map.setCenter(new google.maps.LatLng(position.split(",")[0], position.split(",")[1]));
                map.setZoom(15);
            };
            
                    
            if(scope.user){
                //console.log("scope.user");
                google.maps.event.addDomListener(window, 'load', scope.initializeMap());
                
                
                $rootScope.drawPin();
                
                
            }
            else{
                //console.log("else scope.user");
            }
            
        }
    }
});


vacationsApp.controller("NavCtrl", function($scope, $rootScope){
    $scope.menu = ["Atrações", "Roteiro"];

    $scope.setPage = function(section) {
        $scope.selected = section;
    }

    $scope.isSelected = function(section) {
        return $scope.selected === section;
    }    
});

vacationsApp.controller("AttractionsCtrl", function($scope, $rootScope, fireFactory, vacationsData){

    //$rootScope.user = User.getUser();

    /*fireFactory.dataRef("place/category", "placeRef").then(function(){
        console.log($rootScope);    
    });
    */

    console.log($rootScope);   

    $scope.dataPlace = {$show: false, $edit: false, position: "", id: "", name: "", address: "", category:"", url: ""};

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
        vacationsData.submitEdit($rootScope.user.uid, $scope.dataList.lastTravel, ref);

        this.cancel();
    }

    $scope.new = function() {
        $scope.dataPlace = vacationsData.new();        
    }

    $scope.submitNew = function(ref) {   
        vacationsData.submitNew($rootScope.user.uid, $scope.dataList.lastTravel, ref);

        this.cancel();
    }
});

vacationsApp.service('vacationsData', function ($rootScope, fireFactory) {
    var storeData = [];

    this.cancel = function() {
        storeData = {$show: false, $edit: false, position: "", id: "", name: "", address: "", category: "", url: ""};
        return storeData;
    },
    this.delete = function (user, travel, id) {
        var idRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places/"+ id);
        idRef.remove(function(){
            console.log("Deletado!!!")
            $rootScope.drawPin();
        });
    },
    this.edit = function(data) {
        storeData = {$show: true, $edit: true, position: data.position, id: data.id, name: data.name, address: data.address, category: data.category, url: data.url};
        return storeData;
    },
    this.submitEdit = function(user, travel, data) {
        var placeRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places/"+ data.id);
        placeRef.update({position: data.position, name: data.name, address: data.address, category: data.category, url: data.url}, function(){
            console.log("Editado!!!")
            $rootScope.drawPin();            
        });
    },
    this.new = function() {
        storeData = {$show: true, $edit: false, position: "", id: "", name: "", address: "", category: "", url: ""};
        return storeData;
    },
    this.submitNew = function(user, travel, data) {
        var placeRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places");
        var newPushRef = placeRef.push();

        newPushRef.set({position: data.position, id: newPushRef.name(), name: data.name, address: data.address, category: data.category, url: data.url}, function(){
            console.log("Adicionado!!!")
            $rootScope.drawPin();            
        });
    },
    this.submitPosition = function(user, travel, place, data) {
        console.log(place);
        console.log(data);

        var placeRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places/"+ place);
        placeRef.update({position: data}, function(){
            console.log("Posição Editado!!!")
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
            console.log("Last Travel Editado!!!")
        });

        var travelRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel);
        travelRef.update({date: data.date}, function(){
            console.log("Travel Editado!!!")
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
            console.log("Travel Adicionado!!!")
        });

        var lastTravelRef = fireFactory.firebaseRef("users/" + user);
        lastTravelRef.update({lastTravel: newPushRef.name()}, function(){
            console.log("Last Travel Adicionado!!!")
        });
    },
    this.deleteTravel = function (user, travel, data) {
        var idRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel);
        idRef.remove(function(){
            console.log("Travel Deletado!!!")
            $rootScope.drawPin();
        });

        var lastTravelRef = fireFactory.firebaseRef("users/" + user);
        lastTravelRef.update({lastTravel: data}, function(){
            console.log("Last Travel Editado!!!")
        });



        
    }    
});


vacationsApp.filter("toArray", function(){
    return function(obj) {
        var result = [];
        angular.forEach(obj, function(val, key) {
            result.push(val);
        });
        return result;
    };
});