import axios from 'axios';


//this is used to connect with the llm modal(gemma:2b) and
//  also used to send the prompt and get the respose 
export class AiService {
  async generateMessage(prompt: string): Promise<string> {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'gemma:2b',
      prompt,
      stream: false,
    });
    return response.data.response;
  }
}


