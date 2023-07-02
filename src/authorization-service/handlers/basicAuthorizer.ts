import dotenv from "dotenv";

export const handler = async (event: any) => {
  dotenv.config({ debug: true });

  if (!event?.headers?.authorization) {
    console.log("---401---");
    return generatePolicy("unknown", event.methodArn, 'Deny')
  }
  const { authorization } = event.headers;

  const creds = authorization.split(" ")[1];

  const decodedToken = Buffer.from(creds, "base64")
    .toString("utf-8")
    .split(":");

  console.log("decodedToken >> ", decodedToken, process.env[decodedToken[0]]);

  if (
    !process.env[decodedToken[0]] ||
    decodedToken[1] !== process.env[decodedToken[0]]
  ) {
    console.log("---403---");
    return generatePolicy(creds, event.methodArn, "Deny")

  } else {
    console.log("---200---");
    return generatePolicy(creds, event.methodArn, "Allow")
  }
};

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: "Allow" | "Deny"
) => {
  const policy = {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  return policy;
};
