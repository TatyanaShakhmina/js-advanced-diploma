import Daemon from '../characters/Daemon';

test('создание Daemon', () => {
  const unit = new Daemon(1);

  expect(unit).toEqual({
    level: 1,
    type: 'daemon',
    health: 50,
    attack: 10,
    defence: 10,
    attackRange: 1,
    moveRange: 4
  });
});
