const inquirer = require('inquirer');
const fs = require('fs');
const configTemplate = require('../templates/config-template');

const options = [
  {
    name: 'fileExtension',
    message: 'Choose file extension for the generated mock file:',
    type: 'list',
    default: '.js',
    choices: ['.js', '.ts'],
  },
  {
    name: 'schemaPath',
    message: 'Please provide a relative path to your schema file:',
    type: 'input',
    validate: (schemaPath) => {
      if (schemaPath === "")  {
        console.log("\n ❗️ Path is required.")

        return false
      }

      return true;
    }
  }
]

const init = () => {
  console.log('\nWelcome. 👋 \n\nPlease answer a couple a question to initialize your configuration. \n');

  inquirer.prompt(options).then((answers) => {
    const { fileExtension, schemaPath } = answers;

    try {
      fs.writeFileSync(`${process.cwd()}/mock-generator.config.js`, configTemplate(fileExtension, schemaPath))
    } catch (e) {
      console.log('⛔️ Error creating config file.')
    }
  })
}

module.exports = init;
