import inquirer from 'inquirer';
import yargs from 'yargs';
import chalk from 'chalk';
import pjson from '../package.json';
export async function cli(args){

    // options = await configurationPrompt(argv);
    // console.log(chalk.bold('Imperial Visualisations CLI') + chalk.yellow(' v' +pjson.version))
    // console.log(argv)
}




const templateChoices =[
    {name:'Standard project using Node.js backend (recommended)',value:'node',short:'Node project'},
    {name:'Standard project using <script> include',value:'script',short:'<script> include project'},
    {name:'Legacy project',value:'legacy',short:'Legacy Project'}
]
const additionalModules = [
    {name:'Three.js (3D graphics support)', value:'three',short:'Three'},
    {name:'Katex (equation rendering support)',value:'katex',checked:true,short:'Katex'},
    {name:'D3 (popular library for creating visualisations)',value:'d3',short:'D3'},
    {name:'p5.js (legacy library for 2D graphics',value:'p5',short:'p5.js'}
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
            type:'checkbox',
            name:'additionalModules',
            message:'Please select additional modules that you wish to enable for this project:',
            choices: additionalModules
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
        additionalModules: options.additionalModules || answers.additionalModules
    }

}