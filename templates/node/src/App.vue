<template>
    <div>
        <iv-title-bar> </iv-title-bar>
        <iv-visalisation>
            <div class="iv-welcome-message">
                <img src='./assets/ImpVis-logo.png' alt="ImpVisLogo" height="50"/>
                <h1> Welcome to Imperial Visualisations!</h1>
                <p> Your project, {{projectName}} has succesfully been set up using a script tag import!</p>
                <p> There is a vue instance up and running!</p>
            </div>
        </iv-visalisation>
    </div>
</template>
<script>
import {name} from '../package.json';
export default {
    name:"App",
    data(){
        return {
            projectName: name
        }
    }
}
</script>
<style>
.iv-welcome-message{
    display:flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
}
</style>