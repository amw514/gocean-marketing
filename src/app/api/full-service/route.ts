import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the step prompts structure
const STEP_PROMPTS = {
  1: {
    title: "Market Research",
    prompts: [
      {
        id: 1,
        title: "Comprehensive Market Analysis",
        prompt: `Conduct a comprehensive market analysis for [niche] covering the following areas:

1. Current Trends Analysis
- Identify and analyze current high-interest trends in the market
- Evaluate which trends can be addressed through courses/services
- Provide trend lifecycle analysis

2. Market Opportunities
- Map out key opportunities based on identified trends
- Create popularity and growth rate charts for each opportunity
- Assess monetization potential for each opportunity

3. Total Addressable Market (TAM)
- Global market size with segmentation breakdown
- US market size per segment
- Growth projections for each segment
- Include data sources and methodology

4. Customer Pain Points
- Identify major pain points in the market
- Rank pain points by urgency and impact
- Map pain points to customer segments

5. Customer Spending Analysis
- Analyze disposable income by segment
- Map spending patterns to pain points
- Identify price sensitivity factors

6. Market Reach Strategy
- Top 3 channels for reaching each segment
- Detailed strategy for each channel
- Include reach metrics and costs

7. Competitive Landscape
- Analysis of top 3 competitors
- Detailed pros and cons
- Market share and positioning

8. SWOT Analysis
- Complete SWOT analysis of the market
- Strategic positioning recommendations
- Competitive advantage opportunities

9. Differentiation Strategy
- Key differentiating factors
- Unique value proposition
- Market positioning strategy

Please provide detailed data, charts, and sources for all analyses. Format the response with clear sections, subsections, and visual elements where appropriate.`,
      },
    ],
  },
  2: {
    title: "Niche Development",
    prompts: [
      {
        id: 1,
        title: "Strategic Niche Analysis",
        prompt: `Building on our market research findings, conduct a comprehensive niche development analysis covering:

1. Core Niche Foundation
- Identify and analyze the fundamental human needs addressed
- Map core niche to established market segments
- Evaluate alignment with market research findings

2. Niche Equation Analysis
Demographics:
- Detailed demographic breakdown
- Psychographic profiles
- Behavioral patterns

Problems:
- Primary pain points (from market research)
- Secondary challenges
- Underlying psychological factors

Methodology:
- Solution delivery framework
- Unique approach differentiators
- Implementation strategy

Desired Outcomes:
- Primary customer objectives
- Secondary benefits
- Long-term value proposition

3. Rule of Four Evaluation
- Market Size Analysis (with current data)
- Accessibility Assessment
- Financial Viability Study
- Growth Trajectory Analysis

4. Customer Deep Dive
- Hidden Needs Analysis
- Psychological Barriers
- Unstated Desires
- Common Objections
- Purchase Hesitations

5. Engagement Strategy
- Platform Preference Analysis
- Content Consumption Patterns
- Purchase Decision Journey
- Engagement Metrics
- Platform ROI Analysis

Please incorporate insights from the previous market research, especially regarding [specific insights from last response]. Format your response with clear sections, data visualizations, and actionable insights. Include specific examples and case studies where relevant.`
      }
    ]
  },
  3: {
    title: "Avatar Research",
    prompts: [
      {
        id: 1,
        title: "Comprehensive Avatar Analysis",
        prompt: `Building on our market research and niche development findings, create a comprehensive avatar analysis covering:

1. Core Audience Overview
- Primary demographic identification
- Challenge and goal mapping
- Interest intersection analysis
- Lifestyle and value alignment

2. Knowledge and Understanding Assessment
- Common questions and misconceptions
- Knowledge gaps analysis
- Learning preferences and patterns
- Information consumption habits

3. Detailed Avatar Profiles
Create three distinct ideal customer profiles:
Profile 1: Primary Target
Profile 2: Secondary Target
Profile 3: Aspirational Target

For each profile, detail:
- Background and history
- Professional status
- Personal situation
- Financial capacity
- Decision-making factors
- Goals and aspirations
- Challenges and pain points
- Investment readiness indicators

4. Comprehensive Avatar Matrix
Create a detailed comparison matrix including:
Demographics:
- Age range
- Location
- Gender distribution
- Income levels
- Marital status
- Family situation
- Education level
- Professional status
- Industry/Field

Psychographics:
- Core values
- Lifestyle choices
- Hobbies and interests
- Personal goals
- Professional aspirations
- Learning preferences
- Decision-making style

Behavioral Patterns:
- Purchase behaviors
- Content consumption
- Platform preferences
- Time allocation
- Investment priorities
- Learning style
- Communication preferences

5. Success Indicators and Risk Factors
Success Indicators:
- Ideal characteristics
- Readiness factors
- Success predictors
- Engagement patterns

Risk Factors:
- Red flags
- Potential challenges
- Mitigation strategies
- Support requirements

6. Strategic Avatar Implementation
- Marketing approach per avatar
- Communication strategies
- Content customization
- Engagement tactics
- Support system design
- Success measurement metrics

Please incorporate insights from previous market research and niche development, especially regarding [specific insights from last responses]. Create detailed tables, matrices, and visual representations where appropriate. Provide actionable insights for marketing, sales, and product development decisions.`
      }
    ]
  },
  4: {
    title: "Offer Creation",
    prompts: [
      {
        id: 1,
        title: "Comprehensive Offer Development",
        prompt: `Building on our market research, niche development, and avatar analysis, create a complete offer strategy covering:

1. Core Offer Development
Product/Program Structure:
- Dream outcome definition and roadmap
- 20 potential topics/modules (prioritized)
- 5 key transformation steps
- Core features and benefits
- Implementation timeline
- Success metrics and milestones

2. Program Architecture
Module Development:
- 7 core modules with descriptions
- Learning objectives per module
- Content delivery strategy
- Implementation framework
- Progress tracking mechanisms
- Support systems

3. Value Stack Analysis
Core Components:
- Primary solutions offered
- Group vs. individual delivery options
- Problem-solution mapping
- Value hierarchy analysis
- Delivery methods comparison
- Resource requirements

Market Segment Analysis:
- Pain point intensity ranking
- Purchasing power assessment
- Targeting accessibility
- Market growth potential
- Segment prioritization matrix

4. Pricing Strategy
Pricing Framework:
- Value-based pricing model
- Market position analysis
- Competitor pricing comparison
- Premium positioning strategy
- Payment structure options
- Financial projections

5. Offer Enhancement
Scarcity & Urgency:
- Limited-time strategies
- Exclusive access methods
- Early-bird incentives
- Capacity limitations
- Deadline structures

Bonuses & Guarantees:
- Value-add components
- Risk reversal strategies
- Success guarantees
- Support mechanisms
- Exclusive bonuses

6. Scaling Framework
Growth Strategy:
- Expansion opportunities
- Scaling methodology
- Resource requirements
- Timeline projections
- Success metrics

7. Performance Metrics
Tracking System:
- KPI definition
- Success metrics
- ROI calculations
- Customer satisfaction measures
- Long-term impact assessment

8. Marketing Framework
Messaging Strategy:
- Core value propositions
- Pain point alignment
- Benefit articulation
- Social proof integration
- Call-to-action framework

9. Implementation Plan
Launch Strategy:
- Resource allocation
- Timeline development
- Team requirements
- Quality control measures
- Customer support framework

Please incorporate all previous insights from market research, niche development, and avatar analysis. Create detailed matrices, charts, and frameworks. Focus on practical implementation while maintaining premium positioning. Include specific examples, case studies, and data-driven recommendations.

For each section, provide:
- Detailed analysis
- Implementation strategy
- Resource requirements
- Success metrics
- Risk mitigation
- Timeline projections

Format the response with clear sections, visual elements, and actionable steps. Ensure all recommendations align with identified market opportunities and avatar preferences.`
      }
    ]
  },
  5: {
    title: "Execution & Growth",
    prompts: [
      {
        id: 1,
        title: "Implementation & Scaling Strategy",
        prompt: `Building on all previous analyses (market research, niche development, avatar research, and offer creation), develop a comprehensive execution and growth strategy:

1. Launch Framework
Resource Requirements:
- Technology infrastructure
- Team composition and roles
- Content creation needs
- Marketing assets
- Support systems
- Financial requirements

Implementation Timeline:
- Pre-launch checklist
- Launch sequence
- Post-launch activities
- Key milestones
- Critical deadlines
- Risk mitigation plans

2. Success Metrics Framework
Key Performance Indicators:
- Customer acquisition metrics
- Engagement measurements
- Satisfaction scores
- Revenue targets
- Profitability goals
- Growth indicators

Tracking Systems:
- Data collection methods
- Analysis frameworks
- Reporting structures
- Feedback loops
- Adjustment triggers
- Performance dashboards

3. Scaling Strategy
Growth Opportunities:
- Market expansion plans
- Product line extensions
- Service upgrades
- Geographic expansion
- Vertical integration
- Partnership opportunities

Resource Scaling:
- Team expansion plan
- Technology scaling
- Operations growth
- Support system scaling
- Quality maintenance
- Efficiency optimization

4. Partnership & Systems Development
Strategic Partnerships:
- Potential partners list
- Partnership criteria
- Value exchange framework
- Integration plans
- Risk assessment
- Success metrics

Systems Architecture:
- Operational systems
- Customer management
- Content delivery
- Support infrastructure
- Analytics platform
- Automation opportunities

5. Action Plan
Immediate Steps (30 Days):
- Priority tasks
- Resource allocation
- Team assignments
- Quick wins
- Risk management
- Progress tracking

Medium-Term Goals (90 Days):
- Growth targets
- System improvements
- Team expansion
- Market penetration
- Customer retention
- Revenue optimization

Long-Term Vision (12 Months):
- Market position
- Brand development
- Product evolution
- Team structure
- Financial targets
- Industry leadership

6. Support & Monitoring Framework
Ongoing Support:
- Customer success program
- Training systems
- Communication channels
- Issue resolution
- Feedback collection
- Community building

Success Monitoring:
- Performance metrics
- Quality assurance
- Customer satisfaction
- Team effectiveness
- Financial health
- Market position

Please incorporate all insights from previous steps to create a cohesive execution strategy. Include detailed timelines, specific metrics, and clear action items. Create visual representations of key frameworks and processes.

For each component, provide:
- Detailed implementation steps
- Resource requirements
- Success criteria
- Risk factors
- Contingency plans
- Growth opportunities

Format the response with clear sections, practical examples, and actionable recommendations. Ensure all strategies align with previous market research, niche development, avatar analysis, and offer creation insights.

Focus on creating a sustainable, scalable business model that can adapt to market changes while maintaining quality and customer satisfaction.`
      }
    ]
  },
  // Additional steps can be added here
};

