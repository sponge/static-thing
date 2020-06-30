class Model {
  constructor(options) {
    // FIXME: actually parse/validate
    // also maybe a second pass after it finishes to replace templated values?
    // eg. label = "{{ this.name }}"
    this.id = options.id;
    this.fields = options.fields;
    this.name = options.model.name;
    this.label = options.model.label;
    this.children = options.children;
  }
}

export default Model;