/*

Copyright (c) 2008 Juriy Zaytsev (kangax@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

(function(){
  
  function isHostMethod(o, m) {
    var t = typeof(o[m]);
    return t == 'function' || !!(t == 'object' && o[m]) || t == 'unknown';
  };
  
  var features = { };
  var bugs = { };
  
  // Safari returns "function" as typeof HTMLCollection
  (function(){
    features.TYPEOF_NODELIST_IS_FUNCTION = (typeof document.getElementsByTagName('*') == 'function');
  })();

  // IE returns comment nodes in getElementsByTagName results
  (function(){
    if (isHostMethod(document, 'createElement')) {
      var el = document.createElement('div');
      el.innerHTML = '<span>a</span><!--b-->';
      var lastNode = el.getElementsByTagName('*')[1];
      bugs.GETELEMENTSBYTAGNAME_RETURNS_COMMENT_NODES = !!(lastNode && lastNode.nodeType === 8);
      el = lastNode = null;
    }
  })();
  
  // name attribute can not be set at run time in IE
  // http://msdn.microsoft.com/en-us/library/ms536389.aspx
  (function(){
    var elForm = document.createElement('form');
    var elInput = document.createElement('input');
    var root = document.documentElement;
    elInput.setAttribute('name', 'test');
    elForm.appendChild(elInput);
    // Older Safari (e.g. 2.0.2) populates "elements" collection only when form is within a document
    root.appendChild(elForm);
    bugs.SETATTRIBUTE_IGNORES_NAME_ATTRIBUTE = (typeof elForm.elements['test'] == 'undefined');
    root.removeChild(elForm);
    elForm = elInput = null;
  })();
  
  (function(){
    var el = document.createElement('div');
    el.__foo = 'bar';
    bugs.ELEMENT_PROPERTIES_ARE_ATTRIBUTES = (el.getAttribute('__foo') === 'bar');
    el = null;
  })();
  
  (function(){
    var el = document.createElement('div');
    features.IS_TRANSFORMATION_SUPPORTED = ('WebkitTransform' in el.style) || ('MozTransform' in el.style);
    el = null;
  })();
  
  features.IS_TAGNAME_UPPERCASED = /[A-Z]/.test(document.documentElement.tagName);
  
  (function(){
    var el = document.createElement('div'),
        el2 = document.createElement('span');
    el2.className = 'Test';
    el.appendChild(el2);
    bugs.QUERY_SELECTOR_IGNORES_CAPITALIZED_VALUES = ('querySelector' in el)
      ? (el.querySelector('.Test') !== null) 
      : null;
    el = el2 = null;
  })();
  
  features.ARRAY_PROTOTYPE_SLICE_CAN_CONVERT_NODELIST_TO_ARRAY = (function(){
    try {
      return (Array.prototype.slice.call(document.forms, 0) instanceof Array);
    } catch(e) { };
    return false;
  })();
  
  features.EVENT_HANDLERS_ARE_FIFO = (function(){
    function addEvent(element, name, handler) {
      if (element.addEventListener) {
        element.addEventListener(name, handler, false);
      }
      else if (element.attachEvent) {
        element.attachEvent("on" + name, handler);
      }
    };
    function removeEvent(element, name, handler) {
      if (element.removeEventListener) {
        element.removeEventListener(name, handler, false);
      } 
      else if (element.detachEvent) {
        element.detachEvent("on" + name, handler);
      }
    };
    function handler1() {
      a.push(1);
    };
    function handler2() {
      a.push(2);
    };
    var f = document.createElement('form'), a = [];
    f.action = '';
    addEvent(f, 'reset', handler1);
    addEvent(f, 'reset', handler2);
    f.reset();
    removeEvent(f, 'reset', handler1);
    removeEvent(f, 'reset', handler2);
    f = null;
    return (a[0] === 1);
  })();
  
  features.WINDOW_EVAL_EVALUATES_IN_GLOBAL_SCOPE = (function(){
    var fnId = '__eval' + Number(new Date()),
        passed = false;
        
    window.eval('function ' + fnId + '(){}');
    passed = (fnId in window);
    if (passed) {
      delete window[fnId];
    }
    return passed;
  })();
  
  (function(){
    
    features.IS_EVENT_METAKEY_PRESENT = false;
    features.IS_DOM2_EVENT_INTERFACE_IMPLEMENTED = false;
    features.IS_EVENT_SRCELEMENT_PRESENT = false;
    
    var i = document.createElement('input'),
        root = document.documentElement;
    if (i) {
      i.type = 'checkbox';
      i.style.display = 'none';
      i.onclick = function(e) {
        e = e || window.event;
        features.IS_EVENT_METAKEY_PRESENT = ('metaKey' in e);
        features.IS_DOM2_EVENT_INTERFACE_IMPLEMENTED = (('preventDefault' in e) && ('stopPropagation' in e));
        features.IS_EVENT_SRCELEMENT_PRESENT = ('srcElement' in e);
      };
      root.appendChild(i);
      i.click();
      root.removeChild(i);
      i.onclick = null;
      i = null;
    }
  })();
  
  bugs.STRING_PROTOTYPE_REPLACE_IGNORES_FUNCTIONS = ('a'.replace('a', function(){ return '' }).length !== 0);
  
  bugs.ARRAY_PROTOTYPE_CONCAT_ARGUMENTS_BUGGY = (function(){
    if (arguments instanceof Array) {
      return [].concat(arguments)[0] !== 1;
    }
    return null;
  })(1,2);
  
  features.ARGUMENTS_INSTANCEOF_ARRAY = (function(){ return arguments instanceof Array; })();
  
  bugs.PROPERTIES_SHADOWING_SAMENAMED_DONTENUM_ONES_ARE_ENUMERABLE = (function(){
    for (var prop in { toString: true }) {
      return false;
    }
    return true;
  })();
  
  bugs.IS_REGEXP_WHITESPACE_CHARACTER_CLASS_BUGGY = (function(){
    var s = "\x09\x0B\x0C\x20\xA0\x0A\x0D\u2028\u2029";
    if (s.replace) {
      return s.replace(/\s+/, '').length !== 0;
    }
    return null;
  })();
  
  bugs.IS_STRING_PROTOTYPE_REPLACE_REGEXP_BUGGY = (function(){
    var s = 'a_b';
    if (s.split) {
      return s.split(/(_)/).length !== 3;
    }
    return null;
  })();
  
  bugs.NEWLINES_IGNORED_AS_INNERHTML_OF_PRE_ELEMENT = (function(){
    var element = document.createElement('pre'), 
        isIgnored = false;
    if (element) {
      element.innerHTML = 'a\nb';
      isIgnored = (element.innerHTML.charAt(1) !== '\n');
      element = null;
      return isIgnored;
    }
    return null;
  })();
  
  bugs.SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
    var el = document.createElement('select'), 
        isBuggy = true;
    if (el) {
      el.innerHTML = '<option value="test">test<\/option>';
      if (el.options[0]) {
        isBuggy = el.options[0].nodeName.toLowerCase() !== 'option';
      }
      el = null;
      return isBuggy;
    }
    return null;
  })();
  
  bugs.TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
    var isBuggy = true;
    try {
      var el = document.createElement('table');
      if (el) {
        el.innerHTML = '<tbody><tr><td>test<\/td><\/tr><\/tbody>';
        isBuggy = !el.tBodies[0];
        el = null;
        return isBuggy;
      }
    } catch(e) {
      return isBuggy;
    };
    return null;
  })();
  
  bugs.SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function(){
    var s = document.createElement('script'), 
        passed = false;
    try {
      s.appendChild(document.createTextNode(''));
      passed = !!(s.firstChild && s.firstChild.nodeType === 3);
    } catch(e) { };
    s = null;
    return !passed;
  })();
  
  bugs.DOCUMENT_GETELEMENTBYID_CONFUSES_IDS_WITH_NAMES = (function(){
    
    // need to feature test all these DOM methods before calling them
    var num = Number(new Date()),
        name = '__test_' + num,
        head = document.getElementsByTagName('head')[0],
        isBuggy = false, 
        el;
    
    try {
      el = document.createElement('<input name="'+ name +'">');
    } catch(e) {
      el = document.createElement('input');
      el.name = name;
    }
    
    head.appendChild(el);
    var testElement = document.getElementById(name);
    isBuggy = !!(testElement && (testElement.nodeName.toUpperCase() === 'INPUT'));
    head.removeChild(el);
    el = null;
    return isBuggy;
  })();
  
  bugs.DOCUMENT_GETELEMENTBYID_IGNORES_CASE = (function(){
    var el = document.createElement('script'),
        head = document.getElementsByTagName('head')[0];
    el.type = 'text/javascript';
    el.id = 'A';
    head.appendChild(el);
    var buggy = !!document.getElementById('a');
    head.removeChild(el);
    el = null;
    return buggy;
  })();

  this.__features = features;
  this.__bugs = bugs;
  
})();