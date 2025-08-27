import { securityTests } from './security-tests.js';

describe('securityTests', () => {
  it('should work', () => {
    expect(securityTests()).toEqual('security-tests');
  });
});
