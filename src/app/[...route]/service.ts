import instance from "@/lib/axios-instance";
import fetchAPI from "@/lib/data-gov-my-fetcher"
import { db } from "@/lib/db-client";
import { Entity } from "@/types/feed-entity.types";
import { TripUpdate } from "@prisma/client";
// import { writeFile } from "fs/promises";
import { Context } from "hono";
import axios from 'axios';

const PROXY_INDICES = {
    RAPID_BUS_KL: 0,
    RAPID_BUS_KUANTAN: 1,
    RAPID_BUS_PENANG: 2,
    MYBAS_JOHOR: 3,
    KTMB: 4,
    RAPID_BUS_MRTFEEDER: 5
} as const;

const DISCORD_LOGS_BOT = process.env.DISCORD_LOGS_BOT;
const DISCORD_ERROR_BOT = process.env.DISCORD_ERROR_BOT;

const sendDiscordNotification = async (webhook: string, content: string) => {
    try {
        await axios.post(webhook, { content });
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
    }
};

const proxy = async (c: Context) => {
    try {
        const data = await Promise.all(
            Array.from({ length: 6 }).map(async (_, i) => {
                try {
                    const axiosInstance = await instance(i);
                    const res = await axiosInstance.get('https://ifconfig.me/ip');
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

const createBatchWithUpdates = async (tripUpdates: (TripUpdate | null)[], vehicleTypeName: string) => {
    const successfulUpdates = tripUpdates.filter((update): update is NonNullable<typeof update> => update !== null);

    const batch = await db.batch.create({
        data: {
            vehicleType: { connect: { name: vehicleTypeName } },
            TripUpdate: { connect: successfulUpdates.map(update => ({ id: update.id })) }
        }
    });

    return {
        batch,
        processed: tripUpdates.length,
        successful: successfulUpdates.length,
        data: successfulUpdates
    };
};

const processVehicleData = async (
    data: Entity,
    vehicleTypeName: string,
    i: number,
    getVehicleLabel: (d: Entity) => string
) => {
    try {
        const trip = await db.trip.create({
            data: {
                refID: data.vehicle.trip.tripId,
                startDate: data.vehicle.trip.startDate,
                routeID: data.vehicle.trip.routeId,
                directionID: data.vehicle.trip.directionId
            }
        });

        const position = await db.position.create({
            data: {
                latitude: data.vehicle.position.latitude,
                longitude: data.vehicle.position.longitude,
                bearing: data.vehicle.position.bearing,
                speed: data.vehicle.position.speed
            }
        });

        const vehicle = await db.vehicle.upsert({
            where: { label: getVehicleLabel(data) },
            create: {
                label: getVehicleLabel(data),
                vehicleType: {
                    connectOrCreate: {
                        where: { name: vehicleTypeName },
                        create: { name: vehicleTypeName }
                    }
                }
            },
            update: {}
        });

        return await db.tripUpdate.create({
            data: {
                timestamp: data.vehicle.timestamp.toString(),
                tripID: trip.id,
                positionID: position.id,
                vehicleID: vehicle.id
            }
        });
    } catch (err) {
        return null;
    }
};

const handleVehicleService = async (
    c: Context,
    apiIndex: number,
    endpoint: string,
    vehicleTypeName: string,
    getVehicleLabel: (d: Entity) => string
) => {
    try {
        const data: Entity[] = await fetchAPI(apiIndex, endpoint);
        const tripUpdates = await Promise.all(
            data.map((d, i) => processVehicleData(d, vehicleTypeName, i, getVehicleLabel))
        );

        const result = await createBatchWithUpdates(tripUpdates, vehicleTypeName);

        await sendDiscordNotification(
            DISCORD_LOGS_BOT!,
            `✅ ${vehicleTypeName}: Successfully processed ${result.successful}/${result.processed} updates (Batch ID: ${result.batch.id})`
        );

        return c.json({
            status: 'success',
            batchID: result.batch.id,
            ...result
        });
    } catch (error) {
        await sendDiscordNotification(
            DISCORD_ERROR_BOT!,
            `❌ ${vehicleTypeName}: Failed to process data\nError: ${error instanceof Error ? error.message : 'Unknown error'}`
        );

        return c.json({
            status: 'error',
            message: `Failed to process ${vehicleTypeName} data`,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};

const rapidBusKL = (c: Context) =>
    handleVehicleService(c, PROXY_INDICES.RAPID_BUS_KL, "/prasarana?category=rapid-bus-kl", "Rapid Bus KL",
        d => d.vehicle.vehicle.licensePlate ?? d.vehicle.vehicle.id);

const rapidBusKuantan = (c: Context) =>
    handleVehicleService(c, PROXY_INDICES.RAPID_BUS_KUANTAN, "/prasarana?category=rapid-bus-kuantan", "Rapid Bus Kuantan",
        d => d.vehicle.vehicle.licensePlate ?? d.vehicle.vehicle.id);

const rapidBusPenang = (c: Context) =>
    handleVehicleService(c, PROXY_INDICES.RAPID_BUS_PENANG, "/prasarana?category=rapid-bus-penang", "Rapid Bus Penang",
        d => d.vehicle.vehicle.licensePlate ?? d.vehicle.vehicle.id);

const myBasJohor = (c: Context) =>
    handleVehicleService(c, PROXY_INDICES.MYBAS_JOHOR, "/mybas-johor", "MyBas Johor",
        d => d.vehicle.vehicle.id);

const ktmb = (c: Context) =>
    handleVehicleService(c, PROXY_INDICES.KTMB, "/ktmb", "KTM Berhad",
        d => d.vehicle.vehicle.label ?? d.vehicle.vehicle.id);

const rapidBusMRTFeeder = (c: Context) =>
    handleVehicleService(c, PROXY_INDICES.RAPID_BUS_MRTFEEDER, "/prasarana?category=rapid-bus-mrtfeeder", "Rapid Bus MRT Feeder",
        d => d.vehicle.vehicle.licensePlate ?? d.vehicle.vehicle.id);

const rapidRailKL = async (c: Context) => {
    try {
        const data = await fetchAPI(0, "/prasarana?category=rapid-rail-kl");
        return c.json({ data });
    } catch (error) {
        throw c.json({ error });
    }
};

export {
    proxy,
    rapidBusKL,
    rapidBusKuantan,
    rapidBusPenang,
    myBasJohor,
    ktmb,
    rapidBusMRTFeeder,
    rapidRailKL
};
