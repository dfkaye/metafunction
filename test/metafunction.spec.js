// metafunction.spec.js

var metafunction = metafunction || (function() {
  if (typeof require == 'function') {
    return require('../metafunction')
  }
}())

describe('metafunction', function () {

  it('should exist', function () {
    expect(metafunction).toBeDefined()
  });
  
  describe('parse', function () {
  
    var parse = metafunction.parse;
    
    it('should exist', function () {
      expect(parse).toBeDefined()
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
  
})