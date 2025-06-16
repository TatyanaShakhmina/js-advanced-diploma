import Undead from '../characters/Undead';

test('создание Undead', () => {
  const unit = new Undead(1);

  expect(unit).toEqual({
    level: 1,
    type: 'undead',
    health: 50,
    attack: 40,
    defence: 10,
    attackRange: 4,
    moveRange: 1
  });
});
