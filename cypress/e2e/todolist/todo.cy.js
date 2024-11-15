/// <reference types="cypress" />

describe('My ToDo app', () => {
  const listitems = '.todo-list li'
  beforeEach(() => {
    localStorage.setItem('credentials', JSON.stringify({username: 'acrenwelge', pw: 'myrandompassword'}));
    cy.task('db:reset');
    cy.task('db:seed');
    cy.visit('http://localhost:3000/')
    cy.contains('Todos').click()
  })

  it('displays at least 1 item by default', () => {
    cy.get(listitems).should('have.length.greaterThan', 0)
  })

  it('can add new todo items', () => {
    const newItem = 'Buy groceries'
    cy.get(listitems).its('length').then(numItemsBefore => {
      cy.get('[data-testid="add-item"]').click()
      cy.get(listitems).its('length').then(numItemsAfter => {
        expect(numItemsAfter).to.equal(numItemsBefore + 1)
        cy.get(listitems).last().find('[data-testid="item-text"]').type(newItem)
        console.log(cy.get(listitems).last().find('[data-testid="item-text"]'))
        // cy.get(listitems).last().find('[data-testid="item-text"]').should('have.value', newItem)
      })
    })
  })

  it('can check off an item as completed', () => {
    cy.get(`${listitems} textarea`).then(($textareas) => {
      const targetTextBox = $textareas.filter((index, element) => 
        element.value.includes('First task')
      );
      const li = cy.wrap(targetTextBox).parents('li')
      li.find('input[type=checkbox]').check()
      cy.get(`${listitems} textarea`).then(($textareas) => {
        const newTarget = $textareas.filter((index, element) =>
          element.value.includes('First task')
        );
        cy.wrap(newTarget).then(($el) => {
          expect($el).to.have.class('item-done')
        })
      });
    })
  })

  it('can check an item using SHIFT + ENTER', () => {
    cy.get(`${listitems} textarea`).then(($textareas) => {
      return cy.wrap($textareas.filter((index, element) => 
        element.value.includes('First task')
      ));
    }).then((targetTextBox) => {
      const targetCheckbox = cy.wrap(targetTextBox.parents('li').find('input[type=checkbox]'))
      targetCheckbox.should('not.be.checked')
      cy.wrap(targetTextBox).type('{shift}{enter}')
      cy.wrap(targetTextBox.parents('li').find('input[type=checkbox]')).should('be.checked')
    })
  })

  it('can uncheck an item', () => {
    cy.get(`${listitems} textarea`).then(($textareas) => {
      return cy.wrap($textareas.filter((index, element) => 
        element.value.includes('Completed task')
      ));
    }).then((targetTextBox) => {
      cy.wrap(targetTextBox.parents('li').find('input[type=checkbox]')).should('be.checked')
        .uncheck()
      cy.wrap(targetTextBox.parents('li').find('input[type=checkbox]')).should('not.be.checked')
    })
  })

  it('can edit an item', () => {
    const newItem = 'Write a React app'
    cy.get(`${listitems} textarea`).then(($textareas) => {
      return cy.wrap($textareas.filter((index, element) => 
        element.value.includes('First task')
      ));
    }).then((targetTextBox) => {
      cy.wrap(targetTextBox).clear().type(`${newItem}{enter}`).as('editedItem')
      cy.get('@editedItem').should('have.value', newItem)
    })
  })

  it('can view item details with ctrl + enter', () => {
    cy.get(`${listitems} textarea`).then(($textareas) => {
      return cy.wrap($textareas.filter((index, element) => 
        element.value.includes('First task')
      ));
    }).then((targetTextBox) => {
      cy.wrap(targetTextBox).type('{ctrl}{enter}')
      cy.get('[data-testid="item-detail"]').should('exist')
    })
  })

  context('with detail view open', () => {
    beforeEach(() => {
      cy.get('div.MuiGrid2-root:nth-child(3) > a:nth-child(3) > button:nth-child(1)').click()
    })

    it('can navigate to previous and next items', () => {
      cy.contains('Previous').should('not.exist')
      cy.contains('Next').click()
      cy.contains('Previous').should('exist').click()
    })

    it('can edit an item from the detail view', () => {
      cy.get('[data-testid="completion-status"]').invoke('text').then((oldText) => {
        cy.get('[data-testid="completion-status"]').click().invoke('text').then((newText) => {
          if (oldText === 'Status: Pending') {
            expect(newText).to.equal('Status: Completed')
          } else {
            expect(newText).to.equal('Status: Pending')
          }
        })
      })
      cy.contains('Next').click()
      cy.contains('Previous').click()
    })

    it.skip('can delete an item from the detail view', () => {
      
    })
  });

  it('should sort items by priority ascending', () => {
    cy.get('#sort-select').click()
    cy.get('[data-value*=Priority]').click()
    cy.get(listitems).first().find('textarea').should('have.value', 'First task')
  })

  it('should sort items by priority descending', () => {
    cy.get('#sort-select').click()
    cy.get('[data-value*=Priority]').click()
    // sort descending
    cy.get('.MuiSwitch-root > .MuiButtonBase-root > .PrivateSwitchBase-input').click()
    cy.get(listitems).first().find('textarea').should('have.value', 'Low priority task')
    cy.get(listitems).last().find('textarea').should('have.value', 'First task')
  })

  context('with all tasks completed', () => {
    beforeEach(() => { // check off all the items
      cy.get(listitems)
        .parents()
        .find('input[type=checkbox]')
        .check()
    })

    it('can hide and show all completed tasks', () => {
      cy.get('#filter-select').click()
      cy.get('[data-value=incomplete]').click()
      // There should be no incomplete items in the list.
      cy.get('.todo-list').should('not.have.descendants', 'li')
      cy.get('#filter-select').click()
      cy.get('[data-value=complete]').click()
      // There should be at least one completed item in the list.
      cy.get(listitems).should('not.have.length', 0)
    })

    it('can delete all completed tasks', () => {
      cy.contains('Delete All Completed').click()
      cy.get(listitems).should('not.exist')
    })

  })
})
