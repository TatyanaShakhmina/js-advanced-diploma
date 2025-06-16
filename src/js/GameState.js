export default class GameState {
  constructor() {
    this.currentPlayer = 'user';
    this.selectedCharacter = null;
    this.selectedCellIndex = null;
  }

  static from(object) {
    const state = new GameState();
    return Object.assign(state, object);
  }
}
