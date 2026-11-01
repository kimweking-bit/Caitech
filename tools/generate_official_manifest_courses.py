"""Official catalogue course entries for Phase 3 inventory generation."""
from __future__ import annotations

from typing import Callable

AddFn = Callable[..., None]


def register_all(add: AddFn) -> None:
    _mep(add)
    _arch_bim(add)
    _bim_only(add)
    _qs(add)
    _pm(add)
    _industrial(add)
    _renewable(add)
    _epm(add)
    _eng_finance(add)
    _cipm(add)
    _corp_strategy(add)


def _mep(add: AddFn) -> None:
    g = "MEP Courses"
    c = "mep-building-services"
    add(
        "mep-01",
        "Professional Building Services Engineering & BIM Coordination",
        g,
        "This course equips engineers with practical skills to design and coordinate a building's mechanical, electrical, plumbing, and fire protection systems. Participants learn to use BIM tools to identify clashes and improve collaboration between engineering disciplines.",
        "Engineering consultancies, contractors, property developers, and multidisciplinary design firms.",
        c,
        1,
    )
    add(
        "mep-02",
        "Integrated MEP Design, Analysis & Coordination",
        g,
        "This course focuses on the technical design and analysis of Mechanical, Electrical and Plumbing (MEP) systems. Participants learn system sizing, engineering calculations, equipment selection, technical documentation, and coordination of services.",
        "MEP consultants, building services engineers, and specialist contractors.",
        c,
        2,
    )
    add(
        "mep-03",
        "Advanced Building Services Design & Digital Engineering",
        g,
        "This course combines traditional building services engineering with modern digital technologies such as Revit MEP, BIM coordination, and digital construction workflows. It helps professionals improve design accuracy, productivity, and information management.",
        "Large engineering firms, developers, and organisations adopting digital engineering.",
        c,
        3,
    )
    add(
        "mep-04",
        "MEP Systems Design & Building Services Integration",
        g,
        "This course teaches professionals how mechanical, electrical, plumbing, drainage, and fire protection systems work together within a building. The focus is on system compatibility, space allocation, service routing, and avoiding conflicts during construction.",
        "MEP contractors, installation teams, design engineers, and project managers.",
        c,
        4,
    )
    add(
        "mep-05",
        "Building Services Engineering: Design to Construction",
        g,
        "This course follows the entire building services process, from initial design and engineering calculations to drawings, coordination, installation requirements, and construction documentation. It connects design-office work with practical site implementation.",
        "Construction companies, developers, engineering consultants, and site management teams.",
        c,
        5,
    )


def _arch_bim(add: AddFn) -> None:
    g = "Architecture & BIM corporate courses"
    c = "architecture-bim-digital-construction"
    add(
        "arch-bim-01",
        "Professional Architectural Design & BIM Modelling",
        g,
        "Learn to develop architectural concepts, 3D building models, floor plans, elevations, sections, and construction drawings using BIM software such as Revit and Archicad.",
        "Architectural firms, graduate architects, and design teams.",
        c,
        1,
    )
    add(
        "arch-bim-02",
        "BIM Coordination & Digital Construction Management",
        g,
        "Learn multidisciplinary model integration, clash detection, coordination reviews, information exchange, and construction issue management.",
        "Contractors, developers, BIM coordinators, and project managers.",
        c,
        2,
    )
    add(
        "arch-bim-03",
        "Architectural Visualization & Digital Rendering",
        g,
        "Transform architectural models into realistic images, walkthroughs, and presentations using tools such as Lumion, Twinmotion, D5 Render, and V-Ray.",
        "Architects, interior designers, property marketers, and developers.",
        c,
        3,
    )
    add(
        "arch-bim-04",
        "5D BIM: Quantity Takeoff, Cost Estimation & BOQ",
        g,
        "Learn how to extract quantities from digital models, develop bills of quantities, link model information to cost estimates, and support cost planning.",
        "Quantity surveyors, cost consultants, contractors, and developers.",
        "quantity-surveying-cost-management",
        4,
        notes="Cross-listed under Architecture & BIM in source; primary category QS & Cost per subject matter.",
    )
    add(
        "arch-bim-05",
        "4D BIM: Construction Planning & Project Simulation",
        g,
        "Learn to link 3D building models with construction schedules to simulate project sequencing, communicate work plans, and identify potential scheduling conflicts.",
        "Project planners, construction managers, and contractors.",
        c,
        5,
    )
    add(
        "arch-bim-06",
        "BIM Information Management & Digital Asset Delivery",
        g,
        "Learn how to organise project information, manage model revisions, establish collaborative workflows, and prepare digital information for handover and building operations.",
        "BIM managers, consultants, developers, and facilities management teams.",
        c,
        6,
    )
    add(
        "arch-bim-07",
        "Computational Design & Parametric Architecture",
        g,
        "Learn to generate and optimise architectural forms, automate repetitive design tasks, and explore parametric modelling using Rhino, Grasshopper, and Dynamo.",
        "Advanced architectural practices, computational designers, and innovation teams.",
        c,
        7,
    )
    add(
        "arch-bim-08",
        "Integrated BIM for Architecture, Engineering & Construction",
        g,
        "Learn how architectural, structural, and MEP models connect within a coordinated digital construction workflow, from design development to construction documentation.",
        "Multidisciplinary consultants, design-build firms, and major contractors.",
        c,
        8,
    )


