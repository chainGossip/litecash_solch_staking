import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LiteCash } from "../target/types/lite_cash";

describe("LiteCash", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.LiteCash as Program<LiteCash>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
