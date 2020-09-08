import inquirer from 'inquirer';
import yargs from 'yargs';
import chalk from 'chalk';
import pjson from '../package.json';
import {createProject} from './main.js';
import execa from 'execa';
import compare from 'compare-versions';
import boxen from 'boxen';

export async function checkForUpdates(){
    let {stdout} = await execa('npm',['view','@impvis/cli','version'])
    if( compare(stdout,pjson.version) > 0){
        console.log(boxen(chalk.magenta.bold("A new version of @impvis/cli is available: ") + chalk.underline(`${pjson.version} -> ${stdout}`) +'\n' + chalk.blue('Run npm update -g @impvis/cli to update to latest version!'),{padding:1}))
    }
}

export async function cli(argv){
    console.clear();
    await checkForUpdates();
    console.log(chalk.bold('✨ Imperial Visualisations CLI') + chalk.yellow(' v' +pjson.version))
    console.log('🎨 ' + chalk.yellow.bold("Creating Project >> ") + chalk.underline(argv.projectName) + "\n");
    let options = await configurationPrompt(argv);
    createProject(options);
}


const templateChoices =[
    {name:'Standard project using Node.js backend (recommended)',value:'node',short:'Node project'},
    {name:'Standard project using <script> include',value:'script',short:'<script> include project'},
    {name:'Legacy project',value:'legacy',short:'Legacy Project'}
]
const additionalModules = [
    {name:'ESLint + Vue Plugin (Linting)',value:'eslint',short:"ESLint",checked:true,nodeOnly:true},
    {name:'Babel (preprocessor for backwards compatiblity)',value:'babel',short:"Babel",checked:true,nodeOnly:true},
    {name:'Three.js (3D graphics support)', value:'@impvis/components-three',short:'Three'},
    {name:'Katex (equation rendering support)',value:'@impvis/components-katex',checked:true,short:'Katex'},
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
            filter: (input) => input.split(',').map(str=> str.trim()),
            validate:(input) => input.split(',').length <= 1 
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