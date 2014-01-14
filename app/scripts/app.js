'use strict';

// var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate", "google-maps"]);
var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate"]);

vacationsApp.factory("fireFactory", function($rootScope, $timeout, angularFire) {
    var baseUrl = 'https://vacations-initial.firebaseio.com/',
        path = "",
        scopeName = "";

    $rootScope.dataList = [];
            
    return {
        firebaseRef: function(path) {
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;
            return new Firebase(path);
        },
        dataRef: function(path, name) {            
            if(name == undefined){
              scopeName = "dataList";
            }
            else{
              scopeName = name;
            }

            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;     

            var ref = new Firebase(path);
            var promise = angularFire(ref, $rootScope, scopeName);

            return promise;
        }
    };
});


vacationsApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        resolve: {
          verifyData: function($route, $rootScope, $location, fireFactory){
            if($rootScope.user){
              console.log($rootScope.user);
              $location.path('/home');
              //redirectTo: '/';
            }
            else{
              return fireFactory.dataRef("place", "placeData");
            }
          }
        }
      })

      .when('/home', {
        templateUrl: 'views/home-auth.html',
        resolve: {
          dataLoad: function($route, fireFactory, $rootScope, $location) {    
            if($rootScope.user){ 
              // fireFactory.dataRef("place/category", "placeRef").then(function(){                 
              // });

              return fireFactory.dataRef("users/" + $rootScope.user.uid);  
            }
            else{
              return $location.path("/");
            }
          }
        }
      })  

      .otherwise({
        redirectTo: '/'
      });

      //$locationProvider.html5Mode(true);
  });
