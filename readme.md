# ngQueryBuilder | Angular Query Builder
An elegant, easily customizable SQL Query Builder in Angular.

### Description
* An angular directive for Formula/Query Builder.
* Works well with/without Bootstrap/Foundation.

![](http://i.imgur.com/c0cTZPX.png)
![](http://i.imgur.com/ijCdMnN.png)
![](http://i.imgur.com/F0veghb.png)

### Dependecies
* Angular.js
* jQuery

### Installation

Install using bower

```
bower install ngQueryBuilder
```
#######or

 Get the queryBuilder.min.js & queryBuilder.css files from dist folder.

### Usage
* Make sure you include the  ```ngQueryBuilder``` module in you angular app: 

```
angular.module('myApp', ['ngQueryBuilder']);
```

* once you've added the module in your app. Use the code below to get the query builder up and running:

```html

<query-builder data="query"                                        // Object in which the query will be reflected 
			columns="columns"               //Columns for building query (Should be Array of Strings | eg - ['NAME', 'AGE', 'GENDER'])
			operations="operations">   //Operations  which are to be applied on columns (Should be Array of Strings | eg - ['<', '>', '='])
</query-builder>	

```

### Output JSON

```

{
	"bracketIds": [3, 2, 1, 1, 2, 3], //Storing Ids for easier repopulation of stored queries
	"expression": "(((0OR1)AND2)AND3)", // Expression corresponding to the query created by the user.
	"operands": { // Stores the variables referenced in the expression above
		"0": {
			"colName": "FirstName",
			"custom": "",
			"operation": "is",
			"type": "basic",
			"value": "Tom"
		},
		"1": {
			"colName": "LastName",
			"custom": "",
			"operation": "==",
			"type": "basic",
			"value": "Cruise"
		},
		"2": {
			"colName": "Age",
			"custom": "",
			"operation": ">",
			"type": "basic",
			"value": "30"
		},
		"3": {
			"colName": "",
			"custom": "someFunction(convertHeightToCms(height))",
			"operation": "",
			"type": "custom",
			"value": ""
		}
	}
}

```

###Customization
* You can easily customize the look and feel of the query builder by changing the following variables in the queryBuilder.scss file as per your requirement:

```
$border-color: #EAEAEA; // border color for the dropdown & the list inside the dropdown
$label-background: #444; //background of label showing operators (AND, OR, +, - ,etc)
$text-color: #333; // Color of text
$light-gray: #FAFAFA; // Color of popover header
```
* Run ```gulp sass``` to get the complied css file from css/multiselectdropdown.css

###Demo
visit <a href="http://fauzankhan.github.io/angular-query-builder/">http://fauzankhan.github.io/angular-query-builder/</a> to see the Query Builder in action
