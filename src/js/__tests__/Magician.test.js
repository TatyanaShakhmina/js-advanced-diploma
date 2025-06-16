import Magician from '../characters/Magician';

test('создание Magician', () => {
  const unit = new Magician(1);

  expect(unit).toEqual({
    level: 1,
    type: 'magician',
    health: 50,
    attack: 10,
    defence: 40,
    attackRange: 1,
    moveRange: 4
  });
});
