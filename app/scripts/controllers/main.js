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

            $location.path("/home");

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

vacationsApp.controller("MapCtrl", function($q, $timeout, $scope, $rootScope, $routeParams, User){

    $rootScope.user = User.getUser();
    $scope.user = User.getUser();
    $scope.markers = [];

    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    // console.log($rootScope.user);
    // console.log($scope.user);
    // console.log($scope);
    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

    var i;

    for(i=0; i<$scope.dataList.length; i++){
        console.log($scope.dataList[i]);
        $scope.markers.push($scope.dataList[i]);            
        //console.log($scope.dataList[i]);
    }

    // console.log($scope);
    // console.log($rootScope);
    // console.log($scope.dataList);


	$scope.options = {
	    zoom: 10,
	    centerLat: $scope.markers[$scope.markers.length-1].position.split(",")[0],
	    centerLong: $scope.markers[$scope.markers.length-1].position.split(",")[1],	    
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


vacationsApp.directive('drawMap', function () {
	return {
        restrict: "A",       
        replace: true, 
    	template:   '<div id="container-map"></div>',
        
        link: function (scope, elem, attrs) {
            var map,
            	marker,
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

				map = new google.maps.Map(document.getElementById('container-map'), mapOptions);
			};

			scope.getPin = function(){
                //pins = [];                

				infowindow = new google.maps.InfoWindow({
				    maxWidth: 500
				    // position : new google.maps.LatLng(this.position.jb,this.position.kb),
				    // pixelOffset : new google.maps.Size(0,-34),
				    // maxWidth: 50
				});

                


				for(i = 0; i < scope.markers.length; i++){
					marker = new google.maps.Marker({
				        position : new google.maps.LatLng(scope.markers[i].position.split(",")[0], scope.markers[i].position.split(",")[1]),
				        map : map,
				        pinId : scope.markers[i].id,
				        pinName : scope.markers[i].name,
				        pinAddress : scope.markers[i].address,
				        pinUrl : scope.markers[i].url,
				        icon: {url : spritePinUrl, size :{width:26,height:40} , origin:new google.maps.Point(bgPositionX,0) },
				        zIndex: 100
				    });

				    google.maps.event.addListener(marker, 'mouseover', function() {
					    infowindow.close(); 
					    infowindow.setContent("<div id='"+ this.pinId +"' class='tooltip-map'><h3 class='sub-title-2' style='margin-bottom:5px; padding-bottom:0; white-space:nowrap;'><a href='"+ this.pinUrl +"' target='_blank'>"+ this.pinName +"</a></h3><p>"+ this.pinAddress +"<p></div>"); 
					    infowindow.open(map, this); 
					});

					pins.push(marker);

					bgPositionX += 40;
				}

                
				return pins;
			};

			scope.drawPin = function(){
				var arrayPins = scope.getPin();

				for(i = 0; i < arrayPins.length; i++){
			        //console.log(arrayPins[i]);
			        arrayPins[i].setMap(map);
			    }
			}
            		
            if(scope.user){
                //console.log("scope.user");
                google.maps.event.addDomListener(window, 'load', scope.initializeMap());

                scope.drawPin();    
            }
            else{
                //console.log("else scope.user");
            }
			

        }
    }
});


vacationsApp.controller("NavCtrl", function($scope, $rootScope, $injector){

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
