import axios from 'axios';

const buildProxyUrl = url => `https://cors-anywhere.herokuapp.com/${url}`;

const parse = (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  try {
    const channel = doc.querySelector('rss>channel');
    return {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
      content: Array.from(channel.querySelectorAll('item').values()).map(item => ({
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        description: item.querySelector('description').textContent,
      })),
    };
  } catch {
    return null;
  }
};

const load = (url) => {
  const proxyUrl = buildProxyUrl(url);
  return axios.get(proxyUrl).then(({ data }) => {
    const feedObject = parse(data);
    if (feedObject === null) throw Error('Invalid RSS data');
    return feedObject;
  });
};

export default load;
