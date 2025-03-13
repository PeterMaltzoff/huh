import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // First Ollama request: Explain the text
    let explainedText;
    try {
      const explainResponse = await axios.post('http://localhost:11434/api/generate', {
        model: 'gemma3', // Using gemma3 model
        prompt: `Explain this: ${text}`,
        stream: false
      });
      explainedText = explainResponse.data.response;
    } catch (error) {
      console.error('Error with Ollama explain request:', error);
      return NextResponse.json({ 
        error: 'Failed to connect to Ollama service. Make sure Ollama is running.' 
      }, { status: 500 });
    }

    // Second Ollama request: Convert to JSON
    try {
      const jsonResponse = await axios.post('http://localhost:11434/api/generate', {
        model: 'gemma3', // Using gemma3 model
        prompt: `Convert this into JSON: ${explainedText}
        
IMPORTANT: Your response must ONLY contain the JSON object, with no additional text, explanations, or markdown formatting. Do not include backticks, the word 'json', or any other text. Just return a valid, parseable JSON object.`,
        stream: false
      });
      
      const jsonText = jsonResponse.data.response;
      console.log('Raw response from Ollama:', jsonText);
      
      // Extract JSON from the response
      let extractedJson = jsonText;
      
      // Try to find JSON between backticks or triple backticks with json
      const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```|`(\{[\s\S]*?\})`/;
      const match = jsonText.match(jsonRegex);
      
      if (match) {
        // Use the first capturing group that matched
        extractedJson = match[1] || match[2];
        console.log('Extracted JSON from markdown:', extractedJson);
      }
      
      // Try to parse the JSON to ensure it's valid
      let parsedJson;
      try {
        parsedJson = JSON.parse(extractedJson);
        console.log('Successfully parsed JSON:', parsedJson);
        
        return NextResponse.json({ 
          result: parsedJson,
          isValidJson: true
        });
      } catch (jsonError) {
        console.error('Error parsing JSON from Ollama:', jsonError);
        // Return the raw text if it's not valid JSON
        return NextResponse.json({ 
          result: extractedJson,
          isValidJson: false,
          rawResponse: jsonText
        });
      }
    } catch (error) {
      console.error('Error with Ollama JSON conversion request:', error);
      return NextResponse.json({ 
        error: 'Failed to convert to JSON with Ollama service.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 