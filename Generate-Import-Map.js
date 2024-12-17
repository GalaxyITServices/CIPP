// Using ES Module syntax compatible with Node.js 18 and ensuring cross-platform compatibility
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the relative path as necessary to point to your routes.json location
const routesPath = path.resolve(__dirname, './src/routes.json'); // Ensure correct absolute path
const fileURL = new URL(`file://${routesPath}`); // Convert to file URL

// Try importing JSON with the assertion type for JSON first
let routes;
try {
  routes = await import(fileURL.href, { assert: { type: 'json' } }).then(
    (module) => module.default,
  );
} catch (error) {
  // Fallback to reading the JSON file directly if import fails
  console.error('Error with dynamic import. Falling back to fs.readFile()');
  const data = await fs.readFile(routesPath, 'utf-8');
  routes = JSON.parse(data);  // Parse the JSON data
}

let importsMap = "import React from 'react'\n export const importsMap = {\n";

routes.forEach((route) => {
  if (route.component) {
    // Adjust the import path to be relative to the importsMap.js file location
    const importPath = route.component.replace('views', './views');
    // Ensure paths are Unix-like for the dynamic import to work cross-platform
    const unixImportPath = importPath.split(path.sep).join('/');
    importsMap += `  "${route.path}": React.lazy(() => import('${unixImportPath}')), \n`;
  }
});

importsMap += '}\nexport default importsMap';

// Specify the output file path for the generated imports map
const outputPath = path.join(__dirname, './src/importsMap.jsx');
await fs.writeFile(outputPath, importsMap);
console.log('Import map generated.');
