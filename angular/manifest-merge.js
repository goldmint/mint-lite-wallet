const fs = require('fs').promises;
const path = require('path');

async function manifestMerge() {
    try {
        // clear _where and _args properties from elliptic package.json
        let ellipticPackage = await fs.readFile(path.join(__dirname, '/node_modules/elliptic/package.json'), {encoding: 'utf-8'});
        ellipticPackage = JSON.parse(ellipticPackage || '{}');
        ellipticPackage._where = '';
        ellipticPackage._args = [];
        fs.writeFile(path.join(__dirname, '/node_modules/elliptic/package.json'), JSON.stringify(ellipticPackage));

        // merge manifests
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
