export type AdminRole = 'super_admin' | 'event_admin' | 'content_admin' | 'team_admin';

export const TEAM_CATEGORIES = [
  'Faculty Coordinators and Mentors',
  'Community Leadership',
  'Technical Leadership',
  'Operations and Management',
  'Technical Team',
  'Event Management',
  'Community and Outreach',
  'General Members',
] as const;

export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

export type MediaCategory =
  | 'logo'
  | 'hero'
  | 'community'
  | 'team'
  | 'event_poster'
  | 'event_gallery'
  | 'milestone';

export interface ObjectiveItem {
  title: string;
  description: string;
}

export interface SiteSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroDescription: string;
  heroPhotoUrl?: string;
  campusSessionPhotoUrl?: string;
  aboutLaunchPhotoUrl?: string;
  awsLogoUrl?: string;
  ucerLogoUrl?: string;
  introTitle: string;
  introBody: string;
  collagePhotoUrls?: string[];
  statsConfigured: boolean;
  statsTotalMembers?: number;
  statsEventsConducted?: number;
  statsWorkshopsOrganised?: number;
  statsProjectsDeveloped?: number;
  aboutStoryTitle?: string;
  aboutStoryBody?: string;
  aboutVision?: string;
  aboutMission?: string[];
  aboutObjectives?: ObjectiveItem[];
  contactEmail?: string;
  contactAddress?: string;
  facultyCoordinatorContact?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
  mapEmbedUrl?: string;
  updatedAt?: unknown;
  updatedBy?: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  addedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TeamMember {
  id: string;
  fullName: string;
  designation: string;
  institution?: string;
  category: TeamCategory;
  department?: string;
  academicYear?: string;
  responsibility?: string;
  bio?: string;
  photoUrl?: string;
  imageClassName?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  hierarchyOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface CommunityEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  organiser?: string;
  speaker?: string;
  mode?: string;
  dateDisplayOverride?: string;
  eligibilityLabel?: string;
  prerequisites?: string;
  highlightsTitle?: string;
  registrationCtaType?: 'internal_form' | 'qr_poster';
  registrationNote?: string;
  posterAspect?: string;
  posterFit?: 'cover' | 'contain';
  statusOverride: 'auto' | 'upcoming' | 'ongoing' | 'past';
  startDate: string;
  endDate: string;
  timeLabel?: string;
  venue: string;
  posterUrl?: string;
  shortDescription: string;
  fullDescription: string;
  instructions?: string;
  highlights?: string[];
  winnersSummary?: string;
  participationSummary?: string;
  organisingTeamNames?: string[];
  galleryUrls?: string[];
  eligibilityScope: 'ucer_only' | 'open_college';
  registrationMode: 'individual' | 'team' | 'both';
  maxTeamSize?: number;
  requireStudentId?: boolean;
  registrationOpen: boolean;
  registrationDeadline?: string;
  customQuestions?: CustomQuestion[];
  isPublished: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TeamMemberSubmission {
  name: string;
  email: string;
  department: string;
  academicYear: string;
}

export interface CustomAnswerSubmission {
  questionId: string;
  questionLabel: string;
  answer: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  registrationCode: string;
  lockId: string;
  fullName: string;
  collegeEmail: string;
  contactNumber: string;
  collegeName: string;
  department: string;
  academicYear: string;
  studentId?: string;
  registrationType: 'individual' | 'team';
  teamName?: string;
  teamMembers?: TeamMemberSubmission[];
  customAnswers?: CustomAnswerSubmission[];
  consentAccepted: boolean;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Milestone {
  id: string;
  dateLabel: string;
  sortOrder: number;
  title: string;
  description: string;
  photoUrl?: string;
  relatedEventId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  linkUrl?: string;
  linkLabel?: string;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt?: unknown;
}

export interface MediaAsset {
  id: string;
  title: string;
  category: MediaCategory;
  url: string;
  altText: string;
  associatedEntityId?: string;
  uploadedBy?: string;
  createdAt?: unknown;
}

export interface ActivityLog {
  id: string;
  actorEmail: string;
  action: string;
  section: string;
  createdAt?: unknown;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroHeadline: 'WE ARE BUILDERS.',
  heroSubheadline: 'LEARN. CONNECT. BUILD. GROW.',
  heroDescription:
    'A student-driven community exploring cloud computing, artificial intelligence and emerging technologies through hands-on learning and collaborative innovation.',
  heroPhotoUrl: '/assets/aistudio/Black_and_White_Modern_Art_Festival_Poster_5f1c8a91.png',
  campusSessionPhotoUrl: '/assets/aistudio/Campus_session_slotimage_be78ab67.jpeg',
  aboutLaunchPhotoUrl: '/assets/aistudio/Team_Photograph_5aaf907a.jpeg',
  awsLogoUrl: '/assets/aistudio/aws_logo_599c725d.svg',
  ucerLogoUrl: '/assets/aistudio/UCER_logo_a4288764.png',
  introTitle: 'Student Builder Group – AWS at United College of Engineering & Research',
  introBody:
    'An open, peer-driven technical community at United College of Engineering & Research (UCER), Prayagraj, Uttar Pradesh, India. We bring students together to make cloud computing accessible, practise hands-on system architecture, build real-world projects, and connect campus innovators with emerging technology.',
  collagePhotoUrls: [
    '/assets/aistudio/aw1_5c559b84.jpeg',
    '/assets/aistudio/aw6_9f811c21.jpeg',
    '/assets/aistudio/aw4_e6a0e18d.jpeg',
    '/assets/aistudio/aw3_b16e95a6.jpeg',
    '/assets/aistudio/aw2_910c693e.jpeg',
    '/assets/aistudio/aw7_2f284dc1.jpeg',
  ],
  statsConfigured: false,
  statsTotalMembers: 0,
  statsEventsConducted: 0,
  statsWorkshopsOrganised: 0,
  statsProjectsDeveloped: 0,
  aboutStoryTitle: 'Conceptualised & Launched at UCER, Prayagraj',
  aboutStoryBody:
    'The official founding story, launch dates, and inaugural milestones of the Student Builder Group – AWS at United College of Engineering & Research will be published here via the Admin Content Manager.',
  aboutVision:
    'To cultivate a generation of student builders who transform knowledge into innovation through technology, collaboration and continuous learning.',
  aboutMission: [
    'Make cloud and emerging technologies accessible to every student.',
    'Promote practical, hands-on engineering over passive theory.',
    'Encourage collaborative, cross-disciplinary project development.',
    'Create structured opportunities for technical exploration and experimentation.',
    'Build a sustainable, student-led peer learning ecosystem at UCER.',
  ],
  aboutObjectives: [
    {
      title: 'Cloud Fluency',
      description:
        'Equip students with foundational and applied cloud architecture skills through guided labs and live deployments.',
    },
    {
      title: 'Applied AI & Systems',
      description:
        'Explore artificial intelligence, modern web engineering, and distributed tooling in practical workshop formats.',
    },
    {
      title: 'Project-First Culture',
      description:
        'Move beyond classroom assignments by shipping collaborative student prototypes, tools, and hackathon solutions.',
    },
    {
      title: 'Campus-Wide Mentorship',
      description:
        'Foster peer-to-peer knowledge sharing across departments and academic years alongside faculty mentorship.',
    },
  ],
  contactEmail: '',
  contactAddress: 'United College of Engineering & Research (UCER), Prayagraj, Uttar Pradesh, India',
  facultyCoordinatorContact: '1. Adesh Kumar Gual\n2. Gargi Tripathi',
  linkedinUrl: 'https://www.linkedin.com/company/aws-student-builder-group-at-ucer/',
  instagramUrl: 'https://www.instagram.com/aws.sbg.ucer?jplx=MXdhdmxmMTZ6cGF0Mg==',
  githubUrl: '',
  mapEmbedUrl: '',
};

export const CORE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'core-faculty-adesh-kumar-gual',
    fullName: 'Adesh Kumar Gual',
    designation: '',
    institution: 'UCER',
    category: 'Faculty Coordinators and Mentors',
    photoUrl: '/assets/aistudio/adesh_kumar_gual_d6a44235.jpeg',
    imageClassName: 'object-[50%_15%]',
    hierarchyOrder: 1,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 'core-faculty-gargi-tripathi',
    fullName: 'Gargi Tripathi',
    designation: '',
    institution: 'UCER',
    category: 'Faculty Coordinators and Mentors',
    photoUrl: '/assets/aistudio/gargi_tripathi_f88ef40e.jpeg',
    imageClassName: 'object-[50%_14%]',
    hierarchyOrder: 2,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 'core-shashwat-ojha',
    fullName: 'Shashwat Ojha',
    designation: 'SBGL Lead',
    institution: 'UCER',
    category: 'Community Leadership',
    photoUrl: '/assets/aistudio/Shashwat_Ojha_22bef3b5.png',
    imageClassName: 'object-[50%_14%]',
    hierarchyOrder: 3,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'core-faiz-khan',
    fullName: 'Faiz Khan',
    designation: 'SBCL Senior Event Co-Operation & Remote Outreach Lead',
    category: 'Community Leadership',
    photoUrl: '/assets/aistudio/Faiz_Khan_877c5cf1.png',
    imageClassName: 'object-[50%_20%]',
    hierarchyOrder: 4,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'core-apoorv-srivastava',
    fullName: 'Apoorv Srivastava',
    designation: 'Technical Lead',
    category: 'Community Leadership',
    photoUrl: '/assets/aistudio/Apoorv_Srivastava_563f4a00.PNG',
    imageClassName: 'object-[50%_18%]',
    hierarchyOrder: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'core-aditi-shukla',
    fullName: 'Aditi Shukla',
    designation: 'Event Management & Organisational Management Lead',
    category: 'Community Leadership',
    photoUrl: '/assets/aistudio/Aditi_Shukla_6ac76614.jpeg',
    imageClassName: 'object-[50%_20%]',
    hierarchyOrder: 6,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'core-nishant-pratap-singh',
    fullName: 'Nishant Pratap Singh',
    designation: 'Social Media Lead',
    category: 'Community Leadership',
    photoUrl: '/assets/aistudio/Nishant_Singh_38a03061.jpeg',
    imageClassName: 'object-[50%_18%]',
    hierarchyOrder: 7,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 'core-naqeeba-irshad',
    fullName: 'Naqeeba Irshad',
    designation: 'Design & Content Lead',
    category: 'Community Leadership',
    photoUrl: '/assets/aistudio/Naqeeba_Irshad_0c90f7b6.jpeg',
    imageClassName: 'object-[50%_15%]',
    hierarchyOrder: 8,
    isFeatured: false,
    isActive: true,
  },
];

