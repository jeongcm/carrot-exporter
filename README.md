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
######## FOR LOCAL RUN #######
CO_AGGREGATOR_PORT="6001"
CO_AGGREGATOR_URL=http://localhost
CO_AGGREGATOR_ENV=development

CO_MAX_API_BODY_SIZE=50mb
########################################

######## FOR CO-API-DB ########
CO_AGGREGATOR_DB_CONFIG_PORT="3306"
CO_AGGREGATOR_DB_CONFIG_HOST="localhost"
CO_AGGREGATOR_DB_CONFIG_USER="root"
CO_AGGREGATOR_DB_CONFIG_PASSWORD=""
CO_AGGREGATOR_DB_CONFIG_DB_NAME=""
CO_AGGREGATOR_DB_CONFIG_POOL_MIN="1"
CO_AGGREGATOR_DB_CONFIG_POOL_MAX="5"
########################################

######## FOR CUSTOMERACCOUNT, INITIALIZE ########
CO_AGGREGATOR_DEFAULT_PASSWORD=
CO_AGGREGATOR_SYSTEM_NAME=SYSTEM
CO_AGGREGATOR_SYSTEM_CUSTOMERACCOUNT_NAME=CLAION
CO_AGGREGATOR_SYSTEM_CUSTOMERACCOUNT_DESCRIPTION=Internal_Account
CO_AGGREGATOR_SYSTEM_PARTY_NAME=SYSTEM
CO_AGGREGATOR_SYSTEM_PARTY_DESCRIPTION=Internal_Account_User
CO_AGGREGATOR_SYSTEM_PARTYUSER_FIRSTNAME=SYSTEM
CO_AGGREGATOR_SYSTEM_PARTYUSER_LASTNAME=EXECUTOR
CO_AGGREGATOR_SYSTEM_PARTYUSER_USERID=system@claion.io
CO_AGGREGATOR_SYSTEM_PARTYUSER_PASSWORD=
CO_AGGREGATOR_SYSTEM_PARTYUSER_EMAIL=system@claion.io
################################################

######## FOR METRIC ########
CO_AGGREGATOR_VM_SINGLE_ADDRESS=localhost:8428
CO_AGGREGATOR_VM_MULTI_ADDRESS=localhost:8428
CO_AGGREGATOR_VM_IMPORT=/api/v1/import?extra_label=clusterUuid=
CO_VM_OPTION=SINGLE
################################################

######## FOR LOCAL LOGFILE ########
__ENV_ONLY_FOR_DEV_LOG_PATH=./log
################################################

CO_AGGREGATOR_JWT_SECRET_KEY="test123!"
CO_AGGREGATOR_LOG_FORMAT=combined

CO_AGGREGATOR_CORS_ORIGIN=true
CO_AGGREGATOR_CORS_CREDENTIALS=true

CO_TURN_OFF_TELEMETRY=true
CO_AGGREGATOR_LOG_SILENCE_RESPONSE=true
CO_PAGINATION_LIMIT=10
CO_PAGINATION_PAGE=0

```

### Run the app

```shell
npm run dev
```

<br /><br />
