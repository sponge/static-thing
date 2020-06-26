class Model {
  constructor(options) {
    this.id = options.id;
    this.fields = options.fields;
    this.name = options.model.name;
    this.label = options.model.label;
  }

  loadContent(content) {

  }
}

export default Model;