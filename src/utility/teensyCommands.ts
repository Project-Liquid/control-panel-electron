enum TeensyPin {
    testPin0 = 0,
    testPin1 = 1,
}

export type TeensyCommand = string;

export function pinDigitalWrite(pin: TeensyPin | number, value: boolean): TeensyCommand {
    return `PDW${pin}${value}`;
}

export function pinDigitalRead(pin: TeensyPin | number): TeensyCommand {
    return `PDR${pin}`;
}

export function heartbeat(): TeensyCommand {
    return "HBT";
}

export function handshake(): TeensyCommand {
    return "HSK";
}
