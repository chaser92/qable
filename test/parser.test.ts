import QlangInterpreter from "../src/qlang";

const i = new QlangInterpreter();

describe("Qlang Parser Good", () => {
    [
        "bareidentifier",
        "id_number_65",
        "id65",
        "bare_id",
        "_id",
        ".",
        ".0",
        ".000",
        "._id",
        ".id_2",
        ".id_0",
        ".a",
        ".test",
        ".[3]",
        '.["key"]',
        
        '.<3',
        '.<.',
        '.>5',
        '.>"test"',
        '.=true',
        '.=false',
        '.===true',
        '.==="z"',
        '.===null',
        '.===undefined',
        'true=true',
        'true=3',
        'null=null',
        '3=3',
        '"a"="b"',
        '#',
        '#>3',
        '#="z"',
        
        '.!',
        '.>5!',
        '#>2!',
        '.$',
        '#?$'
    ].forEach(t => it(`should parse ${t}`, () => expect(() => i.parse(t)).not.toThrow()));
});

describe ("Qlang Parser Bad", () => {
    [
        "5",
        "5a",
        "565",
        "0.",
        "#.",
        '.a="k',
        '"literal"',
        '!z',
    ].forEach(t => it(`should not parse ${t}`, () =>
        expect(() => i.parse(t)).toThrow()));
});