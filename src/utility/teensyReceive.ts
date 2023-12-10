export enum TeensyMessageId {
    handshake = "HSK",
    pinDigitalRead = "PDR",
    pinAnalogRead = "PAR",
}

//function isTeensyMessageId(id: string): id is TeensyMessageId {
//    return Object.values(TeensyMessageId).includes(id as TeensyMessageId);
//}

export type TeensyMessage =
    { id: TeensyMessageId.handshake } |
    { id: TeensyMessageId.pinDigitalRead, value: boolean } |
    { id: TeensyMessageId.pinAnalogRead, value: number };

interface TeensyParseError {
    kind: "error",
    reason: string,
    raw: string,
}

interface TeensyParseSuccess {
    kind: "success",
    message: TeensyMessage,
}

export type TeensyParseResult = TeensyParseError | TeensyParseSuccess;

export function parseFromTeensy(incoming: string): TeensyParseResult {
    // "success" discriminated enum helper function
    const success = (message: TeensyMessage) => {
        return {
            kind: "success",
            message: message,
        } as TeensyParseSuccess;
    };

    // "error" discriminated enum helper function
    const error = (message: string) => {
        return {
            kind: "error",
            reason: message,
            raw: incoming,
        } as TeensyParseError;
    }

    if (incoming.length < 3) {
        return error(`Could not parse message "${incoming}": message must begin with a 3-character command id`);
    }

    const id = incoming.slice(0, 3) as TeensyMessageId;
    const data = incoming.slice(3);

    switch (id) {
        case TeensyMessageId.pinDigitalRead: {
            if (data.length === 1) {
                if (data[0] === "0") return success({ id: id, value: false });
                if (data[0] === "1") return success({ id: id, value: true });
            }
            return error("Argument to pinDigitalRead must be 0 or 1");
        }
        case TeensyMessageId.pinAnalogRead: {
            let value;
            try {
                value = parseInt(data);
            } catch {
                return error(`Could not parse ${data} as integer`)
            }
            return success({ id: id, value: value })
        }
        case TeensyMessageId.handshake: {
            if (data.length === 0) { return success({ id: id }) }
            return error(`Expected no data in handshake message, got "${data}"`)
        }
        default: {
            return error(`Command ${id} not recognized`);
        }
    }
}

