# Phase 3 — Official Course Inventory

Canonical machine-readable manifest: `backend/courses/data/official_catalogue_manifest.json`

- Total source entries: **111**
- Eligible for automatic sync: **108**
- Excluded (duplicates/near-duplicates): **3**

## Public taxonomy (8)

- `mep-building-services` — MEP & Building Services (order 1)
- `architecture-bim-digital-construction` — Architecture, BIM & Digital Construction (order 2)
- `quantity-surveying-cost-management` — Quantity Surveying & Cost Management (order 3)
- `project-management-infrastructure` — Project Management & Infrastructure (order 4)
- `industrial-engineering-automation` — Industrial Engineering & Automation (order 5)
- `renewable-energy-sustainability` — Renewable Energy & Sustainability (order 6)
- `engineering-finance-investment` — Engineering Finance & Investment (order 7)
- `corporate-strategy-leadership` — Corporate Strategy & Leadership (order 8)

## Category counts (eligible only)

- MEP & Building Services: 5
- Architecture, BIM & Digital Construction: 15
- Quantity Surveying & Cost Management: 10
- Project Management & Infrastructure: 26
- Industrial Engineering & Automation: 15
- Renewable Energy & Sustainability: 12
- Engineering Finance & Investment: 13
- Corporate Strategy & Leadership: 12

## Excluded from automatic sync

- `bim-05` — 4D BIM: Construction Planning & Simulation (near_duplicate; duplicate_of=arch-bim-05) — Near-duplicate of arch-bim-05. EXCLUDED from auto-sync; keep arch-bim-05 as canonical.
- `bim-06` — 5D BIM: Quantity Takeoff & Cost Management (near_duplicate; duplicate_of=arch-bim-04) — Near-duplicate of arch-bim-04. EXCLUDED from auto-sync.
- `qs-01` — 5D BIM: Quantity Takeoff, Cost Estimation & BOQ (exact_duplicate; duplicate_of=arch-bim-04) — Exact/near title match with arch-bim-04. EXCLUDED; canonical is arch-bim-04.

## All source entries

