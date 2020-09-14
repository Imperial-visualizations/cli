#!/usr/bin/env node
const fs = require('fs')
const vue_config = require('./vue.config.js')
const archiver = require('archiver')
const pJson = require('./package.json')

if(fs.existsSync('dist/')){
    if(typeof vue_config.pages !== 'undefined'){
        for(let page of Object.keys(vue_config.pages)){
            if(page === 'index') continue; //Skip index page
            let output = fs.createWriteStream(page + '.zip')
            let archive = archiver('zip')
            archive.on('error',function(err){
                throw err;
            });
            archive.pipe(output)
            archive.glob(`dist/**/${page}*.{css,html,js,js.map}`)
            archive.glob('dist/**/chunk-vendors*')
            archive.glob('dist/!(*page*|*index*)')
            archive.finalize()
        }
    }else{
        // No pages, just zip the dist folder
        const output = fs.createWriteStream(pJson.name + '.zip')
        const archive = archiver('zip')
        archive.on('error', function(err){
            throw err;
        });
        archive.pipe(output)
        archive.directory('dist/', false)
        archive.finalize()
    }
}else{
    console.log('ERROR: Dir folder does not exist, did the build complete succesfully?')
}