export const DEFAULT_EVENTS: CommunityEvent[] = [
  {
    id: 'aws-cloud-computing-fundamentals-2026-11-25',
    title: 'Cloud Computing & AWS Fundamentals — Industry Expert Session',
    slug: 'cloud-computing-aws-fundamentals-industry-expert-session',
    category: 'Industry Expert Session',
    organiser: 'AWS Student Builder Group, UCER',
    speaker: 'Software Engineer at PwC (Cloud Computing Expert)',
    mode: 'Virtual',
    dateDisplayOverride: '25 November 2026 (Wednesday)',
    eligibilityLabel: 'Open to all students',
    prerequisites: 'No prior AWS knowledge required.',
    highlightsTitle: 'What Will You Gain?',
    registrationCtaType: 'qr_poster',
    registrationNote: 'Register Now — Scan the QR code on the poster.',
    posterAspect: 'aspect-[4/5]',
    posterFit: 'contain',
    statusOverride: 'auto',
    startDate: '2026-11-25',
    endDate: '2026-11-25',
    timeLabel: '6:00 PM – 7:00 PM IST',
    venue: 'Virtual',
    posterUrl: '/assets/aistudio/e1_2d1b68c8.jpeg',
    shortDescription:
      'Ever wondered how Netflix handles millions of users or how businesses store and manage massive amounts of data? Join an interactive virtual session featuring a Software Engineer at PwC (Cloud Computing Expert).',
    fullDescription:
      "Ever wondered how Netflix handles millions of users or how businesses store and manage massive amounts of data? Let's explore the technology behind it all!\n\nThe AWS Student Builder Group, UCER invites you to an interactive session featuring a Software Engineer at PwC (Cloud Computing Expert).",
    highlights: [
      'Understand Cloud Computing & AWS fundamentals.',
      'Explore real-world AWS applications.',
      'Get industry insights and career guidance.',
      'Participate in a Live Q&A and engaging quiz.',
      'Win exciting rewards and earn an E-Certificate!',
    ],
    organisingTeamNames: ['AWS Student Builder Group, UCER'],
    eligibilityScope: 'open_college',
    registrationMode: 'individual',
    registrationOpen: true,
    isPublished: true,
  },
];


