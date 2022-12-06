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

export const collectionRunner = async (event) => {
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

export const slackNotifications = async (event) => {
  const webhookUrl = event.Records[0].Sns.MessageAttributes.webhookUrl.Value
  const collectionTitle = event.Records[0].Sns.MessageAttributes.collectionTitle.Value
try {
  const response = await postRequest(webhookUrl, collectionTitle);

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