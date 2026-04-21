// Custom Cypress commands

declare global {
    namespace Cypress {
        interface Chainable {
            loginAsAdmin(email?: string, password?: string): Chainable<void>
        }
    }
}

Cypress.Commands.add('loginAsAdmin', (
    email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com',
    password = Cypress.env('ADMIN_PASSWORD') || 'password123'
) => {
    cy.visit('/login')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/admin')
})
