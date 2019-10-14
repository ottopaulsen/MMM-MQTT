const assert = require('assert');
const topicsMatch = require('../topics_match');

describe('Topic matching', () => {
    describe('Match topic with filter', () => {
        it('only + should match abc', () => {
            assert.equal(topicsMatch('+', 'abc'), true)
        })
        it('only + should not match abc/def', () => {
            assert.equal(topicsMatch('+', 'abc/def'), false)
        })
        it('Beginning +', () => {
            assert.equal(topicsMatch('+/abc', 'abc/abc'), true)
        })
        it('Ending + should match abc/+', () => {
            assert.equal(topicsMatch('abc/+', 'abc/.+'), true)
        })
        it('Ending + should not match abc/def/ghi', () => {
            assert.equal(topicsMatch('abc/+', 'abc/def/ghi'), false)
        })
        it('Inside +', () => {
            assert.equal(topicsMatch('abc/+/ghi', 'abc/def/ghi'), true)
        })
        it('Multile inside +', () => {
            assert.equal(topicsMatch('abc/+/def/+/ghi', 'abc/2/def/5/ghi'), true)
        })
        it ('should return true when filter equals topic', () => {
            assert.equal(topicsMatch('smoky/1/outside/temperature', 'smoky/1/outside/temperature'), true)
        })
        it ('should return true when filter has + inside', () => {
            assert.equal(topicsMatch('smoky/1/+/temperature', 'smoky/1/outside/temperature'), true)
        })
    })
    /*
    describe('Convert filter to regex', () => {
        it('should convert only +', () => {
            assert.equal(filterToRegex('+'), '[^\/]+')
        })
        it('Beginning +', () => {
            assert.equal(filterToRegex('+/abc'), '[^\/]+/abc')
        })
        it('Ending +', () => {
            assert.equal(filterToRegex('abc/+'), 'abc/[^\/]+')
        })
        it('Inside +', () => {
            assert.equal(filterToRegex('abc/+/def'), 'abc/[^\/]+/def')
        })
        it('Multile inside +', () => {
            assert.equal(filterToRegex('abc/+/def/+/ghi'), 'abc/[^\/]+/def/[^\/]+/ghi')
        })
        it('should convert /+/ to /[^\/]+/', () => {
            assert.equal(filterToRegex('smoky/1/+/temperature'), 'smoky/1/[^\/]+/temperature')
        })
        it('should not convert /+abc/', () => {
            assert.equal(filterToRegex('smoky/1/+abc/temperature'), 'smoky/1/+abc/temperature')
        })
        it('should not convert /abc+/', () => {
            assert.equal(filterToRegex('smoky/1/abc+/temperature'), 'smoky/1/abc+/temperature')
        })
        it('should convert +/abc/', () => {
            assert.equal(filterToRegex('+/smoky/1/+/temperature'), '[^\/]+/smoky/1/[^\/]+/temperature')
        })
    })
    */
})
