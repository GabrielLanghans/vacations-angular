'use strict';


// ALTERNATIVAS:
/*
- carregar os dados da firebase no routeprovider (como esta sendo feito hj) e depois só ler os dados do usuario logado na directive

- apenas carregar os dados após logado e talvez apenas do usuário que se logou.

- de qualquer forma, para salvar os dados a permissão só será concedida se o user for correto.



*/


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
                        userRef.child($rootScope.user.uid).set({name: $rootScope.user.displayName, uid: $rootScope.user.uid, travels: ""}, function(){
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
        //$scope.$apply();
    });

    $scope.login = function(){
        auth.login("facebook");
    }
    $scope.logout = function(){
        auth.logout();
    }
})

vacationsApp.controller("MapCtrl", function($q, $timeout, $scope, $rootScope, $routeParams, User){

    $rootScope.user = User.getUser();
    $scope.user = User.getUser();
    $scope.markers = [];
    //$scope.dataList = [];

    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    // console.log($rootScope.user);
    // console.log($scope.user);
    // console.log($scope);
    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

    var i;

    console.log($scope.dataList);
    console.log($scope.dataList["-A1hOuUqwertyuiopasa"]);

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
    
});

// function startWatch($scope) {
//     $scope.addMarker = function() {
//         console.log($scope.newMarker);
//         $scope.markers.push($scope.newMarker);
//         $scope.newMarker = '';
//     }
// }


