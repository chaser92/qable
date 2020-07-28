const LITERALS = [
    { command: /^(\d+|Infinity|-Infinity|NaN)$/, fn: (_, __, num) => Number(num) },
    { command: /^(false|true)$/, fn: (_, __, val) => val === "true" },
    { command: /^null$/, fn: () => null },
    { command: /^undefined$/, fn: () => undefined },
    { command: /^\".*\"/, fn: (_, str) => JSON.parse(str) },
];

const RESOLVERS = [
    { command: /^\.$/, fn: (obj) => obj },
    { command: /^\.(\d+)$/, fn: (obj, _, num) => obj[num] },
    { command: /^\.([$A-Za-z_][0-9A-Za-z_$]*)$/, fn: (obj, _, id) => obj[id] },
    { command: /^\.\[(\".*\")\]$/, fn: (obj, str) => obj[JSON.parse(str)] }
];

export default function resolve(expression, noLiterals) {
    console.log("resolve", expression);
    var resolvers = noLiterals ? RESOLVERS : [...LITERALS, ...RESOLVERS];
    expression = expression.trim();
    for (var resolver of resolvers) {
        const params = resolver.command.exec(expression);
        if (params !== null)
            return obj => resolver.fn.apply(null, [obj, ...params]);
        }
        console.log("fail", expression);
        return null;
}
