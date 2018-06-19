const config = require('../config');
const url = require('url');

const GITHUB_API_ROOT = 'https://api.github.com';
const GITHUB_API_ROOT_REGEX = /https\:\/\/api\.github\.com/g;

const getlocalAppRootUrl = request => {
  return process.env.NODE_ENV == 'production'
    ? url.format({
        protocol: 'https', // request.protocol returns http for now since the node server itself is only using http. However the api is used over https thanks to azure / IIS
        host: request.hostname,
        // port: request.port,
        pathname: ''
      })
    : 'https://localhost:3000'; // hard coded value in development because the request came through the webpack dev server on a different port and via https.
};

const getProxyRequestOptions = url => ({
  url: GITHUB_API_ROOT + url.replace('/api', ''),
  headers: {
    Authorization: `token ${config.github.botToken}`
    //,"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
    ,"accept-encoding": "identity",
  }
});

const rewriteResponseHeaders = (request, response) => {
  if (response.headers.link) {
    response.headers.link = response.headers.link.replace(GITHUB_API_ROOT_REGEX, getlocalAppRootUrl(request) + '/api');
    console.log(`Request App: Rewritten response.headers.link: ${JSON.stringify(response.headers.link)}`);
  } else {
    console.log(`Request App: response.headers.link falsy, nothing to rewrite`);
  }
};

const genericErrorHandler = (error, response, body) => {
  if (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out');
    } else {
      console.error(error);
      throw error;
    }
  }
};

module.exports = {
  getProxyRequestOptions,
  genericErrorHandler,
  rewriteResponseHeaders
};