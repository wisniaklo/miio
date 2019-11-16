'use strict';

const { AirPurifier } = require('abstract-things/climate');
const MiotApi = require('../iotDevice');

const Power = require('./capabilities/power');
const Mode = require('./capabilities/mode');

const LEDBrightness = require('./capabilities/changeable-led-brightness');

const { Temperature, Humidity, AQI } = require('./capabilities/sensor');

/**
 * Abstraction over a Mi Air Purifier.
 *
 * Air Purifiers have a mode that indicates if is on or not. Changing the mode
 * to `idle` will power off the device, all other modes will power on the
 * device.
 */
module.exports = class extends AirPurifier.with(
	MiotApi,
	Power,
	Mode,
	Temperature,
	Humidity,
	AQI,
	LEDBrightness
) {
	static get type() {
		return 'miio:air-purifier';
	}

	constructor(options) {
		super(options);
		const { id } = this.handle.api;

		// Define the power property
		this.defineProperty(
			{ did: `${id}`, siid: 2, piid: 2 },
			{
				name: 'power',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 2 && piid === 2) {
						return v.value;
					}
				}
			}
		);

		// Set the mode property and supported modes
		this.defineProperty(
			{ did: `${id}`, siid: 2, piid: 5 },
			{
				name: 'mode',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 2 && piid === 5) {
						return v.value;
					}
				}
			}
		);

		this.defineProperty(
			{ did: `${id}`, siid: 2, piid: 4 },
			{
				name: 'fan',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 2 && piid === 4) {
						return v.value;
					}
				}
			}
		);

		// Sensor value for Temperature capability
		this.defineProperty(
			{ did: `${id}`, siid: 3, piid: 8 },
			{
				name: 'temperature',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 3 && piid === 8) {
						return v.value;
					}
				}
			}
		);

		// Sensor value for RelativeHumidity capability
		this.defineProperty(
			{ did: `${id}`, siid: 3, piid: 7 },
			{
				name: 'humidity',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 3 && piid === 7) {
						return v.value;
					}
				}
			}
		);

		// Sensor value used for AQI (PM2.5) capability
		this.defineProperty(
			{ did: `${id}`, siid: 3, piid: 6 },
			{
				name: 'aqi',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 3 && piid === 6) {
						return v.value;
					}
				}
			}
		);

		// The favorite level
		// this.defineProperty('favorite_level', {
		// 	name: 'favoriteLevel'
		// });

		// Info about usage
		// Filter life remain
		this.defineProperty(
			{ did: `${id}`, siid: 4, piid: 3 },
			{
				name: 'filter1_life',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 4 && piid === 3) {
						return v.value;
					}
				}
			}
		);
		// this.defineProperty('filter1_life', {
		// 	name: 'filterLifeRemaining'
		// });
		// this.defineProperty('f1_hour_used', {
		// 	name: 'filterHoursUsed'
		// });
		// this.defineProperty('use_time', {
		// 	name: 'useTime'
		// });

		// State for SwitchableLED capability
		this.defineProperty(
			{ did: `${id}`, siid: 6, piid: 1 },
			{
				name: 'led_brightness',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 6 && piid === 1) {
						return v.value;
					}
				}
			}
		);

		// Child Lock
		this.defineProperty(
			{ did: `${id}`, siid: 7, piid: 1 },
			{
				name: 'child_lock',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 7 && piid === 1) {
						return v.value;
					}
				}
			}
		);

		// // Buzzer and beeping
		// this.defineProperty('buzzer', {
		// 	mapper: v => v === 'on'
		// });
	}

	changePower(value) {
		const { id } = this.handle.api;
		return this.call('set_properties', [
			{ did: `${id}`, siid: 2, piid: 2, value }
		]);
	}

	/**
	 * Perform a mode change as requested by `mode(string)` or
	 * `setMode(string)`.
	 */
	changeMode(mode) {
		const { id } = this.handle.api;
		let value;

		switch (mode) {
			case 'auto':
				value = 0;
				break;

			case 'sleep':
				value = 1;
				break;

			case 'favorite':
				value = 2;
				break;

			case 'none':
				value = 3;
				break;
		}

		return this.call('set_properties', [
			{ did: `${id}`, siid: 2, piid: 5, value }
		]);
	}

	changeFan(speed) {
		const { id } = this.handle.api;
		let value;

		switch (speed) {
			case 'high':
				value = 3;
				break;

			case 'mid':
				value = 2;
				break;

			case 'low':
				value = 1;
				break;
		}

		return this.call('set_properties', [
			{ did: `${id}`, siid: 2, piid: 4, value }
		]);
	}

	/**
	 * Set the LED brightness to either `bright`, `dim` or `off`.
	 */
	changeLEDBrightness(level) {
		const { id } = this.handle.api;
		let value;

		switch (level) {
			case 'bright':
				value = 0;
				break;
			case 'dim':
				value = 1;
				break;
			case 'off':
				value = 2;
				break;
			default:
				return Promise.reject(new Error('Invalid LED brigthness: ' + level));
		}

		return this.call('set_properties', [
			{ did: `${id}`, siid: 6, piid: 1, value }
		]).then(() => null);
	}

	changeChildLock(lock) {
		const { id } = this.handle.api;

		return this.call('set_properties', [
			{ did: `${id}`, siid: 7, piid: 1, value: lock }
		]).then(() => null);
	}
};
