import instance from "@/lib/axios-instance";
import fetchAPI from "@/lib/data-gov-my-fetcher"
import { db } from "@/lib/db-client";
import { Entity } from "@/types/feed-entity.types";
import { TripUpdate } from "@prisma/client";
import { writeFile } from "fs/promises";
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
    console.log(`Processing vehicle ${data.vehicle.vehicle.id} at index ${i}`);

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
        console.error(`Error processing vehicle ${data.vehicle.vehicle.id}:`, err);
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

        const filename = new Date().toLocaleString().replace(/\/|,|:| /g, '-') + '.json';
        await writeFile(`logs/${vehicleTypeName.toLowerCase().replace(/\s+/g, '-')}/${filename}`, JSON.stringify(data, null, 2));

        const tripUpdates = await Promise.all(
            data.map((d, i) => processVehicleData(d, vehicleTypeName, i, getVehicleLabel))
        );

        const result = await createBatchWithUpdates(tripUpdates, vehicleTypeName);

        return c.json({
            status: 'success',
            batchID: result.batch.id,
            ...result
        });
    } catch (error) {
        console.error(`${vehicleTypeName} API Error:`, error);
        return c.json({
            status: 'error',
            message: `Failed to process ${vehicleTypeName} data`,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};

const rapidBusKL = (c: Context) =>
    handleVehicleService(c, 0, "/prasarana?category=rapid-bus-kl", "Rapid Bus KL",
        d => d.vehicle.vehicle.licensePlate ?? d.vehicle.vehicle.id);

const rapidBusKuantan = (c: Context) =>
    handleVehicleService(c, 1, "/prasarana?category=rapid-bus-kuantan", "Rapid Bus Kuantan",
        d => d.vehicle.vehicle.licensePlate ?? d.vehicle.vehicle.id);

const rapidBusPenang = (c: Context) =>
    handleVehicleService(c, 2, "/prasarana?category=rapid-bus-penang", "Rapid Bus Penang",
        d => d.vehicle.vehicle.licensePlate ?? d.vehicle.vehicle.id);

const myBasJohor = (c: Context) =>
    handleVehicleService(c, 3, "/mybas-johor", "MyBas Johor",
        d => d.vehicle.vehicle.id);

const ktmb = (c: Context) =>
    handleVehicleService(c, 4, "/ktmb", "KTM Berhad",
        d => d.vehicle.vehicle.label ?? d.vehicle.vehicle.id);

const rapidBusMRTFeeder = (c: Context) =>
    handleVehicleService(c, 5, "/prasarana?category=rapid-bus-mrtfeeder", "Rapid Bus MRT Feeder",
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
