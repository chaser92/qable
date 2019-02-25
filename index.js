const Qable = require('./Qable');
global.Q = Qable;
global.d = new Q([{ age: 1 }, { age: 3 }, { age: 5 }]);
Qable.extend(require('./Qable.Async'));
Qable.extend(require('./filters'));

module.exports = Q;
