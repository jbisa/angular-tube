'use strict';

angular.module('angularTubeApp.auth', [
  'angularTubeApp.constants',
  'angularTubeApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
