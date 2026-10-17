// Release-controlled feature switches. Flip a value and redeploy to change behaviour;
// no secret or provider configuration is read here.
export const FEATURES = Object.freeze({
  // P0 closure (2026-10-15): the YouTube feed is temporarily off. No public page uses it,
  // and while off the endpoint never reads YOUTUBE_API_KEY or calls the YouTube API.
  youtubeFeed: false,
});