def _bim_only(add: AddFn) -> None:
    g = "BIM-only corporate courses"
    c = "architecture-bim-digital-construction"
    add(
        "bim-01",
        "Professional BIM Modelling & Documentation",
        g,
        "Develop 3D building information models, construction drawings, schedules, and model-based documentation using Revit or Archicad.",
        "BIM modellers, architects, and engineering technicians.",
        c,
        1,
        relation="related",
        notes="Related to arch-bim-01 (architectural design focus vs BIM modelling/documentation).",
    )
    add(
        "bim-02",
        "BIM Coordination & Clash Detection",
        g,
        "Integrate architectural, structural, and MEP models; identify clashes; manage coordination issues; and prepare coordination reports.",
        "BIM coordinators, consultants, and contractors.",
        c,
        2,
        relation="near_duplicate",
        notes="Near-duplicate of arch-bim-02; clash-detection emphasis. Kept as distinct offering.",
    )
    add(
        "bim-03",
        "BIM Management & Implementation",
        g,
        "Learn BIM implementation planning, team responsibilities, model review procedures, project standards, deliverables, and BIM execution plans.",
        "BIM managers, project managers, and consultancy leaders.",
        c,
        3,
    )
    add(
        "bim-04",
        "BIM Information Management & ISO 19650",
        g,
        "Understand information requirements, naming conventions, revision control, approval workflows, and common data environments (CDEs), aligned with ISO 19650 principles.",
        "BIM managers, information managers, and project information teams.",
        c,
        4,
        relation="related",
        notes="Related to arch-bim-06; ISO 19650 / CDE focus vs digital asset delivery.",
    )
    add(
        "bim-05",
        "4D BIM: Construction Planning & Simulation",
        g,
        "Link BIM models to construction schedules to visualise project sequencing, site activities, and construction milestones.",
        "Planners, contractors, and construction managers.",
        c,
        5,
        relation="near_duplicate",
        duplicate_of="arch-bim-05",
        notes="Near-duplicate of arch-bim-05. EXCLUDED from auto-sync; keep arch-bim-05 as canonical.",
        sync=False,
    )
    add(
        "bim-06",
        "5D BIM: Quantity Takeoff & Cost Management",
        g,
        "Extract model-based quantities, connect quantities to cost estimates, and support BOQ preparation, cost planning, and change analysis.",
        "Quantity surveyors, cost consultants, and contractors.",
        "quantity-surveying-cost-management",
        6,
        relation="near_duplicate",
        duplicate_of="arch-bim-04",
        notes="Near-duplicate of arch-bim-04. EXCLUDED from auto-sync.",
        sync=False,
    )
    add(
        "bim-07",
        "BIM Automation & Computational Workflows",
        g,
        "Use Dynamo and visual programming to automate repetitive modelling tasks, standardise outputs, and improve BIM production efficiency.",
        "Advanced BIM modellers, coordinators, and digital engineering teams.",
        c,
        7,
        relation="related",
        notes="Related to arch-bim-07 (parametric architecture vs BIM production automation).",
    )
    add(
        "bim-08",
        "OpenBIM & Interoperability",
        g,
        "Learn IFC-based model exchange, information validation, cross-platform collaboration, and workflows for sharing BIM data between different applications.",
        "BIM consultants, multidisciplinary design teams, and technology specialists.",
        c,
        8,
    )
    add(
        "bim-09",
        "BIM for Facilities Management & Digital Handover",
        g,
        "Prepare structured asset information, equipment schedules, model data, and digital handover deliverables for building operations and maintenance.",
        "Facility managers, asset owners, developers, and operations teams.",
        c,
        9,
        relation="related",
        notes="Related to arch-bim-06 asset delivery; FM/operations emphasis.",
    )
    add(
        "bim-10",
        "BIM Standards, LOD & Quality Assurance",
        g,
        "Learn model quality checks, levels of information need, model auditing, compliance reviews, and quality control against project requirements.",
        "BIM leads, design reviewers, and quality assurance teams.",
        c,
        10,
    )


