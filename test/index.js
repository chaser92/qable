const { expect, request } = require('chai');

const Qable = require('..');

describe('General operations', () => {
    it ('should initialize with a simple array', () => {
        const q = new Qable([1, 2, 3]);
        expect([...q]).to.deep.equal([1, 2, 3]);
    });

    it ('should')
});