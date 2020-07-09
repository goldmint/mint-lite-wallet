const fs = require('fs').promises;
const path = require('path');

async function manifestMerge() {
    try {
        const env = process.argv[2];
        const baseManifest = await fs.readFile(path.join(__dirname, '/src/manifests/manifest.json'), {encoding: 'utf-8'});
        const addManifest = await fs.readFile(path.join(__dirname, '/src/manifests/manifest.' + env + '.json'), {encoding: 'utf-8'});

        const result = {
            ...JSON.parse(baseManifest || '{}'),
            ...JSON.parse(addManifest || '{}'),
        }

        fs.writeFile(path.join(__dirname, '/src/manifest.json'), JSON.stringify(result));
    } catch (e) {
        console.error(e);
    }
}

manifestMerge();
