import { calcTileType } from '../utils';

test('top-left cell', () => {
  expect(calcTileType(0, 8)).toBe('top-left');
});

test('top cell', () => {
  expect(calcTileType(1, 8)).toBe('top');
});

test('top-right cell', () => {
  expect(calcTileType(7, 8)).toBe('top-right');
});

test('bottom-right cell', () => {
  expect(calcTileType(63, 8)).toBe('bottom-right');
});

test('bottom-left cell', () => {
  expect(calcTileType(56, 8)).toBe('bottom-left');
});

test('bottom cell', () => {
  expect(calcTileType(58, 8)).toBe('bottom');
});

test('left cell', () => {
  expect(calcTileType(7, 7)).toBe('left');
});

test('center cell', () => {
  expect(calcTileType(18, 8)).toBe('center');
});

test('right cell', () => {
  expect(calcTileType(15, 8)).toBe('right');
});
