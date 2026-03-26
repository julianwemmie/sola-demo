#!/usr/bin/env python3
"""Generate a realistic demo contract PDF with legal boilerplate, tables, and bid requirements."""

from fpdf import FPDF
import os

class ContractPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, "CONFIDENTIAL -- Greenfield Municipal Utilities District", align="L")
        self.cell(0, 10, f"Page {self.page_no()} of {{nb}}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-20)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(140, 140, 140)
        self.cell(0, 5, "Contract No. GMU-2026-0452  |  Rev. 3  |  Issued: March 10, 2026", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 5, "Greenfield Municipal Utilities District  --  All Rights Reserved", align="C")

    def section_title(self, num, title):
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(20, 50, 100)
        self.ln(6)
        self.cell(0, 8, f"{num}. {title}", new_x="LMARGIN", new_y="NEXT")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)
        self.set_text_color(30, 30, 30)

    def sub_section(self, num, title):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(40, 40, 40)
        self.ln(3)
        self.cell(0, 7, f"{num} {title}", new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def clause(self, label, text):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 30, 30)
        self.cell(18, 5.5, label)
        self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 5.5, text)
        self.ln(1.5)

    def add_table(self, headers, rows, col_widths=None):
        if col_widths is None:
            col_widths = [190 / len(headers)] * len(headers)

        # Header row
        self.set_font("Helvetica", "B", 9)
        self.set_fill_color(30, 60, 110)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 8, h, border=1, fill=True, align="C")
        self.ln()

        # Data rows
        self.set_font("Helvetica", "", 9)
        self.set_text_color(30, 30, 30)
        fill = False
        for row in rows:
            if fill:
                self.set_fill_color(235, 240, 248)
            else:
                self.set_fill_color(255, 255, 255)
            max_h = 7
            for i, cell in enumerate(row):
                self.cell(col_widths[i], max_h, str(cell), border=1, fill=True, align="C" if i > 0 else "L")
            self.ln()
            fill = not fill
        self.ln(4)


