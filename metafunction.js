// metafunction.js

(function (metafunction, undefined) {

  if (typeof global == 'undefined' && window) {  
    global = window;
  }

  var vm = global.vm || (function() {
    if (typeof require == 'function') {
      return require('./lib/vm-shim')
    }
  }())

  metafunction = {
    mockScope: mockScope,
    parse: parse
  }

  if (typeof module != 'undefined') {
    module.exports = metafunction
  } else {
    global.metafunction = metafunction
  }
  
  /*
   * method parse
   * param function
   * returns object describing function parts - arguments, body, returns, source
   */
  function parse(fn) {

    typeof fn == 'function' || (function () {
      throw new Error('parse(fn) argument should be function but was ' + typeof fn)
    }())
    
    var res = {}
    var fs = fn.toString()
    var matches, i;
    
    try {
    
      res.source = fs;
      res.arguments = fs.substring(fs.indexOf('(') + 1, fs.indexOf(')')).replace(/\s*/g, '').split(',')
      res.body = fs.substring(fs.indexOf('{') + 1, fs.lastIndexOf('}'))
      
      var matches = fs.match(/[^\/^\]]return ([^\n]*)/g)
      if (matches) {
          for (var i = 0; i < matches.length; ++i) {
              matches[i] = matches[i].replace(/[\s]*return[\s]+/g, '').replace(/(\;|\r)*/g, '')
          }
      }
      res.returns = matches || [];
      
    } catch (error) {
      res.err = error
    }
    
    return res;
  }

  /*
   * method mockScope
   * param function
   * param alias
   * returns object with injection and invocation methods for mocking internal references 
   * in a closure
   */
  function mockScope(fn, alias) {

    var source = fn.toString()
    
    if (typeof alias == 'string') {
      source = source.replace(/function[^\(]*/, 'function ' + alias) + '\n;'
    }
    
    return {
    
      source : function () {
        return source
      },
      
      inject : function (key, value) {
        source = source.replace(key, value)
        return this
      },
      
      invoke : function (fn, context) {
      
        if (typeof fn != 'function') {
          fn = 'function(){' + fn + '}';
        } else {
          fn = fn.toString()
        }
        
        vm.runInNewContext(source + ';\n' + '(' + fn + '());', context)
        return this
      }
    }
  }

}());