import { checkPackageFile } from '../lib/book-package.mjs';

const inputs = process.argv.slice(2);
const defaults = [
  [new URL('../content/packages/human-nature.package.json', import.meta.url), new URL('../content/packages/human-nature.acceptance.example.json', import.meta.url)],
  [new URL('../content/packages/public-reader-demo.package.json', import.meta.url)]
];
try {
  for (const [path, record] of inputs.length ? [[inputs[0], inputs[1]]] : defaults) {
    const { report } = await checkPackageFile(path, record);
    console.log(JSON.stringify(report, null, 2)); // Status/field paths only, never book text or learner answers.
    if (report.layers.format !== 'passed' || report.acceptanceRecord?.valid === false) process.exitCode = 1;
  }
} catch {
  console.error('无法读取、解析或校验书籍包。未导入、上传或发布任何内容。');
  process.exitCode = 1;
}
