import dotenv from "dotenv";

export const handler = async (event: { headers: { authorizationToken: any } }) => {
  dotenv.config({debug: true});

  const { authorizationToken } = event.headers;

  if (!authorizationToken) {
    console.log("---401---");
    return {
      statusCode: 401,
      body: "Authorization header is not provided",
    };
  }

  const decodedToken = Buffer.from(authorizationToken.split(' ')[1], "base64").toString(
    "utf-8"
  ).split(':');

  // const validCredentials = process.env.VUKZH;

  console.log("decodedToken >> ", decodedToken, process.env[decodedToken[0]])

  if (!process.env[decodedToken[0]] || decodedToken[1] !== process.env[decodedToken[0]]) {
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