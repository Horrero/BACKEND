module.exports = ({ env }) => {
    return {
        upload: {
            config: {
                provider: "strapi-provider-firebase-storage",
                providerOptions: {
                    serviceAccount: {
                        ...JSON.parse(env("FIREBASE_PRIVATE_KEY")),
                        private_key: env("FIREBASE_PRIVATE_KEY").replace(/\\n/g, '\n'),  // Properly format the key
                    },
                    bucket: "ecommerce-de40d.appspot.com",
                    sortInStorage: true,
                    debug: false,
                },
            },
        },
    };
};