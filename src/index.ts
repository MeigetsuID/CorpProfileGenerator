import { existsSync } from 'node:fs';
import { readJson } from 'nodeeasyfileio';

type AccessTokenInformation = {
    token_type: string;
    access_token: string;
    refresh_token: string;
    expires_at: {
        access_token: string;
        refresh_token: string;
    };
};

export default class CorpProfileGenerator {
    constructor(private WTAAccessTokenFilePath: string) {}
    private get WTAAccessToken(): string | null {
        if (!existsSync(this.WTAAccessTokenFilePath)) return null;
        const Record = readJson<AccessTokenInformation>(this.WTAAccessTokenFilePath);
        return new Date(Record.expires_at.access_token) < new Date() ? null : Record.access_token;
    }
    public GetNewestName(CorpNumber: string): Promise<string | null> {
        const Token = this.WTAAccessToken;
        if (Token == null) return Promise.reject(new Error('WTA access token is expired.'));
        return fetch(process.env.WTA_HOST + '/corporation/' + CorpNumber, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Token}`,
            },
        }).then(res => {
            if (res.status !== 200)
                return res.text().then(text => {
                    return Promise.reject(new Error(`Failed to get corporation name. Status code: ${res.status} - ${text}`));
                });
            return res.json().then(data => data.name);
        })

    }
    public Create(arg: { corp_number: string; user_id: string; mailaddress: string; password: string }): Promise<{
        id: string;
        user_id: string;
        name: string;
        mailaddress: string;
        password: string;
        account_type: number;
    } | null> {
        return this.GetNewestName(arg.corp_number).then(CorpName => {
            if (CorpName == null) return null;
            return {
                id: arg.corp_number,
                user_id: arg.user_id,
                name: CorpName,
                mailaddress: arg.mailaddress,
                password: arg.password,
                account_type: 3,
            };
        });
    }
}
