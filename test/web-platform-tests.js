/* globals add_completion_callback */
'use strict';
var fs = require('fs');
var Path = require('path');
var domino = require('../lib');
var Window = require('../lib/Window');

// These are the tests we currently fail.
// Some of these failures are bugs we ought to fix.
var blacklist = [
  // web-platform-tests/html/dom
  'historical',
  'interfaces',
  'interfaces.https',
  'reflection-embedded',
  'reflection-forms',
  'reflection-metadata',
  'reflection-misc',
  'reflection-obsolete',
  'reflection-tabular',
  'self-origin.sub',
  'usvstring-reflection',
  'documents dom-tree-accessors Document.body',
  'documents dom-tree-accessors Document.currentScript',
  'documents dom-tree-accessors Document.currentScript.sub',
  'documents dom-tree-accessors document.embeds-document.plugins-01',
  'documents dom-tree-accessors document.forms',
  'documents dom-tree-accessors document.head-01',
  'documents dom-tree-accessors document.images',
  'documents dom-tree-accessors document.links',
  'documents dom-tree-accessors document.scripts',
  'documents dom-tree-accessors document.title-07',
  'documents dom-tree-accessors document.title-09',
  'documents dom-tree-accessors nameditem-01',
  'documents dom-tree-accessors nameditem-02',
  'documents dom-tree-accessors nameditem-04',
  'documents dom-tree-accessors nameditem-05',
  'documents dom-tree-accessors nameditem-06',
  'documents dom-tree-accessors nameditem-07',
  'documents dom-tree-accessors nameditem-08',
  'documents dom-tree-accessors document.getElementsByName document.getElementsByName-interface',
  'documents dom-tree-accessors document.getElementsByName document.getElementsByName-liveness',
  'documents resource-metadata-management document-compatmode-06',
  'documents resource-metadata-management document-cookie',
  'documents resource-metadata-management document-lastModified-01',
  'documents resource-metadata-management document-lastModified',
  'dynamic-markup-insertion closing-the-input-stream document.close-01',
  /dynamic-markup-insertion document-write [0-9]+/,
  /dynamic-markup-insertion document-write document.write-0[12]/,
  /dynamic-markup-insertion document-write iframe_00[0-9]/,
  /dynamic-markup-insertion document-write script_00[2456789]/,
  /dynamic-markup-insertion document-write script_01[0123]/,
  /dynamic-markup-insertion document-writeln document.writeln-0[123]/,
  /dynamic-markup-insertion opening-the-input-stream 00[1789]/,
  'dynamic-markup-insertion opening-the-input-stream 010-2',
  /dynamic-markup-insertion opening-the-input-stream 01[123456]-1/,
  'dynamic-markup-insertion opening-the-input-stream document.open-01',
  'dynamic-markup-insertion opening-the-input-stream document.open-02',
  'dynamic-markup-insertion opening-the-input-stream document.open-03-frame',
  'elements global-attributes custom-attrs',
  'elements global-attributes data_unicode_attr',
  'elements global-attributes dataset-delete',
  'elements global-attributes dataset-enumeration',
  'elements global-attributes dataset-get',
  'elements global-attributes dataset-prototype',
  'elements global-attributes dataset-set',
  'elements global-attributes dataset',
  'elements global-attributes dir_auto-contained-script-L-ref',
  'elements global-attributes dir_auto-contained-script-L',
  'elements global-attributes id-attribute',
  'elements global-attributes the-lang-attribute-001',
  'elements global-attributes the-lang-attribute-002',
  'elements global-attributes the-lang-attribute-003',
  'elements global-attributes the-lang-attribute-004',
  'elements global-attributes the-lang-attribute-005',
  'elements global-attributes the-lang-attribute-006',
  'elements global-attributes the-lang-attribute-007',
  'elements global-attributes the-lang-attribute-008',
  'elements global-attributes the-lang-attribute-009',
  'elements global-attributes the-lang-attribute-010',
  'elements global-attributes the-translate-attribute-007',
  'elements global-attributes the-translate-attribute-008',
  'elements global-attributes the-translate-attribute-009',
  'elements global-attributes the-translate-attribute-010',
  'elements global-attributes the-translate-attribute-011',
  'elements global-attributes the-translate-attribute-012',
  'elements the-innertext-idl-attribute dynamic-getter',

  // web-platform-tests/dom/nodes
  'DOMImplementation-createDocument',
  'DOMImplementation-createDocumentType',
  'DOMImplementation-createHTMLDocument',
  'DOMImplementation-hasFeature',
  'Document-URL.sub',
  'Document-characterSet-normalization',
  'Document-constructor',
  /Document-contentType/,
  'Document-createAttribute',
  'Document-createComment',
  'Document-createElement-namespace',
  'Document-createEvent',
  'Document-createTreeWalker',
  'Document-getElementsByClassName',
  'Document-getElementsByTagName',
  'Document-getElementsByTagNameNS',
  'Element-childElement-null-xhtml',
  'Element-childElementCount-dynamic-add-xhtml',
  'Element-childElementCount-dynamic-remove-xhtml',
  'Element-childElementCount-nochild-xhtml',
  'Element-childElementCount-xhtml',
  'Element-children',
  'Element-classlist',
  'Element-closest',
  'Element-firstElementChild-entity-xhtml',
  'Element-firstElementChild-xhtml',
  'Element-firstElementChild-namespace-xhtml',
  'Element-getElementsByClassName',
  'Element-getElementsByTagName-change-document-HTMLNess',
  'Element-getElementsByTagName',
  'Element-getElementsByTagNameNS',
  'Element-insertAdjacentElement',
  'Element-insertAdjacentText',
  'Element-lastElementChild-xhtml',
  'Element-matches',
  'Element-nextElementSibling-xhtml',
  'Element-previousElementSibling-xhtml',
  'Element-siblingElement-null-xhtml',
  'Element-tagName',
  'MutationObserver-attributes',
  'MutationObserver-characterData',
  'MutationObserver-childList',
  'MutationObserver-disconnect',
  'MutationObserver-document',
  'MutationObserver-inner-outer',
  'MutationObserver-takeRecords',
  'Node-baseURI',
  'Node-compareDocumentPosition',
  'Node-isConnected',
  'Node-isEqualNode',
  'Node-isEqualNode-xhtml',
  'Node-nodeName-xhtml',
  'Node-normalize',
  'Node-properties',
  'NodeList-Iterable',
  'ParentNode-append',
  'ParentNode-children',
  'ParentNode-prepend',
  'ParentNode-querySelector-All-content',
  'ParentNode-querySelector-All',
  /^ProcessingInstruction-/,
  'append-on-Document',
  'attributes',
  'case',
  'insert-adjacent',
  'prepend-on-Document',
  'remove-unscopable',
  'rootNode',
  'query-target-in-load-event.part',

  // Waiting for patches to the test suite to be merged upstream:
  // https://github.com/web-platform-tests/wpt/pull/12202
  'Document-createElement',
  'Document-createElementNS',
  // https://github.com/web-platform-tests/wpt/pull/12213
  'Comment-constructor',
  'Node-textContent',
  'Text-constructor',
].map(function(s) {
  // Convert strings to equivalent regular expression matchers.
  if (typeof s === 'string') {
    return new RegExp('^' + s.replace(/[\^\\$*+?.()|{}\[\]\/]/g, '\\$&') + '$');
  } else {
    return s;
  }
});

