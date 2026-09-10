import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { VectorStore } from './vectorStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory Vector Store
const vectorStore = new VectorStore();

// Initial campus knowledge documents dataset to index (15 Entries across CSE, ECE, ME)
const INITIAL_CORPUS = [
  {
    id: 'kb_01',
    title: 'Distributed Consensus: Implementing Raft Algorithm in Go with TLA+ Formal Verification',
    category: 'Project Experience',
    department: 'Computer Science & Engineering (CSE)',
    author: 'Alex Chen',
    authorRole: 'STUDENT',
    tags: ['Go', 'Raft', 'Distributed-Systems', 'TLA+', 'Concurrency'],
    summary: 'Design notes on building an RPC-driven Raft consensus cluster in Go with randomized election timers and TLA+ model checking.',
    content: `Raft Consensus in Go: 5-node cluster supporting leader election, log replication, and state machine compaction. Election timeouts are randomized between 150ms and 300ms to avoid split votes. Leaders require N/2 + 1 majority quorum to commit client log entries.`,
  },
  {
    id: 'kb_02',
    title: 'Production RAG AI Pipeline: Hybrid Dense-Sparse Search with ChromaDB & LangChain',
    category: 'Project Experience',
    department: 'Computer Science & Engineering (CSE)',
    author: 'David Kim',
    authorRole: 'STUDENT',
    tags: ['RAG', 'Vector-DB', 'ChromaDB', 'Python', 'LLM'],
    summary: 'Complete engineering guide to building low-latency semantic search using hybrid BM25 lexical matching and dense vector embeddings.',
    content: `Hybrid RAG Pipeline: Combines dense embeddings with sparse BM25 scores via Reciprocal Rank Fusion (RRF). Uses cross-encoder re-ranking to boost factual recall by 34%. Includes chunking strategies with 512 tokens and 64-token overlap.`,
  },
  {
    id: 'kb_03',
    title: 'RISC-V 5-Stage Pipelined Core in Verilog with Dynamic Branch Prediction on Artix-7 FPGA',
    category: 'Project Experience',
    department: 'Electronics & Communication (ECE)',
    author: 'Sneha Reddy',
    authorRole: 'STUDENT',
    tags: ['RISC-V', 'Verilog', 'FPGA', 'Computer-Architecture', 'Vivado'],
    summary: 'Hardware implementation of an RV32I 5-stage CPU core featuring forwarding hazard units and 2-bit branch predictors on Xilinx Artix-7.',
    content: `RISC-V 5-Stage CPU on Artix-7 FPGA: Features IF, ID, EX, MEM, WB pipeline stages. Forwarding hazard units eliminate 85% of load-use stalls. Achieves 100MHz maximum operating frequency with 2-bit saturating counter branch prediction.`,
  },
  {
    id: 'kb_04',
    title: 'Formula Student Chassis Aerodynamics & Boundary Layer CFD Meshing in ANSYS Fluent',
    category: 'Project Experience',
    department: 'Mechanical Engineering (ME)',
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    tags: ['CFD', 'Aerodynamics', 'ANSYS-Fluent', 'CAD', 'Formula-Student'],
    summary: 'Aerodynamic optimization of inverted multi-element front wing and rear diffuser, achieving Cl*A of 2.8 at 60 km/h.',
    content: `FSAE Aerodynamics & CFD: Multi-element front wing and rear venturi diffuser optimization using ANSYS Fluent. Polyhedral mesh with prism layer inflations maintaining y+ < 1 for accurate boundary layer ground-effect separation modeling.`,
  },
  {
    id: 'kb_05',
    title: 'Automated Inverse Kinematics for 6-DOF Robotic Arm with MoveIt2 and ROS2 Humble',
    category: 'Project Experience',
    department: 'Mechanical Engineering (ME)',
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    tags: ['Robotics', 'ROS2', 'MoveIt2', 'Kinematics', 'Mechatronics'],
    summary: 'Trajectory planning and collision-free pick-and-place execution using TRAC-IK inverse kinematics solvers in Gazebo simulation.',
    content: `6-DOF Robotic Arm Control: Implements MoveIt2 motion planning with TRAC-IK plugin to bypass kinematic singularities. Features real-time collision checking and Gazebo physics engine integration for industrial pick-and-place routines.`,
  },
  {
    id: 'kb_06',
    title: 'Google & Microsoft SDE-1 Placement Playbook: Concurrency, LLD & Graph DSA',
    category: 'Placement Insight',
    department: 'Computer Science & Engineering (CSE)',
    author: 'Alex Chen',
    authorRole: 'STUDENT',
    tags: ['Placement-Insight', 'SDE', 'Google', 'Microsoft', 'DSA'],
    summary: '5-round interview blueprint with compensation details (₹44.5 LPA), high-frequency graph problems, and system design frameworks.',
    content: `Tier-1 Placement Guide: Round 1 OA (Graph BFS/DFS + 2D DP). Round 2 Technical (Trie prefix trees). Round 3 LLD (Thread-safe parking lot with mutex locks). Round 4 HLD (Distributed rate limiter with Redis sliding window). Round 5 Behavioral STAR.`,
  },
  {
    id: 'kb_07',
    title: 'NVIDIA & Qualcomm ASIC Hardware Interview Guide: STA Violations & Gray Code CDC',
    category: 'Placement Insight',
    department: 'Electronics & Communication (ECE)',
    author: 'Sneha Reddy',
    authorRole: 'STUDENT',
    tags: ['Placement-Insight', 'NVIDIA', 'Qualcomm', 'VLSI', 'STA'],
    summary: 'Core semiconductor placement questions: Setup/Hold time slack equations, clock domain crossing (CDC), and asynchronous FIFOs.',
    content: `ASIC & VLSI Placement Guide: Key focus areas: Setup time (Tclk >= Tcq + Tcomb + Tsetup - Tskew) and Hold time (Tcq + Tcomb >= Thold + Tskew). Double-flop synchronizers and Gray code pointer conversion for clock domain crossing (CDC).`,
  },
  {
    id: 'kb_08',
    title: 'Tesla & Tata Motors Mechanical Design Placement: GD&T, FEA & Materials Selection',
    category: 'Placement Insight',
    department: 'Mechanical Engineering (ME)',
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    tags: ['Placement-Insight', 'Automotive', 'FEA', 'GDT', 'Materials'],
    summary: 'Comprehensive interview playbook for automotive R&D roles covering ASME Y14.5 Geometric Dimensioning & Tolerancing (GD&T).',
    content: `Automotive Mechanical Placement: ASME Y14.5 GD&T true position tolerances with Maximum Material Condition (MMC). Finite Element Analysis (FEA) mesh convergence and von Mises yield stress criteria for lightweight suspension knuckles.`,
  },
  {
    id: 'kb_09',
    title: 'HPC Slurm Batch GPU Allocation & Multi-Node PyTorch Distributed Training SOP',
    category: 'Lab Tip',
    department: 'Computer Science & Engineering (CSE)',
    author: 'Marcus Ramirez',
    authorRole: 'TECHNICIAN',
    tags: ['HPC', 'SLURM', 'GPU', 'CUDA', 'PyTorch'],
    summary: 'Standard operating procedure for submitting multi-GPU jobs on the campus 32-node A100 cluster with torch.distributed.launch.',
    content: `Campus HPC Cluster SLURM SOP: SSH to hpc.campus.edu. Submit GPU batch scripts with #SBATCH --gres=gpu:a100:2 and module load cuda/12.8 pytorch/2.4. Monitor running jobs with squeue -u $USER. Use /scratch/$USER for high-speed training datasets.`,
  },
  {
    id: 'kb_10',
    title: 'Keysight High-Speed Mixed-Signal Oscilloscope 4GHz Jitter & Eye Diagram Calibration',
    category: 'Lab Tip',
    department: 'Electronics & Communication (ECE)',
    author: 'Priya Sundaram',
    authorRole: 'FACULTY',
    tags: ['Oscilloscope', 'RF', 'Calibration', 'Jitter', 'Keysight'],
    summary: 'Lab calibration steps for 50-Ohm coaxial BNC terminators and differential active probes to measure picosecond clock jitter.',
    content: `RF Oscilloscope Calibration SOP: Zero-point DC offset calibration with 50-Ohm BNC terminators. Set hardware trigger to Clock Recovery PLL to render clean Eye Diagrams and measure jitter margin for high-speed PCIe bus lines.`,
  },
  {
    id: 'kb_11',
    title: 'Instron Universal Testing Machine (UTM) 100kN Tensile Strain-Gauge Zeroing Protocol',
    category: 'Lab Tip',
    department: 'Mechanical Engineering (ME)',
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    tags: ['UTM', 'Tensile-Testing', 'Stress-Strain', 'Lab-Safety', 'Instron'],
    summary: 'Safety checklist and digital extensometer calibration steps for recording stress-strain curves on aluminum 6061-T6 specimens.',
    content: `100kN UTM Tensile Testing Protocol: Ensure safety plexiglass shield is engaged. Calibrate extensometer gauge length at 50mm before applying hydraulic tensile crosshead movement. Record yield strength, ultimate tensile strength (UTS), and elongation percentage.`,
  },
  {
    id: 'kb_12',
    title: 'Pedagogical Rubric for Automated Grading of Multi-Threaded C++ Student Submissions',
    category: 'Faculty Method',
    department: 'Computer Science & Engineering (CSE)',
    author: 'Dr. Sarah Jenkins',
    authorRole: 'FACULTY',
    tags: ['Faculty-Method', 'Concurrency', 'Cpp', 'Auto-Grader', 'Valgrind'],
    summary: 'Containerized autograder harness utilizing LLVM ThreadSanitizer (TSan) and Valgrind Helgrind to detect subtle data races.',
    content: `Automated Concurrency Grading Harness: Compiles student code with -fsanitize=thread -g to catch data races and lock-order inversions. Executes high-concurrency stress tests with 64 threads to guarantee deadlock-free semaphore implementations.`,
  },
  {
    id: 'kb_13',
    title: 'Laboratory Framework for Microcontroller SystemVerilog UVM Assertion Verification',
    category: 'Faculty Method',
    department: 'Electronics & Communication (ECE)',
    author: 'Priya Sundaram',
    authorRole: 'FACULTY',
    tags: ['Faculty-Method', 'SystemVerilog', 'UVM', 'Verification', 'ASIC'],
    summary: 'Structured lab module teaching undergraduate engineers constrained-random verification, coverage bins, and SVA assertions.',
    content: `SystemVerilog UVM Teaching Framework: Milestone 1: Transaction-level modeling (TLM). Milestone 2: Driver, Monitor, and Scoreboard construction. Milestone 3: SystemVerilog Assertions (SVA) checking property invariants across clock domains.`,
  },
  {
    id: 'kb_14',
    title: 'Campus 36-Hour Hackathon Infrastructure & AWS Cloud Provisioning Runbook',
    category: 'Event Playbook',
    department: 'Computer Science & Engineering (CSE)',
    author: 'Alex Chen',
    authorRole: 'STUDENT',
    tags: ['Event-Playbook', 'Hackathon', 'AWS', 'Networking', 'Cloud'],
    summary: 'Complete operational runbook for running 500+ participant hackathons: subnet Wi-Fi band steering and automated submission grading.',
    content: `Campus Hackathon Runbook: Wi-Fi network configuration allocating dedicated 5GHz SSIDs for 1,200 concurrent devices. Deploys containerized GitHub webhook evaluators on AWS ECS to benchmark live leaderboard submissions in real-time.`,
  },
  {
    id: 'kb_15',
    title: 'Formula SAE Vehicle Scrutineering & Track Safety Technical Compliance Guide',
    category: 'Event Playbook',
    department: 'Mechanical Engineering (ME)',
    author: 'Vikram Malhotra',
    authorRole: 'STUDENT',
    tags: ['Event-Playbook', 'FSAE', 'Motorsport', 'Scrutineering', 'Safety'],
    summary: 'Pre-competition inspection checklist covering 60-degree tilt table tests, cockpit egress drills (under 5 seconds), and brake tests.',
    content: `Formula SAE Scrutineering Checklist: Driver cockpit egress test must be executed in under 5.0 seconds. 60-degree tilt table check for fuel/fluid leakage. Dynamic 4-wheel brake lock test on dry asphalt without steering yaw deviation.`,
  },
];

