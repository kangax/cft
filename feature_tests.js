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
  
  var t = new Date();
  
  function isHostMethod(o, m) {
    var t = typeof(o[m]);
    return t == 'function' || !!(t == 'object' && o[m]) || t == 'unknown';
  };
  
  var features = { };
  var bugs = { };
  
  features.IS_TRANSFORMATION_SUPPORTED = (features.__IS_TRANSFORMATION_SUPPORTED = function(){
    var el = document.createElement('div');
    var isSupported = ('WebkitTransform' in el.style) || ('MozTransform' in el.style);
    el = null;
    return isSupported;
  })();
  
  features.IS_TAGNAME_UPPERCASED = (features.__IS_TAGNAME_UPPERCASED = function(){
    return /[A-Z]/.test(document.documentElement.tagName);
  })();
  
  bugs.QUERY_SELECTOR_IGNORES_CAPITALIZED_VALUES = (bugs.__QUERY_SELECTOR_IGNORES_CAPITALIZED_VALUES = function(){
    var el = document.createElement('div'),
        el2 = document.createElement('span'),
        isBuggy = false;
    el2.className = 'Test';
    el.appendChild(el2);
    isBuggy = ('querySelector' in el) ? (el.querySelector('.Test') !== null) : null;
    el = el2 = null;
    return isBuggy;
  })();
  
  features.ARRAY_PROTOTYPE_SLICE_CAN_CONVERT_NODELIST_TO_ARRAY = (features.__ARRAY_PROTOTYPE_SLICE_CAN_CONVERT_NODELIST_TO_ARRAY = function(){
    try {
      return (Array.prototype.slice.call(document.forms, 0) instanceof Array);
    } catch(e) { };
    return false;
  })();
  
  features.EVENT_HANDLERS_ARE_FIFO = (features.__EVENT_HANDLERS_ARE_FIFO = function(){
    function addEvent(element, name, handler) {
      if (element.addEventListener) {
        element.addEventListener(name, handler, false);
      }
      else if (element.attachEvent) {
        element.attachEvent("on" + name, handler);
      }
    }
    function removeEvent(element, name, handler) {
      if (element.removeEventListener) {
        element.removeEventListener(name, handler, false);
      } 
      else if (element.detachEvent) {
        element.detachEvent("on" + name, handler);
      }
    }
    function handler1() {
      a.push(1);
    }
    function handler2() {
      a.push(2);
    }
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
  
  features.WINDOW_EVAL_EVALUATES_IN_GLOBAL_SCOPE = (features.__WINDOW_EVAL_EVALUATES_IN_GLOBAL_SCOPE = function(){
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
  
  features.ARGUMENTS_INSTANCEOF_ARRAY = (features.__ARGUMENTS_INSTANCEOF_ARRAY = function(){ 
    return arguments instanceof Array;
  })();
  
  features.IS_NATIVE_HAS_ATTRIBUTE_PRESENT = (features.__IS_NATIVE_HAS_ATTRIBUTE_PRESENT = function(){
    var i = document.createElement('iframe'),
        root = document.documentElement,
        frames = window.frames;
        
    i.style.display = 'none';
    root.appendChild(i);
    frames[frames.length-1].document.write('<html><head><title></title></head><body></body></html>');
    var isPresent = ('hasAttribute' in frames[frames.length-1].document.documentElement);
    root.removeChild(i);
    i = null;
    return isPresent;
  })();
  
  // BUGGIES
  
  // Safari returns "function" as typeof HTMLCollection
  bugs.TYPEOF_NODELIST_IS_FUNCTION = (bugs.__TYPEOF_NODELIST_IS_FUNCTION = function(){
     return (typeof document.getElementsByTagName('*') == 'function');
  })();

  // IE returns comment nodes in getElementsByTagName results
  bugs.GETELEMENTSBYTAGNAME_RETURNS_COMMENT_NODES = (bugs.__GETELEMENTSBYTAGNAME_RETURNS_COMMENT_NODES = function(){
    if (document.createElement) {
      var el = document.createElement('div');
      var buggy = false;
      el.innerHTML = '<span>a</span><!--b-->';
      var lastNode = el.getElementsByTagName('*')[1];
      buggy = !!(lastNode && lastNode.nodeType === 8);
      el = lastNode = null;
      return buggy;
    }
    return null;
  })();
  
  // name attribute can not be set at run time in IE
  // http://msdn.microsoft.com/en-us/library/ms536389.aspx
  (bugs.__SETATTRIBUTE_IGNORES_NAME_ATTRIBUTE = function(){
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
  
  bugs.ELEMENT_PROPERTIES_ARE_ATTRIBUTES = (bugs.__ELEMENT_PROPERTIES_ARE_ATTRIBUTES = function(){
    var el = document.createElement('div'), 
        buggy = false;
    el.__foo = 'bar';
    buggy = (el.getAttribute('__foo') === 'bar');
    el = null;
    return buggy;
  })();
  
  bugs.STRING_PROTOTYPE_REPLACE_IGNORES_FUNCTIONS = (bugs.__STRING_PROTOTYPE_REPLACE_IGNORES_FUNCTIONS = function(){
    return ('a'.replace('a', function(){ return '' }).length !== 0);
  })();
  
  bugs.ARRAY_PROTOTYPE_CONCAT_ARGUMENTS_BUGGY = (bugs.__ARRAY_PROTOTYPE_CONCAT_ARGUMENTS_BUGGY = function(){
    if (arguments instanceof Array) {
      return [].concat(arguments)[0] !== 1;
    }
    return null;
  })(1,2);
  
  bugs.PROPERTIES_SHADOWING_DONTENUM_ARE_ENUMERABLE = (bugs.__PROPERTIES_SHADOWING_DONTENUM_ARE_ENUMERABLE = function(){
    for (var prop in { toString: true }) {
      return false;
    }
    return true;
  })();
  
  bugs.IS_REGEXP_WHITESPACE_CHARACTER_CLASS_BUGGY = (bugs.__IS_REGEXP_WHITESPACE_CHARACTER_CLASS_BUGGY = function(){
    var s = "\x09\x0B\x0C\x20\xA0\x0A\x0D\u2028\u2029";
    if (s.replace) {
      return s.replace(/\s+/, '').length !== 0;
    }
    return null;
  })();
  
  bugs.IS_STRING_PROTOTYPE_REPLACE_REGEXP_BUGGY = (bugs.__IS_STRING_PROTOTYPE_REPLACE_REGEXP_BUGGY = function(){
    var s = 'a_b';
    if (s.split) {
      return s.split(/(_)/).length !== 3;
    }
    return null;
  })();
  
  bugs.PRE_ELEMENTS_IGNORE_NEWLINES = (bugs.__PRE_ELEMENTS_IGNORE_NEWLINES = function(){
    var el = document.createElement('pre');
    var root = document.documentElement;
    el.appendChild(document.createTextNode('xx'));
    root.appendChild(el);
    var initialHeight = el.offsetHeight;
    el.firstChild.nodeValue = 'x\nx';
    // check if `offsetHeight` changed after adding '\n' to the value
    var isIgnored = (el.offsetHeight === initialHeight);
    root.removeChild(el);
    el = null;
    return isIgnored;
  })();
  
  bugs.SELECT_ELEMENT_INNERHTML_BUGGY = (bugs.__SELECT_ELEMENT_INNERHTML_BUGGY = function(){
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
  
  bugs.TABLE_ELEMENT_INNERHTML_BUGGY = (bugs.__TABLE_ELEMENT_INNERHTML_BUGGY = function(){
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
  
  bugs.SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (bugs.__SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = function(){
    var s = document.createElement('script'), 
        passed = false;
    try {
      s.appendChild(document.createTextNode(''));
      passed = !!(s.firstChild && s.firstChild.nodeType === 3);
    } catch(e) { };
    s = null;
    return !passed;
  })();
  
  bugs.DOCUMENT_GETELEMENTBYID_CONFUSES_IDS_WITH_NAMES = (bugs.__DOCUMENT_GETELEMENTBYID_CONFUSES_IDS_WITH_NAMES = function(){
    
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
  
  bugs.DOCUMENT_GETELEMENTBYID_IGNORES_CASE = (bugs.__DOCUMENT_GETELEMENTBYID_IGNORES_CASE = function(){
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
  
  this.__totalTime = (new Date() - t);

  this.__features = features;
  this.__bugs = bugs;
})();