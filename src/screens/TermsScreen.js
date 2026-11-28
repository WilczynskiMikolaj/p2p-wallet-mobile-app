import { WebView } from "react-native-webview";
import { terms } from "../data/terms";

const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{font:17px/1.6 system-ui;color:#19252d;padding:12px 18px}h2{font-size:1.15em}</style></head><body><h1>Regulamin P2P Wallet</h1>${terms.map(([title, text]) => `<h2>${title}</h2><p>${text}</p>`).join("")}</body></html>`;
export default function TermsScreen() {
  return (
    <WebView
      source={{ html }}
      originWhitelist={["*"]}
      javaScriptEnabled={false}
      domStorageEnabled={false}
      allowFileAccess={false}
      allowUniversalAccessFromFileURLs={false}
      onShouldStartLoadWithRequest={({ url }) => url === "about:blank"}
    />
  );
}