def _qs(add: AddFn) -> None:
    g = "BIM & Quantity Surveying courses"
    c = "quantity-surveying-cost-management"
    add(
        "qs-01",
        "5D BIM: Quantity Takeoff, Cost Estimation & BOQ",
        g,
        "Learn to extract quantities from BIM models, prepare bills of quantities, develop cost estimates, and link model elements to construction costs.",
        "Quantity surveyors, cost consultants, contractors, and developers.",
        c,
        1,
        relation="exact_duplicate",
        duplicate_of="arch-bim-04",
        notes="Exact/near title match with arch-bim-04. EXCLUDED; canonical is arch-bim-04.",
        sync=False,
    )
    add(
        "qs-02",
        "BIM-Based Measurement & Digital Quantity Surveying",
        g,
        "Learn digital measurement of building elements, measurement rules, quantity extraction, and preparation of measurement sheets using BIM models.",
        None,
        c,
        2,
    )
    add(
        "qs-03",
        "BIM-Based Cost Planning & Cost Management",
        g,
        "Learn how BIM supports preliminary estimates, elemental cost plans, budget tracking, design changes, and cost comparisons throughout a project.",
        None,
        c,
        3,
    )
    add(
        "qs-04",
        "Digital BOQ Preparation, Tendering & Procurement",
        g,
        "Learn to transform measured quantities into structured BOQs, prepare tender pricing documents, analyse bids, and support procurement decisions.",
        None,
        c,
        4,
    )
    add(
        "qs-05",
        "5D BIM for Construction Cost Control & Project Monitoring",
        g,
        "Connect quantities, costs, and construction progress to monitor budget performance, variations, and forecast final project costs.",
        None,
        c,
        5,
    )
    add(
        "qs-06",
        "BIM-Based Material Quantification & Waste Optimisation",
        g,
        "Use model data to estimate concrete, reinforcement, masonry, finishes, and other materials, while identifying opportunities to reduce waste.",
        None,
        c,
        6,
    )
    add(
        "qs-07",
        "BIM for Contract Administration, Variations & Valuations",
        g,
        "Apply model-based quantities and project information to assess variations, interim valuations, progress claims, and changes to contract costs.",
        None,
        c,
        7,
    )
    add(
        "qs-08",
        "BIM & Digital Quantity Surveying Software Masterclass",
        g,
        "Develop practical workflows using Revit schedules, CostX or compatible estimating tools, Excel, and BOQ systems for measurement, estimating, and cost reporting.",
        None,
        c,
        8,
    )


def _pm(add: AddFn) -> None:
    g = "Project Management course names"
    c = "project-management-infrastructure"
    add(
        "pm-01",
        "Advanced Project Planning, Control & Delivery",
        g,
        "Covers project planning, scheduling, resource allocation, progress monitoring, risk management, and delivery within time and budget.",
        "Corporate project teams, engineering firms, and contractors.",
        c,
        1,
    )
    add(
        "pm-02",
        "Professional Project Planning & Scheduling with Primavera P6",
        g,
        "Teaches work breakdown structures, critical path analysis, baselines, resource loading, schedule updates, and project reporting.",
        "Planning engineers, project planners, and construction managers.",
        c,
        2,
    )
    add(
        "pm-03",
        "Project Controls, Cost Management & Performance Monitoring",
        g,
        "Focuses on budgets, earned value analysis, cost forecasting, schedule variance, and early identification of project overruns.",
        "Project controls teams, cost engineers, and senior project managers.",
        c,
        3,
    )
    add(
        "pm-04",
        "Strategic Project & Programme Management",
        g,
        "Covers strategic alignment, programme governance, stakeholder management, benefits realisation, and coordination of multiple related projects.",
        "Senior managers, department heads, and programme leaders.",
        c,
        4,
    )
    add(
        "pm-05",
        "Project Risk Management & Decision Analysis",
        g,
        "Equips professionals to identify risks, assess their likelihood and impact, develop mitigation plans, and make evidence-based decisions.",
        "Project managers, consultants, and risk officers.",
        c,
        5,
    )
    add(
        "pm-06",
        "Contract Administration, Procurement & Project Delivery",
        g,
        "Covers procurement planning, tender evaluation, contract administration, variations, claims, and project documentation.",
        "Contractors, quantity surveyors, procurement officers, and consultants.",
        c,
        6,
    )
    add(
        "pm-07",
        "Construction Project Management & Site Leadership",
        g,
        "Develops competence in site coordination, resource management, quality assurance, health and safety coordination, and construction supervision.",
        "Site engineers, construction managers, and project supervisors.",
        c,
        7,
    )
    add(
        "pm-08",
        "Digital Project Management with Microsoft Project",
        g,
        "Teaches scheduling, task dependencies, resource allocation, progress tracking, and management reporting using Microsoft Project.",
        "Corporate project teams across different industries.",
        c,
        8,
    )
    add(
        "pm-09",
        "Agile Project Management & High-Performance Teams",
        g,
        "Introduces iterative delivery, prioritisation, collaboration, adaptive planning, and continuous improvement for changing project environments.",
        "Technology companies, innovation teams, and business transformation units.",
        c,
        9,
    )
    add(
        "pm-10",
        "Project Leadership, Governance & Executive Decision-Making",
        g,
        "Focuses on leadership, accountability, stakeholder engagement, governance structures, strategic decisions, and project recovery.",
        "Directors, executives, programme managers, and senior project leaders.",
        c,
        10,
    )


