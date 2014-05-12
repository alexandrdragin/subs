angular.module('tApp.factories', ['ngCookies'])
    .factory('socket', function(socketFactory) {
        return socketFactory({
            ioSocket: io.connect(location.origin)
        });
    })


    // register the 401/403 interceptor as a service
    // .factory('myHttpInterceptor', ['$q', '$location', function($q, $location) {
    //     return {
    //         'responseError': function(response) {
    //             switch(response.status) {

    //                 case 401:
    //                     var path = $location.path();
    //                     $location.path('/login').search('back', path);
    //                 break;

    //                 case 403: 
    //                     $location.path('/403');
    //                 break;

    //                 case 404: 
    //                     $location.path('/404');
    //                 break;

    //                 default:
    //             }

    //             return $q.reject(response);
    //         }
    //     };
    // }])

    // .config(['$httpProvider', function($httpProvider) {
    //     $httpProvider.interceptors.push('myHttpInterceptor');        
    // }])

    .factory('auth', [ '$http', '$rootScope', '$cookieStore', function($http, $rootScope, $cookieStore) {
        $rootScope.accessConfig = accessConfig;
        $rootScope.user = $cookieStore.get('user') || null;

        return {
            authorize: function(accessLevel, role) {
                if(role === undefined)
                    role = $rootScope.user.role;

                return accessLevel & role;
            },

            isLoggedIn: function(user) {
                if (!user) {
                    user = $rootScope.user;
                }

                return !(user.role === accessConfig.roles.public);
            },
            accessConfig: $rootScope.accessConfig,
            user: $rootScope.user
        };
    }])
;