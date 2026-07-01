import type { Options, DomToImage, Impl } from "./types";
import { createUtil, setDomtoimageImpl } from "./util";
import { createInliner } from "./inliner";
import { createFontFaces } from "./fontFaces";
import { createImages } from "./images";

const util = createUtil();
const inliner = createInliner(util);
const fontFaces = createFontFaces(util, inliner);
const images = createImages(util, inliner);

const defaultOptions = {
  imagePlaceholder: undefined as string | undefined,
  cacheBust: false,
};

const impl: Impl = {
  fontFaces,
  images,
  util,
  inliner,
  options: {},
};

setDomtoimageImpl(impl);

const copyOptions = (options: Options): void => {
  if (typeof options.imagePlaceholder === "undefined") {
    impl.options.imagePlaceholder = defaultOptions.imagePlaceholder;
  } else {
    impl.options.imagePlaceholder = options.imagePlaceholder;
  }

  if (typeof options.cacheBust === "undefined") {
    impl.options.cacheBust = defaultOptions.cacheBust;
  } else {
    impl.options.cacheBust = options.cacheBust;
  }
};

const cloneNode = (
  node: Node,
  filter?: Options["filter"],
  root = true,
): Promise<Node | undefined> => {
  if (!root && filter && !filter(node)) return Promise.resolve(undefined);

  return Promise.resolve(node)
    .then(makeNodeCopy)
    .then((clone) => cloneChildren(node, clone, filter))
    .then((clone) => processClone(node, clone));

  function makeNodeCopy(node: Node): Promise<Node | HTMLImageElement> {
    if (node instanceof HTMLCanvasElement) {
      return util.makeImage(node.toDataURL());
    }
    return Promise.resolve(node.cloneNode(false));
  }

  function cloneChildren(
    original: Node,
    clone: Node,
    filter?: Options["filter"],
  ): Promise<Node> {
    const children = original.childNodes;
    if (children.length === 0) return Promise.resolve(clone);

    return cloneChildrenInOrder(clone, util.asArray(children), filter).then(
      () => clone,
    );

    function cloneChildrenInOrder(
      parent: Node,
      children: Node[],
      filter?: Options["filter"],
    ): Promise<void> {
      let done = Promise.resolve();
      children.forEach((child) => {
        done = done
          .then(() => cloneNode(child, filter, false))
          .then((childClone) => {
            if (childClone) parent.appendChild(childClone);
          });
      });
      return done;
    }
  }

  function processClone(original: Node, clone: Node): Promise<Node> {
    if (!(clone instanceof Element)) return Promise.resolve(clone);

    const originalElement = original as Element;
    const cloneElement = clone as HTMLElement;

    return Promise.resolve()
      .then(cloneStyle)
      .then(clonePseudoElements)
      .then(copyUserInput)
      .then(fixSvg)
      .then(() => clone);

    function cloneStyle(): void {
      copyStyle(window.getComputedStyle(originalElement), cloneElement.style);

      function copyStyle(
        source: CSSStyleDeclaration,
        target: CSSStyleDeclaration,
      ): void {
        if (source.cssText) {
          target.cssText = source.cssText;
        } else {
          copyProperties(source, target);
        }

        function copyProperties(
          source: CSSStyleDeclaration,
          target: CSSStyleDeclaration,
        ): void {
          util.asArray(source).forEach((name) => {
            target.setProperty(
              name,
              source.getPropertyValue(name),
              source.getPropertyPriority(name),
            );
          });
        }
      }
    }

    function clonePseudoElements(): void {
      [":before", ":after"].forEach((element) => {
        clonePseudoElement(element);
      });

      function clonePseudoElement(element: string): void {
        const style = window.getComputedStyle(originalElement, element);
        const content = style.getPropertyValue("content");

        if (content === "" || content === "none") return;

        const className = util.uid();
        cloneElement.className = `${cloneElement.className} ${className}`;
        const styleElement = document.createElement("style");
        styleElement.appendChild(
          formatPseudoElementStyle(className, element, style),
        );
        cloneElement.appendChild(styleElement);

        function formatPseudoElementStyle(
          className: string,
          element: string,
          style: CSSStyleDeclaration,
        ): Text {
          const selector = `.${className}:${element}`;
          const cssText = style.cssText
            ? formatCssText(style)
            : formatCssProperties(style);
          return document.createTextNode(`${selector}{${cssText}}`);

          function formatCssText(style: CSSStyleDeclaration): string {
            const content = style.getPropertyValue("content");
            return `${style.cssText} content: ${content};`;
          }

          function formatCssProperties(style: CSSStyleDeclaration): string {
            return util.asArray(style).map(formatProperty).join("; ") + ";";

            function formatProperty(name: string): string {
              return `${name}: ${style.getPropertyValue(name)}${
                style.getPropertyPriority(name) ? " !important" : ""
              }`;
            }
          }
        }
      }
    }

    function copyUserInput(): void {
      if (originalElement instanceof HTMLTextAreaElement) {
        (clone as HTMLTextAreaElement).innerHTML = originalElement.value;
      }
      if (originalElement instanceof HTMLInputElement) {
        (clone as HTMLInputElement).setAttribute(
          "value",
          originalElement.value,
        );
      }
    }

    function fixSvg(): void {
      if (!(clone instanceof SVGElement)) return;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

      if (!(clone instanceof SVGRectElement)) return;
      ["width", "height"].forEach((attribute) => {
        const value = clone.getAttribute(attribute);
        if (!value) return;

        clone.style.setProperty(attribute, value);
      });
    }
  }
};

