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
vacationsApp.controller("HomeAuthCtrl", function($rootScope, $scope, loadData){
    // console.log(loadData);
    // console.log($rootScope.user);

    $scope.dataList = {};

    if(loadData.userData){
        $scope.dataList = loadData.userData;
        $rootScope.user.name = loadData.userData.name;    
    }

    if(loadData.userData){
        $scope.placeCategories = loadData.placeCatData;
    }

    // console.log("=======================");
    // console.log("home logado: ", $rootScope.user);
    // console.log("=======================");

})

vacationsApp.controller("SignupCtrl", function($rootScope, $scope, fireFactory){

    $scope.acount = {username:"", email:"", pass:""};

    $scope.clean = function(){
        $scope.acount = {username:"", email:"", pass:""};
    }
    $scope.createAcount = function(){
        // $scope.acount = {username:"", email:"", pass:""};
        console.log($scope.acount);

        $rootScope.auth.createUser($scope.acount.email, $scope.acount.password, function(error, user) {
            console.log(error);
            if(error){
                //usar aqui o switch
                if(error.code === "EMAIL_TAKEN"){
                    alert("O email escolhido já existe!");
                }
            }
            else if (!error) {
                console.log('User Id: ' + user.uid + ', Email: ' + user.email);

                var usersRef = fireFactory.firebaseRef("users/");

                usersRef.set(user.uid, function(){
                    usersRef.child(user.uid).set({name: $scope.acount.username, email:$scope.acount.email, uid: user.uid, travels: "", lastTravel: ""}, function(){
                        console.log("USER Adicionado!!!")
                    });
                });
            }
        });
    }
})


