import  { authentication, createDirectus, rest } from '@directus/sdk';
import {DbSchema} from './schema';

// const url = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL

// if (!url) {
//   throw new Error("DIRECTUS_URL or NEXT_PUBLIC_DIRECTUS_URL is not defined");
// }

const client = createDirectus<DbSchema>("https://iom-ppo-directus-dev.iom.int")
  .with(rest())
  .with(authentication("cookie", { credentials: "include" }));

  // set token for requests
  client.setToken(process.env.DIRECTUS_ACCESS_TOKEN!);

export default client;