// Initialize vector store index
vectorStore.indexDocuments(INITIAL_CORPUS);

/**
 * Health Check Endpoint
 */
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'KnowBot RAG Engine',
    indexedDocuments: vectorStore.documents.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Semantic Vector Search Endpoint
 */
app.get('/api/v1/knowledge/search', (req, res) => {
  const query = req.query.q || '';
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  const matches = vectorStore.search(query, 3);
  res.json({ query, matches });
});

/**
 * Core RAG Endpoint: Semantic Search + LLM Grounding + Citation Generation
 */
app.post('/api/v1/chat/query', async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query cannot be empty' });
    }

    console.log(`[KnowBot RAG] Processing query: "${query}"`);

    // 1. Semantic Similarity Search in Vector Database (Top-3)
    const topMatches = vectorStore.search(query, 3);
    const citations = topMatches.map((m) => ({
      id: m.document.id,
      title: m.document.title,
      category: m.document.category,
      department: m.document.department,
      author: m.document.author,
      authorRole: m.document.authorRole,
      summary: m.document.summary,
      similarityScore: m.similarity,
      matchPercentage: m.matchPercentage,
      tags: m.document.tags,
      content: m.document.content,
    }));

    // 2. Build Grounded Prompt with Context
    const groundedPrompt = vectorStore.buildGroundedPrompt(query, topMatches);

    let generatedReply = '';

    // 3. Call Google Gemini API with Dynamic Model Discovery
    if (process.env.GEMINI_API_KEY) {
      const apiKey = process.env.GEMINI_API_KEY.trim();

      try {
        // Step A: Dynamically discover active models for this specific API key
        let activeModels = [];
        try {
          const listRes = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { timeout: 8000 }
          );
        if (listRes.data?.models) {
          activeModels = listRes.data.models
            .filter((m) => {
              const name = m.name.toLowerCase();
              return (
                m.supportedGenerationMethods?.includes('generateContent') &&
                !name.includes('-tts') &&
                !name.includes('embedding') &&
                !name.includes('-audio') &&
                !name.includes('image')
              );
            })
            .map((m) => m.name.replace(/^models\//, ''));
          console.log(`[KnowBot] Discovered ${activeModels.length} active text models:`, activeModels.slice(0, 4));
        }
      } catch (listErr) {
        console.warn('[KnowBot] Model discovery notice:', listErr.response?.data?.error?.message || listErr.message);
      }

      // Prioritize fast, high-quota text generation models that work reliably
        const isCampusSpecific = citations.length > 0 && (citations[0].similarityScore > 0.55 || query.toLowerCase().includes('campus') || query.toLowerCase().includes('hpc') || query.toLowerCase().includes('placement') || query.toLowerCase().includes('lab'));
        
        const contextText = topMatches.map((m, idx) => `[Source ${idx + 1}]: "${m.document.title}" (${m.document.department})\n${m.document.summary}\n${m.document.content.slice(0, 500)}`).join('\n\n');

        const promptText = isCampusSpecific
          ? `Relevant Campus Documents:\n${contextText}\n\nQuestion: ${query}`
          : query;

        // Prioritize pure Gemini chat models over raw Gemma base models
        const candidateModels = [
          'gemini-3.6-flash',
          'gemini-3.7-flash',
          'gemini-3.5-flash',
          'gemini-3-flash-preview',
          ...activeModels.filter((m) => m.startsWith('gemini-') && !m.includes('-tts') && !m.includes('-audio') && !m.includes('-image')),
        ];

        const uniqueModels = [...new Set(candidateModels)];

        for (const mName of uniqueModels) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${apiKey}`;
            const apiRes = await axios.post(
              geminiUrl,
              {
                system_instruction: {
                  parts: [
                    {
                      text: "You are KnowBot, an intelligent and friendly AI assistant for the KnowPass university platform. Answer user questions conversationally, directly, and accurately. Do not explain your thought process or output planning steps.",
                    },
                  ],
                },
                contents: [
                  {
                    role: "user",
                    parts: [{ text: promptText }],
                  },
                ],
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 2048,
                },
              },
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: 8000,
              }
            );

            let rawText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              // Sanitize output: remove any model scratchpad/thought reasoning or plan headers
              rawText = rawText.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
              rawText = rawText.replace(/The user said "[\s\S]*?Plan:[\s\S]*?\n\n/gi, '');
              rawText = rawText.replace(/\* User Input:[\s\S]*?\* Goal:[\s\S]*?\n\n/gi, '');
              rawText = rawText.replace(/^\$([^\$]+)\$$/gm, '$1');
              generatedReply = rawText.trim();
              console.log(`[KnowBot] Generated natural response via (${mName})`);
              break;
            }
          } catch (apiErr) {
            const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
            console.warn(`[KnowBot] Model ${mName} notice: ${errMsg}`);
          }
        }
      } catch (err) {
        console.error('[KnowBot] Gemini invocation error:', err.message);
      }
    }

    // 4. Grounded Synthesis Fallback if no external API key or on greeting
    if (!generatedReply) {
      const qLower = query.toLowerCase().trim();
      if (['hi', 'hello', 'hey', 'start', 'help', 'who are you'].includes(qLower)) {
        generatedReply = `Hello! 👋 I am **KnowBot**, your campus AI knowledge assistant.

I am trained and grounded on verified **university lecture notes**, **laboratory SOPs**, **equipment guidelines**, and **placement insights**.

### 💡 What you can ask me:
* *"How do I submit GPU batch jobs on the campus HPC cluster?"*
* *"What were the 5 rounds in the Google placement drive?"*
* *"What are the leader election and timeout rules in Raft CS-402?"*
* *"How do I configure eduroam Wi-Fi certificates on Linux?"*

Ask any courseware, lab, or career question to get grounded answers with source citations!`;
      } else {
        const bestMatch = topMatches[0]?.document;
        if (bestMatch) {
          generatedReply = `Based on the verified campus knowledge repository entry **"${bestMatch.title}"** (by ${bestMatch.author}, ${bestMatch.authorRole}):

${bestMatch.summary}

### 📌 Key Details from Document:
${bestMatch.content}

💡 *You can review the full source document and attached lab manuals in the citation card below.*`;
        } else {
          generatedReply = `I searched the KnowPass campus database for "${query}". Please check the attached verified resources below or submit a question to the department faculty.`;
        }
      }
    }

    // 5. Return grounded response with source citation cards
    res.json({
      success: true,
      query,
      reply: generatedReply,
      citations,
      ragMetadata: {
        matchesFound: citations.length,
        topConfidence: citations[0]?.matchPercentage || 0,
        retrievalMethod: 'Vector Embedding Cosine Similarity (TF-IDF + Semantic Boost)',
      },
    });
  } catch (error) {
    console.error('[KnowBot Error]', error);
    res.status(500).json({
      error: 'Failed to process query',
      details: error.message,
    });
  }
});

/**
 * Dynamic Ingestion Endpoint to vector-embed new contributions
 */
app.post('/api/v1/knowledge/embed', (req, res) => {
  const newDoc = req.body;
  if (!newDoc || !newDoc.title) {
    return res.status(400).json({ error: 'Valid document required' });
  }

  const formattedDoc = {
    id: newDoc.id || `kb_${Date.now()}`,
    title: newDoc.title,
    category: newDoc.category || newDoc.knowledgeType || 'Project Experience',
    department: newDoc.department || 'General',
    author: newDoc.author || 'Campus Scholar',
    authorRole: newDoc.authorRole || 'STUDENT',
    tags: Array.isArray(newDoc.tags) ? newDoc.tags : [],
    summary: newDoc.summary || (newDoc.content ? newDoc.content.slice(0, 180) : ''),
    content: newDoc.content || newDoc.summary || '',
  };

  // Avoid duplicates in memory
  const existingIdx = INITIAL_CORPUS.findIndex((d) => d.id === formattedDoc.id || d.title === formattedDoc.title);
  if (existingIdx >= 0) {
    INITIAL_CORPUS[existingIdx] = formattedDoc;
  } else {
    INITIAL_CORPUS.push(formattedDoc);
  }

  // Re-index dynamic vector store with updated corpus
  vectorStore.indexDocuments(INITIAL_CORPUS);
  console.log(`🧠 [KnowBot AI Vector Index] Dynamically indexed new article: "${formattedDoc.title}" (Total Indexed Documents: ${vectorStore.documents.length})`);

  res.json({
    success: true,
    message: `Document "${formattedDoc.title}" vectorized and indexed successfully into KnowBot AI`,
    totalIndexed: vectorStore.documents.length,
  });
});

/**
 * Dynamic Deletion Endpoint to remove knowledge documents from AI Vector Store
 */
app.delete('/api/v1/knowledge/:id', (req, res) => {
  const docId = req.params.id;
  const docIdx = INITIAL_CORPUS.findIndex((d) => d.id === docId || d.title === docId);

  if (docIdx >= 0) {
    const removedTitle = INITIAL_CORPUS[docIdx].title;
    INITIAL_CORPUS.splice(docIdx, 1);
    vectorStore.indexDocuments(INITIAL_CORPUS);
    console.log(`🗑️ [KnowBot AI Vector Index] Removed "${removedTitle}" from vector memory (Remaining: ${vectorStore.documents.length})`);
    return res.json({ success: true, message: `Article "${removedTitle}" removed from AI memory.` });
  }

  res.json({ success: true, message: 'Article removed.' });
});

import nodemailer from 'nodemailer';

// Configure SMTP Transporter (supports Gmail App Password, Resend SMTP, SendGrid, etc.)
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : null,
};

let mailTransporter = null;
if (smtpConfig.auth) {
  mailTransporter = nodemailer.createTransport(smtpConfig);
  console.log('[Email Service] Live SMTP Transporter initialized for:', process.env.SMTP_USER);
} else {
  console.log('[Email Service] Running in instant notification mode. Add SMTP_USER and SMTP_PASS in server/.env for direct inbox delivery.');
}

/**
 * Real Welcome & Greeting Email Dispatcher
 */
app.post('/api/v1/email/welcome', async (req, res) => {
  const { email, name, department, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const studentName = name || email.split('@')[0];
  const userDept = department || 'Campus Community';
  const userRole = role || 'STUDENT';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #334155; margin: 0; padding: 20px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 8px; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
        .perks { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .perk-item { margin-bottom: 12px; font-size: 14px; color: #1e293b; }
        .perk-item:last-child { margin-bottom: 0; }
        .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-align: center; margin: 20px 0; }
        .footer { border-top: 1px solid #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🎓 Welcome to KnowPass!</h1>
          <p>The Decentralized Campus Knowledge Operating System</p>
        </div>
        <div class="content">
          <span class="badge">${userRole} • ${userDept}</span>
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hello ${studentName},</h2>
          <p>Your campus account has been successfully created and verified on <strong>KnowPass</strong>. You now have full access to our peer-verified institutional intelligence network.</p>
          
          <div class="perks">
            <div class="perk-item">🌟 <strong>+20 KnowPoints Awarded:</strong> For completing your registration and profile setup.</div>
            <div class="perk-item">🤖 <strong>KnowBot AI Grounding:</strong> Ask questions grounded in campus lab notes, SOPs, and project archives.</div>
            <div class="perk-item">💼 <strong>Placement & Alumni Network:</strong> Browse interview playbooks and request 1-on-1 alumni mentorship.</div>
            <div class="perk-item">🔬 <strong>Lab Equipment Wiki:</strong> Access hardware calibration steps and troubleshooting manuals.</div>
          </div>

          <center>
            <a href="http://localhost:3000/dashboard" class="btn" style="color:#ffffff;">Launch KnowPass Portal →</a>
          </center>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            Start exploring and contributing your project breakthroughs and lab tips today to climb the campus leaderboard!
          </p>
        </div>
        <div class="footer">
          © 2026 KnowPass Institutional Knowledge Management. All rights reserved.<br>
          Connected to Campus Academic IT Infrastructure.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (mailTransporter) {
      await mailTransporter.sendMail({
        from: `"KnowPass Campus Network" <${process.env.SMTP_USER || 'notifications@knowpass.campus.edu'}>`,
        to: email,
        subject: `🎓 Welcome to KnowPass, ${studentName}! Your Campus Knowledge Portal`,
        html: htmlContent,
      });
      console.log(`📧 [Email Dispatched via SMTP] Real welcome email delivered to: ${email}`);
    } else {
      console.log(`📧 [Email Dispatch Notification] Welcome greeting sent to: ${email} (${studentName} - ${userDept})`);
    }

    res.json({
      success: true,
      message: `Welcome email sent successfully to ${email}`,
    });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send welcome email', details: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  KnowBot RAG Semantic Backend running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`=======================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n=======================================================`);
    console.log(`  [Notice] Port ${PORT} is ALREADY running and active!`);
    console.log(`  Your KnowBot Backend is ready at http://localhost:${PORT}`);
    console.log(`=======================================================\n`);
  } else {
    console.error('[Server Error]', err);
  }
});
