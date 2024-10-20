import { existsSync } from 'node:fs';
import { readFile } from 'nodeeasyfileio';
import CorpProfileGenerator from '.';

describe('Corp Profile Generator Test', () => {
    const CPG = new CorpProfileGenerator('dummy');
    beforeAll(() => {
        global.fetch = jest.fn(url => {
            const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : '';
            const query = new URL(urlString).searchParams.get('number');
            if (query == null) return Promise.reject('no query');
            const xml = existsSync('./testdata/' + query + '.xml')
                ? readFile('./testdata/' + query + '.xml')
                : readFile('./testdata/notfound.xml');
            return Promise.resolve(
                new Response(xml, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/xml',
                    },
                })
            );
        });
    });
    afterAll(() => {
        jest.clearAllMocks();
    });
    it('Mock Check', async () => {
        const res = await CPG.GetNewestName('7000012050002');
        expect(res).toBe(null); // ここで「国税庁」が返ってきたら、Mockが効いていない
    });
    describe('GetNewestName', () => {
        it('OK', async () => {
            const res = await CPG.GetNewestName('1000011000005');
            expect(res).toBe('国立国会図書館');
        });
        it('NG', async () => {
            const res = await CPG.GetNewestName('4010404006753');
            expect(res).toBeNull();
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
