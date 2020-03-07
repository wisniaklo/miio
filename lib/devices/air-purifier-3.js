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
				name: 'fanLevel',
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

		// Info about usage
		// Filter life remain
		this.defineProperty(
			{ did: `${id}`, siid: 4, piid: 3 },
			{
				name: 'filterLifeRemaining',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 4 && piid === 3) {
						return v.value;
					}
				}
			}
		);
		
		// Filter hours used
		this.defineProperty(
			{ did: `${id}`, siid: 4, piid: 5 },
			{
				name: 'filterHoursUsed',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 4 && piid === 5) {
						return v.value;
					}
				}
			}
		);
		
		// State for Changeable LED brightness 
		// Brightness: 
		// {'value': 0, 'description': 'brightest'}, 
		// {'value': 1, 'description': 'dim'}, 
		// {'value': 2, 'description': 'led_off'}
		this.defineProperty(
			{ did: `${id}`, siid: 6, piid: 1 },
			{
				name: 'ledBrightness',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 6 && piid === 1) {
						return v.value;
					}
				}
			}
		);

		// State for Switchable LED capability 
		// Switch Status: 
		// {'value': true, 'description': 'led on'}, 
		// {'value': false, 'description': 'led off'}
		this.defineProperty(
			{ did: `${id}`, siid: 6, piid: 6 },
			{
				name: 'led',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 6 && piid === 6) {
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
		this.defineProperty(
			{ did: `${id}`, siid: 5, piid: 1 },
			{
				name: 'buzzer',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 5 && piid === 1) {
						return v.value;
					}
				}
			}
		);
		
		// Favorite Fan Level
		this.defineProperty(
			{ did: `${id}`, siid: 10, piid: 10 },
			{
				name: 'favorite_level',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 10 && piid === 10) {
						return v.value;
					}
				}
			}
		);
		
		// Motor Speed
		this.defineProperty(
			{ did: `${id}`, siid: 10, piid: 8 },
			{
				name: 'motor_speed',
				mapper: v => {
					const { siid, piid } = v;

					if (siid === 10 && piid === 8) {
						return v.value;
					}
				}
			}
		);
	}

	changePower(value) {
		const { id } = this.handle.api;
		return this.call('set_properties', [
			{ did: `${id}`, siid: 2, piid: 2, value: !!value }
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

		value = parseInt(speed);

		if (value < 1) {
			value = 1;
		}
		if (value > 3) {
			value = 3;
		}

		return this.call('set_properties', [
			{ did: `${id}`, siid: 2, piid: 4, value }
		]);
	}

	changeFavoriteSpeed(speed) {
		const { id } = this.handle.api;
		let value = parseInt(speed);

		if (value < 300) {
			value = 300;
		}

		if (value > 2300) {
			value = 2300
		}

		return this.call('set_properties', [
			{ did: `${id}`, siid: 10, piid: 7, value }
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
			{ did: `${id}`, siid: 7, piid: 1, value: !!lock }
		]).then(() => null);
	}

	changeBuzzer(value) {
		const { id } = this.handle.api;

		return this.call('set_properties', [
			{ did: `${id}`, siid: 5, piid: 1, value: !!value }
		]).then(() => null);
	}
	
	changeFavoriteLevel(level) {
		const { id } = this.handle.api;
		let value = parseInt(level);

		if (value < 0) {
			value = 0;
		}

		if (value > 14) {
			value = 14;
		}

		return this.call('set_properties', [
			{ did: `${id}`, siid: 10, piid: 10, value }
		]);
	}
};
