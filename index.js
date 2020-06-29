import process from 'process';
import Project from './project.js';

let project;

async function main() {
  project = new Project(process.cwd());
  await project.loadProject();
}

main();