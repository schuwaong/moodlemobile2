// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.mod_imscp')

/**
 * IMSCP index controller.
 *
 * @module mm.addons.mod_imscp
 * @ngdoc controller
 * @name mmaModImscpIndexCtrl
 */
.controller('mmaModImscpIndexCtrl', function($scope, $stateParams, $mmUtil, $mmaModImscp, $log, mmaModImscpComponent,
            $ionicPopover, $mmFS, $q, $mmCourse) {
    $log = $log.getInstance('mmaModImscpIndexCtrl');

    var module = $stateParams.module || {},
        courseid = $stateParams.courseid;

    $scope.title = module.name;
    $scope.description = module.description;
    $scope.component = mmaModImscpComponent;
    $scope.componentId = module.id;
    $scope.externalUrl = module.url;
    $scope.loaded = false;

    $scope.items = $mmaModImscp.createItemList(module.contents);
    $scope.previousItem = '';
    $scope.nextItem = $mmaModImscp.getNextItem($scope.items, $scope.items[0].href);

    function fetchContent() {
        if (module.contents) {
            return $mmaModImscp.getIframeSrc(module).then(function(src) {
                $scope.src = src;
            }).catch(function() {
                $mmUtil.showErrorModal('mma.mod_imscp.deploymenterror', true);
                return $q.reject();
            }).finally(function() {
                $scope.loaded = true;
            });
        } else {
            $mmUtil.showErrorModal('mma.mod_imscp.deploymenterror', true);
            return $q.reject();
        }
    }

    $scope.doRefresh = function() {
        $mmaModImscp.invalidateContent(module.id).then(function() {
            return fetchContent();
        }).finally(function() {
            $scope.loaded = true;
        });
    };

    $scope.loadItem = function(itemId) {
        $scope.popover.hide();
        $scope.src = $mmaModImscp.getFileSrc(module.url, itemId);
        $scope.previousItem = $mmaModImscp.getPreviousItem($scope.items, itemId);
        $scope.nextItem = $mmaModImscp.getNextItem($scope.items, itemId);
    };

    $scope.getNumberForPadding = function(n) {
        return new Array(n);
    };

    $ionicPopover.fromTemplateUrl('addons/mod_imscp/templates/toc.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.popover = popover;
    });

    fetchContent().then(function() {
        $mmaModImscp.logView(module.instance).then(function() {
            $mmCourse.checkModuleCompletion(courseid, module.completionstatus);
        });
    });
});
