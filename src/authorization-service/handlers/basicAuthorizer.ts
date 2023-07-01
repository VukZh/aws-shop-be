export const handler = async (event: { headers: { authorizationToken: any } }) => {
  const { authorizationToken } = event.headers;

  console.log("---===---", event, authorizationToken);

  if (!authorizationToken) {
    console.log("---401---");
    return {
      statusCode: 401,
      body: "Authorization header is not provided",
    };
  }

  const decodedToken = Buffer.from(authorizationToken, "base64").toString(
    "utf-8"
  );

  const validCredentials = process.env.VukZh;

  if (decodedToken !== validCredentials) {
    console.log("---403---");
    return {
      statusCode: 403,
      body: "Access denied",
    };
  }


  console.log("---200---");

  return {
    statusCode: 200,
    body: "Success",
  };
};