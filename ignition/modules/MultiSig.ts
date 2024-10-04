import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultiSigModule = buildModule("MultisigModule", (m) => {
  const _validSigners= ["0xaF0f737D7a4064a803E7714472C8618B9BdCFA83","0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2","0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db","0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB"];
  const _quorum = 4
  const multiSig = m.contract("MultiSig", [_quorum, _validSigners]);

  return { multiSig };
});

export default MultiSigModule;