def build_pdf():
    pdf = ContractPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=25)

    # ═══════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.ln(30)

    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(20, 50, 100)
    pdf.cell(0, 14, "REQUEST FOR PROPOSAL", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 10, "Contract No. GMU-2026-0452", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 10, "Comprehensive Water Treatment Facility\nModernization and Expansion Project\nPhase II -- Advanced Filtration Systems", align="C")
    pdf.ln(12)

    pdf.set_draw_color(20, 50, 100)
    pdf.line(60, pdf.get_y(), 150, pdf.get_y())
    pdf.ln(10)

    info = [
        ("Issuing Authority:", "Greenfield Municipal Utilities District"),
        ("Department:", "Capital Projects & Infrastructure Division"),
        ("Project Manager:", "Dr. Sarah Chen, P.E."),
        ("Issue Date:", "March 10, 2026"),
        ("Proposal Due Date:", "April 28, 2026, 2:00 PM PST"),
        ("Pre-Bid Conference:", "March 24, 2026, 10:00 AM PST"),
        ("Estimated Budget Range:", "$14,500,000 -- $18,200,000"),
        ("Contract Duration:", "36 months from Notice to Proceed"),
        ("DUNS Number:", "07-842-6193"),
        ("NAICS Code:", "237110"),
    ]
    pdf.set_font("Helvetica", "", 11)
    for label, value in info:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(60, 7, label, align="R")
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(0, 7, f"  {value}", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(20)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(140, 140, 140)
    pdf.multi_cell(0, 5, (
        "This document contains proprietary and confidential information belonging to Greenfield "
        "Municipal Utilities District. Unauthorized reproduction, distribution, or disclosure of this "
        "material is strictly prohibited. All bidders must execute the enclosed Non-Disclosure Agreement "
        "prior to submitting a response."
    ), align="C")

    # ═══════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(20, 50, 100)
    pdf.cell(0, 12, "TABLE OF CONTENTS", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    toc = [
        ("1.", "Introduction and Project Overview", "3"),
        ("2.", "Scope of Work", "4"),
        ("3.", "Technical Specifications", "6"),
        ("4.", "Bid Requirements and Evaluation Criteria", "8"),
        ("5.", "Pricing Schedule and Cost Breakdown", "10"),
        ("6.", "General Terms and Conditions", "12"),
        ("7.", "Insurance and Bonding Requirements", "14"),
        ("8.", "Compliance and Regulatory Requirements", "15"),
        ("9.", "Indemnification and Limitation of Liability", "16"),
        ("10.", "Dispute Resolution and Governing Law", "17"),
        ("11.", "Termination Provisions", "18"),
        ("12.", "Representations and Warranties", "19"),
        ("13.", "Signature Page and Execution", "20"),
        ("", "Appendix A -- Equipment Specifications Matrix", "21"),
        ("", "Appendix B -- Site Plans and Drawings Reference", "22"),
        ("", "Appendix C -- Prevailing Wage Rate Schedule", "23"),
        ("", "Appendix D -- Non-Disclosure Agreement", "24"),
    ]
    for num, title, page in toc:
        pdf.set_font("Helvetica", "B" if num else "", 10)
        pdf.set_text_color(30, 30, 30)
        label = f"{num} {title}" if num else f"     {title}"
        dots = "." * (70 - len(label))
        pdf.cell(160, 7, f"{label} {dots}", align="L")
        pdf.cell(30, 7, page, align="R", new_x="LMARGIN", new_y="NEXT")

    # ═══════════════════════════════════════════════════════════════
    # 1. INTRODUCTION
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("1", "INTRODUCTION AND PROJECT OVERVIEW")

    pdf.body_text(
        "The Greenfield Municipal Utilities District (hereinafter referred to as the \"District\" or "
        "\"Owner\") hereby solicits sealed proposals from qualified contractors, firms, and joint ventures "
        "for the comprehensive modernization and expansion of the Greenfield Water Treatment Facility "
        "(the \"Facility\"), located at 4200 Clearwater Boulevard, Greenfield, CA 93927 (the \"Project Site\")."
    )
    pdf.body_text(
        "The existing Facility, originally commissioned in 1987 and last upgraded in 2011, currently "
        "processes approximately 28 million gallons per day (MGD) serving a population of 142,000 "
        "residents across the District's service territory. Projected population growth of 2.3% annually "
        "necessitates expansion to a treatment capacity of 42 MGD by 2030, with infrastructure designed "
        "to accommodate an ultimate capacity of 56 MGD."
    )
    pdf.body_text(
        "This Phase II procurement specifically addresses the replacement and upgrading of advanced "
        "filtration systems, including but not limited to: granular activated carbon (GAC) contactors, "
        "membrane bioreactors (MBR), ultraviolet (UV) disinfection arrays, and supervisory control and "
        "data acquisition (SCADA) system integration. The selected Contractor shall be responsible for "
        "design-build services, equipment procurement, installation, testing, commissioning, and a "
        "minimum two-year post-completion warranty period."
    )

    pdf.sub_section("1.1", "Project Background and History")
    pdf.body_text(
        "In January 2024, the District completed a Comprehensive Facility Assessment (CFA) conducted "
        "by Arcadis U.S., Inc., which identified 47 critical infrastructure deficiencies and 23 regulatory "
        "compliance gaps. The CFA recommended a phased modernization approach divided into three phases:"
    )
    pdf.clause("(a)", "Phase I -- Intake and Raw Water Conveyance (completed December 2025)")
    pdf.clause("(b)", "Phase II -- Advanced Filtration and Treatment Systems (this procurement)")
    pdf.clause("(c)", "Phase III -- Distribution System and Storage Upgrades (anticipated FY 2028)")

    pdf.body_text(
        "The District's Board of Directors approved Resolution No. 2025-089 on September 15, 2025, "
        "authorizing the allocation of $52.3 million from the Capital Improvement Fund (CIF) for "
        "Phases II and III combined. Additional funding has been secured through a State Revolving Fund "
        "(SRF) loan agreement (Agreement No. SRF-26-0183) and a Federal Water Infrastructure Finance "
        "and Innovation Act (WIFIA) credit facility."
    )

    pdf.sub_section("1.2", "Key Project Milestones")
    pdf.add_table(
        ["Milestone", "Target Date", "Duration", "Responsible Party"],
        [
            ["Notice to Proceed (NTP)", "June 2, 2026", "--", "District"],
            ["Preliminary Design Review (30%)", "Sept 15, 2026", "105 days", "Contractor"],
            ["Final Design Approval (100%)", "Feb 28, 2027", "166 days", "District / Contractor"],
            ["Equipment Procurement Complete", "Aug 30, 2027", "183 days", "Contractor"],
            ["Structural & Civil Work Complete", "Mar 15, 2028", "197 days", "Contractor"],
            ["Mechanical / Electrical Install", "Sept 30, 2028", "199 days", "Contractor"],
            ["System Integration & Testing", "Jan 31, 2029", "123 days", "Contractor"],
            ["Final Commissioning & Acceptance", "May 30, 2029", "119 days", "District / Contractor"],
            ["Warranty Period Commencement", "June 1, 2029", "24 months", "Contractor"],
        ],
        col_widths=[62, 38, 35, 55],
    )

    pdf.sub_section("1.3", "Definitions")
    definitions = [
        ('"Agreement"', "means this Contract together with all Exhibits, Appendices, and Amendments thereto."),
        ('"Change Order"', "means a written instrument signed by both parties modifying the scope, price, or schedule."),
        ('"Completion Date"', "means the date on which Substantial Completion is achieved as certified by the Engineer."),
        ('"Defective Work"', "means Work that does not conform to the Contract Documents or applicable codes and standards."),
        ('"Engineer"', "means the District's authorized representative responsible for technical oversight."),
        ('"Force Majeure"', "means acts of God, war, terrorism, pandemic, government orders, or other events beyond reasonable control."),
        ('"Punch List"', "means a list of items to be completed or corrected after Substantial Completion."),
        ('"Retainage"', "means the percentage of each progress payment withheld by the District as security for performance."),
        ('"Subcontractor"', "means any person or entity contracted by the Contractor to perform a portion of the Work."),
        ('"Work"', "means all labor, materials, equipment, and services required to complete the Project."),
    ]
    for term, defn in definitions:
        pdf.clause(term, defn)

    # ═══════════════════════════════════════════════════════════════
    # 2. SCOPE OF WORK
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("2", "SCOPE OF WORK")

    pdf.body_text(
        "The Contractor shall furnish all labor, materials, equipment, tools, transportation, permits, "
        "and supervision necessary for the complete and proper execution of the Work as described herein. "
        "The scope encompasses, but is not limited to, the following major work packages:"
    )

    pdf.sub_section("2.1", "Demolition and Site Preparation")
    pdf.body_text(
        "Remove and properly dispose of existing Filter Building No. 2 (approximately 12,400 sq ft), "
        "including all internal equipment, piping, electrical systems, and foundation elements. Site "
        "grading shall achieve a finished floor elevation of 247.5 feet NAVD88. All demolition debris "
        "shall be recycled or disposed of in accordance with CalRecycle requirements. Hazardous materials "
        "abatement (identified asbestos-containing materials in pipe insulation and floor tiles per the "
        "Phase I Environmental Site Assessment dated October 2025) shall be performed by a DOSH-licensed "
        "abatement contractor under continuous air monitoring."
    )

    pdf.sub_section("2.2", "Granular Activated Carbon (GAC) Contactor System")
    pdf.body_text(
        "Design, furnish, and install a minimum of eight (8) GAC gravity contactors, each with a "
        "minimum empty bed contact time (EBCT) of 15 minutes at the design flow rate. Contactors shall "
        "be constructed of NSF/ANSI 61 certified materials with 316L stainless steel internals. Each "
        "contactor shall include automated backwash capabilities, underdrain systems with Leopold-type "
        "or approved equal block underdrains, and continuous turbidity monitoring. The GAC media shall "
        "be Calgon Filtrasorb 400 or approved equal, with an initial charge of approximately 480,000 "
        "pounds of virgin carbon."
    )

    pdf.sub_section("2.3", "Membrane Bioreactor (MBR) System")
    pdf.body_text(
        "Supply and install four (4) MBR trains, each rated at 10.5 MGD peak wet weather flow. "
        "Membrane modules shall be hollow-fiber PVDF with a nominal pore size of 0.04 microns. The "
        "system shall achieve a minimum LOG removal value (LRV) of 4.0 for Cryptosporidium and 4.0 "
        "for Giardia as verified by third-party challenge testing in accordance with USEPA Membrane "
        "Filtration Guidance Manual (EPA 815-R-06-009). Include all ancillary equipment: permeate pumps, "
        "air scour blowers, chemical cleaning systems (CIP), and programmable logic controllers (PLCs)."
    )

    pdf.sub_section("2.4", "UV Disinfection System")
    pdf.body_text(
        "Furnish and install a medium-pressure UV disinfection system capable of delivering a minimum "
        "UV dose of 40 mJ/cm2 at the design flow rate and a UV transmittance (UVT) of 75%. The system "
        "shall be validated per USEPA UV Disinfection Guidance Manual (EPA 815-R-06-007) and NSF/ANSI "
        "55 Class A standards. Reactor vessels shall be 316L stainless steel with automatic wiper systems "
        "for quartz sleeve cleaning. Provide UV intensity sensors, flow-paced dose control, and "
        "redundant reactor capacity (N+1 configuration)."
    )

    pdf.sub_section("2.5", "SCADA System Integration")
    pdf.body_text(
        "Integrate all new treatment systems into the District's existing Wonderware System Platform "
        "(version 2020 R2 SP1) SCADA architecture. Provide all necessary I/O modules, network switches, "
        "fiber optic cabling, HMI screens, and historian tags. The Contractor shall develop a minimum "
        "of 45 new HMI graphic screens, 2,500 control points, and 180 alarm setpoints. All SCADA "
        "programming shall comply with ISA-101 HMI design standards and the District's existing "
        "naming conventions (ref. District Standard SP-SCADA-001 Rev. 4)."
    )

    pdf.sub_section("2.6", "Electrical and Instrumentation")
    pdf.body_text(
        "Provide complete electrical power distribution for all new equipment, including: one (1) new "
        "2,500 kVA pad-mounted transformer (12.47 kV to 480/277V, 3-phase), two (2) 480V motor control "
        "centers with variable frequency drives, one (1) 200 kW natural gas standby generator with "
        "automatic transfer switch, and all associated conduit, cabling, grounding, and lightning "
        "protection systems. All electrical work shall comply with NEC 2023, NFPA 820, and the "
        "District's Electrical Design Standards (EDS-2024)."
    )

    # ═══════════════════════════════════════════════════════════════
    # 3. TECHNICAL SPECIFICATIONS
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("3", "TECHNICAL SPECIFICATIONS")

    pdf.sub_section("3.1", "Water Quality Performance Standards")
    pdf.body_text(
        "The completed treatment system shall consistently produce finished water meeting or exceeding "
        "all applicable federal and state drinking water standards, including but not limited to the "
        "Safe Drinking Water Act (SDWA), California Code of Regulations Title 22, and the District's "
        "internal quality targets as specified below:"
    )

    pdf.add_table(
        ["Parameter", "MCL / Standard", "District Target", "Test Method", "Frequency"],
        [
            ["Turbidity", "< 1.0 NTU", "< 0.10 NTU", "EPA 180.1", "Continuous"],
            ["Total Organic Carbon", "TT (% removal)", "< 2.0 mg/L", "SM 5310C", "Daily composite"],
            ["Disinfection Byproducts (TTHMs)", "80 ug/L", "< 40 ug/L", "EPA 524.2", "Quarterly"],
            ["Haloacetic Acids (HAA5)", "60 ug/L", "< 30 ug/L", "EPA 552.3", "Quarterly"],
            ["Cryptosporidium", "TT (99.99%)", "4-log removal", "EPA 1623.1", "Monthly"],
            ["Giardia lamblia", "TT (99.9%)", "4-log removal", "EPA 1623.1", "Monthly"],
            ["Lead (at entry point)", "AL: 15 ug/L", "< 5 ug/L", "EPA 200.8", "Semi-annual"],
            ["PFOS/PFOA", "4.0 ng/L (proposed)", "< 2.0 ng/L", "EPA 533", "Quarterly"],
            ["Manganese", "50 ug/L (SMCL)", "< 20 ug/L", "EPA 200.8", "Weekly"],
            ["Total Coliform", "< 5% positive", "0% positive", "SM 9223B", "Daily"],
        ],
        col_widths=[42, 32, 32, 36, 38],
    )

    pdf.sub_section("3.2", "Equipment Performance Requirements")
    pdf.add_table(
        ["Equipment", "Parameter", "Minimum Requirement", "Verification Method"],
        [
            ["GAC Contactors", "EBCT at design flow", ">= 15 minutes", "Flow test / hydraulic profile"],
            ["GAC Contactors", "Iodine number (carbon)", ">= 1,000 mg/g", "ASTM D4607"],
            ["GAC Contactors", "Backwash rate", "15-20 gpm/sf", "Flow measurement"],
            ["MBR Membranes", "Pore size", "0.04 um nominal", "Manufacturer cert."],
            ["MBR Membranes", "Specific flux", ">= 15 GFD/psi", "Clean water test"],
            ["MBR Membranes", "Design TMP", "<= 8 psi (operating)", "Pressure transducers"],
            ["UV Reactors", "UV dose (validated)", ">= 40 mJ/cm2", "Bioassay (MS2 phage)"],
            ["UV Reactors", "Lamp life", ">= 12,000 hours", "Manufacturer warranty"],
            ["UV Reactors", "UVT operating range", "70-98%", "Online UVT analyzer"],
            ["SCADA", "System availability", ">= 99.95%", "Uptime logs (12 months)"],
            ["SCADA", "Alarm response time", "< 2 seconds", "Performance test"],
            ["Generator", "Load pickup time", "< 10 seconds", "Transfer test"],
        ],
        col_widths=[38, 42, 42, 58],
    )

    pdf.sub_section("3.3", "Materials and Standards")
    pdf.body_text(
        "All materials, equipment, and workmanship shall conform to the latest editions of the following "
        "standards and specifications, as applicable: AWWA Standards (C-series for treatment plant "
        "equipment), ASTM Standards, ASME Boiler and Pressure Vessel Code, NSF/ANSI 61 (drinking water "
        "system components), IEEE Standards (electrical equipment), NEMA Standards, ISA Standards "
        "(instrumentation), and UL/FM listings. Where conflicts exist between referenced standards, "
        "the more stringent requirement shall govern."
    )

    # ═══════════════════════════════════════════════════════════════
    # 4. BID REQUIREMENTS AND EVALUATION CRITERIA
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("4", "BID REQUIREMENTS AND EVALUATION CRITERIA")

    pdf.sub_section("4.1", "Bidder Eligibility Requirements")
    pdf.body_text(
        "To be considered for award, bidders must demonstrate compliance with ALL of the following "
        "minimum qualifications at the time of proposal submission. Failure to meet any single "
        "requirement shall result in the proposal being deemed non-responsive."
    )
    requirements = [
        "Possess a valid California Class A General Engineering Contractor's License (or equivalent) with no disciplinary actions within the preceding five (5) years.",
        "Demonstrate a minimum of ten (10) years of continuous experience in water/wastewater treatment facility construction with at least five (5) completed projects of comparable scope and complexity (minimum $8 million contract value each).",
        "Maintain a current Experience Modification Rate (EMR) of 0.90 or below for the most recent three-year period as reported by the National Council on Compensation Insurance (NCCI).",
        "Provide audited financial statements for the preceding three (3) fiscal years demonstrating a minimum current ratio of 1.5:1 and a minimum net worth of $25,000,000.",
        "Employ or subcontract a minimum of two (2) Professional Engineers (P.E.) licensed in the State of California with specific expertise in water treatment process design.",
        "Maintain ISO 9001:2015 certification for quality management systems, or demonstrate an equivalent quality assurance program acceptable to the District.",
        "Not be currently debarred, suspended, or proposed for debarment by any federal, state, or local government entity.",
    ]
    for i, req in enumerate(requirements, 1):
        pdf.clause(f"({chr(96+i)})", req)

    pdf.sub_section("4.2", "Proposal Submission Requirements")
    pdf.body_text(
        "Proposals shall be submitted in two separate sealed envelopes: one containing the Technical "
        "Proposal (original plus six copies) and one containing the Price Proposal (original plus two "
        "copies). Electronic submissions in PDF format shall also be uploaded to the District's "
        "ProcureNow portal (https://procurement.greenfieldutilities.gov) no later than the deadline. "
        "Late submissions will not be accepted regardless of cause."
    )
    pdf.body_text("Each Technical Proposal shall include, at a minimum, the following sections:")
    sections = [
        "Executive Summary (maximum 3 pages)",
        "Firm Qualifications and Organizational Structure",
        "Key Personnel Resumes and Certifications (minimum: Project Manager, Design Engineer, Construction Superintendent, QA/QC Manager, Safety Officer)",
        "Project Understanding and Approach",
        "Preliminary Design Concepts and Process Flow Diagrams",
        "Detailed Construction Schedule (CPM format, P6 or MS Project)",
        "Quality Assurance / Quality Control Plan",
        "Health and Safety Plan (per OSHA 29 CFR 1926)",
        "Subcontractor Utilization Plan (including DBE/MBE/WBE participation)",
        "Equipment Manufacturer Commitments (letters of intent from major equipment suppliers)",
        "Three (3) Client References for comparable projects completed within the past seven (7) years",
        "Exceptions or Clarifications to Contract Terms",
    ]
    for i, s in enumerate(sections, 1):
        pdf.clause(f"  {i}.", s)

    pdf.sub_section("4.3", "Evaluation Criteria and Scoring")
    pdf.body_text(
        "Proposals will be evaluated by a Selection Committee comprised of District staff, the "
        "District's consulting engineer, and one independent industry expert. Evaluation shall be "
        "based on a best-value determination using the following weighted criteria:"
    )
    pdf.add_table(
        ["Evaluation Criterion", "Max Points", "Weight (%)", "Evaluation Basis"],
        [
            ["Technical Approach & Innovation", "300", "30%", "Process design, efficiency gains, innovation"],
            ["Firm Experience & Past Performance", "250", "25%", "Comparable projects, client references, safety record"],
            ["Key Personnel Qualifications", "150", "15%", "Resumes, certifications, project-specific experience"],
            ["Project Schedule & Phasing Plan", "100", "10%", "Feasibility, milestones, risk mitigation"],
            ["Price Proposal", "100", "10%", "Total evaluated price, lifecycle cost analysis"],
            ["DBE/MBE/WBE Participation", "50", "5%", "Percentage commitment, good faith efforts"],
            ["Quality & Safety Programs", "50", "5%", "QA/QC plan, EMR, OSHA incident rates"],
        ],
        col_widths=[52, 28, 28, 82],
    )
    pdf.body_text(
        "The District reserves the right to conduct interviews with the top three (3) ranked firms. "
        "Interviews, if conducted, may adjust scores by up to 50 additional points. The District further "
        "reserves the right to reject any and all proposals, waive informalities, and negotiate with "
        "any respondent in the best interest of the District."
    )

    pdf.sub_section("4.4", "DBE / MBE / WBE Participation Goals")
    pdf.body_text(
        "The District has established the following aspirational participation goals for this Project "
        "in accordance with the District's Supplier Diversity Policy (Board Resolution 2024-042):"
    )
    pdf.add_table(
        ["Category", "Participation Goal", "Applicable Trades"],
        [
            ["Disadvantaged Business Enterprise (DBE)", "12%", "All trades"],
            ["Minority Business Enterprise (MBE)", "8%", "Electrical, mechanical, civil"],
            ["Women Business Enterprise (WBE)", "5%", "Professional services, supply"],
            ["Local Business Enterprise (LBE)", "10%", "All trades within Monterey County"],
            ["Small Business Enterprise (SBE)", "15%", "All trades"],
        ],
        col_widths=[72, 42, 76],
    )

    # ═══════════════════════════════════════════════════════════════
    # 5. PRICING SCHEDULE
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("5", "PRICING SCHEDULE AND COST BREAKDOWN")

    pdf.body_text(
        "Bidders shall complete the following pricing schedule in its entirety. Lump sum and unit price "
        "items are as indicated. All prices shall include overhead, profit, bonds, insurance, taxes, "
        "and all other costs necessary for complete performance. The District will use these prices for "
        "bid evaluation and for processing progress payments and change orders during construction."
    )

    pdf.sub_section("5.1", "Base Bid -- Lump Sum Items")
    pdf.add_table(
        ["Item", "Description", "Lump Sum Price"],
        [
            ["LS-001", "General Conditions & Project Management (36 months)", "$___________"],
            ["LS-002", "Demolition & Hazmat Abatement -- Filter Bldg No. 2", "$___________"],
            ["LS-003", "Site Grading, Utilities Relocation & Earthwork", "$___________"],
            ["LS-004", "Structural Concrete & Building Construction", "$___________"],
            ["LS-005", "GAC Contactor System (8 units, complete)", "$___________"],
            ["LS-006", "MBR System (4 trains, complete)", "$___________"],
            ["LS-007", "UV Disinfection System (complete, N+1)", "$___________"],
            ["LS-008", "SCADA Integration & Programming", "$___________"],
            ["LS-009", "Electrical Power Distribution & Generator", "$___________"],
            ["LS-010", "Instrumentation & Controls", "$___________"],
            ["LS-011", "Process Piping (all sizes, materials)", "$___________"],
            ["LS-012", "Painting, Coatings & Corrosion Protection", "$___________"],
            ["LS-013", "Testing, Startup & Commissioning", "$___________"],
            ["LS-014", "As-Built Documentation & O&M Manuals", "$___________"],
            ["LS-015", "2-Year Warranty Bond", "$___________"],
        ],
        col_widths=[22, 100, 58],
    )

    pdf.sub_section("5.2", "Unit Price Items")
    pdf.add_table(
        ["Item", "Description", "Est. Qty", "Unit", "Unit Price", "Extended"],
        [
            ["UP-001", "Rock excavation", "2,400", "CY", "$_______", "$_______"],
            ["UP-002", "Structural backfill (imported)", "8,500", "CY", "$_______", "$_______"],
            ["UP-003", "Dewatering (per day)", "90", "Day", "$_______", "$_______"],
            ["UP-004", "12\" DIP water main", "1,850", "LF", "$_______", "$_______"],
            ["UP-005", "8\" PVC sewer lateral", "640", "LF", "$_______", "$_______"],
            ["UP-006", "Concrete (4,000 psi)", "3,200", "CY", "$_______", "$_______"],
            ["UP-007", "Rebar (#4 - #11, placed)", "480,000", "LB", "$_______", "$_______"],
            ["UP-008", "GAC media replacement", "480,000", "LB", "$_______", "$_______"],
            ["UP-009", "MBR membrane replacement", "4", "Train", "$_______", "$_______"],
            ["UP-010", "UV lamp replacement", "96", "Each", "$_______", "$_______"],
        ],
        col_widths=[20, 55, 22, 20, 28, 28],
    )

    pdf.sub_section("5.3", "Allowance Items")
    pdf.add_table(
        ["Item", "Description", "Allowance Amount"],
        [
            ["AL-001", "Unforeseen Hazardous Materials Abatement", "$350,000"],
            ["AL-002", "Differing Site Conditions", "$500,000"],
            ["AL-003", "Utility Conflicts and Relocations", "$275,000"],
            ["AL-004", "Extended Dewatering Operations", "$150,000"],
            ["AL-005", "Owner-Directed Design Changes (contingency)", "$750,000"],
        ],
        col_widths=[22, 100, 58],
    )
    pdf.body_text(
        "Total allowances of $2,025,000 shall be included in the Total Bid Price. Allowance funds "
        "shall be expended only upon written authorization of the District's Project Manager via Change "
        "Order. Unused allowance funds shall be returned to the District via deductive Change Order."
    )

    pdf.sub_section("5.4", "Payment Terms")
    pdf.body_text(
        "Progress payments shall be made monthly based on the Contractor's certified Application for "
        "Payment, subject to verification by the District's Engineer. The District shall retain five "
        "percent (5%) of each progress payment as retainage. Upon achievement of Substantial Completion, "
        "retainage may be reduced to two and one-half percent (2.5%) at the District's sole discretion. "
        "Final payment, including release of all retainage, shall be made within sixty (60) days of "
        "Final Acceptance, subject to receipt of all required closeout documentation, unconditional lien "
        "waivers, and consent of surety."
    )

    # ═══════════════════════════════════════════════════════════════
    # 6. GENERAL TERMS AND CONDITIONS
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("6", "GENERAL TERMS AND CONDITIONS")

    pdf.sub_section("6.1", "Contract Documents and Order of Precedence")
    pdf.body_text(
        "The Contract Documents consist of the following, listed in descending order of precedence in "
        "the event of conflict: (1) fully executed Change Orders and Amendments; (2) this Agreement and "
        "its Exhibits; (3) the Technical Specifications; (4) the Drawings; (5) the Contractor's accepted "
        "Proposal; (6) applicable laws, codes, and regulations; (7) industry standards referenced herein. "
        "In the event of ambiguity, the interpretation that imposes the greater obligation on the "
        "Contractor shall govern, provided that the Contractor shall promptly notify the District of "
        "any such ambiguity prior to proceeding with the affected Work."
    )

    pdf.sub_section("6.2", "Independent Contractor Status")
    pdf.body_text(
        "The Contractor is an independent contractor and not an employee, agent, partner, or joint "
        "venturer of the District. The Contractor shall have exclusive control over the methods, means, "
        "and manner of performing the Work, subject to compliance with the Contract Documents. The "
        "Contractor shall be solely responsible for all taxes, insurance, workers' compensation, and "
        "other obligations arising from the employment of its personnel."
    )

    pdf.sub_section("6.3", "Permits and Regulatory Compliance")
    pdf.body_text(
        "The Contractor shall obtain and maintain all permits, licenses, and approvals required for "
        "the execution of the Work, including but not limited to: building permits (Monterey County), "
        "encroachment permits, NPDES stormwater discharge permit (Construction General Permit Order "
        "No. 2022-0057-DWQ), air quality permits (Monterey Bay Air Resources District), and any "
        "required California Division of Drinking Water (DDW) approvals for treatment process "
        "modifications. The cost of all permits shall be included in the Contractor's bid price."
    )

    pdf.sub_section("6.4", "Prevailing Wages")
    pdf.body_text(
        "This Project is a public work subject to California Labor Code Sections 1720 et seq. The "
        "Contractor and all Subcontractors shall pay not less than the general prevailing rate of per "
        "diem wages as determined by the Director of the California Department of Industrial Relations "
        "(DIR) for the locality and classification of work. The Contractor shall comply with all "
        "requirements of Labor Code Sections 1770-1781, including but not limited to: maintenance of "
        "certified payroll records, posting of prevailing wage rates at the job site, and registration "
        "with the DIR as a public works contractor (Labor Code Section 1725.5)."
    )

    pdf.sub_section("6.5", "Liquidated Damages")
    pdf.body_text(
        "Time is of the essence in the performance of this Contract. If the Contractor fails to achieve "
        "Substantial Completion by the date specified in the approved project schedule (as may be "
        "extended by approved Change Orders), the Contractor shall pay the District liquidated damages "
        "in the amount of Three Thousand Five Hundred Dollars ($3,500.00) per calendar day for each day "
        "of delay. The parties agree that this amount represents a reasonable estimate of the damages "
        "the District would suffer from delayed completion, including but not limited to: regulatory "
        "penalties, increased temporary treatment costs, administrative expenses, and loss of public "
        "confidence. Liquidated damages are not a penalty and shall not preclude the District from "
        "pursuing other remedies for breach."
    )

    pdf.sub_section("6.6", "Change Orders")
    pdf.body_text(
        "No changes to the scope, price, or schedule of the Work shall be effective unless authorized "
        "by a written Change Order signed by both parties. The Contractor shall not proceed with any "
        "changed Work until a Change Order is fully executed, except in cases of emergency where the "
        "District's Project Manager has provided written directive. Change Order pricing shall be based "
        "on: (a) agreed lump sum; (b) unit prices established in the Contract; or (c) time-and-materials "
        "with a not-to-exceed limit, with Contractor's markup not to exceed fifteen percent (15%) for "
        "overhead and profit on self-performed work and ten percent (10%) on subcontracted work."
    )

    pdf.sub_section("6.7", "Warranty")
    pdf.body_text(
        "The Contractor warrants that all Work shall be free from defects in materials and workmanship "
        "for a period of twenty-four (24) months from the date of Final Acceptance (the \"Warranty "
        "Period\"). During the Warranty Period, the Contractor shall promptly repair or replace, at its "
        "sole expense, any Defective Work upon receipt of written notice from the District. Equipment "
        "manufacturer warranties shall be assigned to the District and shall be in addition to, not in "
        "lieu of, the Contractor's warranty obligations. The Contractor's warranty shall survive "
        "termination or expiration of this Agreement."
    )

    # ═══════════════════════════════════════════════════════════════
    # 7. INSURANCE AND BONDING
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("7", "INSURANCE AND BONDING REQUIREMENTS")

    pdf.sub_section("7.1", "Insurance Requirements")
    pdf.body_text(
        "The Contractor shall procure and maintain, at its sole cost and expense, the following minimum "
        "insurance coverages throughout the duration of the Contract and for a period of three (3) years "
        "following Final Acceptance. All insurance shall be provided by carriers with an A.M. Best "
        "rating of A- VII or better and licensed to do business in the State of California."
    )

    pdf.add_table(
        ["Coverage Type", "Minimum Limit", "Additional Requirements"],
        [
            ["Commercial General Liability", "$5,000,000 per occurrence\n$10,000,000 aggregate", "District as additional insured; primary & non-contributory"],
            ["Automobile Liability", "$2,000,000 CSL", "Owned, hired, and non-owned vehicles"],
            ["Workers' Compensation", "Statutory limits", "Waiver of subrogation in favor of District"],
            ["Employer's Liability", "$2,000,000 per accident", "Including USL&H if applicable"],
            ["Umbrella / Excess Liability", "$10,000,000 per occurrence", "Follow-form over CGL, Auto, and Employer's"],
            ["Professional Liability (E&O)", "$5,000,000 per claim", "For design-build services; 3-year tail"],
            ["Contractor's Pollution Liability", "$5,000,000 per occurrence", "Including transportation and disposal"],
            ["Builder's Risk / Installation Floater", "Full replacement cost", "All-risk form; District as loss payee"],
        ],
        col_widths=[55, 50, 85],
    )

    pdf.sub_section("7.2", "Bonding Requirements")
    pdf.body_text(
        "Within ten (10) calendar days of contract award, the Contractor shall furnish the following "
        "bonds, each in an amount equal to one hundred percent (100%) of the Contract Price, issued "
        "by a surety company authorized to do business in California with an A.M. Best rating of "
        "A- VIII or better:"
    )
    pdf.clause("(a)", "Performance Bond -- guaranteeing faithful performance of the Contract.")
    pdf.clause("(b)", "Payment Bond -- guaranteeing payment of all laborers, material suppliers, and subcontractors in accordance with California Civil Code Section 9550 et seq.")
    pdf.clause("(c)", "Warranty Bond -- guaranteeing the Contractor's warranty obligations for a period of twenty-four (24) months following Final Acceptance. The Warranty Bond shall be in an amount equal to fifteen percent (15%) of the final Contract Price.")

    # ═══════════════════════════════════════════════════════════════
    # 8. COMPLIANCE
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("8", "COMPLIANCE AND REGULATORY REQUIREMENTS")

    pdf.sub_section("8.1", "Environmental Compliance")
    pdf.body_text(
        "The Contractor shall comply with all applicable environmental laws and regulations, including "
        "but not limited to: the National Environmental Policy Act (NEPA), the California Environmental "
        "Quality Act (CEQA), the Clean Water Act, the Clean Air Act, the Resource Conservation and "
        "Recovery Act (RCRA), the Comprehensive Environmental Response, Compensation, and Liability Act "
        "(CERCLA), and all implementing regulations. The District has obtained a Mitigated Negative "
        "Declaration (MND) for the Project (State Clearinghouse No. 2025-112048). The Contractor shall "
        "comply with all mitigation measures identified in the MND and the associated Mitigation "
        "Monitoring and Reporting Program (MMRP)."
    )

    pdf.sub_section("8.2", "Safety Requirements")
    pdf.body_text(
        "The Contractor shall establish, implement, and maintain a comprehensive Health and Safety Plan "
        "conforming to OSHA 29 CFR 1926 (Construction Industry Standards) and Cal/OSHA Title 8 CCR. "
        "The Contractor shall designate a full-time, on-site Safety Officer with a minimum of OSHA 500 "
        "certification and five (5) years of construction safety experience. Daily safety briefings, "
        "weekly toolbox talks, and monthly safety audits are required. The Contractor shall maintain a "
        "Total Recordable Incident Rate (TRIR) below 2.0 and a Days Away, Restricted, or Transferred "
        "(DART) rate below 1.0 throughout the Project duration."
    )

    pdf.sub_section("8.3", "Equal Employment Opportunity and Non-Discrimination")
    pdf.body_text(
        "The Contractor shall comply with all applicable federal, state, and local laws regarding equal "
        "employment opportunity and non-discrimination, including but not limited to: Title VII of the "
        "Civil Rights Act of 1964, Executive Order 11246, the Americans with Disabilities Act (ADA), "
        "the California Fair Employment and Housing Act (FEHA), and Section 504 of the Rehabilitation "
        "Act. The Contractor shall not discriminate against any employee or applicant on the basis of "
        "race, color, religion, sex, sexual orientation, gender identity, national origin, disability, "
        "age, veteran status, or any other protected characteristic."
    )

    pdf.sub_section("8.4", "Buy American / Buy Clean Requirements")
    pdf.body_text(
        "To the extent that this Project receives federal funding, the Contractor shall comply with the "
        "Build America, Buy America Act (BABA) requirements under the Infrastructure Investment and "
        "Jobs Act (IIJA), including the requirement that all iron, steel, manufactured products, and "
        "construction materials used in the Project be produced in the United States. The Contractor "
        "shall maintain documentation of domestic origin for all applicable materials. Requests for "
        "waivers must be submitted in writing with supporting justification at least sixty (60) days "
        "prior to the planned procurement date."
    )

    # ═══════════════════════════════════════════════════════════════
    # 9. INDEMNIFICATION
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("9", "INDEMNIFICATION AND LIMITATION OF LIABILITY")

    pdf.sub_section("9.1", "General Indemnification")
    pdf.body_text(
        "To the fullest extent permitted by law, the Contractor shall indemnify, defend (with counsel "
        "reasonably acceptable to the District), and hold harmless the District, its Board of Directors, "
        "officers, employees, agents, and volunteers (collectively, the \"Indemnified Parties\") from and "
        "against any and all claims, damages, losses, costs, expenses (including reasonable attorneys' "
        "fees and expert witness fees), liabilities, actions, suits, and proceedings (collectively, "
        "\"Claims\") arising out of, resulting from, or related to: (a) the performance or "
        "non-performance of the Work; (b) any breach of the Contract by the Contractor; (c) any "
        "negligent or wrongful act or omission of the Contractor, its employees, agents, or "
        "Subcontractors; or (d) any violation of applicable law by the Contractor."
    )

    pdf.sub_section("9.2", "Intellectual Property Indemnification")
    pdf.body_text(
        "The Contractor shall indemnify, defend, and hold harmless the Indemnified Parties from and "
        "against any Claims alleging that the Work, or any equipment, software, process, or material "
        "furnished by the Contractor, infringes or misappropriates any patent, copyright, trademark, "
        "trade secret, or other intellectual property right of any third party. In the event of an "
        "infringement claim, the Contractor shall, at its sole expense, either: (a) obtain for the "
        "District the right to continue using the affected item; (b) modify the item to make it "
        "non-infringing while maintaining equivalent functionality; or (c) replace the item with a "
        "non-infringing equivalent acceptable to the District."
    )

    pdf.sub_section("9.3", "Limitation of Liability")
    pdf.body_text(
        "EXCEPT FOR THE CONTRACTOR'S INDEMNIFICATION OBLIGATIONS UNDER SECTIONS 9.1 AND 9.2, AND "
        "EXCEPT FOR DAMAGES ARISING FROM GROSS NEGLIGENCE, WILLFUL MISCONDUCT, OR FRAUD, NEITHER "
        "PARTY'S AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL EXCEED THE TOTAL CONTRACT PRICE. IN "
        "NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, "
        "PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOSS OF USE, OR "
        "LOSS OF DATA, REGARDLESS OF WHETHER SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH "
        "DAMAGES. THIS LIMITATION SHALL NOT APPLY TO CLAIMS COVERED BY INSURANCE REQUIRED UNDER THIS "
        "AGREEMENT."
    )

    # ═══════════════════════════════════════════════════════════════
    # 10. DISPUTE RESOLUTION
    # ═══════════════════════════════════════════════════════════════
    pdf.section_title("10", "DISPUTE RESOLUTION AND GOVERNING LAW")

    pdf.sub_section("10.1", "Negotiation and Mediation")
    pdf.body_text(
        "Any dispute arising out of or relating to this Agreement shall first be submitted to good "
        "faith negotiation between the parties' designated representatives. If the dispute is not "
        "resolved within thirty (30) days of written notice, the parties shall submit the dispute to "
        "non-binding mediation administered by JAMS in Monterey, California, before a single mediator "
        "mutually agreed upon by the parties. Each party shall bear its own costs of mediation, and "
        "the mediator's fees shall be shared equally."
    )

    pdf.sub_section("10.2", "Binding Arbitration")
    pdf.body_text(
        "If mediation fails to resolve the dispute within sixty (60) days of the mediator's appointment, "
        "either party may submit the dispute to binding arbitration administered by JAMS pursuant to its "
        "Comprehensive Arbitration Rules and Procedures. The arbitration shall be conducted by a panel "
        "of three (3) arbitrators, each with a minimum of fifteen (15) years of experience in public "
        "works construction. The arbitrators' award shall be final and binding, and judgment thereon may "
        "be entered in any court of competent jurisdiction. Notwithstanding the foregoing, either party "
        "may seek injunctive or other equitable relief from a court of competent jurisdiction to prevent "
        "irreparable harm pending the outcome of arbitration."
    )

    pdf.sub_section("10.3", "Governing Law and Venue")
    pdf.body_text(
        "This Agreement shall be governed by and construed in accordance with the laws of the State "
        "of California, without regard to its conflict of laws principles. To the extent that any "
        "dispute is not subject to arbitration, the exclusive venue for any legal action arising under "
        "this Agreement shall be the Superior Court of the State of California, County of Monterey, "
        "or the United States District Court for the Northern District of California."
    )

    # ═══════════════════════════════════════════════════════════════
    # 11. TERMINATION
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("11", "TERMINATION PROVISIONS")

    pdf.sub_section("11.1", "Termination for Convenience")
    pdf.body_text(
        "The District may terminate this Agreement, in whole or in part, at any time for the District's "
        "convenience by providing thirty (30) days' written notice to the Contractor. In the event of "
        "termination for convenience, the District shall pay the Contractor for: (a) all Work "
        "satisfactorily performed through the date of termination; (b) reasonable demobilization costs; "
        "(c) the cost of materials and equipment procured for the Work that cannot be returned or "
        "redirected; and (d) a reasonable profit on the Work performed, not to exceed five percent "
        "(5%) of the value of completed Work. The Contractor shall not be entitled to anticipatory "
        "profits or consequential damages arising from termination for convenience."
    )

    pdf.sub_section("11.2", "Termination for Cause")
    pdf.body_text(
        "The District may terminate this Agreement for cause if the Contractor: (a) fails to prosecute "
        "the Work with sufficient diligence to ensure timely completion; (b) materially breaches any "
        "provision of the Contract Documents and fails to cure such breach within fourteen (14) days "
        "of written notice (or such longer period as may be reasonably necessary to effect a cure, "
        "provided the Contractor has commenced cure within the 14-day period and is diligently pursuing "
        "it); (c) becomes insolvent, files for bankruptcy, or has a receiver appointed; (d) assigns "
        "the Contract without the District's consent; or (e) repeatedly fails to comply with safety "
        "requirements or applicable law. Upon termination for cause, the District may complete the "
        "Work by any means and the Contractor shall be liable for all excess costs."
    )

    pdf.sub_section("11.3", "Contractor's Right to Suspend")
    pdf.body_text(
        "If the District fails to make undisputed payments within sixty (60) days of their due date, "
        "the Contractor may, upon providing fourteen (14) days' written notice, suspend the Work until "
        "payment is received. The Contractor shall be entitled to an equitable adjustment of the "
        "Contract Price and schedule for costs arising from such suspension, including reasonable "
        "standby costs, extended overhead, and remobilization expenses."
    )

    # ═══════════════════════════════════════════════════════════════
    # 12. REPRESENTATIONS AND WARRANTIES
    # ═══════════════════════════════════════════════════════════════
    pdf.section_title("12", "REPRESENTATIONS AND WARRANTIES")

    pdf.sub_section("12.1", "Contractor's Representations")
    pdf.body_text("The Contractor represents and warrants that:")
    reps = [
        "It is a duly organized and validly existing entity under the laws of its state of incorporation or formation, and is authorized to do business in the State of California.",
        "It has the full power and authority to enter into this Agreement and to perform its obligations hereunder, and the execution and delivery of this Agreement has been duly authorized by all necessary corporate or partnership action.",
        "The execution, delivery, and performance of this Agreement does not conflict with any other agreement, obligation, or order to which the Contractor is a party or by which it is bound.",
        "It has examined the Project Site, the Contract Documents, and all available information regarding the Project, and has satisfied itself as to the nature and extent of the Work, site conditions, and all other matters that may affect performance.",
        "It possesses the technical expertise, financial capacity, and organizational resources necessary to complete the Work in accordance with the Contract Documents.",
        "All information provided in its Proposal is accurate, complete, and not misleading in any material respect.",
        "It is not currently the subject of any investigation, debarment, or suspension by any federal, state, or local government entity, and there are no pending or threatened legal proceedings that would materially affect its ability to perform the Work.",
        "It has not engaged in any collusion, bid-rigging, or other anti-competitive conduct in connection with this procurement.",
    ]
    for i, rep in enumerate(reps, 1):
        pdf.clause(f"({chr(96+i)})", rep)

    pdf.sub_section("12.2", "District's Representations")
    pdf.body_text("The District represents and warrants that:")
    dreps = [
        "It is a duly organized municipal utilities district under the laws of the State of California with full power and authority to enter into this Agreement.",
        "Adequate funding has been appropriated and is available for the payment of the Contract Price, subject to annual budget approval by the District's Board of Directors.",
        "It has obtained or will obtain all necessary environmental approvals and land use entitlements for the Project prior to the Contractor's commencement of affected Work.",
    ]
    for i, rep in enumerate(dreps, 1):
        pdf.clause(f"({chr(96+i)})", rep)

    # ═══════════════════════════════════════════════════════════════
    # 13. SIGNATURE PAGE
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("13", "EXECUTION AND SIGNATURE PAGE")

    pdf.body_text(
        "IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date last "
        "written below, by their duly authorized representatives."
    )
    pdf.ln(8)

    # Owner block
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(20, 50, 100)
    pdf.cell(0, 8, "GREENFIELD MUNICIPAL UTILITIES DISTRICT (\"Owner\")", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)

    sig_lines = [
        ("Signature:", 70),
        ("Printed Name:", 70),
        ("Title:", 70),
        ("Date:", 70),
    ]
    for label, line_w in sig_lines:
        pdf.cell(35, 8, label)
        y = pdf.get_y() + 8
        pdf.line(45, y, 45 + line_w, y)
        pdf.ln(10)

    pdf.ln(10)

    # Contractor block
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(20, 50, 100)
    pdf.cell(0, 8, "CONTRACTOR", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)

    sig_lines2 = [
        ("Company Name:", 70),
        ("Signature:", 70),
        ("Printed Name:", 70),
        ("Title:", 70),
        ("Date:", 70),
        ("CA License No.:", 70),
        ("Federal Tax ID:", 70),
    ]
    for label, line_w in sig_lines2:
        pdf.cell(35, 8, label)
        y = pdf.get_y() + 8
        pdf.line(45, y, 45 + line_w, y)
        pdf.ln(10)

    # ═══════════════════════════════════════════════════════════════
    # APPENDIX A
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("A", "APPENDIX A -- EQUIPMENT SPECIFICATIONS MATRIX")

    pdf.body_text(
        "The following matrix summarizes the key equipment items, quantities, and critical specifications. "
        "Bidders shall confirm compliance with all specifications in their Technical Proposal. Any "
        "proposed substitutions or deviations must be clearly identified with supporting technical data."
    )

    pdf.add_table(
        ["Equip. Tag", "Description", "Qty", "Manufacturer / Model", "Key Spec"],
        [
            ["GAC-101-108", "GAC Gravity Contactor", "8", "Calgon / Custom", "15 min EBCT, 316L SS"],
            ["MBR-201-204", "MBR Membrane Train", "4", "Suez ZeeWeed 500D", "0.04 um, 10.5 MGD each"],
            ["UV-301-305", "UV Reactor (MP)", "5", "Trojan UV Swift ECT", "40 mJ/cm2, N+1 config"],
            ["BLR-401-406", "Air Scour Blower", "6", "Aerzen GM25S", "850 SCFM, 8 psig"],
            ["PMP-501-508", "Permeate Pump", "8", "Grundfos CRE 95-1", "2,500 GPM, 40 TDH"],
            ["PMP-601-604", "Backwash Pump", "4", "Flygt NP 3202", "5,000 GPM, 25 TDH"],
            ["VFD-701-712", "Variable Freq. Drive", "12", "ABB ACS880", "480V, 150-500 HP"],
            ["TRF-801", "Pad-Mount Transformer", "1", "ABB / Custom", "2,500 kVA, 12.47kV-480V"],
            ["GEN-901", "Standby Generator", "1", "Caterpillar C9.3B", "200 kW, natural gas"],
            ["MCC-1001-1002", "Motor Control Center", "2", "Eaton Freedom 2100", "480V, 3-phase"],
            ["PLC-1101-1106", "Programmable Logic Ctrl", "6", "Allen-Bradley 1756-L85", "ControlLogix, redundant"],
            ["AIT-1201-1220", "Analytical Instrument", "20", "Hach / Endress+Hauser", "Various (see spec sheets)"],
        ],
        col_widths=[28, 40, 12, 52, 48],
    )

    # ═══════════════════════════════════════════════════════════════
    # APPENDIX B
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("B", "APPENDIX B -- SITE PLANS AND DRAWINGS REFERENCE")

    pdf.body_text(
        "The following drawings are incorporated by reference into this Contract. Complete drawing "
        "sets are available for review at the District's Engineering Department offices and are included "
        "in the digital bid package available through the ProcureNow portal."
    )

    pdf.add_table(
        ["Drawing No.", "Title", "Rev.", "Date", "Discipline"],
        [
            ["C-001", "Cover Sheet and Drawing Index", "3", "02/15/2026", "General"],
            ["C-002", "General Notes and Abbreviations", "3", "02/15/2026", "General"],
            ["C-101", "Existing Site Plan and Demolition", "2", "01/20/2026", "Civil"],
            ["C-102", "Proposed Site Grading Plan", "2", "01/20/2026", "Civil"],
            ["C-103", "Utility Plan -- Water and Sewer", "3", "02/10/2026", "Civil"],
            ["C-104", "Stormwater Management Plan", "2", "01/20/2026", "Civil"],
            ["S-201", "Foundation Plan -- Filter Building", "2", "02/01/2026", "Structural"],
            ["S-202", "Structural Framing Plans", "2", "02/01/2026", "Structural"],
            ["S-203", "Contactor Structural Details", "1", "12/15/2025", "Structural"],
            ["A-301", "Floor Plans -- Filter Building", "2", "02/05/2026", "Architectural"],
            ["A-302", "Building Elevations and Sections", "2", "02/05/2026", "Architectural"],
            ["M-401", "Mechanical Piping Plan -- GAC", "1", "01/10/2026", "Mechanical"],
            ["M-402", "Mechanical Piping Plan -- MBR", "1", "01/10/2026", "Mechanical"],
            ["M-403", "Process Flow Diagram", "3", "02/15/2026", "Mechanical"],
            ["E-501", "Electrical One-Line Diagram", "2", "02/01/2026", "Electrical"],
            ["E-502", "Lighting and Power Plan", "1", "01/15/2026", "Electrical"],
            ["E-503", "Panel Schedules", "2", "02/01/2026", "Electrical"],
            ["I-601", "P&ID -- GAC System", "2", "02/10/2026", "Instrumentation"],
            ["I-602", "P&ID -- MBR System", "2", "02/10/2026", "Instrumentation"],
            ["I-603", "SCADA Network Architecture", "1", "01/20/2026", "Instrumentation"],
        ],
        col_widths=[28, 62, 14, 32, 44],
    )

    # ═══════════════════════════════════════════════════════════════
    # APPENDIX C
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("C", "APPENDIX C -- PREVAILING WAGE RATE SCHEDULE (EXCERPT)")

    pdf.body_text(
        "The following prevailing wage rates are excerpted from the California DIR determination for "
        "Monterey County, effective January 1, 2026. These rates are subject to change; Contractors "
        "shall verify current rates with the DIR prior to bid submission. Full rate tables are available "
        "at www.dir.ca.gov/oprl/DPreWageDetermination.htm."
    )

    pdf.add_table(
        ["Classification", "Base Rate", "Health/Welfare", "Pension", "Training", "Total Pkg"],
        [
            ["Carpenter", "$58.42", "$15.20", "$12.85", "$1.05", "$87.52"],
            ["Cement Mason", "$52.30", "$14.75", "$18.40", "$0.95", "$86.40"],
            ["Electrician (Inside)", "$62.15", "$16.50", "$14.25", "$1.10", "$94.00"],
            ["Iron Worker (Structural)", "$56.80", "$15.80", "$22.10", "$1.15", "$95.85"],
            ["Laborer (Group 1)", "$42.25", "$14.20", "$15.60", "$0.85", "$72.90"],
            ["Laborer (Group 2)", "$43.75", "$14.20", "$15.60", "$0.85", "$74.40"],
            ["Operating Engr (Group 3)", "$60.40", "$16.00", "$18.75", "$1.00", "$96.15"],
            ["Painter", "$48.90", "$14.50", "$10.20", "$0.90", "$74.50"],
            ["Pile Driver", "$58.42", "$15.20", "$12.85", "$1.05", "$87.52"],
            ["Pipefitter / Plumber", "$64.30", "$17.25", "$16.80", "$1.20", "$99.55"],
            ["Sheet Metal Worker", "$55.10", "$15.90", "$21.50", "$1.10", "$93.60"],
            ["Teamster (Group 2)", "$44.80", "$14.50", "$16.30", "$0.90", "$76.50"],
        ],
        col_widths=[42, 28, 30, 28, 24, 28],
    )

    pdf.body_text(
        "Overtime: All hours in excess of eight (8) hours per day and forty (40) hours per week shall "
        "be compensated at one and one-half (1.5) times the base hourly rate. All hours worked on "
        "Sundays and holidays shall be compensated at double the base hourly rate."
    )

    # ═══════════════════════════════════════════════════════════════
    # APPENDIX D
    # ═══════════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("D", "APPENDIX D -- NON-DISCLOSURE AGREEMENT")

    pdf.body_text(
        "This Non-Disclosure Agreement (\"NDA\") is entered into by and between the Greenfield Municipal "
        "Utilities District (\"Disclosing Party\") and _________________________ (\"Receiving Party\"), "
        "collectively referred to as the \"Parties.\""
    )

    pdf.sub_section("D.1", "Purpose")
    pdf.body_text(
        "The Parties wish to explore a potential business relationship in connection with the Water "
        "Treatment Facility Modernization and Expansion Project (Contract No. GMU-2026-0452). In "
        "connection with this evaluation, the Disclosing Party may share certain confidential and "
        "proprietary information with the Receiving Party."
    )

    pdf.sub_section("D.2", "Definition of Confidential Information")
    pdf.body_text(
        "\"Confidential Information\" means all non-public information disclosed by the Disclosing Party "
        "to the Receiving Party, whether disclosed orally, in writing, electronically, or by inspection "
        "of tangible objects, including but not limited to: technical data, trade secrets, engineering "
        "designs, process information, financial data, customer lists, business plans, security "
        "protocols, infrastructure vulnerabilities, and any other information that is designated as "
        "\"Confidential\" or that a reasonable person would understand to be confidential given the "
        "nature of the information and the circumstances of disclosure."
    )

    pdf.sub_section("D.3", "Obligations")
    pdf.body_text(
        "The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; "
        "(b) not disclose Confidential Information to any third party without the prior written consent "
        "of the Disclosing Party; (c) use Confidential Information solely for the purpose of evaluating "
        "and responding to the RFP; (d) restrict access to Confidential Information to those employees "
        "and advisors who have a need to know and who are bound by confidentiality obligations at least "
        "as restrictive as those contained herein; and (e) promptly return or destroy all Confidential "
        "Information upon request or upon termination of this NDA."
    )

    pdf.sub_section("D.4", "Exceptions")
    pdf.body_text(
        "Confidential Information does not include information that: (a) is or becomes publicly "
        "available through no fault of the Receiving Party; (b) was rightfully known to the Receiving "
        "Party before disclosure; (c) is independently developed by the Receiving Party without use of "
        "or reference to the Confidential Information; or (d) is required to be disclosed by law, "
        "regulation, or court order, provided that the Receiving Party gives prompt written notice to "
        "the Disclosing Party to enable it to seek a protective order."
    )

    pdf.sub_section("D.5", "Term and Remedies")
    pdf.body_text(
        "This NDA shall remain in effect for a period of five (5) years from the date of execution. "
        "The Receiving Party acknowledges that any breach of this NDA may cause irreparable harm to "
        "the Disclosing Party, and that the Disclosing Party shall be entitled to seek injunctive "
        "relief in addition to any other remedies available at law or in equity."
    )

    pdf.ln(12)

    # NDA Signature block
    sig_blocks = [
        "GREENFIELD MUNICIPAL UTILITIES DISTRICT",
        "RECEIVING PARTY (BIDDER)"
    ]
    for block_title in sig_blocks:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(20, 50, 100)
        pdf.cell(0, 8, block_title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(30, 30, 30)
        for label in ["Signature:", "Printed Name:", "Title:", "Date:"]:
            pdf.cell(30, 8, label)
            y = pdf.get_y() + 8
            pdf.line(40, y, 110, y)
            pdf.ln(9)
        pdf.ln(6)

    # ═══════════════════════════════════════════════════════════════
    # OUTPUT
    # ═══════════════════════════════════════════════════════════════
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
    output_path = os.path.join(output_dir, "sample-contract.pdf")
    pdf.output(output_path)
    print(f"Generated: {output_path}")
    print(f"Pages: {pdf.page_no()}")


if __name__ == "__main__":
    build_pdf()
