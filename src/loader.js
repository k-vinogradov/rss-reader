import axios from 'axios';

const proxyUrl = url => `https://cors-anywhere.herokuapp.com/${url}`;

const querySingleNode = (node, selector) => {
  // TODO: querySelectorAll is quite slow. Replace with something

  const nodes = node.querySelectorAll(selector);
  if (nodes.length !== 1) {
    throw Error(`Element ${selector} expected to be single (${nodes.length} found)`);
  }
  return nodes.item(0);
};

const parse = (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  // TODO: Add checking if error description XML received

  const result = {
    title: querySingleNode(doc, 'rss>channel>title').textContent,
    description: querySingleNode(doc, 'rss>channel>description').textContent,
    content: Array.from(doc.querySelectorAll('rss>channel>item').values()).map(item => ({
      title: querySingleNode(item, 'title').textContent,
      link: querySingleNode(item, 'link').textContent,
      description: querySingleNode(item, 'description').textContent,
    })),
  };
  return result;
};

const load = (url) => {
  const wrapped = proxyUrl(url);
  return axios.get(wrapped).then(({ status, statusText, data }) => {
    if (status !== 200) throw Error(`Status ${status} (${statusText}) received`);
    return parse(data);
  });
};

export default load;
