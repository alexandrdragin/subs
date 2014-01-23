'use strict';

angular.module('tApp.filters', [])
    .filter('newLine', function() {
        return function(text) {
                return text.replace(/\n/g, '<br/>');
            };
    })

    .filter('stripHTML', function () {
        return function(text) {
            return text
                    .replace(/&/g, '&amp;')
                    .replace(/>/g, '&gt;')
                    .replace(/</g, '&lt;');
        };
    })
;