import Router from "@koa/router";
import megalodon, { MegalodonInterface } from '@cutls/megalodon';
import { apiAuthMastodon } from './endpoints/auth.js';
import { apiAccountMastodon } from './endpoints/account.js';
import { apiStatusMastodon } from './endpoints/status.js';
import { apiFilterMastodon } from './endpoints/filter.js';
import { apiTimelineMastodon } from './endpoints/timeline.js';
import { apiNotificationsMastodon } from './endpoints/notifications.js';
import { apiSearchMastodon } from './endpoints/search.js';
import { getInstance } from './endpoints/meta.js';

export function getClient(BASE_URL: string, authorization: string | undefined): MegalodonInterface {
	const accessTokenArr = authorization?.split(' ') ?? [null];
	const accessToken = accessTokenArr[accessTokenArr.length - 1];
	const generator = (megalodon as any).default
	const client = generator('misskey', BASE_URL, accessToken) as MegalodonInterface;
	return client
}

export function apiMastodonCompatible(router: Router): void {
	apiAuthMastodon(router)
	apiAccountMastodon(router)
	apiStatusMastodon(router)
	apiFilterMastodon(router)
	apiTimelineMastodon(router)
	apiNotificationsMastodon(router)
	apiSearchMastodon(router)

	router.get('/v1/custom_emojis', async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getInstanceCustomEmojis();
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

	router.get('/v1/instance', async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens); // we are using this here, because in private mode some info isnt 
																											// displayed without being logged in
		try {
			const data = await client.getInstance();
			ctx.body = getInstance(data.data);
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

} 
