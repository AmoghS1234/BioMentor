import { useState } from 'react';
import { generateJsonContent } from '../lib/ai';

export const useAiGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async (topic, type) => {
    setIsGenerating(true);
    try {
      const result = await generateJsonContent(topic, type);
      return result;
    } catch (error) {
      console.error("Generator Error:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateContent, isGenerating };
};
