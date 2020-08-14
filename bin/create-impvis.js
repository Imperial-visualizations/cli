#!/usr/bin/env node
require = require("esm")(module);
let argv = require('yargs')
.usage('Usage: $0 <project-name> [options]')
.default({git:false,yes:false})
.alias('g','git')
.describe('g','Init empty git repository')
.alias('y','yes')
.describe('y','Skip graphical configuration')
.help('h')
.help('h','help')
.argv;
require('../src/cli.js').cli(argv);