vacationsApp.controller("authCtrl", function($rootScope, $scope, $location, fireFactory){

    $rootScope.user.uid = undefined;

    $rootScope.auth = new FirebaseSimpleLogin(fireFactory.firebaseRef(), function(error, user) {
        if (error) {

            switch(error.code) {
                case 'INVALID_EMAIL':
                    console.log(error.code);
                    console.log("O email informado é incorreto.");
                case 'INVALID_USER':
                    console.log(error.code);
                    console.log("O usuário informado não existe.");
                case 'INVALID_PASSWORD':
                    console.log(error.code);
                    console.log("A senha informada é inválida.");
                case 'USER_DENIED':
                    console.log(error.code);
                    console.log("O usuário cancelou a autenticação.");
                default:
                    console.log(error.code);
                    console.log("Erro na autenticação");
            }


            // AUTHENTICATION_DISABLED  The specified authentication type is not enabled for this Firebase.
            // EMAIL_TAKEN The specified email address is already in use.
            // INVALID_EMAIL   The specified email address is incorrect.
            // INVALID_FIREBASE    Invalid Firebase specified.
            // INVALID_ORIGIN   Unauthorized request origin, please check application configuration.
            // INVALID_PASSWORD    The specified password is incorrect.
            // INVALID_USER    The specified user does not exist.
            // UNKNOWN_ERROR   An unknown error occurred. Please contact support@firebase.com.
            // USER_DENIED User denied authentication request.


            // console.log("=======================");
            // console.log("Login error: ");
            // console.log($rootScope.user);
            // console.log("=======================");

        } else if (user) {            

            $rootScope.user.uid = user.uid;
            // console.log("=======================");
            // console.log("logou: ");
            // console.log($rootScope.user);
            // console.log("=======================");


            var userRef = fireFactory.firebaseRef("users/" + user.uid);
            userRef.on('value', function(snapshot) {
                if(snapshot.val() == null){
                    // Talvez direcionar o usuário para uma view onde ele preencha um cadastro pra, aí sim, criar o usuário na base.

                    console.log('Vazio. Usuário não existe na base! Criar usuário na firebase!');

                    var userRef = fireFactory.firebaseRef("users/");

                    userRef.set(user.uid, function(){
                        userRef.child(user.uid).set({name: user.displayName, uid: user.uid, travels: "", lastTravel: ""}, function(){
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
            $rootScope.user.uid = undefined;

            // console.log("=======================");
            // console.log("usuário deslogado");
            // console.log("=======================");

            $rootScope.$apply(function() {
                $location.path('/');
            });
        }

        console.log("=======================");
        console.log("logou: ", $rootScope.user.uid);
        console.log("=======================");
    });

    $scope.login = function(){
        $rootScope.auth.login('password', {
            email: $scope.login.email,
            password: $scope.login.password,
            rememberMe: true
        });
    }
    $scope.loginFacebook = function(){
        $rootScope.auth.login("facebook");
    }
    $scope.logout = function(){
        $rootScope.auth.logout();
    }

})

vacationsApp.controller("MapCtrl", function($rootScope, $scope, $filter, $q, vacationsData){
    //returar rootscope e usar apenas scope
    
    $scope.route = {type: "TRANSIT", origin: false, destination: false};

    $scope.travel = {show: false, edit: false, date: ""};
    console.log($scope.travel);

    //escuta pela mudanca das travels para atualizar no model para padrao de data (usando filtro de data)
    $scope.$watch("dataList.travels", function(newValue, oldValue) {        
        angular.forEach($scope.dataList.travels, function(value, key) {
           $scope.dataList.travels[key].date = $filter('date')($scope.dataList.travels[key].date);
        });
    });

    var i,
        getFirstItem = false,
        latIni,
        lngIni;


    angular.forEach($scope.dataList.travels[$scope.dataList.lastTravel].places, function(value, key) {
       if(!getFirstItem){
            getFirstItem = true;
            latIni = value.position.split(',')[0];
            lngIni = value.position.split(',')[1];
        }
    });

    // console.log($scope.dataList.travels[$scope.dataList.lastTravel].places.length);

    $scope.mapOptions = {
        zoom: 10,
        //centerLat: $scope.markers[$scope.markers.length-1].position.split(",")[0],
        // centerLat: "51.5227504",
        //centerLong: $scope.markers[$scope.markers.length-1].position.split(",")[1],     
        // centerLong: "-0.15506379999999353",     

        center: new google.maps.LatLng(latIni, lngIni),
        // center: new google.maps.LatLng($scope.mapOpt.centerLat, $scope.mapOpt.centerLong),
        minZoom: 5,    
        rotateControl: false,
        streetViewControl: false        
    }    

    if(($scope.dataList.lastTravel === undefined) || ($scope.dataList.lastTravel === "")){
        $scope.travel.show = true;
    }

    $scope.codeAddress = function(address) {
        var deferred = $q.defer(),
            geocoder = new google.maps.Geocoder(),
            valGeocode = "";
      
        geocoder.geocode({'address': address}, function(results, status) {                   
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

    $scope.setCenter = function(position){
        $rootScope.map.setCenter(new google.maps.LatLng(position.split(",")[0], position.split(",")[1]));
        $rootScope.map.setZoom(15);
    };

    $scope.cancelTravel = function(){        
        $scope.travel = vacationsData.cancelTravel();
    }

    $scope.newTravel = function(){        
        $scope.travel = vacationsData.newTravel();
    }

    $scope.submitNewTravel = function(ref) { 
        vacationsData.submitNewTravel($rootScope.user.uid, ref);        

        this.cancelTravel();        
    }

    $scope.editTravel = function(travel) {
        $scope.travel = vacationsData.editTravel(travel);
    }

    $scope.submitEditTravel = function(data) {   
        vacationsData.submitEditTravel($rootScope.user.uid, $scope.dataList.lastTravel, data);

        this.cancelTravel();        
    }
    $scope.deleteTravel = function() {
        var newLastTravel,
            keepGoing = true,
            lat,
            lng;

        angular.forEach($scope.dataList.travels, function(value, key) {
           if(keepGoing && (value.id !== $scope.dataList.lastTravel)){
                newLastTravel = value.id;

                angular.forEach($scope.dataList.travels[newLastTravel].places, function(val, k) {
                    if(keepGoing){
                        keepGoing = false;

                        $scope.setCenter(val.position);
                    }
                });
            }
        });
        
        vacationsData.deleteTravel($rootScope.user.uid, $scope.dataList.lastTravel, newLastTravel);

        this.cancelTravel();        
    }
    $scope.submitEditLastTravel = function(ref) {   
        var getFirstItem = false,
            lat,
            lng;

        vacationsData.submitEditLastTravel($rootScope.user.uid, ref);

        angular.forEach($scope.dataList.travels[ref].places, function(value, key) {
           if(!getFirstItem){                
                $scope.setCenter(value.position);

                getFirstItem = true;
            }
        });
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

    $scope.dataPlace = {show: false, $edit: false, $address: "", position: "", id: "", name: "", address: "", category:"", url: ""};

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
        if(ref.address !== ref.$address){
            $scope.codeAddress(ref.address).then(function(responseGeo) {                
                lat = responseGeo.lat();
                lng = responseGeo.lng();
                coords = lat +","+ lng;

                vacationsData.submitEdit($rootScope.user.uid, $scope.dataList.lastTravel, ref, coords);

                $scope.setCenter(coords);
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
        $scope.codeAddress(ref.address).then(function(responseGeo) {
            lat = responseGeo.lat();
            lng = responseGeo.lng();
            coords = lat +","+ lng;

            vacationsData.submitNew($rootScope.user.uid, $scope.dataList.lastTravel, ref, coords);

            $scope.setCenter(coords);
        });

        this.cancel();
    }
});


/*
 *  directive
 */
vacationsApp.directive('drawMap', function ($rootScope) {
    return {
        restrict: "E",       
        replace: true,
        transclude: true,
        scope:{
            map:"@", 
            mapOpt:"=", 
            obj:"=",           


            idCombo: "@",
            idPannel: "@",
            type: "=",
            r: "="
        },
        controller: function($scope, $element, $attrs){
            $rootScope.map = {};

            $scope.places = $scope.obj.travels[$scope.obj.lastTravel].places;
            $scope.showMap = false;
            $scope.spritePinUrl = "../images/sprite_pin.png",
            $scope.pins = {};
            $scope.bgPositionX = 0;
            $scope.arrayPins = {};
            $scope.marker = {};
            $scope.infowindow = new google.maps.InfoWindow({
                maxWidth: 500
            });

            var marker,
                lat,
                lng,
                coords,
                bgPositionX = 0,                
                i,
                j,
                spritePinUrlOrigin = "../images/sprite_pin_origin.png",
                spritePinUrlDestination = "../images/sprite_pin_destination.png";

            var directionsDisplay;
            var directionsService = new google.maps.DirectionsService();                

            

            if($scope.places === '' || $scope.places === undefined){
                $scope.showMap = false;
            }
            else{
                $scope.showMap = true;
            }

            $scope.calcRoute = function(){
                var fieldRoute = document.getElementById($attrs.idCombo),
                    pannelRoute = document.getElementById($attrs.idPannel);

                directionsDisplay.suppressMarkers = true;
                directionsDisplay.setMap($rootScope.map);
                directionsDisplay.setPanel(pannelRoute);

                var request = {
                    durationInTraffic: true,
                    origin: $scope.r.origin,
                    destination: $scope.r.destination,
                    // Note that Javascript allows us to access the constant
                    // using square brackets and a string value as its
                    // "property."
                    travelMode: google.maps.TravelMode[fieldRoute.value]
                };

                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            };

            $scope.removeRoute = function(){
                directionsDisplay.setMap();
                directionsDisplay.setPanel();
            };

            $scope.checkRoute = function(){
                if($scope.r.origin && $scope.r.destination){
                    this.calcRoute();
                }
            };
            
            $scope.createNewPin = function(place){
                lat = place.position.split(",")[0];
                lng = place.position.split(",")[1];

                $scope.marker = new google.maps.Marker({
                    position : new google.maps.LatLng(lat, lng),
                    map : $rootScope.map,
                    pinId : place.id,
                    pinName : place.name,
                    pinAddress : place.address,
                    pinUrl : place.url,
                    icon: {url : $scope.spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point($scope.bgPositionX,0) },
                    zIndex: 100
                });

                $scope.pins.push($scope.marker);

                $scope.bgPositionX += 40;
            }

            $scope.getListPin = function(){

                //limpa os pins
                $scope.places = $scope.obj.travels[$scope.obj.lastTravel].places;
                for (var i = 0; i < $scope.pins.length; i++) {
                    $scope.pins[i].setMap(null);
                }
                $scope.pins = [];
                $scope.bgPositionX = 0;

                //cria os pins para cada lugar
                angular.forEach($scope.places, function(value, key) {
                    $scope.createNewPin(value);
                });
                
                //retorna a listagem de pins
                return $scope.pins;
            };            

            $scope.addTooltip = function(infoW, pin){
                infoW.close(); 
                infoW.setContent("<div id='"+ pin.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ pin.pinUrl +"' target='_blank'>"+ pin.pinName +"</a></h3><p>"+ pin.pinAddress +"<p></div>"); 
                infoW.open($rootScope.map, pin); 
            }

            $scope.selectPin = function(pin){
                if($scope.r.origin == false){
                    $scope.r.origin = pin.position;
                    pin.setIcon({url : spritePinUrlOrigin, size :pin.getIcon().size , origin:new google.maps.Point(pin.getIcon().origin.x,pin.getIcon().origin.y)});    
                }
                //pegar a imagem de um atributo da diretiva
                else if(pin.getIcon().url != "../images/sprite_pin.png"){
                    $scope.r.origin = false;
                    $scope.r.destination = false;
                    $scope.removeRoute();

                    angular.forEach($scope.pins, function(val, k) {
                        val.setIcon({url : $scope.spritePinUrl, size :val.getIcon().size , origin:new google.maps.Point(val.getIcon().origin.x,val.getIcon().origin.y)});
                    });
                }
                else if($scope.r.destination == false){
                    $scope.r.destination = pin.position;
                    pin.setIcon({url : spritePinUrlDestination, size :pin.getIcon().size , origin:new google.maps.Point(pin.getIcon().origin.x,pin.getIcon().origin.y)});

                    $scope.calcRoute();
                }
                else if(pin.getIcon().url != "../images/sprite_pin.png"){
                    $scope.r.destination = false;
                    pin.setIcon({url : $scope.spritePinUrl, size :pin.getIcon().size , origin:new google.maps.Point(pin.getIcon().origin.x,pin.getIcon().origin.y)});    
                }
                else{
                    $scope.r.origin = false;
                    $scope.r.destination = false;
                    $scope.removeRoute();

                    angular.forEach($scope.pins, function(val, k) {
                        val.setIcon({url : $scope.spritePinUrl, size :val.getIcon().size , origin:new google.maps.Point(val.getIcon().origin.x,val.getIcon().origin.y)});
                    });

                    $scope.r.origin = pin.position;
                    pin.setIcon({url : spritePinUrlOrigin, size :pin.getIcon().size , origin:new google.maps.Point(pin.getIcon().origin.x,pin.getIcon().origin.y)});    
                }
            }            

            $scope.drawListPin = function(){
                $scope.arrayPins = $scope.getListPin();                

                angular.forEach($scope.arrayPins, function(value, key) {
                    $scope.arrayPins[0].setMap($rootScope.map);

                    google.maps.event.addListener(value, 'mouseover', function() {
                        $scope.addTooltip($scope.infowindow, this);
                    });

                    google.maps.event.addListener(value, 'click', function() {
                        $scope.selectPin(this);
                    });
                });
            }

            $scope.initializeMap = function(){
                directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});

                $rootScope.map = new google.maps.Map(document.getElementById('container-map'), $scope.mapOpt);
                // $rootScope.map = new google.maps.Map(document.getElementById('container-map'), mapOptions);

                

                // google.maps.event.trigger(iniMap, 'resize');

                // Map.setMap(iniMap);
                // $rootScope.map = Map.getMap(); 

                // console.log(Map.getMap());

                $scope.drawListPin();
            };

            this.drawListPin = $scope.drawListPin;

            this.toggleMap = function(lastT){
                // precisa atualizar o gmaps tb pq quando mostra ele quando ele veio fechado de inicio, ele mostra bugado. De repente fazer ele sempre mostrar e depois verificar e esconder.

                //fazer essa atualização no nova viagem e no delete viagem tb!!!! talvez tenha que passar essa verificação para o controller do mapa, que dessa forma fica acessível aqui dentro também

                if($scope.obj.travels[lastT].places === '' || $scope.obj.travels[lastT].places === undefined){
                    $scope.showMap = false;
                }
                else{
                    $scope.showMap = true;
                }
            }

        },
        // require: "mapRoute",
        //passar o template para templateUrl
        //dividir em algumas firetivas diferentes, como por exemplo a parte da travel, do tipo de rota e do painel de direcoes
        template:   '<div>'+
                        //pegar o id pelo scoope map que é passado (ta bugando pois ele tenta renderizar o mapa antes disso!)
                        '<div id="container-map" data-ng-show="showMap"></div>'+

                        '<div data-ng-hide="showMap">Adicione uma atração pra começar a brincadeira!!!!!!!!!!</div>'+

                        '<div>'+                        
                            '<h3>Tipo de Rota</h3>'+                        
                            '<select id="{{idCombo}}" data-ng-model="r.type" data-ng-change="checkRoute()">'+
                            // '<select id="{{idCombo}}" data-ng-model="r.type" data-ng-change="scope.route.origin && scope.route.destination calcRoute()">'+
                                '<option value="DRIVING">Driving</option>'+
                                '<option value="WALKING">Walking</option>'+
                                '<option value="BICYCLING">Bicycling</option>'+
                                '<option value="TRANSIT">Transit</option>'+
                            '</select>'+
                            // '<button data-ng-click="calcRoute()">Calc Route</button>'+
                            // '<button data-ng-click="removeRoute()">Remove Route</button>'+
                        '</div>'+

                        '<div ng-transclude></div>'+
                        
                    '</div>',
        
        link: function (scope, elem, attrs) {            
            
            

                    
            if($rootScope.user.uid){
                google.maps.event.addDomListener(window, 'load', scope.initializeMap());

                // $scope.drawListPin();


                console.log(scope.obj);

                scope.$watch('obj.travels', function(newValue, oldValue) {
                    console.log('newValue', newValue);
                    console.log('oldValue', oldValue);

                    if (newValue !== oldValue) {
                        // You actions here
                        scope.drawListPin();
                    }
                });

                scope.$watch('obj.lastTravel', function(newValue, oldValue) {
                    // alert('lasttravel atualizado')

                      if (newValue !== oldValue) {
                        // You actions here
                        scope.drawListPin();
                      }
                  });

                // scope.$watch('state', function(newVal, oldVal) {
                //     if (newVal === 'off') {
                //       element.addClass('disabled');
                //     } else {
                //       element.removeClass('disabled');
                //     }
                //   });

            }
            
        }
    }
});

vacationsApp.directive("mapTravel", function($rootScope) {
    return {
        restrict: 'E',
        replace: true,
        require: '^drawMap',
        scope: {
            obj:"=",
            tr:"=",
            newTravel:"&",
            editTravel:"&",
            deleteTravel:"&",
            subNewTravel:"&",
            subEditTravel:"&",
            drawListPin:"&",
            subEditLTravel:"&"
        },
        template:   '<div>'+                        
                        '<h3>Viagem</h3>'+          

                        '<div data-ng-hide="{{tr.show}}">'+
                            '<select data-ng-model="obj.lastTravel" data-ng-options="travel.id as travel.date for (key, travel) in obj.travels" data-ng-change="drawPin()"></select>'+
                            '{{obj.travels[obj.lastTravel].date | date:"shortDate"}}'+
                            '<button type="button" data-ng-click="newTravel()">Nova Viagem</button>'+                                
                            '<button type="button" data-ng-click="editTravel({date:obj.travels[obj.lastTravel].date})">Editar Viagem</button>'+                                
                        '</div>'+

                        '{{obj.lastTravel}}'+
                        '<div data-ng-show="tr.show">'+                                
                            '<form name="formTravel">'+
                                '<div class="form-group" data-ng-class="{error: formTravel.date.$invalid && formTravel.date.$dirty}">'+
                                    '<label class="control-label">Data</label>'+
                                    '<input class="form-control" type="date" placeholder="aaaa-mm-dd" name="date" data-ng-model="tr.date" required>'+
                                    '{{tr.date}} <br>'+
                                    '{{tr.date | date:"shortDate"}}'+
                                '</div>'+
                                '<button class="btn btn-default" type="button" data-ng-show="tr.show" data-ng-click="tr.show = false">Cancelar</button>'+
                                '<button class="btn btn-danger" type="button" data-ng-show="tr.edit" data-ng-click="deleteTravel()">Remover</button>'+
                                '<button class="btn btn-primary" data-ng-hide="tr.edit" data-ng-disabled="formTravel.$invalid" type="button" data-ng-click="subNewTravel({date:tr.date})">Salvar</button>'+
                                '{{tr.date}}'+
                                '<button class="btn btn-primary" data-ng-show="tr.edit" data-ng-disabled="formTravel.$invalid" type="button" data-ng-click="subEditTravel({date:tr.date})">Editar</button>'+
                            '</form>'+
                        '</div>'+
                    '</div>',
        

        link: function (scope, elem, attrs, drawMapCtrl) {

            scope.drawPin = function(){
                drawMapCtrl.drawListPin();                
                scope.subEditLTravel({lastTravel: scope.obj.lastTravel});

                drawMapCtrl.toggleMap(scope.obj.lastTravel);
            }
        }
    };
});

vacationsApp.directive("mapAutocomplete", function($rootScope) {
    return {
        restrict: 'A',        
        link: function (scope, elem, attrs) {
            var field = (document.getElementById(attrs.id)),
                autocomplete = new google.maps.places.Autocomplete(field),
                address;

            //rever esse rootscope.map. Não da pra usar scope? ou pegar o valor de uma factory?
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
    var storeData = {};

    this.cancel = function() {
        storeData = {$show: false, $edit: false, $address: "", position: "", id: "", name: "", address: "", category: "", url: ""};
        return storeData;
    },
    this.delete = function (user, travel, id) {
        var idRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel +"/places/"+ id);
        idRef.remove(function(){
            console.log("Deletado!!!");
            console.log($rootScope);
            // $rootScope.drawListPin();
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
            // $rootScope.drawListPin();
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
            // $rootScope.drawNewPin({address: data.address, category: data.category, id: newPushRef.name(), name: data.name, position: coords, url: data.url});
        });
    },    
    this.cancelTravel = function() {
        storeData = {show: false, edit: false, date: ""};
        return storeData;
    },
    this.editTravel = function(data) {
        storeData = {show: true, edit: true, date: data};
        return storeData;
    },
    this.submitEditTravel = function(user, travel, date) {
        var lastTravelRef = fireFactory.firebaseRef("users/" + user);
        lastTravelRef.update({lastTravel: travel}, function(){
            console.log("Last Travel Editado!!!");
        });

        var travelRef = fireFactory.firebaseRef("users/" + user + "/travels/"+ travel);
        travelRef.update({date: date}, function(){
            console.log("Travel Editado!!!");
        });
    },
    this.newTravel = function() {
        storeData = {show: true, edit: false, date: ""};
        return storeData;
    },
    this.submitNewTravel = function(user, date) {

        var travelRef = fireFactory.firebaseRef("users/" + user + "/travels/");
        var newPushRef = travelRef.push();

        newPushRef.set({id: newPushRef.name(), date: date, places: ""}, function(){
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
            // $rootScope.drawListPin();
        });

        var lastTravelRef = fireFactory.firebaseRef("users/" + user);
        lastTravelRef.update({lastTravel: data}, function(){
            console.log("Last Travel Editado!!!");
        });
    },
    this.submitEditLastTravel = function (user, data){
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