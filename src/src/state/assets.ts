import { Core as Uppy, AwsS3Multipart, Dropbox, GoogleDrive, Instagram, Url, Dashboard  } from 'uppy';
import '@uppy/core/dist/style.min.css';
import { memoizeWith } from "ramda";

const cimemo = memoizeWith((client, idToken) => `${client}${idToken}`);

export const newUppy = cimemo((client, idToken, options = {
  restUploadCompleted: () => null
}) => {
  if(!client || !idToken) return;
  const _uppy = Uppy({
    id: `${client}${idToken}`,
    meta: {},
    restrictions: { maxNumberOfFiles: 50 },
    autoProceed: false,
    debug: false,
    ...options
  });
  _uppy.use(AwsS3Multipart, {
    limit: 20,
    companionUrl: 'https://uppycompanion.herokuapp.com/',
    serverHeaders: {
      "authorization": `Bearer ${idToken}`,
      _client: client
    }
  });
  _uppy.use(Dropbox, {
    id: "Dropbox",
    companionUrl: 'https://uppycompanion.herokuapp.com',
    serverHeaders: {
      "authorization": `Bearer ${idToken}`,
      _client: client
    }
  });
  _uppy.use(GoogleDrive, {
    id: "GoogleDrive",
    companionUrl: 'https://uppycompanion.herokuapp.com',
    serverHeaders: {
      "authorization": `Bearer ${idToken}`,
      _client: client
    }
  });
  _uppy.use(Instagram, {
    id: "Instagram",
    companionUrl: 'https://uppycompanion.herokuapp.com',
    serverHeaders: {
      "authorization": `Bearer ${idToken}`,
      _client: client
    }
  });
  _uppy.on('upload-success', (file, response) => {
    console.log('upload-success', response, file, file.name, response.uploadURL)
  });
  _uppy.on('complete', (result) => {
    console.log(result);
    result.successful.forEach(({ data, uploadURL, type, size, meta }) => {
      const remotefile = {
        "title": meta.title,
        "description": meta.description,
        "_client": client,
        "fileLastModified": `${data.lastModified}`,
        "fileName": data.name,
        "fileSize": size,
        "fileType": type,
        "fileUrl": uploadURL
      };
      fetch(`https://zcmsapi.herokuapp.com/api/v1/remotefile`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(remotefile)
      }).then(i => !i.ok ? Promise.reject(i) : i.json()).then(upload => {
        options.restUploadCompleted(upload);
      });

    });
  });
  return _uppy;
});
