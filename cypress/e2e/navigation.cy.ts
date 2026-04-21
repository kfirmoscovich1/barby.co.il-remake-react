describe('Navigation', () => {
    it('shows 404 page for unknown routes', () => {
        cy.visit('/this-page-does-not-exist', { failOnStatusCode: false })
        cy.contains(/404|העמוד לא נמצא/i).should('be.visible')
    })

    it('404 page has link back to homepage', () => {
        cy.visit('/this-page-does-not-exist', { failOnStatusCode: false })
        cy.contains(/לעמוד הראשי/i).click()
        cy.url().should('eq', Cypress.config('baseUrl') + '/')
    })

    it('navigates to show detail page from homepage card', () => {
        cy.visit('/')
        cy.get('[class*="grid"] a', { timeout: 10000 }).first().click()
        cy.url().should('include', '/show/')
    })
})
