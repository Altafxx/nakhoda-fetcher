import instance from "@/lib/axios-instance";
import fetchAPI from "@/lib/data-gov-my-fetcher"
import { db } from "@/lib/db-client";
import { Entity, FeedEntity } from "@/types/feed-entity.types";
import { Context } from "hono"

const proxy = async (c: Context) => {
    try {
        const data = await Promise.all(
            Array.from({ length: 6 }).map(async (_, i) => {
                try {
                    const res = await instance(i).get('https://ifconfig.me/ip');
                    return { id: i, ip: res.data };
                } catch (error) {
                    return { id: i, message: "Unknown error" };
                }
            })
        );

        return c.json(data);

    } catch (error) {
        throw c.text('Error', 500);
    }
}

const rapidBusKL = async (c: Context) => {
    try {
        const data: Entity[] = await fetchAPI(1, "/prasarana?category=rapid-bus-kl")

        // const uniqueHeheReduce = hehe.reduce<string[]>((accumulator, currentValue) => {
        //     if (!accumulator.includes(currentValue)) {
        //         accumulator.push(currentValue);
        //     }
        //     return accumulator;
        // }, []);


        // await db.tripUpdate.create({
        //     data: {
        //         timestamp: (1739110173).toString(),
        //         trip: {
        //             create: {
        //                 refID: "weekend_U1730_U173001_6",
        //                 startTime: "21:52:33",
        //                 startDate: "20250209",
        //                 routeID: "U1730"
        //             }
        //         },
        //         position: {
        //             create: {
        //                 latitude: 3.17381691932678,
        //                 longitude: 101.699676513672,
        //                 bearing: 260,
        //                 speed: 24.0799999237061
        //             }
        //         },
        //         vehicle: {
        //             connectOrCreate: {
        //                 where: {
        //                     refID: "WVE7649"
        //                 },
        //                 create: {
        //                     refID: "WVE7649",
        //                     VehicleDetail: {
        //                         connectOrCreate: {
        //                             where: {
        //                                 id: "WVE7649"
        //                             },
        //                             create: {
        //                                 licensePlate: "WVE7649",
        //                                 vehicleType: {
        //                                     connectOrCreate: {
        //                                         where: {
        //                                             name: "Bus Rapid KL"
        //                                         },
        //                                         create: {
        //                                             name: "Bus Rapid KL"
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // })

        return c.json({ data })
    }
    catch (error) {
        throw c.json({ error })

    }
}

const rapidBusKuantan = async (c: Context) => {
    try {
        const data = await fetchAPI(1, "/prasarana?category=rapid-bus-kuantan")

        return c.json({ data })
    }
    catch (error) {
        throw c.json({ error })

    }
}

const rapidBusPenang = async (c: Context) => {
    try {
        const data = await fetchAPI(2, "/prasarana?category=rapid-bus-penang")

        return c.json({ data })
    }
    catch (error) {
        throw c.json({ error })

    }
}

const myBasJohor = async (c: Context) => {
    try {
        const data = await fetchAPI(3, "/mybas-johor")

        return c.json({ data })
    }
    catch (error) {
        throw c.json({ error })

    }
}

const ktmb = async (c: Context) => {
    try {
        const data = await fetchAPI(4, "/ktmb")

        return c.json({ data })
    }
    catch (error) {
        throw c.json({ error })

    }
}

const rapidBusMRTFeeder = async (c: Context) => {
    try {
        const data = await fetchAPI(5, "/prasarana?category=rapid-bus-mrtfeeder")

        return c.json({ data })
    }
    catch (error) {
        throw c.json({ error })

    }
}

const rapidRailKL = async (c: Context) => {
    try {
        const data = await fetchAPI(0, "/prasarana?category=rapid-rail-kl")

        return c.json({ data })
    }
    catch (error) {
        throw c.json({ error })

    }
}

export { proxy, rapidBusKL, rapidBusKuantan, rapidBusPenang, myBasJohor, ktmb, rapidBusMRTFeeder, rapidRailKL }