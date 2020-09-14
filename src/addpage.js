const chalk = require('chalk')
const fs = require('fs')
const ncp = require('ncp')
const {promisify} = require('util')

const INFO = chalk.bold.blue('INFO');
const ERROR = chalk.bold.red('ERROR')
const DONE = chalk.bold.green("DONE")
const {getTemplateDir, renderFileTo} = require('./main.js')
const read = promisify(fs.readFile)
const write = promisify(fs.writeFile)
const copy = promisify(ncp)
const nodeDir = getTemplateDir('../../templates/node')
const nodeAddDir = getTemplateDir('../../templates/node-additional')
module.exports = async function(args){
    // Check that we are inside a node js project with template
    if(args.pageName === 'index'){
        console.log('%s index is a reserved name, please try calling your page something else',ERROR)
        process.exit(1)
    } 

    if(fs.existsSync('./package.json') && fs.existsSync('./vue.config.js')){
        const pJsonStr = await read('./package.json')
        const pJson = JSON.parse(pJsonStr)
        if('impvisConfig' in pJson){
            if('pages' in pJson.impvisConfig){
                pJson.impvisConfig.pages.push(args.pageName)
                await mkdir(`src/${args.pageName}`)
                await renderFileTo({
                    babel:pJson.impvisConfig.babel,
                    eslint:pJson.impvisConfig.eslint,
                    three:pJson.impvisConfig.three,
                    katex:pJson.impvisConfig.katex,
                    pages:pJson.impvisConfig.pages,
                    isMPA:typeof pJson.impvisConfig.pages !== 'undefined'
                },`${nodeAddDir}/page_template/Page.vue`,`src/${args.pageName}/${args.pageName}.vue`)
                await renderFileTo({
                    babel:pJson.impvisConfig.babel,
                    eslint:pJson.impvisConfig.eslint,
                    three:pJson.impvisConfig.three,
                    katex:pJson.impvisConfig.katex,
                    pages:pJson.impvisConfig.pages,
                    isMPA:typeof pJson.impvisConfig.pages !== 'undefined'
                },`${nodeAddDir}/page_template/main.js`,`src/${args.pageName}/main.js`)
                const vueConfigStr = await read('./vue.config.js')
                const vueConfig = JSON.parse(vueConfigStr)
                vueConfig.pages[args.pageName.toLowerCase().replace(/ /g,"_")] = {
                    entry:`src/${args.pageName}/main.js`,
                    title:args.pageName
                }
                await write('./vue.config.js',JSON.stringify(vueConfig))
                await write('./package.json',JSON.stringify(pJson))
                console.log('%s Page ' + args.pageName + ' added to visualisation',DONE)
                process.exit(0)
            }
        }
    }else{
        console.log("%s Not located inside a multi-page visualisation.",ERROR)
        process.exit(1)
    }
}