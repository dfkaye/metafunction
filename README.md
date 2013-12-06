metafunction
============

This is a testing library that decorates the `Function.prototype` to provide 
capabilities for introspection and mocking to address the following:

+ how can we inspect items defined in closures?
+ how can we override (or mock) them?

npm
---

    npm install metafunction
    
use
---

+ in node.js:

    `require('metafunction')`
    
+ in browser, metafunction is defined on the global scope

    `<script src="../metafunction.js"></script>`

Function.prototype.meta(alias?)
-------------------------------

For testing, functions should be re-definable via reflection for mocking/overwriting 
symbols and references within "closures" or "privatized module functions"

Following an exchange of ideas with Phil Walton (@philwalton) 
(see [Mocking - not testing - private functions]
(https://gist.github.com/dfkaye/5987716)), I developed this idea while working 
on [vm-shim](https://github.com/dfkaye/vim-shim) from which this repo borrows 
some internal methods.  

In addition, the returned metafunction contains a `descriptor` object containing
the parts of a function definition (arguments, name, returns, source).

Here's a fairly complete example:

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

Instead of figuring out the internal value inside the closure, we only override 
the reference to the variable holding onto it, first with `inject` which takes 
the target name and the mocking name, then with `invoke` with takes a function 
inside of which we can call the `alias` of the closure.  

Note the trick here is to pass a second `context` argument to `invoke`
(a la `vm.runInContext`), which contains references to the test library's 
`expect` method, and a value to be set for the the injected name 'mockInside.'

      
tests
-----

The complete test spec is contained in 
[https://github.com/dfkaye/metafunction/blob/master/test/meta.spec.js]
(https://github.com/dfkaye/metafunction/blob/master/test/meta.spec.js).

node tests
----------

Using Misko Hevery's [jasmine-node](https://github.com/mhevery/jasmine-node) to 
run command line tests on node (even though this project initially aimed at a 
browser shim).

    npm test
    # => jasmine-node --verbose ./test/node.spec.js
    
browser tests
-------------

Using @pivotallabs' 
<a href='http://jasmine.github.io/2.0/introduction.html'>jasmine-2.0.0</a> for 
the browser suite.

__The *jasmine2* browser test page is viewable on 
<a href='//rawgithub.com/dfkaye/metafunction/master/test/browser-suite.html' 
   target='_new' title='opens in new tab or window'>rawgithub</a>.__
  
Using Toby Ho's MAGNIFICENT [testemjs](https://github.com/airportyh/testem) to 
drive tests in multiple browsers for jasmine-2.0.0 (see how to 
[hack testem for jasmine 2](https://github.com/dfkaye/testem-jasmine2)), as well 
as jasmine-node.  The `testem.json` file uses the standalone test page above, 
and also uses a custom launcher for jasmine-node (v 1.3.1).

View both test types at the console by running:

    testem -l j

