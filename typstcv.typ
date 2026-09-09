#set page(paper: "a4", margin: 0.8in)
#set text(size: 11pt)


// --- Vertical rhythm & List compactness ---
#set par(spacing: 6pt)
#set list(tight: true, indent: 1em, body-indent: 0.5em) // Changed indent to 1em

// --- Section styling ---
#show heading.where(level: 1): it => block(width: 100%, above: 20pt, below: 10pt)[
  #set text(size: 14pt, weight: "bold")
  #it.body
  #v(-0.5em)
  #line(length: 100%, stroke: 0.5pt)
]

// --- Macros ---
#let job(title, dates, role, footer, items: none) = block(spacing: 0pt)[
  #strong(title) #h(1fr) #dates \
  #emph(role) \
  #v(0.2em) // Tiny gap before the PI line
  #text(size: 9.5pt, fill: luma(80))[#footer] // Removed bold, made it dark gray
  #if items != none [
    #v(0.4em) // Gap between header info and bullets
    #items
  ]
  #v(14pt) // Good separation between jobs
]

#let workexp(title, dates, role, affiliation, items) = block(spacing: 0pt)[
  #strong(title) #h(1fr) #dates \
  #if affiliation != none [
    #text(size: 10pt, fill: luma(80))[#affiliation] \
    #v(0.2em)
  ]
  #emph(role)
  #v(0.4em)
  #items
  #v(14pt) 
]

#let edu(school, dates, degree) = block(spacing: 0pt)[
  #strong(school) #h(1fr) #dates \
  #degree
  #v(14pt) // This matches the exact spacing gap we used for your labs!
]
// --- Document Start ---

#align(center)[
  #text(size: 20pt, weight: "bold")[Ryan Truong] \
  #v(0.5em)
  truongtruong\@g.harvard.edu | ryanvt.com
]

= Education

#edu(
  "Harvard University",
  "9/2025 - Present",
  "PhD Psychology"
)

#edu(
  "University of Texas at Austin",
  "8/2021 - 12/2023",
  "B.S. Psychology"
)

#edu(
  "University of Texas at Arlington",
  "8/2020 - 5/2021",
  "UT Coordinated Admission Program"
)

= Research Experience

#job(
  "CCN Lab, Harvard University",
  "7/2024 - 2025 | 9/2025 - Present",
  "RA / Graduate RA",
  [PI: Sam Gershman | Supervisor(s): Lance Ying]
)

#job(
  "Goris Lab, UT Austin",
  "1/2023 - 6/2024 | 9/2024 - 5/2025",
  "Research / Laboratory Technician",
  [PI: Robbe Goris | Supervisor(s): Gabriela Coello-Reyes, Akash Raj]
)

#job(
  "CasCogLab, UT Austin",
  "9/2023 - 6/2024 | 9/2024 - 5/2025",
  "Part-time RA",
  [PI: Desmond Ong | Supervisor(s): Emma Gueorguieva, Yoon Kyung Lee]
)

#job(
  "Gabrieli Lab, MIT McGovern Institute",
  "6/2024 - 11/2024",
  "Summer Research Intern",
  [PI: John Gabrieli | Supervisor(s): Clark Roberts]
)


= Publications

// Increased 'spacing' to add vertical room between each publication entry
#set par(hanging-indent: 2em, spacing: 14pt)

#v(2pt)
#text(size: 9.5pt)[\* denotes equal contribution]
#v(6pt)

#strong("Truong, R."), Ying, L., Gershman, S. J., & Irie, K. (2026). PlayTrain: An Efficient Reinforcement Learning Framework for LLM-Generated Adaptable JavaScript Games. #emph("(Submitted)")

Ying, L.\*, #strong("Truong, R.*"), Tenenbaum, J. B., & Gershman, S. J. (2026). Using Theory of Mind to Arbitrate between Social and Non-social Learning. #emph("(Submitted)")

Ying, L., #strong("Truong, R."), Sharma, P., Zhao, K. I., Cloos, N., Allen, K. R., Griffiths, T. L., Collins, K. M., Hernández-Orallo, J., Isola, P., Gershman, S. J., & Tenenbaum, J. B. (2026). AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games. #emph("(Submitted)")

Ying, L., #strong("Truong, R."), Collins, K. M., Zhang, C. E., Wei, M., Brooke-Wilson, T., Zhi-Xuan, T., Wong, L., & Tenenbaum, J. B. (2025). Language-Informed Synthesis of Rational Agent Models for Grounded Theory-of-Mind Reasoning On-The-Fly. #emph("(Findings of EMNLP, 2025)")

Ying, L.\*, Hillel, A.\*, #strong("Truong, R.*"), Mansinghka, V., Tenenbaum, J. B., & Zhi-Xuan, T. (2025). Belief Attribution as Mental Explanation: The Role of Accuracy, Informativity, and Causality. #emph("(CogSci 2025)")

Ying, L., #strong("Truong, R."), Tenenbaum, J. B., & Gershman, S. J. (2025). Adaptive social learning using theory of mind. (#emph("CogSci 2025"))


// Reset paragraph settings so the indentation doesn't bleed into the next sections
#set par(hanging-indent: 0em, spacing: 6pt)

= Mentorship & Service

#workexp(
  "Becoming a Brain Scientist (MBB S-102)",
  "2026",
  "Graduate Research Mentor",
  "Harvard Summer School",
  [
    - Mentored two students through summer research projects, meeting weekly and advising on the write-up of a final research paper
  ]
)

#workexp(
  "Health Professions Recruitment and Exposure Program (HPREP)",
  "2025 - 2026",
  "Graduate Student Mentor",
  "Harvard Medical School",
  [
    - Provided weekly one-on-one mentorship and guidance to high school students interested in pursuing careers in the health sciences and medicine
  ]
)

#workexp(
  "Graduate Student Mentorship Initiative (GSMI)",
  "2025",
  "Graduate Student Mentor",
  "Cientifico Latino",

  [
    - Guided prospective STEM graduate students through the application process by providing written feedback and weekly one-on-one meetings
  ]
)

#workexp(
  "Prospective Ph.D. & RA Event in Psychology (PPREP)",
  "2025",
  "Graduate Student Advisor",
  "Harvard Psychology Program",
  [
    - Advised prospective applicants navigating the Psychology PhD admissions and application process
  ]
)

// --- Optional sections ---
/*
= Work Experience

#workexp(
  "RVT Consultant, Dallas, TX",
  "6/2019 - Present",
  "Seasonal Independent FDA Regulatory Manufacturing Consultant",
  [
    - Generate solutions for FDA 483 Observations and Warning Letters
    - Create documentation (SOPs, Component specifications, MMRs, BPRs)
    - Communicate directly with FDA investigators
  ]
)

#workexp(
  "Bouldering Project, Austin, TX",
  "8/2022 - 4/2023",
  "Operations Specialist",
  [
    - Provide customer service and perform operational duties
  ]
)

#workexp(
  "Kostop (formerly Left Wing), Austin, TX",
  "9/2021 - 5/2022",
  "Shift-Lead | Line Cook | Cashier",
  [
    - Supervise employees and handle food preparation duties
  ]
)

= Leadership

#workexp(
  "Longhorn Melee, Austin, TX",
  "8/2021 - 5/2022",
  "President",
  [
    - Organized weekly video game tournaments for 20+ participants
    - Managed club funds and tournament winnings
  ]
)
*/