### mep-01 [SYNC]
- **Title:** Professional Building Services Engineering & BIM Coordination
- **Group:** MEP Courses (#1)
- **Primary category:** mep-building-services
- **Audience:** Engineering consultancies, contractors, property developers, and multidisciplinary design firms.

### mep-02 [SYNC]
- **Title:** Integrated MEP Design, Analysis & Coordination
- **Group:** MEP Courses (#2)
- **Primary category:** mep-building-services
- **Audience:** MEP consultants, building services engineers, and specialist contractors.

### mep-03 [SYNC]
- **Title:** Advanced Building Services Design & Digital Engineering
- **Group:** MEP Courses (#3)
- **Primary category:** mep-building-services
- **Audience:** Large engineering firms, developers, and organisations adopting digital engineering.

### mep-04 [SYNC]
- **Title:** MEP Systems Design & Building Services Integration
- **Group:** MEP Courses (#4)
- **Primary category:** mep-building-services
- **Audience:** MEP contractors, installation teams, design engineers, and project managers.

### mep-05 [SYNC]
- **Title:** Building Services Engineering: Design to Construction
- **Group:** MEP Courses (#5)
- **Primary category:** mep-building-services
- **Audience:** Construction companies, developers, engineering consultants, and site management teams.

### arch-bim-01 [SYNC]
- **Title:** Professional Architectural Design & BIM Modelling
- **Group:** Architecture & BIM corporate courses (#1)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Architectural firms, graduate architects, and design teams.

### arch-bim-02 [SYNC]
- **Title:** BIM Coordination & Digital Construction Management
- **Group:** Architecture & BIM corporate courses (#2)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Contractors, developers, BIM coordinators, and project managers.

### arch-bim-03 [SYNC]
- **Title:** Architectural Visualization & Digital Rendering
- **Group:** Architecture & BIM corporate courses (#3)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Architects, interior designers, property marketers, and developers.

### arch-bim-04 [SYNC]
- **Title:** 5D BIM: Quantity Takeoff, Cost Estimation & BOQ
- **Group:** Architecture & BIM corporate courses (#4)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** Quantity surveyors, cost consultants, contractors, and developers.
- **Notes:** Cross-listed under Architecture & BIM in source; primary category QS & Cost per subject matter.

### arch-bim-05 [SYNC]
- **Title:** 4D BIM: Construction Planning & Project Simulation
- **Group:** Architecture & BIM corporate courses (#5)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Project planners, construction managers, and contractors.

### arch-bim-06 [SYNC]
- **Title:** BIM Information Management & Digital Asset Delivery
- **Group:** Architecture & BIM corporate courses (#6)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** BIM managers, consultants, developers, and facilities management teams.

### arch-bim-07 [SYNC]
- **Title:** Computational Design & Parametric Architecture
- **Group:** Architecture & BIM corporate courses (#7)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Advanced architectural practices, computational designers, and innovation teams.

### arch-bim-08 [SYNC]
- **Title:** Integrated BIM for Architecture, Engineering & Construction
- **Group:** Architecture & BIM corporate courses (#8)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Multidisciplinary consultants, design-build firms, and major contractors.

### bim-01 [SYNC]
- **Title:** Professional BIM Modelling & Documentation
- **Group:** BIM-only corporate courses (#1)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** BIM modellers, architects, and engineering technicians.
- **Relation:** related → None
- **Notes:** Related to arch-bim-01 (architectural design focus vs BIM modelling/documentation).

### bim-02 [SYNC]
- **Title:** BIM Coordination & Clash Detection
- **Group:** BIM-only corporate courses (#2)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** BIM coordinators, consultants, and contractors.
- **Relation:** near_duplicate → None
- **Notes:** Near-duplicate of arch-bim-02; clash-detection emphasis. Kept as distinct offering.

### bim-03 [SYNC]
- **Title:** BIM Management & Implementation
- **Group:** BIM-only corporate courses (#3)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** BIM managers, project managers, and consultancy leaders.

### bim-04 [SYNC]
- **Title:** BIM Information Management & ISO 19650
- **Group:** BIM-only corporate courses (#4)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** BIM managers, information managers, and project information teams.
- **Relation:** related → None
- **Notes:** Related to arch-bim-06; ISO 19650 / CDE focus vs digital asset delivery.

### bim-05 [SKIP]
- **Title:** 4D BIM: Construction Planning & Simulation
- **Group:** BIM-only corporate courses (#5)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Planners, contractors, and construction managers.
- **Relation:** near_duplicate → arch-bim-05
- **Notes:** Near-duplicate of arch-bim-05. EXCLUDED from auto-sync; keep arch-bim-05 as canonical.

### bim-06 [SKIP]
- **Title:** 5D BIM: Quantity Takeoff & Cost Management
- **Group:** BIM-only corporate courses (#6)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** Quantity surveyors, cost consultants, and contractors.
- **Relation:** near_duplicate → arch-bim-04
- **Notes:** Near-duplicate of arch-bim-04. EXCLUDED from auto-sync.

### bim-07 [SYNC]
- **Title:** BIM Automation & Computational Workflows
- **Group:** BIM-only corporate courses (#7)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Advanced BIM modellers, coordinators, and digital engineering teams.
- **Relation:** related → None
- **Notes:** Related to arch-bim-07 (parametric architecture vs BIM production automation).

### bim-08 [SYNC]
- **Title:** OpenBIM & Interoperability
- **Group:** BIM-only corporate courses (#8)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** BIM consultants, multidisciplinary design teams, and technology specialists.

### bim-09 [SYNC]
- **Title:** BIM for Facilities Management & Digital Handover
- **Group:** BIM-only corporate courses (#9)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** Facility managers, asset owners, developers, and operations teams.
- **Relation:** related → None
- **Notes:** Related to arch-bim-06 asset delivery; FM/operations emphasis.

### bim-10 [SYNC]
- **Title:** BIM Standards, LOD & Quality Assurance
- **Group:** BIM-only corporate courses (#10)
- **Primary category:** architecture-bim-digital-construction
- **Audience:** BIM leads, design reviewers, and quality assurance teams.

### qs-01 [SKIP]
- **Title:** 5D BIM: Quantity Takeoff, Cost Estimation & BOQ
- **Group:** BIM & Quantity Surveying courses (#1)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** Quantity surveyors, cost consultants, contractors, and developers.
- **Relation:** exact_duplicate → arch-bim-04
- **Notes:** Exact/near title match with arch-bim-04. EXCLUDED; canonical is arch-bim-04.

### qs-02 [SYNC]
- **Title:** BIM-Based Measurement & Digital Quantity Surveying
- **Group:** BIM & Quantity Surveying courses (#2)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** *(not provided in source)*

### qs-03 [SYNC]
- **Title:** BIM-Based Cost Planning & Cost Management
- **Group:** BIM & Quantity Surveying courses (#3)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** *(not provided in source)*

### qs-04 [SYNC]
- **Title:** Digital BOQ Preparation, Tendering & Procurement
- **Group:** BIM & Quantity Surveying courses (#4)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** *(not provided in source)*

### qs-05 [SYNC]
- **Title:** 5D BIM for Construction Cost Control & Project Monitoring
- **Group:** BIM & Quantity Surveying courses (#5)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** *(not provided in source)*

### qs-06 [SYNC]
- **Title:** BIM-Based Material Quantification & Waste Optimisation
- **Group:** BIM & Quantity Surveying courses (#6)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** *(not provided in source)*

### qs-07 [SYNC]
- **Title:** BIM for Contract Administration, Variations & Valuations
- **Group:** BIM & Quantity Surveying courses (#7)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** *(not provided in source)*

### qs-08 [SYNC]
- **Title:** BIM & Digital Quantity Surveying Software Masterclass
- **Group:** BIM & Quantity Surveying courses (#8)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** *(not provided in source)*

### pm-01 [SYNC]
- **Title:** Advanced Project Planning, Control & Delivery
- **Group:** Project Management course names (#1)
- **Primary category:** project-management-infrastructure
- **Audience:** Corporate project teams, engineering firms, and contractors.

### pm-02 [SYNC]
- **Title:** Professional Project Planning & Scheduling with Primavera P6
- **Group:** Project Management course names (#2)
- **Primary category:** project-management-infrastructure
- **Audience:** Planning engineers, project planners, and construction managers.

### pm-03 [SYNC]
- **Title:** Project Controls, Cost Management & Performance Monitoring
- **Group:** Project Management course names (#3)
- **Primary category:** project-management-infrastructure
- **Audience:** Project controls teams, cost engineers, and senior project managers.

### pm-04 [SYNC]
- **Title:** Strategic Project & Programme Management
- **Group:** Project Management course names (#4)
- **Primary category:** project-management-infrastructure
- **Audience:** Senior managers, department heads, and programme leaders.

### pm-05 [SYNC]
- **Title:** Project Risk Management & Decision Analysis
- **Group:** Project Management course names (#5)
- **Primary category:** project-management-infrastructure
- **Audience:** Project managers, consultants, and risk officers.

### pm-06 [SYNC]
- **Title:** Contract Administration, Procurement & Project Delivery
- **Group:** Project Management course names (#6)
- **Primary category:** project-management-infrastructure
- **Audience:** Contractors, quantity surveyors, procurement officers, and consultants.

### pm-07 [SYNC]
- **Title:** Construction Project Management & Site Leadership
- **Group:** Project Management course names (#7)
- **Primary category:** project-management-infrastructure
- **Audience:** Site engineers, construction managers, and project supervisors.

### pm-08 [SYNC]
- **Title:** Digital Project Management with Microsoft Project
- **Group:** Project Management course names (#8)
- **Primary category:** project-management-infrastructure
- **Audience:** Corporate project teams across different industries.

### pm-09 [SYNC]
- **Title:** Agile Project Management & High-Performance Teams
- **Group:** Project Management course names (#9)
- **Primary category:** project-management-infrastructure
- **Audience:** Technology companies, innovation teams, and business transformation units.

### pm-10 [SYNC]
- **Title:** Project Leadership, Governance & Executive Decision-Making
- **Group:** Project Management course names (#10)
- **Primary category:** project-management-infrastructure
- **Audience:** Directors, executives, programme managers, and senior project leaders.

### ind-01 [SYNC]
- **Title:** Industrial Automation & PLC Systems Engineering
- **Group:** Industrial (#1)
- **Primary category:** industrial-engineering-automation
- **Audience:** Manufacturing plants, automation contractors, and industrial maintenance teams.

### ind-02 [SYNC]
- **Title:** SCADA Systems, Industrial Monitoring & Process Control
- **Group:** Industrial (#2)
- **Primary category:** industrial-engineering-automation
- **Audience:** Utilities, water treatment plants, energy firms, and manufacturing companies.

### ind-03 [SYNC]
- **Title:** Industrial Electrical Systems, Motors & Drives
- **Group:** Industrial (#3)
- **Primary category:** industrial-engineering-automation
- **Audience:** Factories, electrical contractors, and maintenance departments.

### ind-04 [SYNC]
- **Title:** Industrial Maintenance & Reliability Engineering
- **Group:** Industrial (#4)
- **Primary category:** industrial-engineering-automation
- **Audience:** Manufacturing, processing, mining, and energy industries.

### ind-05 [SYNC]
- **Title:** Industrial Instrumentation, Sensors & Process Measurement
- **Group:** Industrial (#5)
- **Primary category:** industrial-engineering-automation
- **Audience:** Process industries, water utilities, food processing, and energy plants.

### ind-06 [SYNC]
- **Title:** Industrial Hydraulics, Pneumatics & Fluid Power Systems
- **Group:** Industrial (#6)
- **Primary category:** industrial-engineering-automation
- **Audience:** Manufacturing, heavy equipment, and industrial service companies.

### ind-07 [SYNC]
- **Title:** Industrial Power Systems Analysis & Protection
- **Group:** Industrial (#7)
- **Primary category:** industrial-engineering-automation
- **Audience:** Industrial facilities, utilities, electrical consultants, and energy companies.

### ind-08 [SYNC]
- **Title:** Industrial Energy Management & Power Efficiency
- **Group:** Industrial (#8)
- **Primary category:** industrial-engineering-automation
- **Audience:** Factories, commercial facilities, and energy-intensive businesses.

### ind-09 [SYNC]
- **Title:** Industrial Water Treatment, Pumping & Process Systems
- **Group:** Industrial (#9)
- **Primary category:** industrial-engineering-automation
- **Audience:** Water utilities, food and beverage plants, and industrial facilities.

### ind-10 [SYNC]
- **Title:** Industrial CAD, Mechanical Design & Product Development
- **Group:** Industrial (#10)
- **Primary category:** industrial-engineering-automation
- **Audience:** Fabrication workshops, manufacturers, product designers, and engineering firms.

### ind-11 [SYNC]
- **Title:** Process Plant Design, Piping & P&ID Engineering
- **Group:** Industrial (#11)
- **Primary category:** industrial-engineering-automation
- **Audience:** Process plants, EPC contractors, and industrial design consultancies.

### ind-12 [SYNC]
- **Title:** Industrial IoT, Smart Manufacturing & Digital Twins
- **Group:** Industrial (#12)
- **Primary category:** industrial-engineering-automation
- **Audience:** Smart factories, manufacturing firms, and digital transformation teams.

### ind-13 [SYNC]
- **Title:** Industrial Fabrication, Welding Technology & Quality Control
- **Group:** Industrial (#13)
- **Primary category:** industrial-engineering-automation
- **Audience:** Fabricators, steelwork contractors, and manufacturing workshops.

### ind-14 [SYNC]
- **Title:** Lean Manufacturing, Process Improvement & Operational Excellence
- **Group:** Industrial (#14)
- **Primary category:** industrial-engineering-automation
- **Audience:** Factory managers, production supervisors, and operations teams.

### ind-15 [SYNC]
- **Title:** Robotics, Motion Control & Smart Industrial Systems
- **Group:** Industrial (#15)
- **Primary category:** industrial-engineering-automation
- **Audience:** Advanced manufacturers, automation integrators, and technical engineering teams.

### re-01 [SYNC]
- **Title:** Professional Solar PV Design, Installation & Commissioning
- **Group:** Renewable Energy (#1)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Solar EPC firms, electrical contractors, installers, and engineering teams.
- **Notes:** Source subgroup: Solar PV design, installation & engineering

### re-02 [SYNC]
- **Title:** Solar PV, Battery Storage & Hybrid Energy Systems
- **Group:** Renewable Energy (#2)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Solar developers, electrical engineers, and energy solution providers.

### re-03 [SYNC]
- **Title:** Solar Plant Operations, Maintenance & Performance Optimisation
- **Group:** Renewable Energy (#3)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Solar plant operators, asset owners, and maintenance teams.

### re-04 [SYNC]
- **Title:** Renewable Energy Financial Modelling & Investment Appraisal
- **Group:** Renewable Energy (#4)
- **Primary category:** engineering-finance-investment
- **Audience:** Banks, investors, developers, finance teams, and energy consultants.
- **Notes:** Source subgroup: Renewable energy finance & investment. Primary finance category.

### re-05 [SYNC]
- **Title:** Solar Project Finance, Funding & Bankability
- **Group:** Renewable Energy (#5)
- **Primary category:** engineering-finance-investment
- **Audience:** Financial institutions, project developers, investment teams, and energy entrepreneurs.

### re-06 [SYNC]
- **Title:** Solar Energy Economics, Tariff Design & Business Models
- **Group:** Renewable Energy (#6)
- **Primary category:** engineering-finance-investment
- **Audience:** Commercial energy users, solar sales teams, utilities, and energy consultants.

### re-07 [SYNC]
- **Title:** Renewable Energy Project Planning, Scheduling & Delivery
- **Group:** Renewable Energy (#7)
- **Primary category:** renewable-energy-sustainability
- **Audience:** EPC contractors, project managers, developers, and engineering consultancies.
- **Notes:** Source subgroup: Renewable energy project planning & management

### re-08 [SYNC]
- **Title:** Renewable Energy Feasibility Studies & Project Development
- **Group:** Renewable Energy (#8)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Developers, investors, consultants, and public-sector energy planners.

### re-09 [SYNC]
- **Title:** Renewable Energy Procurement, Contracts & EPC Management
- **Group:** Renewable Energy (#9)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Procurement departments, EPC companies, developers, and contract managers.

### re-10 [SYNC]
- **Title:** Renewable Energy Monitoring, Analytics & Performance Reporting
- **Group:** Renewable Energy (#10)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Plant operators, asset managers, utilities, and energy consultants.
- **Notes:** Source subgroup: Monitoring, data analytics & energy performance

### re-11 [SYNC]
- **Title:** Energy Management, Auditing & Efficiency Improvement
- **Group:** Renewable Energy (#11)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Factories, hotels, hospitals, commercial buildings, and facilities managers.

### re-12 [SYNC]
- **Title:** Renewable Energy Data Analytics & Predictive Maintenance
- **Group:** Renewable Energy (#12)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Renewable energy operators, maintenance teams, and technical analysts.

### re-13 [SYNC]
- **Title:** Corporate Decarbonisation & Renewable Energy Transition
- **Group:** Renewable Energy (#13)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Corporate sustainability teams, industrial firms, and senior management.
- **Notes:** Source subgroup: Green energy, sustainability & corporate strategy

### re-14 [SYNC]
- **Title:** Green Building Energy Performance & Renewable Integration
- **Group:** Renewable Energy (#14)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Property developers, facilities teams, architects, and building services engineers.

### re-15 [SYNC]
- **Title:** Climate Finance, Carbon Accounting & ESG Reporting
- **Group:** Renewable Energy (#15)
- **Primary category:** renewable-energy-sustainability
- **Audience:** Banks, sustainability professionals, investors, and corporate reporting teams.

### epm-01 [SYNC]
- **Title:** Engineering Project Management Fundamentals
- **Group:** Engineering Project Management & Project Controls (#1)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*

### epm-02 [SYNC]
- **Title:** Project Planning & Scheduling
- **Group:** Engineering Project Management & Project Controls (#2)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*
- **Relation:** related → None
- **Notes:** Related to pm-02 (generic scheduling vs Primavera-specific).

### epm-03 [SYNC]
- **Title:** Digital Planning with Primavera P6 & Microsoft Project
- **Group:** Engineering Project Management & Project Controls (#3)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*
- **Relation:** related → None
- **Notes:** Combines themes of pm-02 and pm-08; kept distinct as engineering controls pathway module.

### epm-04 [SYNC]
- **Title:** Project Cost Estimation, Budgeting & Cost Control
- **Group:** Engineering Project Management & Project Controls (#4)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*

### epm-05 [SYNC]
- **Title:** Earned Value Management (EVM)
- **Group:** Engineering Project Management & Project Controls (#5)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*

### epm-06 [SYNC]
- **Title:** Project Risk Management
- **Group:** Engineering Project Management & Project Controls (#6)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*
- **Relation:** related → None
- **Notes:** Related to pm-05; shorter controls-module form.

### epm-07 [SYNC]
- **Title:** Procurement & Contract Management
- **Group:** Engineering Project Management & Project Controls (#7)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*
- **Relation:** related → None
- **Notes:** Related to pm-06.

### epm-08 [SYNC]
- **Title:** Project Reporting & Management Dashboards
- **Group:** Engineering Project Management & Project Controls (#8)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*

### epm-09 [SYNC]
- **Title:** Integrated Engineering Project Simulation
- **Group:** Engineering Project Management & Project Controls (#9)
- **Primary category:** project-management-infrastructure
- **Audience:** *(not provided in source)*

### ef-01 [SYNC]
- **Title:** Engineering Project Financial Modelling & Investment Appraisal
- **Group:** Engineering finance courses with corporate-ready names (#1)
- **Primary category:** engineering-finance-investment
- **Audience:** Engineering firms, project developers, investors, and financial analysts.
- **Relation:** related → None
- **Notes:** Related to re-04 (general engineering vs renewable focus).

### ef-02 [SYNC]
- **Title:** Engineering Cost Management, Budgeting & Financial Control
- **Group:** Engineering finance courses with corporate-ready names (#2)
- **Primary category:** engineering-finance-investment
- **Audience:** Contractors, engineering consultancies, project managers, and cost engineers.

### ef-03 [SYNC]
- **Title:** Infrastructure Project Finance & Investment Structuring
- **Group:** Engineering finance courses with corporate-ready names (#3)
- **Primary category:** engineering-finance-investment
- **Audience:** Infrastructure developers, banks, investors, and public-sector project teams.

### ef-04 [SYNC]
- **Title:** Construction Cost Planning, Estimating & Commercial Management
- **Group:** Engineering finance courses with corporate-ready names (#4)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** Quantity surveyors, contractors, developers, and commercial managers.
- **Notes:** Commercial/QS emphasis; primary QS category.

### ef-05 [SYNC]
- **Title:** Project Cash Flow Forecasting & Working Capital Management
- **Group:** Engineering finance courses with corporate-ready names (#5)
- **Primary category:** engineering-finance-investment
- **Audience:** Contractors, engineering SMEs, finance managers, and project accountants.

### ef-06 [SYNC]
- **Title:** Financial Risk Analysis, Sensitivity Testing & Scenario Modelling
- **Group:** Engineering finance courses with corporate-ready names (#6)
- **Primary category:** engineering-finance-investment
- **Audience:** Investors, finance teams, consultants, and project developers.

### ef-07 [SYNC]
- **Title:** Energy Project Economics, Tariff Analysis & Financial Modelling
- **Group:** Engineering finance courses with corporate-ready names (#7)
- **Primary category:** engineering-finance-investment
- **Audience:** Solar companies, utilities, energy consultants, and renewable energy investors.
- **Relation:** related → None
- **Notes:** Related to re-06 tariff/business models.

### ef-08 [SYNC]
- **Title:** Capital Investment Planning & Engineering Asset Economics
- **Group:** Engineering finance courses with corporate-ready names (#8)
- **Primary category:** engineering-finance-investment
- **Audience:** Manufacturing companies, utilities, asset managers, and engineering departments.

### ef-09 [SYNC]
- **Title:** Contract Financial Management, Claims & Variation Valuation
- **Group:** Engineering finance courses with corporate-ready names (#9)
- **Primary category:** engineering-finance-investment
- **Audience:** Contractors, quantity surveyors, contract administrators, and commercial teams.

### ef-10 [SYNC]
- **Title:** Engineering Business Finance & Profitability Management
- **Group:** Engineering finance courses with corporate-ready names (#10)
- **Primary category:** engineering-finance-investment
- **Audience:** Engineering company directors, department heads, and business owners.

### ef-11 [SYNC]
- **Title:** Public Infrastructure Investment Appraisal & Economic Evaluation
- **Group:** Engineering finance courses with corporate-ready names (#11)
- **Primary category:** engineering-finance-investment
- **Audience:** Government agencies, infrastructure planners, development organizations, and consultants.

### ef-12 [SYNC]
- **Title:** Digital Engineering Finance: 5D BIM, Cost Analytics & Forecasting
- **Group:** Engineering finance courses with corporate-ready names (#12)
- **Primary category:** quantity-surveying-cost-management
- **Audience:** Quantity surveyors, BIM managers, contractors, and digital construction teams.
- **Relation:** related → None
- **Notes:** Related to arch-bim-04/qs 5D track; finance analytics emphasis. Kept distinct.

### cipm-01 [SYNC]
- **Title:** Advanced Construction & Infrastructure Project Management
- **Group:** Advanced Construction & Infrastructure Project Management (#1)
- **Primary category:** project-management-infrastructure
- **Audience:** Construction companies, infrastructure developers, engineering consultancies, government agencies, and project management firms.
- **Notes:** Source listed as item '2.' with title matching section heading; treated as course #1 in this group.

### cipm-02 [SYNC]
- **Title:** Infrastructure Project Delivery, Controls & Performance Management
- **Group:** Advanced Construction & Infrastructure Project Management (#2)
- **Primary category:** project-management-infrastructure
- **Audience:** Roads, bridges, water, energy, transport, and utilities.

### cipm-03 [SYNC]
- **Title:** Construction Project Controls & Commercial Management
- **Group:** Advanced Construction & Infrastructure Project Management (#3)
- **Primary category:** project-management-infrastructure
- **Audience:** Contractors, quantity surveyors, commercial managers, and consultants.

### cipm-04 [SYNC]
- **Title:** Strategic Infrastructure Planning & Investment Management
- **Group:** Advanced Construction & Infrastructure Project Management (#4)
- **Primary category:** project-management-infrastructure
- **Audience:** Infrastructure investors, government departments, development agencies, and senior executives.

### cipm-05 [SYNC]
- **Title:** Integrated Construction Management & Digital Delivery
- **Group:** Advanced Construction & Infrastructure Project Management (#5)
- **Primary category:** project-management-infrastructure
- **Audience:** Contractors, developers, BIM teams, and multidisciplinary consultancies.

### cipm-06 [SYNC]
- **Title:** Infrastructure Asset Management & Lifecycle Performance
- **Group:** Advanced Construction & Infrastructure Project Management (#6)
- **Primary category:** project-management-infrastructure
- **Audience:** Road agencies, water utilities, transport operators, and infrastructure owners.

### cipm-07 [SYNC]
- **Title:** Construction Quality, Risk & HSE Management
- **Group:** Advanced Construction & Infrastructure Project Management (#7)
- **Primary category:** project-management-infrastructure
- **Audience:** Contractors, site managers, engineering firms, and project supervisors.

### cs-01 [SYNC]
- **Title:** Strategic Leadership & Corporate Performance Management
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#1)
- **Primary category:** corporate-strategy-leadership
- **Audience:** CEOs, directors, senior managers, and department heads.

### cs-02 [SYNC]
- **Title:** Engineering Business Strategy & Competitive Growth
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#2)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Engineering consultancy owners, contractors, and technical business leaders.

### cs-03 [SYNC]
- **Title:** Corporate Financial Strategy, Profitability & Value Creation
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#3)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Business owners, finance directors, and executive teams.

### cs-04 [SYNC]
- **Title:** Business Transformation & Strategic Execution
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#4)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Corporate leaders, transformation managers, and strategy teams.

### cs-05 [SYNC]
- **Title:** Strategic Business Development & Market Expansion for Engineering Firms
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#5)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Engineering firms, consulting practices, contractors, and technical service providers.

### cs-06 [SYNC]
- **Title:** Enterprise Risk, Governance & Strategic Decision-Making
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#6)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Directors, executives, risk managers, and corporate governance teams.

### cs-07 [SYNC]
- **Title:** Digital Transformation & Innovation Strategy
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#7)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Executives, engineering consultancies, construction companies, and innovation leaders.

### cs-08 [SYNC]
- **Title:** Corporate Growth Strategy & Portfolio Management
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#8)
- **Primary category:** corporate-strategy-leadership
- **Audience:** CEOs, strategy directors, investors, and programme leaders.

### cs-09 [SYNC]
- **Title:** Strategic KPI Design, Business Intelligence & Performance Analytics
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#9)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Strategy teams, operations managers, executives, and business analysts.

### cs-10 [SYNC]
- **Title:** Engineering Consultancy Management & Business Excellence
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#10)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Engineering consultants, architectural practices, and professional service firms.

### cs-11 [SYNC]
- **Title:** Construction Business Strategy, Tendering & Profitability
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#11)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Construction directors, contractors, commercial managers, and business owners.

### cs-12 [SYNC]
- **Title:** Executive Leadership, Organisational Strategy & Change Management
- **Group:** Corporate Strategy, Business Transformation & Engineering Leadership (#12)
- **Primary category:** corporate-strategy-leadership
- **Audience:** Senior managers, department heads, directors, and emerging executives.
