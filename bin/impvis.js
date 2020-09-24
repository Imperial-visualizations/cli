#!/usr/bin/env node

const yargs = require('yargs');

require('yargs')
.strict()
.command('create <project-name>','Create a new visualisation',(yargs)=>{
    yargs.option('git',{
        alias:'g',
        default:false,
        type:'boolean',
        describe:'Initialise git repository in new project'
    })
    .positional('project-name',{
        describe: 'name of visualisation',
        type: 'string',
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

    .option('verbose',{
        default:false,
        type:'boolean',
        describe:'Use verbose mode'
    })
},(argv) => {
    require('../src/create.js')(argv);
})
.command('addpage <pageName>','Add page to existing multipage visualisation',(yargs)=>{
    yargs.positional('pageName',{
        type:'string',
        describe:'Name of page to add to visualisation'
    })
},(argv)=>{
    require('../src/addpage.js')(argv)
})
.command('removepage <pageName>','Remove an existing page from a visualisation',(yargs)=>{
    yargs.positional('pageName',{
        type:'string',
        describe:'Name of page to remove from visualisation'
    })
},(argv) => {
    require('../src/rmpage.js')(argv)
})
.command('serve [port]','Create a temp web server to host files in this directory. To be used with all none Node.js visualisations',(yars) =>{
    yargs.positional('port',{
        type:'integer',
        describe:'Port to create server on',
        default:8080
    })
},(argv) => {
    require('../src/serve.js')(argv)
})

.demandCommand()
.help('h')
.alias('h','help')
.version()
.argv;
