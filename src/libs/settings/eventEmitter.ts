type EventObject<T = unknown> = {
    id: string;
    action: (args: T) => void;
};

export class EventEmitter<EventsMap = unknown> {
    private events = {} as Record<keyof EventsMap, EventObject<any>[]>;

    on<MapKey extends keyof EventsMap>(type: MapKey, event: EventObject<EventsMap[MapKey]>) {
        if (this.events[type]) {
            this.events[type].push(event);
        } else {
            this.events[type] = [event];
        }
    }

    off<MapKey extends keyof EventsMap>(type: MapKey, eventId: string) {
        if (this.events[type]) {
            this.events[type] = this.events[type].filter(({id}) => id !== eventId);
        }
    }

    dispatch<MapKey extends keyof EventsMap>(type: MapKey, args: EventsMap[MapKey]) {
        if (this.events[type]) {
            this.events[type].forEach(({action}) => {
                action(args);
            });
        }
    }
}
