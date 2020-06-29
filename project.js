import fs from 'fs/promises';
import glob from 'glob-promise';
import toml from '@iarna/toml';
import path from "path"

import Model from "./model.js";

class Project {
  constructor(dir) {
    this.dir = path.join(dir, 'project.toml');
    this.models = {};
    this.modelDir = '';
    this.contentDir = '';
  }

  async loadProject() {
    try {
      const project = toml.parse(await fs.readFile(this.dir, 'utf-8'));
      this.modelDir = project.settings.models_dir || 'models';
      this.contentDir = project.settings.content_dir || 'content';
    } catch (e) {
      console.trace("Error loading project settings", e);
      return false;
    }
  
    this.models = {};

    const modelFiles = await glob(path.join(this.modelDir, '*.toml'));
    for (let f of modelFiles) {
      try {
        const modelOpts = toml.parse(await fs.readFile(f, 'utf-8'));
        modelOpts.id = path.basename(f, '.toml');
        const model = new Model(modelOpts);
        this.models[modelOpts.id] = model;
      } catch (e) {
        console.trace(`Failed to load model ${f}:`, e);
      }
    }
  
    console.log(this.models);
    return true;
  }
}

export default Project;