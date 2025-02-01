import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import GTFSRealtimeBindings from 'gtfs-realtime-bindings'

// TODO: Enable Edge Runtime for vercel
// export const config = {
//   runtime: 'edge'
// }

const app = new Hono().basePath('/api')

app.get('/rapid-bus-kl', async (c) => {
  try {
    const URL =
      'https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-kl';

    const response = await fetch(URL)

    if (!response.ok) return c.json({ message: "API Limit" })
    const buffer = await response.arrayBuffer();

    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const tripUpdates = feed.entity.filter((entity: any) => entity);

    return c.json({ tripUpdates })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/rapid-bus-kuantan', async (c) => {
  try {
    const URL =
      'https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-kuantan';

    const response = await fetch(URL)

    if (!response.ok) return c.json({ message: "API Limit" })
    const buffer = await response.arrayBuffer();

    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const tripUpdates = feed.entity.filter((entity: any) => entity);

    return c.json({ tripUpdates })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/rapid-bus-penang', async (c) => {
  try {
    const URL =
      'https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-penang';

    const response = await fetch(URL)

    if (!response.ok) return c.json({ message: "API Limit" })
    const buffer = await response.arrayBuffer();

    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const tripUpdates = feed.entity.filter((entity: any) => entity);

    return c.json({ tripUpdates })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/mybas-johor', async (c) => {
  try {
    const URL =
      'https://api.data.gov.my/gtfs-realtime/vehicle-position/mybas-johor';

    const response = await fetch(URL)

    if (!response.ok) return c.json({ message: "API Limit" })
    const buffer = await response.arrayBuffer();

    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const tripUpdates = feed.entity.filter((entity: any) => entity);

    return c.json({ tripUpdates })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/ktmb', async (c) => {
  try {
    const URL =
      'https://api.data.gov.my/gtfs-realtime/vehicle-position/ktmb';

    const response = await fetch(URL)

    if (!response.ok) return c.json({ message: "API Limit" })
    const buffer = await response.arrayBuffer();

    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const tripUpdates = feed.entity.filter((entity: any) => entity);

    return c.json({ tripUpdates })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/rapid-rail-kl', async (c) => {
  try {
    const URL =
      'https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category=rapid-rail-kl';

    const response = await fetch(URL)

    if (!response.ok) return c.json({ message: "API Limit" })
    const buffer = await response.arrayBuffer();

    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const tripUpdates = feed.entity.filter((entity: any) => entity);

    return c.json({ tripUpdates })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/rapid-bus-mrtfeeder', async (c) => {
  try {
    const URL =
      'https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-mrtfeeder';

    const response = await fetch(URL)


    if (!response.ok) return c.json({ message: "API Limit" })
    const buffer = await response.arrayBuffer();

    const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const tripUpdates = feed.entity.filter((entity: any) => entity);

    return c.json({ tripUpdates })
  }
  catch (error) {
    return c.json({ error })

  }
})

/*
Rapid Rail KL API Not Available Yet
Preparing for future update
*/
// app.get('/lrt', async (c) => {
//   try {
//     const URL =
//       'https://api.data.gov.my/gtfs-static/prasarana?category=rapid-rail-kl';

//     const response = await fetch(URL)

//     if (!response.ok) return c.json({ message: "API Limit" })
//     const buffer = await response.arrayBuffer();

//     const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
//     const tripUpdates = feed.entity.filter((entity: any) => entity);

//     return c.json({ tripUpdates })
//   }
//   catch (error) {
//     return c.json({ error })

//   }
// })

export const GET = handle(app)

