'use strict';

// var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate", "google-maps"]);
var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate"]);

vacationsApp.factory("fireFactory", function($rootScope, $timeout, angularFire) {
    var baseUrl = 'https://vacations-initial.firebaseio.com/',
        path = "";

    $rootScope.dataList = [];
            
    return {
        firebaseRef: function(path) {
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;
            return new Firebase(path);
        },
        dataRef: function(path) {            
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;     

            var ref = new Firebase(path);
            var promise = angularFire(ref, $rootScope, "dataList");

            return promise;
        }
    };
});


vacationsApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        resolve: {
          verifyAuth: function($route, $rootScope, $location){
            if($rootScope.user){
              console.log($rootScope.user);
              $location.path('/home');
              //redirectTo: '/';
            }            
          }
        }
      })

      .when('/home', {
        templateUrl: 'views/home-auth.html',
        resolve: {
          dataLoad: function($route, fireFactory, $rootScope, $location) {    
            if($rootScope.user){              
              return fireFactory.dataRef("users/" + $rootScope.user.uid + "/travels/-Z1hOuUqwertyuiopasa/places");  
              //return fireFactory.dataRef("users/facebook:100007322078152/travels/0/places");  
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
