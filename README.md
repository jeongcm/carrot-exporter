# claiobserver-aggregator

<br/>

# How to install the dev environment

### Clone the repo.

```bash
https://github.com/ClaionSolution/claiobserver-aggregator.git
```

### Goto the cloned project folder.

```shell
cd claiobserver-aggregator
```

<br /><br />

## Without Docker

- Note: It is preassumed here that you have mariadb running in background & you have created the database.

### Install NPM dependencies.

```shell
npm install
```

### Edit your DotEnv file using any editor of your choice.

- Please Note: You should add all the configurations details
- or else default values will be used!

```shell
vim .env
```

```
# CO_AGGREGATOR_PORT="7001"
```

### Run the app

```shell
npm run dev
```

<br /><br />
