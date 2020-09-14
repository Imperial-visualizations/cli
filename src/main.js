const {promisify} = require('util')
const fs = require('fs')
const ncp = require('ncp')
const path = require('path')
const chalk = require('chalk')
const Handlebars = require('handlebars')
const rimraf = require('rimraf')


const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir)

const copy = promisify(ncp);
const open = promisify(fs.readFile);
const write = promisify(fs.writeFile);


const INFO = chalk.bold.blue('INFO');
const ERROR = chalk.bold.red('ERROR')
const DONE = chalk.bold.green("DONE")



Handlebars.registerHelper("if_eq",function(a,b,opts) {
    if( a == b){
        return opts.fn(this);
    }else{
        return opts.inverse(this);
    }
});
Handlebars.registerHelper("squash",function (str){
    return str.toLowerCase().replace(/ /g,"_");
})

async function copyTemplateFiles(options){
    return copy(options.templateDir,options.targetDir,{
        clobber:false
    })
}

async function createProjectFolder(options){
    let targetDir = path.join(process.cwd(),options.projectName);
    await mkdir(targetDir);
    options.targetDir = targetDir;
    return targetDir
}


async function getTemplateDir(localTemplateDir){
    let templateDir = path.resolve(
        __filename,localTemplateDir
    )
    try{
        await access(templateDir, fs.constants.R_OK);
    }catch(err){
        console.log('%s Error accessing template folder!',ERROR)
    }
    
    return templateDir;
}

async function renderFile(options,file='index.html'){
        let indexFile = path.join(options.targetDir,file);
        let content = await open(indexFile,'utf-8')
    
        await write( indexFile,Handlebars.compile(content)(options));
}

async function renderFileTo(options,templateFile,outputFile){
    let content = await open(templateFile,'utf-8')
    await write(outputFile,Handlebars.compile(content)(options))
}

module.exports = {
    renderFile,
    renderFileTo,
    getTemplateDir,
    createProjectFolder,
    copyTemplateFiles,
    rmDir: promisify(rimraf),
    INFO,
    ERROR,
    DONE
}
