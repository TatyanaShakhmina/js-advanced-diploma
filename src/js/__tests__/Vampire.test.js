import Vampire from '../characters/Vampire';

test('создание Vampire', () => {
  const unit = new Vampire(1);

  expect(unit).toEqual({
    level: 1,
    type: 'vampire',
    health: 50,
    attack: 25,
    defence: 25,
    attackRange: 2,
    moveRange: 2
  });
});
