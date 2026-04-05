/// <reference types="cypress" />

const USERNAME = 'miketabb33+mytradingcardworthtest@gmail.com'
const PASSWORD = 'r3dGre3NRef@cTor'

describe('e2e', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/catalog')
  })

  it('e2e', () => {
    // Search Expansion
    cy.get('#NoExpansionSelected').contains('Choose Your Expansion')
    cy.get('#CatalogAutocomplete:not([disabled])').type('Twilight')

    cy.get('#CatalogAutocomplete-0').click()

    cy.get('#ExpansionTitle').should('have.text', 'Scarlet & Violet - Twilight Masquerade Expansion')

    // Logged out collection
    cy.get('#NavCollection').click()
    cy.contains('h2', 'Your Collection Awaits')
    cy.get('#NavCatalog').click()

    loginInWith(USERNAME, PASSWORD)

    // Go to Collection and back
    cy.get('#NavCollection').click()
    cy.contains('h2', 'Your Collection is Empty')
    cy.get('#CollectionCatalogLink').click()
    cy.get('#ExpansionTitle').should('have.text', 'Scarlet & Violet - Twilight Masquerade Expansion')

    // Add/Remove card
    cy.get('#CardListSearch').type('abra')
    cy.contains('[id^="CardListItem-"]', 'Abra').then(($card) => {
      const id = $card.attr('id')!
      cy.get(`#${id}`).contains('Abra')
      cy.get(`#${id}`).contains('Owned: 0')
      cy.get(`#${id}`).contains('Add').click()
      cy.get(`#${id}`).contains('Owned: 1')
      cy.get(`#${id}`).contains('Remove').click()
      cy.get(`#${id}`).contains('Owned: 0')
      cy.get(`#${id}`).contains('Add').click()
      cy.get(`#${id}`).contains('Owned: 1')
    })

    // Add card in collection and check median price
    cy.get('#NavCollection').click()

    cy.get('#CollectionTotalMedianValue')
      .invoke('text')
      .should('match', /^\$\d+\.\d{2}$/)

    cy.contains('Abra')
      .closest('[id^="CardListItem-"]')
      .then(($card) => {
        const id = $card.attr('id')!
        cy.get(`#${id}`).within(() => {
          cy.contains('Owned: 1')
          cy.contains('Add').click()
        })
        cy.get(`#${id}`).contains('Owned: 2')
      })

    cy.get('#CollectionTotalMedianValue')
      .invoke('text')
      .should('match', /^\$\d+\.\d{2}$/)

    // Search another expansion
    cy.get('#NavCatalog').click()

    cy.get('#CatalogAutocomplete input').clear().type('Temp')

    cy.get('#CatalogAutocomplete-0').click()

    cy.get('#ExpansionTitle').should('have.text', 'Scarlet & Violet - Temporal Forces Expansion')

    // Add another Card
    cy.get('#CardListSearch').type('Torterra ex')
    cy.get('[id^="CardListItem-"]')
      .first()
      .then(($card) => {
        const id = $card.attr('id')!
        cy.get(`#${id}`).within(() => {
          cy.contains('Owned: 0')
          cy.contains('Add').click()
        })
        cy.get(`#${id}`).contains('Owned: 1')
      })

    // Verify amounts in collection
    cy.get('#NavCollection').click()
    cy.get('#CollectionTotalMedianValue')
      .invoke('text')
      .should('match', /^\$\d+\.\d{2}$/)

    // Remove cards
    cy.contains('Torterra ex').closest('[id^="CardListItem-"]').contains('Remove').click()

    cy.contains('Abra').closest('[id^="CardListItem-"]').contains('Remove').click()

    cy.wait(3000)

    cy.contains('Abra').closest('[id^="CardListItem-"]').contains('Remove').click()
    cy.contains('h2', 'Your Collection is Empty')
  })
})

const loginInWith = (username: string, password: string) => {
  cy.get('#LoginButton').click()

  const args = { username, password }
  cy.origin('https://tcgvalor.us.auth0.com/', { args }, ({ username, password }) => {
    cy.get('#username').type(username)
    cy.get('#password').type(password)
    cy.get('form').first().submit()
  })
  cy.get('#NavNameTag').contains('Hi, ')
}
