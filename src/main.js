import {promisify} from 'util';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import chalk from 'chalk';
import { option } from 'yargs';
import Handlebars from 'handlebars'
import rimraf from 'rimraf';
import listr from 'listr';
import { create } from 'domain';
import { timingSafeEqual } from 'crypto';

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir)

const copy = promisify(ncp);
const open = promisify(fs.readFile);
const write = promisify(fs.writeFile);


const INFO = chalk.bold.blue('INFO');
const ERROR = chalk.bold.red('ERROR')
const DONE = chalk.bold.green("DONE")

const tasks = [
    {
        title:"Create project folder",
        task: async (ctx,task) => {
            await createProjectFolder(ctx);
            task.title = "Project folder created at " + chalk.underline(ctx.targetDir);
        }
    },
    {
        title:"Copy project files",
        task: async (ctx) => {
            await copyTemplateFiles(ctx);
            process.chdir(ctx.targetDir);
        }
    },
];

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

export async function renderHTMLFile(options,file='index.html'){
        let indexFile = path.join(options.targetDir,file);
        let content = await open(indexFile,'utf-8')
        await write( indexFile,Handlebars.compile(content)(options));
}

export async function createProject(options){
    if(options.verbose){
        console.log('%s' + options, INFO);
    }
    switch(options.template){
        case 'node':
            break;
        case 'script':
            break;
        case 'legacy':
            if(options.legacyTempVersion === 'basic'){
                options.templateDir = await getTemplateDir('../../templates/legacy/basic')
            }else if(options.legacyTempVersion === 'advanced'){
                options.templateDir = await getTemplateDir('../../templates/legacy/advanced')
            }
            tasks.push(
                {
                    title:"Generate index.html file",
                    task: (ctx) => renderHTMLFile(ctx)
                }
            )
            break;
        default:
            console.log('%s Something has gone very wrong. Quitting...',ERROR);
            process.exit(1);
    }
    try{
        options = await (new listr(tasks)).run(options);
    } catch(err){
        console.log('%s Something has gone wrong:' + err, ERROR);
        console.log('%s Aborting and Rolling back changes...',ERROR)
        process.chdir(__dirname);
        if(typeof options.targetDir !== 'undefined')  await promisify(rimraf)(options.targetDir);
        process.exit(1);
    }
    console.log("%s Project is ready!",DONE);
}
