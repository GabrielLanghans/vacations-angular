vacationsApp.controller("LoginCtrl", function($scope, $rootScope, $location, User){


    //$rootScope.user = userService;

    $rootScope.user = User.getUser();

    console.log($rootScope.user);


    // console.log($rootScope.usuario);

    /*if($rootScope.user.uid){
        $location.path('/home');        
    }
    else{
        $location.path('/');           
    }*/
})