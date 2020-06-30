import toml from '@iarna/toml';

class Content {
  constructor(options) {
    if (!options.id) {
      throw new Error('Missing required option: path');
    }

    if (!options.name) {
      throw new Error('Missing required option: name');
    }
    
    this.id = options.id;
    this.name = options.name;
    this.children = [];
    this.model = undefined;
    this.parent = undefined;
    this.fields = {};
  }

  validateFieldsAgainstModel(fields, model) {
    // FIXME: i don't care
    this.fields = fields;
    this.model = model;
  }
}

export default Content;