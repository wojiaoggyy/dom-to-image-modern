import type { Images, ImageHandler, ImageImpl, Inliner } from "./types";
import type { Util } from "./types";

export const createImages = (util: Util, inliner: Inliner): Images => {
  const newImage = (element: HTMLImageElement): ImageImpl => {
    const inline = (get?: (url: string) => Promise<string>): Promise<void> => {
      if (util.isDataUrl(element.src)) return Promise.resolve();

      return Promise.resolve(element.src)
        .then(get || util.getAndEncode)
        .then((data) => util.dataAsUrl(data, util.mimeType(element.src)))
        .then(
          (dataUrl) =>
            new Promise<void>((resolve, reject) => {
              element.onload = () => resolve();
              element.onerror = reject;
              element.src = dataUrl;
            }),
        );
    };

    return { inline };
  };

  const inlineAll = (node: Node): Promise<Node> => {
    if (!(node instanceof Element)) return Promise.resolve(node);

    return inlineBackground(node).then(() => {
      if (node instanceof HTMLImageElement) {
        return newImage(node)
          .inline()
          .then(() => node);
      } else {
        return Promise.all(
          util.asArray(node.childNodes).map((child) => inlineAll(child)),
        ).then(() => node);
      }
    });

    function inlineBackground(node: Element): Promise<void> {
      const htmlElement = node as HTMLElement;
      const background = htmlElement.style.getPropertyValue("background");

      if (!background) return Promise.resolve();

      return inliner.inlineAll(background).then((inlined) => {
        htmlElement.style.setProperty(
          "background",
          inlined,
          htmlElement.style.getPropertyPriority("background"),
        );
      });
    }
  };

  const impl: ImageHandler = {
    newImage,
  };

  return {
    inlineAll,
    impl,
  };
};
