import process from 'process';
import fs from 'fs/promises';
import glob from 'glob-promise';
import toml from 'toml';
import path from "path"

import Model from "./model.js";

const state = {
  models: {},
};

async function loadModels(dir) {
  const modelFiles = await glob('models/*.toml');
  for (let f of modelFiles) {
    try {
      const modelOpts = toml.parse(await fs.readFile(f, 'utf-8'));
      modelOpts.id = path.basename(f, '.toml');
      const model = new Model(modelOpts);
      state.models[modelOpts.id] = model;
    } catch (e) {
      console.trace(e);
    }
  }

  console.log(state.models);
}

async function main() {
  loadModels('./models');
}

main();