const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
admin.initializeApp(functions.config().firebase)
const storage = admin.storage()

// Paste your Last.fm key here
const LASTFM_KEY = 'YOUR_LASTFM_KEY'
const LASTFM_USERNAMES = ['YOUR_LASTFM_USERNAME']

const writeJsonToStorage = async (name, data) => {
  const file = storage.bucket().file(`lastfm/${name}.json`)  
  try {
    await file.save(JSON.stringify(data))
  } catch (err) {
    throw new Error(err)
  }
}

const getLastPlayed = async (user) => {
  const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${LASTFM_KEY}&format=json&limit=1`)
  const data = await response.json()
  return data
}

const writeAllUsers = async () => {
  for (let x = 0; x < LASTFM_USERNAMES.length; x++) {
    const user = LASTFM_USERNAMES[x]
    const played = await getLastPlayed(user)
    writeJsonToStorage(user, played)
  }
}

// For testing, uncomment this to make an http callable function instead of a scheduled one.
// Highly recommend not deploying this though, because if someone somehow found the URL,
// and called it too much, you could rack up charges beyond Firebase's free limits ;)
/* 
exports.getLastPlayed = functions.https.onRequest(async (request, response) => {
  await writeAllUsers()
  response.send('done')
})
*/

// Scheduled to run every 5 minutes
exports.fetchLastPlayed = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  await writeAllUsers()
})