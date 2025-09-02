import { authentication, createDirectus, rest} from '@directus/sdk';

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest()).with(authentication("cookie", { credentials: "include" }));



export default directus;