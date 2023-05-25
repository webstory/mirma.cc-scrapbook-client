# Furry site favorite browser

This is a simple site that allows you to browse your scraped images from the local filesystem and remote s3 bucket.

## Installation

```bash
yarn install
yarn dev
```

## Setup

Edit your `.env` file to include the following:

```
# This is the [Furry site favorite explorer server](https://github.com/webstory/mirma.cc-scrapbook-server) server running locally.
PUBLIC_API_SERVER="http://localhost:3000"

# Set true if you are running the server locally.
# If you deploy the server to a public cloud like Google Cloud run, set this to false.
PUBLIC_IS_LOCAL="true"
```

For the cloud deployment, you should inject those variables into the environment.

You must setup the api server first before running this project.

## Running

```bash
yarn dev
```

Browse to [http://localhost:5173/favorites](http://localhost:5173/favorites) and voila!

## Notes

- This is a work in progress
- Ignore about sverdle, it's just a template from svelte-kit
- No thumbnails yet, so it's a bit slow to load

## LICENSE

MIT
