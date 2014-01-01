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
            /*console.log("-- datalist inicial --");
            console.log($rootScope.dataList);
            console.log($rootScope.dataList.length);
            $rootScope.dataList = [];
            console.log("-- datalist zerada --");
            console.log($rootScope.dataList);
            console.log($rootScope.dataList.length);
            console.log("-- end --");
            */

            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;     

            var ref = new Firebase(path);

            var promise = angularFire(ref, $rootScope, "dataList");

            

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
        templateUrl: 'views/login.html',
        resolve: {
          /*dataLoad: function(fireFactory) {            
            return fireFactory.dataRef("users/-J5hOuUsRGBpAG_rhWVr/travels/0/places");
          }*/
          loadLogin: function($route, $rootScope, $location){

            

            if($rootScope.user){
              // console.log("=======================");
              // console.log($rootScope.user);
              // console.log("=======================");

              $location.path('/home');
              //redirectTo: '/';
            }
            else{
              // console.log("=======================");
              // console.log("user vazio: "+ $rootScope.user);
              // console.log("=======================");
            }
            
          }
        }
        //controller: 'MapCtrl'
      })
      .when('/home', {
        templateUrl: 'views/main.html',
        resolve: {
          dataLoad: function($route, fireFactory, $rootScope, $location) {    

            

            //$rootScope.dataList = [];

            if($rootScope.user){
              /*if(!$rootScope.dataList.length){
                // console.log("========== IF =============");
                // console.log($rootScope.user);
                // console.log("=======================");
                return fireFactory.dataRef("users/" + $rootScope.user.uid + "/travels/0/places");  
              }
              else{
                //console.log("========== ELSE =============");
                return true;
              }
              */
              
              return fireFactory.dataRef("users/" + $rootScope.user.uid + "/travels/0/places");  
              
            }
            else{
              // console.log("=======================");
              // console.log("user vazio: "+ $rootScope.user);
              // console.log("=======================");

              return $location.path("/");
            }
            

          }
        }
        //controller: 'MapCtrl'
      })  
      .otherwise({
        redirectTo: '/'
      });

      //$locationProvider.html5Mode(true);
  });
