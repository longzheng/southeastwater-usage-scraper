import { parseAuraResponseJson } from './auraApi.js';
import { describe, it, expect } from 'vitest';

describe('parseAuraResponseJson', () => {
    void it('parses API response', () => {
        const json: unknown = JSON.parse(`
{
    "actions": [
        {
            "id": "598;a",
            "state": "SUCCESS",
            "returnValue": {
                "returnValue": [
                    {
                        "apiDate": "2024-11-16T00:00:00+00:00",
                        "hasBlockedData": false,
                        "message": "Ok",
                        "readings": [
                            12,
                            15,
                            14,
                            13,
                            16,
                            14,
                            15,
                            13,
                            18,
                            65,
                            25,
                            14,
                            13,
                            16,
                            15,
                            14,
                            19,
                            13,
                            40,
                            105,
                            150,
                            35,
                            10,
                            14
                        ],
                        "resolution": "hourly",
                        "serialNo": "SN123456789",
                        "status": 200
                    }
                ],
                "cacheable": false
            },
            "error": []
        }
    ],
    "context": {
        "mode": "PROD",
        "app": "siteforce:communityApp",
        "contextPath": "/s/sfsites",
        "pathPrefix": "",
        "fwuid": "dzlEdDRVZ1RsVXFtVkduczVYNVVfZ1ZuNVJhc1EyaHA2ZTdMUkxCNEw5Y1E5LjMyMC4y",
        "mlr": 1,
        "coos": 1,
        "loaded": {
            "APPLICATION@markup://siteforce:communityApp": "1180_5uipvNSFkxlY1lsD8egjIg",
            "COMPONENT@markup://instrumentation:o11ySecondaryLoader": "339_lEKKeOv6XZLjJ9zHNYkGPw"
        },
        "globalValueProviders": [
            {
                "type": "$Global",
                "values": {
                    "eswConfigDeveloperName": {
                        "writable": true,
                        "defaultValue": ""
                    },
                    "isVoiceOver": {
                        "writable": true,
                        "defaultValue": false
                    },
                    "setupAppContextId": {
                        "writable": true,
                        "defaultValue": ""
                    },
                    "density": {
                        "writable": true,
                        "defaultValue": ""
                    },
                    "srcdoc": {
                        "writable": false,
                        "defaultValue": false
                    },
                    "appContextId": {
                        "writable": true,
                        "defaultValue": ""
                    },
                    "dynamicTypeSize": {
                        "writable": true,
                        "defaultValue": ""
                    }
                }
            }
        ],
        "enableAccessChecks": true,
        "dns": "c",
        "ls": 1,
        "lairn": [],
        "laerc": [],
        "lav": "62",
        "lgef": [
            "com.salesforce.locker.temporaryGate"
        ],
        "cpf": 4,
        "mna": {
            "lightning": "interop"
        },
        "arse": 1,
        "acaf": 1,
        "services": [
            "markup://lightning:configProvider",
            "markup://force:salesforceScopedModuleResolver",
            "markup://force:ldsEngineCreator",
            "markup://instrumentation:locatorService"
        ]
    },
    "perfSummary": {
        "version": "core",
        "request": 225,
        "actions": {
            "598;a": {
                "total": 160,
                "db": 8
            }
        },
        "actionsTotal": 160,
        "overhead": 0
    }
}
`);

        const parsed = parseAuraResponseJson(json);

        expect(parsed[0]?.date).toEqual(new Date('2024-11-16T00:00:00'));
        expect(parsed[0]?.localIsoString).toEqual('2024-11-16T00:00:00');
        expect(parsed[0]?.localDateString).toEqual('2024-11-16');
        expect(parsed[0]?.hour).toEqual(0);
        expect(parsed[0]?.measurement).toEqual(12);

        expect(parsed[12]?.date).toEqual(new Date('2024-11-16T12:00:00'));
        expect(parsed[12]?.localIsoString).toEqual('2024-11-16T12:00:00');
        expect(parsed[12]?.localDateString).toEqual('2024-11-16');
        expect(parsed[12]?.hour).toEqual(12);
        expect(parsed[12]?.measurement).toEqual(13);
    });
});
