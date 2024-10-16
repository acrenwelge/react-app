/// <reference types="cypress" />

describe('My ToDo app', () => {
  const listitems = '.todo-list li'
  beforeEach(() => {
    localStorage.setItem('credentials', JSON.stringify({username: 'acrenwelge', pw: 'myrandompassword'}));
    cy.visit('http://localhost:3000/')
    cy.contains('Todos').click()
  })

  it('displays three todo items by default', () => {
    cy.get(listitems).should('have.length', 3)
    cy.get(`${listitems} input[type="text"]`).first().should('have.value', 'Do some testing')
    cy.get(`${listitems} input[type="text"]`).last().should('have.value', 'Get a job!')
  })

  it('can add new todo items', () => {
    const newItem = 'Buy groceries'
    cy.get('[data-testid="add-item"]').click()
    cy.get(listitems).last().find('input[type="text"]').type(`${newItem}`)
    cy.get(listitems)
      .should('have.length', 4)
      .last().find('input[type="text"]')
      .should('have.value', newItem)
  })

  it('can check off an item as completed', () => {
    cy.get(`${listitems} input[value*="testing"]`)
      .parents('li')
      .find('input[type=checkbox]')
      .check()

    cy.get(`${listitems} input[value*="testing"]`)
      .parents('li').find('input[type="text"]')
      .should('have.class', 'item-done')

    cy.get('[data-testid="remove-completed"] > .MuiButton-label').click()
    cy.get(`${listitems} input[value*="testing"]`).should('not.exist')
  })

  it('should sort items by priority', () => {
    cy.get('[data-testid="sort-by-priority"]').click()
    cy.get(listitems).first().find('input[type="text"]').should('have.value', 'Write a React app')
  })

  context('with all tasks completed', () => {
    beforeEach(() => { // check off all the items
      cy.get(listitems)
        .parents()
        .find('input[type=checkbox]')
        .check()
    })

    it('can hide and show all completed tasks', () => {
      let btn = cy.get('[data-testid="toggle-hide-completed"] > .MuiButton-label')
      btn.should('have.text', 'Hide Completed').click()
      // There should be no incomplete items in the list.
      cy.get('.todo-list').should('not.have.descendants', 'li')
      // refresh btn reference
      btn = cy.get('[data-testid="toggle-hide-completed"] > .MuiButton-label')
      btn.should('have.text', 'Show Completed').click()
      // There should be at least one completed item in the list.
      cy.get(listitems).should('not.have.length', 0)
    })

    it('can delete all completed tasks', () => {
      cy.get('[data-testid="remove-completed"] > .MuiButton-label').click()
      cy.get(listitems).should('not.exist')
    })

  })
})
