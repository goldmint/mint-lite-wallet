const go = new Go();

// polyfill
if (!WebAssembly.instantiateStreaming) {
  WebAssembly.instantiateStreaming = async (resp, importObject) => {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };
}

WebAssembly.instantiateStreaming(fetch('assets/libs/mint/mint.wasm'), go.importObject)
  .then((result) => {
    go.run(result.instance);
  })
  .catch((err) => {
    console.error(err);
  });
