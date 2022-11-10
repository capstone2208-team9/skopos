const http = require("http");

const postRequest = (body: any) => {
  const params = {
    hostname: "localhost", // needs to be public IP of collection-runner
    path: `/${body.collectionId}`,
    port: 3003,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };

  return new Promise((resolve, reject) => {
    const req = http.request(params, (res: any) => {
      let buffer = "";
      res.on("data", (chunk: any) => { buffer += chunk });
      res.on("end", () => {
        try {
          resolve(buffer);
        } catch (err: any) {
          reject(new Error(err));
        }
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
  } catch (err: any) {
    console.log("catch block", err);
    return {
      status: 400,
      body: `${err.message}`,
    };
  }
};



