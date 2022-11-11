import {ClientRequest, IncomingMessage} from 'http'

const http = require("http");

const postRequest = (body: any) => {
  const hostname = process.env.COLLECTION_RUNNER_URI || ''
  const params = {
    hostname, // needs to be public IP of collection-runner
    path: `/${body.collectionId}`,
    port: 80,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };

  return new Promise((resolve, reject) => {
    const req: ClientRequest = http.request(params, (res: IncomingMessage) => {
      let buffer = "";
      res.on("data", (chunk: any) => { buffer += chunk });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          body: buffer || 'none'
        });
      });
    });

    req.on("error", (err:any) => {
      reject(err.message);
    });

    req.write(JSON.stringify(body.contactInfo));
    req.end();
  });
};

export const collectionRunner = async (event: any) => {
  try {
    const response: any = await postRequest(event);

    return {
      status: response.status,
      body: response.body,
    };
  } catch (err) {
    console.log("catch block", err);
    return {
      status: 400,
      body: `${err.message}`,
    };
  }
};



