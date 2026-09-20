export function safeBtoa(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (err) {
      console.warn("safeBtoa fallback error:", err);
      return btoa(str.replace(/[^\x00-\xFF]/g, "?"));
    }
  }
}

export function safeAtob(b64: string): string {
  try {
    return decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (e) {
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch (err) {
      console.warn("safeAtob fallback error:", err);
      return atob(b64);
    }
  }
}
