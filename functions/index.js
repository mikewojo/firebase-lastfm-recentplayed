const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
admin.initializeApp(functions.config().firebase)
const storage = admin.storage()

// Paste your Last.fm key here
const LASTFM_KEY = 'YOUR_LASTFM_KEY'

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

// For testing, uncomment this to fetch and write from an http callable function
// exports.getLastPlayed = functions.https.onRequest(async (request, response) => {
//   const user = 'YOUR_LASTFM_USERNAME'
//   const played = await getLastPlayed(user)
//   writeJsonToStorage(user, played)
//   response.send(played)
// })

exports.fetchLastPlayed = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const user = 'YOUR_LASTFM_USERNAME'
  const played = await getLastPlayed(user)
  writeJsonToStorage(user, played)
})