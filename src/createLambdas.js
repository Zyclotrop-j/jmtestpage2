const fs = require("fs");
const JSZip = require("jszip");

const zip = new JSZip();
zip.file("index.js", "function send() {}\n");

// const img = zip.folder("images");
 // imgData = 'R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7';
// img.file("star.gif", imgData, {base64: true});

// JSZip can generate Buffers so you can do the following
zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
   .pipe(fs.createWriteStream('sendemail.zip'))
   .on('finish', function () {
       // JSZip generates a readable stream with a "end" event,
       // but is piped here in a writable stream which emits a "finish" event.
       console.log("sendemail.zip written.");
    });
