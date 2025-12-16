exports.handler = async (event) => {
  const id_status = process.env.GITHUB_CLIENT_ID ? 'defined' : 'undefined';
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Client ID is: ' + id_status,
      node_version: process.version
    }),
  };
};