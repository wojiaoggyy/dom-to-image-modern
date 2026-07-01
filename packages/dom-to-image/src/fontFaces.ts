import type { FontFaces, FontFacesImpl, WebFont, Inliner } from "./types";
import type { Util } from "./types";

export const createFontFaces = (util: Util, inliner: Inliner): FontFaces => {
  const resolveAll = (): Promise<string> => {
    return readAll()
      .then((webFonts) =>
        Promise.all(webFonts.map((webFont) => webFont.resolve())),
      )
      .then((cssStrings) => cssStrings.join("\n"));
  };

  const readAll = (): Promise<WebFont[]> => {
    return Promise.resolve(util.asArray(document.styleSheets))
      .then(getCssRules)
      .then(selectWebFontRules)
      .then((rules) => rules.map(newWebFont));

    function selectWebFontRules(cssRules: CSSRule[]): CSSFontFaceRule[] {
      return cssRules
        .filter(
          (rule): rule is CSSFontFaceRule =>
            rule.type === CSSRule.FONT_FACE_RULE,
        )
        .filter((rule) =>
          inliner.shouldProcess(rule.style.getPropertyValue("src")),
        );
    }

    function getCssRules(styleSheets: StyleSheet[]): CSSRule[] {
      const cssRules: CSSRule[] = [];
      styleSheets.forEach((sheet) => {
        try {
          const cssSheet = sheet as CSSStyleSheet;
          util.asArray(cssSheet.cssRules || []).forEach((rule) => {
            cssRules.push(rule);
          });
        } catch (e) {
          console.log(
            `Error while reading CSS rules from ${sheet.href}`,
            (e as Error).toString(),
          );
        }
      });
      return cssRules;
    }

    function newWebFont(webFontRule: CSSFontFaceRule): WebFont {
      return {
        resolve: () => {
          const baseUrl = (webFontRule.parentStyleSheet || {}).href;
          return inliner.inlineAll(webFontRule.cssText, baseUrl || undefined);
        },
        src: () => webFontRule.style.getPropertyValue("src"),
      };
    }
  };

  const impl: FontFacesImpl = {
    readAll,
  };

  return {
    resolveAll,
    impl,
  };
};
