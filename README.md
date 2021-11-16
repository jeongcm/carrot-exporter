# Clone the repo.
git clone https://github.com/NexClipper/nexclipper-node.git;

# Goto the cloned project folder.
cd nexclipper-node;
# Without Docker

# Note: It is preassumed here that you have mariadb running in background & you have created the database.

# Install NPM dependencies.
npm install;

# Edit your DotEnv file using any editor of your choice.
# Please Note: You should add all the configurations details
# or else default values will be used!
vim .env;

# PORT=5000

# Run the app
npm run dev;


# With Docker
===============

# Note: It is preassumed here that you have docker running in background

# Run the app in docker as a foreground process
docker-compose up

# Run the app in docker as a background process
docker-compose up -d