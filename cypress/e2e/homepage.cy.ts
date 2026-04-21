describe('Homepage', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('loads without error', () => {
        // Should NOT show the Hebrew loading error
        cy.contains('שגיאה בטעינה').should('not.exist')
    })

    it('renders the chandelier header', () => {
        // Chandelier SVG is always present in the hero section
        cy.get('svg').should('exist')
    })

    it('shows the search bar', () => {
        cy.get('input[placeholder*="חפש"]').should('be.visible')
    })

    it('search filters shows by title', () => {
        // Wait for shows to load
        cy.get('[class*="grid"]', { timeout: 10000 }).should('exist')

        cy.get('input[placeholder*="חפש"]').type('XYZNOTFOUND')
        cy.contains(/נמצאו 0 תוצאות/).should('be.visible')
    })

    it('shows result count when searching', () => {
        cy.get('input[placeholder*="חפש"]').type('a')
        cy.contains(/נמצאו/).should('be.visible')
    })

    it('clears search with X button', () => {
        cy.get('input[placeholder*="חפש"]').type('test')
        cy.get('button').filter(':visible').last().click()
        cy.get('input[placeholder*="חפש"]').should('have.value', '')
    })

    it('show cards link to the show detail page', () => {
        cy.get('[class*="grid"] a', { timeout: 10000 }).first().then(($link) => {
            const href = $link.attr('href')
            expect(href).to.match(/^\/show\//)
        })
    })
})
