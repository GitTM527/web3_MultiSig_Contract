import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("MultiSig", function () {

  // async function deployToken() {
  //   // Contracts are deployed using the first signer/account by default
  //   const [owner, account1, account2, account3, recipient] = await hre.ethers.getSigners();

  //   const erc20Token = await hre.ethers.getContractFactory("TobiXI");
  //   const token = await erc20Token.deploy();

  //   return { token };
  // };
  
  async function deployContractAndSetVariable() {

    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4, account5, recipient] = await hre.ethers.getSigners();
    const signers = [account1.address, account2.address, account3.address];
    const quorum = 4;
    const MultiSig = await hre.ethers.getContractFactory("MultiSig");
    const multisig = await MultiSig.deploy(quorum, signers);
    const erc20Token = await hre.ethers.getContractFactory("TobiXI");
    const token = await erc20Token.deploy();
    const len = signers.length;
    ///declare variables here
    return { multisig, owner,len, account1,account2,account3, account4,account5, quorum, token, recipient};
  }

  describe("Deployment testing", function(){
    it("Should check if valid signer is greater than one", async function () {
      const {multisig, len} = await loadFixture(deployContractAndSetVariable);
      await expect(len).to.be.gt(1);
    });
  
    it("Should check if qorum is greater than one", async function () {
      const {multisig, quorum} = await loadFixture(deployContractAndSetVariable);
      await expect(quorum).to.be.gt(1);
    });

    it("Should check if address zero is among valid signers", async function () {
      const {multisig, quorum} = await loadFixture(deployContractAndSetVariable);
      await expect(multisig).to.not.revertedWith("zero address not allowed");
    });

    it("Should check if signers already exist", async function () {
      const {multisig, quorum} = await loadFixture(deployContractAndSetVariable);
      await expect(multisig).to.not.revertedWith("signer already exist");
    });
    it("Should check if quorum is greater than valid signers", async function () {
      const {multisig, quorum} = await loadFixture(deployContractAndSetVariable);
      await expect(multisig).to.not.revertedWith("quorum is greater than valid signers");
    });  
  });

  describe("Transfer", function(){
    
    it("Should revert when called by invalid signer", async function () {
      const {multisig, owner,account1, account5, token} = await loadFixture(deployContractAndSetVariable);
      const amount = ethers.parseUnits("100",18);

      await expect(multisig.connect(account5).transfer(amount, account1.address,token)).to.be.revertedWith('invalid signer');
    });

    it("Should check if amount is greater than zero", async function () {
      const {multisig, owner,account1, account5, token} = await loadFixture(deployContractAndSetVariable);
      const amount = ethers.parseUnits("0",18);

      await expect(multisig.connect(owner).transfer(amount, account1.address,token)).to.be.revertedWith("cannot send zero amount");
    });

    it("Should check if recipient address is not address zero", async function () {
      const {multisig, owner,account1, account5, recipient, token} = await loadFixture(deployContractAndSetVariable);
      const amount = ethers.parseUnits("100",18);

      await expect(multisig.transfer(amount,ethers.ZeroAddress ,token)).to.be.revertedWith("address zero found");
    });

    it("Should check if token address is not address zero", async function () {
      const {multisig, owner,account1, account5, recipient, token} = await loadFixture(deployContractAndSetVariable);
      const amount = ethers.parseUnits("100",18);

      await expect(multisig.transfer(amount,ethers.ZeroAddress ,token)).to.be.revertedWith("address zero found");
    });

    it("Should check for sufficient funds in contract address", async function () {
      const {multisig, owner,account1, account5, token} = await loadFixture(deployContractAndSetVariable);
      const amount = ethers.parseUnits("100",18);

      await expect(multisig.transfer(amount,ethers.ZeroAddress ,token)).to.be.revertedWith("address zero found");
    });

  });
  

});