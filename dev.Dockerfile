# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:14-alpine

# Download and install packages
RUN apk add -U g++ yarn

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui

# Start the development server
CMD ["/bin/sh", "-c", "(node -e 'require(\"node-sass\")' || npm rebuild node-sass) && yarn dev"]
