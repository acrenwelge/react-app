/// <reference types="cypress" />

describe('TIC TAC TOE GAME', () => {
  const p1testname = 'Alice'
  const p2testname = 'Bob'
  beforeEach(() => {
    cy.clearCookies()
    localStorage.setItem('credentials', JSON.stringify({username: 'acrenwelge', pw: 'myrandompassword'}));
    cy.visit('http://localhost:3000/')
    cy.contains('Game').click()
  })
  function enterNames() {
    cy.get('[data-testid=p1-name]').first().type(p1testname)
    cy.get('[data-testid=p2-name]').last().type(p2testname)
  }
  it('should start the game after player names entered', () => {
    enterNames()
    cy.get('[data-testid=p1isx]').click()
    cy.contains('Start').click()
  })
  it('should not start the game if player names are not entered', () => {
    cy.get('[data-testid=p1isx]').click()
    cy.contains('Start').click()
    cy.contains('New Game').should('exist')
  })
  it.only('should not allow two players of the same name', () => {
    cy.get('[data-testid=p1-name]').first().type(p1testname)
    cy.get('[data-testid=p2-name]').last().type(p1testname)
    cy.contains('Start').click()
    cy.get('[data-testid=form-error-alert]').should('exist')
  })
  context('with a started game', () => {
    beforeEach(() => {
      enterNames()
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
      const game_board = '.game-board > :nth-child(1)'
      it('should display the winner after someone wins', () => {
        // p1 is X and goes first
        cy.get(`${game_board} > :nth-child(1) > :nth-child(1)`).click() // X plays
        cy.get(`${game_board} > :nth-child(1) > :nth-child(2)`).click() // O plays
        cy.get(`${game_board} > :nth-child(2) > :nth-child(1)`).click() // X plays
        cy.get(`${game_board} > :nth-child(2) > :nth-child(2)`).click() // O plays
        cy.get(`${game_board} > :nth-child(3) > :nth-child(1)`).click() // X plays
        cy.contains(`The winner is ${p1testname} (X)`)
      })
      it('should highlight the winner board cells', () => {
        cy.get(`${game_board} > :nth-child(1) > :nth-child(1)`).click().as('hl1') // X plays
        cy.get(`${game_board} > :nth-child(1) > :nth-child(2)`).click() // O plays
        cy.get(`${game_board} > :nth-child(2) > :nth-child(1)`).click().as('hl2') // X plays
        cy.get(`${game_board} > :nth-child(2) > :nth-child(2)`).click() // O plays
        cy.get(`${game_board} > :nth-child(3) > :nth-child(1)`).click().as('hl3') // X plays
        // each cell should have the 'hl' class for highlighting
        cy.get('@hl1').should('have.class', 'hl')
        cy.get('@hl2').should('have.class', 'hl')
        cy.get('@hl3').should('have.class', 'hl')
      })
      it('should display a draw if no one wins', () => {
        cy.get(`${game_board} > :nth-child(1) > :nth-child(1)`).click() // X plays
        cy.get(`${game_board} > :nth-child(1) > :nth-child(2)`).click() // O plays
        cy.get(`${game_board} > :nth-child(2) > :nth-child(1)`).click() // X plays
        cy.get(`${game_board} > :nth-child(2) > :nth-child(2)`).click() // O plays
        cy.get(`${game_board} > :nth-child(3) > :nth-child(2)`).click() // X plays
        cy.get(`${game_board} > :nth-child(3) > :nth-child(1)`).click() // O plays
        cy.get(`${game_board} > :nth-child(1) > :nth-child(3)`).click() // X plays
        cy.get(`${game_board} > :nth-child(3) > :nth-child(3)`).click() // O plays
        cy.get(`${game_board} > :nth-child(2) > :nth-child(3)`).click() // X plays
        cy.contains('The game is a draw!').should('exist')
      })
    })
    
  })
})