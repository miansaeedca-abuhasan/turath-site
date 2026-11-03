// One address for the site: www.turathkhairalquroon.com -> turathkhairalquroon.com (the same path).
// Runs only for the pages listed in _routes.json, not for the data files.
export async function onRequest({request, next}) {
  const u = new URL(request.url);
  if (u.hostname.startsWith('www.')) {
    u.hostname = u.hostname.slice(4);
    return Response.redirect(u.toString(), 301);
  }
  return next();
}
