(() => {
  const canonicalHost = "krispitshugin.com";
  const alternateHost = "www.krispitshugin.com";
  const githubPagesHost = "kris1807.github.io";
  const githubPagesBasePath = "/Personal-Website";
  const { hostname, pathname, search, hash, protocol } = window.location;

  const isLocal =
    protocol === "file:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  if (isLocal) return;

  const trimGithubPagesBase = (value) => {
    if (value === githubPagesBasePath || value === `${githubPagesBasePath}/`) return "/";
    if (value.startsWith(`${githubPagesBasePath}/`)) return value.slice(githubPagesBasePath.length);
    return value || "/";
  };

  const normalizePath = (value) => {
    const path = (value || "/").replace(/\/index\.html$/i, "/");
    return path === "//" ? "/" : path;
  };

  const ensureCanonicalLink = (href) => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  };

  const normalizedPath = normalizePath(
    hostname === githubPagesHost ? trimGithubPagesBase(pathname) : pathname || "/"
  );
  const canonicalUrl = `https://${canonicalHost}${normalizedPath}${search}${hash}`;

  if (
    hostname === githubPagesHost ||
    hostname === alternateHost ||
    (hostname === canonicalHost && pathname !== normalizedPath)
  ) {
    window.location.replace(canonicalUrl);
    return;
  }

  if (hostname === canonicalHost) {
    ensureCanonicalLink(canonicalUrl);
  }
})();
