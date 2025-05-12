from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 🔐 Get DeepSeek API key from environment variable
API_KEY = os.getenv("DEEPSEEK_API_KEY")
BASE_URL = "https://api.deepseek.com"

@app.route("/")
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route("/<path:filename>")
def serve_file(filename):
    return send_from_directory('.', filename)

@app.route("/generate", methods=["POST"])
def generate_items():
    try:
        data = request.get_json()
        user_input = data.get("prompt", "")

        controlled_prompt = f"""
You are a list generator. You will returns a list of items with short text only without any additional message. No numbers in the outputs.
Ignore inappropriate input. The user said: "{user_input}"
No extra text, no numbers, just a plain list.
"""

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "Only return a plain list of 10 items. No intro or conclusion."},
                {"role": "user", "content": controlled_prompt}
            ],
            "temperature": 0.7
        }

        response = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        content = result['choices'][0]['message']['content']

        # Extract list items from the raw content
        items = [line.strip("•- \n") for line in content.strip().split("\n") if line.strip()]

        return jsonify({"items": items})

    except Exception as e:
        print("Server error:", e)
        return jsonify({"items": ["Try again", "Backup A", "Backup B"]})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