def _industrial(add: AddFn) -> None:
    g = "Industrial"
    c = "industrial-engineering-automation"
    rows = [
        (
            "ind-01",
            "Industrial Automation & PLC Systems Engineering",
            "Covers PLC programming, industrial control logic, sensors, actuators, troubleshooting, and automation systems.",
            "Manufacturing plants, automation contractors, and industrial maintenance teams.",
            1,
        ),
        (
            "ind-02",
            "SCADA Systems, Industrial Monitoring & Process Control",
            "Develop skills in supervisory control, real-time monitoring, alarms, data acquisition, and industrial process visualisation.",
            "Utilities, water treatment plants, energy firms, and manufacturing companies.",
            2,
        ),
        (
            "ind-03",
            "Industrial Electrical Systems, Motors & Drives",
            "Covers industrial electrical installations, motor control, variable-frequency drives, protection systems, testing, and fault diagnosis.",
            "Factories, electrical contractors, and maintenance departments.",
            3,
        ),
        (
            "ind-04",
            "Industrial Maintenance & Reliability Engineering",
            "Focuses on preventive maintenance, condition monitoring, root-cause analysis, equipment reliability, and reducing unplanned downtime.",
            "Manufacturing, processing, mining, and energy industries.",
            4,
        ),
        (
            "ind-05",
            "Industrial Instrumentation, Sensors & Process Measurement",
            "Covers flow, pressure, temperature, and level measurement, instrument calibration, transmitters, and control loops.",
            "Process industries, water utilities, food processing, and energy plants.",
            5,
        ),
        (
            "ind-06",
            "Industrial Hydraulics, Pneumatics & Fluid Power Systems",
            "Teaches hydraulic and pneumatic circuits, actuators, valves, system diagnostics, and maintenance.",
            "Manufacturing, heavy equipment, and industrial service companies.",
            6,
        ),
        (
            "ind-07",
            "Industrial Power Systems Analysis & Protection",
            "Covers load flow, short-circuit studies, protection coordination, power quality, and electrical system assessment using appropriate engineering software.",
            "Industrial facilities, utilities, electrical consultants, and energy companies.",
            7,
        ),
        (
            "ind-08",
            "Industrial Energy Management & Power Efficiency",
            "Focuses on energy audits, electrical consumption analysis, efficiency improvements, power factor, and energy cost reduction.",
            "Factories, commercial facilities, and energy-intensive businesses.",
            8,
        ),
        (
            "ind-09",
            "Industrial Water Treatment, Pumping & Process Systems",
            "Covers pumping systems, water treatment processes, pump performance, operational monitoring, and troubleshooting.",
            "Water utilities, food and beverage plants, and industrial facilities.",
            9,
        ),
        (
            "ind-10",
            "Industrial CAD, Mechanical Design & Product Development",
            "Develops practical skills in 3D component modelling, technical drawings, assemblies, design modifications, and manufacturing documentation.",
            "Fabrication workshops, manufacturers, product designers, and engineering firms.",
            10,
        ),
        (
            "ind-11",
            "Process Plant Design, Piping & P&ID Engineering",
            "Covers process flow diagrams, piping and instrumentation diagrams, equipment layouts, pipe routing, and engineering documentation.",
            "Process plants, EPC contractors, and industrial design consultancies.",
            11,
        ),
        (
            "ind-12",
            "Industrial IoT, Smart Manufacturing & Digital Twins",
            "Introduces connected sensors, equipment data, machine monitoring, industrial analytics, and digital representations of assets.",
            "Smart factories, manufacturing firms, and digital transformation teams.",
            12,
        ),
        (
            "ind-13",
            "Industrial Fabrication, Welding Technology & Quality Control",
            "Covers fabrication drawings, welding processes, inspection principles, dimensional quality checks, and production documentation.",
            "Fabricators, steelwork contractors, and manufacturing workshops.",
            13,
        ),
        (
            "ind-14",
            "Lean Manufacturing, Process Improvement & Operational Excellence",
            "Focuses on waste reduction, workflow optimisation, root-cause analysis, productivity improvement, and continuous improvement methods.",
            "Factory managers, production supervisors, and operations teams.",
            14,
        ),
        (
            "ind-15",
            "Robotics, Motion Control & Smart Industrial Systems",
            "Introduces industrial robotics, motion control, automated handling, system integration, and production automation.",
            "Advanced manufacturers, automation integrators, and technical engineering teams.",
            15,
        ),
    ]
    for sid, title, desc, aud, num in rows:
        add(sid, title, g, desc, aud, c, num)


