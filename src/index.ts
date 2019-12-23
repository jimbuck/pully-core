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
    views: parseInt(raw.player_response.videoDetails.viewCount.toString(), 10), // TODO: PR on ytdl to fix the typings
    lastScanned: now,
    formats: raw.formats.map<MediaFormat>(rawFormat => {

      return {
        raw: rawFormat,
        bitrate: parseInt(rawFormat.bitrate.toString(), 10),
        downloadSize: rawFormat.contentLength ? parseInt(rawFormat.contentLength, 10) : null,
        container: rawFormat.container,
        fps: rawFormat.fps || 0,
        itag: rawFormat.itag,
        resolution: rawFormat.height || 0,
        type: rawFormat.mimeType.split(';')[0],
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