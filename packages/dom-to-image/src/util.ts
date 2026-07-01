import type { Util } from "./types";

const mimes = (): Record<string, string> => {
  const WOFF = "application/font-woff";
  const JPEG = "image/jpeg";

  return {
    woff: WOFF,
    woff2: WOFF,
    ttf: "application/font-truetype",
    eot: "application/vnd.ms-fontobject",
    png: "image/png",
    jpg: JPEG,
    jpeg: JPEG,
    gif: "image/gif",
    tiff: "image/tiff",
    svg: "image/svg+xml",
  };
};

const parseExtension = (url: string): string => {
  const match = /\.([^\.\/]*?)$/g.exec(url);
  return match ? match[1] : "";
};

const mimeType = (url: string): string => {
  const extension = parseExtension(url).toLowerCase();
  return mimes()[extension] || "";
};

const isDataUrl = (url: string): boolean => {
  return url.search(/^(data:)/) !== -1;
};

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    const binaryString = window.atob(canvas.toDataURL().split(",")[1]);
    const length = binaryString.length;
    const binaryArray = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }

    resolve(new Blob([binaryArray], { type: "image/png" }));
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  if (canvas.toBlob) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(toBlob(canvas));
        }
      });
    });
  }
  return toBlob(canvas);
};

const resolveUrl = (url: string, baseUrl: string): string => {
  const doc = document.implementation.createHTMLDocument();
  const base = doc.createElement("base");
  doc.head.appendChild(base);
  const a = doc.createElement("a");
  doc.body.appendChild(a);
  base.href = baseUrl;
  a.href = url;
  return a.href;
};

const uid = (): (() => string) => {
  let index = 0;

  return () => {
    const fourRandomChars = (): string => {
      return (
        "0000" + ((Math.random() * Math.pow(36, 4)) << 0).toString(36)
      ).slice(-4);
    };
    return `u${fourRandomChars()}${index++}`;
  };
};

const makeImage = (uri: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = uri;
  });
};

let domtoimageImpl: {
  options: { imagePlaceholder?: string; cacheBust?: boolean };
};

export const setDomtoimageImpl = (impl: typeof domtoimageImpl): void => {
  domtoimageImpl = impl;
};

const getAndEncode = (url: string): Promise<string> => {
  const TIMEOUT = 30000;
  if (domtoimageImpl.options.cacheBust) {
    url += (/\?/.test(url) ? "&" : "?") + new Date().getTime();
  }

  return new Promise((resolve) => {
    const request = new XMLHttpRequest();

    request.onreadystatechange = done;
    request.ontimeout = timeout;
    request.responseType = "blob";
    request.timeout = TIMEOUT;
    request.open("GET", url, true);
    request.send();

    let placeholder: string | undefined;
    if (domtoimageImpl.options.imagePlaceholder) {
      const split = domtoimageImpl.options.imagePlaceholder.split(/,/);
      if (split && split[1]) {
        placeholder = split[1];
      }
    }

    function done() {
      if (request.readyState !== 4) return;

      if (request.status !== 200) {
        if (placeholder) {
          resolve(placeholder);
        } else {
          fail(`cannot fetch resource: ${url}, status: ${request.status}`);
        }
        return;
      }

      const encoder = new FileReader();
      encoder.onloadend = () => {
        const content = encoder.result!.toString().split(/,/)[1];
        resolve(content);
      };
      encoder.readAsDataURL(request.response);
    }

    function timeout() {
      if (placeholder) {
        resolve(placeholder);
      } else {
        fail(`timeout of ${TIMEOUT}ms occured while fetching resource: ${url}`);
      }
    }

    function fail(message: string) {
      console.error(message);
      resolve("");
    }
  });
};

const dataAsUrl = (content: string, type: string): string => {
  return `data:${type};base64,${content}`;
};

const escape = (string: string): string => {
  return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
};

const delay = (ms: number): (<T>(arg: T) => Promise<T>) => {
  return <T>(arg: T) => {
    return new Promise((resolve: (value: T | PromiseLike<T>) => void) => {
      setTimeout(() => {
        resolve(arg);
      }, ms);
    });
  };
};

const asArray = <T>(arrayLike: ArrayLike<T>): T[] => {
  const array: T[] = [];
  const length = arrayLike.length;
  for (let i = 0; i < length; i++) {
    array.push(arrayLike[i]);
  }
  return array;
};

const escapeXhtml = (string: string): string => {
  return string.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\n/g, "%0A");
};

const px = (node: HTMLElement, styleProperty: string): number => {
  const value = window.getComputedStyle(node).getPropertyValue(styleProperty);
  return parseFloat(value.replace("px", ""));
};

const width = (node: HTMLElement): number => {
  const leftBorder = px(node, "border-left-width");
  const rightBorder = px(node, "border-right-width");
  return node.scrollWidth + leftBorder + rightBorder;
};

const height = (node: HTMLElement): number => {
  const topBorder = px(node, "border-top-width");
  const bottomBorder = px(node, "border-bottom-width");
  return node.scrollHeight + topBorder + bottomBorder;
};

export const createUtil = (): Util => ({
  escape,
  parseExtension,
  mimeType,
  dataAsUrl,
  isDataUrl,
  canvasToBlob,
  resolveUrl,
  getAndEncode,
  uid: uid(),
  delay,
  asArray,
  escapeXhtml,
  makeImage,
  width,
  height,
});
