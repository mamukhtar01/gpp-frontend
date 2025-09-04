import  { authentication, createDirectus, rest } from '@directus/sdk';
import {DbSchema} from './schema';

const url = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL

const client = createDirectus<DbSchema>(url!)
  .with(rest())
  .with(authentication("cookie", { credentials: "include" }));

  // set token for requests
  client.setToken(process.env.DIRECTUS_ACCESS_TOKEN!);

export default client;