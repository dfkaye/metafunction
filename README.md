metafunction
============

[working name]

[in progress]

Adds capabilities over Function() constructor and function.toString() - parse(), splice(), eval(), etc.

+ how can we inspect items defined in closures?
+ how can we override (or mock) them?
+ <code>vm#mockScope(code) #source #inject #invoke()</code>


mock-scope := work-in-progress
------------------------------

I had been looking for a way to use *reflection* in closures, due to the side-
effects from another exchange of rants with Phil Walton (@philwalton) 
(see [Mocking - not testing - private functions](https://gist.github.com/dfkaye/5987716)).  

But I realized we only need to mock certain items in closures at any time, not 
all of them, and not just inspect them during tests.  So I've come up with a 
mock-scope injection utility for that which depends on `runInNewContext`.  This 
will be added to the vm-shim API when "done"


why
---

+ Function() constructors should accept functions as arguments, not just strings.
+ function.toString() is one thing - parse() should return the parts of a function definition (args, body, returns, 
    source)
+ For testing, functions should be re-definable via reflection for mocking/overwriting 
    symbols and references within "closures" or "privatized module functions"

how
---

developed the ideas while working on [vm-shim](https://github.com/dfkaye/vim-shim) which came from reading vojta jina's howtonode post on mocking private 
state - then hit on another approach from composing modules more declaratively than the OOP-ish shell-script-y commonJS 
or AMD anti-APIs. 
[more on that later]


node tests
----------

Using Misko Hevery's [jasmine-node](https://github.com/mhevery/jasmine-node) to 
run command line tests on node (even though this project initially aimed at a 
browser shim).

    npm test
    # => jasmine-node --verbose ./test/node.spec.js
    
    npm run test-scope
    # => jasmine-node --verbose ./test/scope.spec.js


browser tests
-------------

Using @pivotallabs' 
<a href='http://jasmine.github.io/2.0/introduction.html'>jasmine-2.0.0</a> for 
the browser suite.

__The *jasmine2* browser test page is viewable on 
<a href='//rawgithub.com/dfkaye/vm-shim/master/test/browser-suite.html' 
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
+ test
+ src
+ package
+ rawgithub
+ testem
+ jasmine/mocha/tape - not sure yet
+ npm
+ thorough snark-free documentation

