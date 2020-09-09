module.exports = {
    {{#if isMPA}}
    pages:{
        index:{
            entry:'src/main.js',
            title:'Index'
        },
        {{#each pages}}
            {{squash this}}:{
                entry:'src/{{this}}/main.js',
                title:'{{this}}',
                
            },
        {{/each}}
    }
    {{/if}}
}