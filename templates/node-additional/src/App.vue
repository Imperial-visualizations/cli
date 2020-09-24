<template>
    <div id="app">
        <ul>
            <li v-for="(val,pageName) in pages" :key=pageName>
                <a :href="'./' + pageName + '.html'">{{val.title}}</a>
            </li>
        </ul>
    </div>
</template>
<script>
import {pages} from '../vue.config.js';
delete pages.index
export default {
    data(){
        return{
            pages
        }
    }
}
</script>
<style>
body{
    padding:0;
    margin:0;
}
#app{

    background-color:#2772C2;
    color:#ffffff;
    font-weight: 600;
    font-size:25pt;
    text-align:center;
}
#app ul{
    height:100vh;
    margin:0;
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    list-style: none;
    flex-wrap:wrap;
}
#app li {
    margin: 15px 0 ;
}
#app a{
    text-decoration: none;
}
#app a:link,#app a:visited{
    color:white;
}

</style>
