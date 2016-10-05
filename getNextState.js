let dns = require('dns');

const pify = require('pify');

dns = pify(dns);

module.exports = function (hostname, { electedNode = null, nodesInCluster = [] } = {}) {
    console.log('fetching nodes');

    return dns.resolve(hostname)
    .then(addresses => {
        let nodesToAdd = addresses.filter(address => {
            return !nodesInCluster.includes(address);
        });

        const nodesToRemove = nodesInCluster.filter(address => {
            return !addresses.includes(address);
        });

        const nextNodesInCluster = nodesInCluster
                            .concat(nodesToAdd)
                            .filter(address => !nodesToRemove.includes(address));

        const doesClusterHaveEnoughNodes = nextNodesInCluster.length > 1;
        if (!doesClusterHaveEnoughNodes) {
            throw new Error(`Found ${nextNodesInCluster.length} nodes on the cluster, expecting at least 2`);
        }

        if (electedNode != null) {
            const isElectedNodeInCluster = nodesInCluster.includes(address => address === electedNode);
            if (!isElectedNodeInCluster) {
                electedNode = null;
            }
        }

        if (electedNode == null) {
            electedNode = nextNodesInCluster[0];
            nodesToAdd = nodesToAdd.filter(address => address !== electedNode);
        }

        return {
            nextNodesInCluster,
            nodesInCluster,
            electedNode,
            nodesToAdd,
            nodesToRemove
        };
    });
};
