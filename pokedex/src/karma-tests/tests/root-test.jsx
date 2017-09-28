import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import expect from 'expect';
import navbar from '../../navbar';

describe('navbar', function () {
  it('renders without problems', function () {
    var test = TestUtils.renderIntoDocument(<PokedexNavBar/>);
    expect(test).toExist();
  });
});