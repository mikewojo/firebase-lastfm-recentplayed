# firebase-lastfm-recentplayed

Use a scheduled Firebase function to grab your most recently played Last.fm track and write as a JSON file to storage.

Because of Firebase's generous pricing, you can run this pretty much for free!

## Setup

### Get a Last.fm API Key

Create an API account if you don't already have one: https://www.last.fm/api/account/create

Copy your API Key from the [API Applications page](https://www.last.fm/api/accounts) and paste it into [functions/index.js](functions/index.js) where specified.

### Create Firebase Project

1. [Create a Firebase project](https://console.firebase.google.com) if you haven't already.
2. Upgrade your project to Blaze Plan (you cannot use Firebase functions without upgrading to the pay-as-you go plan, but this plan includes all the stuff from the free tier, so running this alone shouldn't cost you anything).
3. Setup Firebase Storage (Click the "Storage" tab on the left nav of the Firebase Console, click "Get Started", and follow the instructions to choose a bucket location/etc.)
4. Update "default" in `.firebaserc` with your new project ID.

### Install Google Cloud SDK / gsutil

You'll need this to update settings like storage permissions and CORS.

#### Official Package

Choose your OS and follow the instructions here: https://cloud.google.com/storage/docs/gsutil_install#sdk-install

#### Homebrew (macOS)

My personal preferred option if you have Homebrew:

`brew install --cask google-cloud-sdk`

Then add to your bash/zsh/fish profile according to the instructions.

### Authenticate Google Cloud SDK

`gcloud init`

Follow the prompts to login to your Google account and set your current project.

### Install and Deploy the Function

Navigate to the functions folder: `cd functions`

Install modules: `npm i`

Deploy the function: `npm run deploy`

Once deployed, it should run every 5 minutes as specified in [functions/index.js](functions/index.js).

It'll take 5 minutes before it runs for the first time, so if you want to run it immediately, go into GCP's Cloud Scheduler and choose "Run Now" on the right side of your job: https://console.cloud.google.com/cloudscheduler/?project=YOUR_PROJECT_ID

### Storage Settings

You'll want the outputted JSON file to be publicly readable.

If this is your only use for this bucket (as is mine), easiest option is to make the whole thing publicly readable. Since Firebase Storage is basically a rebranded Google Cloud Storage bucket, you'll use the Google Cloud SDK to manage its settings.

Make whole bucket public:

`gsutil iam ch allUsers:objectViewer gs://YOUR_PROJECT_ID.appspot.com`

Alternatively you can make just the Last.fm JSON file public (if you have other things in the bucket):

`gsutil acl ch -u AllUsers:R gs://YOUR_PROJECT_ID.appspot.com/lastfm/MY_LASTFM_USER.json`

### CORS Settings

Set the CORS settings for your Last.fm JSON file so you can fetch it from front-end JS.

This will allow any domain to access it, so if you want to restrict it further, just update the `origin` in [functions/cors.json](functions/cors.json).

`gsutil cors set functions/cors.json gs://YOUR_PROJECT_ID.appspot.com`

## Usage

Now that you have your function running, you can use the JSON for anything you want!

For example, I've placed a "Now Playing" module on the left side of [my portfolio site](https://mikewojo.net).

Quick and dirty JS:

```
const getLastPlayed = async function() {
  // add Date.now() at the end to break the cache
  const response = await window.fetch(`https://storage.googleapis.com/YOUR_PROJECT_ID.appspot.com/lastfm/YOUR_LASTFM_USER.json?${Date.now()}`)
  const data = await response.json()
  console.log('LAST PLAYED DATA', data)
}
```