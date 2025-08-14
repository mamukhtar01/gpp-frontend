import { createDirectus, rest, readItems, createItem } from '@directus/sdk';

const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(rest());

export async function getPayments() {
  return await directus.request(readItems('payments'));
}

export async function createPayment(data: object) {
  return await directus.request(createItem('payments', data));
}
