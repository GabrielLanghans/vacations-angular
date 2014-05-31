'use strict';

// var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate", "google-maps"]);
var vacationsApp = angular.module('vacationsApp', ["firebase", "ngRoute", "ngAnimate"]);

vacationsApp.factory("fireFactory", function($rootScope, $firebase) {
    var baseUrl = 'https://vacations-initial.firebaseio.com/',
        path = "";

    $rootScope.user = {};
    console.log($rootScope.user);
            
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
            verifyAuth: function($route, $rootScope, $location, fireFactory){
                if($rootScope.user.uid !== undefined){
                    console.log('user', $rootScope.user);
                    $location.path('/home');
                }
            }
        }
    })

    .when('/home', {
        templateUrl: '/views/home-auth.html',
        controller: 'HomeAuthCtrl',
        disableCache: true,
        resolve: {
            loadData: function($route, fireFactory, $rootScope, $location) {    
                if($rootScope.user.uid !== undefined){
                    return {userData:fireFactory.dataRef("users/" + $rootScope.user.uid), placeCatData:fireFactory.dataRef("place")};  
                }
                else{
                    return $location.path("/");
                }
            }
        }
    })

    .when('/signup', {
        templateUrl: '/views/signup.html',
        controller: 'SignupCtrl',
        resolve: {
            verifyAuth: function($route, $rootScope, $location){
                if($rootScope.user.uid !== undefined){
                    console.log('user', $rootScope.user);
                    $location.path('/home');
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
