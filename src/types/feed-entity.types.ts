export type FeedEntity = {
    header: FeedHeader
    entity: Entity[]
}

export type Entity = {
    id: string;
    vehicle: EntityVehicle;
}

export type FeedHeader = {
    gtfsRealtimeVersion: string,
    incrementality: Incrementality | null | undefined,
    timestamp: Long | string
}

enum Incrementality {
    FULL_DATASET = "FULL_DATASET",
    DIFFERENTIAL = "DIFFERENTIAL"
}

export type EntityVehicle = {
    trip: Trip;
    position: Position;
    vehicle: VehicleVehicle;
    timestamp: string;
}

export type Long = {
    low: number,
    high: number,
    unsigned: boolean
}

export type Position = {
    latitude: number;
    longitude: number;
    bearing?: number;
    speed?: number;
}

export type Trip = {
    tripId: string;
    startTime?: string;
    startDate?: string;
    routeId?: string;
    directionId?: number;
}

export type VehicleVehicle = {
    id: string;
    licensePlate?: string;
    label?: string;
}
