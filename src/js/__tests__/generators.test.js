import Team from '../Team';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import { characterGenerator, generateTeam } from '../generators';


test('должен бесконечно генерировать персонажей из allowedTypes', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;

  const gen = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < 100; i++) {
    const character = gen.next().value;

    const level = character.level;
    expect(level >= 1 && level <= maxLevel).toBe(true);
  }
});

test('должен создавать команду из нужного количества персонажей с правильным уровнем', () => {
  const allowedTypes = [Daemon, Undead, Vampire];
  const maxLevel = 4;
  const characterCount = 5;

  const team = generateTeam(allowedTypes, maxLevel, characterCount);

  expect(team).toBeInstanceOf(Team);
  expect(team.characters.length).toBe(characterCount);

  for (const char of team.characters) {
    const level = char.level;
    expect(level >= 1 && level <= maxLevel).toBe(true);
  }
});
