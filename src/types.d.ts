declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EMAIL: string;
            PASSWORD: string;
            DAYS_TO_EXTRACT: string;
            INFLUXDB_URL: string | undefined;
            INFLUXDB_TOKEN: string | undefined;
            INFLUXDB_ORG: string | undefined;
            INFLUXDB_BUCKET: string | undefined;
        }
    }
}

export {};
