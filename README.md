# nexclipper-node

Nexclipper back-end

<br/>

# How to install the dev environment

### Clone the repo.

```bash
git clone https://github.com/NexClipper/nexclipper-node.git
```

### Goto the cloned project folder.

```shell
cd nexclipper-node
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
# NC_LARI_PORT=5000
```

### Run the app

```shell
npm run dev
```

<br /><br />

## With Docker

- Note: It is preassumed here that you have docker running in background

### Run the app in docker as a foreground process

```shell
docker-compose up
```

### Run the app in docker as a background process

```shell
docker-compose up -d
```
