const fs = require('fs');

const [
  execPath,
  pathToCurrentFile,
  fileName,
] = process.argv;

// ---------- READ FILE ---------- //
fs.readFile(`./in/${fileName}.in`, 'ascii', fileHandler);

function fileHandler(err, data) {
  if (err) throw err;

  fs.writeFile(
    `./out/${fileName}.out`,
    normalizeOutput(
      doLogic(
        parseData(data)
      )
    ),
    { encoding: 'ascii' },
    err => {
      if (err) throw err;
      console.log('DONE!');
    }
  );
}


// ---------- PARSE DATA ---------- //
function parseData(data) {
  // check 'File format section'
  // 1st: R C L H
  // R lines contain C characters ('M' or 'T')

  const cahracterToSplitBy = process.platform.indexOf('win') > -1 ? '\r\n' : '\n';
  const splitted = data.split(cahracterToSplitBy);

  return [
    ...splitted[0].split(' '),
    splitted.slice(1, -1)
  ];
}


// ---------- DO LOGIC ---------- //
function doLogic(parsedData) {
  const [
    numberOfRows,
    numberOfColumns,
    minimumNumberOfEachIngredientCellsInSlice,
    maximumTotalNumberOfCellsOfSlice,
    grid,
  ] = parsedData;

  const markedGrid = grid.map(
    row => ([...row])
  );

  const typesOfSclices = getTypesOfSclices(maximumTotalNumberOfCellsOfSlice);
  const result = []; // [[y, x]]

  let pointer = [0, 0]; // x, y
  let typePointer = 0; // x, y

  let finish = false;

  function isCellAlreadyUsed([x, y]) {
    if (!markedGrid[y][x]) {
      return true;
    }
    return markedGrid[y][x] === '0';
  }

  function addToResult(sliceChoords) {
    result.push([...sliceChoords[0], ...sliceChoords[1]]);

    for (let y = sliceChoords[0][0]; y <= sliceChoords[1][0]; y++) {
      for (let x = sliceChoords[0][1]; x <= sliceChoords[1][1]; x++) {
        markedGrid[y][x] = '0';
      }
    }
  }

  function getNewStartChoords(currentChoords) {
    let x = currentChoords[0] + 1;
    for (let y = currentChoords[1]; y < numberOfRows; y++) {

      if (x >= numberOfColumns) {
        x = 0;
        continue;
      }

      for (; x < numberOfColumns; x++) {
        if (!isCellAlreadyUsed([x, y])) {
          pointer = [x, y];
          return false; // set finish to false
        }
      }
    }

    return true; // set finish to true
  }

  while (true) {
    // console.log('/-------------------- START -------------------/');

    if (finish) {
      break;
    }

    let skipThisSlice = false;

    let sliceSize = typesOfSclices[typePointer]; // x, y
    // console.log('sliceSize => ', sliceSize);

    const slice = [];
    const sliceChoords = [];

    sliceChoords.push([pointer[1], pointer[0]]); // x

    for (let x = 0; x < sliceSize[0]; x++) {
      for (let y = 0; y < sliceSize[1]; y++) {
        let pointerX = pointer[0] + x;
        let pointerY = pointer[1] + y;

        // console.log('pointerX => ', pointerX);
        // console.log('pointerY => ', pointerY);

        if (
            pointerX < numberOfColumns
            && pointerY < numberOfRows
            && !isCellAlreadyUsed([pointerX, pointerY])
        ) {
          slice.push(grid[pointerY][pointerX]);
        } else {
          typePointer++;
          sliceSize = typesOfSclices[typePointer];
          skipThisSlice = true;

          if (!sliceSize) {
            finish = getNewStartChoords(pointer);
            typePointer = 0;
            console.log('finish    ', finish);
          }

          break;
        }
      }

      if (skipThisSlice || finish) {
        break;
      }
    }

    if (skipThisSlice) {
      // console.log('/-------------------- ERROR -------------------/');
      continue;
    }

    // console.log('/-------------------- FINISH -------------------/');
    console.log('/--------------------------------------------/');

    sliceChoords.push([pointer[1] + sliceSize[1] - 1, pointer[0] + sliceSize[0] - 1]); // y

    // check slice to be valid
    if (
      slice.filter(ingr => ingr === 'M').length >= minimumNumberOfEachIngredientCellsInSlice
      && slice.filter(ingr => ingr === 'T').length >= minimumNumberOfEachIngredientCellsInSlice
    ) {
      addToResult(sliceChoords);
      // console.log('markedGrid => ', markedGrid);
    }

    // reset typePointer
    typePointer = 0;
    finish = getNewStartChoords(pointer);

    console.log('slice => ', slice);
    console.log('sliceChoords => ', sliceChoords);
  }

  result.unshift([result.length]);
  return result;
}

function getTypesOfSclices(maximumTotalNumberOfCellsOfSlice) {
  const result = [];

  for (let i = 1; i <= maximumTotalNumberOfCellsOfSlice; i++) {
    for (let j = 1; j <= maximumTotalNumberOfCellsOfSlice; j++) {
      result.push([i, j]);
    }
  }

  return result.reduce(
    (acc, dimensions) => {
      const sqr = dimensions[0] * dimensions[1];
      if (sqr >= 2 && sqr <= maximumTotalNumberOfCellsOfSlice) {
        acc.push(dimensions);
      }
      return acc;
    },
    []
  ).sort(
    (a, b) => (b[0] * b[1]) - (a[0] * a[1])
  );
}


// ---------- NORMALIZE OUTPUT ---------- //
function normalizeOutput(result) { // [[1], [0, 0, 2, 1]]
  return result.reduce(
    (acc, row) => acc.concat(row.join(' '), '\n'),
    ''
  );
}
