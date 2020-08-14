import {promisfy} from 'util';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import chalk from 'chalk';

const access = promisfy(fs.access);
const mkdir = promisfy(fs.mkdir)
const copy = promisfy(ncp);

async function copyTemplateFiles(options){
    return copy(options.templateDir,options.targetDir,{
        clobber:false
    })
}

export async function createProject(options){
    const targetDirectory = path.join(process.cwd(),options.projectName);
    console.log("%s Creating project target folder at", chalk.blue.bold('INFO'))
    await mkdir(path.join(process.cwds()))
    options = {
        ...options,
        targetDir: options.targetDirectory 
    }
}