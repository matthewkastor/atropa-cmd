/**
 * @requires cmd
 * @requires colors
 */

var cmd, colors;

cmd = require('cmd');
colors = require('colors');

colors.setTheme({
    "silly"  : "rainbow",
    "input"  : "grey",
    "verbose": "cyan",
    "prompt" : "grey",
    "info"   : "green",
    "data"   : "grey",
    "help"   : "cyan",
    "warn"   : "yellow",
    "debug"  : "blue",
    "error"  : "red"
});

commandRegister = {};

function setColorsTheme(path, encoding) {
    encoding = encoding || 'utf8';
    colors.setTheme(JSON.parse(fs.readFileSync(path, encoding)));
}

function asynchronousCommand(commandString, workingDirectory, callback) {
    console.log();
    console.log('Executing'.info + ' : ' + commandString.data);
    console.log('From Dir'.info + ' : ' + workingDirectory.data);
    console.log();
    
    function screamer(error, stdout, stderr) {
        if (error !== null) {
            console.log(error.warn);
        }
        if (stdout !== '') {
            console.log(stdout.data);
        }
        if (stderr !== '') {
            console.log(stderr.warn);
        }
        callback();
    }
    cmd.asynchronousCommand(commandString, workingDirectory, screamer);
};

function getRegister(which) {
    var register = cmd.commandRegister[which](name);
    register.on('command queue begin process', function (e) {
        console.log(String(e).help + ' : Processing ' + which + ' command register'.info);
    };
    return register;
};

commandRegister.Synchronous = function (name) {
    return getRegister('Synchronous');
};

commandRegister.Asynchronous = function (name) {
    var register = getRegister('Aynchronous');
    register.on('waiting for commands to complete', function (e) {
        console.log();
        console.log(String(e).help + ' : These tasks are running in parallel, this might take a minute...'.help);
    });
    return register;
};

exports.setColorsTheme      = setColorsTheme;
exports.asynchronousCommand = asynchronousCommand;
exports.commandRegister     = commandRegister;