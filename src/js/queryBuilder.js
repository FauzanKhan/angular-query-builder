;(function(angular) {

	var app = angular.module("ngQueryBuilder", []);

	app.directive('queryBuilder', function($compile, templatesFactory) {
		return {
			restrict: 'EA',
			scope: {
				'data': '=', // Object in which the expressions will be reflected
				'columns': '=', //Columns for building query
				'operations': '=', //Operations  which are to be applied on columns
			},
			link: function(scope, ele, attr) {
				var query = scope.data || {};
				var getTemplates = templatesFactory.get;
				var buildTemplate = templatesFactory.build;
				var currIndexTemp = query.expression ? query.expression.match(/[^A-Za-z()]/g) : 0;

				//Object template for custom query
				var customQuery = {
					type: 'custom',
					colName: '',
					operation: '',
					value: '',
					custom: ''
				}

				//Object template for basic query
				var basicQuery = {
					type: 'basic',
					colName: '',
					operation: '',
					value: '',
					custom: ''
				}

				scope.query = query;
				scope.currIndex = query.expression ? currIndexTemp[currIndexTemp.length - 1] : 0; // currIndex refers to the index of last sub query
				query.expression = query.expression ? query.expression : null;  
				query.operands = query.operands || [angular.copy(basicQuery)]; // if no operands are present then push a basicQuery to oprands array
				query.bracketIds = query.bracketIds || []; //If bracketIds are not present initialize it to an empty array

				//Hides/shows Popover
				scope.togglePopover = function(event) {
					var isVisible = angular.element(event.target).closest('.popover-parent').hasClass('active');
					angular.element('.popover-parent').removeClass('active');
					if (!isVisible)
						angular.element(event.target).closest('.popover-parent').addClass('active');
				}

				//Adds a new Sub Query
				scope.newEntry = function(event) {
					scope.currIndex = parseInt(scope.currIndex);
					scope.currIndex += 1;
					currIndex = scope.currIndex;
					scope.query.operands.push(angular.copy(basicQuery));
					var templates = getTemplates(currIndex);
					ele.find('.query-builder-wrapper').append($compile(templates.operator)(scope));
					ele.find('.query-builder-wrapper').append($compile(templates.operandSelection)(scope));
					scope.query.expression = buildExpression();
				}

				//Changes type of Sub QUery
				scope.changeQueryType = function(index, queryType) {
					if (queryType == 'basic')
						scope.query.operands[index] = angular.copy(basicQuery);
					else
						scope.query.operands[index] = angular.copy(customQuery);
				}

				//Changes operator between two sub queries
				scope.changeOperator = function(newOperator, event) {
					var operatorWrapper = angular.element(event.target).closest('.operator-wrapper');
					operatorWrapper.find('.operator').text(newOperator);
					operatorWrapper.removeClass('active');
					scope.query.expression = buildExpression();
					console.log(scope.query);
				}

				//Calculates position of brackets and adds them in the DOM
				scope.addBrackets = function(event) {
					var parent = angular.element(event.target).closest('.operator-wrapper');
					var operatorId = parent.attr('data-operator-id');
					var next = parent.next();
					var prev = parent.prev();
					var leftBracket = '<span class="bracket opening-bracket" data-bracket-id="' + operatorId + '">(</span>';
					var rightBracket = '<span class="bracket closing-bracket" data-bracket-id="' + operatorId + '">)</span>';
					// if next element is not an opening bracket then add a bracket
					if (!next.hasClass('bracket opening-bracket')) {
						next.after(rightBracket);
					} else {
						//if next element is a bracket the recursively iterate to the next of next elements
						//counting the no. of opening and closing brackets encountered
						//when they become equal add another colsing bracket 
						next = next.next();
						openingBracketsCount = 1;
						while (next.length > 0) {;
							if (next.hasClass('bracket opening-bracket')) {
								openingBracketsCount += 1;
							} else if (next.hasClass('bracket closing-bracket')) {
								openingBracketsCount -= 1;
								if (openingBracketsCount == 0) {
									angular.element(next).after(rightBracket);
									break;
								}
							}
							next = next.next();
						}
					}
					// if prev element is not a closing bracket then add a bracket
					if (!prev.hasClass('bracket closing-bracket')) {
						prev.before(leftBracket);
					} else {
						//if prev element is a bracket the recursively iterate to the prev of prev elements
						//counting the no. of opening and closing brackets encountered
						//when they become equal add another opening bracket 
						prev = prev.prev();
						closingBracketsCount = 1;
						while (prev.length > 0) {
							if (prev.hasClass('bracket closing-bracket')) {
								closingBracketsCount += 1;
							} else if (prev.hasClass('bracket opening-bracket')) {
								closingBracketsCount -= 1;
								if (closingBracketsCount == 0) {
									angular.element(prev).before(leftBracket);
									break;
								}
							}
							prev = prev.prev();
						}
					}
					parent.removeClass('active');
					getBracketIds();
					scope.query.expression = buildExpression();
				}

				//Removes brackets corresponding to a sub query
				scope.removeBrackets = function(event) {
					var parent = angular.element(event.target).closest('.operator-wrapper');
					var operatorId = parent.attr('data-operator-id');
					var builderWrapper = parent.closest('.query-builder-wrapper');
					builderWrapper.find('.bracket[data-bracket-id="' + operatorId + '"]').remove();
					parent.removeClass('active');
					getBracketIds();
					scope.query.expression = buildExpression();
				}

				//Gets the data-bracket-Ids of current brackets in the DOM
				var getBracketIds = function() {
					var brackets = ele.find('.query-builder-wrapper').find('.bracket');
					var temp = [];
					for (var i = 0; i < brackets.length; i++) {
						bracketId = angular.element(brackets[i]).attr('data-bracket-id');
						temp.push(parseInt(bracketId));
					}
					scope.query.bracketIds = temp;
				}

				//Builds an expression corresponding to current query
				var buildExpression = function() {
					var expression = [];
					var temp = angular.element('.query-builder-wrapper').children();
					for (var i = 0; i < temp.length; i++) {;
						var elem = angular.element(temp[i]);
						var eleText = elem.text();
						if (elem.hasClass('bracket')) {
							expression.push(eleText);
						} else if (elem.hasClass('operator-wrapper')) {
							eleText = elem.find('.operator').text();
							expression.push(eleText);
						} else {
							eleText = elem.attr('data-opererand-id');
							expression.push(parseInt(eleText));
						}
					}
					return expression.join('');
				}

				ele.append('<div class="query-builder-wrapper"></div>');
				ele.append('<div class="add-sub-query"></div>');
				ele.find('.add-sub-query').append($compile(getTemplates(0).addMoreBtn)(scope));
				if (!scope.query.expression) {
					ele.find('.query-builder-wrapper').append($compile(getTemplates(0).operandSelection)(scope));
				} else {
					buildTemplate(ele, scope.query.expression, scope.query.operands, scope.query.bracketIds, scope);
				}
				angular.element('.query-builder-wrapper').on('click', '.popover-parent', function(e) {
					e.stopPropagation();
				});
				angular.element('body').on('click', function() {
					angular.element('.query-builder-wrapper .popover-parent').removeClass('active');
				})
			}
		}
	});

	app.factory('templatesFactory', function($compile) {

		//Returns templates for sub query popover, operation popover and add more button
		var getTemplates = function(currIndex) {
			currIndex = parseInt(currIndex);
			var templates = {};
			templates.addMoreBtn = '<span class="new-entry-btn" ng-click="newEntry($event)" data-curr-index="{{currIndex}}"><span class="plus-icon">+</span></span>';
			templates.operator = '<div class="operator-wrapper popover-parent" data-operator-id="' + currIndex + '">' +
				'<span class="operator query-builder-label neutral" ng-click="togglePopover($event)">AND</span>' +
				'<div class="operator-popover query-popover">' +
					'<div class="popover-body">' +
						'<span class="triangle"></span>' +
						'<span class="operator-option" ng-click="changeOperator(\'+\', $event)">+</span>' +
						'<span class="operator-option" ng-click="changeOperator(\'-\', $event)">-</span>' +
						'<span class="operator-option" ng-click="changeOperator(\'*\', $event)">*</span>' +
						'<span class="operator-option" ng-click="changeOperator(\'/\', $event)">/</span>' +
						'<span class="operator-option" ng-click="changeOperator(\'AND\', $event)">AND</span>' +
						'<span class="operator-option" ng-click="changeOperator(\'OR\', $event)">OR</span>' +
						'<span class="operator-option add-bracket" ng-click="addBrackets($event)" ng-hide="query.bracketIds.indexOf(' + currIndex + ') > -1">(brackets)</span>' +
						'<span class="operator-option remove-bracket" ng-show="query.bracketIds.indexOf(' + currIndex + ') > -1" ng-click="removeBrackets($event)"><strike>(brackets)</strike></span>' +
					'</div>' +
				'</div>' +
			'</div>';
			templates.operandSelection = '<div class="operand-selection popover-parent" data-opererand-id="' + currIndex + '">' +
				'<span class="query-builder-btn query-builder-btn-dropdown query-text" ng-click="togglePopover($event)">' +
					'<span ng-if="query.operands[' + currIndex + '].colName || query.operands[' + currIndex + '].custom">' +
						'{{query.operands[' + currIndex + '].colName+" "+query.operands[' + currIndex + '].operation+" "+query.operands[' + currIndex + '].value+""+query.operands[' + currIndex + '].custom}}'+
					'</span>' +
					'<span ng-hide="query.operands[' + currIndex + '].colName || query.operands[' + currIndex + '].custom">Enter Query</span>' +
				'</span>' +
				'<div class="operand-popover query-popover">' +
					'<div class="operand-popover-content">' +
						'<span class="triangle"></span>' +
						'<div class="popover-header">' +
							'<div class="heading">' +
								'<span>Query Type</span>' +
							'</div>' +
							'<div class="query-types">' +
								'<div class="query-type">' +
									'<input type="radio" name="query-type-' + currIndex + '" id="query-type-' + currIndex + '-basic" value="basic" ng-model="query.operands[' + currIndex + '].type" ng-change="changeQueryType(' + currIndex + ',\'basic\' )"/>' +
									'<label for="query-type-' + currIndex + '-basic">Basic</label>' +
								'</div>' +
								'<div class="query-type">' +
									'<input type="radio" name="query-type-' + currIndex + '" id="query-type-' + currIndex + '-custom" value="custom" ng-model="query.operands[' + currIndex + '].type" ng-change="changeQueryType(' + currIndex + ',\'custom\' )"/>' +
									'<label for="query-type-' + currIndex + '-custom">Custom</label>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<div class="popover-body">' +
							'<div ng-show="query.operands[' + currIndex + '].type==\'basic\'">' +
								'<div class="col-name-wrapper">' +
									'<label>Select Column</label>' +
									'<select ng-model="query.operands[' + currIndex + '].colName" ng-options="col for col in columns"></select>'+
								'</div>' +
								'<div class="operation-wrapper">' +
									'<label>Select Operation</label>' +
									'<select ng-model="query.operands[' + currIndex + '].operation" ng-options="opreration for opreration in operations">'+
									'</select>' +
								'</div>' +
								'<div class="value-wrapper">' +
									'<label>Value</label>' +
									'<input type="text" ng-model="query.operands[' + currIndex + '].value" />' +
								'</div>' +
							'</div>' +
							'<div ng-show="query.operands[' + currIndex + '].type==\'custom\'">' +
								'<textarea ng-model="query.operands[' + currIndex + '].custom" plaveholder="Enter custom sub query"></textarea>' +
							'</div>' +
							'<div class="done-btn-wrapper">' +
								'<button class="query-builder-btn small no-margins" ng-click="togglePopover($event)">Done</button>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';
			return templates;
		}

		//Builds/Prepopulate query in DOM in case scope.data is present
		var buildTemplate = function(ele, expression, operands, bracketIds, scope) {
			var bracketCount = 0;
			var expArray = expression.split(/((?:\(|\)|[A-Z]+|\d+))/g);
			var currOperand = 0;
			expressionArray = expArray.filter(function(e) {
				return e != '';
			})
			for (var i = 0; i < expressionArray.length; i++) {
				var temp = expressionArray[i];
				var template = getTemplates(i);
				if (temp == '(') {
					var bracketId = bracketIds[bracketCount];
					var leftBracket = '<span class="bracket opening-bracket" data-bracket-id="' + bracketId + '">(</span>';
					ele.find('.query-builder-wrapper').append(leftBracket);
					bracketCount += 1;
				} else if (temp == ')') {
					var bracketId = bracketIds[bracketCount];
					var rightBracket = '<span class="bracket closing-bracket" data-bracket-id="' + bracketId + '">)</span>';
					ele.find('.query-builder-wrapper').append(rightBracket);
					bracketCount += 1;
				} else if (temp == 'AND' || temp == 'OR') {
					var template = getTemplates(parseInt(currOperand));
					ele.find('.query-builder-wrapper').append($compile(template.operator)(scope));
				} else if (!isNaN(temp)) {
					var template = getTemplates(parseInt(temp));
					ele.find('.query-builder-wrapper').append($compile(template.operandSelection)(scope));
					currOperand = parseInt(currOperand);
					currOperand += 1;
				}
			}
		}
		return {
			get: getTemplates,
			build: buildTemplate
		}
	})

})(angular);