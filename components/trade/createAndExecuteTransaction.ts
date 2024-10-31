import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
  MessageV0,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

// Add this interface at the top of the file
interface WalletError extends Error {
  message: string;
  code?: number;
}

export async function createAndExecuteTransaction(
  connection: Connection,
  wallet: any,
  instructions: TransactionInstruction[],
  addressLookupTables: PublicKey[] = []
): Promise<{ status: string; signature: string | null } | undefined> {
  try {
    // if (!wallet.publicKey || !wallet.signTransaction) {
    //   throw new Error("Wallet not connected");
    // }

    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    // Create a new TransactionMessage
    const message = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    // Create a new VersionedTransaction
    let transaction = new VersionedTransaction(message);

    // If there are address lookup tables, resolve them
    if (addressLookupTables.length > 0) {
      const addressLookupTableAccounts = await Promise.all(
        addressLookupTables.map(async (alt) => {
          const account = await connection
            .getAddressLookupTable(alt)
            .then((res) => res.value);
          if (!account) {
            throw new Error(
              `Address lookup table not found: ${alt.toBase58()}`
            );
          }
          return account;
        })
      );

      // Convert compiledInstructions to TransactionInstructions
      const transactionInstructions =
        transaction.message.compiledInstructions.map((instruction) => ({
          programId:
            transaction.message.staticAccountKeys[instruction.programIdIndex],
          keys: instruction.accountKeyIndexes.map((index) => ({
            pubkey: transaction.message.staticAccountKeys[index],
            isSigner: index < transaction.message.header.numRequiredSignatures,
            isWritable: transaction.message.isAccountWritable(index),
          })),
          data: Buffer.from(instruction.data),
        }));

      // Create a new MessageV0 with the resolved lookup tables
      const messageV0 = MessageV0.compile({
        instructions: transactionInstructions,
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        addressLookupTableAccounts: addressLookupTableAccounts,
      });

      // Create a new VersionedTransaction with the new message
      transaction = new VersionedTransaction(messageV0);
    }

    try {
      // Sign the transaction - this will prompt the user's wallet
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send the signed transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        console.error("Transaction failed:", confirmation.value.err.toString());
        return {
          status: "error: transaction failed",
          signature: null,
        };
      }

      console.log("Transaction executed successfully. Signature:", signature);
      return {
        status: "success",
        signature: signature,
      };
    } catch (error: unknown) {
      // Handle user rejection specifically
      if (error instanceof Error && error.message.includes('User rejected')) {
        console.log('User declined to sign the transaction');
        return {
          status: "error: user declined to sign the transaction",
          signature: null,
        };
      }
      
      // Handle other errors
      console.error("Error executing transaction:", error);
      return {
        status: "error executing transaction",
        signature: null,
      };
    }
  } catch (error) {
    console.error("Error in createAndExecuteTransaction:", error);
    return {
      status: "error in createAndExecuteTransaction",
      signature: null,
    };
  }
}
