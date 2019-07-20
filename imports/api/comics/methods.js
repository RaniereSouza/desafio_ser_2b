import { Meteor } from 'meteor/meteor';
import { HTTP }   from 'meteor/http';
import { EJSON }  from 'meteor/ejson';
import { check }  from 'meteor/check';

import moment from 'moment';
import md5    from 'md5';

import '../characters/methods.js';

Meteor.methods({
    //method to return an array of comics objects, based on a load limit from
    //the caller and skipping results in a certain offset
    'comics.getAll': (limit, comicsOffset) => {

        check(limit, Number);
        check(comicsOffset, Number);

        const apiData = EJSON.parse(Assets.getText('marvel_api_keys.json'));

        console.log('limit: ', limit);
        console.log('comicsOffset: ', comicsOffset);

        let comics         = [],
            timestamp      = moment().format('x'),
            queryPublicKey = "apikey=" + apiData.public_key,
            queryLimit     = "limit=" + limit,
            queryOffset    = "offset=" + comicsOffset,
            queryTimestamp = "ts=" + timestamp,
            queryHash      = "hash=" + md5(timestamp + apiData.private_key + apiData.public_key),
            fullRequestURI = apiData.api_uri + 'comics?noVariants=true&orderBy=-onsaleDate&' +
                             queryLimit + '&' + queryOffset + '&' +
                             queryTimestamp + '&' + queryPublicKey + '&' + queryHash,
            result         = HTTP.get(fullRequestURI);

        if (result.data.code != 200) {
            throw new Meteor.Error('API DIDN\'T WORK', 'The API Request did not return an expected result');
        }

        comics = result.data.data.results;

        return comics;
    },
    //method to return an array of comics objects, based on the full/partial name
    //of characters, a load limit from the caller, a loop group to indicate in which
    //interval of characters we currently are, and skipping results in a certain offset
    'comics.getByCharacterName': (characterName, limit, loopGroup, comicsOffset) => {

        check(characterName, String);
        check(limit, Number);
        check(loopGroup, Number);
        check(comicsOffset, Number);

        const apiData = EJSON.parse(Assets.getText('marvel_api_keys.json'));
        
        let charactersOffset = loopGroup * 10,
            characters       = Meteor.call('characters.getIDsByName', characterName, charactersOffset);

        console.log('limit: ', limit);
        console.log('charactersOffset: ', charactersOffset);
        console.log('comicsOffset: ', comicsOffset);

        if (!characters || (characters.length == 0)) {
            console.log("No characters found with this string.");
            return [];
        }

        let comics         = [],
            queryPublicKey = "apikey=" + apiData.public_key,
            queryLimit     = "limit=" + limit,
            timestamp, queryCharacters, queryOffset,
            queryTimestamp, queryHash,
            fullRequestURI, result, resultComics;

        while ((characters.length > 0) && (comics.length < limit)) {

            timestamp       = moment().format('x');
            queryCharacters = "characters=" + characters.join(',');
            queryOffset     = "offset=" + comicsOffset;
            queryTimestamp  = "ts=" + timestamp;
            queryHash       = "hash=" + md5(timestamp + apiData.private_key + apiData.public_key);
            fullRequestURI  = apiData.api_uri + 'comics?noVariants=true&orderBy=-onsaleDate&' +
                              queryCharacters + '&' + queryLimit + '&' + queryOffset + '&' +
                              queryTimestamp + '&' + queryPublicKey + '&' + queryHash;
            result          = HTTP.get(fullRequestURI);

            if (result.data.code != 200) {
                throw new Meteor.Error('API DIDN\'T WORK', 'The API Request did not return an expected result');
            }

            console.log('fullRequestURI: ', fullRequestURI);
            console.log('result.data.data.count: ', result.data.data.count);

            resultComics = result.data.data.results;
            resultComics = resultComics.slice(0, (limit - comics.length));

            comics = comics.concat(resultComics);

            if (comics.length == limit) {
                comicsOffset = resultComics.length;
                break;
            }

            comicsOffset = 0;
            loopGroup++;
            charactersOffset = loopGroup * 10,
            characters       = Meteor.call('characters.getIDsByName', characterName, charactersOffset);
        }

        return {comics, loopGroup, comicsOffset};
    }
});