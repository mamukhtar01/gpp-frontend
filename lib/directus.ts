import { authentication, createDirectus, rest} from '@directus/sdk';

const client = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest()).with(authentication("cookie", { credentials: "include" }));


export default client;