const AUTH_EVENT = "nest-auth-changed";

export const getStoredToken = () => localStorage.getItem("token");

export const setStoredToken = (token) => {
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearStoredToken = () => {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const subscribeToAuthChanges = (callback) => {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};
