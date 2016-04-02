var app = angular.module('app', ['ngQueryBuilder']);

app.controller('masterController', ['$scope', function($scope){
	$scope.queryBuilder = {};
	$scope.columns = ['FirstName', 'LastName', 'Age', 'Gender', 'DOB', 'Major', 'School'];
	$scope.operations = ['>', '<', '<=', '>=', '==', '=', 'is'];

	$scope.temp = {
		"expression":"((0AND1)OR(2AND3))",
		"operands": 
		[
			{
				"type":"basic",
				"colName":"FirstName",
				"operation":"is",
				"value":"'Tom'",
				"custom":""
			},
			{
				"type":"basic",
				"colName":"LastName",
				"operation":"is",
				"value":"'Cruise'",
				"custom":""
			},
			{
				"type":"basic",
				"colName":"Age",
				"operation":">",
				"value":"40",
				"custom":""
			},
			{
				"type":"basic",
				"colName":"Gender",
				"operation":"is",
				"value":"'Male'",
				"custom":""
			}
		],
		"bracketIds": [2,1,1,3,3,2]
	}
}]);