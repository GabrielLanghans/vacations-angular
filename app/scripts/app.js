'use strict';

// var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate", "google-maps"]);
var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate"]);

vacationsApp.factory("fireFactory", function($rootScope, $timeout, $firebase) {
    var baseUrl = 'https://vacations-initial.firebaseio.com/',
        path = "";

    $rootScope.dataList = [];
            
    return {
        firebaseRef: function(path) {
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;
            return new Firebase(path);
        },
        dataRef: function(path, name) {            
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;     

            var ref = new Firebase(path);

            if(name == undefined){
              $rootScope.dataList = $firebase(ref);
            }
            else{
              $rootScope[name] = $firebase(ref);
            }

            
            // var promise = $firebase(ref);
            // var promise = $firebase(ref, $rootScope, scopeName);
            // return promise;
          

            return $rootScope;
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
              console.log(fireFactory.dataRef("place", "placeData"));
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

            console.log(fireFactory.dataRef("users/" + $rootScope.user.uid));

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
