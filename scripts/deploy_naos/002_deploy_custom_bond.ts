import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, ADDRESS_BOOK } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const { chainId } = await ethers.provider.getNetwork();
    const addressBook = ADDRESS_BOOK[chainId];

    if (!addressBook.NAOS || !addressBook.LP) {
        throw new Error('Please setup NAOS and LP token address first.');
    }

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const treasuryDeployment = await deployments.get(CONTRACTS.customTreasury);

    await deploy(CONTRACTS.customBond, {
        from: deployer,
        args: [treasuryDeployment.address, addressBook.NAOS, addressBook.LP, authorityDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.customBond, "bonding"];
func.dependencies = [CONTRACTS.customTreasury];

export default func;
