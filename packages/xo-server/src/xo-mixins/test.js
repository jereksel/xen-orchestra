const asyncIteratorToStream = require("async-iterator-to-stream");
const http = require("http");
const { parse, format } = require("json-rpc-protocol");

function* values(object) {
  const keys = Object.keys(object);
  for (let i = 0, n = keys.length; i < n; ++i) {
    yield object[keys[i]];
  }
}

const createNdJsonStream = asyncIteratorToStream(function*(collection) {
  for (const value of Array.isArray(collection)
    ? collection
    : values(collection)) {
    yield JSON.stringify(value);
    yield "\n";
  }
});

const api = {
  ["remote.getInfo"]: ({ id }) => ({
    filesystem: "/dev/nvme0n1p3",
    size: 496938336256,
    used: 56438738944,
    available: 415185137664,
    capacity: 0.12,
    mountpoint: "/"
  }),
  "test.all": () => [
    { id: "task1" },
    { id: "task2" },
    { id: "task3" },
    { id: "task4" },
    { id: "task5" }
  ]
};

http
  .createServer((request, response) => {
    request.on("data", async data => {
      const { method, params } = parse(data.toString());
      try {
        const res = await api[method](params);
        if (res === undefined) {
          throw new error("method not found");
        }

        response.writeHead(200, {
          "Content-Type": "application/json"
        });

        if (!Array.isArray(res)) {
          return response.end(format.response(0, res));
        }

        response.write(format.response(0, { $responseType: "ndjson" }));
        createNdJsonStream(res).pipe(response);
      } catch (error) {
        response.writeHead(500);
        response.end(format.error(0, error));
      }
    });
  })
  .listen(80);
