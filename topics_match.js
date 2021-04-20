const reg1 = /^\+$|^\+(?=\/)|(?<=\/)\+(?=\/)|(?<=\/)\+(?=$)/g;

function filterToRegex(filter) {
  return filter.replace(reg1, "[^/]+");
}

function topicsMatch(filter, topic) {
  const reg = new RegExp("^" + filterToRegex(filter) + "$");
  match = topic.match(reg);
  return match ? match.length == 1 : false;
}

if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) {
  module.exports = topicsMatch;
}
