let figures = {
  L: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  J: [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  I: [[1], [1], [1], [1]],
};
let destroyLines = 0;
let score = 0;
const SECOND = 1000;
const level = () => Math.floor(destroyLines / 10);
let getBestScore = () => localStorage.getItem('best score') ?? score;
let table = [];
let figure = [];
let positionFigure = { x: 0, y: 0 };
let gameOver = false;
const wrap = document.querySelector('.tetris');
const randomNum = (min, max) => {
  const num = min + Math.random() * (max - min + 1);
  return Math.floor(num);
};
const createTable = function (width, height) {
  return new Array(height).fill([]).map(() => new Array(width).fill(0));
};

const isOverlapBox = (x, y) =>
  figure.some((itemRow, row) => {
    return itemRow.some((itemColumn, column) => {
      const yRow = y + row;
      const xCol = x + column;
      return table[yRow][xCol] && itemColumn;
    });
  });

const horizontLimiter = function (setX) {
  const { x, y } = positionFigure;
  const max = table[0].length - figure[0].length;
  if (setX < 0) return 0;
  if (setX > max) return max;
  return isOverlapBox(setX, y) ? x : setX;
};
const bottomLimiter = function (y) {
  const max = table.length - figure.length;
  if (y < 0) return 0;
  if (y > max) return max;
  return y;
};

const hasBottomContact = function () {
  return positionFigure.y === bottomLimiter(positionFigure.y + 1);
};
const hasBoxBottomContact = function () {
  const bottomFigureBoxes = figure.at(-1).reduce((acc, box, i) => {
    if (box) acc.push(i);
    return acc;
  }, []);
  return bottomFigureBoxes.some((figureIndex) => {
    const tableRowUnderBox = table[positionFigure.y + figure.length];
    const contactWithBox = (colItem, i) => i === positionFigure.x + figureIndex && colItem;
    return tableRowUnderBox.some(contactWithBox);
  });
};
const hasContact = function (row, i) {
  return row.some((colItem, c) => {
    const currentBox = colItem;
    const underCurrentBox = figure[i + 1][c];
    const outsideBox = table[positionFigure.y + i + 1][positionFigure.x + c];
    return currentBox && !underCurrentBox && outsideBox;
  });
};
const hasBoxAroundContact = function () {
  return figure.some((row, i) => (i !== figure.length - 1 ? hasContact(row, i) : false));
};
const checkGameOver = function () {
  const y = 0;
  const x = initialFigurePosition();
  if (isOverlapBox(x, y)) gameOver = true;
};
const checkFullLine = function () {
  const newRows = [];
  table = table.filter((row, i) => {
    if (row.every((box) => box)) {
      newRows.push(new Array(10).fill(0));
      return false;
    }
    return true;
  });
  table = [...newRows, ...table];
  calculateScore(newRows.length);
};

const eventContact = function () {
  score += 1;
  checkGameOver();
  newFigureOnTable();
};

const checkContact = function () {
  if (hasBottomContact()) return eventContact();
  if (hasBoxBottomContact()) return eventContact();
  if (hasBoxAroundContact()) return eventContact();
};
const left = function () {
  positionFigure.x = horizontLimiter(positionFigure.x - 1);
};
const right = function () {
  positionFigure.x = horizontLimiter(positionFigure.x + 1);
};
const drop = function () {
  positionFigure.y = bottomLimiter(positionFigure.y + 1);
};
const rotate = function () {
  const rows = figure.length - 1;
  const columns = figure[0].length - 1;
  const figureReversed = Array.from(figure).reverse();
  const figureRotated = [];
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      if (!row) {
        figureRotated.push([figureReversed[row][column]]);
      } else {
        figureRotated[column][row] = figureReversed[row][column];
      }
    }
    figure = figureRotated;
  }
};
const clickOnLeft = function () {
  clearFigureInTable();
  left();
  setPositionFigure();
  renderGame();
};
const clickOnRight = function () {
  clearFigureInTable();
  right();
  setPositionFigure();
  renderGame();
};
const clickOnDown = function () {
  checkContact();
  clearFigureInTable();
  drop();
  setPositionFigure();
  renderGame();
};
const clickOnUp = function () {
  checkContact();
  clearFigureInTable();
  rotate();
  positionFigure.x = horizontLimiter(positionFigure.x);
  positionFigure.y = bottomLimiter(positionFigure.y);
  setPositionFigure();
  renderGame();
};
const controllingHandle = function (event) {
  switch (event.code) {
    case 'ArrowLeft':
      return clickOnLeft();
    case 'ArrowRight':
      return clickOnRight();
    case 'ArrowDown':
      return clickOnDown();
    case 'ArrowUp':
      return clickOnUp();
  }
};
const createFigure = function () {
  const arrFigures = Object.values(figures);
  const MIN = 0;
  const MAX = arrFigures.length - 1;
  const index = randomNum(MIN, MAX);
  return arrFigures[index];
};

