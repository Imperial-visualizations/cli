module.exports = {
    {{#if isMPA}}
    pages:{
        {{#each pages}}
            {{squash this}}:{
                entry:'src/{{this}}/main.js'
            },
        {{/each}}
    }
    {{/if}}
}