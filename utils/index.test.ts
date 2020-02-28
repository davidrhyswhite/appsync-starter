import { expiresInDays } from '.';

global.Date.now = jest.fn(() => 1582390399302);

test('#expiresInDays', () => {
  expect(expiresInDays(1)).toBe(1582476799);
  expect(expiresInDays(7)).toBe(1582995199);
  expect(expiresInDays(365)).toBe(1613926399);
});