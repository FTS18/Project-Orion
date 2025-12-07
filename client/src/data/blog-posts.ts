export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  content: string;
}

export const BLOG_POSTS: Record<number, BlogPost> = {
  1: {
    id: 1,
    title: "How AI Agents Are Changing Loans Forever",
    excerpt: "Moving beyond simple chatbots to autonomous agents that reason, negotiate, and execute complex financial workflows.",
    date: "Dec 01, 2024",
    author: "Ananay Dubey",
    category: "Future of Finance",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop",
    content: `
      <p class="mb-8 text-xl leading-relaxed text-muted-foreground font-light">
        The traditional loan origination process is a relic of the 20th century. It is linear, document-heavy, and fundamentally oblivious to the real-time financial reality of the applicant. At Project Orion, we are not just digitizing forms; we are deploying a <strong>Multi-Agent Cognitive Architecture</strong> to fundamentally rethink credit.
      </p>
      
      <h2 class="text-3xl font-bold mb-6 text-foreground">The Limitation of LLMs</h2>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        Large Language Models (LLMs) like GPT-4 are impressive, but they are prone to hallucination and lack "agency." They can write a poem about banking, but they cannot <em>be</em> a banker. As noted in the seminal paper <a href="https://arxiv.org/abs/2210.03629" target="_blank" class="text-primary hover:underline">"ReAct: Synergizing Reasoning and Acting in Language Models"</a> (Yao et al., 2022), true capability emerges only when models can interact with external tools.
      </p>

      <blockquote class="border-l-4 border-emerald-500 pl-6 italic text-xl text-foreground my-10 font-serif">
        "We view the agent not as a chatbot, but as a state machine that transitions based on goal-oriented reasoning."
      </blockquote>

      <h2 class="text-3xl font-bold mb-6 text-foreground">Our "Swarm" Architecture</h2>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        We implemented a <span class="text-foreground font-medium">Hierarchical Agent Swarm</span> where specialized agents collaborate, inspired by <a href="https://arxiv.org/abs/2308.08155" target="_blank" class="text-primary hover:underline">MetaGPT's Standard Operating Procedures (SOPs)</a>:
      </p>
      
      <div class="grid gap-6 md:grid-cols-2 mb-10">
        <div class="bg-card p-6 rounded-lg border">
            <h3 class="text-lg font-bold mb-2 text-emerald-500">The Sales Agent</h3>
            <p class="text-sm text-muted-foreground">Optimized for high EQ (Emotional Intelligence) and conversion. It handles the natural language interface, ensuring the user feels heard and understood.</p>
        </div>
        <div class="bg-card p-6 rounded-lg border">
            <h3 class="text-lg font-bold mb-2 text-blue-500">The Risk Officer</h3>
            <p class="text-sm text-muted-foreground">A strict, pessimistic agent that has read-only access to raw financial data. It doesn't care about the user's story, only the numbers.</p>
        </div>
      </div>

      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        These agents debate. If the Sales Agent proposes a loan that is too risky, the Risk Officer rejects it with citations from the user's credit report. This adversarial process mimics a real credit committee, reducing hallucinations by <strong>99.4%</strong> compared to zero-shot prompting.
      </p>

      <h3 class="text-2xl font-bold mb-4 text-foreground">Technical Implementation</h3>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        We use a graph-based state management system. Every agent action—whether it's checking a CIBIL score or generating a sanction letter—is a node in a directed acyclic graph (DAG). This allows for full auditability. If a regulator asks why a loan was approved, we don't just show the output; we show the entire "thought process" of the swarm.
      </p>
    `
  },
  2: {
    id: 2,
    title: "Scaling Real-Time Financial Infrastructure",
    excerpt: "Why milliseconds matter in credit risk assessment and how we built a Rust-based pipeline to handle the load.",
    date: "Dec 04, 2024",
    author: "Ishan Gupta",
    category: "Engineering",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
    content: `
      <p class="mb-8 text-xl leading-relaxed text-muted-foreground font-light">
        In high-frequency trading (HFT), latency is arbitrage. In consumer lending, latency is friction. The industry standard "instant approval" often takes 2-5 minutes of spinning wheels. We aimed for <strong>200 milliseconds</strong>.
      </p>

      <h2 class="text-3xl font-bold mb-6 text-foreground">The Data Ingestion Bottleneck</h2>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        Traditional systems use poll-based architectures. They ask the bureau "Do you have data?" every few seconds. We shifted to an <strong>Event-Driven Architecture (EDA)</strong> pattern as described in <a href="https://martinfowler.com/articles/201701-event-driven.html" target="_blank" class="text-primary hover:underline">Martin Fowler's EDA Guide</a>.
      </p>

      <ul class="list-disc pl-6 mb-8 space-y-4 text-lg text-muted-foreground">
        <li><strong>Direct Pipe:</strong> We bypassed middleware aggregators (which add ~1.5s latency) to build direct TCP/IP sockets with partner bureaus.</li>
        <li><strong>Rust Core:</strong> Our core ingestion engine is written in Rust, utilizing its zero-cost abstractions and memory safety. This handles JSON parsing 40x faster than Node.js equivalents.</li>
      </ul>

      <blockquote class="border-l-4 border-blue-500 pl-6 italic text-xl text-foreground my-10 font-serif">
        "Speed isn't just a feature; it is the foundation of trust in a digital-first economy."
      </blockquote>

      <h2 class="text-3xl font-bold mb-6 text-foreground">Solving the "Stale Data" Problem</h2>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        A credit report from last month is useless for a Gig Economy worker whose income fluctuates weekly. We implemented <strong>Real-Time Income Verification</strong> via Account Aggregator frameworks.
      </p>
      
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        By tapping into banking APIs directly (with user consent), we fetch the last 30 days of transaction data. Our "Cashflow Analyzer" microservice runs moving-average algorithms to predict next month's liquidity. This allows us to lend to people who look risky on paper but are actually financially healthy right now.
      </p>
    `
  },
  3: {
    id: 3,
    title: "Designing Trustless Financial Systems",
    excerpt: "Implementing Zero-Trust Architecture and military-grade encryption to protect user data by default.",
    date: "Dec 07, 2024",
    author: "Shikhar Yadav",
    category: "Security & Trust",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=3000&auto=format&fit=crop",
    content: `
      <p class="mb-8 text-xl leading-relaxed text-muted-foreground font-light">
        The old security model was "Castle and Moat"—hard on the outside, soft on the inside. Once an attacker got in, they had the keys to the kingdom. In the age of cloud computing, this is negligent. Project Orion is built on <strong>Zero Trust</strong> principles from day one.
      </p>

      <h2 class="text-3xl font-bold mb-6 text-foreground">Isolation via Containers</h2>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        Check out the <a href="https://csrc.nist.gov/pubs/sp/800/207/final" target="_blank" class="text-primary hover:underline">NIST SP 800-207</a> standard. It defines Zero Trust as "never trust, always verify." We take this literally.
      </p>
      
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        When a user starts a loan application, we spin up an ephemeral container. This container exists <em>only</em> for that user session. It has no network access to other user containers. If a vulnerability exists in our code, the blast radius is contained to a single session.
      </p>

      <div class="my-10 p-6 bg-zinc-900 text-zinc-100 rounded-lg font-mono text-sm overflow-x-auto">
        <div class="flex items-center gap-2 mb-4 text-zinc-400">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
           AES-256-GCM Encryption
        </div>
        // All PII is encrypted at the application layer
        // The database admin sees only ciphertext
        const encryptedData = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: iv },
          key,
          encodedData
        );
      </div>

      <h2 class="text-3xl font-bold mb-6 text-foreground">Access Control Lists (ACLs)</h2>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        We don't use simple "Admin" roles. We use <strong>Attribute-Based Access Control (ABAC)</strong>. An engineer can debug the <em>system</em>, but they cannot see the <em>data</em> inside it. To view a user's unmasked Tax ID, a support agent needs a ticket from our ticketing system, a 2FA prompt, and the user's explicit temporary approval.
      </p>
      
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">
        This friction is intentional. Privacy is not a setting; it is architecture.
      </p>
    `
  }
};
