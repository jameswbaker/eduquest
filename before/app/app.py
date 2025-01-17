from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import json
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/generate-questions', methods=['POST'])
def generate_questions_route():
    content = request.json.get('content', '')
    print(content)
    try:
        # Generate questions
        gpt_response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "Generate 25 multiple choice questions based on the given content. For each question, provide 4 answer choices and indicate which one is correct."},
                {"role": "user", "content": content}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "QuestionResponse", 
                    "schema": {
                        "type": "object",
                        "properties": {
                            "questions": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "question": {
                                            "type": "string",
                                            "description": "The question text"
                                        },
                                        "answers": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "text": {
                                                        "type": "string",
                                                        "description": "The answer text"
                                                    },
                                                    "isCorrect": {
                                                        "type": "boolean",
                                                        "description": "Whether this is the correct answer"
                                                    }
                                                },
                                                "required": ["text", "isCorrect"]
                                            },
                                            "minItems": 4,
                                            "maxItems": 4
                                        }
                                    },
                                    "required": ["question", "answers"]
                                },
                                "minItems": 25,
                                "maxItems": 25
                            }
                        },
                        "required": ["questions"]
                    }
                }
            }
        )

        # Check if we got a valid response
        if not gpt_response or not gpt_response.choices:
            raise Exception("No response received from OpenAI API")
            
        questions = json.loads(gpt_response.choices[0].message.content)
        print(questions)
        print("are we good?")
        return jsonify(questions)

    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        return jsonify({"error": "Invalid response format from OpenAI"}), 500
    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     generate_and_save_game()

if __name__ == '__main__':
    print("what is going on?")
    app.run(debug=True)
