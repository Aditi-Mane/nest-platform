export const getToken = () => localStorage.getItem("token");

export const isAuthenticated = () =>{
  return Boolean(getToken());
}