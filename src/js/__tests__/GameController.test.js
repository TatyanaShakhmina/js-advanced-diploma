import Daemon from "../characters/Daemon";
import GameController from '../GameController';

function createMockGamePlay() {
  return {
    drawUi: jest.fn(),
    redrawPositions: jest.fn(),
    addCellEnterListener: jest.fn(),
    addCellLeaveListener: jest.fn(),
    showCellTooltip: jest.fn(),
    hideCellTooltip: jest.fn(),
  };
}

test('возвращаются корректные характеристики', () => {
  const mockGamePlay = createMockGamePlay();
  const controller = new GameController(mockGamePlay, null);
  const unit = new Daemon(1);

  const result = controller.getCharacterTooltip(unit);
  expect(result).toBe('🎖1 ⚔10 🛡10 ❤50');
});
