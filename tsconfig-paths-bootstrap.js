const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

let { paths } = tsConfig.compilerOptions;
for (path in paths) {
  paths[path][0] = `${paths[path][0].replace('src', 'dist').replace('.ts', '.js')}`;
}

console.log(__dirname, paths);

tsConfigPaths.register({ baseUrl: 'dist/src', paths });
