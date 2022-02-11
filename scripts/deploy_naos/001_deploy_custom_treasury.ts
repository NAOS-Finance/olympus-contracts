import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, ADDRESS_BOOK } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const { chainId } = await ethers.provider.getNetwork();
    const addressBook = ADDRESS_BOOK[chainId];

    if (!addressBook.NAOS) {
        throw new Error('Please setup NAOS token address first.');
    }

    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.customTreasury, {
        from: deployer,
        args: [addressBook.NAOS, authorityDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.customTreasury, "treasury"];

export default func;
