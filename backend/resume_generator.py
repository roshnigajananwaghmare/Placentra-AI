from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether
)

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import mm
from xml.sax.saxutils import escape


# ============================================================
# PAGE SETTINGS
# ============================================================

PAGE_WIDTH, PAGE_HEIGHT = A4

LEFT_MARGIN = 16 * mm
RIGHT_MARGIN = 16 * mm
TOP_MARGIN = 14 * mm
BOTTOM_MARGIN = 14 * mm


# ============================================================
# COLORS
# ============================================================

NAVY = colors.HexColor("#172554")
BLUE = colors.HexColor("#2563EB")
DARK = colors.HexColor("#111827")
GRAY = colors.HexColor("#4B5563")
LIGHT_GRAY = colors.HexColor("#E5E7EB")


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def safe_text(value, default=""):
    """
    Safely convert database values to escaped strings.
    """
    if value is None:
        return default

    return escape(str(value).strip())


def plain_text(value, default=""):
    """
    Return plain string for internal calculations.
    """
    if value is None:
        return default

    return str(value).strip()


def get_value(dictionary, key, default=""):
    """
    Safely get a value from a dictionary.
    """
    if not dictionary:
        return default

    value = dictionary.get(key)

    if value is None:
        return default

    return value


# ============================================================
# SECTION SELECTION
# ============================================================

def section_enabled(selected_sections, section_name):
    """
    Check whether a resume section has been selected.

    Supported section names:

        summary
        objective
        education
        skills
        projects
        internships
        certifications

    The function also supports aliases such as:
        summary -> objective
        certificate -> certifications
        project -> projects
        experience -> internships
    """

    # If no selection is provided, include everything.
    if not selected_sections:
        return True

    normalized = {
        str(section).lower().strip()
        for section in selected_sections
    }

    aliases = {
        "objective": {
            "objective",
            "summary",
            "career objective",
            "professional summary"
        },

        "education": {
            "education"
        },

        "skills": {
            "skills",
            "technical skills"
        },

        "projects": {
            "projects",
            "project"
        },

        "internships": {
            "internships",
            "internship",
            "experience"
        },

        "certifications": {
            "certifications",
            "certificates",
            "certification"
        }
    }

    allowed_names = aliases.get(
        section_name.lower(),
        {section_name.lower()}
    )

    return bool(normalized.intersection(allowed_names))


# ============================================================
# STYLES
# ============================================================

NAME_STYLE = ParagraphStyle(
    "ResumeName",
    fontName="Helvetica-Bold",
    fontSize=24,
    leading=28,
    alignment=TA_LEFT,
    textColor=NAVY,
    spaceAfter=2
)


CONTACT_STYLE = ParagraphStyle(
    "Contact",
    fontName="Helvetica",
    fontSize=9,
    leading=12,
    alignment=TA_LEFT,
    textColor=GRAY,
    spaceAfter=4
)


ROLE_STYLE = ParagraphStyle(
    "Role",
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    alignment=TA_LEFT,
    textColor=BLUE,
    spaceAfter=8
)


SECTION_STYLE = ParagraphStyle(
    "Section",
    fontName="Helvetica-Bold",
    fontSize=10.5,
    leading=13,
    textColor=NAVY,
    spaceBefore=11,
    spaceAfter=5
)


BODY_STYLE = ParagraphStyle(
    "Body",
    fontName="Helvetica",
    fontSize=9.5,
    leading=12.5,
    textColor=DARK,
    spaceAfter=3
)


BODY_SMALL_STYLE = ParagraphStyle(
    "BodySmall",
    fontName="Helvetica",
    fontSize=9,
    leading=11.5,
    textColor=GRAY,
    spaceAfter=3
)


BULLET_STYLE = ParagraphStyle(
    "Bullet",
    fontName="Helvetica",
    fontSize=9.2,
    leading=11.5,
    leftIndent=10,
    firstLineIndent=-6,
    textColor=DARK,
    spaceAfter=3
)


PROJECT_TITLE_STYLE = ParagraphStyle(
    "ProjectTitle",
    fontName="Helvetica-Bold",
    fontSize=10,
    leading=12.5,
    textColor=DARK,
    spaceAfter=3
)


