/// <reference types="cypress" />

describe('TIC TAC TOE GAME', () => {
  const p1testname = 'Alice'
  const p2testname = 'Bob'
  beforeEach(() => {
    localStorage.setItem('credentials', JSON.stringify({username: 'acrenwelge', pw: 'myrandompassword'}));
    cy.visit('http://localhost:3000/')
    cy.contains('Game').click()
  })
  it('should start the game after player names entered', () => {
    cy.get('.MuiInputBase-input').first().type(p1testname)
    cy.get('.MuiInputBase-input').last().type(p2testname)
    cy.get('[data-testid=p1isx]').click()
    cy.contains('Start').click()
  })
  it('should not start the game if player names are not entered', () => {
    cy.get('[data-testid=p1isx]').click()
    cy.contains('Start').click()
    cy.get('[data-testid=form-error-alert]').should('exist')
  })
  it('should not allow two players of the same name', () => {
    cy.get('.MuiInputBase-input').first().type(p1testname)
    cy.get('.MuiInputBase-input').last().type(p1testname)
    cy.contains('Start').click()
    cy.get('[data-testid=form-error-alert]').should('exist')
  })
  context('with a started game', () => {
    beforeEach(() => {
      cy.get('.MuiInputBase-input').first().type(p1testname)
      cy.get('.MuiInputBase-input').last().type(p2testname)
      // player 1 is X, should already be checked by default
      cy.get('[data-testid=p1isx] input').should('be.checked')
      cy.contains('Start').click()
    })
    it('should display the player names', () => {
      cy.contains(`${p1testname} vs ${p2testname}`)
    })
    it('should display the move history', () => {
      cy.get('.game-info ol li').should('have.length', 1) // 'Go to game start'
      cy.get('.game-board > :nth-child(1) > :nth-child(1) > :nth-child(1)').click()
      cy.get('.game-info ol li').should('have.length', 2)
      cy.get('.game-board > :nth-child(1) > :nth-child(2) > :nth-child(1)').click()
      cy.get('.game-info ol li').should('have.length', 3)
    })
    it('should return to a previous move', () => {
      cy.get('.game-board > :nth-child(1) > :nth-child(1) > :nth-child(1)').click()
      cy.get('.game-board > :nth-child(1) > :nth-child(2) > :nth-child(1)').click()
      cy.get('.game-info ol li').first().click() // click on 'Go to game start'
      cy.get('.game-info ol li').should('have.length', 1)
    })
    it('should not allow a player to play on a played cell', () => {
      cy.get('.game-board > :nth-child(1) > :nth-child(1) > :nth-child(1)').click()
      cy.get('.game-info ol li').should('have.length', 2)
      cy.get('.game-board > :nth-child(1) > :nth-child(1) > :nth-child(1)').click()
      cy.get('.game-info ol li').should('have.length', 2) // history length should not change
    })
    context('with a completed game', () => {
      it('should display the winner after someone wins', () => {
        // p1 is X and goes first
        cy.get('.game-board > :nth-child(1) > :nth-child(1) > :nth-child(1)').click() // X plays (0,0)
        cy.get('.game-board > :nth-child(1) > :nth-child(1) > :nth-child(2)').click() // O plays (0,1)
        cy.get('.game-board > :nth-child(1) > :nth-child(2) > :nth-child(1)').click() // X plays (1,0)
        cy.get('.game-board > :nth-child(1) > :nth-child(2) > :nth-child(2)').click() // O plays (1,1)
        cy.get('.game-board > :nth-child(1) > :nth-child(3) > :nth-child(1)').click() // X plays (2,0)
        cy.contains(`The winner is ${p1testname} (X)`)
      })
      it.skip('should highlight the winner board cells', () => {
      })
      it.skip('should display a draw if no one wins', () => {
      })
    })
    
  })
})