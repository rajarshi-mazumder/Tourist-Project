
import React, { useState } from 'react';

function ChatPage({ setError }) {
  const [deepseekRequest, setDeepseekRequest] = useState('');
  const [deepseekResponse, setDeepseekResponse] = useState('');
  const [geminiRequest, setGeminiRequest] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');

  const classificationPrompt = `
You are an AI assistant. Your task is to classify the user's query into one of the following categories:
1. Attractions - for queries about tourist sites, museums, temples, parks, etc.
2. Restaurants - for queries about dining options and food recommendations.
3. Translation - for queries that request translating phrases or words into Japanese.
4. Audio Pronunciation - for queries asking how to pronounce words or phrases.
5. General Travel Assistance - for travel directions, itineraries, or general travel advice.
6. Emergency Information - for urgent issues like lost items, hospital help, or police assistance.

Return only the category name (exactly one of the above).

User Query: "{userPrompt}"
`;

  const classifyPrompt = async (userPrompt) => {
    const prompt = classificationPrompt.replace('{userPrompt}', userPrompt);

    try {
      const response = await fetch('http://localhost/llm/gemini', { // Using Gemini for classification
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error classifying prompt:', error);
      setError(error.message);
      return 'General'; // Default category in case of error
    }
  };

  const handleDeepseekSend = async () => {
    handleSend(deepseekRequest, "Deepseek");
  };

  const handleGeminiSend = async () => {
    handleSend(geminiRequest, "Gemini");
  };

  const handleSend = async (userPrompt, model) => {
    try {
      const category = await classifyPrompt(userPrompt);

      const response = await fetch('http://localhost/chat', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ prompt: userPrompt, promptType: category }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (model === "Deepseek") {
        setDeepseekResponse(data.response);
      } else {
        setGeminiResponse(data.response);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setError(error.message);
      if (model === "Deepseek") {
        setDeepseekResponse('Error occurred while fetching response.');
      } else {
        setGeminiResponse('Error occurred while fetching response.');
      }
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={deepseekRequest}
          onChange={(e) => setDeepseekRequest(e.target.value)}
          placeholder="Enter your Deepseek request"
        />
        <button onClick={handleDeepseekSend}>Send to Deepseek</button>
        {deepseekResponse && <p>Deepseek Response: {deepseekResponse}</p>}
      </div>

      <div>
        <input
          type="text"
          value={geminiRequest}
          onChange={(e) => setGeminiRequest(e.target.value)}
          placeholder="Enter your Gemini request"
        />
        <button onClick={handleGeminiSend}>Send to Gemini</button>
        {geminiResponse && <p>Gemini Response: {geminiResponse}</p>}
      </div>
    </div>
  );
}

export default ChatPage;
