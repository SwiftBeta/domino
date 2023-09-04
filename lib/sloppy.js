/* Every module should be strict. */
"use strict";

module.exports = {
  Window_run: function _run(code, file) {
    if (file) code += '\n//@ sourceURL=' + file;
    // Considering 'this' refers to a window object
    eval.call(this, code);
  },

  EventHandlerBuilder_build: function build() {
    try {
      // Assuming 'this' has properties: document, form, and element
      const defaultView = this.document.defaultView || Object.create(null);
      const doc = this.document;
      const form = this.form;
      const elem = this.element;

      return eval("(function(event){" + this.body + "})").bind({
        defaultView: defaultView,
        document: doc,
        form: form,
        element: elem
      });
    }
    catch (err) {
      return function() { throw err; };
    }
  }
};