def _renewable(add: AddFn) -> None:
    g = "Renewable Energy"
    c = "renewable-energy-sustainability"
    f = "engineering-finance-investment"
    add(
        "re-01",
        "Professional Solar PV Design, Installation & Commissioning",
        g,
        "Covers solar system sizing, site assessment, panel configuration, inverter selection, protection, installation, testing, and commissioning.",
        "Solar EPC firms, electrical contractors, installers, and engineering teams.",
        c,
        1,
        notes="Source subgroup: Solar PV design, installation & engineering",
    )
    add(
        "re-02",
        "Solar PV, Battery Storage & Hybrid Energy Systems",
        g,
        "Covers battery sizing, hybrid inverters, backup requirements, energy storage integration, and system performance.",
        "Solar developers, electrical engineers, and energy solution providers.",
        c,
        2,
    )
    add(
        "re-03",
        "Solar Plant Operations, Maintenance & Performance Optimisation",
        g,
        "Covers preventive maintenance, fault diagnosis, performance ratio, energy yield, inverter monitoring, and system availability.",
        "Solar plant operators, asset owners, and maintenance teams.",
        c,
        3,
    )
    add(
        "re-04",
        "Renewable Energy Financial Modelling & Investment Appraisal",
        g,
        "Learn project cash-flow modelling, capital and operating expenditure, NPV, IRR, payback period, sensitivity analysis, and investment viability.",
        "Banks, investors, developers, finance teams, and energy consultants.",
        f,
        4,
        notes="Source subgroup: Renewable energy finance & investment. Primary finance category.",
    )
    add(
        "re-05",
        "Solar Project Finance, Funding & Bankability",
        g,
        "Covers financing structures, debt and equity, lender requirements, financial risk assessment, due diligence, and bankability of solar projects.",
        "Financial institutions, project developers, investment teams, and energy entrepreneurs.",
        f,
        5,
    )
    add(
        "re-06",
        "Solar Energy Economics, Tariff Design & Business Models",
        g,
        "Covers electricity cost comparisons, self-consumption, power purchase agreements (PPAs), tariffs, savings analysis, and solar business models.",
        "Commercial energy users, solar sales teams, utilities, and energy consultants.",
        f,
        6,
    )
    add(
        "re-07",
        "Renewable Energy Project Planning, Scheduling & Delivery",
        g,
        "Covers feasibility studies, work breakdown structures, procurement schedules, resource planning, project risks, and commissioning milestones.",
        "EPC contractors, project managers, developers, and engineering consultancies.",
        c,
        7,
        notes="Source subgroup: Renewable energy project planning & management",
    )
    add(
        "re-08",
        "Renewable Energy Feasibility Studies & Project Development",
        g,
        "Covers site screening, solar resource assessment, demand analysis, technical options, grid connection considerations, and preliminary project economics.",
        "Developers, investors, consultants, and public-sector energy planners.",
        c,
        8,
    )
    add(
        "re-09",
        "Renewable Energy Procurement, Contracts & EPC Management",
        g,
        "Covers technical specifications, supplier evaluation, tendering, contract administration, contractor performance, and project delivery risks.",
        "Procurement departments, EPC companies, developers, and contract managers.",
        c,
        9,
    )
    add(
        "re-10",
        "Renewable Energy Monitoring, Analytics & Performance Reporting",
        g,
        "Covers generation monitoring, energy yield analysis, performance indicators, fault alerts, data visualisation, and management reporting.",
        "Plant operators, asset managers, utilities, and energy consultants.",
        c,
        10,
        notes="Source subgroup: Monitoring, data analytics & energy performance",
    )
    add(
        "re-11",
        "Energy Management, Auditing & Efficiency Improvement",
        g,
        "Covers energy audits, consumption baselines, load profiling, energy-saving measures, energy performance indicators, and savings verification.",
        "Factories, hotels, hospitals, commercial buildings, and facilities managers.",
        c,
        11,
    )
    add(
        "re-12",
        "Renewable Energy Data Analytics & Predictive Maintenance",
        g,
        "Introduces trend analysis, equipment fault patterns, maintenance indicators, performance forecasting, and data-driven maintenance planning.",
        "Renewable energy operators, maintenance teams, and technical analysts.",
        c,
        12,
    )
    add(
        "re-13",
        "Corporate Decarbonisation & Renewable Energy Transition",
        g,
        "Covers organisational energy baselines, emissions reduction planning, renewable energy adoption, transition roadmaps, and progress tracking.",
        "Corporate sustainability teams, industrial firms, and senior management.",
        c,
        13,
        notes="Source subgroup: Green energy, sustainability & corporate strategy",
    )
    add(
        "re-14",
        "Green Building Energy Performance & Renewable Integration",
        g,
        "Covers building energy demand, rooftop PV integration, energy efficiency, load analysis, and evaluating opportunities for lower operating costs.",
        "Property developers, facilities teams, architects, and building services engineers.",
        c,
        14,
    )
    add(
        "re-15",
        "Climate Finance, Carbon Accounting & ESG Reporting",
        g,
        "Covers greenhouse gas accounting fundamentals, emissions data, climate-related investment concepts, sustainability indicators, and ESG reporting principles.",
        "Banks, sustainability professionals, investors, and corporate reporting teams.",
        c,
        15,
    )


