// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    nitro: {
        routeRules: {
            '/api/**': {
                cors: true,
                headers: {
                    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': '*', // Allow all headers
                    'Access-Control-Max-Age': '86400', // Optional: cache preflight requests
                },
            },
        },
    },
    runtimeConfig: {
        // waticket
        waTicketApiToken: process.env.NUXT_WA_TICKET_API_TOKEN || '',
        waTicketApiUrl: process.env.NUXT_WA_TICKET_API_URL || '',

        public: {
            finalSiteUrl: process.env.NUXT_PUBLIC_FINAL_SITE_URL || '',
        },
    },
});
