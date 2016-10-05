import test from 'ava';
import rewire from 'rewire';

const getNextState = rewire('./getNextState');

test('When initialize cluster', async t => {
    getNextState.__set__('dns', {
        resolve: () => Promise.resolve([
            '10.0.0.1',
            '10.0.0.2'
        ])
    });

    const {
        electedNode,
        nodesToAdd,
        nodesToRemove,
        nextNodesInCluster
    } = await getNextState('couchbase.cluster');

    t.is(electedNode, '10.0.0.1');

    t.is(nextNodesInCluster.length, 2);

    t.is(nodesToAdd.length, 1);
    t.true(nodesToAdd.includes('10.0.0.2'));

    t.is(nodesToRemove.length, 0);
});

test('When adding new nodes', async t => {
    getNextState.__set__('dns', {
        resolve: () => Promise.resolve([
            '10.0.0.1',
            '10.0.0.2',
            '10.0.0.3'
        ])
    });

    const {
        electedNode,
        nodesToAdd,
        nodesToRemove,
        nextNodesInCluster
    } = await getNextState('couchbase.cluster', {
        electedNode: '10.0.0.1',
        nodesInCluster: [
            '10.0.0.1'
        ]
    });

    t.is(electedNode, '10.0.0.1');

    t.is(nextNodesInCluster.length, 3);

    t.is(nodesToAdd.length, 2);
    t.true(nodesToAdd.includes('10.0.0.2'));
    t.true(nodesToAdd.includes('10.0.0.3'));

    t.is(nodesToRemove.length, 0);
});

test('When removing nodes', async t => {
    getNextState.__set__('dns', {
        resolve: () => Promise.resolve([
            '10.0.0.1',
            '10.0.0.4'
        ])
    });

    const {
        electedNode,
        nodesToAdd,
        nodesToRemove,
        nextNodesInCluster
    } = await getNextState('couchbase.cluster', {
        electedNode: '10.0.0.1',
        nodesInCluster: [
            '10.0.0.1',
            '10.0.0.2',
            '10.0.0.3'
        ]
    });

    t.is(electedNode, '10.0.0.1');

    t.is(nextNodesInCluster.length, 2);

    t.is(nodesToAdd.length, 1);

    t.is(nodesToRemove.length, 2);
    t.true(nodesToRemove.includes('10.0.0.2'));
    t.true(nodesToRemove.includes('10.0.0.3'));
});

test('When removing elected node', async t => {
    getNextState.__set__('dns', {
        resolve: () => Promise.resolve([
            '10.0.0.2',
            '10.0.0.3'
        ])
    });

    const {
        electedNode,
        nodesToAdd,
        nodesToRemove,
        nextNodesInCluster
    } = await getNextState('couchbase.cluster', {
        electedNode: '10.0.0.1',
        nodesInCluster: [
            '10.0.0.1',
            '10.0.0.2',
            '10.0.0.3'
        ]
    });

    t.is(electedNode, '10.0.0.2');

    t.is(nextNodesInCluster.length, 2);

    t.is(nodesToAdd.length, 0);

    t.is(nodesToRemove.length, 1);
    t.true(nodesToRemove.includes('10.0.0.1'));
});

test('When there is only a single node', async t => {
    getNextState.__set__('dns', {
        resolve: () => Promise.resolve([
            '10.0.0.2'
        ])
    });

    t.throws(getNextState('couchbase.cluster', {
        electedNode: '10.0.0.1',
        nodesInCluster: [
            '10.0.0.1'
        ]
    }));
});
