import { Thumbnails } from './models';

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