function createSystemPrompt(
  step: number,
  currentPromptId: number,
  context: string
): string {
  const stepData = STEP_PROMPTS[step as keyof typeof STEP_PROMPTS];
  if (!stepData) return "";

  const currentPrompt = stepData.prompts.find((p) => p.id === currentPromptId);
  if (!currentPrompt) return "";

  return `You are a senior business development expert specializing in ${stepData.title}.
Current step: ${currentPrompt.title}
Project Context: ${context}

Follow this specific prompt: ${currentPrompt.prompt}

Response Requirements:
1. Provide an extensive, detailed analysis (minimum 800 words)
2. Structure your response with clear sections:
   - Executive Summary (reference previous findings)
   - Comprehensive Analysis
   - Strategic Insights
   - Implementation Framework
   - Next Steps & Recommendations

Guidelines:
1. Reference and build upon previous market research findings
2. Maintain consistency with earlier identified trends and opportunities
3. Use concrete data and real-world examples
4. Format response with clear headers and subheaders
5. Include visual representations (tables, charts) in markdown
6. Provide actionable, specific recommendations
7. Consider both immediate implementation and long-term strategy
8. Cite current sources and industry benchmarks
9. Maintain professional, strategic tone
10. Focus on practical, implementable solutions

Ensure each section connects with previous market research while developing the niche strategy.
Format all responses with clear titles, subtitles, and proper markdown formatting.`;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  step?: number;
}

// Add response configuration
export const runtime = 'edge'; // Use Edge Runtime
export const maxDuration = 60; // Set maximum duration

export async function POST(req: Request) {
  try {
    const { messages, step, currentPromptId, projectContext } = await req.json();

    if (!STEP_PROMPTS[step as keyof typeof STEP_PROMPTS]) {
      return NextResponse.json(
        { error: 'Invalid step number' },
        { status: 400 }
      );
    }

    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 50000);
    });

    const completionPromise = openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: createSystemPrompt(step, currentPromptId, projectContext)
        },
        ...messages.map((m: ChatMessage) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      ],
      temperature: 0.7,
      max_tokens: 2500, // Limit token length
      stream: false, // Disable streaming for faster response
    });

    // Race between completion and timeout
    const completion = await Promise.race([completionPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;

    // Calculate next prompt ID
    const currentStep = STEP_PROMPTS[step as keyof typeof STEP_PROMPTS];
    const nextPromptId = currentPromptId < currentStep.prompts.length 
      ? currentPromptId + 1 
      : currentPromptId;

    return new NextResponse(
      JSON.stringify({
        message: completion.choices[0].message.content,
        nextPromptId,
        isStepComplete: nextPromptId > currentStep.prompts.length
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Full Service API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