def _epm(add: AddFn) -> None:
    g = "Engineering Project Management & Project Controls"
    c = "project-management-infrastructure"
    rows = [
        (
            "epm-01",
            "Engineering Project Management Fundamentals",
            "Introduces project life cycles, scope definition, objectives, deliverables, team responsibilities, and work breakdown structures (WBS). Participants learn how to organise engineering projects from initiation to completion.",
            None,
            1,
            None,
            "",
        ),
        (
            "epm-02",
            "Project Planning & Scheduling",
            "Covers activity sequencing, duration estimation, dependencies, critical path analysis, milestones, float, and baseline schedules to help teams plan and monitor project timelines.",
            None,
            2,
            "related",
            "Related to pm-02 (generic scheduling vs Primavera-specific).",
        ),
        (
            "epm-03",
            "Digital Planning with Primavera P6 & Microsoft Project",
            "Teaches participants to develop project schedules, allocate resources, set baselines, update progress, analyse delays, and generate planning reports using industry scheduling software.",
            None,
            3,
            "related",
            "Combines themes of pm-02 and pm-08; kept distinct as engineering controls pathway module.",
        ),
        (
            "epm-04",
            "Project Cost Estimation, Budgeting & Cost Control",
            "Explains how to prepare project budgets, track expenditure, compare actual costs against planned costs, analyse variances, and forecast the final project cost.",
            None,
            4,
            None,
            "",
        ),
        (
            "epm-05",
            "Earned Value Management (EVM)",
            "Teaches how to measure project performance by comparing planned work, completed work, and actual expenditure. Participants learn to calculate cost and schedule performance indicators and forecast project outcomes.",
            None,
            5,
            None,
            "",
        ),
        (
            "epm-06",
            "Project Risk Management",
            "Covers risk identification, risk registers, probability and impact assessment, mitigation strategies, contingency planning, and ongoing risk monitoring to reduce project uncertainty.",
            None,
            6,
            "related",
            "Related to pm-05; shorter controls-module form.",
        ),
        (
            "epm-07",
            "Procurement & Contract Management",
            "Covers procurement planning, tender evaluation, supplier selection, contract administration, variations, claims, and change control to improve commercial and contractual performance.",
            None,
            7,
            "related",
            "Related to pm-06.",
        ),
        (
            "epm-08",
            "Project Reporting & Management Dashboards",
            "Teaches participants to prepare progress reports, performance dashboards, cost and schedule summaries, risk updates, and management reports that support timely decisions.",
            None,
            8,
            None,
            "",
        ),
        (
            "epm-09",
            "Integrated Engineering Project Simulation",
            "Participants apply the skills learned to a practical engineering project, integrating planning, scheduling, budgeting, risk assessment, progress monitoring, and reporting in one coordinated exercise.",
            None,
            9,
            None,
            "",
        ),
    ]
    for sid, title, desc, aud, num, rel, notes in rows:
        kw = {}
        if rel:
            kw["relation"] = rel
        if notes:
            kw["notes"] = notes
        add(sid, title, g, desc, aud, c, num, **kw)


