// metafunction.js

;(function (metafunction, undefined) {
 
  if (typeof global == 'undefined' && window) {  
    global = window;
  }

  /*
   * method meta
   * param alias
   * returns function object with injection and invocation methods for mocking internal 
   * references in a closure
   */
  Function.prototype.meta = Function.prototype.meta || meta; 
  function meta() {

    /*
     * argument handler that routes to injection or invocation handlers.
     */
    function f(alias) {
    
      var type = typeof arguments[0];
      var length = arguments.length;
      
      if (type == 'string') {
      
        if (length === 1 && !alias.match(/^[\s]+$/)) {
          f.descriptor.source = f.descriptor.source.replace(/function[^\(]*/, 
                                                            'function ' + alias) + '\n;';
        }
        
        if (length === 2 && typeof arguments[1] == 'string') {
          f.inject(arguments[0], arguments[1]);
        }
        
      }
      
      if (type == 'object' && arguments[0]) {
        f.descriptor.context = arguments[0];
      }
      
      if (type == 'function') {
        f.invoke(arguments[0], (arguments[1] || f.descriptor.context));
      }

      return f;
    };

    // fill out our descriptor object
    f.descriptor = descriptor(this);
    
    /*
     * returns a copy of an inner function matching the given name.
     */
    f.extract = function extract(name) {

      var source = f.descriptor.source;
      var match = source.match('function ' + name);
      var brace = 0;
      var result = '';
      var ch;

      if (match && match.index > 0) {
        /*
         * extract function body char by char...
         */
        var i = match.index;
        for (; i < source.length; i++) {
        
          ch = source.charAt(i);
          result = result + ch;
          
          if (ch === '{') {
            brace += 1;
          } else if (ch === '}') {
            brace -= 1;
            
            if (brace === 0) {
              break;
            }
          }
        }
      }
      
      /*
       * use sandbox() to "compile" function string in new Function and avoid new globals.
       */
      return sandbox(function () {
        return Function('return ' + result)();
      });
    };
    
    /*
     * overwrite the name of a variable (key) in the function source with the new value.
     */
    f.inject = function inject(key, value) {
      
      f.descriptor.source = f.descriptor.source.replace(RegExp(key, 'g'), value);

      return f;
    };
    
    /*
     * execute the function or source with the given context object.
     * function is invoked with context set to 'this' scope 
     */
    f.invoke = function invoke(fn, context) {
      
      if (typeof fn != 'function') {
        fn = 'function(){' + fn + '}';
      }

      runInNewContext(f.descriptor.source + ';\r\n(' + fn.toString() + ').call(context);', 
                      context);

      return f;
    };
    
    return f;
  }
  
  

  /*
   * method descriptor
   * returns object describing function parts - arguments, name, returns, source
   */
  //Function.prototype.descriptor = descriptor; 
  function descriptor(fn) {
    
    var fs = fn.toString();
    var res = {};
    
    res.source = fs;
    res.arguments = fs.substring(fs.indexOf('(') + 1, fs.indexOf(')')).replace(/\s*/g, '')
                      .split(',');

    // extract name from a function expression (https://gist.github.com/dfkaye/6384439)
    var name;
    if (name = (fn.name && ['', fn.name]) || (fs.match(/function ([^\(]+)/))) {
      res.name = name[1];
    } else {
    
      // label the function as 'anonymous' in the source because function expressions must 
      // be named for use inside Function() constructor (used in runInNewContext()).
      res.name = 'anonymous';
      res.source = res.source.replace(/function[^\(]*/, 'function anonymous') + '\n;';
    }
    
    var returns;
    res.returns = [];
    if (returns = fs.match(/[^\/^\]]return ([^\n]*)/g)) {
      for (var i = 0; i < returns.length; ++i) {
        res.returns[i] = returns[i].replace(/[\s]*return[\s]+/g, '')
                                   .replace(/(\;|\r)*/g, '');
      }
    }
        
    return res;
  }; 
  
    
  ///////////////////////////////////////////////////////////////////////////////
  // runInNewContext() and sandbox() methods pulled/merged from dfkaye/vm-shim //
  ///////////////////////////////////////////////////////////////////////////////
  
  /*
   * method runInNewContext
   * param src may be a string or a function
   * param context is an optional config object of properties to be used as vars inside 
   * new scope
   * returns context
   */   
  function runInNewContext(src, context/*, filename*/) {

    context = context || {};
    
    // Object.create shim to shadow out the main global
    function F(){}
    F.prototype = (typeof Window != 'undefined' && Window.prototype) || global;
    context.global = new F;
        
    var code = ';\n';
    
    // before - set local scope vars from each context property
    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        code += 'var ' + key + ' = context[\'' + key + '\'];\n';
      }
    }
    
    typeof src == 'string' || (src = '(' + src.toString() + ')();');
    
    code += src + ';\n';
    
    // after - scoop changes back into context
    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        code += 'context[\'' + key + '\'] = ' + key + ';\n';
      }
    }
    
    //code += 'console.log(this);\n';

    // run Function() inside the sandbox so we can remove accidental globals
    return sandbox(function () {
      new (Function('context', code))(context);
      return context;
    });
  }
  
  /*
   * method sandbox - helper function for scrubbing "accidental" un-var'd globals after 
   * eval() and Function() calls. 
   * + Inconveniently, eval() and Function() don't take functions as arguments.  
   * + eval() leaks un-var'd symbols in browser & node.js.
   * + indirect eval() leaks ALL vars globally, i.e., where var e = eval; e('var a = 7'); 
   *   'a' becomes global, thus, defeating the purpose.
   */
  function sandbox(fn) {
  
    var keys = {};
    
    for (var k in global) {
      keys[k] = k;
    }
    
    var result = fn();
    
    for (var k in global) {
      if (!(k in keys)) {
        delete global[k];
      }
    }
    
    return result;
  }
  
}());