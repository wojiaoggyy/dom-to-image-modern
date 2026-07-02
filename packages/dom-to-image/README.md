# dom-to-image-modern

## dom-to-image现代化改造，API保持一致未做任何修改

### 完善typescript类型定义，ts项目可直接使用

```typescript
export interface DomToImage {
  toBlob: (node: Node) => Promise<Blob>;
}

export interface Options {
  filter?: (node: Node) => boolean;
  bgcolor?: string;
  width?: number;
  height?: number;
  style?: Record<string, string>;
  quality?: number;
  imagePlaceholder?: string;
  cacheBust?: boolean;
}

export interface Util {
  escape: (string: string) => string;
  parseExtension: (url: string) => string;
  mimeType: (url: string) => string;
  dataAsUrl: (content: string, type: string) => string;
  isDataUrl: (url: string) => boolean;
  canvasToBlob: (canvas: HTMLCanvasElement) => Promise<Blob>;
  resolveUrl: (url: string, baseUrl: string) => string;
  getAndEncode: (url: string) => Promise<string>;
  uid: () => string;
  delay: (ms: number) => <T>(arg: T) => Promise<T>;
  asArray: <T>(arrayLike: ArrayLike<T>) => T[];
  escapeXhtml: (string: string) => string;
  makeImage: (uri: string) => Promise<HTMLImageElement>;
  width: (node: HTMLElement) => number;
  height: (node: HTMLElement) => number;
}

export interface InlinerImpl {
  readUrls: (string: string) => string[];
  inline: (
    string: string,
    url: string,
    baseUrl?: string,
    get?: (url: string) => Promise<string>,
  ) => Promise<string>;
}

export interface Inliner {
  inlineAll: (
    string: string,
    baseUrl?: string,
    get?: (url: string) => Promise<string>,
  ) => Promise<string>;
  shouldProcess: (string: string) => boolean;
  impl: InlinerImpl;
}

export interface FontFacesImpl {
  readAll: () => Promise<WebFont[]>;
}

export interface WebFont {
  resolve: () => Promise<string>;
  src: () => string;
}

export interface FontFaces {
  resolveAll: () => Promise<string>;
  impl: FontFacesImpl;
}

export interface ImageImpl {
  inline: (get?: (url: string) => Promise<string>) => Promise<void>;
}

export interface ImageHandler {
  newImage: (element: HTMLImageElement) => ImageImpl;
}

export interface Images {
  inlineAll: (node: Node) => Promise<Node>;
  impl: ImageHandler;
}

export interface Impl {
  fontFaces: FontFaces;
  images: Images;
  util: Util;
  inliner: Inliner;
  options: {
    imagePlaceholder?: string;
    cacheBust?: boolean;
  };
}

export interface DomToImage {
  toSvg: (node: Node, options?: Options) => Promise<string>;
  toPng: (node: Node, options?: Options) => Promise<string>;
  toJpeg: (node: Node, options?: Options) => Promise<string>;
  toBlob: (node: Node, options?: Options) => Promise<Blob>;
  toPixelData: (node: Node, options?: Options) => Promise<Uint8ClampedArray>;
  impl: Impl;
}
```

### 顺便修复已知bug

- 修复svg元素的xmlns:xlink属性为空的问题
- 添加了对百分号的处理，原始dom中可能出现百分号加数字的组合（%28 %26等），会被转义成特殊符号导致报错

### 用法

```bash
npm install dom-to-image-modern
```

```typescript
import domToImage from "dom-to-image-modern";
domToImage.toBlob(document.body).then((blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "export.png";
  a.click();
  URL.revokeObjectURL(url);
});

import { toBlob } from "dom-to-image-modern";
toBlob(document.body).then((blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "export.png";
  a.click();
  URL.revokeObjectURL(url);
});
```
