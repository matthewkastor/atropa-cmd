/*jslint indent: 4, maxerr: 50, white: true, node: true, stupid: true */

/**
 * @file Utilities for executing commandlines.
 * @author <a href="matthewkastor@gmail.com">Matthew Kastor</a>
 * @version 20121030
 * @requires fs
 * @requires events
 * @requires util
 * @requires child_process
 * @exports asynchronousCommand
 * @exports commandRegister
 */

'use strict';

var fs, util, events, exec, colors, commandRegister, asynchronousCommand;

fs     = require('fs');
events = require('events');
util   = require('util');
exec   = require('child_process').exec;

/**
 * Contains command register classes.
 * @namespace
 */
commandRegister = {};

/**
 * Executes an asynchronous command. For all intents and purposes this
 *  should be the same as running it on the command line. When the command
 *  is finished running the callback will be executed and any data sent to
 *  stdout, stderr, or any errors in attempting to run the command will be
 *  passed to it.
 * @function
 * @param {String} commandString The command you want to run.
 * @param {String} workingDirectory The path you want to start from.
 * @param {Function} callback Optional. A function to execute upon
 *  completion. The callback will be passed the error, stdout, and stderr
 *  arguments.
 * @requires child_process
 */
asynchronousCommand = function asynchronousCommand(commandString, workingDirectory, callback) {
    var child;
    
    callback = callback || function () {};
    
    child = exec(commandString,
        {
            cwd : workingDirectory
        },
        callback
    );
};

/**
 * Represents a register for a set of commands which will be executed in order, one at a time.
 * @class
 * @param {String} name A name to identify this register.
 * @emits {command queue processed} Emits a 'command queue processed'
 *  event whose message is the name of this register.
 * @requires events
 * @requires util
 */
commandRegister.Synchronous = function Synchronous(name) {
    var that;
    
    that = this;
    events.EventEmitter.call(this);
    
    /**
     * The name assigned to this commands register
     */
    this.name = name;
    /**
     * The queue to fill with commands.
     */
    this.queue = [];
    
    function process() {
        var command;
        if(that.queue.length > 0) {
            command = that.queue.shift();
            that.emit('command executing', command);
            command(that.process);
        } else {
            that.emit('command queue processed', that.name);
        }
    }
    
    /**
     * Shifts commands off the command queue and executes them one by one. All commands
     *  will be given a callback as their only argument. If the command being
     *  processed from the queue decides not to execute this callback, no more
     *  commands will be shifted off the queue.
     */
    this.process = function() {
        that.emit('command queue begin process', that.name);
        process();
    };
};
util.inherits(commandRegister.Synchronous, events.EventEmitter);

/**
 * Represents a register for a set of commands which will be executed simultaneously.
 * @class
 * @param {String} name A name to identify this register.
 * @emits {command queue processed} Emits a 'command queue processed'
 *  event whose message is the name of this register.
 * @emits {command executing} Emits a 'command executing' event whose message
 *  is the command being processed.
 * @emits {command complete} Emits a 'command complete' event whose message is
 *  the command which has finished.
 * @requires events
 * @requires util
 */
commandRegister.Asynchronous = function Asynchronous(name) {
    var that, counter;
    
    that = this;
    events.EventEmitter.call(this);
    
    /**
     * The name assigned to this commands register
     */
    this.name = name;
    /**
     * The queue to fill with commands.
     */
    this.queue = [];
    counter = this.queue.length;
    
    function decriment() {
        counter -= 1;
        if(counter === 0) {
            that.emit('command queue processed', that.name);
        }
    }
    
    this.on('command complete', decriment);
    
    function process() {
        var command, commandComplete;
        
        if(that.queue.length > 0) {
            command = that.queue.shift();
            commandComplete = function () {
                that.emit('command complete', command);
            };
            that.emit('command executing', command);
            command(commandComplete);
            process();
        } else {
            that.emit('waiting for commands to complete', that.name);
        }
    }
    
    /**
     * Shifts commands off the command queue and executes them simultaneously. All commands
     *  will be given a callback as their only argument. The callback must be executed
     *  to allow the register to know when it is finished so it can emit
     *  'command queue processed'. The callback itself will cause the register to emit
     *  'command complete' once the command has finished executing.
     */
    this.process = function() {
        counter = this.queue.length;
        that.emit('command queue begin process', that.name);
        process();
    };
};
util.inherits(commandRegister.Asynchronous, events.EventEmitter);

exports.asynchronousCommand = asynchronousCommand;
exports.commandRegister     = commandRegister;