var onBlacklist = function(name) {
  name = name.replace(/\//g, ' ').replace(/\.x?html$/, '');
  for (var i=0; i<blacklist.length; i++) {
    if (blacklist[i].test(name)) { return true; }
  }
  return false;
};

// Test suite requires Array.includes(); polyfill from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
/* jshint bitwise: false */
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {
      if (this === null || this === undefined) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = o.length >>> 0;
      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      while (k < len) {
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}
// Test suite requires Array.values() as well
if (global.Symbol && global.Symbol.iterator && !Array.prototype.values) {
  Object.defineProperty(
    Array.prototype, 'values',
    Object.getOwnPropertyDescriptor(Array.prototype, global.Symbol.iterator)
  );
}

function read(file) {
  return fs.readFileSync(Path.resolve(__dirname, '..', file), 'utf8');
}

var testharness = read(__dirname + '/web-platform-tests/resources/testharness.js');

function list(base, dir, fn) {
  var result = {};
  var fulldir = Path.resolve(__dirname, '..', base, dir);
  fs.readdirSync(fulldir).forEach(function(file) {
    var path = Path.join(dir, file);
    var stat = fs.statSync(Path.join(fulldir, file));
    if (stat.isDirectory()) {
      result[file] = list(base, path, fn);
    }
    else if (file.match(/\.x?html$/)) {
      var test = fn(path, Path.join(fulldir, file));
      if (test) result[file] = test;
    }
  });
  return result;
}

var harness = function() {
  var paths = [].slice.call(arguments);
  return paths.map(function (path) {
    return list(path, '', function(name, file) {
      if (/\/html\/dom\/reflection-original.html$/.test(file)) {
        // This is a compilation file & not a test suite.
        return; // skip
      }
      var html = read(file);
      var window = domino.createWindow(html, 'http://example.com/');
      Array.from(window.document.getElementsByTagName('iframe')).forEach(function(iframe) {
        if (iframe.src === 'http://example.com/common/dummy.xml') {
          var dummyXmlDoc = domino.createDOMImplementation().createDocument(
            'http://www.w3.org/1999/xhtml', 'html', null
          );
          dummyXmlDoc._contentType = 'application/xml';
          iframe._contentWindow = new Window(dummyXmlDoc);
          var foo = dummyXmlDoc.createElement('foo');
          foo.textContent = 'Dummy XML document';
          dummyXmlDoc.documentElement.appendChild(foo);
        }
        if (iframe.src === 'http://example.com/common/dummy.xhtml') {
          var dummyXhtml = read('test/web-platform-tests/common/dummy.xhtml');
          var dummyXhtmlAsHtml = domino.createDocument(dummyXhtml);
          // Tweak this a tiny bit, since we actually used an HTML parser not
          // an XML parser.
          dummyXhtmlAsHtml.body.textContent = '';
          // Create a proper XML document, and copy the HTML contents into it
          var dummyXhtmlDoc = domino.createDOMImplementation().createDocument(
            'http://www.w3.org/1999/xhtml', 'html', null
          );
          dummyXhtmlDoc._contentType = 'application/xhtml+xml';
          dummyXhtmlDoc.insertBefore(
            dummyXhtmlDoc.adoptNode(dummyXhtmlAsHtml.doctype),
            dummyXhtmlDoc.documentElement
          );
          dummyXhtmlDoc.documentElement.appendChild(
            dummyXhtmlDoc.adoptNode(dummyXhtmlAsHtml.head)
          );
          dummyXhtmlDoc.documentElement.appendChild(
            dummyXhtmlDoc.adoptNode(dummyXhtmlAsHtml.body)
          );
          iframe._contentWindow = new Window(dummyXhtmlDoc);
        }
      });
      window._run(testharness);
      var scripts = window.document.getElementsByTagName('script');
      scripts = [].slice.call(scripts);

      return function() {
        var listen = onBlacklist(name) ? function listenForSuccess() {
          add_completion_callback(function(tests, status) {
            var failed = tests.filter(function(t) {
              return t.status === t.FAIL || t.status === t.TIMEOUT;
            });
            if (failed.length===0) {
              throw new Error("Expected blacklisted test to fail");
            }
          });
        } : function listenForFailures() {
          add_completion_callback(function(tests, status) {
            var failed = tests.filter(function(t) {
              return t.status === t.FAIL || t.status === t.TIMEOUT;
            });
            if (failed.length) {
              throw new Error(failed[0].name+": "+failed[0].message);
            }
          });
        };
        window._run("(" + listen.toString() + ")();");

        var concatenatedScripts = scripts.map(function(script) {
          if (/^text\/plain$/.test(script.getAttribute('type')||'')) {
            return '';
          }
          if (/^(\w+|..)/.test(script.getAttribute('src')||'')) {
            var f = Path.resolve(path, script.getAttribute('src'));
            if (fs.existsSync(f)) { return read(f); }
          }
          var textContent = script.textContent;
          if (/\.xhtml$/.test(file)) {
            // hacky way to expand entities
            var txt = window.document.createElement('textarea');
            txt.innerHTML = textContent;
            textContent = txt.value;
          }
          return textContent + '\n';
        }).join("\n");
        concatenatedScripts =
          concatenatedScripts.replace(/\.attributes\[(\w+)\]/g,
                                      '.attributes.item($1)');
        // Some tests use [...foo] syntax for `Array.from(foo)`
        concatenatedScripts =
          concatenatedScripts.replace(/\[\.\.\.(\w+)\]/g,
                                      'Array.from($1)');
        // Workaround for https://github.com/w3c/web-platform-tests/pull/3984
        concatenatedScripts =
          '"use strict";\n' +
          'var x, doc, ReflectionTests;\n' +
          // Hack in globals on window object
          '"String|Boolean|Number".split("|").forEach(function(x){' +
            'window[x] = global[x];})\n' +
          // Hack in frames on window object
          'Array.prototype.forEach.call(document.getElementsByTagName("iframe"),' +
            'function(f,i){window[i]=f.contentWindow;});\n' +
          'window.setup = function(f) { f(); };\n' +
          concatenatedScripts +
          '\nwindow.dispatchEvent(new Event("load"));';

        var go = function() {
          window._run(concatenatedScripts);
        };
        try {
          go();
        } catch (e) {
          if ((!onBlacklist(name)) ||
              /^Expected blacklisted test to fail/.test(e.message||'')) {
            throw e;
          }
        }
      };
    });
  });
};

module.exports = harness(__dirname + '/web-platform-tests/html/dom',
                         __dirname + '/web-platform-tests/dom/nodes');
