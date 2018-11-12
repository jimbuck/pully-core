import { Readable } from 'stream';
import { getInfo, downloadFromInfo as ytdlDownloadFromInfo } from 'ytdl-core';

import { createThumbnails } from './utils';
import { QueryResult, MediaFormat } from './models';

export * from './models';
export * from './utils';

/**
 * Retrieves video data based on a YouTube URL. Rejects if the URL is invalid or the video does not exist.
 * @param url The YouTube video URL.
 */
export async function query(url: string): Promise<QueryResult> {
  if (!url) throw new Error(`A url must be specified!`);
  let now = new Date();
  const raw = await getInfo(url);

  return {
    raw,
    videoId: raw.video_id,
    videoTitle: raw.title,
    videoUrl: raw.video_url,
    channelId: raw.author.id,
    channelName: raw.author.name,
    channelUrl: raw.author.channel_url,
    thumbnails: createThumbnails(raw.video_id),
    description: raw.description,
    published: new Date(raw.published),
    views: parseInt(raw.view_count, 10),
    lastScanned: now,
    formats: (raw.formats as Array<any>).map<MediaFormat>(rawFormat => {

      return {
        raw: rawFormat,
        audioBitrate: rawFormat.audioBitrate,
        audioEncoding: rawFormat.audioEncoding,
        bitrate: rawFormat.bitrate,
        downloadSize: rawFormat.clen ? parseInt(rawFormat.clen, 10) : null,
        container: rawFormat.container,
        encoding: rawFormat.encoding,
        fps: parseInt(rawFormat.fps || '0', 10),
        itag: rawFormat.itag,
        size: rawFormat.size,
        resolution: parseInt(rawFormat.resolution || '0', 10) || (rawFormat.size && parseInt(rawFormat.size.split('x')[1], 10)) || 0,
        type: rawFormat.type,
        url: rawFormat.url
      };
    })
  }
}

/**
 * Opens a stream to download a single 'track' (hd video, audio, or sd video+audio) from YouTube.
 * @param rawVideo The raw video details.
 * @param rawFormat The raw stream format details.
 */
export function downloadFromInfo(rawVideo: any, rawFormat: any): Readable {
  return ytdlDownloadFromInfo(rawVideo, { format: rawFormat });
}