metafunction
============

[![Build Status](https://travis-ci.org/dfkaye/metafunction.png)](https://travis-ci.org/dfkaye/metafunction)

This is a __testing__ library that decorates JavaScript's `Function.prototype` 
in to provide capabilities for reflection and mocking to address the following:

+ how can we inspect items defined in closures?
+ how can we override (or mock) them?

Following an exchange with Phil Walton (@philwalton) 
(see [Mocking - not testing - private functions]
(https://gist.github.com/dfkaye/5987716)), I developed this idea while working 
on [vm-shim](https://github.com/dfkaye/vim-shim) from which this repo borrows 
some internal methods.

The main trick uses `Function.prototype.toString()` to get a function descriptor 
(arguments, name, returns, source), and provide some methods for overwriting 
symbols and references within the function source and executing the new source 
in a new context.

install
-------

    npm install metafunction
    
    git clone https://github.com/dfkaye/metafunction.git
    
use
---

+ in node.js:

    `require('metafunction')`
    
+ in browser, metafunction is defined on the global scope

    `<script src="../metafunction.js"></script>`

Those will give you...

Function.prototype.meta(alias?)
-------------------------------

Any function or method now has a `.meta` method:

    var meta = someFunction.meta();
    
The `alias` argument is *optional* but really should be used any time you want to 
run a new invocation (much like naming your test iterations).
    
The object returned by this call is actually a __function__.  The returned `meta` 
function contains a `descriptor` object containing the parts of the original 
function definition (arguments, name, returns, source).

It also contains methods for the aliasing, mocking/overriding and inspection of 
closures and closure references, described below.

Best is first to view a fairly complete example:

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
      
      var meta;
      
      beforeEach(function () {
        meta = fn.meta();
      })
      
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
      
      it ('invoke with context', function () {
        meta.invoke(function () {
          expect(fn()).toBe('mocked') // should pass, calling alias()
          expect(context).toBeDefined() // should see context object and its properties
          expect(context.closure).toBe('mocked') // should see context object and its properties
          expect(context.expect).toBe(expect) // should see context object and its properties
        }, { expect: expect, closure: 'mocked' })
      })
      
      it ('alias, inject, invoke', function () {
        meta('alias') // alias is used by invocation
        meta.inject('closure', 'mockClosure')
        meta.invoke(function () {
          expect(alias()).toBe('mocked') // should pass, calling alias()
          expect(context.mockClosure).toBe('mocked') // should see context object and its properties
        }, { expect: expect, mockClosure: 'mocked' })
      })
      
      it('chained API example', function () {
        meta('chain').inject('closure', 'mockClosure').invoke(function () {
          expect(chain()).toBe('mocked') // should pass, calling alias()
        }, { expect: expect, mockClosure: 'mocked' })
      })
      
      it('lisped API example with 2-arg', function () {
        (meta('lisp')
         ('closure', 'mockedClosure')
         (function () {
            expect(lisp()).toBe('mocked') // should pass, calling lisp()
          }, { 
            expect: expect, mockedClosure: 'mocked' 
          }));
      })

      it('alternate lisped API example', function () {
        (meta('lisp')
          ({ expect: expect, closure: 'mocked' })
          (function () {
            expect(lisp()).toBe('mocked') // should pass, calling lisp()
          }));
      })
      
      it('nested invocation example', function () {

        var ctx = { expect: expect, meta: meta, closure: 'mocked' };    
        
        meta('main').invoke(function() {
          expect(main()).toBe('mocked')
          
          // context argument to invoke() is visible in function scope
          context.closure = 'nested'
          
          meta('nestedMain').invoke(function() {
            expect(nestedMain()).toBe('nested')
          }, context)
          
        }, ctx)
      })   
    })

Instead of figuring out the internal value inside the closure, we only override 
the reference to the variable holding onto it, first with `inject` which takes 
the target name and the mocking name, then with `invoke` with takes a function 
inside of which we can call the `alias` of the closure, and a `context` argument 
(a la `vm.runInContext`) which contains references to our test library's 
`expect` method (I'm using jasmine for this repo), a value to be set for the the 
injected name 'mockInside.'  You also have access to the `context` inside the 
function executed by `invoke`.

method chaining
---------------

The meta() API supports chaining the individual methods together:

    meta('chain').
    inject('closure', 'mockClosure').
    invoke(function () {
      expect(chain()).toBe('mocked') // should pass, calling alias()
    }, { expect: expect, mockClosure: 'mocked' })

method lisping
--------------

Wait what?  If you're like @HipsterHacker, you can use the experimental 'lisped' 
API, based on [this idea](https://gist.github.com/dfkaye/7797707#clj-pattern):

    (meta('lisp')
      ('closure', 'mockClosure')
      (function () {
        expect(lisp()).toBe('mocked') // should pass, calling lisp()
       }, { 
          expect: expect, mockClosure: 'mocked' 
       }));
      
Here's an evolving alternate form that uses a configuration specifier as the 
invocation `context` and avoids the `inject` re-naming step:

    (meta('lisp')
      ({ expect: expect, closure: 'mocked' })
      (function () {
        expect(lisp()).toBe('mocked')
      }));

__TIP: Expect this form of invocation sequence to show up elsewhere.__

nested invocations
------------------

More proof-of-concept gold-plating, to call invocations inside other invocations 
you can pass the `meta` function object to the context, update the context as 
needed, then call invoke again:

    var ctx = { expect: expect, meta: meta, closure: 'mocked' };    
    
    meta('main').invoke(function() {
      expect(main()).toBe('mocked')
      
      // context argument to invoke() is visible in function scope
      context.closure = 'nested'
      
      meta('nestedMain').invoke(function() {
        expect(nestedMain()).toBe('nested')
      }, context)
      
    }, ctx)

This is just a proof test that we're not blowing up the call stack in certain 
environments (namely, Internet Explorer).

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

