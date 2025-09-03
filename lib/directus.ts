import { authentication, createDirectus, rest} from '@directus/sdk';

const client = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest()).with(authentication("cookie", { credentials: "include" }));

  // set token for requests
  client.setToken(process.env.DIRECTUS_ACCESS_TOKEN!);

export default client;