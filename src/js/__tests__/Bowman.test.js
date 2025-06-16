import Bowman from '../characters/Bowman';

test('создание Bowman', () => {
  const unit = new Bowman(1);

  expect(unit).toEqual({
    level: 1,
    type: 'bowman',
    health: 50,
    attack: 25,
    defence: 25,
    attackRange: 2,
    moveRange: 2
  });
});
