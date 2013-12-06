// metafunction.spec.js

var metafunction = metafunction || (function() {
  if (typeof require == 'function') {
    return require('../metafunction')
  }
}())

describe('metafunction', function () {

  it('should exist', function () {
    expect(metafunction).toBeDefined()
  })
  
  describe('parse', function () {
  
    var parse = metafunction.parse;
    
    it('should exist', function () {
      expect(typeof parse).toBe('function')

    })
    
    it('should throw on bad argument', function () {
      function exec() { parse() }
      expect(exec).toThrow()
    })
    
    describe('descriptor', function () {
    
      var descriptor;
      
      function subject(two, args) {
      
        // should see this comment
        
        if (arguments.length === 2) {
          return true
        }
        
        return false
      }
      
      beforeEach(function () {
        descriptor = parse(subject)
      })
      
      afterEach(function () {
        descriptor = null
      })
      
      it('should return a function descriptor', function () {
        expect(descriptor).toBeDefined()
      })
      
      it('should contain source', function () {
        expect(descriptor.source).toBeDefined()
        expect(descriptor.source).toBe(subject.toString())
      })
      
      it('should contain arguments', function () {
        expect(descriptor.arguments).toBeDefined()
        expect(descriptor.arguments[0]).toBe('two')
        expect(descriptor.arguments[1]).toBe('args')
      })
      
      it('should contain body', function () {
        expect(descriptor.body).toBeDefined()
        expect(descriptor.body).toBe(subject.toString().replace(/function[^\{]*[\{]/, '').replace(/[\}]+$/, ''))
        expect(descriptor.body).toContain('// should see this comment')
        expect(descriptor.body).toContain('if (arguments.length === 2) {')
        expect(descriptor.body).toContain('return true')
        expect(descriptor.body).toContain('return false')
      })
      
      it('should contain returns', function () {
        expect(descriptor.returns).toBeDefined()
        expect(descriptor.returns[0]).toBe('true')
        expect(descriptor.returns[1]).toBe('false')
      })

    })
  })
  
  describe('mockScope', function () {
  
    var mockScope = metafunction.mockScope

    var fixture = (function(){
      
      var pValue = 444;
      
      var pObject = { id: 'invisible man' };

      function pFunc() {
        return 'pFuncified'
      }

      function fn(type) {
      
        var which = (type || '').toLowerCase();
        
        if (which == 'value') return pValue
        if (which == 'object') return pObject
          
        return pFunc()
      }
      
      return fn
    }())
    
    describe('smoke test', function () {

      it('should exist', function () {
        expect(typeof mockScope).toBe('function')
      })
      
    })
    
    describe('readme example', function () {
    
      var mockScope = metafunction.mockScope;
      
      it ('should pass', function () {
      
        var fn = (function () {
        
          // I'm a closure defined by an IIFE
          
          var inside = true;
          
          function run() {
            return inside
          }
          
          return run
          
        }());
      

        var mock = mockScope(fn, 'myFn'); // alias is optional 'name' for fn but should be used for the internal invocation
        
        mock.inject('inside', 'mockInside')
        
        mock.invoke(function () {
        
          expect(myFn()).toBe('mocked') // should pass
          
        }, { expect: expect, mockInside: 'mocked' })
      })
    })
    
    describe('fixtures', function () {
    
      it('should find fixture', function () {
        expect(typeof fixture).toBe('function')
      })
      
      it('should be functions', function () {
        expect(typeof fixture).toBe('function')
        expect(typeof mockScope).toBe('function')
        expect(typeof mockScope(fixture).source).toBe('function')
        expect(typeof mockScope(fixture).inject).toBe('function')
        expect(typeof mockScope(fixture).invoke).toBe('function')
      })
      
      it('should have defaults', function () {
        expect(fixture()).toBe('pFuncified')
        expect(fixture('value')).toBe(444)
        expect(fixture('object').id).toBe('invisible man')
      })
      
    })

    describe('source & inject', function () {

      var s;
      
      afterEach(function () {
        s = undefined;
      })    
      
      beforeEach(function () {
        s = mockScope(fixture, 'fixture');
      })
      
      it('mockScope should rename fn with alias', function () {
        expect(s.source().indexOf('function fixture(')).toBe(0)
      })
      
      it('inject should return source holder', function () {
        expect(s.inject('', '')).toBe(s)
      })
      
      it('should inject mockFunc', function () {
        s.inject('pFunc', 'mockFunc')
        expect(s.source().indexOf('return mockFunc()')).not.toBe(-1)
      })
      
    })

    describe('invoke', function () {
    
      describe('with mockFunc', function () {
      
        var mockFunc = function mockFunc() {
          return 'mockified'
        };
        
        var s;
        var context;
        
        afterEach(function () {
          s = undefined;
          context = undefined;
        })
        
        beforeEach(function () {
          context = { mockFunc: mockFunc, expect: expect };
          s = mockScope(fixture, 'fixture');
          s.inject('pFunc', 'mockFunc')
        })
    
        it('should use inline source', function () {
          var inlineSource = s.source() + 'expect(fixture()).toBe(\'mockified\')';
          s.invoke(inlineSource, context)
        })
        
        it('should use standalone source', function () {
          function standalone() {
            expect(fixture()).toBe('mockified')
          }
          s.invoke(standalone, context)
        })
        
        it('should use fn param', function () {
          s.invoke(function() {
            expect(fixture()).toBe('mockified')
          }, context)
        })
        
        it('should return holder', function () {

          var result = s.invoke(function() {
            expect(fixture()).toBe('mockified')
          }, context);
          
          expect(result).toBe(s)
        })
        
      })

      describe('invoke with param \'value\'', function () {
      
        var mockValue = 777;
        var s;
        var context;
        
        afterEach(function () {
          s = undefined;
          context = undefined;
        })
        
        beforeEach(function () {
          s = mockScope(fixture, 'fixture');
          s.inject('pValue', 'mockValue')
          context = { mockValue: mockValue, expect: expect };
        })

        it('should use inline source', function () {
          var inlineSource = s.source() + 'expect(fixture(\'value\')).toBe(777)';
          s.invoke(inlineSource, context)
        })
        
        it('should use standalone source', function () {
          function standalone() {
            expect(fixture('value')).toBe(777)
          }
          s.invoke(standalone, context)
        })
        
        it('should use fn param', function () {
          s.invoke(function() {
            expect(fixture('value')).toBe(777)
          }, context)
        })

      })
      
      describe('invoke with param \'object\'', function () {
      
        var mockObj = { id: 'mockScope-invisible-man' };
        var s;
        var context;
        
        afterEach(function () {
          s = undefined;
          context = undefined;
        })
        
        beforeEach(function () {
          s = mockScope(fixture, 'fixture');
          s.inject('pObject', 'mockObj')
          context = { mockObj: mockObj, expect: expect };
        })

        it('should use inline source', function () {
          var inlineSource = s.source() + 'expect(fixture(\'object\').id).toBe(\'mockScope-invisible-man\')';
          s.invoke(inlineSource, context)
        })

        it('should use standalone source', function () {
          function standalone() {
            expect(fixture('object').id).toBe('mockScope-invisible-man')
          }
          s.invoke(standalone, context)
        })
        
        it('should use fn param', function () {
          s.invoke(function() {
            expect(fixture('object').id).toBe('mockScope-invisible-man')
          }, context)
        })
        
      })
      
      describe('chained use', function() {
      
        it('should work', function() {
        
          mockScope(fixture, 'fixture').
            inject('pObject', 'mockObj').
            invoke(function() {
            
              expect(fixture('object').id).toBe('chained-invisible-man')
              
            }, { mockObj: { id: 'chained-invisible-man' }, expect: expect })
        })
      })
      
    })    
  })
  
})
