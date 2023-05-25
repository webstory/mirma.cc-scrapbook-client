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
PUBLIC_API_SERVER="http://localhost:3000"
```

This is the [Furry site favorite explorer server](https://github.com/webstory/mirma.cc-scrapbook-server) server running locally.

You must setup the api server first before running this project.

## Running

```bash
yarn dev
```

Browse to [http://localhost:5173/favorites](http://localhost:5173/favorites) and voila!

## Notes

- This is a work in progress
- Ignore about sverdle, it's just a template from svelte-kit

## LICENSE

MIT
