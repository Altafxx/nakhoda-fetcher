import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { ktmb, myBasJohor, proxy, rapidBusKL, rapidBusKuantan, rapidBusMRTFeeder, rapidBusPenang, rapidRailKL, refreshProxy, seperator } from './service';

const app = new Hono().basePath('/api')

app.get('/refresh-proxies', async (c) => refreshProxy(c));

app.get('/proxy', async (c) => proxy(c))

app.get('/rapid-bus-kl', async (c) => rapidBusKL(c))

app.get('/rapid-bus-kuantan', async (c) => rapidBusKuantan(c))

app.get('/rapid-bus-penang', async (c) => rapidBusPenang(c))

app.get('/mybas-johor', async (c) => myBasJohor(c))

app.get('/ktmb', async (c) => ktmb(c))

app.get('/rapid-bus-mrtfeeder', async (c) => rapidBusMRTFeeder(c))

/*
Rapid Rail KL API Not Available Yet
Preparing for future update
*/
// app.get('/rapid-rail-kl', async (c) => rapidRailKL(c))

app.get('/separator', async (c) => seperator(c));

export const GET = handle(app)

