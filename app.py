from flask import Flask, render_template, request, jsonify
import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET', 'default-secret-key')

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/result', methods=['POST'])
def get_result():
    user_input = request.form.get('user_input', '').strip()
    
    if not user_input:
        return render_template('result.html', 
                               craving="No input provided",
                               insight="Please share what you're craving and feeling")
    
    # Prepare Groq API request
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
You are CraveMind - an emotional eating companion. The user shared: "{user_input}"

Respond in this structured JSON format:
{{
    "insight": "A poetic analysis of their emotional state and craving (1 paragraph)",
    "suggestion": "A mindful food suggestion tailored to their emotions (1-2 sentences)",
    "craving_type": "Categorize the craving (emotional/psychological/physical)",
    "recipe_suggestion": "A common, well-known recipe name (e.g., 'Spaghetti Carbonara', 'Chocolate Chip Cookies')"
}}

Respond ONLY with valid JSON, no other text.
"""
    
    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are an emotional craving analyst."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8,
        "response_format": {"type": "json_object"}
    }
    
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        ai_content = response.json()["choices"][0]["message"]["content"]
        data = json.loads(ai_content)
        
        # Parse the JSON response
        craving_data = {
            'craving': user_input,
            'insight': data.get('insight', ''),
            'suggestion': data.get('suggestion', ''),
            'craving_type': data.get('craving_type', 'emotional'),
            'recipe_suggestion': data.get('recipe_suggestion', '')
        }
        
        return render_template('result.html', **craving_data)
        
    except Exception as e:
        print(f"Error: {e}")
        return render_template('result.html', 
                               craving=user_input,
                               insight="Sorry, something went wrong.",
                               suggestion="Please try again later")

@app.route('/get_meal_details')
def get_meal_details():
    meal_name = request.args.get('meal')
    if not meal_name:
        return jsonify({"error": "Meal name required"}), 400
    
    try:
        # First try searching by name
        response = requests.get(f"https://www.themealdb.com/api/json/v1/1/search.php?s={meal_name}")
        data = response.json()
        
        if data.get('meals'):
            meal = data['meals'][0]
        else:
            # If not found, get a random meal
            response = requests.get("https://www.themealdb.com/api/json/v1/1/random.php")
            data = response.json()
            meal = data['meals'][0] if data.get('meals') else None
        
        if not meal:
            return jsonify({"error": "No recipes available"}), 404
            
        # Format ingredients and measurements
        ingredients = []
        for i in range(1, 21):
            ingredient = meal.get(f'strIngredient{i}')
            measure = meal.get(f'strMeasure{i}')
            if ingredient and ingredient.strip():
                ingredients.append(f"{measure} {ingredient}".strip())
        
        return jsonify({
            "name": meal['strMeal'],
            "category": meal['strCategory'],
            "area": meal['strArea'],
            "instructions": meal['strInstructions'],
            "ingredients": ingredients,
            "image": meal['strMealThumb'],
            "youtube": meal['strYoutube']
        })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)



