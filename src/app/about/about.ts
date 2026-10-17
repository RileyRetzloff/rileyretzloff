import { Component } from '@angular/core';

interface Proficiency {
  label: string;
  items: string;
}

interface Job {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
  current?: boolean;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
})
export class About {
  protected readonly banner =
    'https://34ggzkze9s.ufs.sh/f/QUrPhpHwWNxUXSarqAf5NxjRVWc6L8Y4MQIFPTfUKtvy1uJi';

  protected readonly proficiencies: Proficiency[] = [
    {
      label: 'Languages',
      items: 'TypeScript, JavaScript, C#, Python, HTML, CSS (SCSS), SQL, Java',
    },
    {
      label: 'Frontend',
      items: 'Angular, React, Bootstrap, Tailwind CSS',
    },
    {
      label: 'Backend',
      items: '.NET (.NET Core, ASP.NET Core Web API), Flask',
    },
    {
      label: 'Databases & ORMs',
      items:
        'SQL Server (SSMS), PostgreSQL, Entity Framework Core, LINQ, Flask SQLAlchemy',
    },
    {
      label: 'Tools & Methods',
      items:
        'Git, GitHub, Azure DevOps, Postman, Pytest, RESTful APIs, Agile (Scrum)',
    },
    {
      label: 'Cloud & Deployment',
      items: 'Render, Azure',
    },
  ];

  protected readonly jobs: Job[] = [
    {
      title: 'Full-Stack Developer',
      company: 'Maher Terminals, LLC',
      dates: 'January 2026 – Present',
      current: true,
      bullets: [
        'Full-stack developer on a three-person team building and supporting 50+ applications for one of the largest container shipping terminals in the United States.',
        'End-to-End Delivery: Plan, design, build, test, deploy, and maintain applications supporting terminal operations and management.',
        'Frontend: Build responsive Angular applications with TypeScript, Angular Signals, Angular Material, PrimeNG, and Tailwind CSS.',
        'Backend: Develop APIs and business logic with Java and Spring Framework, connecting databases to user-facing applications.',
        'Data Engineering: Build PL/SQL pipelines to integrate and normalize internal and external data; maintain database tables, views, and logic.',
        'Deployment & Security: Deploy and maintain applications with Apache Tomcat, managing application configuration and secure credential handling.',
        'Testing & Change Management: Use Git, Gitea, Postman, TestLog, and ServiceNow for version control, project coordination, API testing, test suites, and release governance.',
      ],
    },
    {
      title: 'Junior Full-Stack Web Developer',
      company: 'TIAA, Newark, NJ',
      dates: 'January 2025 – December 2025',
      current: false,
      bullets: [
        'Engineered robust, internal-facing web applications using Angular (TypeScript) and ASP.NET Core Web API (C#)',
        'Designed and optimized relational database schemas using Entity Framework Core with SQL Server',
        'Leveraged Azure DevOps for end-to-end SDLC including CI/CD pipelines and automated deployments',
        'Built responsive UI components with Tailwind CSS and collaborated in Agile Scrum methodology',
      ],
    },
    {
      title: 'Internal Audit Intern',
      company: 'TIAA, Charlotte, NC',
      dates: 'June 2023 – August 2023',
      bullets: [
        'Gained experience with Internal Audit methodology and practices',
        'Applied existing knowledge and learned new concepts for IT Audit projects',
        'Communicated effectively with audit clients and team members',
      ],
    },
  ];

  protected readonly educationBullets: string[] = [
    'Maintained 4.0 GPA with double-major and minor',
    "Chancellor's List recognition every semester for academic excellence",
    'Treasurer of Charlotte Pride Outreach Association student organization',
  ];

  protected readonly softSkills: string[] = [
    'Complex problem analysis and rapid adaptation',
    'Natural leadership and exceptional communication',
    'Proactive learning with growth mindset',
    'Effective teaching and knowledge transfer',
  ];
}
