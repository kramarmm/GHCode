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

  const splitted = data.split('\n');

  // console.log(splitted);

  return [
    ...splitted[0].split(' '),
    splitted.slice(1)
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

  const typesOfSclices = Array.from({ length: maximumTotalNumberOfCellsOfSlice }).reduce(
    (acc, item, i) => {
      const result = maximumTotalNumberOfCellsOfSlice / (i + 1);
      if (Number.isInteger(result)) acc.push([i + 1, result]);
      return acc;
    },
    []
  );

  console.log(typesOfSclices);

  // ---------- DEBUG ---------- //
  // console.log('numberOfRows => ', numberOfRows);
  // console.log('numberOfColumns => ', numberOfColumns);
  // console.log('minimumNumberOfEachIngredientCellsInSlice => ', minimumNumberOfEachIngredientCellsInSlice);
  // console.log('maximumTotalNumberOfCellsOfSlice => ', maximumTotalNumberOfCellsOfSlice);
  // console.log('grid => ', grid);

  return [[2], [12, 14, 12, 5]];
}


// ---------- NORMALIZE OUTPUT ---------- //
function normalizeOutput(result) { // [[1], [0, 0, 2, 1]]
  return result.reduce(
    (acc, row) => acc.concat(row.join(' '), '\n'),
    '',
  );
}
