import fs from "fs";
import path from "path";

// Define the expected structure of the chain data
interface ChainData {
    id: number;
    name: string;
    coin: string;
    logoURI: string;
    tokenlistUrl: string;
    rpcUrl: string | null;
    chainType: string;
    mainnet: boolean;
    chainIdHex: string;
    blockExplorerUrls: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    diamondAddress: string | null;  // Added LiFi contract address
}

async function getSupportedChains() {
    try {
        const response = await fetch("https://li.quest/v1/chains");
        const data = await response.json();

        const formattedChains: ChainData[] = data.chains.map((chain: any) => ({
            id: chain.id,
            name: chain.name,
            coin: chain.coin,
            logoURI: chain.logoURI,
            tokenlistUrl: chain.tokenlistUrl,
            rpcUrl: chain.metamask?.rpcUrls?.[0] || null,
            chainType: chain.chainType,
            mainnet: chain.mainnet,
            chainIdHex: chain.metamask?.chainId || "0x0",
            blockExplorerUrls: chain.metamask?.blockExplorerUrls || [],
            nativeCurrency: {
                name: chain.metamask?.nativeCurrency?.name || "Unknown",
                symbol: chain.metamask?.nativeCurrency?.symbol || "UNK",
                decimals: chain.metamask?.nativeCurrency?.decimals || 18
            },
            diamondAddress: chain.diamondAddress || null  // Fetching the LiFi contract address
        }));

        // Define the file path for storing the data
        const filePath = path.join(__dirname, "../constants/chains.ts");

        // Convert data to TypeScript export format
        const fileContent = `export const chains = ${JSON.stringify(formattedChains, null, 2)};`;

        // Write to chains.ts
        fs.writeFileSync(filePath, fileContent);
        console.log("✅ Chains data saved to", filePath);
    } catch (error) {
        console.error("❌ Error fetching supported chains:", error);
    }
}

// Run the function
getSupportedChains();
