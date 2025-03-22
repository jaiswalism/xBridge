export interface Chain {
    id: string;
    name: string;
    cmcId: string;
  }
  
  export interface Token {
    symbol: string;
    name: string;
    cmcId: string;
  }
  
  export const chains: Chain[] = [
    { id: "abstract", name: "Abstract", cmcId: "23456" },
    { id: "arbitrum", name: "Arbitrum", cmcId: "11841" },
    { id: "base", name: "Base", cmcId: "27716" },
    { id: "berchain", name: "Berchain", cmcId: "24647" },
    { id: "avalanche", name: "Avalanche", cmcId: "5805" },
    { id: "bnb", name: "BNB", cmcId: "1839" },
    { id: "linea", name: "Linea", cmcId: "27657" },
    { id: "optimism", name: "Optimism", cmcId: "11840" },
    { id: "polygon", name: "Polygon", cmcId: "3890" },
    { id: "solana", name: "Solana", cmcId: "5426" },
    { id: "soneium", name: "Soneium", cmcId: "45678" },
    { id: "unichain", name: "Unichain", cmcId: "56789" },
    { id: "zora", name: "Zora", cmcId: "67890" },
  ];
  
  export const tokens: Token[] = [
    { symbol: "ETH", name: "Ethereum", cmcId: "1027" },
    { symbol: "USDC", name: "USD Coin", cmcId: "3408" },
    { symbol: "USDT", name: "Tether", cmcId: "825" },
    { symbol: "DAI", name: "Dai", cmcId: "4943" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", cmcId: "3717" },
    { symbol: "MATIC", name: "Polygon", cmcId: "3890" },
    { symbol: "AVAX", name: "Avalanche", cmcId: "5805" },
    { symbol: "ARB", name: "Arbitrum", cmcId: "11841" },
    { symbol: "OP", name: "Optimism", cmcId: "11840" },
    { symbol: "SOL", name: "Solana", cmcId: "5426" },
    { symbol: "BNB", name: "BNB Chain", cmcId: "1839" },
    { symbol: "LINK", name: "Chainlink", cmcId: "1975" },
    { symbol: "TUSD", name: "TrueUSD", cmcId: "2563" },
    { symbol: "BASE", name: "Base", cmcId: "27716" },
    { symbol: "LINEA", name: "Linea", cmcId: "27657" },
    { symbol: "ABS", name: "Abstract", cmcId: "23456" },
    { symbol: "BERA", name: "Berchain", cmcId: "24647" },
    { symbol: "SON", name: "Soneium", cmcId: "45678" },
    { symbol: "UNICHAIN", name: "Unichain", cmcId: "56789" },
    { symbol: "ZORA", name: "Zora", cmcId: "67890" },
    { symbol: "SQD", name: "Subsquid", cmcId: "78901" },
    { symbol: "MYRC", name: "Blox MYRC", cmcId: "89012" },
  ];
  
  // Mapping of chains to their supported tokens
  export const chainToTokens: Record<string, string[]> = {
    "abstract": ["ABT"],
    "arbitrum": ["ARB", "SQD", "MYRC"],
    "base": ["BASE"],
    "berchain": ["BER"],
    "avalanche": ["AVAX", "USDC", "USDT"],
    "bnb": ["BNB", "TUSD", "USDT", "USDC"],
    "linea": ["LINEA"],
    "optimism": ["OP", "LINK", "USDC", "USDT"],
    "polygon": ["MATIC", "USDC", "USDT"],
    "solana": ["SOL"],
    "soneium": ["SON"],
    "unichain": ["UNI"],
    "zora": ["ZORA"]
  };
  