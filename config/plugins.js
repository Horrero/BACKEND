module.exports = ({ env }) => {
    return {
        upload: {
            config: {
                provider: "strapi-provider-firebase-storage",
                providerOptions: {
                    // @ts-ignore
                    serviceAccount: require("./ecommerce-de40d-firebase-adminsdk-rcpwk-f3ba1289cc.json"),
                    // Custom bucket name
                    bucket: "ecommerce-de40d.appspot.com",
                    sortInStorage: true, // true | false
                    debug: false, // true | false
                },
            },
        },
    };
};