# ============================================================
# SECTION HEADER
# ============================================================

def add_section_header(story, title):
    """
    Add ATS-friendly section heading.
    """

    heading = Table(
        [[Paragraph(safe_text(title).upper(), SECTION_STYLE), ""]],
        colWidths=[42 * mm, PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN - 42 * mm],
        rowHeights=[18],
    )
    heading.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.7, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(heading)
    story.append(Spacer(1, 6))


# ============================================================
# HEADER
# ============================================================

def add_header(story, profile):

    full_name = get_value(profile, "full_name") or get_value(profile, "name")

    target_role = get_value(
        profile,
        "target_role"
    )

    email = get_value(profile, "email")
    phone = get_value(profile, "phone")
    linkedin = get_value(profile, "linkedin")
    github = get_value(profile, "github")

    # Name
    if full_name:
        story.append(Paragraph(safe_text(full_name), NAME_STYLE))

    # Target role
    if target_role:
        story.append(
            Paragraph(
                safe_text(target_role),
                ROLE_STYLE
            )
        )

    # Contact information
    contact_items = []

    if email:
        contact_items.append(
            safe_text(email)
        )

    if phone:
        contact_items.append(
            safe_text(phone)
        )

    if linkedin:
        contact_items.append(
            safe_text(linkedin)
        )

    if github:
        contact_items.append(
            safe_text(github)
        )

    if contact_items:

        contact_line = "  |  ".join(contact_items)

        story.append(
            Paragraph(
                contact_line,
                CONTACT_STYLE
            )
        )

    story.append(Spacer(1, 10))


# ============================================================
# PROFESSIONAL SUMMARY
# ============================================================

def add_objective(story, profile):

    objective = get_value(profile, "career_objective")
    if not objective:
        return

    add_section_header(
        story,
        "Professional Summary"
    )

    story.append(
        Paragraph(
            safe_text(objective),
            BODY_STYLE
        )
    )

    story.append(Spacer(1, 7))


# ============================================================
# EDUCATION
# ============================================================

def add_education(story, profile):

    degree = get_value(profile, "degree")
    college = get_value(profile, "college")
    branch = get_value(profile, "branch")
    year = get_value(profile, "year")
    cgpa = get_value(profile, "cgpa")

    if not any([
        degree,
        college,
        branch,
        year,
        cgpa
    ]):
        return

    add_section_header(
        story,
        "Education"
    )

    education_rows = []

    if degree:

        education_rows.append(
            [
                Paragraph(
                    f"<b>{safe_text(degree)}</b>",
                    BODY_STYLE
                ),

                Paragraph(
                    safe_text(year),
                    BODY_SMALL_STYLE
                )
            ]
        )

    if college:

        education_rows.append(
            [
                Paragraph(
                    safe_text(college),
                    BODY_STYLE
                ),

                Paragraph(
                    "",
                    BODY_SMALL_STYLE
                )
            ]
        )

    details = []

    if branch:
        details.append(
            f"Branch: {safe_text(branch)}"
        )

    if cgpa:
        details.append(
            f"CGPA: {safe_text(cgpa)}"
        )

    if details:

        education_rows.append(
            [
                Paragraph(
                    " | ".join(details),
                    BODY_SMALL_STYLE
                ),

                Paragraph(
                    "",
                    BODY_SMALL_STYLE
                )
            ]
        )

    table = Table(
        education_rows,
        colWidths=[
            PAGE_WIDTH
            - LEFT_MARGIN
            - RIGHT_MARGIN
            - 70 * mm,

            70 * mm
        ]
    )

    table.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                3
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                3
            )
        ])
    )

    story.append(table)
    story.append(Spacer(1, 8))


# ============================================================
# SKILLS
# ============================================================

