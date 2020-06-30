import fs from 'fs/promises';
import glob from 'glob-promise';
import toml from '@iarna/toml';
import path from 'path'
import EventEmitter from 'events';
import nunjucks from 'nunjucks';

import Model from './model.js';
import Content from './content.js';

class Project extends EventEmitter {
  constructor(dir) {
    super();

    this.dir = dir;
    this.content = {};
    this.models = {};
    this.modelDir = 'models';
    this.contentDir = 'content';
    this.templatesDir = 'templates';
    this.nunjucksEnv = undefined;
  }

  async loadProject() {
    // parse out the project settings from ./project.toml
    try {
      const project = toml.parse(await fs.readFile(path.join(this.dir, 'project.toml'), 'utf-8'));
      this.modelDir = project.settings.models_dir || this.modelDir;
      this.contentDir = project.settings.content_dir || this.contentDir;
      this.templatesDir = project.settings.templates_dir || this.templatesDir;
    } catch (e) {
      console.trace('Error loading project settings', e);
      return false;
    }

    // setup nunjucks so plugins can reach it for extensions
    this.nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(this.templatesDir));
  
    // load all models from the project models dir
    const modelFiles = await glob(path.join(this.modelDir, '*.toml'));
    for (let f of modelFiles) {
      await this.loadModel(f);
    }
  
    // load all content starting from the root
    await this.loadAllContent('/');
    
    return true;
  }

  async loadModel(f) {
    // model id is always just the filename minus the extension
    const modelId = path.basename(f, '.toml');

    // setup the model
    try {
      const modelOpts = toml.parse(await fs.readFile(f, 'utf-8'));
      modelOpts.id = modelId;
      const model = new Model(modelOpts);
      this.models[modelOpts.id] = model;

      this.emit('modelChange', model);

      return model;
    } catch (e) {
      console.trace(`Failed to load model ${f}:`, e);
      this.models[modelId] = undefined;
      return false;
    }
  }

  // load all content starting at the given path. theoretically you could partially update based
  // on a file listener plugin or something?
  async loadAllContent(startingPath) {
    try {
      // valid pages must have content.toml in the folder to be considered a page
      const contentFiles = await glob(path.join(this.contentDir, startingPath, '**/content.toml'));

      // we want to walk through the tree from the top so we can guarantee that the parent
      // objects are already setup
      const filesByDir = contentFiles.map(f => {
        const parsed = path.parse(f);
        const splitDir = parsed.dir.split(path.sep);
        splitDir.shift();
        return {parsed, splitDir, name: f};
      }).sort((a, b) => a.splitDir.length - b.splitDir.length);

      for (let f of filesByDir) {
        try {
          // join with / since we're in url land now baby
          const id = '/' + f.splitDir.join('/');
          const name = f.splitDir.length ? f.splitDir[f.splitDir.length-1] : 'Home';
          
          const node = new Content({id, name});

          // this will eventually not be toml since it's not the most low-friction way to write
          // posts from command line
          const fields = toml.parse(await fs.readFile(f.name, 'utf-8'));
          // walk up the parents until we find a model in a _model key
          // but ignore _model if the parent model has a children key setup
          // ???

          node.validateFieldsAgainstModel(fields, undefined);

          // take the node and save it to tree in the proper place, and update parent/children
          // ???

          console.log(node);
        } catch (e) {
          console.trace(`Failed to load content ${f.name}:`, e);
        }
      }

      console.log('done!');
    } catch(e) {
      console.trace(`Failed to load all content from path ${path}:`, e);
    }
  }
}

export default Project;