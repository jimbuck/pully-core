import test, { ExecutionContext } from 'ava';

import * as utils from './utils';

test('create URLs', t => {
    t.truthy(utils.createChannelUrl('UC6107grRI4m0o2-emgoDnAA'));
    t.truthy(utils.createUserUrl('testedcom'));
    t.truthy(utils.createPlaylistUrl('PLjHf9jaFs8XUXBnlkBAuRkOpUJosxJ0Vx'));
    t.truthy(utils.createVideoUrl('GEhBPI2QVBI'));
});

test(`extracts videoId from query`, t => {
    const expectedVideoId = 'GEhBPI2QVBI';
    const actualVideoId = utils.extractVideoId(`https://www.youtube.com/watch?v=${expectedVideoId}`);

    t.is(actualVideoId, expectedVideoId);
    t.is(utils.extractVideoId('<invalid-url>'), null);
});

test(`extracts playlistId from query`, t => {
    const expectedPlaylistId = 'PLjHf9jaFs8XUXBnlkBAuRkOpUJosxJ0Vx';
    const urlFormats = [
        `https://www.youtube.com/playlist?list=${expectedPlaylistId}`,
        `https://www.youtube.com/watch?v=-GlJFVTzEsI&index=2&list=${expectedPlaylistId}`
    ];

    urlFormats.forEach(url => {
        const actualPlaylistId = utils.extractPlaylistId(url);
        t.is(actualPlaylistId, expectedPlaylistId);
    });

    t.is(utils.extractPlaylistId('<invalid-url>'), null);
});

test(`extracts channelId from url`, t => {
    const expectedChannelId = 'UC6107grRI4m0o2-emgoDnAA';
    const actualChannelId = utils.extractChannelId(`https://www.youtube.com/channel/${expectedChannelId}`);

    t.is(actualChannelId, expectedChannelId);
    t.is(utils.extractChannelId('<invalid-url>'), null);
});

test(`extracts username from url`, t => {
    const expectedUsername = 'testedcom';
    const actualUsername = utils.extractUsername(`https://www.youtube.com/user/${expectedUsername}`);

    t.is(actualUsername, expectedUsername);
    t.is(utils.extractUsername('<invalid-url>'), null);
});

test(`createThumbnails properly creates all available image URLs`, t => {
    const videoId = 'unIIn_1JOAE';

    const thumbnails = utils.createThumbnails(videoId);

    t.is(thumbnails.background, `https://i1.ytimg.com/vi/${videoId}/0.jpg`);
    t.is(thumbnails.start, `https://i1.ytimg.com/vi/${videoId}/1.jpg`);
    t.is(thumbnails.middle, `https://i1.ytimg.com/vi/${videoId}/2.jpg`);
    t.is(thumbnails.end, `https://i1.ytimg.com/vi/${videoId}/3.jpg`);

    t.is(thumbnails.high, `https://i1.ytimg.com/vi/${videoId}/hqdefault.jpg`);
    t.is(thumbnails.medium, `https://i1.ytimg.com/vi/${videoId}/mqdefault.jpg`);
    t.is(thumbnails.normal, `https://i1.ytimg.com/vi/${videoId}/default.jpg`);

    t.is(thumbnails.hd, `https://i1.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
    t.is(thumbnails.sd, `https://i1.ytimg.com/vi/${videoId}/sddefault.jpg`);
});

test('makeAbsolute converts root-based relative paths', testMakeAbsolute, '/a/test/path', 'https://youtube.com/a/test/path');
test('makeAbsolute skips non-relative paths', testMakeAbsolute, 'http://jimmyboh.com', 'http://jimmyboh.com');
test('makeAbsolute allows custom hosts', testMakeAbsolute, '/a/test/path', 'http://youtube.co.uk/a/test/path', 'http://youtube.co.uk/');


test(`scrubString removes invalid characters`, t => {
    const expectedStr = 'this.$$$-is(S)[A]{F}E';
    const actualStr = utils.scrubString('this.$*$*$-is\\/(S)[A]{F}|E|');
    t.is(actualStr, expectedStr);
});

test(`scrubObject removes invalid characters from each property`, t => {
    interface Thingy {
        a: string,
        b: number,
        c: string
    }

    const origObject: Thingy = {
        a: '$(*@#$#@$)(*)',
        b: 2,
        c: 'lkjasfd*^%@#$(*jfsl)'
    };
    const expectedObj: Thingy = {
        a: '$(@#$#@$)()',
        b: 2,
        c: 'lkjasfd^%@#$(jfsl)'
    };

    const actualObj: Thingy = utils.scrubObject(origObject);

    t.is(actualObj.a, expectedObj.a);
    t.is(actualObj.b, expectedObj.b);
    t.is(actualObj.c, expectedObj.c);
});

test(`template creates a template function that auto-scrubs the data`, t => {
    const expectedStr = 'Hello World!';
    const template = utils.template('${greeting} ${name}');
    t.is(typeof template, 'function');
    const actualStr = template({greeting: '                He:l<l>o?', name: 'W"or|l*d!   '});
    t.is(actualStr, expectedStr);
});

function testMakeAbsolute(t: ExecutionContext, path: string, expectedUrl: string, host?: string) {
    const actualUrl = utils.makeAbsolute(path, host);
    t.is(actualUrl, expectedUrl);
}