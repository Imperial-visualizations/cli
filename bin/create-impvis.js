#!/usr/bin/env node
require('yargs')
.strict()
.command('$0 <project-name>','',(yargs)=>{
    yargs.option('git',{
        alias:'g',
        default:false,
        type:'boolean',
        describe:'Initialise git repository in new project'
    })
    .option('yes',{
        alias:'y',
        default:false,
        type:'boolean',
        describe:'Use default configuration'
    })
    .option('noRollback',{
        default:false,
        type:'boolean',
        describe:'Do not rollback configuration on error'
    })
    .help('h')
    .alias('h','help')
    .usage("Usage: $0 <project-name> [options]")
    .version()
    .option('verbose',{
        default:false,
        type:'boolean',
        describe:'Use verbose mode'
    })
},(argv) => {
    require = require("esm")(module);
    require('../src/cli.js').cli(argv);
})
.argv;
