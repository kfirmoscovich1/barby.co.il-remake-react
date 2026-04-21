describe('Authentication', () => {
    it('login page renders email and password fields', () => {
        cy.visit('/login')
        cy.get('input[type="email"]').should('be.visible')
        cy.get('input[type="password"]').should('be.visible')
        cy.get('button[type="submit"]').should('be.visible')
    })

    it('shows validation error for empty form submission', () => {
        cy.visit('/login')
        cy.get('button[type="submit"]').click()
        // HTML5 validation or custom error message
        cy.get('input[type="email"]:invalid, [role="alert"]').should('exist')
    })

    it('admin route redirects unauthenticated users to login', () => {
        cy.visit('/admin')
        cy.url().should('include', '/login')
    })
})
