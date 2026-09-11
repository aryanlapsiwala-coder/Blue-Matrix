import api from './api';

export const SAMPLE_USERS = [
  {
    id: 'u1',
    name: 'Alex Chen',
    email: 'alex.chen@campus.edu',
    role: 'STUDENT',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: '4th Year (Senior)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    knowPoints: 2480,
    badges: ['Pioneer', 'Mentor', 'Verified Expert'],
    contributionsCount: 14,
    joinedDate: '2023-08-15',
    bio: 'Final Year CS Scholar. Placed at Google (SDE-1). Focuses on distributed consensus & systems design.',
  },
  {
    id: 'u2',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@campus.edu',
    role: 'FACULTY',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: 'Associate Professor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    knowPoints: 2150,
    badges: ['Pioneer', 'Mentor', 'Verified Expert'],
    contributionsCount: 22,
    joinedDate: '2020-01-10',
    bio: 'Lead Researcher, Cloud Computing & Distributed Systems Lab.',
  },
  {
    id: 'u3',
    name: 'Marcus Ramirez',
    email: 'm.ramirez@campus.edu',
    role: 'ALUMNI',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: 'Class of 2021 (Google Cloud Principal)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    knowPoints: 1940,
    badges: ['Pioneer', 'Mentor', 'Verified Expert'],
    contributionsCount: 19,
    joinedDate: '2019-06-01',
    bio: 'Central HPC & AI Supercomputing Lab Lead.',
  },
  {
    id: 'u4',
    name: 'Eleanor Vance',
    email: 'admin.knowpass@campus.edu',
    role: 'ADMIN',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: 'Dean of Academic Computing',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    knowPoints: 1650,
    badges: ['Pioneer', 'Mentor'],
    contributionsCount: 12,
    joinedDate: '2018-03-20',
    bio: 'Institutional Administrator for KnowPass governance.',
  },
  {
    id: 'u5',
    name: 'Priya Sundaram',
    email: 'priya.s@campus.edu',
    role: 'FACULTY',
    department: 'Electronics & Communication (ECE)',
    yearOfStudy: 'Assistant Professor',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150',
    knowPoints: 1420,
    badges: ['Pioneer', 'Mentor', 'Verified Expert'],
    contributionsCount: 11,
    joinedDate: '2021-08-01',
    bio: 'VLSI Digital Design & ASIC Verification In-Charge.',
  },
  {
    id: 'u6',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@campus.edu',
    role: 'STUDENT',
    department: 'Electronics & Communication (ECE)',
    yearOfStudy: '4th Year (Senior)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    knowPoints: 1180,
    badges: ['Pioneer', 'Verified Expert'],
    contributionsCount: 8,
    joinedDate: '2023-08-20',
    bio: 'ECE Core hardware enthusiast. Placed at NVIDIA & Qualcomm.',
  },
  {
    id: 'u7',
    name: 'Vikram Malhotra',
    email: 'vikram.m@campus.edu',
    role: 'STUDENT',
    department: 'Mechanical Engineering (ME)',
    yearOfStudy: '4th Year (Senior)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    knowPoints: 1050,
    badges: ['Pioneer', 'Verified Expert'],
    contributionsCount: 7,
    joinedDate: '2023-08-18',
    bio: 'Formula Student Racecar Aerodynamics & CAD Lead.',
  },
  {
    id: 'u8',
    name: 'David Kim',
    email: 'david.kim@campus.edu',
    role: 'STUDENT',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: '3rd Year (Junior)',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    knowPoints: 890,
    badges: ['Verified Expert'],
    contributionsCount: 6,
    joinedDate: '2024-01-15',
    bio: 'Cloud Infrastructure & Kubernetes Contributor.',
  },
];

