const grpc = require('@grpc/grpc-js');
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

function loadProto(serviceName) {
    const protoPath = path.join("src", "protos", `${serviceName}.proto`);
    
    const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    return grpc.loadPackageDefinition(packageDefinition)[serviceName];
}

module.exports = loadProto;
