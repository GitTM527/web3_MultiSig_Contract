import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TobiXIModule = buildModule("TobiXIModule", (m) => {

    const erc20 = m.contract("TobiXI");

    return { erc20 };
});

export default TobiXIModule;