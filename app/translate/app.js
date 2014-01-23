'use strict';

angular.module('tApp', [
    'ngRoute',
    'angular-growl',
    'btford.socket-io',
    'ngSanitize',

    'tApp.controllers',
    'tApp.filters',
    'tApp.directives',
    'tApp.factories'

])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        // var level = accessConfig.levels;


        $routeProvider.when('/doc/:id/translate', { action: 'loadInfo' });
        // $routeProvider.when('/doc/:id/translate/', { action: 'loadInfo' });

        $routeProvider.when('/doc/:id/translate/page/:page', { action: 'setPage' });
        // $routeProvider.when('/doc/:id/translate/page/:page/', { action: 'setPage' });

        // errors
        // $routeProvider.when('/404', { access: level.public, templateUrl: 'partial/errors/404' });
        // $routeProvider.when('/403', { access: level.public, templateUrl: 'partial/errors/403' });
        // $routeProvider.otherwise({redirectTo: '/404'});
        $locationProvider.html5Mode(true);
    }])
    // .run(['$rootScope', '$location', function ($rootScope, $location) {
    //         $rootScope.$on("$routeChangeStart", function (event, next, current) {
    //             $rootScope.error = null;

    //             if (!Auth.authorize(next.access)) {
    //                 if(Auth.isLoggedIn()) {
    //                     $location.path('/403');
    //                 } else {
    //                     $location.path('/login');
    //                 }
    //             }
    //         });

    //     }])
;
