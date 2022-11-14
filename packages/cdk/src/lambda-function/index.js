const http = require("http");

const postRequest = (body) => {
  const hostname = process.env.COLLECTION_RUNNER_URI || ''
  const params = {
    hostname, // needs to be public IP of collection-runner
    path: `/${body.collectionId}`,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };

  return new Promise((resolve, reject) => {
    const req = http.request(params, (res) => {
      res.on("end", () => {
        resolve({
          status: res.statusCode,
        });
      });
    });

    req.on("error", (err) => {
      reject(err.message);
    });

    req.write(JSON.stringify(body.collectionId));
    req.end();
  });
};

exports.collectionRunner = async (event) => {
  try {
    const response = await postRequest(event);

    return {
      status: response.status,
    };
  } catch (err) {
    console.log("catch block", err);
    return {
      status: 400,
      body: `${err.message}`,
    };
  }
};