def add_skills(story, skills):

    if not skills:
        return

    technical = []
    soft = []

    for skill in skills:

        name = plain_text(
            skill.get("skill_name")
        )

        skill_type = plain_text(
            skill.get("skill_type")
        )

        if not name:
            continue

        if skill_type.lower() == "soft skill":
            soft.append(name)
        else:
            technical.append(name)

    # Do not create an empty section
    if not technical and not soft:
        return

    add_section_header(
        story,
        "Technical Skills"
    )

    if technical:

        story.append(Paragraph(
            f"<b>Technical Skills:</b> {safe_text(', '.join(technical))}",
            BODY_STYLE
        ))

    if soft:

        story.append(Paragraph(
            f"<b>Soft Skills:</b> {safe_text(', '.join(soft))}",
            BODY_STYLE
        ))

    story.append(Spacer(1, 7))


# ============================================================
# PROJECTS
# ============================================================

def add_projects(story, projects):

    if not projects:
        return

    add_section_header(
        story,
        "Projects"
    )

    for project in projects:

        name = plain_text(
            project.get("project_name")
        )

        technologies = plain_text(
            project.get("technologies")
        )

        description = plain_text(
            project.get("description")
        )

        github = plain_text(
            project.get("github_link")
        )

        project_content = []

        # Project name
        if name:

            project_content.append(
                Paragraph(
                    safe_text(name),
                    PROJECT_TITLE_STYLE
                )
            )

        # Technologies
        if technologies:

            project_content.append(
                Paragraph(
                    f"<b>Technologies:</b> "
                    f"{safe_text(technologies)}",
                    BODY_SMALL_STYLE
                )
            )

        # Description
        if description:

            project_content.append(
                Paragraph(
                    safe_text(description),
                    BODY_STYLE
                )
            )

        # GitHub
        if github:

            project_content.append(
                Paragraph(
                    f'<link href="{safe_text(github)}" '
                    f'color="#2563EB">'
                    f"<b>GitHub Repository</b>"
                    f"</link>",
                    BODY_SMALL_STYLE
                )
            )

        project_content.append(Spacer(1, 10))

        if project_content:

            story.append(
                KeepTogether(
                    project_content
                )
            )


# ============================================================
# INTERNSHIPS
# ============================================================

def add_internships(story, internships):

    if not internships:
        return

    add_section_header(
        story,
        "Internships & Experience"
    )

    for internship in internships:

        role = plain_text(
            internship.get("role")
        )

        company = plain_text(
            internship.get("company_name")
        )

        duration = plain_text(
            internship.get("duration")
        )

        mode = plain_text(
            internship.get("mode")
        )

        description = plain_text(
            internship.get("description")
        )

        if role:
            story.append(Paragraph(
                f"<b>{safe_text(role)}</b>",
                PROJECT_TITLE_STYLE
            ))

        company_details = []
        if company:
            company_details.append(company)
        if duration:
            company_details.append(duration)
        if mode:
            company_details.append(mode)

        if company_details:
            story.append(Paragraph(
                safe_text(" | ".join(company_details)),
                BODY_SMALL_STYLE
            ))

        if description:

            story.append(
                Paragraph(
                    safe_text(description),
                    BODY_STYLE
                )
            )

        story.append(Spacer(1, 10))


# ============================================================
# CERTIFICATIONS
# ============================================================

def add_certifications(story, certifications):

    if not certifications:
        return

    add_section_header(
        story,
        "Certifications"
    )

    for certificate in certifications:

        name = plain_text(
            certificate.get("certificate_name")
        )

        organization = plain_text(
            certificate.get("organization")
        )

        completion_date = plain_text(
            certificate.get("completion_date")
        )

        if not name:
            continue

        line = (
            f"<b>{safe_text(name)}</b>"
        )

        if organization:

            line += (
                f" — {safe_text(organization)}"
            )

        if completion_date:
            line += f" — {safe_text(completion_date)}"

        story.append(
            Paragraph(
                f"• {line}",
                BULLET_STYLE
            )
        )

    story.append(Spacer(1, 7))


# ============================================================
# FOOTER
# ============================================================

def add_page_footer(canvas, doc):

    canvas.saveState()

    canvas.setStrokeColor(
        LIGHT_GRAY
    )

    canvas.setLineWidth(0.5)

    canvas.line(
        LEFT_MARGIN,
        9 * mm,
        PAGE_WIDTH - RIGHT_MARGIN,
        9 * mm
    )

    canvas.setFont(
        "Helvetica",
        7
    )

    canvas.setFillColor(
        GRAY
    )

    page_text = f"Page {doc.page}"

    canvas.drawRightString(
        PAGE_WIDTH - RIGHT_MARGIN,
        5.5 * mm,
        page_text
    )

    canvas.restoreState()


