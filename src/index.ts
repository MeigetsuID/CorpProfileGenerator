import CorpNumberManager from 'ntacorpnumberapimanager';

export default class CorpProfileGenerator {
    private CorpNumber: CorpNumberManager;
    constructor(NTAAppKey: string) {
        this.CorpNumber = new CorpNumberManager(NTAAppKey);
    }
    public GetNewestName(CorpNumber: string): Promise<string | null> {
        return this.CorpNumber.getCorpInfoFromNum({ number: CorpNumber }).then(res => {
            if (res.corporations == null) return null;
            const CorpName = res.corporations[0].name;
            if (!CorpName) return null;
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
