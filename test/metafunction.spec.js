// metafunction.spec.js

var metafunction = metafunction || (function() {
  if (typeof require == 'function') {
    return require('../metafunction');
  }
}());

describe('metafunction', function () {

  it('should exist', function () {
    expect(metafunction).toBeDefined();
  });
});