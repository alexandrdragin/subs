'use strict';

// global app directives
angular.module('tApp.directives', [])
    .directive('ngFocus', [function() {
        var FOCUS_CLASS = 'ng-focused';
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                ctrl.$focused = false;
                element.bind('focus', function() {
                    element.addClass(FOCUS_CLASS);
                    scope.$apply(function() { ctrl.$focused = true; });
                }).bind('blur', function() {
                    element.removeClass(FOCUS_CLASS);
                    scope.$apply(function() { ctrl.$focused = false; });
                });
            }
        };
    }])
    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind('keydown keypress', function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    })
;