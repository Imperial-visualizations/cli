const execa = require('execa')
module.exports = async function(args){
    await execa('npx',['http-server','-p',args.port]).stdout.pipe(process.stdout)
}