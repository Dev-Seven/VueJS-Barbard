describe("Login/Authentication ", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Login  - success case", () => {
    cy.url().should("contain", "/auth/login");
  });
});
