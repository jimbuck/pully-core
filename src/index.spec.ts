import { Readable } from 'stream';
import test, { ExecutionContext } from 'ava';
import { query, downloadFromInfo } from './index';

const EMPTY_STRING = '';

async function queryOf(t: ExecutionContext, videoId: string) {
	const data = await query(`https://www.youtube.com/watch?v=${videoId}`);

	t.truthy(data);
	t.truthy(data.raw);
	t.true(Date.now() - data.lastScanned.valueOf() < 1000 * 60);
	t.is(typeof data.videoId, 'string');
	t.is(typeof data.videoTitle, 'string');
	t.is(typeof data.videoUrl, 'string');
	t.is(typeof data.channelId, 'string');
	t.is(typeof data.channelName, 'string');
	t.is(typeof data.channelUrl, 'string');
	t.is(typeof data.description, 'string');
	t.true(data.published instanceof Date);
	t.is(typeof data.views, 'number');
	t.true(data.views > 0);
	t.truthy(data.thumbnails);
	t.true(Object.keys(data.thumbnails).length > 0);
}
queryOf.title = (_: string, input: string) => `query returns video data for ${input}`;

test(`query rejects for an unknown video`, async (t) => {
	await t.throwsAsync(query(null));
	await t.throwsAsync(query(EMPTY_STRING));
	await t.throwsAsync(query('https://www.google.com'));
	await t.throwsAsync(query('https://www.not-youtube.org/fake?v=cPrjA5mK8Ek'));
	await t.throwsAsync(query('https://www.youtube.com/watch?v=fakevideoid'));
});

test(queryOf, 'cPrjA5mK8Ek');
test(queryOf, '8YP_nOCO-4Q');
test(queryOf, 'O-m520BRkfM');
test(queryOf, 'hDACN-BGvI8');
test(queryOf, 'dQw4w9WgXcQ');

test(`downloadFromInfo correctly calls into ytdl-core`, t => {
	const ytdl = require('ytdl-core');
	let origDownloadFromInfo = ytdl.downloadFromInfo;

	const expectedRawVideo = Math.random();
	const expectedformat = Math.random();
	const expectedReturn = new Readable();

	t.plan(3);

	ytdl.downloadFromInfo = (rawVideo: any, options: { format: any }) => {
		t.is(rawVideo, expectedRawVideo);
		t.is(options.format, expectedformat);

		return expectedReturn;
	};

	const actualReturn = downloadFromInfo(expectedRawVideo, expectedformat);
	t.is(actualReturn, expectedReturn);

	ytdl.downloadFromInfo = origDownloadFromInfo;
})