module.exports = ({ env }) => {
    return {
        upload: {
            config: {
                provider: "strapi-provider-firebase-storage",
                providerOptions: {
                    // @ts-ignore
                    serviceAccount: JSON.parse(env("FIREBASE_PRIVATE_KEY")),
                    // Custom bucket name
                    bucket: "ecommerce-de40d.appspot.com",
                    sortInStorage: true, // true | false
                    debug: false, // true | false
                },
            },
        },
    };
};