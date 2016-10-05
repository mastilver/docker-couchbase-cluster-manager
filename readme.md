# docker-couchbase-cluster-manager [![Build Status](https://travis-ci.org/mastilver/docker-couchbase-cluster-manager.svg?branch=master)](https://travis-ci.org/mastilver/docker-couchbase-cluster-manager)

> Connect couchbase nodes with each other. Those nodes need to sit behind the same hostname

## Usage

```bash
docker run mastilver/couchbase-cluster-manager --env CLUSTER_HOSTNAME="couchbase.cluster"
```


## Environment variables

### CLUSTER_HOSTNAME

Type: `string`

Hostname the cluster is available to your app. We are using it to get ips of the nodes.

### USERNAME

Type: `string`
Default: `Administrator`

Username used to setup your nodes

### PASSWORD

Type: `string`
Default: `password`

Password used to setup your nodes

## License

MIT © [Thomas Sileghem](http://mastilver.com)
