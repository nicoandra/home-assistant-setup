const request = require('request');
const yaml = require('js-yaml');


const getFromHA = async (url) => {
	return new Promise((ok, ko) => {
		const options = { 
			rejectUnauthorized: false,
			requestCert: true,
			agent: false,
			headers: { Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwM2M1NzNkN2U3OGY0N2I1OTNlNjk4OWViMmI1MmNjZiIsImlhdCI6MTU3MDk3NDkyMywiZXhwIjoxODg2MzM0OTIzfQ.TabQZo7JqcZIa7E522nHfwnxgGkFFKL08OqpZgPTopA' }
		};
		
		request('https://192.168.1.106:8123/api/' + url, options, (e, r) => {
			if(e) return ko(e);
			return ok(r);
		})
	}).then(function (response) {
		return JSON.parse(response.body);
	}).then(function (body) {
		return body
	}).catch(e => { 
		console.error(e)
	});
}

const isScenesCommand = () => {
	return process.argv.indexOf('--scenes') > 0
}



const getGroups = async () => {
	const result = {}
	return getFromHA('states').then(a => a.filter(a => a.entity_id.startsWith('group'))).then(a => {
		
		for (group of a) {
			result[group.entity_id] = group.attributes.entity_id.filter(a => a.startsWith('light') || a.startsWith('group'));
		}

		console.log(result)
		return ;
		
		if (!Array.isArray(result[a.entity_id]['entities'])) {
			result[a.entity_id]['entities'] = [];
		} 
		console.log(result)
	});
}

const buildLightState = (entity) => {
	const result = {};
	const attributes = entity. attributes;
	if(attributes.brightness != undefined) result.brightness = attributes.brightness;
	if(attributes.color_temp != undefined) result.color_temp = attributes.color_temp;
	// if(attributes.rgb_color != undefined) result.rgb_color = attributes.rgb_color;
	return result;
}

if (isScenesCommand()) {
	const description = {};
	getFromHA('states')
		.then(a => a.filter(a => a.entity_id.startsWith('light')))
		.then(a => {
			for (entity of a) {
				console.log('log this', entity.state)
				if (entity.state == 'off') {
					description[entity.entity_id] = entity.state;
					continue 
				}
				description[entity.entity_id] = {state: 'on', ...buildLightState(entity)}
			}
			return description;
		})
	.then(console.info).then(() => yaml.safeDump({
		name: 'Your Scene', 
		entities: description
	})).then(console.info)
}