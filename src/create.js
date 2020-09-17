const inquirer = require('inquirer')
const chalk = require('chalk')
const pjson = require('../package.json')
const execa = require('execa');
const compare = require('compare-versions');
const boxen = require('boxen');
const listr = require('listr');

const fs = require('fs')
const ncp = require('ncp')
const {promisify} = require('util')
const copy = promisify(ncp)
const mkdir = promisify(fs.mkdir)

const {renderFile,getTemplateDir,createProjectFolder,copyTemplateFiles,rmDir,INFO,ERROR,DONE} = require('./main.js');
async function checkForUpdates(){
    let {stdout} = await execa('npm',['view','@impvis/cli','version'])
    if( compare(stdout,pjson.version) > 0){
        console.log(boxen(chalk.magenta.bold("A new version of @impvis/cli is available: ") + chalk.underline(`${pjson.version} -> ${stdout}`) +'\n' + chalk.blue('Run npm install -g @impvis/cli to update to latest version!'),{padding:1}))
    }
}

const templateChoices =[
    {name:'Standard project using Node.js backend (recommended)',value:'node',short:'Node project'},
    {name:'Standard project using <script> include',value:'script',short:'<script> include project'},
    {name:'Legacy project',value:'legacy',short:'Legacy Project'}
]
const additionalModules = [
    {name:'ESLint + Vue Plugin (Linting)',value:{name:'eslint',d_pkgs:[
        '@vue/cli-plugin-eslint',
        'eslint',
        'eslint-plugin-vue'
    ]},short:"ESLint",checked:true,nodeOnly:true},
    {name:'Babel (preprocessor for backwards compatiblity)',value:{name:'babel',d_pkgs:['babel','@vue/cli-plugin-babel']},short:"Babel",checked:true,nodeOnly:true},
    {name:'Three.js (3D graphics support)', value:{name:'three',pkgs:['three','@impvis/components-threejs']},short:'Three'},
    {name:'Katex (equation rendering support)',value:{name:'katex',pkgs:['katex','@impvis/components-katex']},checked:true,short:'Katex'},
    {name:'D3 (popular library for creating visualisations)',value:'d3',short:'D3'},
    {name:'p5.js (legacy library for 2D graphics',value:'p5',short:'p5.js'},
    {name:'Math.js (Mathematical computation library)',value:'mathjs',short:'math.js'}
]
const legacyChoices = [
    {name:"Basic legacy template with no VueJS",value:"basic",short:"Basic Template"},
    {name:"Advanced legacy template with VueJS and multipage scrolling",value:"advanced",short:"Advanced Template"}
]

async function configurationPrompt(options){
    const questions = [
        {
            type:'list',
            name:'template',
            message:'What project template do you wish to use?',
            choices:templateChoices,
            default:templateChoices[0]
        },
        {
            type:'list',
            name:"legacyTempVersion",
            message:"Which version of the legacy template do you wish to use?",
            choices: legacyChoices,
            default: 0,
            when: (answers) => answers.template === 'legacy'
        },
        {
            type:'checkbox',
            name:'additionalModules',
            message:'Please select additional modules that you wish to enable for this project:',
            choices: (answers) =>  additionalModules.filter(m => !(m.nodeOnly && answers.template !== 'node')),
            when: (answers) => answers.template !== 'legacy'
        },
        {
            type:'confirm',
            name:'isMPA',
            message:'Do you want to create a multi-page visualisation?',
            default:false,
            when: (answers) => answers.template === 'node'
        },
        {
            type:'input',
            name:'pages',
            message:'Enter names of the visualisation pages that you want to create seperated by commas:',
            when: (answers) => answers.isMPA,
            validate: (input) => (input.length > 1)? true : 'Please enter at least 2 items',
            filter: (input) => input.split(',').map(str=> str.trim()).filter( str => str.length > 0),
        }
    ];
    if(!options.git){
        questions.push({
            type:'confirm',
            name:'git',
            message:'Do you wish to initalise a blank git repository in your new project?',
            default:true
        })
    }
    const answers = await inquirer.prompt(questions)
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git,
        additionalModules: options.additionalModules || answers.additionalModules,
        legacyTempVersion: options.legacyTempVersion || answers.legacyTempVersion,
        isMPA: options.isMPA || answers.isMPA,
        pages: options.pages || answers.pages

    }

}

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
            await renderFile(ctx,'vue.config.js')
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
                task.output = `(${i+1}/${ctx.additionalModules.length}) Installing ${ctx.additionalModules[i].name || ctx.additionalModules[i]}`
                if(ctx.additionalModules[i].d_pkgs){
                    if(ctx.additionalModules[i].name === 'babel' && ctx.eslint){
                        await execa('npm',['install','-D','babel-eslint'])
                    }
                    await execa('npm',['install','-D',...ctx.additionalModules[i].d_pkgs])
                }
                if(ctx.additionalModules[i].pkgs){
                    await execa('npm',['install',...ctx.additionalModules[i].pkgs])
                }
                if(typeof ctx.additionalModules[i] === 'string'){
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

module.exports = async function cli(argv){
    console.clear();
    await checkForUpdates();
    console.log(chalk.bold('✨ Imperial Visualisations CLI') + chalk.yellow(' v' +pjson.version))
    console.log('🎨 ' + chalk.yellow.bold("Creating Project >> ") + chalk.underline(argv.projectName) + "\n");
    console.log('Press' + chalk.underline('Ctrl+C') + 'to quit this configuration prompt')
    let options = await configurationPrompt(argv);
    const additionalModuleNames = options.additionalModules.map( (x) => x.name || x)
    if(options.verbose){
        console.log('%s Object state:', INFO);
        console.log(options)
    }
    try{
        if(options.template !== 'legacy'){
            options.eslint = additionalModuleNames.indexOf('eslint') > -1
            options.babel = additionalModuleNames.indexOf('babel') > -1
            options.katex = additionalModuleNames.indexOf('katex') > -1 
            options.three = additionalModuleNames.indexOf('threejs') > -1
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
        if(typeof options.targetDir !== 'undefined')  await rmDir(options.targetDir);
        process.exit(1);
    }
    console.log("%s Project is ready!",DONE);
}