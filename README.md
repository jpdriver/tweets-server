# tweets-server
Twitter-like demo with limited functionality https://tweets-server.now.sh/

## Running Locally
- Start by copying the `.env.template` file, making a `.env` in the project root.

- You will need your own `CONSUMER_KEY` and `CONSUMER_SECRET` to put in your new `.env` file
  - you can get these by creating an app at [https://apps.twitter.com/app/new](https://apps.twitter.com/app/new)
  
- Run the server using either
  - `npm run dev` (local development)
  - `npm start` (production)
  
- This changes the callback URLs to the `tweets` client application

## Deploying to Now
- Add your `CONSUMER_KEY` and `CONSUMER_SECRET` as Secrets
  - `now secret add consumer_key XXXXXXXXXXXX`
  - `now secret add consumer_secret XXXXXXXXXXXX`
  
- And then expose these to your deployment as Environment Variables using the -e flag
  - `now -e CONSUMER_KEY=@consumer_key -e CONSUMER_SECRET=@consumer_secret`
