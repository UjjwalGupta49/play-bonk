import { PublicKey } from '@solana/web3.js';
import { Referral, PerpetualsClient, PoolConfig } from 'flash-sdk';
import { PROGRAM_ID } from '@/utils/constants';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

interface TradingAccountResult {
    nftReferralAccountPK: PublicKey | null;
    nftTradingAccountPk: PublicKey | null;
    nftOwnerRebateTokenAccountPk: PublicKey | null;
}

export async function getNftTradingAccountInfo(
    userPublicKey: PublicKey,
    perpClient: PerpetualsClient,
    poolConfig: PoolConfig,
    collateralCustodySymbol: string
): Promise<TradingAccountResult> {
    // const getNFTReferralAccountPK = (publicKey: PublicKey): PublicKey => {
    //     return PublicKey.findProgramAddressSync(
    //         [Buffer.from('referral'), publicKey.toBuffer()],
    //         PROGRAM_ID
    //     )[0];
    // };

    const getNFTReferralAccountPK = (publicKey: PublicKey) => {
        return PublicKey.findProgramAddressSync([Buffer.from('referral'), publicKey.toBuffer()], PROGRAM_ID)[0]
    }
    const nftReferralAccountPK = getNFTReferralAccountPK(userPublicKey);
    const nftReferralAccountInfo = await perpClient.provider.connection.getAccountInfo(nftReferralAccountPK);

    let nftTradingAccountPk: PublicKey | null = null;
    let nftOwnerRebateTokenAccountPk: PublicKey | null = null;

    if (nftReferralAccountInfo) {
        const nftReferralAccountData = perpClient.program.coder.accounts.decode(
            'referral',
            nftReferralAccountInfo.data
        ) as Referral;

        nftTradingAccountPk = nftReferralAccountData.refererTradingAccount;

        if (nftTradingAccountPk) {
            const nftTradingAccountInfo = await perpClient.provider.connection.getAccountInfo(nftTradingAccountPk);
            if (nftTradingAccountInfo) {
                const nftTradingAccount = perpClient.program.coder.accounts.decode(
                    'trading',
                    nftTradingAccountInfo.data
                ) as { owner: PublicKey };

                nftOwnerRebateTokenAccountPk = getAssociatedTokenAddressSync(
                    poolConfig.getTokenFromSymbol(collateralCustodySymbol).mintKey,
                    nftTradingAccount.owner
                );
                // Check if the account exists
                const accountExists = await perpClient.provider.connection.getAccountInfo(nftOwnerRebateTokenAccountPk);
                if (!accountExists) {
                    console.log('NFT owner rebate token account does not exist and may need to be created');
                }
            }
        }
    }

    return {
        nftReferralAccountPK,
        nftTradingAccountPk,
        nftOwnerRebateTokenAccountPk
    };
}