# Presnetation Merger

**🚧 WORK IN PROGRESS 🚧**

Merge multiple presenation documents together into a single document.

## 🎲 Installation

### System dependencies

- [Node.js](https://nodejs.org/en/download/package-manager/#windows) - JavaScript runtime environment.
- [libExpat](https://libexpat.github.io/) - Expat is a stream-oriented parser in which an application registers handlers for things the parser might find in the XML document

#### Installation via Homebrew (macOS)

```bash
brew install node expat
```

## Project dependencies

Once you've aquired the system dependencies, you can now install the project depnendencies.

```bash
npm install
```

## 🎯 Useage

### <img src="https://raw.githubusercontent.com/odb/official-bash-logo/master/assets/Logos/Icons/PNG/32x32.png" width="16" height="16" alt=""/> CLI useage

Presenation merger will merge the given files and `STDOUT` the merged presentation.  
Providing the option `--file merged.odp` will write the merged presentations to `merged.odp`.

```bash
presentation-merger my-pres1.odp my-pres2.odp
```

### <img src="https://github.com/voodootikigod/logo.js/raw/master/js.png" width="16" height="16" alt=""/> JavaScript module (ES6 / ES2015)

```javascript
const mergeFiles = require('./src/index.js')
async function main() {
  let files = ['./my-pres1.odp', './my-pres2.odp'];
  let stream = fs.createWriteStream('./merged.odp', { flags: 'w' });
  await mergeFiles(files, stream);
}
```
_note: requires babel or pre-compiling_


## 🤖 Testing

Unit testing is handled by the Jest framework.

```bash
npm test
```

## 👤 Contributing

We love contributions! View our [contribution guidelines](./.github/CONTRIBUTING.md).

This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the Contributor Covenant [code of conduct](./.github/CODE_OF_CONDUCT.md).

## 🎓 License

Unless stated otherwise, the codebase is released under the MIT License. This covers both the codebase and any sample code in the documentation. The documentation is © Crown copyright and available under the terms of the Open Government 3.0 licence.