const path = require("path");
const fs = require("fs");
const decompress = require("decompress");
const parser = require("xml2json");
const program = require("commander");

async function main(input, outFile) {
  const files = await decompress(path.resolve(input));
  const content = files.find(item => item.path === "content.xml");
  const json = parser.toJson(content.data);
  fs.writeFileSync(outFile, JSON.stringify(JSON.parse(json), null, "  "), {
    encoding: "utf8"
  });
}

program
  .name("odp-to-json")
  .usage(
    `

Examples:

  $ odp-to-json ./my-presentation.odp
  $ odp-to-json --out-dir=./my-presentation ./my-presentation.odp
  `
  )
  .option("-o, --out-dir <fileDir>", "file directory to extract to JSON to")
  .command("* <file>")
  .alias("extract")
  .description("Extract the Open Presentation Document to JSON")
  .action(async function(env) {
    let outBasename = path.basename(env, path.extname(env)) + ".json";
    let outDir = path.join(path.resolve('.'), (program.outDir || env));
    let outFile = path.join(outDir, outBasename);
    if (fs.existsSync(path.resolve(env))) {
      console.log('Extracting "%s" to "%s"', env, path.resolve(outFile));
      await main(env, outFile);
    } else {
      console.error(`
      
Could not extract presenation document, file missing. 

no such file '%s'

`, path.resolve(env))
    }
  });
program.parse(process.argv);
