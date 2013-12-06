// meta.spec.js

if (typeof require == 'function') {
  require('../metafunction')
}
  
describe('metafunction', function() {

  // fixture
  
  var closure = (function() {

    var secret = function (arg) {
      return 'secret says arg is ' + arg
    };

    var f = function fName(arg) {
      return 'f: ' + secret(arg)
    };

    return f
    
  }());
  
  // tests
  
  describe('meta', function () {
  
    it('should be a function', function () {
      expect(typeof closure.meta).toBe('function')
    })

    var meta = closure.meta();
    
    describe('descriptor', function () {
    
      var descriptor = meta.descriptor;
            
      it('should have .source string as function string', function () {
        expect(descriptor.source).toBe(closure.toString())
      })
      
      it('should have .arguments array of function arguments', function () {
        expect(descriptor.arguments.length).toBe(closure.length)
        expect(descriptor.arguments[0]).toBe('arg')
      })
            
      it('should have .name string for the function name', function () {
        expect(descriptor.name).toBe("fName")
      })
      
      it('should have .returns array of return statements', function () {
        expect(descriptor.returns[0]).toBe("'f: ' + secret(arg)")
      })
    })
    
    describe('inject and invoke', function () {
    
      it('should have .inject() method', function () {
        expect(typeof meta.inject).toBe('function')
      })
      
      it('should inject mock over secret', function () {
      
        // override
        meta.inject('secret', 'mock');

        expect(meta.descriptor.source).toContain('mock')
        expect(meta.descriptor.source).not.toContain('secret')
        
        // restore
        meta.inject('mock', 'secret');
      })
      
      it('should have .invoke() method', function () {
        expect(typeof meta.invoke).toBe('function')
      })
      
      it('should invoke with context, context should be visible to scope', function() {
      
        meta.invoke(function() {
        
          expect(context).toBeDefined()
            
        }, { expect: expect })
      })
      
      it('should invoke with meta(alias)', function() {
      
        meta('alias').invoke(function() {
        
          expect(alias('object')).toContain('function mocked')
            
        }, { secret: function() { return 'function mocked' }, expect: expect })
      })
      
      it('should invoke with - but not use - whitespace alias', function() {
      
        meta(' ').invoke(function() {
                    
          expect(alias('object')).toContain('function mocked')
          
        }, { secret: function() { return 'function mocked' }, expect: expect })
      })
      
      it('should invoke with meta.invoke() and context alias', function() {
      
        meta.invoke(function() {
          
          expect(alias('object')).toContain('function mocked')
          
        }, { secret: function() { return 'function mocked' }, expect: expect })
      })
      
      it('should chain with meta().inject().invoke()', function() {
      
        meta('second').inject('secret', 'mock').invoke(function() {
        
          expect(second('object')).toContain('label injected')
          
        }, { mock: function() { return 'label injected' }, expect: expect })
      })
      
      // nested contexts don't work in IE yet
      // it('should invoke with nested contexts', function() {
           
        // meta('error').inject('secret', 'mock').invoke(function() {
        
          // expect(nested()).toBe(true)
          
          // meta('nested').invoke(function() {
          
            // expect(nested()).toBe(true)
                        
          // }, context) // <= context argument to invoke() is visible in function scope
          
        // }, { expect: expect, mock: function() { return 'label injected' }, nested: function () { return true }, meta: meta })
      // })
    })
  })
  
  describe('anonymous function expression', function () {
  
    // fixture
    var fn = (function () {
      
      var closure = true;
      
      var inner = function (exampleArg) {
        // I'm a closure inside by an IIFE
        return closure
      }
      return inner
    }());
    
    var meta = fn.meta();
    
    it ('should be renamed \'anonymous\'', function () {

      var descriptor = meta.descriptor;
      
      expect(descriptor.name).toBe('anonymous')
      expect(descriptor.source).toBe(fn.toString().replace(/function[^\(]*/, 
                                                          'function anonymous') + '\n;')
    })
    
    it ('should be invocable as \'anonymous\'', function () {

      meta.inject('closure', 'mockClosure')
      meta.invoke(function () {
      
        expect(anonymous()).toBe('mocked') // should pass, calling anonymous()
        
      }, { expect: expect, mockClosure: 'mocked' })
    })
  })
  
  describe('README example', function () {
  
    // fixture
    var fn = (function () {
      
      var closure = true;
      
      var inner = function fn(exampleArg) {
        // I'm a closure inside by an IIFE
        return closure
      }
      
      return inner
    }());
    
    var meta = fn.meta();
    
    it ('descriptor data', function () {

      var descriptor = meta.descriptor;
      
      expect(descriptor.source).toBe(fn.toString())
      expect(descriptor.arguments[0]).toBe('exampleArg')
      expect(descriptor.name).toBe('fn')
      expect(descriptor.source).toContain('// I\'m a closure inside by an IIFE')
      expect(descriptor.source).toContain('return closure')
      expect(descriptor.returns.length).toBe(1)
      expect(descriptor.returns[0]).toBe('closure')
    })
    
    it ('alias, inject, invoke', function () {

      meta('alias') // alias is used by invocation
      meta.inject('closure', 'mockClosure')
      meta.invoke(function () {
      
        expect(alias()).toBe('mocked') // should pass, calling alias()
        expect(context).toBeDefined() // should see context object and its properties
        expect(context.mockClosure).toBe('mocked') // should see context object and its properties
        expect(context.expect).toBe(expect) // should see context object and its properties
        
      }, { expect: expect, mockClosure: 'mocked' })
    })
    
    it('chained example', function () {
    
      meta('alias').inject('closure', 'mockClosure').invoke(function () {
      
        expect(alias()).toBe('mocked') // should pass, calling alias()
        
      }, { expect: expect, mockClosure: 'mocked' })
    })
  })
})