export const SAMPLE_KNOWLEDGE_ITEMS = [
  // -------------------------------------------------------------
  // 1. PROJECT TIPS (5 Entries: 2 CSE, 1 ECE, 2 ME)
  // -------------------------------------------------------------
  {
    id: 'kb_01',
    title: 'Distributed Consensus: Implementing Raft Algorithm in Go with TLA+ Formal Verification',
    category: 'Project Experience',
    knowledgeType: 'Project Experience',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: '4th Year (Senior)',
    rating: 5.0,
    author: 'Alex Chen',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-02-28T10:00:00Z',
    views: 1840,
    upvotes: 312,
    isTrending: true,
    isVerified: true,
    verifiedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
    tags: ['Go', 'Raft', 'Distributed-Systems', 'TLA+', 'Concurrency'],
    summary: 'Design notes on building an RPC-driven Raft consensus cluster in Go with randomized election timers and TLA+ model checking to avoid split-brain split votes.',
    content: `# Distributed Consensus in Go with Raft\n\n### 📌 Architecture Overview\nImplemented a 5-node cluster supporting leader election, log replication, and safe state machine compaction.\n\n### 🛡️ Preventing Split-Brain in Elections\n* Randomized election timeouts between 150ms and 300ms.\n* Strict majority vote (\`N/2 + 1\`) required before accepting client writes.`,
    resources: { files: [{ name: 'raft_tla_spec.pdf', size: '1.8 MB', type: 'PDF' }] },
    comments: [{ id: 'c1', user: 'David Kim', text: 'Used this architecture for our senior capstone with 99.99% fault recovery!', time: '1 day ago' }]
  },
  {
    id: 'kb_02',
    title: 'Production RAG AI Pipeline: Hybrid Dense-Sparse Search with ChromaDB & LangChain',
    category: 'Project Experience',
    knowledgeType: 'Project Experience',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: '3rd Year (Junior)',
    rating: 4.9,
    author: 'David Kim',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    createdAt: '2026-02-27T14:30:00Z',
    views: 1420,
    upvotes: 245,
    isTrending: true,
    isVerified: true,
    verifiedBy: 'Campus AI Research Group',
    tags: ['RAG', 'Vector-DB', 'ChromaDB', 'Python', 'LLM'],
    summary: 'Complete engineering guide to building low-latency semantic search using hybrid BM25 lexical matching and dense vector embeddings with cross-encoder re-ranking.',
    content: `# Production Hybrid RAG Pipeline\n\n### 📌 Retrieval Strategy\nCombining dense embeddings with sparse BM25 scores via Reciprocal Rank Fusion (RRF) improved factual recall by 34%.`,
    resources: { files: [{ name: 'rag_eval_benchmark.pdf', size: '2.1 MB', type: 'PDF' }] },
    comments: []
  },
  {
    id: 'kb_03',
    title: 'RISC-V 5-Stage Pipelined Core in Verilog with Dynamic Branch Prediction on Artix-7 FPGA',
    category: 'Project Experience',
    knowledgeType: 'Project Experience',
    department: 'Electronics & Communication (ECE)',
    yearOfStudy: '4th Year (Senior)',
    rating: 4.8,
    author: 'Sneha Reddy',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2026-02-26T09:15:00Z',
    views: 1190,
    upvotes: 198,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'Priya Sundaram (ECE Dept)',
    tags: ['RISC-V', 'Verilog', 'FPGA', 'Computer-Architecture', 'Vivado'],
    summary: 'Hardware implementation of an RV32I 5-stage CPU core featuring forwarding hazard units and 2-bit saturating counter branch predictors achieving 100MHz Fmax on Xilinx Artix-7.',
    content: `# RISC-V 5-Stage Core on Artix-7\n\n### ⚙️ Hazard Resolution\n* Data forwarding from EX/MEM and MEM/WB stages eliminated 85% of load-use pipeline stalls.`,
    resources: { files: [{ name: 'riscv_artix7_bitstream.zip', size: '3.4 MB', type: 'ZIP' }] },
    comments: []
  },
  {
    id: 'kb_04',
    title: 'Formula Student Chassis Aerodynamics & Boundary Layer CFD Meshing in ANSYS Fluent',
    category: 'Project Experience',
    knowledgeType: 'Project Experience',
    department: 'Mechanical Engineering (ME)',
    yearOfStudy: '4th Year (Senior)',
    rating: 4.9,
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-02-25T11:45:00Z',
    views: 1350,
    upvotes: 210,
    isTrending: true,
    isVerified: true,
    verifiedBy: 'Faculty Advisor - Formula SAE Team',
    tags: ['CFD', 'Aerodynamics', 'ANSYS-Fluent', 'CAD', 'Formula-Student'],
    summary: 'Aerodynamic optimization of inverted multi-element front wing and rear diffuser, achieving Cl*A of 2.8 at 60 km/h with y+ < 1 prism layer inflation meshes.',
    content: `# FSAE Aerodynamics & CFD Workflow\n\n### 🏎️ Ground Effect Modeling\n* Designed underbody venturi tunnels with polyhedral meshing to capture vortex ground-effect downforce.`,
    resources: { files: [{ name: 'fsae_aerodynamics_report.pdf', size: '5.6 MB', type: 'PDF' }] },
    comments: []
  },
  {
    id: 'kb_05',
    title: 'Automated Inverse Kinematics for 6-DOF Robotic Arm with MoveIt2 and ROS2 Humble',
    category: 'Project Experience',
    knowledgeType: 'Project Experience',
    department: 'Mechanical Engineering (ME)',
    yearOfStudy: '4th Year (Senior)',
    rating: 4.7,
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-02-24T16:00:00Z',
    views: 920,
    upvotes: 145,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'Robotics & Automation Lab',
    tags: ['Robotics', 'ROS2', 'MoveIt2', 'Kinematics', 'Mechatronics'],
    summary: 'Trajectory planning and collision-free pick-and-place execution using TRAC-IK inverse kinematics solvers and Gazebo physics simulation.',
    content: `# 6-DOF Robotic Arm Control\n\n### 🤖 Trajectory Execution\n* Integrated TRAC-IK plugin to bypass kinematic singularities during 3D workspace reachability tests.`,
    resources: { files: [{ name: 'ros2_arm_urdf.zip', size: '2.8 MB', type: 'ZIP' }] },
    comments: []
  },

  // -------------------------------------------------------------
  // 2. PLACEMENT INSIGHTS (3 Entries: 1 CSE, 1 ECE, 1 ME)
  // -------------------------------------------------------------
  {
    id: 'kb_06',
    title: 'Google & Microsoft SDE-1 Placement Playbook: Concurrency, LLD & Graph DSA',
    category: 'Placement Insight',
    knowledgeType: 'Placement Insight',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: '4th Year (Senior)',
    rating: 5.0,
    author: 'Alex Chen',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-02-23T08:30:00Z',
    views: 2650,
    upvotes: 520,
    isTrending: true,
    isVerified: true,
    verifiedBy: 'Campus Training & Placement Cell',
    tags: ['Placement-Insight', 'SDE', 'Google', 'Microsoft', 'DSA'],
    summary: '5-round interview blueprint with compensation details (₹44.5 LPA), high-frequency graph problems, low-level design patterns, and STAR behavioral answers.',
    content: `# Tier-1 Tech Campus Placement Playbook\n\n### 💼 Round-by-Round Breakdown\n1. OA: 2 Graph Hard + 1 2D DP.\n2. LLD: Thread-safe Parking Lot Rate Limiter.\n3. HLD: Distributed URL Shortener with Redis Cache.`,
    resources: { files: [{ name: 'SDE1_Interview_Cheatsheet.pdf', size: '3.8 MB', type: 'PDF' }] },
    comments: [{ id: 'c2', user: 'Rohan Sharma', text: 'This single guide helped me crack my technical round 1!', time: '2 days ago' }]
  },
  {
    id: 'kb_07',
    title: 'NVIDIA & Qualcomm ASIC Hardware Interview Guide: STA Violations & Gray Code CDC',
    category: 'Placement Insight',
    knowledgeType: 'Placement Insight',
    department: 'Electronics & Communication (ECE)',
    yearOfStudy: '4th Year (Senior)',
    rating: 4.9,
    author: 'Sneha Reddy',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2026-02-22T13:00:00Z',
    views: 1780,
    upvotes: 340,
    isTrending: true,
    isVerified: true,
    verifiedBy: 'Dept of ECE Placement Committee',
    tags: ['Placement-Insight', 'NVIDIA', 'Qualcomm', 'VLSI', 'STA'],
    summary: 'Core semiconductor placement questions: Setup/Hold time slack equations, clock domain crossing (CDC) synchronizers, and Gray-coded asynchronous FIFOs.',
    content: `# Semiconductor ASIC Placement Playbook\n\n### ⚡ High-Frequency Questions\n* Calculating max operating frequency with clock jitter and setup delay.\n* Resolving hold time violations using data-path buffer insertion.`,
    resources: { files: [{ name: 'VLSI_Placement_Questions.pdf', size: '2.5 MB', type: 'PDF' }] },
    comments: []
  },
  {
    id: 'kb_08',
    title: 'Tesla & Tata Motors Mechanical Design Placement: GD&T, FEA & Materials Selection',
    category: 'Placement Insight',
    knowledgeType: 'Placement Insight',
    department: 'Mechanical Engineering (ME)',
    yearOfStudy: '4th Year (Senior)',
    rating: 4.8,
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-02-21T15:20:00Z',
    views: 1240,
    upvotes: 215,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'Mechanical Dept Placement Cell',
    tags: ['Placement-Insight', 'Automotive', 'FEA', 'GDT', 'Materials'],
    summary: 'Comprehensive interview playbook for automotive R&D roles covering ASME Y14.5 Geometric Dimensioning & Tolerancing (GD&T) and von Mises stress criteria.',
    content: `# Automotive Mechanical Engineering Interview Guide\n\n### 🔧 Core Focus Areas\n* True position tolerance calculations with Maximum Material Condition (MMC).\n* Fatigue life prediction under cyclic tensile loading.`,
    resources: { files: [{ name: 'GDT_Quick_Reference.pdf', size: '1.9 MB', type: 'PDF' }] },
    comments: []
  },

  // -------------------------------------------------------------
  // 3. LAB TIPS (3 Entries: 1 CSE, 1 ECE, 1 ME)
  // -------------------------------------------------------------
  {
    id: 'kb_09',
    title: 'HPC Slurm Batch GPU Allocation & Multi-Node PyTorch Distributed Training SOP',
    category: 'Lab Tip',
    knowledgeType: 'Lab Tip',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: 'All Levels',
    rating: 4.9,
    author: 'Marcus Ramirez',
    authorRole: 'ALUMNI',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2026-02-20T11:00:00Z',
    views: 1980,
    upvotes: 380,
    isTrending: true,
    isVerified: true,
    verifiedBy: 'Prof. Davis (Director of IT)',
    tags: ['HPC', 'SLURM', 'GPU', 'CUDA', 'PyTorch'],
    summary: 'Standard operating procedure for submitting multi-GPU jobs on the campus 32-node A100 cluster with torch.distributed.launch and scratch disk cleanup.',
    content: `# Campus HPC Cluster SLURM SOP\n\n### 🚀 Submitting Batch Scripts\n\`\`\`bash\n#SBATCH --gres=gpu:a100:2\n#SBATCH --time=08:00:00\nmodule load cuda/12.8 pytorch/2.4\nsrun python train_ddp.py\n\`\`\``,
    resources: { files: [{ name: 'HPC_SOP_v3.pdf', size: '2.4 MB', type: 'PDF' }] },
    comments: [{ id: 'c3', user: 'Alex Chen', text: 'Essential for running large neural network benchmarks!', time: '3 days ago' }]
  },
  {
    id: 'kb_10',
    title: 'Keysight High-Speed Mixed-Signal Oscilloscope 4GHz Jitter & Eye Diagram Calibration',
    category: 'Lab Tip',
    knowledgeType: 'Lab Tip',
    department: 'Electronics & Communication (ECE)',
    yearOfStudy: '3rd Year (Junior)',
    rating: 4.7,
    author: 'Priya Sundaram',
    authorRole: 'FACULTY',
    authorAvatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150',
    createdAt: '2026-02-19T09:40:00Z',
    views: 890,
    upvotes: 142,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'ECE Advanced Communications Lab',
    tags: ['Oscilloscope', 'RF', 'Calibration', 'Jitter', 'Keysight'],
    summary: 'Lab calibration steps for 50-Ohm coaxial BNC terminators and differential active probes to measure picosecond clock jitter without ground loop noise.',
    content: `# RF Lab Calibration Protocol\n\n### 📡 Eye Diagram Measurements\n* Set trigger source to Clock Recovery PLL.\n* Verify Eye Height and Width compliance for PCIe Gen4 signals.`,
    resources: { files: [{ name: 'Keysight_Scope_Manual.pdf', size: '4.2 MB', type: 'PDF' }] },
    comments: []
  },
  {
    id: 'kb_11',
    title: 'Instron Universal Testing Machine (UTM) 100kN Tensile Strain-Gauge Zeroing Protocol',
    category: 'Lab Tip',
    knowledgeType: 'Lab Tip',
    department: 'Mechanical Engineering (ME)',
    yearOfStudy: '2nd Year (Sophomore)',
    rating: 4.8,
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-02-18T14:10:00Z',
    views: 780,
    upvotes: 125,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'Materials Testing Workshop Superintendent',
    tags: ['UTM', 'Tensile-Testing', 'Stress-Strain', 'Lab-Safety', 'Instron'],
    summary: 'Safety checklist and digital extensometer calibration steps for recording stress-strain curves on aluminum 6061-T6 dogbone specimens.',
    content: `# 100kN UTM Tensile Testing SOP\n\n### ⚠️ Safety Precautions\n* Ensure plexiglass shatter-guard is locked before crosshead movement.\n* Zero extensometer gauge length at 50mm before applying tensile ramp.`,
    resources: { files: [{ name: 'UTM_Standard_SOP.pdf', size: '1.7 MB', type: 'PDF' }] },
    comments: []
  },

  // -------------------------------------------------------------
  // 4. FACULTY METHODS (2 Entries: 1 CSE, 1 ECE)
  // -------------------------------------------------------------
  {
    id: 'kb_12',
    title: 'Pedagogical Rubric for Automated Grading of Multi-Threaded C++ Student Submissions',
    category: 'Faculty Method',
    knowledgeType: 'Faculty Method',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: 'Faculty Lead',
    rating: 4.9,
    author: 'Dr. Sarah Jenkins',
    authorRole: 'FACULTY',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: '2026-02-17T16:00:00Z',
    views: 1120,
    upvotes: 210,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'Academic Senate Committee',
    tags: ['Faculty-Method', 'Concurrency', 'Cpp', 'Auto-Grader', 'Valgrind'],
    summary: 'Containerized autograder harness utilizing LLVM ThreadSanitizer (TSan) and Valgrind Helgrind to detect subtle data races in student semaphore implementations.',
    content: `# Automated Concurrency Grading Harness\n\n### 🧪 Detection Strategy\n* Compiles student C++ code with \`-fsanitize=thread -g\` to flag memory races.\n* Stress tests producer-consumer queues under 64 concurrent threads.`,
    resources: { files: [{ name: 'Autograder_Docker_Harness.zip', size: '4.5 MB', type: 'ZIP' }] },
    comments: []
  },
  {
    id: 'kb_13',
    title: 'Laboratory Framework for Microcontroller SystemVerilog UVM Assertion Verification',
    category: 'Faculty Method',
    knowledgeType: 'Faculty Method',
    department: 'Electronics & Communication (ECE)',
    yearOfStudy: 'Associate Prof',
    rating: 4.8,
    author: 'Priya Sundaram',
    authorRole: 'FACULTY',
    authorAvatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150',
    createdAt: '2026-02-16T12:15:00Z',
    views: 840,
    upvotes: 165,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'Dept of ECE Curriculum Review Panel',
    tags: ['Faculty-Method', 'SystemVerilog', 'UVM', 'Verification', 'ASIC'],
    summary: 'Structured lab module teaching undergraduate engineers constrained-random verification, coverage bins, and SVA concurrent assertions.',
    content: `# SystemVerilog UVM Teaching Framework\n\n### 📋 Lab Curriculum Milestones\n* Week 1-3: Transaction-level modeling (TLM).\n* Week 4-6: Scoreboards and concurrent assertion binding (\`property...assert\`).`,
    resources: { files: [{ name: 'UVM_Lab_Curriculum.pdf', size: '3.1 MB', type: 'PDF' }] },
    comments: []
  },

  // -------------------------------------------------------------
  // 5. EVENT PLAYBOOKS (2 Entries: 1 CSE, 1 ME)
  // -------------------------------------------------------------
  {
    id: 'kb_14',
    title: 'Campus 36-Hour Hackathon Infrastructure & AWS Cloud Provisioning Runbook',
    category: 'Event Playbook',
    knowledgeType: 'Event Playbook',
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: 'All Levels',
    rating: 5.0,
    author: 'Alex Chen',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-02-15T18:00:00Z',
    views: 1950,
    upvotes: 410,
    isTrending: true,
    isVerified: true,
    verifiedBy: 'Campus Student Council & IT Infrastructure',
    tags: ['Event-Playbook', 'Hackathon', 'AWS', 'Networking', 'Cloud'],
    summary: 'Complete operational runbook for running 500+ participant hackathons: subnet Wi-Fi band steering, AWS credits distribution, and live scoring dashboard.',
    content: `# Campus Hackathon Technical Runbook\n\n### 🌐 Infrastructure Checklist\n* Split 5GHz Wi-Fi SSIDs to handle 1,200 simultaneous connected devices.\n* Deployed automated GitHub webhook submission evaluator on AWS ECS.`,
    resources: { files: [{ name: 'Hackathon_Operations_Runbook.pdf', size: '2.9 MB', type: 'PDF' }] },
    comments: [{ id: 'c4', user: 'Eleanor Vance', text: 'Saved our annual hackathon from catastrophic network bottlenecks!', time: '1 week ago' }]
  },
  {
    id: 'kb_15',
    title: 'Formula SAE Vehicle Scrutineering & Track Safety Technical Compliance Guide',
    category: 'Event Playbook',
    knowledgeType: 'Event Playbook',
    department: 'Mechanical Engineering (ME)',
    yearOfStudy: '4th Year (Senior)',
    rating: 4.9,
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-02-14T10:00:00Z',
    views: 1150,
    upvotes: 230,
    isTrending: false,
    isVerified: true,
    verifiedBy: 'Formula SAE Technical Inspection Board',
    tags: ['Event-Playbook', 'FSAE', 'Motorsport', 'Scrutineering', 'Safety'],
    summary: 'Pre-competition inspection checklist covering 60-degree tilt table tests, cockpit egress drills (under 5 seconds), and brake over-travel switches.',
    content: `# Formula SAE Technical Scrutineering Guide\n\n### 🏁 Critical Pass Criteria\n* Cockpit egress time strictly < 5.0 seconds in full fire-retardant racing gear.\n* 4-wheel dynamic brake lock test on dry asphalt without yaw deflection.`,
    resources: { files: [{ name: 'FSAE_Scrutineering_Checklist.pdf', size: '2.2 MB', type: 'PDF' }] },
    comments: []
  },
];

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { createComments } from './comments';
const commentService = createComments(supabase);

