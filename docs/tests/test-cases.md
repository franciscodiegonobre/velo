# Test Cases Document - Velô Sprint

This document details the functional test cases created based on the analysis of the entire Velô Sprint system source code (React SPA).

---

## 1. Landing Page

### TC01 - Navigation from Landing Page to Configurator
#### Objective
Validate that the user can discover and navigate to the Vehicle Configurator from the CTAs (Call to Actions) on the home screen.

#### Pre-conditions
- The system is online and responsive.
- Unauthenticated user accesses the home page (`/`).

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | In the Hero section, find and click the "Configurar" (or similar) button | The system should redirect instantly |

#### Expected Results
- The user is taken to the `/configure` route. The Configurator interface and vehicle rendering must load completely.

#### Acceptance Criteria
- Navigation completes without console errors (client-side routing).

---

## 2. Vehicle Configurator

### TC02 - Dynamic base price calculation with optionals
#### Objective
Ensure that cart calculations consider default values and extra incrementals (color, wheels, packages).

#### Pre-conditions
- User is on the configuration screen (`/configure`).
- Initial base value is `R$ 40.000,00`.

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Select an external color different from the default (e.g., `lunar-white`) | The visual of the car model changes to white |
| 2  | In the "Rodas" tab, change to `Sport Wheels` | The price should increase by R$ 2.000,00 |
| 3  | In the "Opcionais" tab, check `Precision Park` | The price should increase by R$ 5.500,00 |
| 4  | In the "Opcionais" tab, check and uncheck `Flux Capacitor` | The price adds and then removes the R$ 5.000,00 |

#### Expected Results
- The total calculated "Preço de Venda" shown on the screen should instantly reflect the sum: `40000 + 2000 + 5500 = 47.500`.

#### Acceptance Criteria
- Selected values persist if the user navigates or advances steps (stored via `configuratorStore`).

---

## 3. Checkout/Order and Business Rules for Analysis

### TC03 - Required fields validation on the order form
#### Objective
Force complete data entry before finalizing with invalid data.

#### Pre-conditions
- Vehicle already configured with a minimum price of R$ 40.000,00.
- Access the checkout screen (`/order`).

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Leave name, surname, phone, email, CPF, "loja" (store), and terms checkbox empty | Fields are not filled |
| 2  | Click on "Confirmar Pedido" | The system prevents the network request |
| 3  | Type "A" in the name and "B" in the surname | Fields reject to proceed because they require a minimum length (e.g., >= 2 characters) |
| 4  | Input email `tester@.` | The field alerts that it does not meet the Email rules |

#### Expected Results
- The UI will display the labels/tags in red (or highlighted error texts like "Email inválido", "CPF inválido", "Aceite os termos").

#### Acceptance Criteria
- No request to hooks (e.g., `createOrder` or credit invocation) can be dispatched if `orderSchema` indicates validation errors (Zod).

---

### TC04 - Happy path - Cash payment (Approval without Analysis)
#### Objective
User successfully finalizes and consolidates their order via direct cash payment ("À Vista").

#### Pre-conditions
- Correct personal fields, customer's (Common User) CPF properly masked and filled.
- Store selection made. Terms accepted.

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Select "À Vista" in the payment method | The financing block is hidden |
| 2  | Click on "Confirmar Pedido" | Loading status "Processando..." is activated |
| 3  | Wait for the DB request to complete | System redirects to `/success` with generated status and order code |

#### Expected Results
- Integration with Credit Analysis is natively skipped due to the `avista` payment method, and the order completes as Status `APROVADO`.

#### Acceptance Criteria
- The final screen shows a badge and icon stating "Pedido Aprovado!", detailing the "À Vista" payment method.

---

### TC05 - Credit Analysis: Automatic approval by high Score (> 700)
#### Objective
Ensure a qualified customer gets quick credit acceptance.

#### Pre-conditions
- Form validated and filled.
- Payment Method: `Financiamento` with any valid down payment ("Valor da Entrada") below 50%.
- A CPF on the API that will return `score = 750`.

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Fill in 0 (zero) in "Valor da Entrada" | Installments show financing over the total value in 12x with monthly interest |
| 2  | Click on "Confirmar Pedido" | The `credit-analysis` edge function is fully consulted using the sent CPF |

#### Expected Results
- Since score > 700, the condition ends with the creation of the order in the database, marking it as `APROVADO`.

#### Acceptance Criteria
- Screen will show "Pedido Aprovado!". Visually, the installment will be listed on the receipt.

---

### TC06 - Credit Analysis: Under Analysis (Score = 501 to 700)
#### Objective
Verify partial block or required detailed analysis for borderline scores.

#### Pre-conditions
- Financing, down payment < 50%.
- CPF results in `score = 600`.

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Click "Confirmar Pedido" after the form is ok | The edge function returns `score = 600` |

#### Expected Results
- Backend saves the customer and stores the tracking status `EM_ANALISE`. The user is redirected to the Confirmation showing the protocol.

#### Acceptance Criteria
- The consultation UI will display a status "Em Análise" (yellow or gray badge, instead of green/red).

---

### TC07 - Credit Analysis: Rejected (Score <= 500)
#### Objective
Certify that users with high-risk score do not generate irregular approvals.

#### Pre-conditions
- Financing, down payment < 50%.
- CPF simulates `score = 450`.

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Click on "Confirmar Pedido" after submitting a weak CPF | Credit analysis return results in denied |

#### Expected Results
- Order assumes the status `REPROVADO`. 

#### Acceptance Criteria
- On the `/success` page, the red icon and title ("Crédito Reprovado") should be prominent, and no delivery promise should be displayed.

---

### TC08 - Score Exception: Substantial down payment (>= 50%)
#### Objective
Validate the rule of score waiver in case of upfront payments equivalent to 50% or more of the vehicle's price.

#### Pre-conditions
- Total price is `R$ 47.500,00` (due to Optionals).
- User chose "Financiamento".
- The CPF results in `score = 250` (which should normally reject).

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Input `R$ 23.750,00` or more in "Valor da Entrada" | The indicator fills |
| 2  | Click on "Confirmar Pedido" | Sends data to the credit function |

#### Expected Results
- Prioritization rule "IF Entrada >= 50% and Score < 700 = APROVADO" activates. The order with Score 250 is successfully validated with the status `APROVADO`.

#### Acceptance Criteria
- Page displaying approval, leaving no trace of denied credit, even stating that installments will be paid.

---

## 4. Order Consultation and Confirmations

### TC09 - Secure Order Retrieval from Exact Order ID
#### Objective
Verify safety rule: Orders should only open in the interface using a strong locator `order_number` (privacy).

#### Pre-conditions
- User access `/lookup` (Consulta de Pedidos).
- The order `ID-SECRETO-999` belonging to the user is registered as "EM_ANALISE" in the system.

#### Steps
| Id | Action | Expected Result |
|----|--------|-----------------|
| 1  | Input a different ID (e.g., ID-SECRETO-XYZ) in the search bar; Search. | Returns screen that the ID does not exist ("Pedido não encontrado") |
| 2  | Input `ID-SECRETO-999`; Search | The card renders containing the authentic status (e.g., `EM_ANALISE`), associated Customer Data, and chosen options from configuration |

#### Expected Results
- Improper access fails when an incorrect/fraudulent `order_number` is presented to the API. Only upon inserting the correct one (1:1 match), the metrics are retrieved.

#### Acceptance Criteria
- The panel displays color identifiers matching the set status (`APROVADO` > green check, `REPROVADO` > red cross, and `EM_ANALISE` > yellow clock).
