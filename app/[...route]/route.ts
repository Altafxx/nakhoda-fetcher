import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import GTFSRealtimeBindings from 'gtfs-realtime-bindings'
import axios from 'axios';

// TODO: Enable Edge Runtime for vercel
// export const config = {
//   runtime: 'edge'
// }

const app = new Hono().basePath('/api')

const HOST = process.env.PROXY_HOST
const PORT = process.env.PROXY_PORT
const USERNAME = process.env.PROXY_USERNAME
const PASSWORD = process.env.PROXY_PASSWORD

if (!HOST || !PORT || !USERNAME || !PASSWORD) {
  throw new Error('Proxy credentials not found')
}

const instance = axios.create({
  proxy: {
    host: HOST,
    port: parseInt(PORT),
    protocol: 'http',
    auth: {
      username: USERNAME,
      password: PASSWORD,
    }
  },
});

const fetchAPI = async (url: string) => {
  return await instance
    .get('https://api.data.gov.my/gtfs-realtime/vehicle-position' + url, {
      responseType: "arraybuffer"
    })
    .then(async (res) => {
      if (res.status !== 200) return { message: "API Limit" }

      const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(res.data));
      return feed.entity.filter((entity: any) => entity);
    })
    .catch(() => ({ message: "Unknown error" }))
}


app.get('/proxy', async (c) => {
  try {
    const data = await instance
      .get('https://ifconfig.me/ip')
      .then((res) => {
        return res.data;
      })
      .catch(() => ({ message: "Unknown error" }))

    return c.json({ ip: data })

  } catch (error) {
    console.error('Fetch Error:', error)
    return c.text('Error', 500)
  }
})


app.get('/rapid-bus-kl', async (c) => {
  try {
    const data = await fetchAPI("/prasarana?category=rapid-bus-kl")

    return c.json({ data })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/rapid-bus-kuantan', async (c) => {
  try {
    const data = await fetchAPI("/prasarana?category=rapid-bus-kuantan")

    return c.json({ data })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/rapid-bus-penang', async (c) => {
  try {
    const data = await fetchAPI("/prasarana?category=rapid-bus-penang")

    return c.json({ data })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/mybas-johor', async (c) => {
  try {
    const data = await fetchAPI("/mybas-johor")

    return c.json({ data })
  }
  catch (error) {
    return c.json({ error })

  }
})

app.get('/ktmb', async (c) => {
  try {
    const data = await fetchAPI("/ktmb")

    return c.json({ data })
  }
  catch (error) {
    return c.json({ error })

  }
})


app.get('/rapid-bus-mrtfeeder', async (c) => {
  try {
    const data = await fetchAPI("/prasarana?category=rapid-bus-mrtfeeder")

    return c.json({ data })
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

