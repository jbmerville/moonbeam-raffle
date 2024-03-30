import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

describe('CoinFlip', function () {
  const DEFAULT_SC_BALANCE = ethers.utils.parseEther('20');

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCoinFlipFixture() {
    // Contracts are deployed using the first signer/account by default
    const [creator, owner, admin, user] = await ethers.getSigners();
    const CoinFlip = await ethers.getContractFactory('CoinFlip');
    const coinFlip = await CoinFlip.deploy([owner.address, admin.address, owner.address, owner.address]);
    await coinFlip.connect(owner).loadFunds({
      value: DEFAULT_SC_BALANCE,
    });

    return { coinFlip, owner, creator, user, admin };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      // Arrange
      const { coinFlip, owner } = await loadFixture(deployCoinFlipFixture);

      // Act
      const actual = await coinFlip.connect(owner).owner();

      // Assert
      expect(actual).to.equal(owner.address);
    });

    it('Should set the right royalties', async function () {
      // Arrange
      const { coinFlip } = await loadFixture(deployCoinFlipFixture);

      // Act
      const actual = await coinFlip.royalty();

      // Assert
      expect(actual).to.equal(35);
    });

    it('Should set the right roundId', async function () {
      // Arrange
      const { coinFlip } = await loadFixture(deployCoinFlipFixture);

      // Act
      const actual = await coinFlip.roundId();

      // Assert
      expect(actual).to.equal(BigNumber.from(0));
    });
  });

  describe('Owner', function () {
    describe('Add', function () {
      it('Should let owner withdray funds', async function () {
        // Arrange
        const { coinFlip, owner } = await loadFixture(deployCoinFlipFixture);

        // Act
        await coinFlip.connect(owner).loadFunds({ value: DEFAULT_SC_BALANCE.div(10) });

        // Assert
        const actual = await ethers.provider.getBalance(coinFlip.address);
        expect(actual).to.equal(DEFAULT_SC_BALANCE.add(DEFAULT_SC_BALANCE.div(10)));
      });
    });
    describe('Withdraw', function () {
      it('Should let owner withdray funds', async function () {
        // Arrange
        const { coinFlip, owner } = await loadFixture(deployCoinFlipFixture);

        // Act
        await coinFlip.connect(owner).withdraw(DEFAULT_SC_BALANCE.div(10));

        // Assert
        const actual = await ethers.provider.getBalance(coinFlip.address);
        expect(actual).to.equal(DEFAULT_SC_BALANCE.sub(DEFAULT_SC_BALANCE.div(10)));
      });
    });
  });

  describe('Admin', function () {
    describe('Add', function () {
      it('Should let admin add funds', async function () {
        // Arrange
        const { coinFlip, admin } = await loadFixture(deployCoinFlipFixture);

        // Act
        await coinFlip.connect(admin).loadFunds({ value: DEFAULT_SC_BALANCE.div(10) });

        // Assert
        const actual = await ethers.provider.getBalance(coinFlip.address);
        expect(actual).to.equal(DEFAULT_SC_BALANCE.add(DEFAULT_SC_BALANCE.div(10)));
      });

      it('Should not let non-admin add funds', async function () {
        // Arrange
        const { coinFlip, user } = await loadFixture(deployCoinFlipFixture);

        // Act
        const actual = coinFlip.connect(user).loadFunds({ value: DEFAULT_SC_BALANCE.div(10) });

        // Assert
        await expect(actual).to.be.revertedWith('Caller is not an admin');
      });
    });

    describe('Withdraw', function () {
      it('Should let admin withdraw funds', async function () {
        // Arrange
        const { coinFlip, admin } = await loadFixture(deployCoinFlipFixture);

        // Act
        await coinFlip.connect(admin).withdraw(DEFAULT_SC_BALANCE.div(10));

        // Assert
        const actual = await ethers.provider.getBalance(coinFlip.address);
        expect(actual).to.equal(DEFAULT_SC_BALANCE.sub(DEFAULT_SC_BALANCE.div(10)));
      });

      it('Should not let non-admin withdraw funds', async function () {
        // Arrange
        const { coinFlip, user } = await loadFixture(deployCoinFlipFixture);

        // Act
        const actual = coinFlip.connect(user).withdraw(DEFAULT_SC_BALANCE.div(10));

        // Assert
        await expect(actual).to.be.revertedWith('Caller is not an admin');
      });
    });
  });

  describe('Flip', function () {
    describe('Validations', function () {
      it('Should revert if transaction value is lower than minimum required', async function () {
        // Arrange
        const { coinFlip } = await loadFixture(deployCoinFlipFixture);

        // Act
        const actual = coinFlip.flip(true, { value: 0 });

        // Assert
        await expect(actual).to.be.revertedWith('Transaction value should be greater than 0');
      });

      it('Should revert if transaction value is greater than maximum required', async function () {
        // Arrange
        const { coinFlip } = await loadFixture(deployCoinFlipFixture);

        // Act
        const actual = coinFlip.flip(true, {
          value: DEFAULT_SC_BALANCE.div(4),
        });

        // Assert
        await expect(actual).to.be.revertedWith(
          'Transaction value should be lesser than maxPoolBetRatio of the contracts balance'
        );
      });

      it('Should update states after flip transaction', async function () {
        // Arrange 1
        const { coinFlip } = await loadFixture(deployCoinFlipFixture);

        // Act 1
        await coinFlip.flip(true, { value: ethers.utils.parseEther('1') });

        // Assert 1
        expect(await coinFlip.roundId()).to.eql(BigNumber.from(1));
      });

      it('Should send rewards to player after wining transaction', async function () {
        // Arrange
        const { coinFlip, owner, user } = await loadFixture(deployCoinFlipFixture);

        await ethers.provider.send('evm_setNextBlockTimestamp', [1798148180]);
        await ethers.provider.send('evm_mine', []);
        const account1Balance = await ethers.provider.getBalance(user.address);
        const betAmount = ethers.utils.parseEther('4');
        const ownerFees = betAmount.mul(35).div(1000);
        const ownerBalance = await ethers.provider.getBalance(owner.address);

        // Act
        await coinFlip.connect(user).flip(true, { value: betAmount });

        // Assert
        expect(
          account1Balance.add(betAmount.sub(ownerFees)).sub(await ethers.provider.getBalance(user.address))
        ).to.lte(ethers.utils.parseEther('0.001'));

        expect(ownerBalance.add(ownerFees).sub(await ethers.provider.getBalance(owner.address))).to.lte(
          ethers.utils.parseEther('0.001')
        );
      });

      it('Should lose sending opposite tx', async function () {
        // Arrange
        const { coinFlip, owner, user } = await loadFixture(deployCoinFlipFixture);

        await ethers.provider.send('evm_setNextBlockTimestamp', [1798148180]);
        await ethers.provider.send('evm_mine', []);
        const account1Balance = await ethers.provider.getBalance(user.address);
        const betAmount = ethers.utils.parseEther('4');
        const ownerFees = betAmount.mul(35).div(1000);
        const ownerBalance = await ethers.provider.getBalance(owner.address);

        // Act
        await coinFlip.connect(user).flip(false, { value: betAmount });

        // Assert
        expect(account1Balance.sub(betAmount).sub(await ethers.provider.getBalance(user.address))).to.lte(
          ethers.utils.parseEther('0.001')
        );

        expect(ownerBalance.add(ownerFees).sub(await ethers.provider.getBalance(owner.address))).to.lte(
          ethers.utils.parseEther('0.001')
        );
      });

      it('Should not send rewards to player after losing transaction', async function () {
        // Arrange
        const { coinFlip, owner, user } = await loadFixture(deployCoinFlipFixture);

        await ethers.provider.send('evm_setNextBlockTimestamp', [1986138080]);
        await ethers.provider.send('evm_mine', []);
        const account1Balance = await ethers.provider.getBalance(user.address);
        const betAmount = ethers.utils.parseEther('4');
        const ownerFees = betAmount.mul(35).div(1000);
        const ownerBalance = await ethers.provider.getBalance(owner.address);

        // Act
        await coinFlip.connect(user).flip(true, { value: betAmount });

        // Assert
        expect(account1Balance.sub(betAmount).sub(await ethers.provider.getBalance(user.address))).to.lte(
          ethers.utils.parseEther('0.001')
        );

        expect(ownerBalance.add(ownerFees).sub(await ethers.provider.getBalance(owner.address))).to.lte(
          ethers.utils.parseEther('0.001')
        );
      });
    });

    describe('Events', function () {
      it('Should emit an event on flip', async function () {
        // Arrange
        const { coinFlip } = await loadFixture(deployCoinFlipFixture);

        // Act + Assert
        await expect(coinFlip.flip(true, { value: ethers.utils.parseEther('1') })).to.emit(coinFlip, 'Flip');
      });
    });
  });
});
