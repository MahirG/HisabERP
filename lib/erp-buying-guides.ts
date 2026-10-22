import type { MarketingResource } from "./marketing-resources";

export const erpBuyingGuides: MarketingResource[] = [
  {
    "slug": "erp-costs-ethiopia",
    "category": {
      "en": "ERP costs"
    },
    "title": {
      "en": "ERP costs in Ethiopia: build a complete implementation budget"
    },
    "summary": {
      "en": "Compare subscriptions, users, branches, migration, training and ongoing support using an itemized vendor quote rather than a headline price."
    },
    "audience": {
      "en": "Owners, finance managers and ERP project sponsors"
    },
    "readingMinutes": 6,
    "published": "2026-10-22",
    "sections": [
      {
        "heading": {
          "en": "Separate software access from implementation"
        },
        "paragraphs": [
          {
            "en": "An ERP budget has at least three parts: access to the software, the work needed to make it usable, and the cost of operating it after launch. A low monthly price says little about whether your records can be migrated or your team can complete daily tasks."
          },
          {
            "en": "Ask each supplier for the same period, number of named users, locations and workflows. A quote for one branch and two users cannot be compared directly with a multi-branch rollout that includes training and historical data. Record what is excluded as carefully as what is included."
          }
        ]
      },
      {
        "heading": {
          "en": "Use the published Biloo scope as a starting point"
        },
        "paragraphs": [
          {
            "en": "Biloo's pricing page lists monthly and annual ETB plans, included users and branch limits. Use that current page for amounts and checkout terms. This guide does not freeze a separate price list that could become outdated."
          },
          {
            "en": "Migration, additional capacity and custom integrations may add cost. A guided implementation must define the data, training sessions, configuration, reviewers and support period being purchased. An annual access payment is not evidence that every implementation service is included."
          }
        ]
      },
      {
        "heading": {
          "en": "Ask for a line-by-line quotation"
        },
        "paragraphs": [
          {
            "en": "Give vendors a short requirements document and request an itemized response. Separate one-time fees from recurring charges and distinguish mandatory work from optional improvements."
          },
          {
            "en": "For a comparison with Odoo or ERPNext, specify the edition or release, hosting model, installed applications, responsibility for upgrades and who maintains any customizations. Open-source availability and a subscription headline are different from the total cost of a usable implementation."
          }
        ],
        "checklist": [
          {
            "en": "Software access: users, branches, modules and access period."
          },
          {
            "en": "Configuration: chart of accounts, products, permissions and approval rules."
          },
          {
            "en": "Migration: source files, records, history, test imports and reconciliations."
          },
          {
            "en": "Training: participants, sessions, materials and post-launch support."
          },
          {
            "en": "Infrastructure: hosting, devices, connectivity and continuity arrangements."
          },
          {
            "en": "Custom work: deliverables, acceptance criteria, maintenance and upgrade responsibility."
          },
          {
            "en": "Commercial terms: applicable taxes, exclusions, payment milestones and renewal."
          }
        ]
      },
      {
        "heading": {
          "en": "Use an explicit cost model"
        },
        "paragraphs": [
          {
            "en": "For a chosen comparison period, add software access, hosting, implementation, data preparation, training, integrations, internal staff time and contingency for identified risks. Subtract a cost only when it is genuinely included elsewhere in the quote; avoid counting the same service twice."
          },
          {
            "en": "List unknown amounts as 'quotation required'. Do not turn missing numbers into zero. Also record what happens if the migration needs another dry run, a branch joins later or a critical integration is unavailable. These assumptions often explain more than a nominal price difference."
          }
        ]
      },
      {
        "heading": {
          "en": "Connect payment milestones to acceptance"
        },
        "paragraphs": [
          {
            "en": "Define how the team will accept the system: record counts and opening balances reconcile, selected users can complete their tasks, the required reports match approved examples, and support responsibilities are documented."
          },
          {
            "en": "Before retiring the existing system, agree a cutover decision and a continuity process. Ask vendors to demonstrate the highest-risk workflow with representative records. Choose the quote that meets the essential requirements with accountable delivery, not simply the lowest initial figure."
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "label": "See current Biloo ETB plans",
        "href": "/pricing"
      },
      {
        "label": "Compare Biloo and Odoo",
        "href": "/compare/biloo-vs-odoo"
      },
      {
        "label": "Compare Biloo and ERPNext",
        "href": "/compare/biloo-vs-erpnext"
      },
      {
        "label": "Plan data migration",
        "href": "/migration"
      }
    ]
  },
  {
    "slug": "multi-branch-business-controls",
    "category": {
      "en": "Multi-branch operations"
    },
    "title": {
      "en": "Multi-branch ERP: keep stock, cash and customer balances consistent"
    },
    "summary": {
      "en": "A practical control plan for Ethiopian businesses coordinating several locations, with clear responsibilities for transfers, collections and reporting."
    },
    "audience": {
      "en": "Owners, branch managers, finance and operations teams"
    },
    "readingMinutes": 5,
    "published": "2026-10-22",
    "sections": [
      {
        "heading": {
          "en": "Start with ownership and definitions"
        },
        "paragraphs": [
          {
            "en": "A consolidated dashboard is useful only when each branch records activity consistently. Agree shared product codes, units, customer identifiers, payment labels and reporting cutoffs before combining totals."
          },
          {
            "en": "Name the person responsible for each location's receipts, stock movements and corrections. Define which actions a cashier, storekeeper, branch manager and finance reviewer may perform. Test those responsibilities in the product rather than assuming every user should see every record."
          }
        ]
      },
      {
        "heading": {
          "en": "Treat transfers as two responsibilities"
        },
        "paragraphs": [
          {
            "en": "When stock leaves one location and arrives at another, the source and receiving teams need the same reference, item code, quantity and unit. A dispatch is not proof of receipt."
          },
          {
            "en": "Maintain a transfer exception list showing what was sent, what was acknowledged and what differs. During evaluation, ask the vendor to demonstrate dispatch, partial receipt and correction. Confirm whether these steps are supported in the quoted product or require a separate process."
          }
        ],
        "checklist": [
          {
            "en": "Give every movement a traceable reference."
          },
          {
            "en": "Record dispatch and receipt evidence."
          },
          {
            "en": "Review transfers awaiting acknowledgment."
          },
          {
            "en": "Investigate repeated quantity or unit differences."
          }
        ]
      },
      {
        "heading": {
          "en": "Keep collection evidence attached to the customer"
        },
        "paragraphs": [
          {
            "en": "A customer may buy at one branch and pay at another. Agree how the team identifies the invoice, records the payment and prevents a second collection entry."
          },
          {
            "en": "Review customer balances using the same cutoff and scope. Explain unresolved differences before aggregating them. The demonstration should include partial payment, reversal or correction and a customer with activity at more than one location."
          }
        ]
      },
      {
        "heading": {
          "en": "Close the day before comparing branches"
        },
        "paragraphs": [
          {
            "en": "Ask each branch to review sales, receipts, physical cash and exceptions at an agreed cutoff. Keep a named reviewer and the evidence behind any correction."
          },
          {
            "en": "An operating comparison should distinguish sales from collected cash and inventory value from units. Compare like periods and document unavailable data. Sample charts show a possible presentation; they do not establish a real business result."
          }
        ]
      },
      {
        "heading": {
          "en": "Validate plan limits and rollout scope"
        },
        "paragraphs": [
          {
            "en": "Use Biloo's current pricing page to confirm the included locations and users. Agree any extra capacity, migration and support scope before rollout."
          },
          {
            "en": "Begin with a controlled pilot and a written acceptance checklist. Expand after the team can explain the source records behind consolidated stock, customer balances and reporting. Connectivity and continuity must be evaluated separately at each branch."
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "label": "Explore industry workflows",
        "href": "/industries"
      },
      {
        "label": "Review inventory software",
        "href": "/product/inventory"
      },
      {
        "label": "Review finance workflows",
        "href": "/product/finance-cashflow"
      },
      {
        "label": "Check user and branch limits",
        "href": "/pricing"
      }
    ]
  },
  {
    "slug": "inventory-software-wholesale-ethiopia",
    "category": {
      "en": "Wholesale and distribution"
    },
    "title": {
      "en": "Inventory software for Ethiopian wholesalers: what to test before buying"
    },
    "summary": {
      "en": "Evaluate units, receiving, stock adjustments, customer credit and reporting with a repeatable demonstration checklist."
    },
    "audience": {
      "en": "Wholesalers, distributors, storekeepers and purchasing teams"
    },
    "readingMinutes": 5,
    "published": "2026-10-22",
    "sections": [
      {
        "heading": {
          "en": "Bring the difficult records to the demonstration"
        },
        "paragraphs": [
          {
            "en": "Choose a small set of representative items: a fast seller, a high-value product, an item purchased in cartons and sold in pieces, and an item with frequent count differences."
          },
          {
            "en": "Prepare a purchase, a receipt, a sale, a customer balance and an adjustment. Ask every vendor to use this same scenario. A polished dashboard cannot prove that mixed units, corrections or delayed receipts will be handled correctly."
          }
        ]
      },
      {
        "heading": {
          "en": "Prove the unit and quantity rules"
        },
        "paragraphs": [
          {
            "en": "Write down the purchasing unit, stocking unit and selling unit for each sample item. Confirm the conversion rule and what happens when a pack size changes."
          },
          {
            "en": "Check whether quantity precision, returns and partial receipts meet your requirements. Where batch, serial or expiry controls are essential, ask for a direct demonstration and include the result in the signed scope. Do not assume those features from a generic inventory label."
          }
        ],
        "checklist": [
          {
            "en": "Can the team explain the quantity after each movement?"
          },
          {
            "en": "Are units explicit on transactions and reports?"
          },
          {
            "en": "Can corrections be traced to a person and reason?"
          },
          {
            "en": "Which controls are available now and which need extra work?"
          }
        ]
      },
      {
        "heading": {
          "en": "Connect purchasing decisions to reliable stock"
        },
        "paragraphs": [
          {
            "en": "A reorder list is only useful when receiving and issuing are recorded promptly. Agree who records each movement and who reviews missing or delayed entries."
          },
          {
            "en": "During evaluation, compare a physical sample count with system quantities. Investigate discrepancies by source transaction. Count fast-moving and high-value items more often, and keep unresolved differences visible instead of silently overwriting totals."
          }
        ]
      },
      {
        "heading": {
          "en": "Review credit and collection alongside sales"
        },
        "paragraphs": [
          {
            "en": "For wholesalers, a completed sale and collected cash are different events. Demonstrate a credit invoice, partial collection and the remaining customer balance."
          },
          {
            "en": "Confirm the responsibilities for approving credit, recording payment and following overdue balances. Ask how the owner can trace an outstanding amount to its source record. Review export and access requirements before relying on a single vendor's reporting view."
          }
        ]
      },
      {
        "heading": {
          "en": "Set acceptance criteria before migration"
        },
        "paragraphs": [
          {
            "en": "Agree product codes, opening quantities, valuation assumptions and the people who approve them. Reconcile the imported position before accepting new live transactions."
          },
          {
            "en": "Biloo's inventory, purchasing, sales and finance pages explain the workflows to evaluate. Confirm specialist features, integration requirements and location limits in a focused demo. A documented gap is more useful than an unsupported promise of complete coverage."
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "label": "Explore wholesale and distribution workflows",
        "href": "/industries/wholesale-distribution"
      },
      {
        "label": "See inventory workflows",
        "href": "/product/inventory"
      },
      {
        "label": "Build an ERP cost budget",
        "href": "/resources/erp-costs-ethiopia"
      },
      {
        "label": "Use the inventory accuracy routine",
        "href": "/resources/inventory-accuracy-routine"
      }
    ]
  }
];
