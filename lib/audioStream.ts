import play from "play-dl";
import mm from "music-metadata";

export async function streamAudio(url: string) {
  const info = await play.video_info(url);
  const stream = await play.stream(url);
  return { info: info.video_details, stream: stream.stream };
}

export async function getAudioMetadata(filePath: string) {
  const metadata = await mm.parseFile(filePath);
  return metadata.common;
    }
