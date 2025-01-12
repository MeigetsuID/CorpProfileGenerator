import { existsSync } from 'node:fs';
import { readFile } from 'nodeeasyfileio';
import CorpProfileGenerator from '.';
import { convert } from 'ntacorpnumberapimanager-xmlparser';

describe('Corp Profile Generator Test', () => {
    const CPG = new CorpProfileGenerator('./system/wtatoken.json');
    beforeAll(() => {
        global.fetch = jest.fn(url => {
            const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : '';
            const corpNumber = urlString.match(/[1-9][0-9]{12}/);

            if (corpNumber == null) return Promise.resolve(new Response('no corp number', { status: 404 }));
            const query = corpNumber[0];
            if (!existsSync('./testdata/' + query + '.xml'))
                return Promise.resolve(new Response('Not found', { status: 404 }));
            const xml = readFile('./testdata/' + query + '.xml');
            return convert(xml).then(json => {
                return Promise.resolve(
                    new Response(JSON.stringify(json), {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                );
            });
        });
    });
    afterAll(() => {
        jest.clearAllMocks();
    });
    it('Mock Check', async () => {
        await expect(CPG.GetNewestName('7000012050002')).rejects.toThrow(
            'Failed to get corporation name. Status code: 404 - Not found'
        );
    });
    describe('GetNewestName', () => {
        it('OK', async () => {
            const res = await CPG.GetNewestName('1000011000005');
            expect(res).toBe('国立国会図書館');
        });
        it('NG', async () => {
            await expect(CPG.GetNewestName('4010404006753')).rejects.toThrow(
                'Failed to get corporation name. Status code: 404 - Not found'
            );
        });
    });
    describe('Create', () => {
        it('OK', async () => {
            const res = await CPG.Create({
                corp_number: '1000011000005',
                user_id: 'kokkai_toshokan',
                mailaddress: 'info@ndl.go.jp',
                password: 'password01',
            });
            expect(res).toStrictEqual({
                id: '1000011000005',
                user_id: 'kokkai_toshokan',
                name: '国立国会図書館',
                mailaddress: 'info@ndl.go.jp',
                password: 'password01',
                account_type: 3,
            });
        });
        it('NG', async () => {
            const res = await CPG.Create({
                corp_number: '4010404006753',
                user_id: 'meigetsu2020',
                mailaddress: 'info@mail.meigetsu.jp',
                password: 'password01',
            });
            expect(res).toBeNull();
        });
    });
});
