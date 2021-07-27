'use strict';

/*
 * Created with @iobroker/create-adapter v1.26.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");

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
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
      // Reset adapter connection
      this.setState("info.connection", false, true);

      // Log configuration
      this.log.debug("WLANThermo IP: " + this.config.wlanthermoIp);
      this.log.debug("Update interval: " + this.config.updateInterval);

      // Adapter is up and running
      this.log.debug("Adapter is up and running");
      this.setState("info.connection", true, true);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Reset adapter connection
            this.setState("info.connection", false, true);

            callback();
        } catch (e) {
            callback();
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