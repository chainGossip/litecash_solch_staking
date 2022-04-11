// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.
import * as anchor from "@project-serum/anchor";
import {
  AccountLayout,
  TOKEN_PROGRAM_ID,
  createAccount,
  createInitializeAccountInstruction,
} from "@solana/spl-token";
const IDL = require("../target/idl/lite_cash.json");
const { SystemProgram, Keypair, PublicKey } = anchor.web3;
const token_mint = "GnBw4qZs3maF2d5ziQmGzquQFnGV33NUcEujTQ3CbzP3";
const PROGRAM_ID = "9z37tYVJuRaPFJZWSW7eNW97NW7zTTP8oo9qJdmncP2Z";

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);
  const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
  let [vaultPDA, _nonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("SOLCH_STAKING_ACCOUNT")],
    program.programId
  );

  const aTokenAccount = new Keypair();
  const aTokenAccountRent =
    await provider.connection.getMinimumBalanceForRentExemption(
      AccountLayout.span
    );

  console.log("vaultPda", vaultPDA.toString(), "nonce", _nonce);
  console.log("tokenAccount", aTokenAccount.publicKey.toString());

  const tx = await program.rpc.createVault(_nonce, {
    accounts: {
      vault: vaultPDA,
      admin: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [aTokenAccount],
    instructions: [
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: aTokenAccount.publicKey,
        lamports: aTokenAccountRent,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeAccountInstruction(
        aTokenAccount.publicKey,
        new PublicKey(token_mint),
        vaultPDA,
        TOKEN_PROGRAM_ID
      ),
    ],
  });
  // let auxiliaryTokenAccount = await createAccount(
  //   provider.connection,
  //   aTokenAccount,
  //   new PublicKey(token_mint),
  //   vaultPDA
  // );
  console.log("migration tx", tx);
};
