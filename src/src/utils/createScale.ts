import chroma from "chroma-js";
import distinctColors  from "distinct-colors";

// Respond to message from parent thread
self.addEventListener('message', (event) => {

  const {
    scale,
    op,
  } = event.data;

  if(op === "generate") {
    const palette = distinctColors({
      count: 7,
      samples: Math.random()*10e2+500,
      quality: Math.random()*75+25,
    });
    const shapes = palette.map(i => chroma.scale(['black', i.hex(), 'white']).mode('rgb').colors(13).slice(1, -1));
    self.postMessage({ Q: event.data, A: { shapes, palette: palette.map(i => i.hex()) } });
    return;
  }

  const shapes = scale.map(j => j.map(i => chroma(i)[op](2).hex()));

  // Post data to parent thread
  self.postMessage({ Q: event.data, A: shapes });
})
