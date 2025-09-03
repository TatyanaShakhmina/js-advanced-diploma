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

    this.levelThemes = [themes.prairie, themes.desert, themes.arctic, themes.mountain];
    this.levelIndex = 0;
  }

  init() {
    this.gamePlay.drawUi(this.levelThemes[this.levelIndex]);

    this.bindUiListeners();

    this.startFreshGame();

    this.tryAutoLoad();
  }


  bindUiListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  tryAutoLoad() {
    try {
      const snapshot = this.stateService.load();
      if (snapshot) {
        this.restoreFromSnapshot(snapshot);
        GamePlay.showMessage('Игра восстановлена из сохранения');
      }
    } catch {
      GamePlay.showError('Не удалось загрузить сохранение');
    }
  }

  onSaveGame() {
    const snapshot = this.getStateSnapshot();
    this.stateService.save(snapshot);
    GamePlay.showMessage('Игра сохранена');
  }

  onLoadGame() {
    try {
      const snapshot = this.stateService.load();
      if (!snapshot) {
        GamePlay.showError('Сохранение не найдено');
        return;
      }
      this.restoreFromSnapshot(snapshot);
      GamePlay.showMessage('Игра загружена');
    } catch {
      GamePlay.showError('Некорректное сохранение');
    }
  }

  getStateSnapshot() {
    return {
      version: 1,
      levelIndex: this.levelIndex,
      currentPlayer: this.state.currentPlayer,
      score: this.state.score,
      maxScore: this.state.maxScore,
      boardLocked: this.state.boardLocked,

      positioned: this.positionedCharacters.map(pc => ({
        position: pc.position,
        character: {
          type: pc.character.type,
          level: pc.character.level,
          attack: pc.character.attack,
          defence: pc.character.defence,
          health: pc.character.health,
          attackRange: pc.character.attackRange,
          moveRange: pc.character.moveRange,
        },
      })),
    };
  }

  restoreFromSnapshot(snapshot) {
    this.levelIndex = snapshot.levelIndex ?? 0;

    this.gamePlay.drawUi(this.levelThemes[this.levelIndex]);
    this.bindUiListeners();

    const positioned = [];
    for (const p of snapshot.positioned) {
      const ch = this.createCharacterFromPlain(p.character);
      positioned.push(new PositionedCharacter(ch, p.position));
    }
    this.positionedCharacters = positioned;

    this.state.currentPlayer = snapshot.currentPlayer ?? 'user';
    this.state.score = snapshot.score ?? 0;
    this.state.maxScore = snapshot.maxScore ?? 0;
    this.state.boardLocked = !!snapshot.boardLocked;

    if (typeof this.state.selectedCellIndex === 'number') {
      this.gamePlay.deselectCell(this.state.selectedCellIndex);
    }
    this.state.selectedCellIndex = null;
    this.state.selectedCharacter = null;

    this.gamePlay.redrawPositions(this.positionedCharacters);

    this.gamePlay.setCursor(this.state.boardLocked ? 'not-allowed' : 'auto');
  }

  createCharacterFromPlain(plain) {
    const factory = {
      bowman: (lvl) => new Bowman(lvl),
      swordsman: (lvl) => new Swordsman(lvl),
      magician: (lvl) => new Magician(lvl),
      daemon: (lvl) => new Daemon(lvl),
      undead: (lvl) => new Undead(lvl),
      vampire: (lvl) => new Vampire(lvl),
    };

    const ctor = factory[plain.type];
    if (!ctor) {
      throw new Error(`Unknown character type: ${plain.type}`);
    }

    const ch = ctor(plain.level || 1);
    ch.attack = plain.attack;
    ch.defence = plain.defence;
    ch.health = plain.health;
    ch.attackRange = plain.attackRange;
    ch.moveRange = plain.moveRange;
    return ch;
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

  async onCellClick(index) {
    if (this.state.boardLocked) return;

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

          this.moveSelectedCharacter(to);
          this.gamePlay.redrawPositions(this.positionedCharacters);

          if (typeof this.state.selectedCellIndex === 'number') {
            this.gamePlay.deselectCell(this.state.selectedCellIndex);
          }
          this.gamePlay.deselectCell(to);
          this.gamePlay.setCursor('auto');
          this.state.selectedCharacter = null;
          this.state.selectedCellIndex = null;

          this.state.currentPlayer = 'enemy';
          await this.enemyTurn();

          const endedAfterEnemy = await this.checkRoundEndAndMaybeNextLevel();
          if (endedAfterEnemy) return;
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
      const attacker = selectedChar.character;
      const targetPosChar = characterOnCell;
      const target = targetPosChar.character;

      const dx = Math.abs((from % 8) - (to % 8));
      const dy = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
      const distance = Math.max(dx, dy);

      if (distance <= attacker.attackRange) {

        this.gamePlay.selectCell(to, 'red');
        this.gamePlay.setCursor('crosshair');

        const rawDamage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
        const damageToShow = Math.round(rawDamage);

        await this.gamePlay.showDamage(to, damageToShow);

        target.health = Math.max(0, target.health - damageToShow);

        if (target.health <= 0) {
          this.positionedCharacters = this.positionedCharacters.filter(pc => pc !== targetPosChar);
        }

        this.gamePlay.redrawPositions(this.positionedCharacters);

        const endedNow = await this.checkRoundEndAndMaybeNextLevel();
        if (endedNow) {
          if (typeof this.state.selectedCellIndex === 'number') {
            this.gamePlay.deselectCell(this.state.selectedCellIndex);
          }
          this.gamePlay.deselectCell(to);
          this.state.selectedCharacter = null;
          this.state.selectedCellIndex = null;
          this.gamePlay.setCursor('auto');
          return;
        }

        this.state.currentPlayer = 'enemy';
        await this.enemyTurn();

        const endedAfterEnemy = await this.checkRoundEndAndMaybeNextLevel();
        if (endedAfterEnemy) return;
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

    if (this.state.boardLocked) return;

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
    if (this.state.boardLocked) return;
    this.gamePlay.hideCellTooltip(index);
  }

  getCharacterTooltip(character) {
    return `🎖${character.level} ⚔${character.attack} 🛡${character.defence} ❤${character.health}`;
  }

  isPlayerCharacter(character) {
    return ['bowman', 'swordsman', 'magician'].includes(character.type);
  }

  moveSelectedCharacter(to) {
    if (!this.state.selectedCharacter) return;
    this.state.selectedCharacter.position = to;
  }

  async enemyTurn() {
    const size = 8;
    const toRC = (idx) => [Math.floor(idx / size), idx % size];
    const toIdx = (r, c) => r * size + c;
    const cheb = (a, b) => {
      const [ar, ac] = toRC(a);
      const [br, bc] = toRC(b);
      return Math.max(Math.abs(ac - bc), Math.abs(ar - br));
    };
    const isPlayer = (pc) => this.isPlayerCharacter(pc.character);
    const occupied = new Set(this.positionedCharacters.map(pc => pc.position));

    const enemies = this.positionedCharacters.filter(pc => !isPlayer(pc));
    const players = this.positionedCharacters.filter(pc => isPlayer(pc));

    if (enemies.length === 0 || players.length === 0) {
      this.state.currentPlayer = 'user';
      return;
    }

    const enemy = enemies[0];

    const targetForAttack = players.find(p => cheb(enemy.position, p.position) <= enemy.character.attackRange);
    if (targetForAttack) {
      const attacker = enemy.character;
      const target = targetForAttack.character;
      const to = targetForAttack.position;

      const rawDamage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
      const damageToShow = Math.round(rawDamage);

      this.gamePlay.selectCell(to, 'red');
      this.gamePlay.setCursor('crosshair');

      await this.gamePlay.showDamage(to, damageToShow);

      target.health = Math.max(0, target.health - damageToShow);
      if (target.health <= 0) {
        this.positionedCharacters = this.positionedCharacters.filter(pc => pc !== targetForAttack);
      }

      this.gamePlay.redrawPositions(this.positionedCharacters);
      await this.checkRoundEndAndMaybeNextLevel();

      this.gamePlay.deselectCell(to);
      this.gamePlay.setCursor('auto');

      this.state.currentPlayer = 'user';
      return;
    }

    let nearest = players[0];
    let bestDist = cheb(enemy.position, nearest.position);
    for (const p of players) {
      const d = cheb(enemy.position, p.position);
      if (d < bestDist) {
        bestDist = d;
        nearest = p;
      }
    }

    const [er, ec] = toRC(enemy.position);
    const [tr, tc] = toRC(nearest.position);
    const dr = tr - er;
    const dc = tc - ec;

    const stepR = Math.sign(dr) * Math.min(Math.abs(dr), enemy.character.moveRange);
    const stepC = Math.sign(dc) * Math.min(Math.abs(dc), enemy.character.moveRange);

    let newR = er + stepR;
    let newC = ec + stepC;

    newR = Math.max(0, Math.min(size - 1, newR));
    newC = Math.max(0, Math.min(size - 1, newC));

    const candidate = toIdx(newR, newC);

    if (!occupied.has(candidate)) {
      enemy.position = candidate;
      this.gamePlay.redrawPositions(this.positionedCharacters);
    }

    this.state.currentPlayer = 'user';
  }

  async checkRoundEndAndMaybeNextLevel() {
    const enemiesLeft = this.positionedCharacters.some(pc => !this.isPlayerCharacter(pc.character));
    const playersLeft = this.positionedCharacters.some(pc => this.isPlayerCharacter(pc.character));

    if (!enemiesLeft && playersLeft) {
      for (const pc of this.positionedCharacters) {
        if (this.isPlayerCharacter(pc.character)) {
          pc.character.levelUp();
        }
      }

      if (this.levelIndex < this.levelThemes.length - 1) {
        this.levelIndex += 1;
      }

      await this.startNextLevel();
    }
  }

  async startNextLevel() {
    this.gamePlay.drawUi(this.levelThemes[this.levelIndex]);

    const playerTeamChars = this.positionedCharacters
      .filter(pc => this.isPlayerCharacter(pc.character))
      .map(pc => pc.character);

    const enemyTeam = generateTeam([Vampire, Undead, Daemon], 4, playerTeamChars.length);

    const usedPositions = new Set();
    const positionedCharacters = [];

    const playerPositions = this.getRandomPositions(playerTeamChars.length, [0, 1], usedPositions);
    const enemyPositions = this.getRandomPositions(enemyTeam.characters.length, [6, 7], usedPositions);

    playerTeamChars.forEach((char, i) => {
      positionedCharacters.push(new PositionedCharacter(char, playerPositions[i]));
    });

    enemyTeam.characters.forEach((char, i) => {
      positionedCharacters.push(new PositionedCharacter(char, enemyPositions[i]));
    });

    this.positionedCharacters = positionedCharacters;
    this.gamePlay.redrawPositions(this.positionedCharacters);

    if (typeof this.state.selectedCellIndex === 'number') {
      this.gamePlay.deselectCell(this.state.selectedCellIndex);
    }
    this.state.selectedCharacter = null;
    this.state.selectedCellIndex = null;
    this.state.currentPlayer = 'user';
    this.gamePlay.setCursor('auto');
  }

  startFreshGame() {
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

    this.positionedCharacters = positionedCharacters;

    this.state = new GameState();

    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.gamePlay.setCursor('auto');
  }

  onNewGame() {
    this.levelIndex = 0;

    this.gamePlay.drawUi(this.levelThemes[this.levelIndex]);
    this.bindUiListeners();

    this.startFreshGame();
  }
}
