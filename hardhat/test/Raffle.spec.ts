import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { Raffle } from '../types';

describe('Raffle', function () {
  const PRICE = ethers.utils.parseEther('20');
  const ONE_DAY_IN_SECS = 24 * 60 * 60;
  const ONE_WEEK_IN_SECS = 7 * ONE_DAY_IN_SECS;
  const ONE_YEAR_IN_SECS = 365 * ONE_DAY_IN_SECS;

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployRaffleFixture() {
    const draftTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    const maxTicketAmount = 100;
    // Contracts are deployed using the first signer/account by default
    const [creator, owner, admin, user] = await ethers.getSigners();
    const Raffle = await ethers.getContractFactory('Raffle');
    const raffle = await Raffle.deploy(
      [owner.address, admin.address, owner.address, owner.address],
      draftTime,
      maxTicketAmount,
      PRICE
    );

    return { raffle, draftTime, owner, creator, user, admin, maxTicketAmount };
  }

  describe('Deployment', function () {
    describe('Validations', function () {
      it('Should set the right maxTicketAmount', async function () {
        // Arrange
        const { raffle, maxTicketAmount } = await loadFixture(deployRaffleFixture);

        // Act
        const actual = await raffle.maxTicketAmount();

        // Assert
        expect(actual).to.equal(maxTicketAmount);
      });

      it('Should set the right royalty', async function () {
        // Arrange
        const { raffle } = await loadFixture(deployRaffleFixture);

        // Act
        const actual = await raffle.royalty();

        // Assert
        expect(actual).to.equal(50);
      });

      it('Should set the right owner', async function () {
        // Arrange
        const { raffle, owner } = await loadFixture(deployRaffleFixture);

        // Act
        const actual = await raffle.owner();

        // Assert
        expect(actual).to.equal(owner.address);
      });

      it('Should set the right draftTime', async function () {
        // Arrange
        const { raffle, draftTime } = await loadFixture(deployRaffleFixture);

        // Act
        const actual = await raffle.draftTime();

        // Assert
        expect(actual).to.equal(draftTime);
      });

      it('Should set the right nextDraftDuration', async function () {
        // Arrange
        const { raffle } = await loadFixture(deployRaffleFixture);
        const nextDraftDuration = 7 * 24 * 60 * 60;
        // Act
        const actual = await raffle.nextDraftDuration();

        // Assert
        expect(actual).to.equal(nextDraftDuration);
      });
    });

    describe('Incorrect inputs', function () {
      it('Should fail if the draftTime is not in the future', async function () {
        // Arrange
        const latestTime = await time.latest();
        const raffle = await ethers.getContractFactory('Raffle');
        const { owner, admin } = await loadFixture(deployRaffleFixture);
        // Act
        const actual = raffle.deploy([owner.address, admin.address], latestTime, 1000, PRICE);

        // Assert
        await expect(actual).to.be.revertedWith('Draft end time should be in the future');
      });
    });
  });

  describe('Owner', function () {
    it('Should be in a valid state after valid transactions', async function () {
      // Arrange 1
      const { raffle, owner, maxTicketAmount } = await loadFixture(deployRaffleFixture);
      const ticketIds = [1];

      // Act 1
      await raffle.connect(owner).purchase(ticketIds, { value: PRICE });
      await raffle.connect(owner).endRaffleAdmin();

      // Assert 1
      const actual = await raffle.maxTicketAmount();
      expect(actual).to.equal(maxTicketAmount + 1);
    });

    it('Should be not change if no tickets have been bought', async function () {
      // Arrange 1
      const { raffle, owner, maxTicketAmount } = await loadFixture(deployRaffleFixture);

      // Act 1
      await raffle.connect(owner).endRaffleAdmin();
      const actual = await raffle.maxTicketAmount();

      // Assert 1
      expect(actual).to.equal(maxTicketAmount);
    });
  });

  describe('Purchases', function () {
    describe('Validations', function () {
      it('Should be in a valid state after valid round', async function () {
        // Arrange 1
        const { raffle } = await loadFixture(deployRaffleFixture);
        const ticketIds1 = [1];
        const account1 = (await ethers.getSigners())[1];
        const address1 = account1.address;

        // Act 1
        await raffle.connect(account1).purchase(ticketIds1, { value: PRICE });

        // Assert 1
        await expect(await ethers.provider.getBalance(raffle.address)).to.equal(PRICE);
        await checkPlayerBoughtTickets(address1, ticketIds1, raffle);
        await checkTicketsAddress(address1, ticketIds1, raffle);
        expect(await raffle.currTicketAmount()).to.equal(1);

        // Arrange 2
        const ticketIds2 = [2, 3, 4, 5];
        const priceFourTickets = PRICE.mul(BigNumber.from(4));
        const account2 = (await ethers.getSigners())[2];
        const address2 = account2.address;

        // Act 2
        await raffle.connect(account2).purchase(ticketIds2, { value: priceFourTickets });

        // Assert 2
        await expect(await ethers.provider.getBalance(raffle.address)).to.equal(PRICE.add(priceFourTickets));
        await checkPlayerBoughtTickets(address2, ticketIds2, raffle);
        await checkTicketsAddress(address2, ticketIds2, raffle);
        expect(await raffle.currTicketAmount()).to.equal(5);
      });

      it('Should successfully transfer funds to winner and owner when the draft is completed', async function () {
        // Arrange
        this.retries(3);
        const Raffle = await ethers.getContractFactory('Raffle');
        const ticketAmount = 20;
        const ticketIds = new Array(ticketAmount).fill(0).map((_, i) => i + 1);
        const totalPrice = PRICE.mul(ticketAmount);
        const ownerFees = totalPrice.mul(50).div(1000);
        const winnerCut = totalPrice.sub(ownerFees);
        const account1 = (await ethers.getSigners())[1];
        const account2 = (await ethers.getSigners())[2];
        const account3 = (await ethers.getSigners())[3];
        const raffle = await Raffle.connect(account1).deploy(
          [account1.address, account1.address],
          (await time.latest()) + ONE_YEAR_IN_SECS,
          ticketAmount,
          PRICE
        );

        // Act
        await raffle.connect(account2).purchase(ticketIds.slice(1), { value: PRICE.mul(ticketAmount - 1) });
        const account1Balance = await ethers.provider.getBalance(account1.address);
        const account2Balance = await ethers.provider.getBalance(account2.address);

        // Buy last ticket + check RaffleEnd event is emitted.
        expect(await raffle.connect(account3).purchase([1], { value: PRICE })).to.emit(raffle, 'RaffleEnd');
        const expectedNewDraftTime = (await time.latest()) + ONE_WEEK_IN_SECS;

        // Assert
        expect(await ethers.provider.getBalance(account1.address)).to.eql(account1Balance.add(ownerFees));
        expect(await ethers.provider.getBalance(account2.address)).to.eql(account2Balance.add(winnerCut));
        // await checkPlayerBoughtTickets(address1, ticketIds1, raffle);
        // await checkTicketsAddress(address1, ticketIds1, raffle);
        expect(await raffle.currTicketAmount()).to.equal(0);
        expect(await (await raffle.getTicketsBought()).length).to.equal(0);
        expect(await (await raffle.getRaffleHistory()).length).to.equal(1);
        expect(await raffle.maxTicketAmount()).to.equal(ticketAmount + 1);
        expect(await raffle.ticketPrice()).to.equal(PRICE);
        expect(await raffle.draftTime()).to.be.lte(expectedNewDraftTime);
      });
    });

    describe('Invalid inputs', function () {
      it('Should revert if transaction value does not match ticket price and number of tickets to be bought', async function () {
        // Arrange
        const { raffle } = await loadFixture(deployRaffleFixture);

        // Act
        const actual = raffle.purchase([1, 2, 3], { value: PRICE });

        // Assert
        await expect(actual).to.be.revertedWith(
          'Transaction value should match ticket price and number of tickets to be bought'
        );
      });

      it('Should revert if transaction is after the draft is completed', async function () {
        // Arrange
        const { raffle, draftTime } = await loadFixture(deployRaffleFixture);
        await ethers.provider.send('evm_mine', [draftTime + 60]);

        // Act
        const actual = raffle.purchase([1], { value: PRICE });

        // Assert
        await expect(actual).to.be.revertedWith("Can't buy ticket after raffle draft time has passed");
      });

      it('Should revert if ticket is already bought', async function () {
        // Arrange
        const { raffle } = await loadFixture(deployRaffleFixture);
        raffle.purchase([1], { value: PRICE });

        // Act
        const actual = raffle.purchase([1], { value: PRICE });

        // Assert
        await expect(actual).to.be.revertedWith('Ticket already sold');
      });

      it('Should revert if ticket id is not valid', async function () {
        // Arrange
        const { raffle, maxTicketAmount } = await loadFixture(deployRaffleFixture);

        // Act
        const actual = raffle.purchase([1, 2, 3, maxTicketAmount + 1], {
          value: PRICE.mul(BigNumber.from(4)),
        });

        // Assert
        await expect(actual).to.be.revertedWith('Invalid ticketId');
      });
    });
    describe('Events', function () {
      it('Should emit an event on purchase', async function () {
        // Arrange
        const { raffle } = await loadFixture(deployRaffleFixture);
        const ticketIds = [1];

        // Act + Assert
        await expect(raffle.purchase(ticketIds, { value: PRICE }))
          .to.emit(raffle, 'PurchasedTickets')
          .withArgs('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', ticketIds);
      });
    });
  });

  describe('Lifecycle', function () {
    describe('setRoyalty', function () {
      describe('Validations', function () {
        it('Should set the right royalty', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);
          const newRoyalty = 100;

          // Act
          await raffle.connect(admin).setRoyalty(newRoyalty);

          // Assert
          const actual = await raffle.royalty();
          expect(actual).to.equal(newRoyalty);
        });
      });
      describe('Invalid inputs', function () {
        it('Should revert when royalty is above 100%', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);

          // Act
          const actual = raffle.connect(admin).setRoyalty(1001);

          // Assert
          await expect(actual).to.be.revertedWith('Royalty should be less than or equal to 1000');
        });
        it('Should revert when royalty is under 0%', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);

          // Act
          const actual = raffle.connect(admin).setRoyalty(-1);

          // Assert
          expect(actual).to.be.revertedWithPanic();
        });
      });
    });

    describe('setNextRaffleTicketPrice', function () {
      describe('Validations', function () {
        it('Should set the right nextRaffleTicketPrice', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);
          const newNextRaffleTicketPrice = 1234;

          // Act
          await raffle.connect(admin).setNextRaffleTicketPrice(newNextRaffleTicketPrice);

          // Assert
          const actual = await raffle.nextRaffleTicketPrice();
          expect(actual).to.equal(newNextRaffleTicketPrice);
        });
      });
      describe('Invalid inputs', function () {
        it('Should revert when nextRaffleTicketPrice is under 0', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);

          // Act
          const actual = raffle.connect(admin).setNextRaffleTicketPrice(-1);

          // Assert
          expect(actual).to.be.revertedWithPanic();
        });
      });
    });

    describe('setNextRaffleMaxTicketAmount', function () {
      describe('Validations', function () {
        it('Should set the right nextRaffleMaxTicketAmount', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);
          const newNextRaffleMaxTicketAmount = 1234;

          // Act
          await raffle.connect(admin).setNextRaffleMaxTicketAmount(newNextRaffleMaxTicketAmount);

          // Assert
          const actual = await raffle.nextRaffleMaxTicketAmount();
          expect(actual).to.equal(newNextRaffleMaxTicketAmount);
        });
      });
      describe('Invalid inputs', function () {
        it('Should revert when nextRaffleMaxTicketAmount is under 0', async function () {
          // Arrange
          const { raffle } = await loadFixture(deployRaffleFixture);

          // Act
          const actual = raffle.setNextRaffleMaxTicketAmount(-1);

          // Assert
          expect(actual).to.be.revertedWithPanic();
        });
      });
    });

    describe('setNextDraftDuration', function () {
      describe('Validations', function () {
        it('Should set the right nextDraftDuration', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);
          const newNextDraftDuration = 1234;

          // Act
          await raffle.connect(admin).setNextDraftDuration(newNextDraftDuration);

          // Assert
          const actual = await raffle.nextDraftDuration();
          expect(actual).to.equal(newNextDraftDuration);
        });
      });
      describe('Invalid inputs', function () {
        it('Should revert when nextDraftDuration is under 0', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);

          // Act
          const actual = raffle.connect(admin).setNextDraftDuration(-1);

          // Assert
          expect(actual).to.be.revertedWithPanic();
        });
      });
    });

    describe('resetCurrentDraftDurationFromNow', function () {
      describe('Validations', function () {
        it('Should set the right draftTime', async function () {
          // Arrange
          const { raffle, admin } = await loadFixture(deployRaffleFixture);
          const currentDraftDurationFromNow = 1000;

          // Act
          await raffle.connect(admin).resetCurrentDraftDurationFromNow(currentDraftDurationFromNow);

          // Assert
          const actual = await raffle.draftTime();
          const expected = (await time.latest()) + currentDraftDurationFromNow;
          expect(actual).to.be.lte(expected);
        });
      });
      describe('Invalid inputs', function () {
        it('Should revert when draftTime is under 0', async function () {
          // Arrange
          const { raffle } = await loadFixture(deployRaffleFixture);

          // Act
          const actual = raffle.resetCurrentDraftDurationFromNow(-1);

          // Assert
          expect(actual).to.be.revertedWithPanic();
        });
      });
    });
  });
});

function checkTicketsAddress(address: string, ticketIds: number[], raffle: Raffle) {
  return Promise.all(
    ticketIds.map(async (ticketId) => await expect(await raffle.ticketsOwner(ticketId)).to.eql(address))
  );
}

function checkPlayerBoughtTickets(address: string, ticketIds: number[], raffle: Raffle) {
  return Promise.all(
    ticketIds.map(
      async (ticketId, i) =>
        await expect(await raffle.ticketsBoughtByPlayer(address, i)).to.eql(BigNumber.from(ticketId))
    )
  );
}