const embedFonts = (node: Node): Promise<Node> => {
  return fontFaces.resolveAll().then((cssText) => {
    const styleNode = document.createElement("style");
    node.appendChild(styleNode);
    styleNode.appendChild(document.createTextNode(cssText));
    return node;
  });
};

const inlineImages = (node: Node): Promise<Node> => {
  return images.inlineAll(node).then(() => node);
};

const makeSvgDataUri = (
  node: Node,
  width: number,
  height: number,
): Promise<string> => {
  return Promise.resolve(node)
    .then((node) => {
      if (node instanceof Element) {
        node.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      }
      return new XMLSerializer().serializeToString(node);
    })
    .then(util.escapeXhtml)
    .then(
      (xhtml) =>
        `<foreignObject x="0" y="0" width="100%" height="100%">${xhtml}</foreignObject>`,
    )
    .then(
      (foreignObject) =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${foreignObject}</svg>`,
    )
    .then((svg) => `data:image/svg+xml;charset=utf-8,${svg}`);
};

const toSvg = (node: Node, options: Options = {}): Promise<string> => {
  copyOptions(options);
  return Promise.resolve(node)
    .then((node) => cloneNode(node, options.filter, true))
    .then((clone) => {
      if (!clone) throw new Error("Node was filtered out");
      return clone;
    })
    .then(embedFonts)
    .then(inlineImages)
    .then((clone) => applyOptions(clone))
    .then((clone) =>
      makeSvgDataUri(
        clone,
        options.width || util.width(node as HTMLElement),
        options.height || util.height(node as HTMLElement),
      ),
    );

  function applyOptions(clone: Node): Node {
    if (!(clone instanceof HTMLElement)) return clone;

    if (options.bgcolor) clone.style.backgroundColor = options.bgcolor;

    if (options.width) clone.style.width = `${options.width}px`;
    if (options.height) clone.style.height = `${options.height}px`;

    if (options.style) {
      Object.keys(options.style).forEach((property) => {
        (clone.style as unknown as Record<string, string>)[property] =
          options.style![property];
      });
    }

    return clone;
  }
};

const draw = (
  domNode: Node,
  options: Options = {},
): Promise<HTMLCanvasElement> => {
  return toSvg(domNode, options)
    .then(util.makeImage)
    .then(util.delay(100))
    .then((image) => {
      const canvas = newCanvas(domNode);
      canvas.getContext("2d")!.drawImage(image, 0, 0);
      return canvas;
    });

  function newCanvas(domNode: Node): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = options.width || util.width(domNode as HTMLElement);
    canvas.height = options.height || util.height(domNode as HTMLElement);

    if (options.bgcolor) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = options.bgcolor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return canvas;
  }
};

const toPixelData = async (
  node: Node,
  options: Options = {},
): Promise<Uint8ClampedArray> => {
  const canvas = await draw(node, options);
  return canvas
    .getContext("2d")!
    .getImageData(
      0,
      0,
      util.width(node as HTMLElement),
      util.height(node as HTMLElement),
    ).data;
};

const toPng = async (node: Node, options: Options = {}): Promise<string> => {
  const canvas = await draw(node, options);
  return canvas.toDataURL();
};

const toJpeg = async (node: Node, options: Options = {}): Promise<string> => {
  const canvas = await draw(node, options);
  return canvas.toDataURL("image/jpeg", options.quality || 1.0);
};

const toBlob = async (node: Node, options: Options = {}): Promise<Blob> => {
  const canvas = await draw(node, options);
  return util.canvasToBlob(canvas);
};

const domtoimage: DomToImage = {
  toSvg,
  toPng,
  toJpeg,
  toBlob,
  toPixelData,
  impl,
};

export default domtoimage;

export { toSvg, toPng, toJpeg, toBlob, toPixelData, impl };
