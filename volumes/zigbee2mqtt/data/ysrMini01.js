const extend = require('zigbee-herdsman-converters/lib/extend');

module.exports = [
{
        fingerprint: [
	    {modelID: 'TS0502B', manufacturerName: '_TZ3210_rm0hthdo'}
        ],
        model: 'TS0502B-AliExpress',
        vendor: 'TuYa AliExpress',
        description: 'Light controller',
        extend: extend.light_onoff_brightness_colortemp({colorTempRange: [153, 500]}),
}
];

