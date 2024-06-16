import { parseAuraResponseJson } from './auraApi';

describe('parseAuraResponseJson', () => {
    void it('parses API response', () => {
        const json = {
            actions: [
                {
                    id: 'abcd',
                    state: 'SUCCESS',
                    returnValue:
                        '{"usage":"[{\\"PeriodType\\":\\"hourly\\",\\"DateTo\\":\\"2024-05-31\\",\\"DateFrom\\":\\"2024-05-31\\",\\"Readings\\":[{\\"Measurement\\":3,\\"Date\\":\\"2024-05-31T00:00:00.000Z\\"},{\\"Measurement\\":3,\\"Date\\":\\"2024-05-31T01:00:00.000Z\\"}],\\"Total\\":323,\\"SerialNumber\\":\\"ABCDEFG\\"}]","household":"[{\\"attributes\\":{\\"type\\":\\"Billing_Account__c\\",\\"url\\":\\"/services/data/v60.0/sobjects/Billing_Account__c/ABCDEFG\\"},\\"Id\\":\\"ABCDEFG\\",\\"HiAF_Account_Number_Check_Digit__c\\":\\"123456\\",\\"Property__c\\":\\"ABCDEFG\\",\\"Profiles__r\\":{\\"totalSize\\":1,\\"done\\":true,\\"records\\":[{\\"attributes\\":{\\"type\\":\\"Billing_Account_Settings__c\\",\\"url\\":\\"/services/data/v60.0/sobjects/Billing_Account_Settings__c/ABCDEFG\\"},\\"Billing_Account__c\\":\\"ABCDEFG\\",\\"Id\\":\\"ABCDEFG\\",\\"Adults__c\\":1,\\"Target__c\\":155.00}]},\\"Property__r\\":{\\"attributes\\":{\\"type\\":\\"Property__c\\",\\"url\\":\\"/services/data/v60.0/sobjects/Property__c/ABCDEFG\\"},\\"Digital_Meter__c\\":true,\\"Id\\":\\"ABCDEFG\\"}}]"}',
                    error: [],
                },
            ],
        };

        const parsed = parseAuraResponseJson(json);

        expect(parsed).toBeDefined();
    });
});
