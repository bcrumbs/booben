const path = require('path');
const fs = require('mz/fs');
const bodyParser = require('body-parser');
const { generateProject } = require('booben-codegen');
const config = require('../config');
const helpers = require('./helpers');
const constants = require('../common/constants');
const sharedConstants = require('../shared/constants');

const projectsDir = config.get('projectsDir');
const env = config.get('env');

module.exports = {
  url: `${sharedConstants.URL_API_PREFIX}/codegen`,
  method: 'post',
  handlers: [
    bodyParser.json({ limit: '50mb' }),
    async (req, res) => {
      const project = req.body;
      const outputDir = path.join(projectsDir, project.name, 'bundle');
      try {
        await generateProject(project, outputDir);
      } catch (error) {
        helpers.sendError(res, 500, 'Something wrong with codegen');
      }

      try {
        const codePath = path.join(outputDir, 'project.zip');
        const code = await fs.readFile(codePath);

        res.send(code);
      } catch (error) {
        helpers.sendError(res, 500, 'Code folder is no exit');
      }
    },
  ],
};
