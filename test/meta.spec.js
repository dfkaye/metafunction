// meta.spec.js

if (typeof require == 'function') {
  require('../metafunction')
}
  
describe('metafunction', function() {

  // fixture
  var closure = (function(){
    
    var pValue = 444;
    
    var pObject = { id: 'invisible man' };

    function pFunc() {
      return 'pFuncified';
    }

    function route(type) {
    
      var which = (type || '').toLowerCase();
      
      if (which == 'value') return pValue;
      if (which == 'object') return pObject;
        
      return pFunc();
    }
    
    return route;
  }());
  
  // tests
  
  describe('meta', function () {
  
    it('should be a function', function () {
      expect(typeof closure.meta).toBe('function');
    });

    describe('fixture', function () {
    
      it('should find fixture', function () {
        expect(typeof closure).toBe('function');
      });
           
      it('should have defaults', function () {
        expect(closure()).toBe('pFuncified');
        expect(closure('value')).toBe(444);
        expect(closure('object').id).toBe('invisible man');
      });
    });
    
    describe('descriptor', function () {
    
      var descriptor = closure.meta().descriptor;
            
      it('should have .arguments array of function arguments', function () {
        expect(descriptor.arguments.length).toBe(closure.length);
        expect(descriptor.arguments[0]).toBe('type');
      });
            
      it('should have .name string for the function name', function () {
        expect(descriptor.name).toBe("route");
      });
      
      it('should have .returns array of return statements', function () {
        expect(descriptor.returns.length).toBe(3);
        expect(descriptor.returns[0]).toBe("pValue");
        expect(descriptor.returns[1]).toBe("pObject");
        expect(descriptor.returns[2]).toBe("pFunc()");
      });
      
      it('should have .source string as function string', function () {
        expect(descriptor.source).toBe(closure.toString());
      });
    });
    
    describe('inject', function () {
      var meta;
      
      beforeEach(function () {
        meta = closure.meta();
      });
      
      it('should have .inject() method', function () {
        expect(typeof meta.inject).toBe('function');
      });
      
      it('should inject mockFunc for pFunc', function () {
      
        meta.inject('pFunc', 'mockFunc');
        meta.inject('pObject', 'mockObject');
        meta.inject('pValue', 'mockValue');
        
        expect(meta.descriptor.source).toContain('return mockFunc()');
        expect(meta.descriptor.source).not.toContain('pFunc');
        expect(meta.descriptor.source).toContain('return mockObject');
        expect(meta.descriptor.source).not.toContain('pObject');
        expect(meta.descriptor.source).toContain('return mockValue');
        expect(meta.descriptor.source).not.toContain('pValue'); 
      });
    });
    
    describe('invoke', function () {
    
      var meta;
      
      beforeEach(function () {
        meta = closure.meta();
      });
      
      it('should have .invoke() method', function () {
        expect(typeof meta.invoke).toBe('function');
      });
      
      it('should invoke with context, context should be visible to scope', function() {
        meta.invoke(function() {
          expect(context.expect).toBe(expect);
        }, { expect: expect });
      });
      
      it('should invoke with - but not use - whitespace alias', function() {
        meta(' ').invoke(function() {
        
          expect(route('object').id).toBe('mock object');
          
        }, { pObject: { id: 'mock object' }, expect: expect });
      });
      
      it('should invoke with alias functionTest', function() {
        meta('functionTest').invoke(function() {
        
          expect(functionTest('function')).toBe('mock function');
          
        }, { pFunc: function() { return 'mock function'; }, expect: expect });
      });
      
      it('should invoke with alias objectTest', function() {
        meta('objectTest').invoke(function() {
          
          expect(objectTest('object').id).toBe('mock object');
          
        }, { pObject: { id: 'mock object' }, expect: expect });
      });
      
      it('should invoke with alias valueTest', function() {
        meta('valueTest').invoke(function() {
          
          expect(valueTest('value')).toBe('mock value');
          
        }, { pValue: 'mock value', expect: expect });
      });
    });
    
    describe('alias, inject, invoke chains', function () {
    
      var meta;
      
      beforeEach(function () {
        meta = closure.meta();
      });
      
      it('should chain with meta().inject().invoke()', function() {
             
        meta('chain').
          inject('pFunc', 'mockFunc').
          inject('pObject', 'mockObject').
          inject('pValue', 'mockValue').
          invoke(function() {
          
              expect(chain()).toBe('mock function');
              expect(chain('object').id).toBe('mock object');
              expect(chain('value')).toBe('mock value');
              
          }, { 
            expect: expect, 
            mockFunc: function () { return 'mock function'; },
            mockObject: { id: 'mock object' }, 
            mockValue: 'mock value'
          });
      });
      
      it('should lisp with k-v injection: meta(name)(k, v)(fn, ctx)', function() {
             
        (meta('lisp')
        ('pFunc', 'mockFunc')
        ('pObject', 'mockObject')
        ('pValue', 'mockValue')
        (function() {
        
            expect(lisp()).toBe('mock function');
            expect(lisp('object').id).toBe('mock object');
            expect(lisp('value')).toBe('mock value');
            
          }, { 
            expect: expect, 
            mockFunc: function () { return 'mock function'; },
            mockObject: { id: 'mock object' }, 
            mockValue: 'mock value'
          }));
      });
      
      it('should lisp with configuration: meta(name)(config)(fn)', function() {
             
        (meta('lisp')
        ({ expect: expect, 
           pFunc: function () { return 'mock function'; },
           pObject: { id: 'mock object' }, 
           pValue: 'mock value'
         })
        (function() {
        
            expect(lisp()).toBe('mock function');
            expect(lisp('object').id).toBe('mock object');
            expect(lisp('value')).toBe('mock value');
          }));
      });
      
      it('should invoke with nested invocation contexts', function() {
           
        meta('error').inject('secret', 'mock').invoke(function() {
        
          expect(nested()).toBe(false);
          
          // context argument to invoke() is visible in function scope
          context.nested = function () { 
            return true;
          };
          
          meta('nested').invoke(function() {
          
            expect(nested()).toBe(true);
            
          }, context); // <= context argument to invoke() is visible in function scope
          
        }, { expect: expect, meta: meta, 
             mock: function() { return 'label injected'; }, 
             nested: function () { return false; } })
      });
    });
    
    describe('anonymous function expression', function () {
    
      // fixture
      var fn = (function () {
        
        var closure = true;
        
        var inner = function (exampleArg) {
          // I'm a closure inside by an IIFE
          return closure;
        }
        return inner;
      }());
      
      var meta = fn.meta();
      
      it ('should be renamed \'anonymous\'', function () {

        var descriptor = meta.descriptor;
        
        expect(descriptor.name).toBe('anonymous');
        expect(descriptor.source).toBe(fn.toString().replace(/function[^\(]*/, 
                                                            'function anonymous') + '\n;');
      });
      
      it ('should be invocable as \'anonymous\'', function () {

        meta.inject('closure', 'mockClosure');
        meta.invoke(function () {
        
          expect(anonymous()).toBe('mocked'); // should pass, calling anonymous()
          
        }, { expect: expect, mockClosure: 'mocked' });
        
      });
    });
    
    describe('README example', function () {
    
      // fixture
      var fn = (function () {
        var closure = true;
        var inner = function fn(exampleArg) {
          // I'm a closure inside by an IIFE
          return closure;
        };
        return inner;
      }());
      
      var meta;
      
      beforeEach(function () {
        meta = fn.meta();
      });
      
      it ('descriptor data', function () {
      
        var descriptor = meta.descriptor;
        
        expect(descriptor.source).toBe(fn.toString());
        expect(descriptor.arguments[0]).toBe('exampleArg');
        expect(descriptor.name).toBe('fn');
        expect(descriptor.source).toContain('// I\'m a closure inside by an IIFE');
        expect(descriptor.source).toContain('return closure');
        expect(descriptor.returns.length).toBe(1);
        expect(descriptor.returns[0]).toBe('closure');
      });
      
      it ('invoke with context', function () {
        meta.invoke(function () {
        
          expect(fn()).toBe('mocked'); // should pass, calling alias()
          expect(context).toBeDefined(); // should see context object and its properties
          expect(context.closure).toBe('mocked'); // should see context object and its properties
          expect(context.expect).toBe(expect); // should see context object and its properties
          
        }, { expect: expect, closure: 'mocked' });
      });
      
      it ('alias, inject, invoke', function () {
        meta('alias'); // alias is used by invocation
        meta.inject('closure', 'mockClosure');
        meta.invoke(function () {
        
          expect(alias()).toBe('mocked'); // should pass, calling alias()
          expect(context.mockClosure).toBe('mocked'); // should see context object and its properties
          
        }, { expect: expect, mockClosure: 'mocked' });
      });
      
      it('chained API example', function () {
        meta('chain').inject('closure', 'mockClosure').invoke(function () {
        
          expect(chain()).toBe('mocked'); // should pass, calling alias()
          
        }, { expect: expect, mockClosure: 'mocked' });
      });
      
      it('lisped API example with 2-arg', function () {
      
        (meta('lisp')
        ('closure', 'mockedClosure')
        (function () {

          expect(lisp()).toBe('mocked'); // should pass, calling lisp()
          
         }, { 
          expect: expect, mockedClosure: 'mocked' 
         }));
      });

      it('alternate lisped API example', function () {
        (meta('lisp')
        ({ expect: expect, closure: 'mocked' })
        (function () {
          expect(lisp()).toBe('mocked'); // should pass, calling lisp()
        }));
      });
      
      it('nested invocation example', function () {

        var ctx = { expect: expect, meta: meta, closure: 'mocked' };    
        
        meta('main').invoke(function() {
          
          expect(main()).toBe('mocked');
          
          // context argument to invoke() is visible in function scope
          context.closure = 'nested';
          
          meta('nestedMain').invoke(function() {
            expect(nestedMain()).toBe('nested');
          }, context);
          
        }, ctx);
      });
    });
    
    
    describe('using extract() to test private function directly', function () {
    
      /*
        Assume iffe returns a main function when invoked:
        1. name the iffe
        2. attach iffe as property to the main function the iffe normally defines/returns
        3. verify iffe returns main
        4. verify iffe attached to main
        5. meta-fy iffe and use extract(methodName) to get hidden method
        6. invoke() target method (call it inside invoke function param)
        */
        
      // fixture
      var fn = (function iffe(){
      
        // private
        function increment(n) {
          return n + 1;
        }
        
        // public
        function main(n) {
          return increment(n);
        };
        
        // expose the iffe - could make this conditional by environment or 'expect'
        main.iffe = iffe;
        
        // make return statement separate from definition
        return main;
      }());
      
      it('should return main', function (){
        expect(fn.toString()).toContain('function main');
        expect(fn.toString()).not.toContain('return function main');
      });
      
      it('should find iffe', function() {
        expect(typeof fn.iffe).toBe('function');
        expect(fn.iffe.toString()).toContain('function iffe');
      });
      
      // meta-fy iffe
      // extract increment() function
      // invoke increment() inside invoke() function param, passing it by context param.    
      it('should extract increment() function and invoke it', function(){
      
        var meta = fn.iffe.meta();
        var increment = meta.extract('increment');
        
        expect(typeof increment).toBe('function');
        
        for (var i = 0; i < 10; i++) {
        
          meta.invoke(function() {
          
            expect(increment(i)).toBe(i + 1);
            
          }, { increment: increment, i : i });
        }
      });
   
    });
    
  });
});