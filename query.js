const ID_COMMAND = /^\d+$|^[a-zA-Z]+$/;
const resolve = require("./resolve");

module.exports = function query(Qable) {
    return function(query, qable) {
        query = query.trim();
        var id_regex = ID_COMMAND.exec(query);
        if (id_regex !== null)
            return Reflect.get(qable, id_regex[0]);

        var resolver = resolve(query, true); // not resolving literals
        if (resolver)
            return qable.map(t => resolver(t));

        for (var filter of Qable.filters) {
            var params = filter.command.exec(query);
            if (params)
                return filter.apply(null, [qable, ...params]);
        }
        
        throw "Invalid query syntax";
    }
}