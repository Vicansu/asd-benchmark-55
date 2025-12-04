import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedText, imageBase64s } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educational content analyzer. Your task is to extract multiple-choice questions (MCQs) from educational content.

For each question you identify, extract:
1. The question text (including any passage or context it relates to)
2. The 4 answer options (A, B, C, D)
3. The correct answer letter
4. A suggested difficulty level (practice, easy, medium, hard) based on complexity

IMPORTANT RULES:
- Extract ALL questions found in the content
- If there's a reading passage, include it with related questions
- Group questions by their associated passage if applicable
- Each question should be a complete, standalone MCQ
- If tables or complex content exist, describe them clearly
- Mark the correct answer based on answer keys if visible, or mark as "unknown" if not clear

Return a JSON array of questions in this exact format:
{
  "questions": [
    {
      "passage_title": "Title if exists or null",
      "passage_text": "Full passage text if exists or null",
      "question_text": "The question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "A" or "B" or "C" or "D" or "unknown",
      "difficulty": "practice" | "easy" | "medium" | "hard",
      "has_image": false,
      "image_description": "Description if image is part of question"
    }
  ]
}

Only return valid JSON, no other text.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Build user message with text and images
    const userContent: any[] = [
      { type: "text", text: `Please extract all MCQ questions from this educational content:\n\n${extractedText}` }
    ];

    // Add images if provided
    if (imageBase64s && imageBase64s.length > 0) {
      for (const img of imageBase64s.slice(0, 10)) { // Limit to 10 images
        userContent.push({
          type: "image_url",
          image_url: { url: img }
        });
      }
      userContent[0].text += "\n\nI've also included images from the document. Please analyze them for any questions, diagrams, or tables that should be included.";
    }

    messages.push({ role: "user", content: userContent });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let questions = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions || [];
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Try to extract array directly
      try {
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          questions = JSON.parse(arrayMatch[0]);
        }
      } catch {
        console.error("Failed to parse as array too");
      }
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in extract-questions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
