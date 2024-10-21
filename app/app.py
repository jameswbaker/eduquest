from flask import Flask, render_template
from openai import OpenAI
import json

app = Flask(__name__)

# Set your OpenAI API key here
client = OpenAI(api_key="your_api_key_here") 

def read_content_from_file(filename):
    with open(filename, 'r') as file:
        return file.read()

def generate_questions(content):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational expert. Generate a list of 10 questions based on the given content. The questions should gradually increase in difficulty and be designed to maximize learning and test for content retention."},
                {"role": "user", "content": content}
            ]
        )
        questions = response.choices[0].message.content.strip().split('\n')
        print("Generated questions:", questions)  # Debug print
        return questions
    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        return []

def create_game(questions):
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a code generator. Generate only HTML, CSS, and JavaScript code for an interactive educational game about zebras. The game should incorporate the given questions, be visually engaging, and include features like animated characters, point-and-click interactions, mini-games, and a scoring system. Provide complete, ready-to-use code in a single file. Do not include any explanations or comments outside of the code itself."},
                {"role": "user", "content": f"Generate game code using these questions: {json.dumps(questions)}"}
            ],
            max_tokens=4096
        )
        game_code = response.choices[0].message.content.strip()
        
        if len(game_code) >= 4000:  # If the response is close to the token limit
            response2 = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Continue generating the game code from where you left off. Provide only code, no explanations."},
                    {"role": "user", "content": "Continue the game code"}
                ],
                max_tokens=4096
            )
            game_code += response2.choices[0].message.content.strip()
        
        return game_code
    except Exception as e:
        print(f"Error creating game: {str(e)}")
        return ""

def generate_and_save_game():
    content = read_content_from_file('content')
    print("Content read from file (first 100 characters):", content[:100])  # Debug print
    questions = generate_questions(content)
    game_code = create_game(questions)
    
    with open('index.html', 'w') as file:
        file.write(game_code)
    print("Game code saved to index.html")  # Debug print

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    generate_and_save_game()
