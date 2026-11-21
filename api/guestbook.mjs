import { createGuestbookHandler, createRedisGuestbook } from "../server/guestbook.mjs";

export default createGuestbookHandler({
  getStore: () => createRedisGuestbook({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
});
