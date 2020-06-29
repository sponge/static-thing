import fs from 'fs/promises';
import glob from 'glob-promise';
import toml from '@iarna/toml';
import path from "path"
import EventEmitter from "events";
import nunjucks from "nunjucks";

import Model from "./model.js";

class Project extends EventEmitter {
  constructor(dir) {
    super();

    this.dir = path.join(dir, 'project.toml');
    this.models = {};
    this.modelDir = '';
    this.contentDir = '';
    this.templatesDir = '';
    this.nunjucksEnv = undefined;
  }

  async loadProject() {
    try {
      const project = toml.parse(await fs.readFile(this.dir, 'utf-8'));
      this.modelDir = project.settings.models_dir || 'models';
      this.contentDir = project.settings.content_dir || 'content';
      this.templatesDir = project.settings.templates_dir || 'templates';
    } catch (e) {
      console.trace("Error loading project settings", e);
      return false;
    }

    this.nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(this.templatesDir));
  
    this.models = {};

    const modelFiles = await glob(path.join(this.modelDir, '*.toml'));
    for (let f of modelFiles) {
      await this.loadModel(f);
    }
  
    console.log(this.models);
    return true;
  }

  async loadModel(f) {
    const modelId = path.basename(f, '.toml');

    try {
      const modelOpts = toml.parse(await fs.readFile(f, 'utf-8'));
      modelOpts.id = modelId;
      const model = new Model(modelOpts);
      this.models[modelOpts.id] = model;

      this.emit("modelChange", model);

      return model;
    } catch (e) {
      console.trace(`Failed to load model ${f}:`, e);

      this.models[modelId] = undefined;
      return false;
    }
  }
}

export default Project;