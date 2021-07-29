'use strict';

/*
 * Created with @iobroker/create-adapter v1.26.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const axios = require('axios').default;
const defObj = require('./lib/object_definitions').defObj;

class WlanthermoEsp32 extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'wlanthermo-esp32',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));

        this.queryTimeout = null;
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Reset adapter connection
        this.setState('info.connection', false, true);

        // Log configuration
        this.log.debug('WLANThermo IP: ' + this.config.wlanthermoIp);
        this.log.debug('Update interval: ' + this.config.updateInterval);

        // Adapter is up and running
        this.log.debug('Adapter is up and running');
        this.setState('info.connection', true, true);

        this.updateData();
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Reset adapter connection
            this.setState('info.connection', false, true);

            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called to update Traccar data
     */
    async updateData() {
        try {
            const baseUrl = 'http://' + this.config.wlanthermoIp;

            const responses = await axios.all([axios.get(baseUrl + '/data')]);

            const data = responses[0].data;

            // Process data
            this.setObjectAndState('system', 'system');

            this.setObjectAndState(
                'system.charge',
                'system.charge',
                null,
                data.system.charge
            );

            this.setObjectAndState(
                'system.online',
                'system.online',
                null,
                data.system.online
            );

            this.setObjectAndState(
                'system.rssi',
                'system.rssi',
                null,
                data.system.rssi
            );

            this.setObjectAndState(
                'system.soc',
                'system.soc',
                null,
                data.system.soc
            );

            this.setObjectAndState(
                'system.time',
                'system.time',
                null,
                data.system.time
            );

            this.setObjectAndState(
                'system.unit',
                'system.unit',
                null,
                data.system.unit
            );

            this.setObjectAndState('channels', 'channels');

            for (const channel of data.channel) {
                this.setObjectAndState(
                    'channels.channel',
                    'channels.' + channel.number,
                    'Channel ' + channel.number
                );

                this.setObjectAndState(
                    'channels.channel.number',
                    'channels.' + channel.number + '.number',
                    null,
                    channel.number
                );

                this.setObjectAndState(
                    'channels.channel.name',
                    'channels.' + channel.number + '.name',
                    null,
                    channel.name
                );

                this.setObjectAndState(
                    'channels.channel.type',
                    'channels.' + channel.number + '.type',
                    null,
                    channel.typ
                );

                this.setObjectAndState(
                    'channels.channel.temp',
                    'channels.' + channel.number + '.temp',
                    null,
                    channel.temp
                );

                this.setObjectAndState(
                    'channels.channel.min',
                    'channels.' + channel.number + '.min',
                    null,
                    channel.min
                );

                this.setObjectAndState(
                    'channels.channel.max',
                    'channels.' + channel.number + '.max',
                    null,
                    channel.max
                );

                this.setObjectAndState(
                    'channels.channel.alarm',
                    'channels.' + channel.number + '.alarm',
                    null,
                    channel.alarm
                );

                this.setObjectAndState(
                    'channels.channel.color',
                    'channels.' + channel.number + '.color',
                    null,
                    channel.color
                );

                this.setObjectAndState(
                    'channels.channel.fixed',
                    'channels.' + channel.number + '.fixed',
                    null,
                    channel.fixed
                );

                this.setObjectAndState(
                    'channels.channel.connected',
                    'channels.' + channel.number + '.connected',
                    null,
                    channel.connected
                );
            }
        } catch (err) {
            this.log.error(err);
        }

        this.queryTimeout = setTimeout(() => {
            this.updateData();
        }, this.config.updateInterval * 1000);
    }

    /**
     * Is used to create and object and set the value
     * @param {string} objectId
     * @param {string} stateId
     * @param {string | null} stateName
     * @param {*} value
     */
    async setObjectAndState(objectId, stateId, stateName = null, value = null) {
        let obj;

        if (defObj[objectId]) {
            obj = defObj[objectId];
        } else {
            obj = {
                type: 'state',
                common: {
                    name: stateName,
                    type: 'mixed',
                    role: 'state',
                    read: true,
                    write: true,
                },
                native: {},
            };
        }

        if (stateName !== null) {
            obj.common.name = stateName;
        }

        await this.setObjectNotExistsAsync(stateId, {
            type: obj.type,
            common: JSON.parse(JSON.stringify(obj.common)),
            native: JSON.parse(JSON.stringify(obj.native)),
        });

        if (value !== null) {
            if (obj.common.type === 'number') {
                value = Number(value);
            }

            await this.setStateChangedAsync(stateId, {
                val: value,
                ack: true,
            });
        }
    }
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new WlanthermoEsp32(options);
} else {
    // otherwise start the instance directly
    new WlanthermoEsp32();
}
