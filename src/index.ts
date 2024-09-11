import CorpNumberManager from 'ntacorpnumberapimanager';

export default class CorpProfileGenerator {
    private CorpNumber: CorpNumberManager;
    constructor(NTAAppKey: string) {
        this.CorpNumber = new CorpNumberManager(NTAAppKey);
    }
    public GetNewestName(CorpNumber: string): Promise<string> {
        return this.CorpNumber.getCorpInfoFromNum({ number: CorpNumber }).then(res => {
            if (res.corporations.length === 0) throw new Error('No corporation found');
            const CorpName = res.corporations[0].name;
            if (!CorpName) throw new Error('Corp name is null');
            return CorpName;
        });
    }
    public Create(arg: { corp_number: string; user_id: string; mailaddress: string; password: string }): Promise<{
        id: string;
        user_id: string;
        name: string;
        mailaddress: string;
        password: string;
        account_type: number;
    }> {
        return this.GetNewestName(arg.corp_number).then(CorpName => {
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
