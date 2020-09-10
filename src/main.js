const {promisify} = require('util')
const fs = require('fs')
const ncp = require('ncp')
const path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const Handlebars = require('handlebars')
const rimraf = require('rimraf')
const listr = require('listr')

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir)

const copy = promisify(ncp);
const open = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const deleteFile = promisify(fs.unlink);

const INFO = chalk.bold.blue('INFO');
const ERROR = chalk.bold.red('ERROR')
const DONE = chalk.bold.green("DONE")

const eslintInstall = [
    '@vue/cli-plugin-eslint',
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
        title:"Generate pages",
        task: async (ctx) => {
            await copy(`${ctx.templateDir}-additional/src`,`${ctx.targetDir}/src`)
            for(let i = 0; i < ctx.pages.length; i++){
                await mkdir(`${ctx.targetDir}/src/${ctx.pages[i]}`)
                await copy(`${ctx.templateDir}-additional/page_template/Page.vue`,`${ctx.targetDir}/src/${ctx.pages[i]}/${ctx.pages[i]}.vue`)
                await copy(`${ctx.templateDir}-additional/page_template/main.js`,`${ctx.targetDir}/src/${ctx.pages[i]}/main.js`)
                await renderFile({...ctx,pageName:ctx.pages[i]},`src/${ctx.pages[i]}/${ctx.pages[i]}.vue`)
                await renderFile({...ctx,pageName:ctx.pages[i]},`src/${ctx.pages[i]}/main.js`)
                if(ctx.verbose){
                    console.log('%s Copied '+ctx.pages[i]+ ' page to project',INFO)
                }
            }
            await copy(`${ctx.templateDir}-additional/vue.config.js`,`${ctx.targetDir}/vue.config.js`)
            await renderFile(ctx,'vue.config.js')
            await renderFile(ctx,'package.json')
        },
        enabled: (ctx) => ctx.isMPA
    },
    {
        title:"Generate core files",
        enabled: (ctx) => ctx.template === 'node' && !ctx.isMPA,
        task: async (ctx) => {
            await renderFile(ctx,'src/main.js')
            await renderFile(ctx,'package.json')
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
        task: async (ctx,task) => {
            const result = execa('npm',['install'])
            await result
        }
    },
    {
        title:"Install additional dependencies",
        enabled: (ctx) => ctx.template == 'node' && ctx.additionalModules.length > 0,
        task: async (ctx,task) => {
            for(let i = 0; i < ctx.additionalModules.length; i++){
                task.output = `(${i+1}/${ctx.additionalModules.length}) Installing ${ctx.additionalModules[i]}`
                if(ctx.additionalModules[i] == 'eslint'){
                    if(ctx.babel){
                        eslintInstall.push('babel-eslint')
                    }
                    await execa('npm',['install','-D', ...eslintInstall])
                }
                else if(ctx.additionalModules[i] == 'babel'){
                    await execa('npm',['install','-D','babel','@vue/cli-plugin-babel'])
                } else{
                    await execa('npm',['install',ctx.additionalModules[i]])
                }
            }
        }
    },
    {
        title:"Initialize git repository",
        enabled:(ctx) => ctx.git,
        task: (ctx) => execa('git',['init'])
    }
];

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

module.exports = async function createProject(options){
    if(options.verbose){
        console.log('%s Object state:', INFO);
        console.log(options)
    }
    try{
        if(options.template !== 'legacy'){
            options.eslint = options.additionalModules.indexOf('eslint') > -1
            options.babel = options.additionalModules.indexOf('babel') > -1
            options.katex = options.additionalModules.indexOf('@impvis/components-katex') > -1 
            options.three = options.additionalModules.indexOf('@impvis/components-threejs') > -1
        }
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
    }
    catch (err){
        console.log('%s Something went wrong in the pre setup phase of the project',ERROR)
        console.log('%s ' + err.stack,ERROR)
        process.exit(2)
    }
    try {
        options = await (new listr(tasks)).run(options);
    } catch(err){
        console.log('%s Something has gone wrong:\n      ' + err.stack, ERROR);
        if(options.verbose){
            console.log('%s Current options state:',INFO);
            console.log(options);
        }
        if(options.noRollback){
            process.exit(1);
        }
        console.log('%s Aborting. Rolling back changes...',ERROR)
        process.chdir(__dirname);
        if(typeof options.targetDir !== 'undefined')  await promisify(rimraf)(options.targetDir);
        process.exit(1);
    }
    console.log("%s Project is ready!",DONE);
}
