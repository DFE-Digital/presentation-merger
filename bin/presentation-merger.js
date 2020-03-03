#!/usr/bin/env node
let bootStart = process.hrtime();
const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');
const debug = require('debug')('presentation-merger')

const mergeFiles = require('../lib/index.js').default;
debug(`Dependencies loaded ${process.hrtime(bootStart)[1] / 1000000}ms`);
let programStart = process.hrtime();

program
  .version(packageJson.version)
  .name('presentation-merge')
  .description(
    'Merge multiple Open Presentation Documents (ODP) into a single presentation document.'
  )
  .usage('<file> <file> ... [options]')
  .option(
    '-o, --file <output>',
    'single output file (if absent, prints to stdout)'
  )
  .option('--no-color', 'disables CLI color output')
  .arguments('<files...>')
  .action(async function(files, options) {
    debug(`Program loaded ${process.hrtime(programStart)[1] / 1000000}ms`);
    let allExist = files.every(file => fs.existsSync(path.resolve(file)));
    let destination = process.stdout;
    if (options.file) {
      destination = fs.createWriteStream(path.resolve(options.file), {
        flags: 'w',
      });
    }
    if (allExist) {
      let hrstart = process.hrtime();
      await mergeFiles(destination, files);
      debug(`Merged files in ${process.hrtime(hrstart)[1] / 1000000}ms`);
      debug(`Program total time ${process.hrtime(bootStart)[1] / 1000000}ms`);
      process.exit(0);
    } else {
      console.error(chalk`{bold.red Failed to merge documents:}
  {yellowBright One or more files provided is non existant.}
  
  {bold Files:}
    - ${files.join('\n    - ')}
`);
      process.exit(1);
    }
  });

program.parse(process.argv);
