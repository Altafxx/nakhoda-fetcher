import instance from "./axios-instance";
import GTFSRealtimeBindings from 'gtfs-realtime-bindings'
import { Entity } from "@/types/feed-entity.types";

const fetchAPI = async (n: number, url: string) => {
    const axiosInstance = await instance(n);
    return axiosInstance
        .get('https://api.data.gov.my/gtfs-realtime/vehicle-position' + url, {
            responseType: "arraybuffer"
        })
        .then(async (res) => {
            if (res.status !== 200) throw { message: "API Limit" }

            const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(res.data));
            return feed.entity.filter((entity: any): entity is Entity => {
                return entity;
            });
        })
        .catch(() => { throw { message: "Unknown error" } })
}

export default fetchAPI as unknown as (n: number, url: string) => Promise<Entity[]>;
