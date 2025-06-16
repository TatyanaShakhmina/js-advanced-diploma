import Character from '../Character';

test('ошибка при создании объекта класса Character', () => {
  expect(() => new Character(3, 'generic')).toThrow('Нельзя создавать экземпляр класса Character напрямую');
});
