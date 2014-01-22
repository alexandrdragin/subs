'use strict';
angular.module('tApp.controllers', [])
    .controller('InfoCtrl', ['$scope', 'socket', 'growl', '$routeParams', '$location', '$route', function($scope, socket, growl, $routeParams, $location, $route) {
        $scope.loading = true;
        $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
            processRoute();
        });

        console.log('InfoCtrl init');

        var processRoute = function() {
            if (!$scope.loading) {
                return;
            }

            var id = $route.current.params.id;
            if (!id) {
                return (window.location = '/404');
            }

            socket.emit('translation:getInfo', { id: id }, function(err, response) {
                if (err) {
                    for (var i = 0; i < err.length; i++) {
                        growl.addErrorMessage(err[i]);
                    }
                }

                $scope.doc = response || {};
                $scope.loading = false;
            });
        };

        // socket.on('translation:setInfo', function(response) {
        //     $scope.title = response.subdoc.title;
        //     // $scope.translationTitle = response.translationTitle;
        // });
    }])

    .controller('TranslateCtrl', ['$scope', 'socket', '$route', 'growl', function($scope, socket, $route, growl) {
        $scope.loading = true;
        $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
            $scope.loading = true;
            processRoute();
        });

        var processRoute = function() {
            $scope.id = $route.current.params.id;
            if (!$scope.id) {
                return (window.location = '/404');
            }

            $scope.filter = $route.current.params.filter;
            $scope.page = $route.current.params.page || 1;

            socket.emit('translation:getItems', { id: $scope.id, page: $scope.page, filter: $scope.filter }, function(err, response) {
                if (err) {
                    for (var i = 0; i < err.length; i++) {
                        growl.addErrorMessage(err[i]);
                    }
                }

                $scope.items = response;
                $scope.loading = false;
            });
        };

    }])

    .controller('PagerCtrl', ['$scope', 'socket', '$route', 'growl', function($scope, socket, $route, growl) {
        $scope.loading = true;
        $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
            processRoute();
        });

        $scope.range = function(min, max) {
            var input = [];
            for (var i = min; i <= max; i++) input.push(i);
            return input;
        };

        var processRoute = function() {
            $scope.id = $route.current.params.id;
            if (!$scope.id) {
                return (window.location = '/404');
            }

            $scope.filter = $route.current.params.filter;
            $scope.page = $route.current.params.page || 1;

            if (!$scope.loading) {
                return;
            }

            socket.emit('translation:getPageCount', { id: $scope.id, filter: $scope.filter }, function(err, response) {
                if (err) {
                    for (var i = 0; i < err.length; i++) {
                        growl.addErrorMessage(err[i]);
                    }
                }

                $scope.pageCount = null || response;
                $scope.loading = false;
            });
        };

        // socket.on('send:name', function(data) {
        //     $scope.name = data.name;
        // });



    }])
;
