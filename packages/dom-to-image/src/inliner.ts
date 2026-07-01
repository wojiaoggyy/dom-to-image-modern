import type { Inliner, InlinerImpl } from "./types";
import type { Util } from "./types";

export const createInliner = (util: Util): Inliner => {
  const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;

  const shouldProcess = (string: string): boolean => {
    return string.search(URL_REGEX) !== -1;
  };

  const readUrls = (string: string): string[] => {
    const result: string[] = [];
    let match;
    while ((match = URL_REGEX.exec(string)) !== null) {
      result.push(match[1]);
    }
    return result.filter((url) => !util.isDataUrl(url));
  };

  const inline = (
    string: string,
    url: string,
    baseUrl?: string,
    get?: (url: string) => Promise<string>
  ): Promise<string> => {
    return Promise.resolve(url)
      .then((url) => (baseUrl ? util.resolveUrl(url, baseUrl) : url))
      .then(get || util.getAndEncode)
      .then((data) => util.dataAsUrl(data, util.mimeType(url)))
      .then((dataUrl) => string.replace(urlAsRegex(url), `$1${dataUrl}$3`));

    function urlAsRegex(url: string): RegExp {
      return new RegExp(`(url\\(['"]?)(${util.escape(url)})(['"]?\\))`, "g");
    }
  };

  const inlineAll = (
    string: string,
    baseUrl?: string,
    get?: (url: string) => Promise<string>
  ): Promise<string> => {
    if (nothingToInline()) return Promise.resolve(string);

    return Promise.resolve(string)
      .then(readUrls)
      .then((urls) => {
        let done = Promise.resolve(string);
        urls.forEach((url) => {
          done = done.then((string) => inline(string, url, baseUrl, get));
        });
        return done;
      });

    function nothingToInline(): boolean {
      return !shouldProcess(string);
    }
  };

  const impl: InlinerImpl = {
    readUrls,
    inline,
  };

  return {
    inlineAll,
    shouldProcess,
    impl,
  };
};