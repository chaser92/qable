const fallback = (value, _default) => value === null ? _default : value;

module.exports = {
    Query: (type, command) => q => command.eval()(type.eval()(q)),
    letter: chars => String(chars),

    PropertyGet: p => q => q[p.eval()],
    MapperQuery: m => q => q.map(m.eval()),
    Mapper: m => (i, id) => m.eval()(i, id),
    MIdentity: _ => i => i,
    MPick: (_, field) => i => i[field.eval()],
    MIndex: _ => (_, id) => id,

    Key: k => k.eval(),
    NumericKey: n => Number(n.sourceString),
    IdKey: s => String(s.sourceString),
    Literal: l => () => l.eval(),
    LBool: b => b === "true",
    LString: (_, s, __) => String(s.sourceString),
    LNumber: n => Number(n.sourceString),
    LNumberOrNull: n => n.sourceString === "" ? null : n.eval(),
    LNull: _ => null,
    LUndefined: _ => undefined,

    Command: c => c.eval(),
    ToArrayCommand: _ => a => a.toArray(),
    ToStringCommand: _ => a => a.toString(),
    NoCommand: _ => a => a,

    FilterQuery: f => q => q.filter(f.eval()),
    UnaryFilterQuery: (m, f) => (i, id) => f.eval()(m.eval()(i, id)),
    
    FBool: _ => a => !!a,
    FOdd: _ => a => a % 2 === 1,
    FEven: _ => a => a % 2 === 0,

    BinaryFilterQuery: (m1, f, m2) => (i, id) => f.eval()(m1.eval()(i, id), m2.eval()(i, id)),
    FLess: _ => (m1, m2) => m1 < m2,
    FGreater: _ => (m1, m2) => m1 > m2,
    FLessEqual: _ => (m1, m2) => m1 <= m2,
    FGreaterEqual: _ => (m1, m2) => m1 >= m2,
    FEqual: _ => (m1, m2) => m1 === m2,
    FMatches: _ => (m1, m2) => m1 === m2, // TODO not implemented

    FilterQueryList: query => query.eval(), // TODO multi not implemented
    Slice: s => s.eval(),
    StepSlice: (start, _, end, __, step) => q =>
        q.slice(fallback(start.eval(), 0), fallback(end.eval(), Infinity), fallback(step.eval(), 1)),
    NoStepSlice: (start, _, end) => q =>
        q.slice(fallback(start.eval(), 0), fallback(end.eval(), Infinity)) 
};