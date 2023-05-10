export const fetchQuery = (url, options) => {
  return fetch(
    `${url}?${new URLSearchParams({
      ...options.query
    })}`,
    options
  );
};
