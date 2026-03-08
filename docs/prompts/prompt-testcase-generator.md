You are a Senior Quality Assurance Analyst experienced in functional software testing.

Your task is to create a complete Test Cases document for the system described below, strictly following the provided instructions and template.

---

## System Information

**System name:** Velô Sprint - Electric Vehicle Configurator

**Description:** A React-based SPA (Single Page Application) that allows users to configure, simulate financing, and purchase the Velô Sprint electric vehicle. The system dynamically calculates prices based on the customer's choices and integrates with a credit analysis API to validate purchases.

**Modules/Features to cover:** Landing Page, Vehicle Configurator, Checkout/Order, Automatic Credit Analysis, Confirmation, Order Consultation.

**User profiles:** Customer (Common User).

**Relevant business rules:** 
- Pricing: The car has a base value of R$ 40.000,00. Adding "Sport" wheels costs +R$ 2.000,00. Adding "Precision Park" costs +R$ 5.500,00. Adding "Flux Capacitor" costs +R$ 5.000,00.
- Financing Interest: If the installment option is chosen, the financing is locked into 12x with a fixed compound interest rate of 2% per month.
- Credit Analysis by Score: Score > 700 (APROVADO), 501 to 700 (EM_ANALISE), <= 500 (REPROVADO).
- Credit Approval Exception: Down payment (Entrada) >= 50% of the total value automatically approves the order, ignoring the credit score.
- Data Security: Order consultation requires the order number (`order_number`).

---

## Test Scope

Must cover:
- Functional tests (blackbox)
- Positive scenarios (happy path)
- Negative scenarios (errors, invalid data, denied permissions)
- Validation of required fields
- Validation of business rules
- Main and alternative flows
- Permissions and access levels per user profile

Do not include:
- Performance tests
- Load or stress tests
- Automated tests
- Advanced security tests

---

## Test Case Template

Each test case must follow exactly this format:

---

### TC[NN] - [Descriptive name of the test case]

#### Objective
[Clear and objective description of what is being validated.]

#### Pre-conditions
- [Condition 1]
- [Condition 2]
- [...]

#### Steps

| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | [User action] | [Expected system behavior] |
| 2  | [...] | [...] |

#### Expected Results
- [Describe the expected final state of the system after all steps.]

#### Acceptance Criteria
- [Objective criterion 1]
- [Objective criterion 2]
- [...]

---

## Generation Instructions

1. Number the test cases sequentially: TC01, TC02, TC03...
2. Cover at least the following base flows for each informed module:
   - Successful operation (happy path)
   - Operation with invalid or incomplete data
   - Operation without adequate permission (when applicable)
3. Include test cases for validation of required fields.
4. Include test cases for each listed user profile, whenever there are distinct behaviors.
5. Be detailed in the steps — each action must be clear enough so that anyone can execute the test without doubts.
6. Generate the result in Markdown format, ready to be saved in an `.md` file inside the `docs/tests` folder of the project.