# ============================================================
# RESUME GENERATOR
# ============================================================

def generate_resume(
    data,
    filename,
    selected_sections=None
):
    """
    Generate the Placentra AI resume PDF.

    selected_sections determines which sections
    will appear in the generated PDF.

    Example:

        [
            "summary",
            "education",
            "skills",
            "projects"
        ]

    If selected_sections is not supplied,
    all available sections are included.
    """

    # --------------------------------------------------------
    # SAFETY
    # --------------------------------------------------------

    if not isinstance(data, dict):
        data = {}

    profile = data.get(
        "profile",
        {}
    ) or {}

    skills = data.get(
        "skills",
        []
    ) or []

    projects = data.get(
        "projects",
        []
    ) or []

    internships = data.get(
        "internships",
        []
    ) or []

    certifications = data.get(
        "certifications",
        []
    ) or []

    # --------------------------------------------------------
    # SELECTED SECTIONS
    # --------------------------------------------------------

    # If selected_sections was passed directly from app.py,
    # use it.
    #
    # Otherwise check whether it already exists inside data.
    if selected_sections is None:

        selected_sections = data.get(
            "selected_sections"
        )

    # If nothing was selected, include all sections.
    if not selected_sections:

        selected_sections = [
            "summary",
            "education",
            "skills",
            "projects",
            "internships",
            "certifications"
        ]

    # Normalize section names
    selected_sections = [
        str(section).lower().strip()
        for section in selected_sections
        if str(section).strip()
    ]

    # Remove duplicates while preserving order
    selected_sections = list(
        dict.fromkeys(selected_sections)
    )

    # Store selection in data
    data["selected_sections"] = selected_sections

    # --------------------------------------------------------
    # CREATE PDF
    # --------------------------------------------------------

    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN,
        title="Placentra AI Resume",
        author="Placentra AI",
        subject="ATS Friendly Resume",
        creator="Placentra AI"
    )

    story = []

    # --------------------------------------------------------
    # HEADER
    # --------------------------------------------------------
    #
    # Header is always included because it contains:
    # Name
    # Target role
    # Email
    # Phone
    # LinkedIn
    # GitHub
    #
    # These are essential resume contact details.
    # --------------------------------------------------------

    add_header(
        story,
        profile
    )

    # --------------------------------------------------------
    # PROFESSIONAL SUMMARY
    # --------------------------------------------------------

    if section_enabled(
        selected_sections,
        "objective"
    ):

        add_objective(
            story,
            profile
        )

    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    if section_enabled(
        selected_sections,
        "education"
    ):

        add_education(
            story,
            profile
        )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if section_enabled(
        selected_sections,
        "skills"
    ):

        add_skills(
            story,
            skills
        )

    # --------------------------------------------------------
    # PROJECTS
    # --------------------------------------------------------

    if section_enabled(
        selected_sections,
        "projects"
    ):

        add_projects(
            story,
            projects
        )

    # --------------------------------------------------------
    # INTERNSHIPS
    # --------------------------------------------------------

    if section_enabled(
        selected_sections,
        "internships"
    ):

        add_internships(
            story,
            internships
        )

    # --------------------------------------------------------
    # CERTIFICATIONS
    # --------------------------------------------------------

    if section_enabled(
        selected_sections,
        "certifications"
    ):

        add_certifications(
            story,
            certifications
        )

    # --------------------------------------------------------
    # BUILD PDF
    # --------------------------------------------------------

    doc.build(
        story,
        onFirstPage=add_page_footer,
        onLaterPages=add_page_footer
    )

    return filename


# ============================================================
# BACKWARD COMPATIBILITY
# ============================================================

def create_resume_pdf(data, filename):
    """
    Backward-compatible wrapper.

    Existing code using:

        create_resume_pdf(data, filename)

    will continue to work.
    """

    return generate_resume(
        data,
        filename
    )