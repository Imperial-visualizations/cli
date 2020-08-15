import inquirer from 'inquirer';
import yargs from 'yargs';
import chalk from 'chalk';
import pjson from '../package.json';
import {createProject} from './main.js';

export async function cli(argv){
    console.clear();
    console.log(chalk.bold('Imperial Visualisations CLI') + chalk.yellow(' v' +pjson.version))
    let options = await configurationPrompt(argv);
    createProject(options);
}


const templateChoices =[
    {name:'Standard project using Node.js backend (recommended)',value:'node',short:'Node project'},
    {name:'Standard project using <script> include',value:'script',short:'<script> include project'},
    {name:'Legacy project',value:'legacy',short:'Legacy Project'}
]
const additionalModules = [
    {name:'ESLint + Vue Plugin (Linting)',value:'eslint',short:"ESLint",checked:true},
    {name:'Three.js (3D graphics support)', value:'three',short:'Three'},
    {name:'Katex (equation rendering support)',value:'katex',checked:true,short:'Katex'},
    {name:'D3 (popular library for creating visualisations)',value:'d3',short:'D3'},
    {name:'p5.js (legacy library for 2D graphics',value:'p5',short:'p5.js'}
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
            choices: additionalModules,
            when: (answers) => answers.template !== 'legacy'
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
        legacyTempVersion: options.legacyTempVersion || answers.legacyTempVersion
    }

}