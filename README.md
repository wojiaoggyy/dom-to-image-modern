# dom-to-image-modern

dom-to-image现代化改造

```bash
npm install dom-to-image-modern

import { toBlob } from "dom-to-image-modern";
toBlob(document.body).then((blob) => {
  console.log(blob);
});

import domToImage from "dom-to-image-modern";
domToImage.toBlob(document.body).then((blob) => {
  console.log(blob);
});
```
