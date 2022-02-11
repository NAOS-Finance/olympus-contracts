import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { waitFor } from "../txHelper";
import { CONTRACTS, INITIAL_REWARD_RATE, INITIAL_INDEX, BOUNTY_AMOUNT } from "../constants";
import {
    OlympusAuthority__factory,
    CustomTreasury__factory,
    CustomBond__factory,
} from "../../types";

// TODO: Shouldn't run setup methods if the contracts weren't redeployed.
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { BigNumber } = ethers;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const treasuryDeployment = await deployments.get(CONTRACTS.customTreasury);
    const bondDeployment = await deployments.get(CONTRACTS.customBond);

    const authorityContract = await OlympusAuthority__factory.connect(
        authorityDeployment.address,
        signer
    );
    const treasury = CustomTreasury__factory.connect(treasuryDeployment.address, signer);
    const bond = CustomBond__factory.connect(bondDeployment.address, signer);

    // Step 1: Set treasury as vault on authority
    // await waitFor(authorityContract.pushVault(treasury.address, true));
    // console.log("Setup -- authorityContract.pushVault: set vault on authority");

    // Step 2: Initialize bond
    if ((await bond.totalDebt()).eq(0)) {
        await waitFor(bond.initializeBond(
            115000,
            46200,
            0,
            6,
            BigNumber.from("300000000000000000000"),
            BigNumber.from("134772077922077922078")));
        console.log("Setup -- bond.initializeBond");
    }

    // Step 3: Toggle bond contract
    if (!(await treasury.bondContract(bond.address))) {
        await waitFor(treasury.toggleBondContract(bond.address));
        console.log("Setup -- treasury.toggleBondContract");
    }
};

func.tags = ["setup"];
func.dependencies = [CONTRACTS.customTreasury, CONTRACTS.customBond];

export default func;
