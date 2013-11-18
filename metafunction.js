// metafunction.js


(function (metafunction, undefined) {

  if (typeof global == 'undefined' && window) {  
    global = window;
  }

  var vm = vm || (function() {
    if (typeof require == 'function') {
      return require('vm-shim');
    }
  }());
  
  metafunction = {
  
  }

  if (typeof module != 'undefined') {
    module.exports = metafunction
  } else {
    global.metafunction = metafunction
  }
  
  
/*IMPL - mockScope*/
// function mockScope(fn, alias) {

  // var source = fn.toString()
  
  // if (typeof alias == 'string') {
    // source = source.replace(/function[^\(]*/, 'function ' + alias) + '\n;'
  // }
  
  // return {
    // source : function () {
      // return source
    // },
    // inject : function (key, value) {
      // source = source.replace(key, value)
      // return this
    // },
    // invoke : function (fn, context) {
      // fn = !fn ? '' : fn.toString()
      // vm.runInNewContext(source + ';\n' + '(' + fn + '());', context)
      // return this
    // }
  // }
// }

// Function.prototype.mock = mock; function mock(alias) {

  // var fn = this;
  
  // var source = fn.toString()
  
  // if (typeof alias == 'string') {
    // source = source.replace(/function[^\(]*/, 'function ' + alias) + '\n;'
  // }
  
  // return {
    // source : function () {
      // return source
    // },
    // inject : function (key, value) {
      // source = source.replace(key, value)
      // return this
    // },
    // invoke : function (fn, context) {
      // fn = !fn ? '' : fn.toString()
      // vm.runInNewContext(source + ';\n' + '(' + fn + '());', context)
      // return this
    // }
  // }
// };

/*ALTERNATE IMPL - function.parse*/
// Function.prototype.parse = parse; function parse(fn) {

  // fn = fn || this
  
  // var res = {}
  // var fs = fn.toString()
  
  // try {
  
    // res.source = fs;
    // res.arguments = fs.substring(fs.indexOf('(') + 1, fs.indexOf(')')).split(',')
    // res.body = fs.substring(fs.indexOf('{') + 1, fs.lastIndexOf('}'))
    // var matches = fs.match(/[^\/^\]]return ([^\n]*)/g)
    // if (matches) {
        // for (var i = 0; i < matches.length; ++i) {
            // matches[i] = matches[i].replace(/[\s]*return[\s]+/g, '').replace(/[\;]+\r/, '')
        // }
    // }
    // res.returns = matches || [];
    
  // } catch (error) {
    // res.err = error
  // }
  
  // return res;
// }

/*test self*/
// var p = Function.prototype.parse.parse()
// console.dir(p)

/*test subject*/
// var fn = (function(){

  // var pValue = 444;
  // var pObject = { id: 'invisible man' };

  // function pFunc() {
    // return 'pFuncified';
  // }

  // function fn(type) {
    // var which = (type || '').toLowerCase();
    
    // if (which == 'value') return pValue;
    // if (which == 'object') return pObject;
    // return pFunc();
  // }
  
  // return fn;
// }());

// var res = fn.parse()
// console.dir(res)
// console.warn(fn('value'))
// console.log(fn('object'))
// console.log(fn(''))



}());


