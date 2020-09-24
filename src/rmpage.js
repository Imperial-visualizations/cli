const chalk = require('chalk')
const fs = require('fs')

const { promisify } = require('util');
const { getTemplateDir, renderFileTo } = require('./main');
const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const rf = require('rimraf');
const rimraf = promisify(rf)
const INFO = chalk.bold.blue('INFO');
const ERROR = chalk.bold.red('ERROR')
const DONE = chalk.bold.green("DONE")

module.exports = async function(args){
    if(args.pageName == 'index'){
        console.log('%s index is a reserved name', ERROR)
        process.exit(1)
    }
    const nodeDir = await getTemplateDir('../../templates/node')
    if(fs.existsSync('./package.json') && fs.existsSync('./vue.config.js')){
        const pJsonStr = await read('./package.json')
        const pJson = JSON.parse(pJsonStr)
        if('impvisConfig' in pJson){
            if(pJson.impvisConfig.pages.includes(args.pageName)){
                pJson.impvisConfig.pages.splice(pJson.impvisConfig.pages.indexOf(args.pageName),1)
                await rimraf(`./src/${args.pageName}`)
                await renderFileTo({
                    pages:pJson.impvisConfig.pages,
                    isMPA:typeof pJson.impvisConfig.pages !== 'undefined'
                },`${nodeDir}/vue.config.js`,'vue.config.js')
                await write('./package.json',JSON.stringify(pJson))
                console.log('%s Page "' + args.pageName + '" removed from visualisation',DONE)
                process.exit(0)
            }


        }
    }
    console.log("%s Error deleting page.",ERROR)
    process.exit(1)
}