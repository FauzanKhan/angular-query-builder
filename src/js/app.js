var app = angular.module('app', ['ngQueryBuilder']);

app.controller('masterController', ['$scope', function($scope){
	$scope.queryBuilder = {};
	$scope.columns = ['FirstName', 'LastName', 'Age', 'Gender', 'DOB', 'Major', 'School'];
	$scope.operations = ['>', '<', '<=', '>=', '==', '=', 'is']
}]);