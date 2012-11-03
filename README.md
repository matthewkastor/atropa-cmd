#Atropa CMD
Utilities for executing commandlines

This package provides a few utilies for executing commandline programs. It provides an asynchronous command runner, an asynchronous command register, and a synchronous command register. The idea is that sometimes we need to wait for commands to return, sometimes we do not. By grouping the commands into sets of synchronous and asynchronous it's easier to manage process flow. Let the commands run wild doing their own thing if they don't depend on eachother. When they're finished, run another set of commands that uses the output of the first set. The point is to block when you have to, go async when you can, and be able to control the timing of it all without tripping over yourself.

It's easy.

- Write up functions that utilize the command runner and accept a callback as their only argument
- Push or unshift the functions into the queue of an instance of the async or sync register
- Call the registers `process` function to process the queue of functions

For more details see the docs folder, or the comments in the code. The script is really small, it's likely easiest just to read it.