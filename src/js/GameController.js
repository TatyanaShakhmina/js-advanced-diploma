import themes from './themes';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);

    const playerTeam = generateTeam([Bowman, Swordsman, Magician], 4, 4);
    const enemyTeam = generateTeam([Vampire, Undead, Daemon], 4, 4);

    const usedPositions = new Set();
    const positionedCharacters = [];

    const playerPositions = this.getRandomPositions(4, [0, 1], usedPositions);
    const enemyPositions = this.getRandomPositions(4, [6, 7], usedPositions);

    playerTeam.characters.forEach((char, i) => {
      positionedCharacters.push(new PositionedCharacter(char, playerPositions[i]));
    });

    enemyTeam.characters.forEach((char, i) => {
      positionedCharacters.push(new PositionedCharacter(char, enemyPositions[i]));
    });

    this.gamePlay.redrawPositions(positionedCharacters);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.positionedCharacters = positionedCharacters;

    this.state = new GameState();
  }

  getRandomPositions(count, allowedColumns, usedPositions) {
    const positions = [];

    while (positions.length < count) {
      const row = Math.floor(Math.random() * 8);
      const col = allowedColumns[Math.floor(Math.random() * allowedColumns.length)];
      const index = row * 8 + col;

      if (!usedPositions.has(index)) {
        positions.push(index);
        usedPositions.add(index);
      }
    }

    return positions;
  }

  onCellClick(index) {
    const characterOnCell = this.positionedCharacters.find(posChar => posChar.position === index);
    const selectedChar = this.state.selectedCharacter;

    if (this.state.currentPlayer !== 'user') {
      GamePlay.showError('Сейчас ход компьютера!');
      return;
    }

    if (!characterOnCell) {
      if (selectedChar) {
        const from = selectedChar.position;
        const to = index;
        const character = selectedChar.character;

        const dx = Math.abs((from % 8) - (to % 8));
        const dy = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
        const distance = Math.max(dx, dy);

        if (distance <= character.moveRange) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor('pointer');
        } else {
          this.gamePlay.setCursor('not-allowed');
          GamePlay.showError('Слишком далеко для движения!');
        }
      } else {
        GamePlay.showError('Сначала выбери персонажа!');
      }
      return;
    }

    if (this.isPlayerCharacter(characterOnCell.character)) {
      if (typeof this.state.selectedCellIndex === 'number') {
        this.gamePlay.deselectCell(this.state.selectedCellIndex);
      }

      this.gamePlay.selectCell(index);
      this.state.selectedCellIndex = index;
      this.state.selectedCharacter = characterOnCell;
      this.gamePlay.setCursor('pointer');
      return;
    }

    if (selectedChar) {
      const from = selectedChar.position;
      const to = index;
      const character = selectedChar.character;

      const dx = Math.abs((from % 8) - (to % 8));
      const dy = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
      const distance = Math.max(dx, dy);

      if (distance <= character.attackRange) {
        this.gamePlay.selectCell(to, 'red');
        this.gamePlay.setCursor('crosshair');
      } else {
        this.gamePlay.setCursor('not-allowed');
        GamePlay.showError('Противник слишком далеко для атаки!');
      }
    } else {
      GamePlay.showError('Сначала выбери своего персонажа!');
    }
  }


  onCellEnter(index) {
    const characterOnCell = this.positionedCharacters.find(posChar => posChar.position === index);
    if (characterOnCell) {
      const message = this.getCharacterTooltip(characterOnCell.character);
      this.gamePlay.showCellTooltip(message, index);
    }

    if (!this.state.selectedCharacter) {
      if (characterOnCell && this.isPlayerCharacter(characterOnCell.character)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.auto);
      }
      return;
    }

    if (characterOnCell && this.isPlayerCharacter(characterOnCell.character)) {
      this.gamePlay.setCursor(cursors.pointer);
      return;
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }

  getCharacterTooltip(character) {
    return `🎖${character.level} ⚔${character.attack} 🛡${character.defence} ❤${character.health}`;
  }

  isPlayerCharacter(character) {
    return ['bowman', 'swordsman', 'magician'].includes(character.type);
  }
}
