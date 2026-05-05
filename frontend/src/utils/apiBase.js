export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  return configuredUrl || "/api";
};

export const getApiOrigin = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/api\/?$/, "");
  }

  return window.location.origin;
};

export const toAbsoluteAssetUrl = (assetPath) => {
  if (!assetPath) return undefined;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  return `${getApiOrigin()}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
};
