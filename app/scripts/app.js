'use strict';

// var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate", "google-maps"]);
var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate"]);

vacationsApp.factory("fireFactory", function($rootScope, $timeout, angularFire) {
    var baseUrl = 'https://vacations-initial.firebaseio.com/',
        path = "";
            
    return {
        firebaseRef: function(path) {
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;
            return new Firebase(path);
        },
        dataRef: function(path) {
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;            

            var ref = new Firebase(path);

            var promise = angularFire(ref, $rootScope, "dataList");

            $rootScope.markers = [];
            $rootScope.newMarker = [];

            /*promise.then(function(){
                console.log($rootScope);
                console.log($rootScope.dataList);
                return $rootScope.dataList;      
            });*/

            return promise;
        }
    };
});

vacationsApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        resolve: {
          dataLoad: function(fireFactory) {            
            return fireFactory.dataRef("users/-J5hOuUsRGBpAG_rhWVr/travels/0/places");
          }
        }
        //controller: 'MapCtrl'
      })  
      .otherwise({
        redirectTo: '/'
      });

      $locationProvider.html5Mode(true);
  });

