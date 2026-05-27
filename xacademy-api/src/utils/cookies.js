export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  signed:   process.env.NODE_ENV === 'production',
  secure:   process.env.NODE_ENV === 'production',
};

export const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('access_token',  accessToken,  { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
};