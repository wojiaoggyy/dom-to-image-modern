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
  inline: (string: string, url: string, baseUrl?: string, get?: (url: string) => Promise<string>) => Promise<string>;
}

export interface Inliner {
  inlineAll: (string: string, baseUrl?: string, get?: (url: string) => Promise<string>) => Promise<string>;
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