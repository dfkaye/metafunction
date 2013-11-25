metafunction
============

provides capabilities for function inspection and mocking to address the following:

+ how can we inspect items defined in closures?
+ how can we override (or mock) them?

metafunction.parse(fn)
----------------------

`function.toString()` is one thing - `metafunction.parse(fn)` returns the parts 
of a function definition (arguments, body, returns, source).

metafunction.mockScope(fn, alias)
---------------------------------

For testing, functions should be re-definable via reflection for mocking/overwriting 
symbols and references within "closures" or "privatized module functions"

I developed this idea while working on [vm-shim](https://github.com/dfkaye/vim-shim)
on which this repo depends, following an exchange with Phil Walton (@philwalton) 
(see [Mocking - not testing - private functions](https://gist.github.com/dfkaye/5987716)).  

    describe('readme example', function () {
    
      var mockScope = metafunction.mockScope;
      
      it ('should pass', function () {
      
        // fixture
        var fn = (function () {
          
          var inside = true;
          
          function run() {
            // I'm a closure inside by an IIFE
            return inside;
          }
          return run;
        }());
      
        var mock = mockScope(fn, 'alias'); // alias is used by invocation
        
        mock.inject('inside', 'mockInside');
        
        mock.invoke(function () {
        
          expect(alias()).toBe('mocked') // should pass, calling alias()
          
        }, { expect: expect, mockInside: 'mocked' });
      });
    });

Instead of figuring out the internal value inside the closure, we only override 
the reference to the variable holding onto it, first with `inject` which takes 
the target name and the mocking name, then with `invoke` with takes a function 
inside which we can call the alias of the closure.  Note the trick here is to 
pass a second `context` argument (a la `vm.runInContext`), which contains 
references to the test library's `expect` method, and a value to be set for the 
the injected name 'mockInside.'

The complete test spec is contained in 
[https://github.com/dfkaye/metafunction/blob/master/test/metafunction.spec.js]
(https://github.com/dfkaye/metafunction/blob/master/test/metafunction.spec.js).


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
    
    
todo
----

+ npm
