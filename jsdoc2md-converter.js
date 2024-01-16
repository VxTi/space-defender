/**
 * Library for converting JSDoc to markdown.
 *
 */

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');

// Directory from which to retrieve the files from
const directory = 'web/javascript';
const destination = './docs/project/jsdocs';
const exclude = ['p5.min.js', 'p5.sound.min.js'];

// Whether to include subdirectories or not
const recursive = true;

checkFile = (path, recursive) => {
    console.log("Checking file: " + path);
    if (exclude.includes(path.split('/').pop())) {
        console.log("Excluded file: " + path);
        return;
    }
    if (path.endsWith('.js')) {
        jsdoc2md.render({ files: path }).then(output => {
            fs.writeFile(destination + '/' + path.split('/').pop().split('.js')[0] + '.md', output, {}, (err) => {
                if (err) throw err;
                console.log('Created markdown documentation for file: ' + path);
            });
        });
    } else if (fs.lstatSync(path).isDirectory() && recursive) {
        fs.readdirSync(path).forEach(file => {
            checkFile(path + "/" + file, recursive);
        });
    }
}
checkFile(directory, recursive);