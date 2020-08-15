import {promisify} from 'util';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import execa from 'execa';
import chalk from 'chalk';
import Handlebars from 'handlebars'
import rimraf from 'rimraf';
import listr from 'listr';
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir)

const copy = promisify(ncp);
const open = promisify(fs.readFile);
const write = promisify(fs.writeFile);


const INFO = chalk.bold.blue('INFO');
const ERROR = chalk.bold.red('ERROR')
const DONE = chalk.bold.green("DONE")

const eslintInstall = [
    '@vue/cli-plugin-babel',
    '@vue/cli-plugin-eslint',
    '@vue/cli-service',
    'eslint',
    'eslint-plugin-vue'
]

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
    {
        title:"Generate index.html file",
        enabled: (ctx) => ctx.template !== 'node',
        task: (ctx) => renderFile(ctx)
    },
    {
        title:"Install core project dependencies",
        enabled: (ctx) => ctx.template == 'node',
        task: async (ctx) => {
            await renderFile(ctx,'package.json') //Render package json
            const {stdout} = await execa('npm',['install'])

        }
    },
    {
        title:"Install additional dependencies",
        enabled: (ctx) => ctx.template == 'node' && ctx.additionalModules.length > 0,
        task: async (ctx,task) => {
            for(let i = 0; i < ctx.additionalModules.length; i++){
                task.output = `(${i+1}/${ctx.additionalModules.length}) Installing ${ctx.additionalModules[i]}`
                if(ctx.additionalModules[i] == 'three'){
                    await execa('npm',['install','@impvis/threejscomponents'])
                    await execa('npm',['install','three'])
                }
                else if(ctx.additionalModules[i] == 'eslint'){
                    await execa('npm',['install','-D', ...eslintInstall])
                } else{
                    await execa('npm',['install',ctx.additionalModules[i]])
                }
            }
        }
    },
    {
        title:"Initalise git repository",
        enabled:(ctx) => ctx.git,
        task: (ctx) => execa('git',['init'])
    }
];

Handlebars.registerHelper("if_eq",function(a,b,opts) {
    if( a == b){
        return opts.fn(this);
    }else{
        return opts.inverse(this)
    }
});

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

export async function renderFile(options,file='index.html'){
        let indexFile = path.join(options.targetDir,file);
        let content = await open(indexFile,'utf-8')
    
        await write( indexFile,Handlebars.compile(content)(options));
}

export async function createProject(options){
    if(options.verbose){
        console.log('%s Object state:', INFO);
        console.log(options)
    }
    options.eslint = options.additionalModules.indexOf('eslint') > -1
    switch(options.template){
        case 'node':
            options.templateDir = await getTemplateDir('../../templates/node')
            break;
        case 'script':
            options.templateDir = await getTemplateDir('../../templates/script')
            break;
        case 'legacy':
            if(options.legacyTempVersion === 'basic'){
                options.templateDir = await getTemplateDir('../../templates/legacy/basic')
            }else if(options.legacyTempVersion === 'advanced'){
                options.templateDir = await getTemplateDir('../../templates/legacy/advanced')
            }
            break;
        default:
            console.log('%s Something has gone very wrong. Quitting...',ERROR);
            process.exit(1);
    }
    try{
        options = await (new listr(tasks)).run(options);
    } catch(err){
        console.log('%s Something has gone wrong:\n      ' + err.stack, ERROR);
        if(options.verbose){
            console.log('%s Current options state:',INFO);
            console.log(options);
        }
        console.log('%s Aborting. Rolling back changes...',ERROR)
        process.chdir(__dirname);
        if(typeof options.targetDir !== 'undefined')  await promisify(rimraf)(options.targetDir);
        process.exit(1);
    }
    console.log("%s Project is ready!",DONE);
}
