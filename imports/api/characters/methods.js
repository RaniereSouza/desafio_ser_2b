import { Meteor } from 'meteor/meteor';
import { HTTP }   from 'meteor/http';
import { EJSON }  from 'meteor/ejson';
import { check }  from 'meteor/check';

import moment from 'moment';
import md5    from 'md5';

Meteor.methods({
    //method to return an array of character IDs based on the full/partial name,
    //skipping results in a certain offset
    'characters.getIDsByName': (name, offset) => {

        check(name, String);
        check(offset, Number);

        if (!name || (name == '')) {
            throw new Meteor.Error('EMPTY PARAMETER', 'There\'s no data in the parameter to make a Request with');
        }

        const apiData = EJSON.parse(Assets.getText('marvel_api_keys.json'));

        let limit          = 10,
            characters     = [],
            timestamp      = moment().format('x'),
            queryName      = "nameStartsWith=" + name,
            queryPublicKey = "apikey=" + apiData.public_key,
            queryLimit     = "limit=" + limit,
            queryOffset    = "offset=" + offset,
            queryTimestamp = "ts=" + timestamp,
            queryHash      = "hash=" + md5(timestamp + apiData.private_key + apiData.public_key),
            fullRequestURI = apiData.api_uri + 'characters?' + queryName + '&' +
                             queryLimit + '&' + queryOffset + '&' +
                             queryTimestamp + '&'+ queryPublicKey + '&' + queryHash,
            result         = HTTP.get(fullRequestURI);

        if (result.data.code != 200) {
            throw new Meteor.Error('API DIDN\'T WORK', 'The API Request did not return an expected result');
        }

        console.log('fullRequestURI: ', fullRequestURI);
        console.log('result.data.data.count: ', result.data.data.count);

        characters = result.data.data.results.map(item => item.id);

        return characters;
    }
});