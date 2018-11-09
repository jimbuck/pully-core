import { parse } from 'url';
import * as UrlPattern from 'url-pattern';
const sanitize = require('sanitize-filename');
const lodashTemplate: (format: string) => ((data: any) => string) = require('lodash.template');

import { Thumbnails } from './models';

const userPattern = new UrlPattern('/user/:username');
const channelPattern = new UrlPattern('/channel/:channelId');

export function extractPlaylistId(url: string): string {
    const urlData = parse(url, true, true);
    let playlistId = null;

    if (urlData.query.list) {
        playlistId = urlData.query.list as string;
    }

    return playlistId;
}

export function extractVideoId(url: string): string {
    const urlData = parse(url, true, true);
    let videoId = null;

    if (urlData.query.v) {
        videoId = urlData.query.v as string;
    }

    return videoId;
}

export function extractChannelId(url: string): string {
    const urlData = parse(url, true, true);
    let channelId = null;

    const channelData = channelPattern.match(urlData.pathname);
    if (channelData !== null && channelData.channelId) {
        channelId = channelData.channelId as string;
    }

    return channelId;
}

export function extractUsername(url: string): string {
    const urlData = parse(url, true, true);
    let username = null;

    const userData = userPattern.match(urlData.pathname);
    if (userData !== null && userData.username) {
        username = userData.username as string;
    }

    return username;
}

export function createChannelUrl(channelId: string): string {
    return `https://www.youtube.com/channel/${channelId}`;
}

export function createUserUrl(username: string): string {
    return `https://www.youtube.com/user/${username}`;
}

export function createPlaylistUrl(playlistId: string): string {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
}

export function createVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

export function createThumbnails(videoId: string): Thumbnails {
    return {
        background: imageUrl(videoId, '0'),
        start: imageUrl(videoId, '1'),
        middle: imageUrl(videoId, '2'),
        end: imageUrl(videoId, '3'),

        high: imageUrl(videoId, 'hqdefault'),
        medium: imageUrl(videoId, 'mqdefault'),
        normal: imageUrl(videoId, 'default'),

        hd: imageUrl(videoId, 'maxresdefault'),
        sd: imageUrl(videoId, 'sddefault')
    }
};

function imageUrl(videoId: string, image: string): string {
    return `https://i1.ytimg.com/vi/${videoId}/${image}.jpg`;
}

export function makeAbsolute(path: string, host: string = 'https://youtube.com'): string {
    if (host.endsWith('/')) host = host.slice(0, -1);
    return path.startsWith('/') ? (host + path) : path;
}

export function scrubString(text: string): string {
    return sanitize(text);
}

export function scrubObject(target: any): any {
    let result: any = {};

    Object.keys(target).forEach(key => {
        let val = target[key];
        result[key] = typeof val === 'string' ? scrubString(val).trim() : val;
    });

    return result;
}

export function template(format: string) {
    function customTemplate(data: any) {
        data = scrubObject(data);
        return customTemplate.lodashTemplate(data);
    }

    customTemplate.format = format;
    customTemplate.lodashTemplate = lodashTemplate(format);

    return customTemplate;
}