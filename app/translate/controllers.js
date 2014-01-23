'use strict';
angular.module('tApp.controllers', [])
    .controller('InfoCtrl', ['$scope', 'socket', 'growl', '$routeParams', '$location', '$route', function($scope, socket, growl, $routeParams, $location, $route) {
        $scope.loading = true;
        $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
            processRoute();
        });

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
        $scope.items = [];
        $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
            $scope.loading = true;
            processRoute();
        });

        var findItem = function(itemId) {
            var item = null;

            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i]._id === itemId) {
                    return $scope.items[i];
                }
            }

            return item;
        };

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
                    $scope.items = [];
                } else {
                    $scope.items = response;
                }

                $scope.loading = false;
            });
        };

        $scope.tItem = {};
        $scope.addTranslation = function(itemId) {
            var item = findItem(itemId);

            if (!item) {
                return;
            }

            if ($scope.tItem.id === itemId) {
                $scope.tItem = {};
                return;
            }

            $scope.tItem = {
                text: '',
                id: itemId
            };
        };

        $scope.cancelTranslation = function() {
            $scope.tItem = {};
        };

        $scope.submitTranslation = function() {
            if (!$scope.tItem.text.length) {
                return;
            }

            socket.emit('translation:submitTranslation', $scope.tItem, function(err) {
                console.log(err);
            });
        };

        socket.on('translation:newTranslation', function(data) {
            var item = findItem(data._id);
            if (!item) {
                return;
            }

            item.translations = data.translations;
            $scope.tItem = {};
        });

        $scope.formatTime = function(str) {
            return (new Date(str)).format('dd.MM.yyyy h:mm:ss');
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
