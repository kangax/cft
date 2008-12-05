(function(){
  var map = {
    TYPEOF_NODELIST_IS_FUNCTION: 'Safari 2+',
    ARGUMENTS_INSTANCEOF_ARRAY: 'Opera',
    PROPERTIES_SHADOWING_SAMENAMED_DONTENUM_ONES_ARE_ENUMERABLE: '<=IE6',
    STRING_PROTOTYPE_REPLACE_IGNORES_FUNCTIONS: 'Safari <=2.0.2',
    ELEMENT_PROPERTIES_ARE_ATTRIBUTES: 'IE',
    SETATTRIBUTE_IGNORES_NAME_ATTRIBUTE: 'IE <=7',
    GETELEMENTSBYTAGNAME_RETURNS_COMMENT_NODES: 'IE',
    NEWLINES_IGNORED_AS_INNERHTML_OF_PRE_ELEMENT: 'IE',
    ARRAY_PROTOTYPE_CONCAT_ARGUMENTS_BUGGY: 'Opera <9.5',
    SELECT_ELEMENT_INNERHTML_BUGGY: 'IE',
    TABLE_ELEMENT_INNERHTML_BUGGY: 'IE',
    SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING: 'IE',
    IS_EVENT_SRCELEMENT_PRESENT: 'IE, Opera, Chrome, Safari 2+',
    IS_TRANSFORMATION_SUPPORTED: 'Chrome, FF3.1+',
    DOCUMENT_GETELEMENTBYID_CONFUSES_IDS_WITH_NAMES: 'IE <=7',
    DOCUMENT_GETELEMENTBYID_IGNORES_CASE: 'IE <=7',
    WINDOW_EVAL_EVALUATES_IN_GLOBAL_SCOPE: 'Firefox, Safari 3.2.1, Opera 9.5+'
  }
  function createElement(element, text) {
    var element = document.createElement(element);
    if (typeof text != 'undefined') {
      element.appendChild(document.createTextNode(text));
    }
    return element;
  }
  
  function printTable(data, caption) {
    var tableElement = document.createElement('table');
    var tbodyElement = document.createElement('tbody');
    var theadElement = document.createElement('thead');

    var trElement, value;

    var header = createElement('h2', caption);
    document.body.appendChild(header);

    for (var prop in data) {
      trElement = document.createElement('tr');

      tdNameElement = createElement('td', prop);
      tdNameElement.className = 'name';

      value = String(data[prop] === null ? 'N/A' : data[prop]);
      tdValueElement = createElement('td', value.toUpperCase());
      tdValueElement.className = value;
      
      value = map[prop] || '';
      tdBrowserElement = createElement('td', value);

      trElement.appendChild(tdNameElement);
      trElement.appendChild(tdValueElement);
      trElement.appendChild(tdBrowserElement);

      tbodyElement.appendChild(trElement);
    }
    
    var thName = createElement('th', 'Name');
    var thValue = createElement('th', 'Value');
    var thBrowser = createElement('th', 'Affected browsers');
    
    theadElement.appendChild(thName);
    theadElement.appendChild(thValue);
    theadElement.appendChild(thBrowser);
    
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    
    document.body.appendChild(tableElement);
  }
  
  printTable(this.__features, 'Features:');
  printTable(this.__bugs, 'Bugs:');
  
})();

(function(){
  var valueCell, codeCell
  for (var prop in this.__features) {
    if (valueCell = document.getElementById('__' + prop)) {
      valueCell.appendChild(document.createTextNode(this.__features[prop]));
      valueCell.className = String(this.__features[prop]);
      if (codeCell = document.getElementById('__' + prop + '__code')) {
        codeCell.appendChild(document.createTextNode(this.__features[prop]))
      }
    }
  }
})();