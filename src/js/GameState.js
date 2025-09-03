export default class GameState {
  constructor() {
    this.currentPlayer = 'user';
    this.selectedCharacter = null;
    this.selectedCellIndex = null;
    this.score = 0;
    this.maxScore = 0;
    this.boardLocked = false;
  }

  static from(object) {
    const state = new GameState();
    return Object.assign(state, object);
  }
}
