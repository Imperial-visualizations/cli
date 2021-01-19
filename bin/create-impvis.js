#!/usr/bin/env node
var execa = require('execa')
var chalk = require('chalk')
console.log( chalk.yellow('WARNING') + ' create-impvis has been depreciated, please use \"impvis create\" going forward')
setTimeout( ()=>{try{
    execa.sync('impvis',['create',...process.argv.slice(2)],{shell:true,stdio:'inherit'})
}
catch(err){
    //This is left intentionally blank
    //This is because impvis process (or rather the spawned shell) catches the keyboard interupt independently of us and then quits itself
    //As this appears to execa, the process has quit unexpectdly and thus throws an error.
    //There is probably a smarter way to handle this, but at the moment this solution is a lazy fix for those who still use create-impvis
}
},2000);
