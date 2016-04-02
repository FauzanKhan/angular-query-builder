;(function(angular){

  var app = angular.module("ngQueryBuilder", []);

  app.directive('queryBuilder', function($compile, templates){
    return {
      restrict: 'EA',
      scope : {
        'data' : '=',
        'columns': '=',
        'operations': '=',
      },
      link: function(scope, ele, attr){
        var query = scope.data;
        var getTemplates = templates.get;
        var customQuery = {
          type: 'custom',
          colName: '',
          operation: '',
          value: '',
          custom: ''
        }
        var basicQuery = {
          type: 'basic',
          colName: '',
          operation: '',
          value: '',
          custom: ''
        }
        scope.query = query;
        var currIndexTemp = query.expression ? query.expression.match(/[^A-Za-z()]/g) : 0;
        scope.currIndex = query.expression ? currIndexTemp[currIndexTemp.length - 1] : 0;
        query.expression = query.expression ? query.expression : null;//query.expression.split(/([^A-Za-z])/g) : null;
        query.operands = query.operands || [angular.copy(basicQuery)];
        query.bracketIds = query.bracketIds || [];
        scope.togglePopover = function(event){
          var isVisible = angular.element(event.target).closest('.popover-parent').hasClass('active');
          angular.element('.popover-parent').removeClass('active');
          if(!isVisible)
             angular.element(event.target).closest('.popover-parent').addClass('active');
        }
        scope.newEntry = function(event){
          scope.currIndex += 1;
          currIndex = scope.currIndex;
          scope.query.operands.push(angular.copy(basicQuery));
          var templates = getTemplates(currIndex);
          ele.find('.query-builder-wrapper').append($compile(templates.operator)(scope));
          ele.find('.query-builder-wrapper').append($compile(templates.operandSelection)(scope));
          scope.query.expression = buildExpression();
          console.log(scope.query);
        }
        scope.changeQueryType = function(index, queryType){
          if(queryType == 'basic')
            scope.query.operands[index] = angular.copy(basicQuery);
          else
             scope.query.operands[index] = angular.copy(customQuery);
        }
        scope.changeOperator = function(newOperator, event){
          var operatorWrapper = angular.element(event.target).closest('.operator-wrapper');
          operatorWrapper.find('.operator').text(newOperator);
          operatorWrapper.removeClass('active');
          scope.query.expression = buildExpression();
        }
        scope.addBrackets = function(event){
          var parent = angular.element(event.target).closest('.operator-wrapper');
          var operatorId = parent.attr('data-operator-id');
          var next = parent.next();
          var prev = parent.prev();
          var leftBracket = '<span class="bracket opening-bracket" data-bracket-id="'+operatorId+'">(</span>';
          var rightBracket = '<span class="bracket closing-bracket" data-bracket-id="'+operatorId+'">)</span>';
          console.log("next", next, "prev", prev);
          if(!next.hasClass('bracket opening-bracket')){
            next.after(rightBracket);
            // break;
          }

          else{
            // var temp = next.nextAll('.bracket.closing-bracket');
            // angular.element(temp[temp.length-1]).after(rightBracket);
            next = next.next();
            openingBracketsCount = 1;
            while(next.length > 0){
              ;
              if(next.hasClass('bracket opening-bracket')){
                openingBracketsCount+=1;
              }
              else if(next.hasClass('bracket closing-bracket')){
                openingBracketsCount-=1;
                if(openingBracketsCount == 0){
                  angular.element(next).after(rightBracket);
                  break;
                }
              }
              next = next.next();
            }
          }

          if(!prev.hasClass('bracket closing-bracket')){
            prev.before(leftBracket);
            // break;
          }
          else{
            // var temp = prev.prevAll('.bracket.opening-bracket');
            // angular.element(temp[temp.length-1]).before(leftBracket);
            prev = prev.prev();
            closingBracketsCount = 1;
            while(prev.length > 0){
              if(prev.hasClass('bracket closing-bracket')){
                closingBracketsCount+=1;
              }
              else if(prev.hasClass('bracket opening-bracket')){
                closingBracketsCount-=1;
                if(closingBracketsCount == 0){
                  angular.element(prev).before(leftBracket);
                  break;
                }
              }
              prev = prev.prev();
            }
          }
          // parent.find('.remove-bracket').removeClass('hide');
          // angular.element(event.target).addClass('hide');
          parent.removeClass('active');
          getBracketIds();
          scope.query.expression = buildExpression();
        }

        scope.removeBrackets = function(event){
          var parent = angular.element(event.target).closest('.operator-wrapper');
          var operatorId = parent.attr('data-operator-id');
          var builderWrapper = parent.closest('.query-builder-wrapper');
          builderWrapper.find('.bracket[data-bracket-id="'+operatorId+'"]').remove();
          // parent.find('.add-bracket').removeClass('hide');
          // angular.element(event.target).addClass('hide');
          parent.removeClass('active');
          getBracketIds();
          scope.query.expression = buildExpression();
        }

        var getBracketIds = function(){
          var brackets = ele.find('.query-builder-wrapper').find('.bracket');
          var temp = [];
          for(var i=0; i<brackets.length; i++){
            bracketId = angular.element(brackets[i]).attr('data-bracket-id');
            temp.push(parseInt(bracketId));
          }
          scope.query.bracketIds = temp;
          console.log(scope.query.bracketIds);
        }

        var buildExpression = function(){
          var expression = [];
          var temp = angular.element('.query-builder-wrapper').children();
          for(var i=0; i<temp.length; i++){
            ;
            var elem = angular.element(temp[i]);
            var eleText = elem.text();
            if(elem.hasClass('bracket')){
              expression.push(eleText);
            }
            else if(elem.hasClass('operator-wrapper')){
              eleText = elem.find('.operator').text();
              expression.push(eleText);
            }
            else{
              eleText = elem.attr('data-opererand-id');
              expression.push(eleText);
            }
          }
          return expression.join('');
        }

        var buildTemplate = function(expression, operands){
          // var expArr = expression.split(/([^0-9A-Za-z])/g);
          var bracketCount = 0;
          var expressionArray = expression.split(/((?:\(|\)|[A-Z]+|\d+))/g);
          var currOperand = 0;
          _.remove(expressionArray, function(e){
            return e == '';
          })
          for(var i=0; i<expressionArray.length; i++){
            var temp = expressionArray[i];
            var template = getTemplates(i);
            if(temp == '('){
              var bracketId = scope.query.bracketIds[bracketCount];
              var leftBracket = '<span class="bracket opening-bracket" data-bracket-id="'+bracketId+'">(</span>';
              ele.find('.query-builder-wrapper').append(leftBracket);
              bracketCount += 1;
            }
            else if(temp == ')'){
              var bracketId = scope.query.bracketIds[bracketCount];
              var rightBracket = '<span class="bracket closing-bracket" data-bracket-id="'+bracketId+'">)</span>';
              ele.find('.query-builder-wrapper').append(rightBracket);
              bracketCount += 1;
            }
            else if(temp == 'AND' || temp == 'OR'){
              var template = getTemplates(parseInt(currOperand));
               ele.find('.query-builder-wrapper').append($compile(template.operator)(scope));
            }
            else if(!isNaN(temp)){
              var template = getTemplates(parseInt(temp));
              ele.find('.query-builder-wrapper').append($compile(template.operandSelection)(scope));
              currOperand += 1;
            }
          }
        }
        ele.append('<div class="query-builder-wrapper"></div>');
        ele.append('<div class="add-more-wrapper"></div>');
        ele.find('.add-more-wrapper').append($compile(getTemplates(0).addMoreBtn)(scope));
        if(!scope.query.expression){
          ele.find('.query-builder-wrapper').append($compile(getTemplates(0).operandSelection)(scope));
        }
        else{
          buildTemplate(scope.query.expression, scope.query.operands);
        }
        console.log(scope.query.bracketIds);
        angular.element('.query-builder-wrapper').on('click', '.popover-parent', function(e){
          e.stopPropagation();
        });
        angular.element('body').on('click', function(){
          angular.element('.query-builder-wrapper .popover-parent').removeClass('active');
        })
      }
    }
  });

app.factory('templates', function($compile){
  return{
    get:  function(currIndex){
          var templates = {};
          templates.addMoreBtn = '<span class="new-entry-btn" ng-click="newEntry($event)" data-curr-index="{{currIndex}}"><i class="material-icons">add_circle</i></span>';
          templates.operator = '<div class="operator-wrapper popover-parent" data-operator-id="'+currIndex+'">'+
                                  '<span class="operator query-builder-label neutral" ng-click="togglePopover($event)">AND</span>'+
                                  '<div class="operator-popover query-popover">'+
                                    '<div class="popover-body">'+
                                    '<span class="triangle"></span>'+
                                    '<span class="operator-option" ng-click="changeOperator(\'+\', $event)">+</span>'+
                                    '<span class="operator-option" ng-click="changeOperator(\'-\', $event)">-</span>'+
                                    '<span class="operator-option" ng-click="changeOperator(\'*\', $event)">*</span>'+
                                    '<span class="operator-option" ng-click="changeOperator(\'/\', $event)">/</span>'+
                                    '<span class="operator-option" ng-click="changeOperator(\'AND\', $event)">AND</span>'+
                                    '<span class="operator-option" ng-click="changeOperator(\'OR\', $event)">OR</span>'+
                                    '<span class="operator-option add-bracket" ng-click="addBrackets($event)" ng-hide="query.bracketIds.indexOf('+currIndex+') > -1">(brackets)</span>'+
                                    '<span class="operator-option remove-bracket" ng-show="query.bracketIds.indexOf('+currIndex+') > -1" ng-click="removeBrackets($event)"><strike>(brackets)</strike></span>'+
                                    '</div>'+
                                  '</div>'+
                                '</div>';
          templates.operandSelection = '<div class="operand-selection popover-parent" data-opererand-id="'+currIndex+'">'+
                                          '<span class="query-builder-btn query-builder-btn-dropdown query-text" ng-click="togglePopover($event)">'+
                                            '<span ng-if="query.operands['+currIndex+'].colName || query.operands['+currIndex+'].custom">'+
                                              '{{query.operands['+currIndex+'].colName+" "+query.operands['+currIndex+'].operation+" "+query.operands['+currIndex+'].value+""+query.operands['+currIndex+'].custom}}</span>'+
                                            '<span ng-hide="query.operands['+currIndex+'].colName || query.operands['+currIndex+'].custom">Make Selection</span>'+
                                          '</span>'+
                                          '<div class="operand-popover query-popover">'+
                                            '<div class="operand-popover-content">'+
                                            '<span class="triangle"></span>'+
                                            '<div class="popover-header">'+
                                              '<div class="heading">'+
                                                '<span>Query Type</span>'+
                                              '</div>'+
                                              '<div class="query-types">'+
                                                '<div class="query-type">'+
                                                  '<input type="radio" name="query-type-'+currIndex+'" id="query-type-'+currIndex+'-basic" value="basic" ng-model="query.operands['+currIndex+'].type" ng-change="changeQueryType('+currIndex+',\'basic\' )"/>'+
                                                  '<label for="query-type-'+currIndex+'-basic">Basic</label>'+
                                                '</div>'+
                                                 '<div class="query-type">'+
                                                  '<input type="radio" name="query-type-'+currIndex+'" id="query-type-'+currIndex+'-custom" value="custom" ng-model="query.operands['+currIndex+'].type" ng-change="changeQueryType('+currIndex+',\'custom\' )"/>'+
                                                  '<label for="query-type-'+currIndex+'-custom">Custom</label>'+
                                                '</div>'+
                                              '</div>'+
                                            '</div>'+
                                              '<div class="popover-body">'+
                                                '<div ng-show="query.operands['+currIndex+'].type==\'basic\'">'+
                                                  '<div class="col-name-wrapper">'+
                                                    '<label>Select Column</label>'+
                                                    '<select ng-model="query.operands['+currIndex+'].colName" ng-options="col for col in columns"></select>'+
                                                  '</div>'+
                                                  '<div class="operation-wrapper">'+
                                                    '<label>Select Operation</label>'+
                                                     '<select ng-model="query.operands['+currIndex+'].operation" ng-options="opreration for opreration in operations">'+
                                                    '</select>'+
                                                  '</div>'+
                                                  '<div class="value-wrapper">'+
                                                   '<label>Value</label>'+
                                                    '<input type="text" ng-model="query.operands['+currIndex+'].value" />'+
                                                  '</div>'+
                                                '</div>'+
                                                '<div ng-show="query.operands['+currIndex+'].type==\'custom\'">'+
                                                  '<textarea ng-model="query.operands['+currIndex+'].custom" plaveholder="Enter custom sub query"></textarea>'+
                                                '</div>'+
                                                '<div class="done-btn-wrapper">'+
                                                  '<button class="query-builder-btn small no-margins" ng-click="togglePopover($event)">Done</button>'+
                                                '</div>'+
                                              '</div>'+
                                            '</div>'+
                                          '</div>'+
                                        '</div>';
          return templates;
    }
  }
})

})(angular);