def _eng_finance(add: AddFn) -> None:
    g = "Engineering finance courses with corporate-ready names"
    c = "engineering-finance-investment"
    qs = "quantity-surveying-cost-management"
    add(
        "ef-01",
        "Engineering Project Financial Modelling & Investment Appraisal",
        g,
        "Learn to build financial models, forecast project cash flows, calculate NPV, IRR and payback periods, and assess the financial viability of engineering investments.",
        "Engineering firms, project developers, investors, and financial analysts.",
        c,
        1,
        relation="related",
        notes="Related to re-04 (general engineering vs renewable focus).",
    )
    add(
        "ef-02",
        "Engineering Cost Management, Budgeting & Financial Control",
        g,
        "Covers project budgets, cost baselines, expenditure tracking, variance analysis, cash-flow forecasting, and cost-overrun prevention.",
        "Contractors, engineering consultancies, project managers, and cost engineers.",
        c,
        2,
    )
    add(
        "ef-03",
        "Infrastructure Project Finance & Investment Structuring",
        g,
        "Explains capital expenditure, debt and equity financing, funding structures, lender requirements, financial risk allocation, and project bankability.",
        "Infrastructure developers, banks, investors, and public-sector project teams.",
        c,
        3,
    )
    add(
        "ef-04",
        "Construction Cost Planning, Estimating & Commercial Management",
        g,
        "Covers preliminary estimates, detailed cost plans, BOQ pricing, tender analysis, cash flow, commercial risks, and cost reporting throughout construction.",
        "Quantity surveyors, contractors, developers, and commercial managers.",
        qs,
        4,
        notes="Commercial/QS emphasis; primary QS category.",
    )
    add(
        "ef-05",
        "Project Cash Flow Forecasting & Working Capital Management",
        g,
        "Teaches cash-flow forecasting, payment schedules, receivables, payables, funding gaps, and working capital planning to help businesses maintain project liquidity.",
        "Contractors, engineering SMEs, finance managers, and project accountants.",
        c,
        5,
    )
    add(
        "ef-06",
        "Financial Risk Analysis, Sensitivity Testing & Scenario Modelling",
        g,
        "Learn to test how changes in costs, interest rates, revenues, inflation, and project delays affect financial returns and project viability.",
        "Investors, finance teams, consultants, and project developers.",
        c,
        6,
    )
    add(
        "ef-07",
        "Energy Project Economics, Tariff Analysis & Financial Modelling",
        g,
        "Covers energy project cash flows, electricity tariffs, energy savings, levelized cost of energy (LCOE), investment returns, and commercial feasibility.",
        "Solar companies, utilities, energy consultants, and renewable energy investors.",
        c,
        7,
        relation="related",
        notes="Related to re-06 tariff/business models.",
    )
    add(
        "ef-08",
        "Capital Investment Planning & Engineering Asset Economics",
        g,
        "Helps organizations evaluate equipment purchases, asset replacement, lifecycle costs, maintenance expenditure, and long-term capital investment decisions.",
        "Manufacturing companies, utilities, asset managers, and engineering departments.",
        c,
        8,
    )
    add(
        "ef-09",
        "Contract Financial Management, Claims & Variation Valuation",
        g,
        "Covers the financial implications of contract changes, variation pricing, payment certificates, claims evaluation, cost recovery, and commercial reporting.",
        "Contractors, quantity surveyors, contract administrators, and commercial teams.",
        c,
        9,
    )
    add(
        "ef-10",
        "Engineering Business Finance & Profitability Management",
        g,
        "Covers project margins, overhead allocation, pricing, break-even analysis, profitability reporting, financial performance, and business decision-making.",
        "Engineering company directors, department heads, and business owners.",
        c,
        10,
    )
    add(
        "ef-11",
        "Public Infrastructure Investment Appraisal & Economic Evaluation",
        g,
        "Covers economic feasibility, cost-benefit analysis, lifecycle costing, economic and financial appraisal, and evaluation of public infrastructure investments.",
        "Government agencies, infrastructure planners, development organizations, and consultants.",
        c,
        11,
    )
    add(
        "ef-12",
        "Digital Engineering Finance: 5D BIM, Cost Analytics & Forecasting",
        g,
        "Integrates model-based quantity extraction, BOQ preparation, cost estimation, budget tracking, and digital project cost reporting.",
        "Quantity surveyors, BIM managers, contractors, and digital construction teams.",
        qs,
        12,
        relation="related",
        notes="Related to arch-bim-04/qs 5D track; finance analytics emphasis. Kept distinct.",
    )


def _cipm(add: AddFn) -> None:
    g = "Advanced Construction & Infrastructure Project Management"
    c = "project-management-infrastructure"
    add(
        "cipm-01",
        "Advanced Construction & Infrastructure Project Management",
        g,
        "It covers the complete project lifecycle, from planning and procurement to construction, cost control, quality, risk, and handover.",
        "Construction companies, infrastructure developers, engineering consultancies, government agencies, and project management firms.",
        c,
        1,
        notes="Source listed as item '2.' with title matching section heading; treated as course #1 in this group.",
    )
    add(
        "cipm-02",
        "Infrastructure Project Delivery, Controls & Performance Management",
        g,
        "Emphasises schedule performance, cost management, risk, reporting, and successful delivery of major infrastructure projects.",
        "Roads, bridges, water, energy, transport, and utilities.",
        c,
        2,
    )
    add(
        "cipm-03",
        "Construction Project Controls & Commercial Management",
        g,
        "Focuses on project budgets, planning, scheduling, contracts, procurement, variations, claims, and profitability.",
        "Contractors, quantity surveyors, commercial managers, and consultants.",
        c,
        3,
    )
    add(
        "cipm-04",
        "Strategic Infrastructure Planning & Investment Management",
        g,
        "Covers infrastructure prioritisation, feasibility, investment appraisal, project selection, funding, and portfolio planning.",
        "Infrastructure investors, government departments, development agencies, and senior executives.",
        c,
        4,
    )
    add(
        "cipm-05",
        "Integrated Construction Management & Digital Delivery",
        g,
        "Combines construction planning, BIM coordination, digital project monitoring, reporting, and construction information management.",
        "Contractors, developers, BIM teams, and multidisciplinary consultancies.",
        c,
        5,
    )
    add(
        "cipm-06",
        "Infrastructure Asset Management & Lifecycle Performance",
        g,
        "Covers asset registers, condition assessment, maintenance planning, lifecycle costing, performance monitoring, and renewal strategies.",
        "Road agencies, water utilities, transport operators, and infrastructure owners.",
        c,
        6,
    )
    add(
        "cipm-07",
        "Construction Quality, Risk & HSE Management",
        g,
        "Covers quality assurance, inspection and testing, construction risk, health and safety management, compliance, and corrective actions.",
        "Contractors, site managers, engineering firms, and project supervisors.",
        c,
        7,
    )


