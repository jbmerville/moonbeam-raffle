/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Coin Flip', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads table with transaction history', () => {
    waitForCoinFlipData();

    // Check that the table is populated and has 10 elements
    cy.get('[data-cy="table-body"]').find('tr').should('have.length', 10);
  });

  it('click on the read the rules button', () => {
    waitForCoinFlipData();

    // Click read the rules button
    cy.get('[data-cy="info-card"]').eq(2).click();
    // Check the pop up is visible
    cy.get('[data-cy="pop-up"]').should('be.visible');
  });
});

function waitForCoinFlipData() {
  // Wait for moonscan request to read sc transaction history
  cy.intercept(
    'https://api-moonbeam.moonscan.io/api?module=account&action=txlist&address=0x830FAAc9f608eaE8B9C3d0B907DED7478Bb45221'
  ).as('moonscan');
  // Wait for rpc request to read sc transaction outcome history
  cy.intercept('https://rpc.api.moonbeam.network/').as('rpc');
  cy.wait(['@moonscan', '@rpc'], { timeout: 15_000 });
}
