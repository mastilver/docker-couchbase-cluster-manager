const axios = require('axios');
const getNextState = require('./getNextState');

let hostname = process.env.CLUSTER_HOSTNAME;
const username = process.env.USERNAME || 'Administrator';
const password = process.env.PASSWORD || 'password';
const namespace = process.env.NAMESPACE;

if (namespace != null) {
    hostname = `${hostname}.${namespace}.svc.cluster.local`;
}

let electedNode = null;
let nodesInCluster = [];

refreshNodes();
setInterval(refreshNodes, 10 * 1000);

function refreshNodes() {
    getNextState(hostname, {
        electedNode,
        nodesInCluster
    })
    .then(result => {
        nodesInCluster = result.nextNodesInCluster;
        electedNode = result.electedNode;

        result.nodesToRemove.forEach(node => removeNodeFromCluster(electedNode, node));
        return Promise.all(result.nodesToAdd.map(node => addNodeToCluster(electedNode, node)));
    })
    .catch(err => {
        console.error(err);
    });
}

function addNodeToCluster(electedNode, node) {
    console.log(`adding node: ${node} to ${electedNode}`);
    return axios.post(`http://${electedNode}:8091/node/controller/doJoinCluster`, {
        clusterMemberHostIp: node,
        clusterMemberPort: 8091,
        user: username,
        password
    }, {
        auth: {
            username,
            password
        }
    })
    .catch(err => {
        console.error(`Node: ${node} could not join: ${electedNode} due to ${err}`);
    });
}

function removeNodeFromCluster(electedNode, node) {
    console.log(`removing node: ${node} from ${electedNode}`);
}