def _corp_strategy(add: AddFn) -> None:
    g = "Corporate Strategy, Business Transformation & Engineering Leadership"
    c = "corporate-strategy-leadership"
    rows = [
        (
            "cs-01",
            "Strategic Leadership & Corporate Performance Management",
            "Learn to develop corporate strategies, translate vision into measurable objectives, establish KPIs, allocate resources, and monitor organisational performance.",
            "CEOs, directors, senior managers, and department heads.",
            1,
        ),
        (
            "cs-02",
            "Engineering Business Strategy & Competitive Growth",
            "Covers business positioning, market analysis, service differentiation, pricing strategy, business development, and growth planning for engineering companies.",
            "Engineering consultancy owners, contractors, and technical business leaders.",
            2,
        ),
        (
            "cs-03",
            "Corporate Financial Strategy, Profitability & Value Creation",
            "Learn to assess profitability, allocate capital, evaluate investments, improve margins, and connect financial performance with strategic decisions.",
            "Business owners, finance directors, and executive teams.",
            3,
        ),
        (
            "cs-04",
            "Business Transformation & Strategic Execution",
            "Focuses on converting strategy into action through transformation roadmaps, organisational alignment, change management, and measurable implementation plans.",
            "Corporate leaders, transformation managers, and strategy teams.",
            4,
        ),
        (
            "cs-05",
            "Strategic Business Development & Market Expansion for Engineering Firms",
            "Covers client acquisition, tender positioning, strategic partnerships, key account management, market entry, and sustainable revenue growth.",
            "Engineering firms, consulting practices, contractors, and technical service providers.",
            5,
        ),
        (
            "cs-06",
            "Enterprise Risk, Governance & Strategic Decision-Making",
            "Covers enterprise risk management, governance structures, decision frameworks, strategic uncertainty, business continuity, and accountability.",
            "Directors, executives, risk managers, and corporate governance teams.",
            6,
        ),
        (
            "cs-07",
            "Digital Transformation & Innovation Strategy",
            "Helps organisations identify digital opportunities, assess technology investments, redesign workflows, and develop practical digital transformation roadmaps.",
            "Executives, engineering consultancies, construction companies, and innovation leaders.",
            7,
        ),
        (
            "cs-08",
            "Corporate Growth Strategy & Portfolio Management",
            "Covers business portfolio analysis, opportunity prioritisation, resource allocation, investment selection, and balancing risk against expected returns.",
            "CEOs, strategy directors, investors, and programme leaders.",
            8,
        ),
        (
            "cs-09",
            "Strategic KPI Design, Business Intelligence & Performance Analytics",
            "Teaches participants to develop meaningful KPIs, design management dashboards, analyse performance gaps, and use data to improve business decisions.",
            "Strategy teams, operations managers, executives, and business analysts.",
            9,
        ),1
        (
            "cs-10",
            "Engineering Consultancy Management & Business Excellence",
            "Focuses on consultancy operations, fee proposals, resource utilisation, project profitability, client relationships, quality systems, and business development.",
            "Engineering consultants, architectural practices, and professional service firms.",
            10,
        ),
        (
            "cs-11",
            "Construction Business Strategy, Tendering & Profitability",
            "Covers tender strategy, bid/no-bid decisions, contract risk, pricing, market positioning, project margins, and sustainable growth for construction businesses.",
            "Construction directors, contractors, commercial managers, and business owners.",
            11,
        ),
        (
            "cs-12",
            "Executive Leadership, Organisational Strategy & Change Management",
            "Develops leadership capability in organisational alignment, team performance, stakeholder engagement, succession planning, and leading change.",
            "Senior managers, department heads, directors, and emerging executives.",
            12,
        ),
    ]
    for sid, title, desc, aud, num in rows:
        add(sid, title, g, desc, aud, c, num)
