'use strict';

// var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate", "google-maps"]);
var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate"]);

vacationsApp.factory("fireFactory", function($firebase) {
    var baseUrl = 'https://vacations-initial.firebaseio.com/',
        path = "";

    // $rootScope.dataList = [];
            
    return {
        firebaseRef: function(path) {
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;
            return new Firebase(path);
        },
        dataRef: function(path) {            
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;     

            var ref = new Firebase(path);

            // if(name == undefined){
            //     $rootScope.dataList = $firebase(ref);
            // }
            // else{
            //     $rootScope[name] = [];
            //     $rootScope[name] = $firebase(ref);
            // }

            
            // var promise = $firebase(ref);
            // var promise = $firebase(ref, $rootScope, scopeName);
            // return promise;
          

            // return $rootScope;
            return $firebase(ref);
        }
    };
});


vacationsApp.config(function ($routeProvider, $locationProvider, $provide) {
    $routeProvider
    .when('/', {
        templateUrl: '/views/home.html',
        resolve: {
            verifyAuth: function($route, $rootScope, $location){
                if($rootScope.user){
                    $location.path('/home');
                }
            }
        }
    })

    .when('/home', {
        templateUrl: '/views/home-auth.html',
        controller: 'HomeAuthCtrl',
        resolve: {
            loadData: function($route, fireFactory, $rootScope, $location) {    
                if($rootScope.user){ 
                    return {userData:fireFactory.dataRef("users/" + $rootScope.user.uid), placeCatData:fireFactory.dataRef("place")};  
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

    // $provide.decorator('$sniffer', function($delegate) {
    //     $delegate.history = false;
    //     return $delegate;
    // });

    // $locationProvider.html5Mode(true).hashPrefix('!');
});