vacationsApp.directive('drawMap', function ($rootScope, Markers) {
	return {
        restrict: "A",       
        replace: true, 
    	template:   "<div id='map-directive'>"+
                        "<div id='container-map'></div>"+
                        "<div id='list'>"+
                            "<span data-ng-repeat='teste in dataList' class='teste' data-att='{{teste}}'>{{teste}}</span>"+
                        "</div>"+
                    "</div>",
        
        link: function (scope, elem, attrs) {
            /*var map,
                marker,*/
            var marker,
            	infowindow,
            	pins = [],
            	bgPositionX = 0,
            	spritePinUrl = "../images/sprite_pin.png",
            	i;

            

            scope.initializeMap = function(){
				var mapOptions = {
					zoom: scope.options.zoom,
					center: new google.maps.LatLng(scope.options.centerLat, scope.options.centerLong),
					minZoom: scope.options.minZoom,
					rotateControl: scope.options.rotateControl,
					streetViewControl: scope.options.streetViewControl
				};

                //map = new google.maps.Map(document.getElementById('container-map'), mapOptions);
                Markers.setMap('container-map', mapOptions);				
			};

			$rootScope.getPin = function(){
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

                
                console.log("====== scope.dataList: =======");
                console.log(scope.dataList);
                console.log("====== scope.dataList/END =======");

                /*for (i in scope.dataList){
                    marker = new google.maps.Marker({
                        position : new google.maps.LatLng(scope.dataList[i].position.split(",")[0], scope.dataList[i].position.split(",")[1]),
                        map : Markers.getMap(),
                        pinId : scope.dataList[i].id,
                        pinName : scope.dataList[i].name,
                        pinAddress : scope.dataList[i].address,
                        pinUrl : scope.dataList[i].url,
                        icon: {url : spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point(bgPositionX,0) },
                        zIndex: 100
                    });

                    google.maps.event.addListener(marker, 'mouseover', function() {
                        infowindow.close(); 
                        infowindow.setContent("<div id='"+ this.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ this.pinUrl +"' target='_blank'>"+ this.pinName +"</a></h3><p>"+ this.pinAddress +"<p></div>"); 
                        infowindow.open(Markers.getMap(), this); 
                    });

                    pins.push(marker);

                    bgPositionX += 40;
                }*/

                var el = angular.element(elem);

                console.log("el");
                console.log(el);
                console.log(el.find("span")[1].attrs);
                console.log(el.children()[1].children.length);

                for (var j = 0; j < el.children()[1].children.length; J++){

                    console.log(el.children()[1].children[j]);
                    console.log(el.children()[1].children[j].attrs());

                    marker = new google.maps.Marker({
                        position : new google.maps.LatLng(elem.children()[1].children[j].position.split(",")[0], elem.children()[1].children[j].position.split(",")[1]),
                        map : Markers.getMap(),
                        pinId : elem.children()[1].children[j].id,
                        pinName : elem.children()[1].children[j].name,
                        pinAddress : elem.children()[1].children[j].address,
                        pinUrl : elem.children()[1].children[j].url,
                        icon: {url : spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point(bgPositionX,0) },
                        zIndex: 100
                    });

                    google.maps.event.addListener(marker, 'mouseover', function() {
                        infowindow.close(); 
                        infowindow.setContent("<div id='"+ this.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ this.pinUrl +"' target='_blank'>"+ this.pinName +"</a></h3><p>"+ this.pinAddress +"<p></div>"); 
                        infowindow.open(Markers.getMap(), this); 
                    });

                    pins.push(marker);

                    bgPositionX += 40;
                }


				// for(i = 0; i < scope.markers.length; i++){
				// 	marker = new google.maps.Marker({
				//         position : new google.maps.LatLng(scope.markers[i].position.split(",")[0], scope.markers[i].position.split(",")[1]),
				//         map : map,
				//         pinId : scope.markers[i].id,
				//         pinName : scope.markers[i].name,
				//         pinAddress : scope.markers[i].address,
				//         pinUrl : scope.markers[i].url,
				//         icon: {url : spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point(bgPositionX,0) },
				//         zIndex: 100
				//     });

				//     google.maps.event.addListener(marker, 'mouseover', function() {
				// 	    infowindow.close(); 
				// 	    infowindow.setContent("<div id='"+ this.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ this.pinUrl +"' target='_blank'>"+ this.pinName +"</a></h3><p>"+ this.pinAddress +"<p></div>"); 
				// 	    infowindow.open(map, this); 
				// 	});

				// 	pins.push(marker);

				// 	bgPositionX += 40;
				// }

                
				return pins;
			};

			$rootScope.drawPin = function(){
				var arrayPins = scope.getPin();

				for(i = 0; i < arrayPins.length; i++){
			        //console.log(arrayPins[i]);
			        arrayPins[i].setMap(Markers.getMap());
			    }
			}
            		
            if(scope.user){
                //console.log("scope.user");
                google.maps.event.addDomListener(window, 'load', scope.initializeMap());

                //$rootScope.drawPin();

                /*scope.$watch(scope.dataList, function() {
                    var arrayPins = scope.getPin();

                    for(i = 0; i < arrayPins.length; i++){
                        //console.log(arrayPins[i]);
                        arrayPins[i].setMap(Markers.getMap());
                    }   
                }, true);
                */


            }
            else{
                //console.log("else scope.user");
            }


			
            console.log("$rootScope: ");
            console.log($rootScope);

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


vacationsApp.factory('Markers', function ($rootScope) {
    var map;

    return {
        getMap:function(){
            return map;
        },
        setMap:function(container, options){            
            map = new google.maps.Map(document.getElementById(container), options);
        },
        reloadPins:function (map) {
            alert("oi")
            $rootScope.$watch($rootScope.dataList, function() {
                var arrayPins = $rootScope.getPin(),
                    i;

                for(i = 0; i < arrayPins.length; i++){
                    //console.log(arrayPins[i]);
                    arrayPins[i].setMap(this.getMap());
                }   
            }, true);
        }
    };
});


vacationsApp.controller("AttractionsCtrl", function($scope, $rootScope, fireFactory, Markers, $timeout){

    //$rootScope.user = User.getUser();

    $scope.dataPlace = {$show: false, $edit: false, position: "", id: "", name: "", address: "", url: ""};

    //Markers.reloadPins(Markers.getMap());


    /*$rootScope.$watch($rootScope.dataList, function() {
        alert("watch!!");
        var arrayPins = $rootScope.getPin(),
            i;

        for(i = 0; i < arrayPins.length; i++){
            //console.log(arrayPins[i]);
            arrayPins[i].setMap(Markers.getMap());
        }   
    });*/



    //{"position":"51.50134,-0.141883", "id":"-C1hOuUqwertyuiopasa", "name":"Buckingham Palace", "address":"London SW1A 1AA, Reino Unido", "url":"http://www.royal.gov.uk/theroyalresidences/buckinghampalace/buckinghampalace.aspx"}
    

    //FALTA CONFIGURAR O AUTH NA FIREBASE PARA PERMITIR A EDIÇÃO APENAS QUANDO O USUÁRIO CORRETO ESTIVER LOGADO. TALVEZ SÓ PERMITIR LEITURA NESSAS CONDIÇÕES TAMBÉM

    $scope.cancel = function() {
        $scope.dataPlace = {$show: false, $edit: false, position: "", id: "", name: "", address: "", url: ""};
    }

    $scope.delete = function(id) {
        var idRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/-Z1hOuUqwertyuiopasa/places/"+ id);
        idRef.remove(function(){
            //$rootScope.drawPin();
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
        var placeRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/-Z1hOuUqwertyuiopasa/places/"+ ref.id);
        /*idRef.remove(function(){
            $rootScope.drawPin();
        });*/        
        placeRef.child('position').set(ref.position);
        placeRef.child('name').set(ref.name);
        placeRef.child('address').set(ref.address);
        placeRef.child('url').set(ref.url);
        // FALTA ATUALIZAR OS PINS NO CALLBACK DE INSERIR

        this.cancel();
    }

    $scope.new = function() {
        $scope.dataPlace = {$show: true, $edit: false, position: "", id: "", name: "", address: "", url: ""};
    }

    $scope.submitNew = function(ref) {   
        var placeRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/-Z1hOuUqwertyuiopasa/places");
        //var placeRef = fireFactory.firebaseRef("users/facebook:100007322078152/travels/-Z3hOuUqwertyuiopasa/places");
        var newPushRef = placeRef.push();

        newPushRef.set({position: ref.position, id: newPushRef.name(), name: ref.name, address: ref.address, url: ref.url}, function(){
            console.log("Adicionado!!!")
            //$rootScope.drawPin();            
        });

        this.cancel();

        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
        console.log($rootScope.dataList);
        console.log($scope.dataList);
        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
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

    
        var placesRef = fireFactory.firebaseRef("users/" + $rootScope.user.uid + "/travels/-Z1hOuUqwertyuiopasa/places/");
        placesRef.on('child_chenged', function(snapshot) {
          //var userName = snapshot.name(), userData = snapshot.val();
          //alert('User ' + userName + ' has left the chat.');
          console.log("Editado. Atualizando os pins!");

          $rootScope.$apply(function() {
            alert("oioioi");
                $rootScope.drawPin();
            });


          
            /*alert("watch!!");
            var arrayPins = $rootScope.getPin(),
                i;

        
                for(i = 0; i < arrayPins.length; i++){
                    console.log(arrayPins[i]);
                    arrayPins[i].setMap(Markers.getMap());
                }   
            */
                
        

        });
    

    console.log($scope)



    /*$rootScope.$watch($rootScope.dataList, function() {
        alert("watch!!");
        var arrayPins = $rootScope.getPin(),
            i;

        for(i = 0; i < arrayPins.length; i++){
            //console.log(arrayPins[i]);
            arrayPins[i].setMap(Markers.getMap());
        }   
    });*/

    
});



// vacationsApp.controller("MapCtrl", function($scope){
// 	angular.extend($scope, {
// 		center: {
// 			latitude: 51.45, // initial map center latitude
// 			longitude: -0.20, // initial map center longitude
// 		},
// 		markers: [
// 	        {
// 	        	//icon: 'plane.png',
// 	            latitude: 51.5034412,
// 	            longitude: -0.119678199999953,
// 	            showWindow: false,
// 	            title: 'London Eye'
// 	        },
// 	        {
// 	            latitude: 51.5227504,
// 	            longitude: -0.15506379999999353,
// 	            showWindow: false,
// 	            title: 'Museu Madame Tussauds'
// 	        }        
// 	    ], // an array of markers,
// 		zoom: 8, // the zoom level
// 	});
	

	/*$scope.myMarkers = [
		{
			"latitude":51.5034412,
			"longitude":-0.119678199999953,
			"showWindow": true,
			"title":"London Eye"
		},
		{
			"latitude":51.5227504,
			"longitude":-0.15506379999999353
		}
	];

	$scope.center = {
		latitude: 51.45,
		longitude: -0.20,
	};

	$scope.zoom = 9;
	$scope.markers = $scope.myMarkers;
	$scope.fit = true;

	$scope.add = function(){    
		alert("oi");
	}*/
// });
