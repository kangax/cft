(function(){
  
  if (!('getElementsByClassName' in document)) {
    document.getElementsByClassName = function(className) {
      var all = document.getElementsByTagName('*');
      if (all.length === 0 && 'all' in document) {
        // IE5.5
        all = document.all;
      }
      if (!className) return all;
      var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
      var result = [];
      for (var i=0, len=all.length; i<len; i++) {
        if (re.test(all[i].className)) {
          result.push(all[i]);
        }
      }
      return result;
    }
  }
  
  function toggleCodeSection(trigger, action) {
    var parent = trigger.parentNode, firstCell, testName;
    if (parent) {
      parent = parent.parentNode;
      if (parent) {
        firstCell = parent.childNodes[1];
        if (firstCell) {
          testName = firstCell.firstChild.nodeValue;
        }
      }
    }
    if (testName && parent) {
      var next = parent.nextSibling;
      while (next && next.nodeType !== 1) {
        next = next.nextSibling;
      }
      if (!next) return;
      
      if (typeof action !== 'undefined') {
        if (action === 'hide') {
          next.style.display = 'none';
          trigger.firstChild.nodeValue = 'show';
          parent.style.backgroundColor = '';
        }
        else if (action === 'show') {
          next.style.display = '';
          trigger.firstChild.nodeValue = 'hide';
          parent.style.backgroundColor = '#ffc';
        }
        return;
      }
      
      if (next.style.display === 'none') {
        next.style.display = '';
        trigger.firstChild.nodeValue = 'hide';
        parent.style.backgroundColor = '#ffc';
      }
      else if (next.style.display !== 'none') {
        next.style.display = 'none';
        trigger.firstChild.nodeValue = 'show';
        parent.style.backgroundColor = '';
      }
    }
  }
  
  
  function populateTable(tbl) {
    var table = document.getElementById(tbl);
    var rows = table.tBodies[0].rows;
    for (var i=0, len=rows.length; i<len; i++) {
      var name = rows[i].cells[0].innerHTML;
      var testResult = name in __features ? __features[name] : __bugs[name];
      var value = String(testResult === null ? 'N/A' : testResult)
      if (rows[i].cells[1]) {
        rows[i].cells[1].appendChild(document.createTextNode((value + '').toUpperCase()));
        rows[i].cells[1].className = (value === 'N/A' ? 'na' : value);
      }
      var next = rows[i].nextSibling;
      while (next && next.nodeType !== 1) {
        next = next.nextSibling;
      }
      if (!next) return;
      var cell = next.cells[0];
      if (!cell) return;
      var placeholder = cell.getElementsByTagName('pre')[0];
      if (!placeholder) return;
      name = ('__' + name);
      var value = name in __features ? __features[name] : __bugs[name];
      // transform leading 4 spaces to 2
      value = (value + '').replace(/\n  /g, '\n');
      if (__bugs.PRE_ELEMENTS_IGNORE_NEWLINES) {
        value = value.replace(/\n/g, '\n\r');
      }

      placeholder.appendChild(document.createTextNode(value));
      i++;
    }
  };

  populateTable('cft-data');
  populateTable('cft-data-bugs');
  
  document.documentElement.onclick = function(e) {
    if (!e) e = window.event;
    if (!e) return;
    var target = ('target' in e) ? e.target : e.srcElement;
    
    if (target && /^a$/i.test(target.nodeName)) {
      if ((' ' + target.className + ' ').indexOf(' show-test-code ') > -1) {
        toggleCodeSection(target);
      }
      else if ((' ' + target.className + ' ').indexOf(' show-all ') > -1) {
        var all = document.getElementsByClassName('show-test-code');
        for (var i=0, len=all.length; i<len; i++) {
          toggleCodeSection(all[i], 'show');
        }
      }
      else if ((' ' + target.className + ' ').indexOf(' hide-all ') > -1) {
        var all = document.getElementsByClassName('show-test-code');
        for (var i=0, len=all.length; i<len; i++) {
          toggleCodeSection(all[i], 'hide');
        }
      }
      else {
        return true;
      }
      if (e.preventDefault) {
        e.preventDefault();
      }
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      return false;
    }
    return true;
  }
  
  if (document.body) {
    var p = document.createElement('p');
    p.className = 'total-time';
    p.innerHTML = ('Finished all tests in: <strong>' + __totalTime + '</strong>ms');
    document.body.appendChild(p);
  }
  
  var hash = document.location.hash.slice(1);
  var links = document.anchors, i = links.length;
  while (i--) {
    if (links[i].name === hash) {
      toggleCodeSection(links[i]);
      break;
    }
  }
})();