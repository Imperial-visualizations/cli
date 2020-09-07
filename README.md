# Creating Visualisations
The Imperial Visualisation **Command Line Interface (CLI)** streamlines the process of creating a new visualisation by automatically creating and configuring a project directory complete with all the desired packages installed. 
## Installation
To install the CLI you will first need to ensure that you have *Node.js* installed along with the *Node Package Manager (NPM)*. To check that you have both of these programs installed correctly on your computer you will need to open a terminal window and run:
```bash
node -v && npm -v
```
If Node.js and NPM are correctly installed on your system you should see two version numbers printed (the exact number doesn't matter).

With Node and NPM setup on your machine, you are now able to **globally** install the **CLI** by running:
```bash
npm -g install @impvis/cli
```
and wait for the CLI to be downloaded and installed on your machine.
## Usage
Creating Visualisations with the Vue CLI is a breeze! To create a visualisation simply open a new terminal window in the directory which you wish to create the visualisation folder. Then run:
```bash
create-impvis <name>
```
where *<name>* is the name of your visualisation. You will then be guided throught step by step prompts to allow you to configure the base visualisation tempalate to suit your needs. At present the CLI has 4 template options availble for users to choose from: 
* Current template using Node.js 
* Current template using a *<script>* import
* Basic legacy template from Summer 2019
* Advanced legacy template from Summer 2019
### Current Template using Node.js
This template is the **recommended** template for all new projects going forward as it comes with a pre-configured node.js instance which makes running automated tasks, linting your code for errors and optimising your code for all browsers a breeze. It also includes the Imperial Visualisations Vue Components library as standard already setup and ready to go! 
When using this template, you will create visualisations using the Vue Single File Component files *(.vue)*, which allows you to divide your visualisation up into **sub-components** each containing all the HTML,JS and CSS needed for the component to function properly.
For a refresher on how components work it is best for you to check out the *Introduction to Components* video located on the ImpVis Youtube channel.
### Installing additional packages
Using this template it is easy to install additional modules after the fact simply by runnning:
```bash
npm install <my-package-name> 
```
which will automatically download and install the relevant package from the *NPM* repository. You can then use ES6 import statements to access the features of the libary. 

### Curent Template using <script> tag
This template is recommended for people new to, or just getting started with Vue.js as it removes some of the additional complexity associated with a Node.js backend. In this template, you work entirely within a single .html file with Vue and the Imperial Visualisations library included with standard script tags located in the header.
### Installing additional packages 
Installing additional packages for this template is not as convienent as using the Node template however is still relatively simple. The *UNPKG* repository can be used to quickly retrive a valid URL for any library that is located on NPM, and as such additional dependencies can be added to the head section of the HTML file by writing:
```html
	<script defer src="https://unpkg.com/<my-package-name>/@version-number"></script>
```
You may need to read the documenation of the library you are importing to see if there are any additional files such as CSS files that also need to be imported.
## Legacy templates (Basic & Advanced)
These legacy templates are not recommended for most people who want to create visualisations as they do not contain the modern Vue component library created by the ImpVis team to help assist in the creation of visualisations.
These templates are however useful for those who wish to get a simple, no batteries included environment to play around with or for those who need a starting spot to upgrade old visualisations located on previous versions of the ImpVis website. This template does come with the Math.js library preloaded for this reason as it is a popular library with many of the old visualisations. 
### Installing Additional Dependencies
Additional dependencies can be installed using the same manner as described above for <script> templates

