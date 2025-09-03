import Daemon from "../characters/Daemon";
import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

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

function createContainer() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
}

describe('Загрузка игры', () => {
  let container;
  let gamePlay;
  let stateService;

  beforeEach(() => {
    container = createContainer();
    gamePlay = new GamePlay();
    gamePlay.bindToDOM(container);

    jest.spyOn(GamePlay, 'showMessage').mockImplementation(() => {});
    jest.spyOn(GamePlay, 'showError').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('успешная загрузка вызывает showMessage и восстанавливает игру', () => {
    const storage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify({
        version: 1,
        levelIndex: 1,
        currentPlayer: 'user',
        score: 10,
        maxScore: 50,
        boardLocked: false,
        positioned: [
          {
            position: 0,
            character: {
              type: 'bowman',
              level: 2,
              attack: 30,
              defence: 15,
              health: 70,
              attackRange: 2,
              moveRange: 2,
            },
          },
          {
            position: 63,
            character: {
              type: 'daemon',
              level: 2,
              attack: 25,
              defence: 10,
              health: 60,
              attackRange: 2,
              moveRange: 1,
            },
          },
        ],
      })),
      setItem: jest.fn(),
    };

    stateService = new GameStateService(storage);

    const controller = new GameController(gamePlay, stateService);
    controller.init(); // внутри произойдёт tryAutoLoad()

    expect(storage.getItem).toHaveBeenCalledWith('state');
    expect(GamePlay.showMessage).toHaveBeenCalled();
    expect(controller.positionedCharacters.length).toBe(2);
    expect(controller.levelIndex).toBe(1);
    expect(controller.state.score).toBe(10);
    expect(controller.state.maxScore).toBe(50);
  });

  test('неуспешная загрузка вызывает showError', () => {
    const storage = {
      getItem: jest.fn().mockReturnValue('{"broken": '),
      setItem: jest.fn(),
    };

    stateService = new GameStateService(storage);

    const controller = new GameController(gamePlay, stateService);
    controller.init();

    expect(storage.getItem).toHaveBeenCalledWith('state');
    expect(GamePlay.showError).toHaveBeenCalled();
  });
});
