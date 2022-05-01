import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

// USER ACCOUNT
export const WALLET_PRIVATE_KEY: string = process.env.WALLET_PRIVATE_KEY || "PASTE YOUR WALLET PRIVATE KEY";
export const USER_PRIVATE_KEY: Uint8Array = bs58.decode(WALLET_PRIVATE_KEY);
export const USER_KEYPAIR: Keypair = Keypair.fromSecretKey(USER_PRIVATE_KEY);
// export const MANGO_PUBLIC_KEY: PublicKey = new PublicKey("2opNT9MrcECYKDJvdjbnpVwBPMCVZWEnwXaFWwxrTt47");
export const MANGO_PUBLIC_KEY: PublicKey = new PublicKey("P1EGQ7vz7mYdNgm2J6ANtiSsbpTHbFdvGwgAiMAQquR");

// TRADING VARS
export const SOL_PERP_INDEX: number = 3;
export const SOL_QUANTITY: number = 0.1;
export const USDC_PRICE_REFERENCE: number = 0.10;
export const NUMBER_OF_TRADES: number = 1;
export const PERP_TRADES_API: string = `https://event-history-api.herokuapp.com/perp_trades/${MANGO_PUBLIC_KEY}`;
export const RELOAD_DELAY: number = 60;