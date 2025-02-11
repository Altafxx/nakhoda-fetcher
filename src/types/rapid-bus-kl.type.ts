export type RapidBusKLResponse = {
    id?: string;
    vehicle?: Vehicle
    message?: string;
}

export type Vehicle = {
    trip: Trip;
    position: Position;
    timestamp: string;
    vehicle: VehicleVehicle;
}

export type Position = {
    latitude: number;
    longitude: number;
    bearing: number;
    speed: number;
}

export type Trip = {
    tripId: string;
    startTime: string;
    startDate: string;
    routeId: string;
}

export type VehicleVehicle = {
    id: string;
    licensePlate: string;
}
