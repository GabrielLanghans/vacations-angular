'use strict';

// var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate", "google-maps"]);
var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate"]);

vacationsApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html'//,
        //controller: 'MapCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

      $locationProvider.html5Mode(true);
  });