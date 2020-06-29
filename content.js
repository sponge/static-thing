class Content {
  constructor(options) {
    if (!options.path) {
      throw new Error("Missing required option path");
    }
    
    this.path = options.path;
  }

  async load(contentStr) {
    
  }
}

export default Content;