// Local storage persistence helpers for guaranteed retention across sessions
const getLocalUpvotes = () => {
  try {
    const raw = localStorage.getItem('knowpass_upvotes_cache');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalUpvote = (id, count) => {
  try {
    const cache = getLocalUpvotes();
    cache[id] = count;
    localStorage.setItem('knowpass_upvotes_cache', JSON.stringify(cache));
  } catch (e) {
    console.warn('Error caching upvote:', e);
  }
};

// Tag and resource parsing helpers ensuring zero crashes on malformed or stringified database entries
export const ensureArrayTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    const clean = tags.replace(/^\{|\}$/g, '');
    return clean.split(',').map((t) => t.trim().replace(/^"|"$/g, '')).filter(Boolean);
  }
  return [];
};

export const parseResources = (raw) => {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return raw && typeof raw === 'object' ? raw : { files: [] };
};

const getLocalCustomEntries = () => {
  try {
    const raw = localStorage.getItem('knowpass_custom_entries');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalCustomEntry = (entry) => {
  try {
    const list = getLocalCustomEntries();
    const updated = [entry, ...list.filter((it) => it.id !== entry.id)];
    localStorage.setItem('knowpass_custom_entries', JSON.stringify(updated));
  } catch (e) {
    console.warn('Error caching custom entry:', e);
  }
};

export const knowledgeService = {
  getAll: async (params = {}) => {
    const upvotesCache = getLocalUpvotes();
    const localCustom = getLocalCustomEntries();

    // 1. If Supabase is configured, fetch live rows from PostgreSQL
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('knowledge_entries').select('*').order('created_at', { ascending: false });

        if (params.category && params.category !== 'All') {
          query = query.or(`category.eq.${params.category},knowledge_type.eq.${params.category}`);
        }
        if (params.department && params.department !== 'All') {
          query = query.ilike('department', `%${params.department}%`);
        }
        if (params.year && params.year !== 'All') {
          query = query.eq('year_of_study', params.year);
        }
        if (params.minRating) {
          query = query.gte('rating', params.minRating);
        }

        const { data, error } = await query;
        if (!error && data) {
          const mapped = data.map((d) => {
            const effectiveUpvotes = upvotesCache[d.id] !== undefined ? Math.max(d.upvotes || 0, upvotesCache[d.id]) : (d.upvotes || 0);
            return {
              id: d.id,
              title: d.title || 'Untitled Knowledge Entry',
              category: d.category || d.knowledge_type || 'Project Experience',
              knowledgeType: d.knowledge_type || d.category || 'Project Experience',
              department: d.department || 'Computer Science & Engineering (CSE)',
              yearOfStudy: d.year_of_study || 'All Levels',
              rating: Number(d.rating) || 5.0,
              author: d.author_name || 'Campus Scholar',
              authorRole: d.author_role || 'STUDENT',
              authorAvatar: d.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              createdAt: d.created_at || new Date().toISOString(),
              views: d.views || 1,
              upvotes: effectiveUpvotes,
              isTrending: effectiveUpvotes > 100,
              isVerified: Boolean(d.is_verified),
              verifiedBy: d.verified_by,
              tags: ensureArrayTags(d.tags),
              summary: d.summary || '',
              content: d.content || '',
              resources: parseResources(d.resources),
              comments: [],
            };
          });

          // Merge any local custom entries that haven't synced yet
          localCustom.forEach((lc) => {
            if (!mapped.some((it) => it.id === lc.id || (it.title && it.title.trim() === lc.title?.trim()))) {
              mapped.unshift({
                ...lc,
                tags: ensureArrayTags(lc.tags),
                resources: parseResources(lc.resources),
                upvotes: upvotesCache[lc.id] !== undefined ? Math.max(lc.upvotes || 0, upvotesCache[lc.id]) : (lc.upvotes || 0),
                comments: (lc.comments || []),
              });
            }
          });

          return {
            items: mapped,
            total: mapped.length,
          };
        }
      } catch (err) {
        console.warn('[knowledgeService] Supabase fetch fallback:', err.message);
      }
    }

    // 2. Standard in-memory fallback + Local Storage Cache
    try {
      const response = await api.get('/knowledge', { params });
      return response.data;
    } catch {
      // Merge localCustom into fallback
      const combined = [...localCustom];
      SAMPLE_KNOWLEDGE_ITEMS.forEach((it) => {
        if (!combined.some((c) => c.id === it.id)) {
          combined.push(it);
        }
      });

      let filtered = combined.map((item) => ({
        ...item,
        tags: ensureArrayTags(item.tags),
        resources: parseResources(item.resources),
        upvotes: upvotesCache[item.id] !== undefined ? Math.max(item.upvotes || 0, upvotesCache[item.id]) : (item.upvotes || 0),
        comments: (item.comments || []),
      }));
      
      if (params.category && params.category !== 'All') {
        filtered = filtered.filter(
          (item) => item.category === params.category || item.knowledgeType === params.category
        );
      }
      if (params.department && params.department !== 'All') {
        filtered = filtered.filter((item) =>
          (item.department || '').toLowerCase().includes(params.department.toLowerCase())
        );
      }
      if (params.year && params.year !== 'All') {
        filtered = filtered.filter((item) => (item.yearOfStudy || 'All Levels') === params.year);
      }
      if (params.minRating) {
        filtered = filtered.filter((item) => (Number(item.rating) || 5.0) >= params.minRating);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            (item.title || '').toLowerCase().includes(q) ||
            (item.summary || '').toLowerCase().includes(q) ||
            (item.author || '').toLowerCase().includes(q) ||
            ensureArrayTags(item.tags).some((t) => typeof t === 'string' && t.toLowerCase().includes(q))
        );
      }
      return { items: filtered, total: filtered.length };
    }
  },

  getById: async (id) => {
    const upvotesCache = getLocalUpvotes();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('knowledge_entries').select('*').eq('id', id).single();
        if (!error && data) {
          const effectiveUpvotes = upvotesCache[data.id] !== undefined ? Math.max(data.upvotes || 0, upvotesCache[data.id]) : (data.upvotes || 0);
          return {
            id: data.id,
            title: data.title,
            category: data.category,
            knowledgeType: data.knowledge_type,
            department: data.department,
            yearOfStudy: data.year_of_study,
            rating: Number(data.rating) || 5.0,
            author: data.author_name,
            authorRole: data.author_role,
            authorAvatar: data.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            createdAt: data.created_at,
            views: data.views || 1,
            upvotes: effectiveUpvotes,
            isTrending: effectiveUpvotes > 100,
            isVerified: data.is_verified || false,
            verifiedBy: data.verified_by,
            tags: data.tags || [],
            summary: data.summary,
            content: data.content,
            resources: data.resources || { files: [] },
            comments: [],
          };
        }
      } catch (err) {
        console.warn('[knowledgeService] Supabase getById fallback:', err.message);
      }
    }

    try {
      const response = await api.get(`/knowledge/${id}`);
      return response.data;
    } catch {
      const base = SAMPLE_KNOWLEDGE_ITEMS.find((item) => item.id === id) || SAMPLE_KNOWLEDGE_ITEMS[0];
      return {
        ...base,
        upvotes: upvotesCache[base.id] !== undefined ? Math.max(base.upvotes, upvotesCache[base.id]) : base.upvotes,
        comments: (base.comments || []),
      };
    }
  },

  create: async (data) => {
    let finalItem = null;

    const safeTags = ensureArrayTags(data.tags);
    const safeResources = parseResources(data.resources);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          title: data.title,
          category: data.category || 'Project Experience',
          knowledge_type: data.knowledgeType || data.category || 'Project Experience',
          department: data.department || 'Computer Science & Engineering (CSE)',
          year_of_study: data.yearOfStudy || 'All Levels',
          author_name: data.author || 'Campus Scholar',
          author_role: data.authorRole || 'STUDENT',
          author_avatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          summary: data.summary || '',
          content: data.content || '',
          tags: safeTags,
          resources: safeResources,
          status: 'APPROVED',
        };

        const { data: inserted, error } = await supabase.from('knowledge_entries').insert([payload]).select().single();
        if (!error && inserted) {
          console.log('[Supabase] Successfully saved entry to PostgreSQL:', inserted.id);
          finalItem = {
            id: inserted.id,
            title: inserted.title,
            category: inserted.category || inserted.knowledge_type,
            knowledgeType: inserted.knowledge_type || inserted.category,
            department: inserted.department,
            yearOfStudy: inserted.year_of_study || 'All Levels',
            rating: 5.0,
            author: inserted.author_name,
            authorRole: inserted.author_role,
            authorAvatar: inserted.author_avatar || data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            createdAt: inserted.created_at || new Date().toISOString(),
            views: 1,
            upvotes: 0,
            isTrending: false,
            isVerified: true,
            tags: ensureArrayTags(inserted.tags),
            summary: inserted.summary || '',
            content: inserted.content || '',
            resources: parseResources(inserted.resources),
            comments: [],
          };
        }
      } catch (err) {
        console.warn('[knowledgeService] Supabase create fallback:', err.message);
      }
    }

    if (!finalItem) {
      try {
        const response = await api.post('/knowledge', data);
        finalItem = response.data;
      } catch {
        finalItem = {
          id: `kb_${Date.now()}`,
          ...data,
          category: data.category || data.knowledgeType || 'Project Experience',
          knowledgeType: data.knowledgeType || data.category || 'Project Experience',
          yearOfStudy: data.yearOfStudy || 'All Levels',
          authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          createdAt: new Date().toISOString(),
          views: 1,
          upvotes: 0,
          rating: 5.0,
          isTrending: false,
          isVerified: true,
          status: 'APPROVED',
          tags: safeTags,
          resources: safeResources,
          comments: []
        };
        SAMPLE_KNOWLEDGE_ITEMS.unshift(finalItem);
      }
    }

    // Always persist to local cache so user immediately sees it upon redirect or refresh
    if (finalItem) {
      saveLocalCustomEntry(finalItem);
    }

    // 🧠 Instant AI Vector Learning: Dynamically embed document in KnowBot AI engine
    try {
      await api.post('/knowledge/embed', {
        id: finalItem.id,
        title: finalItem.title,
        category: finalItem.category || finalItem.knowledgeType,
        department: finalItem.department,
        author: finalItem.author,
        authorRole: finalItem.authorRole,
        tags: finalItem.tags,
        summary: finalItem.summary,
        content: finalItem.content,
      });
      console.log('🧠 [KnowBot RAG AI] Dynamically ingested and vectorized document:', finalItem.title);
    } catch (embedErr) {
      console.warn('[KnowBot Embed Warning]', embedErr.message);
    }

    return finalItem;
  },

  upvote: async (id, currentUpvotes = 0) => {
    const newUpvotes = currentUpvotes + 1;
    saveLocalUpvote(id, newUpvotes);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('knowledge_entries')
          .update({ upvotes: newUpvotes })
          .eq('id', id);
        console.log(`[Supabase] Upvote persisted for entry ${id}: ${newUpvotes}`);
      } catch (err) {
        console.warn('[knowledgeService] Supabase upvote fallback:', err.message);
      }
    }
    return newUpvotes;
  },

  getComments: (entryId) => commentService.get(entryId),
  addComment: (entryId, data) => commentService.add(entryId, data),
  editComment: (entryId, commentId, text) => commentService.edit(entryId, commentId, text),
  deleteComment: (entryId, commentId) => commentService.remove(entryId, commentId),

  update: async (id, updateData) => {
    // 1. Update in-memory SAMPLE_KNOWLEDGE_ITEMS
    const idx = SAMPLE_KNOWLEDGE_ITEMS.findIndex((item) => item.id === id);
    if (idx !== -1) {
      SAMPLE_KNOWLEDGE_ITEMS[idx] = {
        ...SAMPLE_KNOWLEDGE_ITEMS[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
    }

    // 2. Persist update in Supabase PostgreSQL if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {};
        if (updateData.title !== undefined) payload.title = updateData.title;
        if (updateData.summary !== undefined) payload.summary = updateData.summary;
        if (updateData.content !== undefined) payload.content = updateData.content;
        if (updateData.category !== undefined) payload.category = updateData.category;
        if (updateData.department !== undefined) payload.department = updateData.department;
        if (updateData.tags !== undefined) payload.tags = updateData.tags;

        await supabase
          .from('knowledge_entries')
          .update(payload)
          .eq('id', id);
        console.log('[Supabase] Updated knowledge entry in PostgreSQL:', id);
      } catch (err) {
        console.warn('[knowledgeService] Supabase update error:', err.message);
      }
    }

    // 3. Fallback to API if available
    try {
      await api.put(`/knowledge/${id}`, updateData);
    } catch {
      // ignore
    }

    return true;
  },

  delete: async (id) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('knowledge_entries').delete().eq('id', id);
        console.log('[Supabase] Deleted knowledge entry from PostgreSQL:', id);
      } catch (err) {
        console.warn('[knowledgeService] Supabase delete error:', err.message);
      }
    }

    try {
      await api.delete(`/knowledge/${id}`);
    } catch {
      // ignore
    }
    return true;
  },
};
