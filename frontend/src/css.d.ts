// ------------------------------------------------------------------
// CSS Modules：TypeScriptでCSSファイルをモジュールとして扱うための定義
// ------------------------------------------------------------------

// CSS Modules (*.module.css) 用の定義
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

// 通常のCSS (*.css) を import 可能にするための定義
declare module "*.css";