const initialFigurePosition = function () {
  const figureWidth = figure[0].length - 1;
  const tableWidth = table[0].length - 1;
  const centerTable = Math.ceil(tableWidth / 2);
  const centerFigure = Math.ceil(figureWidth / 2);
  return centerTable - centerFigure;
};
const clearFigureInTable = function () {
  mappingFigure((yRow, xCol, itemColumn) => {
    table[yRow][xCol] = table[yRow][xCol] && !itemColumn ? table[yRow][xCol] : 0;
    return itemColumn;
  });
};

const setPositionFigure = function () {
  mappingFigure((yRow, xCol, itemColumn) => {
    table[yRow][xCol] = table[yRow][xCol] === 0 ? itemColumn : table[yRow][xCol];
    return itemColumn;
  });
};

const mappingFigure = function (callback) {
  figure.forEach((itemRow, row) => {
    itemRow.forEach((itemColumn, column) => {
      const { x, y } = positionFigure;
      const yRow = y + row;
      const xCol = x + column;
      figure[row][column] = callback(yRow, xCol, itemColumn);
    });
  });
};
const coloredNumbersFigure = function () {
  const randomColorNumber = randomNum(1, 4);
  mappingFigure((yRow, xCol, itemColumn) => (itemColumn ? randomColorNumber : 0));
};

const setBestScore = () =>
  getBestScore() <= score ? localStorage.setItem('best_score', score) : null;
const newFigureOnTable = function () {
  setBestScore();
  checkFullLine();
  figure = createFigure();
  coloredNumbersFigure();
  positionFigure.x = initialFigurePosition();
  positionFigure.y = 0;
  setPositionFigure();
};

const renderTable = function () {
  wrap.textContent = '';
  table.forEach((row) => {
    row.forEach((box) => {
      const div = document.createElement('div');
      const colors = ['blue', 'red', 'green', 'yellow'];
      box ? div.classList.add('box', 'block', colors[box - 1]) : div.classList.add('box', 'space');
      wrap.append(div);
    });
  });
};
const renderScore = function () {
  const scoreNode = document.querySelector('.score-total');
  scoreNode.textContent = score;
  const levelNode = document.querySelector('.level-total');
  levelNode.textContent = level() + 1;
  const linesNode = document.querySelector('.lines-total');
  linesNode.textContent = destroyLines;
  const bestScoreNode = document.querySelector('.score-best');
  bestScoreNode.textContent = getBestScore();
};

const calculateScore = function (currentDestroyLines) {
  destroyLines += currentDestroyLines;
  score += Math.floor(currentDestroyLines * table[0].length * 1.9);
};
const initialization = function () {
  table = createTable(10, 20);
  newFigureOnTable();
  document.addEventListener('keydown', controllingHandle);
  renderGame();
};

const renderGame = function () {
  if (gameOver) {
    document.removeEventListener('keydown', controllingHandle);
    setBestScore();
    renderScore();
    return wrap.innerHTML;
  }
  renderTable();
  renderScore();
};
const runGame = function () {
  initialization();
  const delay = () => SECOND - level() * 100;
  setTimeout(function go() {
    if (!gameOver) {
      setTimeout(go, delay());
      checkContact();
      clearFigureInTable();
      drop();
      setPositionFigure();
    }
    renderGame();
  }, delay());
};
runGame();
