const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async function (params) {
  if (params.filename.endsWith('.csv')) {
    const words = params.src
      .split('\n')
      .map(line => line.trim().replace(/^'|',?\s*$|'\s*$/g, '').toLowerCase())
      .filter(word => /^[a-z]+$/.test(word));
    const newParams = { ...params, src: `module.exports = ${JSON.stringify(words)};` };
    return upstreamTransformer.transform(newParams);
  }
  return upstreamTransformer.transform(params);
};
