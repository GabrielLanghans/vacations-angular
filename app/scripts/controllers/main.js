'use strict';

/*vacationsApp.controller("authCtrl", function($scope, $rootScope, $routeParams, fireFactory){
    $rootScope.status = {log: false, name: "", username: ""};

    var usuario = [];

    var auth = new FirebaseSimpleLogin(fireFactory.firebaseRef(), function(error, user) {
        if (error) {
            usuario = error;
        } else if (user) {            
            $rootScope.status = {log: true, name: user.name, username: user.username};
            usuario = user;
        } else {
            $rootScope.status = {log: false, name: "", username: ""};
        }
        $rootScope.$apply();
    });

    $scope.login = function(){
        auth.login("facebook");
    }
    $scope.logout = function(){
        auth.logout();
    }
})*/

vacationsApp.controller("MapCtrl", function($q, $timeout, $scope, $rootScope, $routeParams){
    var i;

    for(i=0; i<$scope.dataList.length; i++){
        $scope.markers.push($scope.dataList[i]);            
        //console.log($scope.dataList[i]);
    }

    console.log($scope);
    console.log($rootScope);
    console.log($scope.dataList);


	$scope.options = {
	    zoom: 10,
	    centerLat: $scope.markers[$scope.markers.length-1].position.split(",")[0],
	    centerLong: $scope.markers[$scope.markers.length-1].position.split(",")[1],	    
	    minZoom: 9,    
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
				infowindow = new google.maps.InfoWindow({
				    maxWidth: 500
				    // position : new google.maps.LatLng(this.position.jb,this.position.kb),
				    // pixelOffset : new google.maps.Size(0,-34),
				    // maxWidth: 50
				});

                


				for(i = 0; i < scope.markers.length; i++){
                    console.log(scope.markers[i]);
                    console.log(scope.markers[i].position.split(",")[0]);
                    console.log(scope.markers[i].position.split(",")[1]);

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

                    console.log(marker);

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
			        //console.log(pins[i]);
			        arrayPins[i].setMap(map);
			    }
			}
            		

			google.maps.event.addDomListener(window, 'load', scope.initializeMap());

			scope.drawPin();

        }
    }
});


/*avengersApp.directive('listAvengers', function () {
    return {
        //se factory e controller baseado em angularFire, então: data-ng-repeat='actor in avengersList.avengers. Se baseado em angularFireCollection data-ng-repeat='actor in avengers'
        restrict: "A",       
        transclude: true, 
        template:   "<div class='list-avengers'>"+
                        //"<label>Busca</label>"+
                        "<div class='form-group'>"+
                            "<input class='form-control' type='text' data-ng-model='avengers.field' placeholder='Filtrar'>"+
                        "</div>"+
                        "<table class='table table-striped table-hover table-condensed'>"+
                            "<thead>"+
                                "<th>#</th>"+
                                "<th>Ator</th>"+
                                "<th>Personagem</th>"+
                                "<th>Poder</th>"+
                            "</thead>"+
                            "<tbody>"+
                                "<tr data-ng-repeat='actor in avengers.dataList | avengersFilter:avengers.field' data-ng-click='match({id:actor.id, name:actor.name, char:actor.character, rating:actor.rating, defRating:actor.defRating, index:$index, lastId:$last})' class=''>"+
                                    "<td>{{$index}}</td>"+
                                    "<td>{{actor.name}}</td>"+
                                    "<td>{{actor.character}}</td>"+
                                    "<td>{{actor.rating}}</td>"+
                                "</tr>"+
                            "</tbody>"+
                        "</table>"+
                        "<div ng-transclude></div>"+        
                    "</div>",
        link: function (scope, elem, attrs) {
            var start = false,
                field = angular.element(elem.find('input')),
                autoC = angular.element(elem.find('.autocomplete')),
                autoCList = angular.element(elem.find('ul'));

            field.on('focus', function(){
                autoCList.removeClass('closed');
            });

            field.on('blur', function(){
                if(!start){
                    autoCList.addClass('closed');    
                }                
            });            

            autoC.on('mouseleave', function(){
                start = false;                
            });

            autoC.on('mouseover', function(){
                start = true;                
            });

        }
    }
})*/




//console.log($rootScope);

//google.maps.event.addDomListener(window, 'load', initialize);


/*
avengersApp.controller("avengersCtrl", function($q, $timeout, $scope, $routeParams, fireFactory, avengersService){

    var deferred = $q.defer();
    var defer = $q.defer();

    $scope.get = function(){        
        defer.resolve(fireFactory.dataRef("heroes"));
        return defer.promise;
    }

    $scope.get().then(function (returnedData) {
        $scope.avengers = returnedData;
    });

    //$scope.avengers = fireFactory.dataRef("heroes");
    console.log($scope);

    $scope.add = function(param){        
        if((param.data.name != "") && (param.data.char != "")){            
            avengersService.add(param);    

            $scope.alert.success = {message: "Adicionado!", field: param.data.name};
            $timeout(function() {
                deferred.resolve($scope.alert = {});                
            }, 3000);
            deferred.promise;
        }
        else{
            $scope.alert.error = {message: "Preencha o campo Ator e o campo Personagem!"};        
            $timeout(function() {
                deferred.resolve($scope.alert = {});                
            }, 3000);
            deferred.promise;   
        }        
    }
    $scope.clear = function(param){
        avengersService.clear(param);
    }
    $scope.edit = function(param){
        if(param.data.$selected !== undefined){            
            avengersService.edit(param);
            $scope.alert.success = {message: "Editado!", field: param.data.name};        
            $timeout(function() {
                deferred.resolve($scope.alert = {});                
            }, 3000);
            deferred.promise;   
        }
        else{            
            $scope.alert.error = {message: "Selecione um personagem pra editar!"};        
            $timeout(function() {
                deferred.resolve($scope.alert = {});                
            }, 3000);
            deferred.promise;   
        }
    }
    $scope.match = function(actor){
        avengersService.match(actor, $scope.avengers);                
    }
    $scope.delete = function(param){        
        if(param.data.$selected == true){            
            console.log(param.data.name);
            avengersService.delete(param);                
            $scope.alert.success = {message: "Deletado!", field: param.data.name};        
            $timeout(function() {
                deferred.resolve($scope.alert = {});                
            }, 3000);
            deferred.promise;   
        }
        else{
            $scope.alert.error = {message: "Selecione um personagem pra deletar!"};        
            $timeout(function() {
                deferred.resolve($scope.alert = {});                
            }, 3000);
            deferred.promise;   
        }        
    }

})
*/
















/*avengersApp.controller("headerCtrl", function($scope, $rootScope, $location){
    $scope.setMaster = function(section) {
        $rootScope.selected = section;
    }

    $scope.isSelected = function(section) {
        return $rootScope.selected === section;
    }

    console.log($rootScope);
    $scope.setMaster($location.path().substring(1, $location.path().length));

})
*/

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
