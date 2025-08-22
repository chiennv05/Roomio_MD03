export const checkToken = (token: string | null): boolean => {
  if (!token) {return false;}
  return token !== '';
};
