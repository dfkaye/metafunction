metafunction
============

[working name]

[in progress]

Adds capabilities over Function() constructor and function.toString() - parse(), splice(), eval(), etc.

why
---

+ Function() constructors should accept functions as arguments, not just strings.
+ function.toString() is one thing - parse() should return the parts of a function definition (args, body, returns, 
    source)
+ For testing, functions should be re-definable via reflection for mocking/overwriting 
    symbols and references within "closures" or "privatized module functions"

how
---

developed the ideas while working on vm-shim which came from reading vojta jina's howtonode post on mocking private 
state - then hit on another approach from composing modules more declaratively than the OOP-ish shell-script-y commonJS 
or AMD anti-APIs. 
[more on that later]

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

