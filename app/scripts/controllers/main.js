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

    $rootScope.travel = {$show: false, date: ""};

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

            if(($scope.dataList.lastTravel == undefined) || ($scope.dataList.lastTravel == "")){
                $rootScope.travel.$show = true;
            }

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

vacationsApp.controller("MapCtrl", function($q, $timeout, $scope, $rootScope, $routeParams, User, fireFactory){


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
	    minZoom: 7,    
	    rotateControl: false,
	    streetViewControl: false	    
	}

    $scope.submitNewTravel = function(ref) {   
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
    }

});


vacationsApp.directive('drawMap', function ($rootScope) {
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
                                '<button type="button">Nova Viagem</button>'+
                            '</div>'+
                            '<div data-ng-show="travel.$show">'+
                                '{{dataList.lastTravel}}'+
                                '<form name="formTravel">'+
                                    '<div class="form-group" data-ng-class="{error: formTravel.date.$invalid && formTravel.date.$dirty}">'+
                                        '<label class="control-label">Data</label>'+
                                        '<input class="form-control" type="date" name="date" type="date" data-ng-model="travel.date" required>'+
                                    '</div>'+
                                    '<button class="btn btn-primary" data-ng-disabled="formTravel.$invalid" type="button" data-ng-click="submitNewTravel({date:travel.date})">Nova Viagem</button>'+
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
            	pins = [],
            	bgPositionX = 0,
                spritePinUrl = "../images/sprite_pin.png",
                spritePinUrlOrigin = "../images/sprite_pin_origin.png",
            	spritePinUrlDestination = "../images/sprite_pin_destination.png",
            	i;

            var directionsDisplay;
            var directionsService = new google.maps.DirectionsService();            

            

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
                

                for (i in scope.dataList.travels[scope.dataList.lastTravel].places){
                    marker = new google.maps.Marker({
                        position : new google.maps.LatLng(scope.dataList.travels[scope.dataList.lastTravel].places[i].position.split(",")[0], scope.dataList.travels[scope.dataList.lastTravel].places[i].position.split(",")[1]),
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
                }
                
				return pins;
			};

			$rootScope.drawPin = function(){
				var arrayPins = scope.getPin();

				for(i = 0; i < arrayPins.length; i++){
			        //console.log(arrayPins[i]);
			        arrayPins[i].setMap(map);
			    }
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

    //$rootScope.user = User.getUser();
    $scope.menu = ["Atrações", "Roteiro"];

    $scope.setPage = function(section) {
        $scope.selected = section;
        //alert($scope.selected);
    }

    $scope.isSelected = function(section) {
        return $scope.selected === section;
    }

    console.log($scope.dataList);
    
    

    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    // console.log($rootScope.user);
    // console.log($scope.user);
    // console.log($scope);
    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

    
});

vacationsApp.controller("AttractionsCtrl", function($scope, $rootScope, fireFactory){

    //$rootScope.user = User.getUser();

    $scope.dataPlace = {$show: false, $edit: false, position: "", id: "", name: "", address: "", url: ""};

    //{"position":"51.50134,-0.141883", "id":"-C1hOuUqwertyuiopasa", "name":"Buckingham Palace", "address":"London SW1A 1AA, Reino Unido", "url":"http://www.royal.gov.uk/theroyalresidences/buckinghampalace/buckinghampalace.aspx"}
    

    //FALTA CONFIGURAR O AUTH NA FIREBASE PARA PERMITIR A EDIÇÃO APENAS QUANDO O USUÁRIO CORRETO ESTIVER LOGADO. TALVEZ SÓ PERMITIR LEITURA NESSAS CONDIÇÕES TAMBÉM

    $scope.cancel = function() {
        $scope.dataPlace = {$show: false, $edit: false, position: "", id: "", name: "", address: "", url: ""};
    }

    //$rootScope.travel[0].id

    $scope.delete = function(id) {
        var idRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/"+ $scope.dataList.lastTravel +"/places/"+ id);
        idRef.remove(function(){
            $rootScope.drawPin();
        });
        //this.reloadPin();

        //alert(id);

        this.cancel();

    }

    $scope.edit = function(ref) {
        $scope.dataPlace = {$show: true, $edit: true, position: ref.position, id: ref.id, name: ref.name, address: ref.address, url: ref.url};
    }

    $scope.submitEdit = function(ref) {   
        console.log(ref);
        var placeRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/"+ $scope.dataList.lastTravel +"/places/"+ ref.id);
        /*idRef.remove(function(){
            $rootScope.drawPin();
        });*/        
        /*placeRef.child('position').set(ref.position);
        placeRef.child('name').set(ref.name);
        placeRef.child('address').set(ref.address);
        placeRef.child('url').set(ref.url);
        */

        placeRef.update({position: ref.position, name: ref.name, address: ref.address, url: ref.url}, function(){
            console.log("Editado!!!")
            $rootScope.drawPin();            
        });

        // FALTA ATUALIZAR OS PINS NO CALLBACK DE INSERIR

        this.cancel();
    }

    $scope.new = function() {
        $scope.dataPlace = {$show: true, $edit: false, position: "", id: "", name: "", address: "", url: ""};
    }

    $scope.submitNew = function(ref) {   
        console.log($scope.dataList.lastTravel);

        var placeRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/"+ $scope.dataList.lastTravel +"/places");
        //var placeRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/"+ $rootScope.travel[0].id +"/places");

        //var placeRef = fireFactory.firebaseRef("users/facebook:100007322078152/travels/-Z3hOuUqwertyuiopasa/places");
        var newPushRef = placeRef.push();

        newPushRef.set({position: ref.position, id: newPushRef.name(), name: ref.name, address: ref.address, url: ref.url}, function(){
            console.log("Adicionado!!!")
            $rootScope.drawPin();            
        });

        this.cancel();
    }



    

    /*
    evento para quando remove  um filho. Não funcionou muito bem pois não dispara a primeira vez. Fiz algo errado? TALVEZ DENTRO DE $rootScope.$apply(function() { FUNCIONE ;)
    var placesRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/0/places/");
    placesRef.on('child_removed', function(snapshot) {
      //var userName = snapshot.name(), userData = snapshot.val();
      //alert('User ' + userName + ' has left the chat.');
      console.log("Removido. Atualizando os pins!");
      $rootScope.drawPin();
    });
    */

    /*var placesRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/-Z1hOuUqwertyuiopasa/places/");
    placesRef.on('child_changed', function(snapshot) {
      //var userName = snapshot.name(), userData = snapshot.val();
      //alert('User ' + userName + ' has left the chat.');
      //$rootScope.$apply(function() {
            alert("oioiioioi");
          console.log("Editado. Atualizando os pins!");

          $rootScope.drawPin();
      //});
    });*/

    console.log($scope)


    
});
