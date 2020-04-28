var ProgressBar = require('progress');
var chalk = require('chalk');
var webpack = require('webpack');

require('object.assign').shim();

module.exports = function SoundiizProgressWebpack(options) {
  options = options || {};

  var ASCIISOUNDIIZ = '  _____                       _ _ _     \n' +
    '/  ___|                     | (_|_)    \n' +
    '\\ `--.  ___  _   _ _ __   __| |_ _ ____\n' +
    ' `--. \\/ _ \\| | | | \'_ \\ / _` | | |_  /\n' +
    '/\\__/ / (_) | |_| | | | | (_| | | |/ / \n' +
    '\\____/ \\___/ \\__,_|_| |_|\\__,_|_|_/___|\n';

  var ASCIISDZSH = '   _____ _____ ______   _____ _    _ \n' +
    '  / ____|  __ \\___  /  / ____| |  | |\n' +
    ' | (___ | |  | | / /  | (___ | |__| |\n' +
    '  \\___ \\| |  | |/ /    \\___ \\|  __  |\n' +
    '  ____) | |__| / /__ _ ____) | |  | |\n' +
    ' |_____/|_____/_____(_)_____/|_|  |_|';

  var ASCIIFINAL = (options && options.sdz)?ASCIISDZSH:ASCIISOUNDIIZ;


  var envName = chalk.blue.bold('( DEV )');
  if(options && options.env && options.env === "prod"){
    envName = chalk.red.bold('! PROD !');
  }

  var compilerName = '------- WEBPACK COMPILER '+envName+' -------\n\n';


  var stream = options.stream || process.stderr;
  var enabled = stream && stream.isTTY;

  if (!enabled) {
    return function () {};
  }

  var barLeft = chalk.bold('[');
  var barRight = chalk.bold(']');
  var preamble = chalk.magenta.bold('Compiling front assets =>  ') + barLeft;
  var barFormat = options.format || preamble + ':bar' + barRight + chalk.green.bold(' :percent');
  var summary = options.summary !== false;
  var summaryContent = options.summaryContent;
  var customSummary = options.customSummary;

  delete options.format;
  delete options.total;
  delete options.summary;
  delete options.summaryContent;
  delete options.customSummary;

  var barOptions = Object.assign({
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 100,
    clear: false
  }, options);

  var bar = new ProgressBar(barFormat, barOptions);

  var running = false;
  var startTime = 0;
  var lastPercent = 0;

  return new webpack.ProgressPlugin(function (percent, msg) {
    if (!running && lastPercent !== 0 && !customSummary) {
      stream.write(chalk.red(percent.toString() + ' '));
      stream.write('\n');
    }

    var newPercent = Math.ceil(percent * barOptions.width);

    if(running){
      bar.update(percent, {
        msg: msg
      });
    }

    if (lastPercent !== newPercent) {
      lastPercent = newPercent;
    }


    if (!running) {
      stream.write('\n');
      stream.write('\n');
      stream.write('\n');
      stream.write(chalk.magenta.bold(ASCIIFINAL));
      stream.write(compilerName);
      running = true;
      startTime = new Date;
      lastPercent = 0;
    } else if (percent === 1) {
      var now = new Date;
      var buildTime = (now - startTime) / 1000 + 's';

      bar.terminate();

      if (summary) {
        stream.write(chalk.green.bold('Build completed in ' + buildTime + '\n\n'));
      } else if (summaryContent) {
        stream.write(summaryContent + '(' + buildTime + ')\n\n');
      }

      if (customSummary) {
        customSummary(buildTime);
      }

      running = false;
    }
  });
};
